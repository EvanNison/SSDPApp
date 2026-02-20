import { View, Text, Pressable, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { useStore } from '@/stores/useStore';

export default function WelcomeScreen() {
  const router = useRouter();
  const enterGuestMode = useStore((s) => s.enterGuestMode);

  return (
    <View className="flex-1 bg-ssdp-navy">
      {/* Hero section with overlay */}
      <View className="flex-1 justify-center items-center px-8">
        {/* SSDP Logo area */}
        <View className="items-center mb-8">
          <Text className="font-montserrat text-4xl text-white text-center tracking-wider">
            SSDP
          </Text>
          <View className="h-1 w-16 bg-ssdp-chartreuse mt-2 rounded-full" />
        </View>

        {/* Kat's verbatim copy */}
        <Text className="font-opensans text-white text-center text-base leading-7 mb-12 px-2">
          We are Students for Sensible Drug Policy, the largest youth-led network
          dedicated to replacing the War on Drugs with principles rooted in evidence,
          compassion, and human rights — policies that make sense.
        </Text>

        {/* CTA Buttons */}
        <View className="w-full gap-4">
          <Pressable
            className="bg-ssdp-orange py-4 rounded-xl items-center active:opacity-80"
            onPress={() => router.push('/(auth)/register')}
          >
            <Text className="font-montserrat text-ssdp-navy text-lg uppercase">
              Join SSDP
            </Text>
          </Pressable>

          <Pressable
            className="border-2 border-white py-4 rounded-xl items-center active:opacity-80"
            onPress={() => router.push('/(auth)/login')}
          >
            <Text className="font-montserrat text-white text-lg uppercase">
              Login
            </Text>
          </Pressable>
        </View>

        {/* Guest mode */}
        <Pressable
          className="mt-6 py-3 active:opacity-60"
          onPress={enterGuestMode}
        >
          <Text className="font-opensans text-ssdp-teal text-sm underline">
            Continue as Guest
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
