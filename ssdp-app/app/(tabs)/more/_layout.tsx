import { Stack } from 'expo-router';
import { brand } from '@/constants/Colors';

export default function MoreLayout() {
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
      <Stack.Screen name="index" options={{ title: 'More' }} />
      <Stack.Screen name="profile" options={{ title: 'Profile' }} />
      <Stack.Screen name="notifications" options={{ title: 'Notifications' }} />
      <Stack.Screen name="points" options={{ title: 'Points' }} />
    </Stack>
  );
}
