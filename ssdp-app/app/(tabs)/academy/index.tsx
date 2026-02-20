import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/stores/useStore';
import { brand } from '@/constants/Colors';
import { hasMinRole, type UserRole } from '@/constants/config';
import type { Course, UserProgress } from '@/types/database';

function CourseCard({
  course,
  progress,
  locked,
}: {
  course: Course;
  progress?: UserProgress;
  locked: boolean;
}) {
  const router = useRouter();

  const completedCount = progress?.completed_modules
    ? (progress.completed_modules as string[]).length
    : 0;
  const isComplete = progress?.completed_at != null;
  const progressPct =
    course.module_count > 0 ? Math.round((completedCount / course.module_count) * 100) : 0;

  return (
    <Pressable
      className={`bg-white rounded-2xl p-5 mb-3 mx-4 active:opacity-90 ${locked ? 'opacity-50' : ''}`}
      style={{ elevation: 2 }}
      onPress={() => {
        if (!locked) router.push(`/(tabs)/academy/${course.id}`);
      }}
      disabled={locked}
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1 mr-3">
          {course.partner_name && (
            <Text className="font-opensans text-ssdp-teal text-xs uppercase mb-1">
              {course.partner_name}
            </Text>
          )}
          <Text className="font-montserrat text-ssdp-navy text-base uppercase">
            {course.title}
          </Text>
          {course.description && (
            <Text className="font-opensans text-ssdp-gray text-sm mt-1" numberOfLines={2}>
              {course.description}
            </Text>
          )}
        </View>
        {locked ? (
          <FontAwesome name="lock" size={20} color={brand.gray} />
        ) : isComplete ? (
          <View className="bg-ssdp-teal w-8 h-8 rounded-full items-center justify-center">
            <FontAwesome name="check" size={16} color="#FFFFFF" />
          </View>
        ) : null}
      </View>

      {/* Progress bar */}
      <View className="flex-row items-center mt-3">
        <View className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden mr-3">
          <View
            className="h-full rounded-full"
            style={{
              width: `${progressPct}%`,
              backgroundColor: isComplete ? brand.teal : brand.orange,
            }}
          />
        </View>
        <Text className="font-opensans text-ssdp-gray text-xs">
          {completedCount}/{course.module_count}
        </Text>
      </View>

      {/* Meta */}
      <View className="flex-row items-center mt-2 gap-4">
        {course.duration_minutes != null && (
          <View className="flex-row items-center">
            <FontAwesome name="clock-o" size={12} color={brand.gray} />
            <Text className="font-opensans text-ssdp-gray text-xs ml-1">
              {course.duration_minutes} min
            </Text>
          </View>
        )}
        <View className="flex-row items-center">
          <FontAwesome name="star" size={12} color={brand.orange} />
          <Text className="font-opensans text-ssdp-gray text-xs ml-1">
            +{course.points_bonus} pts
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function AcademyScreen() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [progress, setProgress] = useState<Record<string, UserProgress>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const profile = useStore((s) => s.profile);
  const isGuest = useStore((s) => s.isGuest);
  const userRole = (profile?.role ?? (isGuest ? 'guest' : 'registered')) as UserRole;

  const fetchCourses = async () => {
    try {
      const { data: coursesData } = await supabase
        .from('courses')
        .select('*')
        .eq('is_published', true)
        .order('sort_order');

      if (coursesData) setCourses(coursesData);

      // Fetch user progress if logged in
      if (profile?.id) {
        const { data: progressData } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', profile.id);

        if (progressData) {
          const map: Record<string, UserProgress> = {};
          progressData.forEach((p) => {
            map[p.course_id] = p;
          });
          setProgress(map);
        }
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [profile?.id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCourses();
    setRefreshing(false);
  };

  // Group courses by track
  const drugEd = courses.filter((c) => c.track === 'drug_education');
  const onboarding = courses.filter((c) => c.track === 'internal_onboarding');

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color={brand.blue} />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={brand.blue} />
      }
    >
      <View className="pt-4 pb-8">
        {/* Drug Education Track */}
        {drugEd.length > 0 && (
          <View className="mb-6">
            <View className="flex-row items-center mx-4 mb-3">
              <View className="w-3 h-3 rounded-full bg-ssdp-blue mr-2" />
              <Text className="font-montserrat text-ssdp-navy text-sm uppercase">
                Drug Education
              </Text>
            </View>
            {drugEd.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                progress={progress[course.id]}
                locked={!hasMinRole(userRole, course.required_role as UserRole)}
              />
            ))}
          </View>
        )}

        {/* Internal Onboarding Track */}
        {onboarding.length > 0 && (
          <View className="mb-6">
            <View className="flex-row items-center mx-4 mb-3">
              <View className="w-3 h-3 rounded-full bg-ssdp-orange mr-2" />
              <Text className="font-montserrat text-ssdp-navy text-sm uppercase">
                SSDP Onboarding
              </Text>
            </View>
            {onboarding.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                progress={progress[course.id]}
                locked={!hasMinRole(userRole, course.required_role as UserRole)}
              />
            ))}
          </View>
        )}

        {/* Empty state */}
        {courses.length === 0 && (
          <View className="items-center justify-center py-20 px-8">
            <FontAwesome name="graduation-cap" size={48} color={brand.gray} />
            <Text className="font-montserrat text-ssdp-navy text-lg mt-4 uppercase text-center">
              No Courses Yet
            </Text>
            <Text className="font-opensans text-ssdp-gray text-center mt-2">
              Courses are being prepared. Check back soon!
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
