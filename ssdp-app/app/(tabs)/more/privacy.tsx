import { ScrollView, View, Text } from 'react-native';
import { Stack } from 'expo-router';
import { brand } from '@/constants/Colors';

export default function PrivacyPolicyScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Privacy Policy' }} />
      <ScrollView className="flex-1 bg-white">
        <View className="p-6 pb-12">
          <Text className="font-montserrat text-ssdp-navy text-xl uppercase mb-2">
            Privacy Policy
          </Text>
          <Text className="font-opensans text-ssdp-gray text-xs mb-6">
            Last updated: February 26, 2026
          </Text>

          <Section title="1. Information We Collect">
            <P>
              When you create an account, we collect your name, email address,
              and optionally your university/chapter affiliation and profile
              photo. We also collect usage data such as course progress, quiz
              scores, points earned, and chat messages you send within the app.
            </P>
            <P>
              If you enable push notifications, we store a device token to
              deliver notifications. We do not collect precise location data.
            </P>
          </Section>

          <Section title="2. How We Use Your Information">
            <P>
              We use your information to provide and improve the SSDP app
              experience, including: managing your account and profile, tracking
              course progress and points, delivering notifications about events
              and advocacy campaigns, enabling chat between members, and
              generating anonymous usage analytics.
            </P>
          </Section>

          <Section title="3. Data Sharing">
            <P>
              We do not sell, rent, or share your personal information with third
              parties for marketing purposes. We may share information with:
            </P>
            <Bullet>
              Supabase (our database and authentication provider) to operate the
              service
            </Bullet>
            <Bullet>
              Expo / React Native services for push notification delivery
            </Bullet>
            <Bullet>
              SSDP staff and chapter leaders, limited to what is necessary for
              organizational coordination
            </Bullet>
          </Section>

          <Section title="4. Data Security">
            <P>
              We use industry-standard security measures including encrypted
              connections (TLS/SSL), secure authentication via Supabase Auth, and
              row-level security policies on our database. However, no method of
              electronic transmission or storage is 100% secure.
            </P>
          </Section>

          <Section title="5. Your Rights">
            <P>You have the right to:</P>
            <Bullet>Access your personal data through your profile</Bullet>
            <Bullet>Update or correct your information at any time</Bullet>
            <Bullet>
              Delete your account and all associated data permanently via Profile
              &gt; Delete Account
            </Bullet>
            <Bullet>
              Opt out of push notifications through your device settings
            </Bullet>
          </Section>

          <Section title="6. Data Retention">
            <P>
              We retain your data for as long as your account is active. When you
              delete your account, all personal data including your profile,
              progress, messages, and points history is permanently deleted. Chat
              messages you sent will be removed. Anonymous usage analytics may be
              retained.
            </P>
          </Section>

          <Section title="7. Children's Privacy">
            <P>
              The SSDP app is not intended for children under 13. We do not
              knowingly collect information from children under 13. If you
              believe a child has provided us with personal information, please
              contact us.
            </P>
          </Section>

          <Section title="8. Changes to This Policy">
            <P>
              We may update this privacy policy from time to time. We will notify
              you of significant changes through the app or by email.
            </P>
          </Section>

          <Section title="9. Contact Us">
            <P>
              If you have questions about this privacy policy or your data,
              contact us at:
            </P>
            <P>
              Students for Sensible Drug Policy{'\n'}
              info@ssdp.org{'\n'}
              https://ssdp.org
            </P>
          </Section>
        </View>
      </ScrollView>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="mb-6">
      <Text className="font-opensans-bold text-ssdp-navy text-base mb-2">
        {title}
      </Text>
      {children}
    </View>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <Text className="font-opensans text-ssdp-navy/80 text-sm leading-5 mb-2">
      {children}
    </Text>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <View className="flex-row ml-2 mb-1">
      <Text className="font-opensans text-ssdp-navy/80 text-sm mr-2">{'\u2022'}</Text>
      <Text className="font-opensans text-ssdp-navy/80 text-sm leading-5 flex-1">
        {children}
      </Text>
    </View>
  );
}
