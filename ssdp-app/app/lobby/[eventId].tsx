import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { supabase } from '@/lib/supabase';
import { brand } from '@/constants/Colors';
import type { LobbyEvent } from '@/types/database';

export default function LobbyEventScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const [event, setEvent] = useState<LobbyEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedTopics, setExpandedTopics] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!eventId) return;

    const fetchEvent = async () => {
      const { data } = await supabase
        .from('lobby_events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (data) setEvent(data);
      setLoading(false);
    };

    fetchEvent();
  }, [eventId]);

  const toggleTopic = (index: number) => {
    setExpandedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  if (loading || !event) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color={brand.blue} />
      </View>
    );
  }

  const schedule = (event.schedule ?? []) as Array<{
    time: string;
    title: string;
    description?: string;
  }>;

  const talkingPoints = (event.talking_points ?? []) as Array<{
    topic: string;
    points: string[];
  }>;

  const formattedDate = event.event_date
    ? new Date(event.event_date + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <>
      <Stack.Screen options={{ title: 'Lobby Day' }} />
      <ScrollView className="flex-1 bg-gray-50">
        {/* Hero */}
        <View className="bg-ssdp-navy p-6 pb-8">
          <View className="flex-row items-center mb-3">
            <View className="bg-ssdp-teal/20 px-3 py-1 rounded-full flex-row items-center">
              <FontAwesome name="university" size={12} color={brand.teal} />
              <Text className="font-opensans-bold text-ssdp-teal text-xs ml-2 uppercase">
                Lobby Day
              </Text>
            </View>
          </View>
          <Text className="font-montserrat text-white text-2xl uppercase">
            {event.title}
          </Text>
          <View className="mt-3 gap-2">
            {formattedDate && (
              <View className="flex-row items-center">
                <FontAwesome name="calendar" size={14} color={brand.orange} />
                <Text className="font-opensans text-ssdp-orange text-sm ml-2">
                  {formattedDate}
                </Text>
              </View>
            )}
            {event.location && (
              <View className="flex-row items-center">
                <FontAwesome name="map-marker" size={14} color={brand.chartreuse} />
                <Text className="font-opensans text-ssdp-chartreuse text-sm ml-2">
                  {event.location}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View className="p-4">
          {/* Description */}
          {event.description && (
            <View className="bg-white rounded-xl p-5 mb-4" style={{ elevation: 1 }}>
              <Text className="font-opensans text-ssdp-navy text-base leading-7">
                {event.description}
              </Text>
            </View>
          )}

          {/* Schedule */}
          {schedule.length > 0 && (
            <View className="mb-4">
              <Text className="font-montserrat text-ssdp-navy text-sm uppercase mb-3 mx-1">
                Schedule
              </Text>
              {schedule.map((item, index) => (
                <View
                  key={index}
                  className="bg-white rounded-xl p-4 mb-2 flex-row"
                  style={{ elevation: 1 }}
                >
                  <View className="w-20 mr-4">
                    <Text className="font-montserrat text-ssdp-blue text-sm">
                      {item.time}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="font-opensans-bold text-ssdp-navy text-sm">
                      {item.title}
                    </Text>
                    {item.description && (
                      <Text className="font-opensans text-ssdp-gray text-xs mt-1">
                        {item.description}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Talking Points */}
          {talkingPoints.length > 0 && (
            <View className="mb-4">
              <Text className="font-montserrat text-ssdp-navy text-sm uppercase mb-3 mx-1">
                Talking Points
              </Text>
              {talkingPoints.map((tp, index) => {
                const isExpanded = expandedTopics.has(index);
                return (
                  <Pressable
                    key={index}
                    className="bg-white rounded-xl mb-2 overflow-hidden"
                    style={{ elevation: 1 }}
                    onPress={() => toggleTopic(index)}
                  >
                    <View className="p-4 flex-row items-center justify-between">
                      <Text className="font-opensans-bold text-ssdp-navy text-sm flex-1">
                        {tp.topic}
                      </Text>
                      <FontAwesome
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={12}
                        color={brand.gray}
                      />
                    </View>
                    {isExpanded && tp.points.length > 0 && (
                      <View className="px-4 pb-4 border-t border-gray-100 pt-3">
                        {tp.points.map((point, pIndex) => (
                          <View key={pIndex} className="flex-row mb-2">
                            <View className="w-2 h-2 rounded-full bg-ssdp-teal mt-1.5 mr-3" />
                            <Text className="font-opensans text-ssdp-navy text-sm flex-1 leading-6">
                              {point}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </>
  );
}
