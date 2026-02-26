import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useStore } from '@/stores/useStore';
import { supabase } from '@/lib/supabase';
import { updateProfile, uploadAvatar, deleteAccount } from '@/lib/auth';
import { signOut } from '@/lib/auth';
import { brand } from '@/constants/Colors';

interface Chapter {
  id: string;
  name: string;
  university: string | null;
}

export default function ProfileScreen() {
  const profile = useStore((s) => s.profile);
  const fetchProfile = useStore((s) => s.fetchProfile);

  const reset = useStore((s) => s.reset);
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [chapterId, setChapterId] = useState(profile?.chapter_id ?? '');
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [showChapterPicker, setShowChapterPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    supabase
      .from('chapters')
      .select('id, name, university')
      .eq('is_active', true)
      .order('name')
      .then(({ data }) => {
        if (data) setChapters(data);
      });
  }, []);

  const handleSave = async () => {
    if (!profile?.id) return;
    setSaving(true);
    try {
      await updateProfile(profile.id, {
        full_name: fullName.trim(),
        bio: bio.trim() || null,
        chapter_id: chapterId || null,
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
          <Pressable
            className="w-24 h-24 rounded-full bg-ssdp-blue items-center justify-center mb-4 overflow-hidden"
            onPress={async () => {
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.7,
              });
              if (!result.canceled && result.assets[0]) {
                setUploading(true);
                try {
                  const url = await uploadAvatar(profile.id, result.assets[0].uri);
                  await fetchProfile();
                } catch (error: any) {
                  Alert.alert('Upload Failed', error.message);
                } finally {
                  setUploading(false);
                }
              }
            }}
            disabled={uploading}
          >
            {profile.avatar_url ? (
              <Image
                source={{ uri: profile.avatar_url }}
                className="w-24 h-24"
                resizeMode="cover"
              />
            ) : (
              <Text className="font-montserrat text-white text-3xl">
                {profile.full_name?.[0]?.toUpperCase() ?? '?'}
              </Text>
            )}
            {uploading ? (
              <View className="absolute inset-0 bg-black/40 items-center justify-center">
                <ActivityIndicator color="#FFFFFF" />
              </View>
            ) : (
              <View className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-ssdp-navy items-center justify-center border-2 border-white">
                <FontAwesome name="camera" size={12} color="#FFFFFF" />
              </View>
            )}
          </Pressable>
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

          {/* Chapter selection */}
          <View>
            <Text className="font-opensans-semibold text-ssdp-navy text-sm mb-1">
              Chapter
            </Text>
            <Pressable
              className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex-row items-center"
              onPress={() => setShowChapterPicker(!showChapterPicker)}
            >
              <Text className={`font-opensans text-base flex-1 ${chapterId ? 'text-ssdp-navy' : 'text-gray-400'}`}>
                {chapterId
                  ? chapters.find((c) => c.id === chapterId)?.name ?? 'Select chapter...'
                  : 'Select your chapter...'}
              </Text>
              <FontAwesome
                name={showChapterPicker ? 'chevron-up' : 'chevron-down'}
                size={12}
                color={brand.gray}
              />
            </Pressable>
            {showChapterPicker && (
              <View className="bg-white border border-gray-200 rounded-lg mt-1 max-h-48">
                <ScrollView nestedScrollEnabled>
                  <Pressable
                    className="px-4 py-3 border-b border-gray-100"
                    onPress={() => { setChapterId(''); setShowChapterPicker(false); }}
                  >
                    <Text className="font-opensans text-gray-400 text-sm">None</Text>
                  </Pressable>
                  {chapters.map((ch) => (
                    <Pressable
                      key={ch.id}
                      className={`px-4 py-3 border-b border-gray-100 ${chapterId === ch.id ? 'bg-ssdp-blue/10' : ''}`}
                      onPress={() => { setChapterId(ch.id); setShowChapterPicker(false); }}
                    >
                      <Text className="font-opensans-semibold text-ssdp-navy text-sm">
                        {ch.name}
                      </Text>
                      {ch.university && (
                        <Text className="font-opensans text-ssdp-gray text-xs">
                          {ch.university}
                        </Text>
                      )}
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            )}
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

        {/* Delete Account */}
        <View className="mt-12 pt-6 border-t border-gray-200">
          <Text className="font-opensans text-ssdp-gray text-xs text-center mb-3">
            Deleting your account is permanent and cannot be undone.
          </Text>
          <Pressable
            className="border-2 border-red-300 py-3 rounded-xl items-center active:opacity-80"
            onPress={() => {
              Alert.alert(
                'Delete Account',
                'This will permanently delete your account and all associated data. This action cannot be undone.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Delete My Account',
                    style: 'destructive',
                    onPress: async () => {
                      setDeleting(true);
                      try {
                        await deleteAccount();
                        await signOut();
                        reset();
                      } catch (error: any) {
                        Alert.alert('Error', error.message);
                        setDeleting(false);
                      }
                    },
                  },
                ]
              );
            }}
            disabled={deleting}
          >
            {deleting ? (
              <ActivityIndicator color="#EF4444" />
            ) : (
              <Text className="font-opensans-bold text-red-500 text-sm">
                Delete Account
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
