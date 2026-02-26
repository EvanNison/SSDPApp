import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  RefreshControl,
  Linking,
  Image,
} from 'react-native';
import { Stack } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { supabase } from '@/lib/supabase';
import { brand } from '@/constants/Colors';
import type { NewsItem } from '@/types/database';

const tagColors: Record<string, string> = {
  event: brand.teal,
  urgent: '#EF4444',
  policy: brand.blue,
  win: brand.chartreuse,
  course: brand.orange,
};

function NewsCard({ item }: { item: NewsItem }) {
  const handlePress = () => {
    if (item.external_url) {
      Linking.openURL(item.external_url);
    }
  };

  const formattedDate = new Date(item.published_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Pressable
      className="bg-white rounded-2xl mx-4 mb-3 overflow-hidden active:opacity-90"
      style={{ elevation: 2 }}
      onPress={handlePress}
    >
      {item.image_url && (
        <Image
          source={{ uri: item.image_url }}
          style={{ width: '100%', height: 160 }}
          resizeMode="cover"
        />
      )}
      <View className="p-4">
        <View className="flex-row items-center mb-2">
          {item.tag && (
            <View
              className="px-2 py-1 rounded-full mr-2"
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
          <Text className="font-opensans text-ssdp-gray text-xs">{formattedDate}</Text>
          {item.source === 'wordpress' && (
            <Text className="font-opensans text-ssdp-gray text-xs ml-auto">ssdp.org</Text>
          )}
        </View>
        <Text className="font-opensans-bold text-ssdp-navy text-base">{item.title}</Text>
        {item.excerpt && (
          <Text className="font-opensans text-ssdp-gray text-sm mt-1" numberOfLines={3}>
            {item.excerpt}
          </Text>
        )}
        {item.external_url && (
          <View className="flex-row items-center mt-3">
            <Text className="font-opensans-semibold text-ssdp-blue text-sm">
              Read More
            </Text>
            <FontAwesome name="external-link" size={12} color={brand.blue} style={{ marginLeft: 6 }} />
          </View>
        )}
      </View>
    </Pressable>
  );
}

export default function NewsScreen() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNews = async () => {
    const { data } = await supabase
      .from('news')
      .select('*')
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(50);

    if (data) setNews(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNews();
    setRefreshing(false);
  };

  return (
    <>
      <Stack.Screen options={{ title: 'News' }} />
      <ScrollView
        className="flex-1 bg-gray-50"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={brand.blue} />
        }
      >
        <View className="pt-4 pb-8">
          {loading ? (
            <View className="items-center py-12">
              <Text className="font-opensans text-ssdp-gray">Loading news...</Text>
            </View>
          ) : news.length === 0 ? (
            <View className="items-center py-12">
              <FontAwesome name="newspaper-o" size={48} color={brand.gray} />
              <Text className="font-opensans text-ssdp-gray mt-4">No news yet</Text>
            </View>
          ) : (
            news.map((item) => <NewsCard key={item.id} item={item} />)
          )}
        </View>
      </ScrollView>
    </>
  );
}
