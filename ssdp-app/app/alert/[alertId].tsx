import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/stores/useStore';
import { awardPoints } from '@/lib/points';
import { brand } from '@/constants/Colors';
import type { ActionAlert } from '@/types/database';

export default function AlertDetailScreen() {
  const { alertId } = useLocalSearchParams<{ alertId: string }>();
  const profile = useStore((s) => s.profile);
  const fetchProfile = useStore((s) => s.fetchProfile);

  const [alert, setAlert] = useState<ActionAlert | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasResponded, setHasResponded] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!alertId) return;

    const fetchAlert = async () => {
      const { data } = await supabase
        .from('action_alerts')
        .select('*')
        .eq('id', alertId)
        .single();

      if (data) setAlert(data);

      // Check if user already responded
      if (profile?.id) {
        const { data: response } = await supabase
          .from('alert_responses')
          .select('id')
          .eq('alert_id', alertId)
          .eq('user_id', profile.id)
          .maybeSingle();

        if (response) setHasResponded(true);
      }

      setLoading(false);
    };

    fetchAlert();
  }, [alertId, profile?.id]);

  const handleTakeAction = async () => {
    if (!alert || !profile?.id || hasResponded) return;

    setSubmitting(true);
    try {
      // Record the response
      const { error } = await supabase.from('alert_responses').insert({
        alert_id: alert.id,
        user_id: profile.id,
        points_earned: alert.points_reward,
      });

      if (error) throw error;

      // Award points
      await awardPoints(
        profile.id,
        alert.points_reward,
        `Action alert: ${alert.title}`,
        'alert',
        alert.id
      );

      setHasResponded(true);
      await fetchProfile();

      Alert.alert(
        'Action Completed!',
        `Thank you for taking action! You earned ${alert.points_reward} points.`
      );
    } catch (error) {
      console.error('Failed to record action:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !alert) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color={brand.blue} />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Action Alert' }} />
      <ScrollView className="flex-1 bg-gray-50">
        {/* Hero */}
        <View className="bg-ssdp-navy p-6 pb-8">
          <View className="flex-row items-center mb-3">
            <View className="bg-red-500/20 px-3 py-1 rounded-full flex-row items-center">
              <FontAwesome name="bullhorn" size={12} color="#EF4444" />
              <Text className="font-opensans-bold text-red-400 text-xs ml-2 uppercase">
                Action Alert
              </Text>
            </View>
            {alert.bill_number && (
              <View className="bg-white/10 px-3 py-1 rounded-full ml-2">
                <Text className="font-opensans-bold text-ssdp-teal text-xs">
                  {alert.bill_number}
                </Text>
              </View>
            )}
          </View>
          <Text className="font-montserrat text-white text-2xl uppercase">
            {alert.title}
          </Text>
          <View className="flex-row items-center mt-3">
            <FontAwesome name="star" size={14} color={brand.orange} />
            <Text className="font-opensans text-ssdp-orange text-sm ml-2">
              +{alert.points_reward} points for taking action
            </Text>
          </View>
        </View>

        <View className="p-6">
          {/* Description */}
          {alert.description && (
            <View className="mb-6">
              <Text className="font-montserrat text-ssdp-navy text-sm uppercase mb-2">
                Why This Matters
              </Text>
              <Text className="font-opensans text-ssdp-navy text-base leading-7">
                {alert.description}
              </Text>
            </View>
          )}

          {/* Call to Action */}
          {alert.call_to_action && (
            <View className="bg-ssdp-blue/5 border-l-4 border-ssdp-blue rounded-r-xl p-4 mb-6">
              <Text className="font-montserrat text-ssdp-navy text-sm uppercase mb-2">
                What You Can Do
              </Text>
              <Text className="font-opensans text-ssdp-navy text-base leading-7">
                {alert.call_to_action}
              </Text>
            </View>
          )}

          {/* Target Contact */}
          {alert.target_contact && (
            <View className="bg-white rounded-xl p-4 mb-6" style={{ elevation: 1 }}>
              <View className="flex-row items-center mb-2">
                <FontAwesome name="phone" size={16} color={brand.teal} />
                <Text className="font-montserrat text-ssdp-navy text-sm uppercase ml-2">
                  Contact
                </Text>
              </View>
              <Text className="font-opensans text-ssdp-navy text-base">
                {alert.target_contact}
              </Text>
            </View>
          )}

          {/* Action Button */}
          {hasResponded ? (
            <View className="bg-ssdp-teal/10 rounded-xl p-5 items-center">
              <FontAwesome name="check-circle" size={32} color={brand.teal} />
              <Text className="font-montserrat text-ssdp-teal text-base uppercase mt-2">
                Action Completed
              </Text>
              <Text className="font-opensans text-ssdp-gray text-sm mt-1">
                Thank you for making your voice heard!
              </Text>
            </View>
          ) : (
            <Pressable
              className={`rounded-xl py-4 items-center ${submitting ? 'bg-gray-300' : 'bg-ssdp-orange active:opacity-80'}`}
              onPress={handleTakeAction}
              disabled={submitting || !profile?.id}
            >
              <Text className="font-montserrat text-ssdp-navy text-base uppercase">
                {submitting ? 'Recording...' : 'I Took Action'}
              </Text>
            </Pressable>
          )}

          {!profile?.id && (
            <Text className="font-opensans text-ssdp-gray text-xs text-center mt-3">
              Sign in to take action and earn points
            </Text>
          )}
        </View>
      </ScrollView>
    </>
  );
}
