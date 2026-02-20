import { Stack } from 'expo-router';
import { brand } from '@/constants/Colors';

export default function ChatLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: brand.navy },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontFamily: 'Montserrat_700Bold',
        },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Chat' }} />
      <Stack.Screen name="[channelId]" options={{ title: 'Channel' }} />
    </Stack>
  );
}
