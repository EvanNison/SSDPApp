import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useStore } from '@/stores/useStore';
import { supabase } from '@/lib/supabase';
import { brand } from '@/constants/Colors';
import type { Course, NewsItem } from '@/types/database';

function GreetingCard() {
  const profile = useStore((s) => s.profile);
  const isGuest = useStore((s) => s.isGuest);

  const firstName = profile?.full_name?.split(' ')[0] || 'there';
  const greeting = isGuest ? 'Welcome to SSDP!' : `Welcome back, ${firstName}!`;

  return (
    <View className="bg-ssdp-navy mx-4 rounded-2xl p-6 mb-4">
      <Text className="font-montserrat text-white text-xl uppercase">
        {greeting}
      </Text>
      {isGuest ? (
        <Text className="font-opensans text-ssdp-teal mt-2 text-sm">
          Join SSDP to unlock courses, earn points, and connect with advocates.
        </Text>
      ) : (
        <View className="flex-row mt-3 gap-6">
          <View className="items-center">
            <Text className="font-montserrat text-ssdp-chartreuse text-2xl">
              {profile?.points ?? 0}
            </Text>
            <Text className="font-opensans text-gray-300 text-xs mt-1">POINTS</Text>
          </View>
          <View className="items-center">
            <Text className="font-montserrat text-ssdp-orange text-sm uppercase">
              {profile?.role?.replace('_', ' ') ?? 'Member'}
            </Text>
            <Text className="font-opensans text-gray-300 text-xs mt-1">ROLE</Text>
          </View>
        </View>
      )}
    </View>
  );
}

function QuickActions() {
  const router = useRouter();

  const actions = [
    {
      icon: 'graduation-cap' as const,
      label: 'Courses',
      color: brand.blue,
      onPress: () => router.push('/(tabs)/academy'),
    },
    {
      icon: 'newspaper-o' as const,
      label: 'News',
      color: brand.teal,
      onPress: () => router.push('/(tabs)/more'),
    },
    {
      icon: 'shopping-bag' as const,
      label: 'Shop',
      color: brand.orange,
      onPress: () => router.push('/(tabs)/shop'),
    },
    {
      icon: 'users' as const,
      label: 'Chat',
      color: brand.chartreuse,
      onPress: () => router.push('/(tabs)/chat'),
    },
  ];

  return (
    <View className="mx-4 mb-6">
      <Text className="font-montserrat text-ssdp-navy text-sm uppercase mb-3">
        Quick Actions
      </Text>
      <View className="flex-row gap-3">
        {actions.map((action) => (
          <Pressable
            key={action.label}
            className="flex-1 bg-white rounded-xl p-4 items-center active:opacity-80"
            style={{ elevation: 2 }}
            onPress={action.onPress}
          >
            <View
              className="w-12 h-12 rounded-full items-center justify-center mb-2"
              style={{ backgroundColor: action.color + '20' }}
            >
              <FontAwesome name={action.icon} size={20} color={action.color} />
            </View>
            <Text className="font-opensans-semibold text-ssdp-navy text-xs">
              {action.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function FeaturedCourse({ course }: { course: Course }) {
  const router = useRouter();

  return (
    <Pressable
      className="mx-4 bg-ssdp-blue rounded-2xl p-6 mb-4 active:opacity-90"
      onPress={() => router.push(`/(tabs)/academy/${course.id}`)}
    >
      <Text className="font-opensans text-ssdp-teal text-xs uppercase mb-1">
        Featured Course
      </Text>
      <Text className="font-montserrat text-white text-lg uppercase">
        {course.title}
      </Text>
      <Text className="font-opensans text-gray-200 text-sm mt-2" numberOfLines={2}>
        {course.description}
      </Text>
      <View className="flex-row items-center mt-3">
        <FontAwesome name="clock-o" size={14} color={brand.chartreuse} />
        <Text className="font-opensans text-ssdp-chartreuse text-xs ml-2">
          {course.duration_minutes} min · {course.module_count} modules
        </Text>
      </View>
    </Pressable>
  );
}

function NewsCard({ item }: { item: NewsItem }) {
  const tagColors: Record<string, string> = {
    event: brand.teal,
    urgent: '#EF4444',
    policy: brand.blue,
    win: brand.chartreuse,
    course: brand.orange,
  };

  return (
    <View className="bg-white rounded-xl p-4 mr-3" style={{ width: 260, elevation: 2 }}>
      {item.tag && (
        <View
          className="self-start px-2 py-1 rounded-full mb-2"
          style={{ backgroundColor: (tagColors[item.tag] ?? brand.gray) + '20' }}
        >
          <Text
            className="font-opensans-semibold text-xs uppercase"
            style={{ color: tagColors[item.tag] ?? brand.gray }}
          >
            {item.tag}
          </Text>
        </View>
      )}
      <Text className="font-opensans-bold text-ssdp-navy text-sm" numberOfLines={2}>
        {item.title}
      </Text>
      {item.excerpt && (
        <Text className="font-opensans text-ssdp-gray text-xs mt-1" numberOfLines={2}>
          {item.excerpt}
        </Text>
      )}
    </View>
  );
}

export default function HomeScreen() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [coursesRes, newsRes] = await Promise.all([
        supabase
          .from('courses')
          .select('*')
          .eq('is_published', true)
          .order('sort_order')
          .limit(3),
        supabase
          .from('news')
          .select('*')
          .eq('is_published', true)
          .order('published_at', { ascending: false })
          .limit(5),
      ]);

      if (coursesRes.data) setCourses(coursesRes.data);
      if (newsRes.data) setNews(newsRes.data);
    } catch (error) {
      console.error('Failed to fetch home data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={brand.blue} />
      }
    >
      <View className="pt-4 pb-8">
        <GreetingCard />
        <QuickActions />

        {courses[0] && <FeaturedCourse course={courses[0]} />}

        {news.length > 0 && (
          <View className="mb-4">
            <Text className="font-montserrat text-ssdp-navy text-sm uppercase mx-4 mb-3">
              Latest News
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16 }}
            >
              {news.map((item) => (
                <NewsCard key={item.id} item={item} />
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
