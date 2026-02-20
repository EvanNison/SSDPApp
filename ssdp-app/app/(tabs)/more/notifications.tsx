import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/stores/useStore';
import { brand } from '@/constants/Colors';
import type { Notification } from '@/types/database';

const TYPE_CONFIG: Record<string, { icon: React.ComponentProps<typeof FontAwesome>['name']; color: string }> = {
  urgent: { icon: 'exclamation-circle', color: '#EF4444' },
  course: { icon: 'graduation-cap', color: brand.blue },
  event: { icon: 'calendar', color: brand.teal },
  points: { icon: 'star', color: brand.orange },
  system: { icon: 'info-circle', color: brand.gray },
};

export default function NotificationsScreen() {
  const profile = useStore((s) => s.profile);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    if (!profile?.id) return;
    try {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(50);
      if (data) setNotifications(data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [profile?.id]);

  const markAsRead = async (id: string) => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const renderNotification = ({ item }: { item: Notification }) => {
    const config = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.system;
    const timeAgo = getTimeAgo(item.created_at);

    return (
      <Pressable
        className={`bg-white rounded-xl p-4 mx-4 mb-2 flex-row ${!item.is_read ? 'border-l-4' : ''}`}
        style={!item.is_read ? { borderLeftColor: config.color, elevation: 2 } : { elevation: 1 }}
        onPress={() => markAsRead(item.id)}
      >
        <View
          className="w-10 h-10 rounded-full items-center justify-center mr-3"
          style={{ backgroundColor: config.color + '20' }}
        >
          <FontAwesome name={config.icon} size={18} color={config.color} />
        </View>
        <View className="flex-1">
          <Text className={`font-opensans${!item.is_read ? '-bold' : ''} text-ssdp-navy text-sm`}>
            {item.title}
          </Text>
          {item.body && (
            <Text className="font-opensans text-ssdp-gray text-xs mt-1" numberOfLines={2}>
              {item.body}
            </Text>
          )}
          <Text className="font-opensans text-ssdp-gray/50 text-xs mt-2">
            {timeAgo}
          </Text>
        </View>
      </Pressable>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color={brand.blue} />
      </View>
    );
  }

  return (
    <FlatList
      className="flex-1 bg-gray-50"
      data={notifications}
      renderItem={renderNotification}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ paddingVertical: 16 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={brand.blue} />
      }
      ListEmptyComponent={
        <View className="items-center justify-center py-20 px-8">
          <FontAwesome name="bell-slash-o" size={48} color={brand.gray} />
          <Text className="font-montserrat text-ssdp-navy text-lg mt-4 uppercase text-center">
            No Notifications
          </Text>
          <Text className="font-opensans text-ssdp-gray text-center mt-2">
            You're all caught up! Notifications about courses, points, and events will appear here.
          </Text>
        </View>
      }
    />
  );
}

function getTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}
