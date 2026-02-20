import { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/stores/useStore';
import { brand } from '@/constants/Colors';
import type { PointsLogEntry } from '@/types/database';

export default function PointsScreen() {
  const profile = useStore((s) => s.profile);
  const [entries, setEntries] = useState<PointsLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPoints = async () => {
    if (!profile?.id) return;
    try {
      const { data } = await supabase
        .from('points_log')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(50);
      if (data) setEntries(data);
    } catch (error) {
      console.error('Failed to fetch points:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPoints();
  }, [profile?.id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPoints();
    setRefreshing(false);
  };

  const renderEntry = ({ item }: { item: PointsLogEntry }) => {
    const date = new Date(item.created_at).toLocaleDateString();
    return (
      <View className="bg-white rounded-xl p-4 mx-4 mb-2 flex-row items-center" style={{ elevation: 1 }}>
        <View className="w-10 h-10 rounded-full bg-ssdp-orange/20 items-center justify-center mr-3">
          <FontAwesome name="star" size={18} color={brand.orange} />
        </View>
        <View className="flex-1">
          <Text className="font-opensans-semibold text-ssdp-navy text-sm">
            {item.reason}
          </Text>
          <Text className="font-opensans text-ssdp-gray text-xs mt-1">{date}</Text>
        </View>
        <Text className="font-montserrat text-ssdp-teal text-lg">
          +{item.points}
        </Text>
      </View>
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
    <View className="flex-1 bg-gray-50">
      {/* Total points header */}
      <View className="bg-ssdp-navy p-6 items-center">
        <Text className="font-opensans text-gray-400 text-xs uppercase">Total Points</Text>
        <Text className="font-montserrat text-ssdp-chartreuse text-4xl mt-1">
          {profile?.points ?? 0}
        </Text>
      </View>

      <FlatList
        data={entries}
        renderItem={renderEntry}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={brand.blue} />
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-20 px-8">
            <FontAwesome name="star-o" size={48} color={brand.gray} />
            <Text className="font-montserrat text-ssdp-navy text-lg mt-4 uppercase text-center">
              No Points Yet
            </Text>
            <Text className="font-opensans text-ssdp-gray text-center mt-2">
              Complete courses and quizzes to earn points!
            </Text>
          </View>
        }
      />
    </View>
  );
}
