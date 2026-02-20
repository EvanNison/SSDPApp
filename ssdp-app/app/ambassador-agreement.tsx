import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/stores/useStore';
import { brand } from '@/constants/Colors';

const COMMITMENTS = [
  'Represent SSDP with integrity and respect in all interactions.',
  'Engage in evidence-based conversations about drug policy.',
  'Participate in at least one SSDP campaign or activity per semester.',
  'Support harm reduction principles and practices.',
  'Stay informed about current drug policy issues.',
  'Mentor new SSDP members when possible.',
  'Follow SSDP\'s code of conduct at all times.',
];

export default function AmbassadorAgreementScreen() {
  const router = useRouter();
  const profile = useStore((s) => s.profile);
  const fetchProfile = useStore((s) => s.fetchProfile);
  const [acceptedItems, setAcceptedItems] = useState<Set<number>>(new Set());
  const [submitting, setSubmitting] = useState(false);

  const toggleItem = (index: number) => {
    setAcceptedItems((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const allAccepted = acceptedItems.size === COMMITMENTS.length;

  const handleSubmit = async () => {
    if (!allAccepted || !profile?.id) return;

    setSubmitting(true);
    try {
      const { error } = await supabase.from('ambassador_agreements').insert({
        user_id: profile.id,
        commitments: COMMITMENTS,
        status: 'submitted',
      });

      if (error) throw error;

      Alert.alert(
        'Agreement Submitted!',
        'Your Ambassador Agreement has been submitted for review. An admin will approve your application soon.',
        [{ text: 'OK', onPress: () => router.back() }]
      );

      await fetchProfile();
    } catch (error: any) {
      if (error.code === '23505') {
        Alert.alert('Already Submitted', 'You have already submitted an Ambassador Agreement.');
      } else {
        Alert.alert('Error', error.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-6 pb-8">
        {/* Header */}
        <View className="bg-ssdp-navy rounded-2xl p-6 mb-6">
          <Text className="font-montserrat text-white text-xl uppercase">
            Ambassador Agreement
          </Text>
          <Text className="font-opensans text-gray-300 text-sm mt-2">
            As an SSDP Ambassador, you commit to representing our mission of
            replacing the War on Drugs with evidence-based, compassionate policy.
          </Text>
        </View>

        {/* Commitment checkboxes */}
        <Text className="font-montserrat text-ssdp-navy text-sm uppercase mb-4">
          I commit to the following:
        </Text>

        {COMMITMENTS.map((commitment, idx) => {
          const accepted = acceptedItems.has(idx);
          return (
            <Pressable
              key={idx}
              className="flex-row items-start mb-4 active:opacity-80"
              onPress={() => toggleItem(idx)}
            >
              <View
                className={`w-6 h-6 rounded-md border-2 items-center justify-center mr-3 mt-0.5 ${
                  accepted ? 'bg-ssdp-teal border-ssdp-teal' : 'border-gray-300'
                }`}
              >
                {accepted && (
                  <FontAwesome name="check" size={14} color="#FFFFFF" />
                )}
              </View>
              <Text className="font-opensans text-ssdp-navy text-sm flex-1 leading-5">
                {commitment}
              </Text>
            </Pressable>
          );
        })}

        {/* Submit button */}
        <Pressable
          className={`py-4 rounded-xl items-center mt-6 ${
            allAccepted ? 'bg-ssdp-orange active:opacity-80' : 'bg-gray-300'
          }`}
          onPress={handleSubmit}
          disabled={!allAccepted || submitting}
        >
          {submitting ? (
            <ActivityIndicator color={brand.navy} />
          ) : (
            <Text className="font-montserrat text-ssdp-navy text-lg uppercase">
              Sign & Submit
            </Text>
          )}
        </Pressable>

        {!allAccepted && (
          <Text className="font-opensans text-ssdp-gray text-xs text-center mt-3">
            Please accept all commitments to submit.
          </Text>
        )}
      </View>
    </ScrollView>
  );
}
