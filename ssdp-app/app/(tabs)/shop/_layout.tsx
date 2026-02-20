import { Stack } from 'expo-router';
import { brand } from '@/constants/Colors';

export default function ShopLayout() {
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
      <Stack.Screen name="index" options={{ title: 'Shop Sensibly' }} />
    </Stack>
  );
}
