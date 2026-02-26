import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  RefreshControl,
  Image,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useStore } from '@/stores/useStore';
import { supabase } from '@/lib/supabase';
import { brand } from '@/constants/Colors';
import type { Course, NewsItem, ActionAlert, LobbyEvent } from '@/types/database';

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
      onPress: () => router.push('/(tabs)/more/news'),
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

function ActionAlertCard({ alert }: { alert: ActionAlert }) {
  const router = useRouter();

  return (
    <Pressable
      className="mx-4 bg-red-50 border-2 border-red-200 rounded-2xl p-5 mb-3 active:opacity-90"
      onPress={() => router.push(`/alert/${alert.id}`)}
    >
      <View className="flex-row items-center mb-2">
        <FontAwesome name="bullhorn" size={14} color="#EF4444" />
        <Text className="font-opensans-bold text-red-600 text-xs uppercase ml-2">
          Action Alert
        </Text>
        {alert.bill_number && (
          <View className="bg-red-100 px-2 py-0.5 rounded-full ml-2">
            <Text className="font-opensans-bold text-red-700 text-xs">
              {alert.bill_number}
            </Text>
          </View>
        )}
      </View>
      <Text className="font-montserrat text-ssdp-navy text-base uppercase">
        {alert.title}
      </Text>
      {alert.description && (
        <Text className="font-opensans text-ssdp-gray text-sm mt-1" numberOfLines={2}>
          {alert.description}
        </Text>
      )}
      <View className="flex-row items-center mt-2">
        <FontAwesome name="star" size={12} color={brand.orange} />
        <Text className="font-opensans text-ssdp-orange text-xs ml-1">
          +{alert.points_reward} pts
        </Text>
        <Text className="font-opensans-bold text-ssdp-blue text-xs ml-auto">
          Take Action →
        </Text>
      </View>
    </Pressable>
  );
}

function LobbyDayCard({ event }: { event: LobbyEvent }) {
  const router = useRouter();

  const formattedDate = event.event_date
    ? new Date(event.event_date + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <Pressable
      className="mx-4 bg-ssdp-teal rounded-2xl p-6 mb-4 active:opacity-90"
      onPress={() => router.push(`/lobby/${event.id}`)}
    >
      <View className="flex-row items-center mb-2">
        <FontAwesome name="university" size={14} color="#FFFFFF" />
        <Text className="font-opensans-bold text-white text-xs uppercase ml-2">
          Lobby Day
        </Text>
      </View>
      <Text className="font-montserrat text-white text-lg uppercase">
        {event.title}
      </Text>
      <View className="flex-row items-center mt-2 gap-4">
        {formattedDate && (
          <View className="flex-row items-center">
            <FontAwesome name="calendar" size={12} color={brand.navy} />
            <Text className="font-opensans text-ssdp-navy text-xs ml-1">
              {formattedDate}
            </Text>
          </View>
        )}
        {event.location && (
          <View className="flex-row items-center">
            <FontAwesome name="map-marker" size={12} color={brand.navy} />
            <Text className="font-opensans text-ssdp-navy text-xs ml-1">
              {event.location}
            </Text>
          </View>
        )}
      </View>
      <Text className="font-opensans-bold text-white text-xs mt-3">
        View Schedule & Talking Points →
      </Text>
    </Pressable>
  );
}

function HeroBanner() {
  return (
    <View className="mx-4 mb-4 rounded-2xl overflow-hidden" style={{ elevation: 2 }}>
      <Image
        source={require('@/assets/images/ssdp-event.png')}
        style={{ width: '100%', height: 176 }}
        resizeMode="cover"
      />
      <View
        className="absolute bottom-0 left-0 right-0 px-4 py-3"
        style={{ backgroundColor: 'rgba(0, 50, 73, 0.60)' }}
      >
        <Text className="font-montserrat text-white text-sm uppercase">
          Join the Movement
        </Text>
        <Text className="font-opensans text-gray-200 text-xs mt-1">
          Connect with advocates across the country
        </Text>
      </View>
    </View>
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

  const handlePress = () => {
    if (item.external_url) {
      Linking.openURL(item.external_url);
    }
  };

  return (
    <Pressable
      className="bg-white rounded-xl p-4 mr-3 active:opacity-90"
      style={{ width: 260, elevation: 2 }}
      onPress={handlePress}
    >
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
    </Pressable>
  );
}

export default function HomeScreen() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [alerts, setAlerts] = useState<ActionAlert[]>([]);
  const [lobbyEvent, setLobbyEvent] = useState<LobbyEvent | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [coursesRes, newsRes, alertsRes, lobbyRes] = await Promise.all([
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
        supabase
          .from('action_alerts')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(3),
        supabase
          .from('lobby_events')
          .select('*')
          .eq('is_active', true)
          .limit(1)
          .maybeSingle(),
      ]);

      if (coursesRes.data) setCourses(coursesRes.data);
      if (newsRes.data) setNews(newsRes.data);
      if (alertsRes.data) setAlerts(alertsRes.data);
      if (lobbyRes.data) setLobbyEvent(lobbyRes.data);
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
      <View className="pt-4 pb-8 max-w-lg w-full self-center">
        <HeroBanner />
        <GreetingCard />
        <QuickActions />

        {/* Action Alerts */}
        {alerts.length > 0 && (
          <View className="mb-2">
            {alerts.map((alert) => (
              <ActionAlertCard key={alert.id} alert={alert} />
            ))}
          </View>
        )}

        {/* Lobby Day */}
        {lobbyEvent && <LobbyDayCard event={lobbyEvent} />}

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
