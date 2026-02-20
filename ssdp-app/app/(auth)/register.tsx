import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { signUp } from '@/lib/auth';
import { brand } from '@/constants/Colors';

export default function RegisterScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!fullName.trim()) {
      Alert.alert('Error', 'Please enter your full name.');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await signUp(email.trim(), password, fullName.trim());
      Alert.alert(
        'Welcome to SSDP!',
        'Please check your email to confirm your account.',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
      );
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 32 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="mb-8">
          <Text className="font-montserrat text-3xl text-ssdp-navy uppercase">
            Join SSDP
          </Text>
          <Text className="font-opensans text-ssdp-gray mt-2">
            Create your account to get started with courses, events, and more.
          </Text>
        </View>

        {/* Form fields */}
        <View className="gap-4">
          <View>
            <Text className="font-opensans-semibold text-ssdp-navy text-sm mb-1">
              Full Name
            </Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 font-opensans text-base text-ssdp-navy"
              placeholder="Your full name"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
              autoComplete="name"
            />
          </View>

          <View>
            <Text className="font-opensans-semibold text-ssdp-navy text-sm mb-1">
              Email
            </Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 font-opensans text-base text-ssdp-navy"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          <View>
            <Text className="font-opensans-semibold text-ssdp-navy text-sm mb-1">
              Password
            </Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 font-opensans text-base text-ssdp-navy"
              placeholder="At least 6 characters"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="new-password"
            />
          </View>

          <View>
            <Text className="font-opensans-semibold text-ssdp-navy text-sm mb-1">
              Confirm Password
            </Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 font-opensans text-base text-ssdp-navy"
              placeholder="Repeat your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoComplete="new-password"
            />
          </View>
        </View>

        {/* Submit */}
        <Pressable
          className="bg-ssdp-orange py-4 rounded-xl items-center mt-8 active:opacity-80"
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={brand.navy} />
          ) : (
            <Text className="font-montserrat text-ssdp-navy text-lg uppercase">
              Create Account
            </Text>
          )}
        </Pressable>

        {/* Switch to login */}
        <Pressable
          className="mt-6 items-center py-2 active:opacity-60"
          onPress={() => router.replace('/(auth)/login')}
        >
          <Text className="font-opensans text-ssdp-blue">
            Already have an account? <Text className="font-opensans-bold">Login</Text>
          </Text>
        </Pressable>

        {/* Back to welcome */}
        <Pressable
          className="mt-2 items-center py-2 active:opacity-60"
          onPress={() => router.back()}
        >
          <Text className="font-opensans text-ssdp-gray text-sm">Back</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
