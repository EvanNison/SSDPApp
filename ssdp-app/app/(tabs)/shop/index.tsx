import { View, Text, Pressable, Linking, ScrollView } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { brand } from '@/constants/Colors';

const SHOP_CATEGORIES = [
  {
    title: 'SSDP Merch',
    description: 'T-shirts, stickers, and more from the SSDP store.',
    icon: 'shopping-bag' as const,
    url: 'https://ssdp.org/shop/',
    color: brand.orange,
  },
  {
    title: 'Harm Reduction Supplies',
    description: 'Naloxone, fentanyl test strips, and safer use supplies.',
    icon: 'medkit' as const,
    url: 'https://ssdp.org/shop/',
    color: brand.teal,
  },
  {
    title: 'Educational Materials',
    description: 'Brochures, posters, and resources for your chapter.',
    icon: 'book' as const,
    url: 'https://ssdp.org/shop/',
    color: brand.blue,
  },
];

export default function ShopScreen() {
  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4 pb-8">
        {/* Header card */}
        <View className="bg-ssdp-orange rounded-2xl p-6 mb-6">
          <Text className="font-montserrat text-ssdp-navy text-xl uppercase">
            Shop Sensibly
          </Text>
          <Text className="font-opensans text-ssdp-navy/80 text-sm mt-2">
            Support SSDP and get harm reduction supplies, merch, and educational materials.
          </Text>
        </View>

        {/* Categories */}
        {SHOP_CATEGORIES.map((cat) => (
          <Pressable
            key={cat.title}
            className="bg-white rounded-xl p-5 mb-3 flex-row items-center active:opacity-90"
            style={{ elevation: 2 }}
            onPress={() => Linking.openURL(cat.url)}
          >
            <View
              className="w-14 h-14 rounded-full items-center justify-center mr-4"
              style={{ backgroundColor: cat.color + '20' }}
            >
              <FontAwesome name={cat.icon} size={24} color={cat.color} />
            </View>
            <View className="flex-1">
              <Text className="font-opensans-bold text-ssdp-navy text-base">
                {cat.title}
              </Text>
              <Text className="font-opensans text-ssdp-gray text-sm mt-1">
                {cat.description}
              </Text>
            </View>
            <FontAwesome name="external-link" size={16} color={brand.gray} />
          </Pressable>
        ))}

        {/* Coming soon note */}
        <View className="bg-ssdp-navy/5 rounded-xl p-4 mt-4">
          <Text className="font-opensans text-ssdp-gray text-sm text-center">
            Full in-app shopping coming soon. For now, tap to visit the SSDP store.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
