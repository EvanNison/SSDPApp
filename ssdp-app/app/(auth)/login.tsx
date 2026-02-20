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
import { signIn } from '@/lib/auth';
import { brand } from '@/constants/Colors';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email.');
      return;
    }
    if (!password) {
      Alert.alert('Error', 'Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      await signIn(email.trim(), password);
      // Auth state change listener in _layout.tsx will handle navigation
    } catch (error: any) {
      Alert.alert('Login Failed', error.message);
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
            Login
          </Text>
          <Text className="font-opensans text-ssdp-gray mt-2">
            Welcome back! Sign in to your SSDP account.
          </Text>
        </View>

        {/* Form fields */}
        <View className="gap-4">
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
              placeholder="Your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="current-password"
            />
          </View>
        </View>

        {/* Submit */}
        <Pressable
          className="bg-ssdp-blue py-4 rounded-xl items-center mt-8 active:opacity-80"
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="font-montserrat text-white text-lg uppercase">
              Login
            </Text>
          )}
        </Pressable>

        {/* Switch to register */}
        <Pressable
          className="mt-6 items-center py-2 active:opacity-60"
          onPress={() => router.replace('/(auth)/register')}
        >
          <Text className="font-opensans text-ssdp-blue">
            Don't have an account? <Text className="font-opensans-bold">Join SSDP</Text>
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
