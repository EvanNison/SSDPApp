import { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, Linking, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useStore } from '@/stores/useStore';
import { supabase } from '@/lib/supabase';
import { signOut } from '@/lib/auth';
import { brand } from '@/constants/Colors';
import { hasMinRole, type UserRole } from '@/constants/config';
import type { MenuItem, Notification } from '@/types/database';

function ProfileCard() {
  const router = useRouter();
  const profile = useStore((s) => s.profile);
  const isGuest = useStore((s) => s.isGuest);

  if (isGuest) {
    return (
      <Pressable
        className="bg-ssdp-navy rounded-2xl p-6 mx-4 mb-6 active:opacity-90"
        onPress={() => router.replace('/(auth)/welcome')}
      >
        <Text className="font-montserrat text-white text-lg uppercase">
          Join SSDP
        </Text>
        <Text className="font-opensans text-gray-300 text-sm mt-1">
          Create an account to unlock all features.
        </Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      className="bg-ssdp-navy rounded-2xl p-6 mx-4 mb-6 active:opacity-90"
      onPress={() => router.push('/(tabs)/more/profile')}
    >
      <View className="flex-row items-center">
        {profile?.avatar_url ? (
          <Image
            source={{ uri: profile.avatar_url }}
            className="w-14 h-14 rounded-full mr-4"
            resizeMode="cover"
          />
        ) : (
          <View className="w-14 h-14 rounded-full bg-ssdp-blue items-center justify-center mr-4">
            <Text className="font-montserrat text-white text-xl">
              {profile?.full_name?.[0]?.toUpperCase() ?? '?'}
            </Text>
          </View>
        )}
        <View className="flex-1">
          <Text className="font-opensans-bold text-white text-base">
            {profile?.full_name ?? 'SSDP Member'}
          </Text>
          <Text className="font-opensans text-ssdp-teal text-xs uppercase mt-1">
            {profile?.role?.replace('_', ' ') ?? 'Member'}
          </Text>
        </View>
        <View className="items-center">
          <Text className="font-montserrat text-ssdp-chartreuse text-xl">
            {profile?.points ?? 0}
          </Text>
          <Text className="font-opensans text-gray-400 text-xs">pts</Text>
        </View>
      </View>
    </Pressable>
  );
}

const BUILT_IN_ITEMS: Array<{
  section: string;
  items: Array<{
    label: string;
    icon: React.ComponentProps<typeof FontAwesome>['name'];
    route?: string;
    action?: () => void;
    color?: string;
  }>;
}> = [];

export default function MoreScreen() {
  const router = useRouter();
  const profile = useStore((s) => s.profile);
  const isGuest = useStore((s) => s.isGuest);
  const reset = useStore((s) => s.reset);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const userRole = (profile?.role ?? (isGuest ? 'guest' : 'registered')) as UserRole;

  useEffect(() => {
    // Fetch dynamic menu items
    supabase
      .from('menu_items')
      .select('*')
      .eq('is_visible', true)
      .order('section')
      .order('sort_order')
      .then(({ data }) => {
        if (data) setMenuItems(data);
      });

    // Fetch unread notification count
    if (profile?.id) {
      supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', profile.id)
        .eq('is_read', false)
        .then(({ count }) => {
          setUnreadCount(count ?? 0);
        });
    }
  }, [profile?.id]);

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          reset();
        },
      },
    ]);
  };

  const handleMenuPress = (item: MenuItem) => {
    // Intercept Privacy Policy to use in-app screen
    if (item.label === 'Privacy Policy') {
      router.push('/(tabs)/more/privacy');
      return;
    }
    if (item.link_type === 'screen' && item.link_value) {
      router.push(item.link_value as any);
    } else if (item.link_type === 'external' && item.link_value) {
      Linking.openURL(item.link_value);
    } else if (item.link_type === 'webview' && item.link_value) {
      Linking.openURL(item.link_value);
    }
  };

  // Group dynamic menu items by section
  const groupedMenuItems = menuItems.reduce<Record<string, MenuItem[]>>((acc, item) => {
    if (!hasMinRole(userRole, item.required_role as UserRole)) return acc;
    const section = item.section ?? 'ssdp';
    if (!acc[section]) acc[section] = [];
    acc[section].push(item);
    return acc;
  }, {});

  const sectionLabels: Record<string, string> = {
    account: 'Account',
    ssdp: 'SSDP',
    support: 'Support',
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="pt-4 pb-8">
        <ProfileCard />

        {/* Built-in navigation items */}
        <View className="mx-4 mb-6">
          {!isGuest && (
            <>
              <Pressable
                className="bg-white rounded-xl p-4 mb-2 flex-row items-center active:opacity-90"
                style={{ elevation: 1 }}
                onPress={() => router.push('/(tabs)/more/profile')}
              >
                <FontAwesome name="user" size={18} color={brand.blue} />
                <Text className="font-opensans-semibold text-ssdp-navy text-base flex-1 ml-4">
                  My Profile
                </Text>
                <FontAwesome name="chevron-right" size={14} color={brand.gray} />
              </Pressable>

              <Pressable
                className="bg-white rounded-xl p-4 mb-2 flex-row items-center active:opacity-90"
                style={{ elevation: 1 }}
                onPress={() => router.push('/(tabs)/more/notifications')}
              >
                <FontAwesome name="bell" size={18} color={brand.orange} />
                <Text className="font-opensans-semibold text-ssdp-navy text-base flex-1 ml-4">
                  Notifications
                </Text>
                {unreadCount > 0 && (
                  <View className="bg-red-500 rounded-full w-6 h-6 items-center justify-center mr-2">
                    <Text className="font-opensans-bold text-white text-xs">{unreadCount}</Text>
                  </View>
                )}
                <FontAwesome name="chevron-right" size={14} color={brand.gray} />
              </Pressable>

              <Pressable
                className="bg-white rounded-xl p-4 mb-2 flex-row items-center active:opacity-90"
                style={{ elevation: 1 }}
                onPress={() => router.push('/(tabs)/more/points')}
              >
                <FontAwesome name="star" size={18} color={brand.chartreuse} />
                <Text className="font-opensans-semibold text-ssdp-navy text-base flex-1 ml-4">
                  Points History
                </Text>
                <FontAwesome name="chevron-right" size={14} color={brand.gray} />
              </Pressable>

              <Pressable
                className="bg-white rounded-xl p-4 mb-2 flex-row items-center active:opacity-90"
                style={{ elevation: 1 }}
                onPress={() => router.push('/(tabs)/more/reports')}
              >
                <FontAwesome name="file-text-o" size={18} color={brand.teal} />
                <Text className="font-opensans-semibold text-ssdp-navy text-base flex-1 ml-4">
                  Activity Reports
                </Text>
                <FontAwesome name="chevron-right" size={14} color={brand.gray} />
              </Pressable>

              <Pressable
                className="bg-white rounded-xl p-4 mb-2 flex-row items-center active:opacity-90"
                style={{ elevation: 1 }}
                onPress={() => router.push('/(tabs)/more/news')}
              >
                <FontAwesome name="newspaper-o" size={18} color={brand.navy} />
                <Text className="font-opensans-semibold text-ssdp-navy text-base flex-1 ml-4">
                  News
                </Text>
                <FontAwesome name="chevron-right" size={14} color={brand.gray} />
              </Pressable>
            </>
          )}
        </View>

        {/* Dynamic menu items grouped by section */}
        {['account', 'ssdp', 'support'].map((section) => {
          const items = groupedMenuItems[section];
          if (!items || items.length === 0) return null;

          return (
            <View key={section} className="mx-4 mb-6">
              <Text className="font-montserrat text-ssdp-navy text-xs uppercase mb-2 ml-1">
                {sectionLabels[section] ?? section}
              </Text>
              {items.map((item) => (
                <Pressable
                  key={item.id}
                  className="bg-white rounded-xl p-4 mb-2 flex-row items-center active:opacity-90"
                  style={{ elevation: 1 }}
                  onPress={() => handleMenuPress(item)}
                >
                  {item.icon && (
                    <FontAwesome
                      name={item.icon as any}
                      size={18}
                      color={brand.blue}
                    />
                  )}
                  <Text className={`font-opensans-semibold text-ssdp-navy text-base flex-1 ${item.icon ? 'ml-4' : ''}`}>
                    {item.label}
                  </Text>
                  <FontAwesome
                    name={item.link_type === 'external' ? 'external-link' : 'chevron-right'}
                    size={14}
                    color={brand.gray}
                  />
                </Pressable>
              ))}
            </View>
          );
        })}

        {/* Sign out */}
        {!isGuest && (
          <View className="mx-4 mt-4">
            <Pressable
              className="py-4 items-center active:opacity-60"
              onPress={handleSignOut}
            >
              <Text className="font-opensans-semibold text-red-500 text-base">
                Sign Out
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
