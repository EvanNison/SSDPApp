import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useStore } from '@/stores/useStore';
import { updateProfile } from '@/lib/auth';
import { brand } from '@/constants/Colors';

export default function ProfileScreen() {
  const profile = useStore((s) => s.profile);
  const fetchProfile = useStore((s) => s.fetchProfile);

  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!profile?.id) return;
    setSaving(true);
    try {
      await updateProfile(profile.id, {
        full_name: fullName.trim(),
        bio: bio.trim() || null,
      });
      await fetchProfile();
      Alert.alert('Saved', 'Your profile has been updated.');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setSaving(false);
    }
  };

  if (!profile) return null;

  const roleBadgeColors: Record<string, { bg: string; text: string }> = {
    admin: { bg: brand.navy, text: '#FFFFFF' },
    staff: { bg: brand.navy, text: '#FFFFFF' },
    board: { bg: brand.blue, text: '#FFFFFF' },
    ambassador: { bg: brand.teal, text: '#FFFFFF' },
    registered: { bg: brand.gray, text: '#FFFFFF' },
  };

  const badge = roleBadgeColors[profile.role] ?? roleBadgeColors.registered;

  return (
    <ScrollView className="flex-1 bg-gray-50" keyboardShouldPersistTaps="handled">
      <View className="p-6 pb-8">
        {/* Avatar + name header */}
        <View className="items-center mb-8">
          <View className="w-24 h-24 rounded-full bg-ssdp-blue items-center justify-center mb-4">
            <Text className="font-montserrat text-white text-3xl">
              {profile.full_name?.[0]?.toUpperCase() ?? '?'}
            </Text>
          </View>
          <View
            className="px-3 py-1 rounded-full"
            style={{ backgroundColor: badge.bg }}
          >
            <Text
              className="font-montserrat text-xs uppercase"
              style={{ color: badge.text }}
            >
              {profile.role.replace('_', ' ')}
            </Text>
          </View>
        </View>

        {/* Stats row */}
        <View className="flex-row bg-white rounded-xl p-4 mb-6" style={{ elevation: 1 }}>
          <View className="flex-1 items-center">
            <Text className="font-montserrat text-ssdp-navy text-2xl">
              {profile.points}
            </Text>
            <Text className="font-opensans text-ssdp-gray text-xs mt-1">Points</Text>
          </View>
          <View className="w-px bg-gray-200" />
          <View className="flex-1 items-center">
            <Text className="font-montserrat text-ssdp-navy text-2xl">
              {profile.role.replace('_', ' ')}
            </Text>
            <Text className="font-opensans text-ssdp-gray text-xs mt-1">Role</Text>
          </View>
        </View>

        {/* Editable fields */}
        <View className="gap-4">
          <View>
            <Text className="font-opensans-semibold text-ssdp-navy text-sm mb-1">
              Full Name
            </Text>
            <TextInput
              className="bg-white border border-gray-200 rounded-lg px-4 py-3 font-opensans text-base text-ssdp-navy"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
            />
          </View>

          <View>
            <Text className="font-opensans-semibold text-ssdp-navy text-sm mb-1">
              Email
            </Text>
            <View className="bg-gray-100 border border-gray-200 rounded-lg px-4 py-3">
              <Text className="font-opensans text-ssdp-gray text-base">
                {profile.email}
              </Text>
            </View>
          </View>

          <View>
            <Text className="font-opensans-semibold text-ssdp-navy text-sm mb-1">
              Bio
            </Text>
            <TextInput
              className="bg-white border border-gray-200 rounded-lg px-4 py-3 font-opensans text-base text-ssdp-navy"
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={3}
              placeholder="Tell us about yourself..."
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Save button */}
        <Pressable
          className="bg-ssdp-blue py-4 rounded-xl items-center mt-8 active:opacity-80"
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="font-montserrat text-white text-base uppercase">
              Save Profile
            </Text>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}
