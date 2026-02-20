import { View, Text, Pressable } from 'react-native';
import { useRouter, Stack } from 'expo-router';

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ title: 'Not Found' }} />
      <View className="flex-1 bg-gray-50 items-center justify-center px-8">
        <Text className="font-montserrat text-ssdp-navy text-2xl uppercase mb-4">
          Page Not Found
        </Text>
        <Pressable
          className="bg-ssdp-blue px-6 py-3 rounded-xl active:opacity-80"
          onPress={() => router.replace('/(tabs)')}
        >
          <Text className="font-montserrat text-white text-sm uppercase">
            Go Home
          </Text>
        </Pressable>
      </View>
    </>
  );
}
