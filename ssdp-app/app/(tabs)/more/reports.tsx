import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useStore } from '@/stores/useStore';
import { supabase } from '@/lib/supabase';
import { awardPoints } from '@/lib/points';
import { brand } from '@/constants/Colors';

interface Report {
  id: string;
  report_type: string;
  contact_name: string | null;
  summary: string | null;
  points_earned: number;
  created_at: string;
}

const REPORT_TYPES = [
  { value: 'lobby_meeting', label: 'Lobby Meeting', icon: 'university' as const },
  { value: 'campus_event', label: 'Campus Event', icon: 'calendar' as const },
  { value: 'community_outreach', label: 'Community Outreach', icon: 'users' as const },
  { value: 'media_engagement', label: 'Media Engagement', icon: 'microphone' as const },
  { value: 'other', label: 'Other Activity', icon: 'pencil' as const },
];

export default function ReportsScreen() {
  const profile = useStore((s) => s.profile);
  const fetchProfile = useStore((s) => s.fetchProfile);
  const [reports, setReports] = useState<Report[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [reportType, setReportType] = useState('lobby_meeting');
  const [contactName, setContactName] = useState('');
  const [summary, setSummary] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchReports = async () => {
    if (!profile?.id) return;
    const { data } = await supabase
      .from('activity_reports')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false });
    if (data) setReports(data);
  };

  useEffect(() => {
    fetchReports();
  }, [profile?.id]);

  const handleSubmit = async () => {
    if (!profile?.id || !summary.trim()) return;
    setSubmitting(true);

    try {
      const pointsEarned = 10;

      // Insert the report
      const { error: reportError } = await supabase.from('activity_reports').insert({
        user_id: profile.id,
        report_type: reportType,
        contact_name: contactName.trim() || null,
        summary: summary.trim(),
        points_earned: pointsEarned,
      });
      if (reportError) throw reportError;

      // Award points (handles points_log, profile update, and chapter update)
      await awardPoints(
        profile.id,
        pointsEarned,
        `Activity report: ${REPORT_TYPES.find((t) => t.value === reportType)?.label}`,
        'activity_report'
      );

      await fetchProfile();

      // Reset form
      setContactName('');
      setSummary('');
      setShowForm(false);
      fetchReports();
      Alert.alert('Report Submitted', `You earned ${pointsEarned} points!`);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50" keyboardShouldPersistTaps="handled">
      <View className="p-4 pb-8">
        {/* Header */}
        <View className="bg-ssdp-navy rounded-2xl p-6 mb-4">
          <Text className="font-montserrat text-white text-lg uppercase">
            Activity Reports
          </Text>
          <Text className="font-opensans text-gray-300 text-sm mt-1">
            Log your advocacy activities to earn points and track your impact.
          </Text>
          <View className="flex-row items-center mt-3">
            <FontAwesome name="star" size={14} color={brand.chartreuse} />
            <Text className="font-opensans text-ssdp-chartreuse text-sm ml-2">
              +10 points per report
            </Text>
          </View>
        </View>

        {/* New report button */}
        {!showForm && (
          <Pressable
            className="bg-ssdp-blue py-4 rounded-xl items-center mb-6 active:opacity-80"
            onPress={() => setShowForm(true)}
          >
            <View className="flex-row items-center">
              <FontAwesome name="plus" size={14} color="#FFFFFF" />
              <Text className="font-montserrat text-white text-base uppercase ml-2">
                New Report
              </Text>
            </View>
          </Pressable>
        )}

        {/* Form */}
        {showForm && (
          <View className="bg-white rounded-xl p-6 mb-6" style={{ elevation: 1 }}>
            <Text className="font-montserrat text-ssdp-navy text-sm uppercase mb-4">
              Submit Report
            </Text>

            {/* Report type */}
            <Text className="font-opensans-semibold text-ssdp-navy text-sm mb-2">
              Activity Type
            </Text>
            <View className="flex-row flex-wrap gap-2 mb-4">
              {REPORT_TYPES.map((t) => (
                <Pressable
                  key={t.value}
                  className={`px-3 py-2 rounded-lg flex-row items-center ${
                    reportType === t.value ? 'bg-ssdp-blue' : 'bg-gray-100'
                  }`}
                  onPress={() => setReportType(t.value)}
                >
                  <FontAwesome
                    name={t.icon}
                    size={12}
                    color={reportType === t.value ? '#FFFFFF' : brand.gray}
                  />
                  <Text
                    className={`font-opensans text-xs ml-2 ${
                      reportType === t.value ? 'text-white' : 'text-ssdp-gray'
                    }`}
                  >
                    {t.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Contact name */}
            <Text className="font-opensans-semibold text-ssdp-navy text-sm mb-1">
              Contact Name (optional)
            </Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 font-opensans text-sm text-ssdp-navy mb-4"
              value={contactName}
              onChangeText={setContactName}
              placeholder="e.g., Rep. Smith, Prof. Jones..."
            />

            {/* Summary */}
            <Text className="font-opensans-semibold text-ssdp-navy text-sm mb-1">
              Summary *
            </Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 font-opensans text-sm text-ssdp-navy mb-4"
              value={summary}
              onChangeText={setSummary}
              multiline
              numberOfLines={4}
              placeholder="Describe what happened, who was involved, and the outcome..."
              textAlignVertical="top"
            />

            {/* Buttons */}
            <View className="flex-row gap-3">
              <Pressable
                className="flex-1 bg-gray-100 py-3 rounded-xl items-center active:opacity-80"
                onPress={() => setShowForm(false)}
              >
                <Text className="font-opensans-semibold text-ssdp-gray text-sm">
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                className="flex-1 bg-ssdp-teal py-3 rounded-xl items-center active:opacity-80"
                onPress={handleSubmit}
                disabled={submitting || !summary.trim()}
              >
                {submitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="font-montserrat text-white text-sm uppercase">
                    Submit
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        )}

        {/* Past reports */}
        {reports.length > 0 && (
          <View>
            <Text className="font-montserrat text-ssdp-navy text-sm uppercase mb-3">
              Your Reports
            </Text>
            {reports.map((report) => {
              const typeInfo = REPORT_TYPES.find((t) => t.value === report.report_type);
              return (
                <View
                  key={report.id}
                  className="bg-white rounded-xl p-4 mb-2"
                  style={{ elevation: 1 }}
                >
                  <View className="flex-row items-center mb-2">
                    <FontAwesome
                      name={typeInfo?.icon ?? 'pencil'}
                      size={14}
                      color={brand.blue}
                    />
                    <Text className="font-opensans-semibold text-ssdp-navy text-sm ml-2 flex-1">
                      {typeInfo?.label ?? report.report_type}
                    </Text>
                    <Text className="font-opensans text-ssdp-orange text-xs">
                      +{report.points_earned} pts
                    </Text>
                  </View>
                  {report.contact_name && (
                    <Text className="font-opensans text-ssdp-gray text-xs mb-1">
                      Contact: {report.contact_name}
                    </Text>
                  )}
                  <Text className="font-opensans text-ssdp-gray text-sm" numberOfLines={3}>
                    {report.summary}
                  </Text>
                  <Text className="font-opensans text-gray-400 text-xs mt-2">
                    {new Date(report.created_at).toLocaleDateString()}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {reports.length === 0 && !showForm && (
          <View className="items-center py-8">
            <FontAwesome name="file-text-o" size={32} color={brand.gray} />
            <Text className="font-opensans text-ssdp-gray text-sm mt-3 text-center">
              No reports yet. Submit your first activity report to earn points!
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
