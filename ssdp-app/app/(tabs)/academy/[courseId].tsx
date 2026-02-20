import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/stores/useStore';
import { awardPoints } from '@/lib/points';
import { brand } from '@/constants/Colors';
import type { Course, Module, Quiz, UserProgress } from '@/types/database';

type ViewMode = 'overview' | 'module' | 'quiz';

export default function CourseDetailScreen() {
  const { courseId } = useLocalSearchParams<{ courseId: string }>();
  const router = useRouter();
  const profile = useStore((s) => s.profile);
  const fetchProfile = useStore((s) => s.fetchProfile);

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);

  // Module viewer state
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);

  // Quiz state
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const completedModuleIds = (progress?.completed_modules as string[]) ?? [];

  const fetchCourseData = useCallback(async () => {
    if (!courseId) return;
    try {
      const [courseRes, modulesRes] = await Promise.all([
        supabase.from('courses').select('*').eq('id', courseId).single(),
        supabase.from('modules').select('*').eq('course_id', courseId).order('sort_order'),
      ]);

      if (courseRes.data) setCourse(courseRes.data);
      if (modulesRes.data) setModules(modulesRes.data);

      if (profile?.id) {
        const { data: prog } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', profile.id)
          .eq('course_id', courseId)
          .maybeSingle();

        setProgress(prog);
      }
    } catch (error) {
      console.error('Failed to fetch course:', error);
    } finally {
      setLoading(false);
    }
  }, [courseId, profile?.id]);

  useEffect(() => {
    fetchCourseData();
  }, [fetchCourseData]);

  const startModule = async (index: number) => {
    setActiveModuleIndex(index);
    setViewMode('module');
    setActiveQuiz(null);
    setSelectedAnswer(null);
    setQuizSubmitted(false);

    // Fetch quiz for this module
    const mod = modules[index];
    if (mod) {
      const { data } = await supabase
        .from('quizzes')
        .select('*')
        .eq('module_id', mod.id)
        .limit(1)
        .maybeSingle();
      setActiveQuiz(data);
    }
  };

  const completeModule = async () => {
    const mod = modules[activeModuleIndex];
    if (!mod || !profile?.id || !courseId) return;

    // If there's a quiz, go to quiz first
    if (activeQuiz && !quizSubmitted) {
      setViewMode('quiz');
      return;
    }

    const alreadyCompleted = completedModuleIds.includes(mod.id);

    if (!alreadyCompleted) {
      const newCompleted = [...completedModuleIds, mod.id];
      const allDone = newCompleted.length >= modules.length;

      // Upsert progress
      if (progress) {
        await supabase
          .from('user_progress')
          .update({
            completed_modules: newCompleted,
            current_module: activeModuleIndex + 2,
            completed_at: allDone ? new Date().toISOString() : null,
          })
          .eq('id', progress.id);
      } else {
        await supabase.from('user_progress').insert({
          user_id: profile.id,
          course_id: courseId,
          completed_modules: newCompleted,
          current_module: activeModuleIndex + 2,
          completed_at: allDone ? new Date().toISOString() : null,
        });
      }

      // Award points for module completion
      await awardPoints(profile.id, mod.points_reward, `Completed module: ${mod.title}`, 'module', mod.id);

      // If course complete, award bonus
      if (allDone && course) {
        await awardPoints(profile.id, course.points_bonus, `Completed course: ${course.title}`, 'course', courseId);

        // Check if this is the ambassador course
        if (course.track === 'internal_onboarding' && course.title.toLowerCase().includes('ambassador')) {
          Alert.alert(
            'Course Complete!',
            'You\'ve completed the Ambassador training. Ready to sign the Ambassador Agreement?',
            [
              { text: 'Later', style: 'cancel' },
              { text: 'Sign Now', onPress: () => router.push('/ambassador-agreement') },
            ]
          );
        } else {
          Alert.alert('Congratulations!', `You completed "${course.title}" and earned ${course.points_bonus} bonus points!`);
        }

        await fetchProfile();
      }

      await fetchCourseData();
    }

    // Navigate to next module or back to overview
    if (activeModuleIndex < modules.length - 1) {
      startModule(activeModuleIndex + 1);
    } else {
      setViewMode('overview');
    }
  };

  const handleQuizSubmit = async () => {
    if (selectedAnswer === null || !activeQuiz || !profile?.id) return;

    setQuizSubmitted(true);

    if (selectedAnswer === activeQuiz.correct_index) {
      await awardPoints(
        profile.id,
        activeQuiz.points_reward,
        `Quiz correct: ${activeQuiz.question.substring(0, 50)}`,
        'quiz',
        activeQuiz.id
      );
    }
  };

  const handleQuizContinue = () => {
    setViewMode('module');
    completeModule();
  };

  if (loading || !course) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color={brand.blue} />
      </View>
    );
  }

  // ====== QUIZ VIEW ======
  if (viewMode === 'quiz' && activeQuiz) {
    const isCorrect = selectedAnswer === activeQuiz.correct_index;

    return (
      <>
        <Stack.Screen options={{ title: 'Quiz' }} />
        <ScrollView className="flex-1 bg-gray-50">
          <View className="p-6">
            <Text className="font-montserrat text-ssdp-navy text-lg uppercase mb-6">
              Quiz
            </Text>

            <Text className="font-opensans-bold text-ssdp-navy text-base mb-6">
              {activeQuiz.question}
            </Text>

            {(activeQuiz.options as string[]).map((option, idx) => {
              let bgClass = 'bg-white border-gray-200';
              if (quizSubmitted) {
                if (idx === activeQuiz.correct_index) bgClass = 'bg-green-50 border-green-500';
                else if (idx === selectedAnswer && !isCorrect) bgClass = 'bg-red-50 border-red-500';
              } else if (idx === selectedAnswer) {
                bgClass = 'bg-ssdp-blue/10 border-ssdp-blue';
              }

              return (
                <Pressable
                  key={idx}
                  className={`border-2 rounded-xl p-4 mb-3 ${bgClass}`}
                  onPress={() => {
                    if (!quizSubmitted) setSelectedAnswer(idx);
                  }}
                  disabled={quizSubmitted}
                >
                  <View className="flex-row items-center">
                    <View className="w-8 h-8 rounded-full border-2 border-gray-300 items-center justify-center mr-3">
                      <Text className="font-opensans-bold text-ssdp-navy text-sm">
                        {String.fromCharCode(65 + idx)}
                      </Text>
                    </View>
                    <Text className="font-opensans text-ssdp-navy text-sm flex-1">
                      {option}
                    </Text>
                    {quizSubmitted && idx === activeQuiz.correct_index && (
                      <FontAwesome name="check-circle" size={20} color="#22C55E" />
                    )}
                    {quizSubmitted && idx === selectedAnswer && !isCorrect && (
                      <FontAwesome name="times-circle" size={20} color="#EF4444" />
                    )}
                  </View>
                </Pressable>
              );
            })}

            {/* Explanation after submit */}
            {quizSubmitted && activeQuiz.explanation && (
              <View className="bg-ssdp-navy/5 rounded-xl p-4 mt-4 mb-4">
                <Text className="font-opensans-bold text-ssdp-navy text-sm mb-1">
                  {isCorrect ? 'Correct!' : 'Not quite.'}
                  {isCorrect && ` +${activeQuiz.points_reward} points`}
                </Text>
                <Text className="font-opensans text-ssdp-gray text-sm">
                  {activeQuiz.explanation}
                </Text>
              </View>
            )}

            {/* Action button */}
            {!quizSubmitted ? (
              <Pressable
                className={`py-4 rounded-xl items-center mt-4 ${selectedAnswer !== null ? 'bg-ssdp-orange active:opacity-80' : 'bg-gray-300'}`}
                onPress={handleQuizSubmit}
                disabled={selectedAnswer === null}
              >
                <Text className="font-montserrat text-ssdp-navy text-base uppercase">
                  Submit Answer
                </Text>
              </Pressable>
            ) : (
              <Pressable
                className="bg-ssdp-blue py-4 rounded-xl items-center mt-4 active:opacity-80"
                onPress={handleQuizContinue}
              >
                <Text className="font-montserrat text-white text-base uppercase">
                  Continue
                </Text>
              </Pressable>
            )}
          </View>
        </ScrollView>
      </>
    );
  }

  // ====== MODULE VIEWER ======
  if (viewMode === 'module') {
    const mod = modules[activeModuleIndex];
    if (!mod) {
      setViewMode('overview');
      return null;
    }

    return (
      <>
        <Stack.Screen options={{ title: mod.title }} />
        <ScrollView className="flex-1 bg-white">
          <View className="p-6">
            {/* Module header */}
            <View className="flex-row items-center mb-2">
              <Text className="font-opensans text-ssdp-teal text-xs uppercase">
                Module {activeModuleIndex + 1} of {modules.length}
              </Text>
            </View>
            <Text className="font-montserrat text-ssdp-navy text-xl uppercase mb-6">
              {mod.title}
            </Text>

            {/* Content */}
            {mod.content_markdown ? (
              <Text className="font-opensans text-ssdp-navy text-base leading-7 mb-8">
                {mod.content_markdown}
              </Text>
            ) : (
              <View className="bg-gray-50 rounded-xl p-6 items-center mb-8">
                <FontAwesome name="file-text-o" size={32} color={brand.gray} />
                <Text className="font-opensans text-ssdp-gray mt-2">
                  Content coming soon
                </Text>
              </View>
            )}

            {/* Navigation */}
            <View className="flex-row gap-3">
              {activeModuleIndex > 0 && (
                <Pressable
                  className="flex-1 border-2 border-ssdp-navy py-3 rounded-xl items-center active:opacity-80"
                  onPress={() => startModule(activeModuleIndex - 1)}
                >
                  <Text className="font-montserrat text-ssdp-navy text-sm uppercase">
                    Previous
                  </Text>
                </Pressable>
              )}
              <Pressable
                className="flex-1 bg-ssdp-orange py-3 rounded-xl items-center active:opacity-80"
                onPress={completeModule}
              >
                <Text className="font-montserrat text-ssdp-navy text-sm uppercase">
                  {activeQuiz && !quizSubmitted
                    ? 'Take Quiz'
                    : activeModuleIndex < modules.length - 1
                      ? 'Complete & Next'
                      : 'Complete Course'}
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </>
    );
  }

  // ====== COURSE OVERVIEW ======
  const isComplete = progress?.completed_at != null;

  return (
    <>
      <Stack.Screen options={{ title: course.title }} />
      <ScrollView className="flex-1 bg-gray-50">
        {/* Course hero */}
        <View className="bg-ssdp-navy p-6 pb-8">
          <Text className="font-montserrat text-white text-2xl uppercase">
            {course.title}
          </Text>
          {course.description && (
            <Text className="font-opensans text-gray-300 text-sm mt-2">
              {course.description}
            </Text>
          )}
          <View className="flex-row mt-4 gap-4">
            {course.duration_minutes != null && (
              <View className="flex-row items-center">
                <FontAwesome name="clock-o" size={14} color={brand.teal} />
                <Text className="font-opensans text-ssdp-teal text-xs ml-1">
                  {course.duration_minutes} min
                </Text>
              </View>
            )}
            <View className="flex-row items-center">
              <FontAwesome name="book" size={14} color={brand.teal} />
              <Text className="font-opensans text-ssdp-teal text-xs ml-1">
                {modules.length} modules
              </Text>
            </View>
            <View className="flex-row items-center">
              <FontAwesome name="star" size={14} color={brand.orange} />
              <Text className="font-opensans text-ssdp-orange text-xs ml-1">
                +{course.points_bonus} pts
              </Text>
            </View>
          </View>
          {isComplete && (
            <View className="flex-row items-center mt-4 bg-ssdp-teal/20 rounded-lg px-3 py-2">
              <FontAwesome name="check-circle" size={16} color={brand.teal} />
              <Text className="font-opensans-bold text-ssdp-teal text-sm ml-2">
                Completed
              </Text>
            </View>
          )}
        </View>

        {/* Module list */}
        <View className="p-4">
          <Text className="font-montserrat text-ssdp-navy text-sm uppercase mb-3">
            Modules
          </Text>
          {modules.map((mod, idx) => {
            const done = completedModuleIds.includes(mod.id);
            return (
              <Pressable
                key={mod.id}
                className="bg-white rounded-xl p-4 mb-3 flex-row items-center active:opacity-90"
                style={{ elevation: 1 }}
                onPress={() => startModule(idx)}
              >
                <View
                  className={`w-10 h-10 rounded-full items-center justify-center mr-4 ${done ? 'bg-ssdp-teal' : 'bg-gray-100'}`}
                >
                  {done ? (
                    <FontAwesome name="check" size={16} color="#FFFFFF" />
                  ) : (
                    <Text className="font-montserrat text-ssdp-navy text-sm">
                      {idx + 1}
                    </Text>
                  )}
                </View>
                <View className="flex-1">
                  <Text className="font-opensans-semibold text-ssdp-navy text-sm">
                    {mod.title}
                  </Text>
                  <Text className="font-opensans text-ssdp-gray text-xs mt-1">
                    +{mod.points_reward} pts
                  </Text>
                </View>
                <FontAwesome name="chevron-right" size={14} color={brand.gray} />
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </>
  );
}
