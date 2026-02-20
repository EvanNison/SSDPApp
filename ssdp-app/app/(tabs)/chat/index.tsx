import { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/stores/useStore';
import { brand } from '@/constants/Colors';
import { hasMinRole, type UserRole } from '@/constants/config';
import type { ChatChannel } from '@/types/database';

export default function ChatListScreen() {
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const profile = useStore((s) => s.profile);
  const isGuest = useStore((s) => s.isGuest);
  const userRole = (profile?.role ?? (isGuest ? 'guest' : 'registered')) as UserRole;

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const { data } = await supabase
          .from('chat_channels')
          .select('*')
          .order('sort_order');
        if (data) setChannels(data);
      } catch (error) {
        console.error('Failed to fetch channels:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchChannels();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color={brand.blue} />
      </View>
    );
  }

  if (channels.length === 0) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center px-8">
        <FontAwesome name="comments-o" size={48} color={brand.gray} />
        <Text className="font-montserrat text-ssdp-navy text-lg mt-4 uppercase text-center">
          Chat Coming Soon
        </Text>
        <Text className="font-opensans text-ssdp-gray text-center mt-2">
          Connect with fellow SSDP members, share ideas, and coordinate campaigns.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4 pb-8">
        {channels.map((channel) => {
          const locked = !hasMinRole(userRole, channel.required_role as UserRole);

          return (
            <Pressable
              key={channel.id}
              className={`bg-white rounded-xl p-4 mb-3 flex-row items-center active:opacity-90 ${locked ? 'opacity-50' : ''}`}
              style={{ elevation: 1 }}
              onPress={() => {
                if (!locked) router.push(`/(tabs)/chat/${channel.id}`);
              }}
              disabled={locked}
            >
              <View className="w-12 h-12 rounded-full bg-ssdp-blue/10 items-center justify-center mr-4">
                <FontAwesome
                  name={channel.is_chapter_channel ? 'university' : 'comments'}
                  size={20}
                  color={brand.blue}
                />
              </View>
              <View className="flex-1">
                <Text className="font-opensans-bold text-ssdp-navy text-base">
                  {channel.name}
                </Text>
                {channel.description && (
                  <Text className="font-opensans text-ssdp-gray text-xs mt-1" numberOfLines={1}>
                    {channel.description}
                  </Text>
                )}
              </View>
              {locked ? (
                <FontAwesome name="lock" size={16} color={brand.gray} />
              ) : (
                <FontAwesome name="chevron-right" size={14} color={brand.gray} />
              )}
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}
