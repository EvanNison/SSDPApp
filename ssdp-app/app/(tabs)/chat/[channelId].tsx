import { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/stores/useStore';
import { brand } from '@/constants/Colors';
import type { ChatMessage, ChatChannel } from '@/types/database';

interface MessageWithProfile extends ChatMessage {
  profiles?: { full_name: string | null; avatar_url: string | null };
}

export default function ChatRoomScreen() {
  const { channelId } = useLocalSearchParams<{ channelId: string }>();
  const profile = useStore((s) => s.profile);
  const [channel, setChannel] = useState<ChatChannel | null>(null);
  const [messages, setMessages] = useState<MessageWithProfile[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!channelId) return;

    // Fetch channel info
    supabase
      .from('chat_channels')
      .select('*')
      .eq('id', channelId)
      .single()
      .then(({ data }) => {
        if (data) setChannel(data);
      });

    // Fetch initial messages
    supabase
      .from('chat_messages')
      .select('*, profiles(full_name, avatar_url)')
      .eq('channel_id', channelId)
      .order('created_at', { ascending: true })
      .limit(50)
      .then(({ data }) => {
        if (data) setMessages(data as MessageWithProfile[]);
        setLoading(false);
      });

    // Subscribe to realtime messages
    const subscription = supabase
      .channel(`chat-${channelId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `channel_id=eq.${channelId}`,
        },
        async (payload) => {
          const { data: msg } = await supabase
            .from('chat_messages')
            .select('*, profiles(full_name, avatar_url)')
            .eq('id', payload.new.id)
            .single();
          if (msg) {
            setMessages((prev) => [...prev, msg as MessageWithProfile]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [channelId]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !profile?.id || !channelId) return;

    const text = newMessage.trim();
    setNewMessage('');

    await supabase.from('chat_messages').insert({
      channel_id: channelId,
      user_id: profile.id,
      content: text,
    });
  };

  const renderMessage = ({ item }: { item: MessageWithProfile }) => {
    const isOwnMessage = item.user_id === profile?.id;
    const senderName = item.profiles?.full_name || 'Anonymous';

    return (
      <View className={`px-4 mb-3 ${isOwnMessage ? 'items-end' : 'items-start'}`}>
        {!isOwnMessage && (
          <Text className="font-opensans-semibold text-ssdp-gray text-xs mb-1 ml-1">
            {senderName}
          </Text>
        )}
        <View
          className={`rounded-2xl px-4 py-3 max-w-[80%] ${isOwnMessage ? 'bg-ssdp-blue' : 'bg-white'}`}
          style={{ elevation: 1 }}
        >
          <Text
            className={`font-opensans text-sm ${isOwnMessage ? 'text-white' : 'text-ssdp-navy'}`}
          >
            {item.content}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <>
      <Stack.Screen options={{ title: channel?.name ?? 'Chat' }} />
      <KeyboardAvoidingView
        className="flex-1 bg-gray-50"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={brand.blue} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingVertical: 16 }}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            ListEmptyComponent={
              <View className="items-center justify-center py-20">
                <Text className="font-opensans text-ssdp-gray">
                  No messages yet. Start the conversation!
                </Text>
              </View>
            }
          />
        )}

        {/* Message input */}
        <View className="border-t border-gray-200 bg-white px-4 py-3 flex-row items-center">
          <TextInput
            className="flex-1 bg-gray-100 rounded-full px-4 py-2 font-opensans text-sm text-ssdp-navy mr-3"
            placeholder="Type a message..."
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
            maxLength={500}
          />
          <Pressable
            className={`w-10 h-10 rounded-full items-center justify-center ${newMessage.trim() ? 'bg-ssdp-blue active:opacity-80' : 'bg-gray-200'}`}
            onPress={sendMessage}
            disabled={!newMessage.trim()}
          >
            <FontAwesome name="send" size={16} color={newMessage.trim() ? '#FFFFFF' : brand.gray} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}
