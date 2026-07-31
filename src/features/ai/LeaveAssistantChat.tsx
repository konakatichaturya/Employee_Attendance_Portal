import React, { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppSelector } from '../../store/hooks';
import { useLeaveBalances, useLeaveRequests } from '../../hooks/useLeaveQueries';
import { useLeaveAssistant } from '../../hooks/useAskAi';
import type { WebTheme } from '../../admin/ThemeContext';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

export function LeaveAssistantChat({ theme }: { theme: WebTheme }) {
  const styles = React.useMemo(() => createStyles(theme), [theme]);
  const employee = useAppSelector((s) => s.auth.employee);
  const balancesQuery = useLeaveBalances();
  const requestsQuery = useLeaveRequests();
  const assistantMutation = useLeaveAssistant();

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: "Hi! I'm your leave assistant. Ask me about your leave balance, recent requests, or how to apply.",
    },
  ]);

  const send = async () => {
    const question = input.trim();
    if (!question || assistantMutation.isPending) return;
    setInput('');
    setMessages((prev) => [...prev, { id: `${Date.now()}-u`, role: 'user', text: question }]);

    try {
      const answer = await assistantMutation.mutateAsync({
        question,
        context: {
          employeeName: employee?.name,
          balances: balancesQuery.data ?? [],
          requests: requestsQuery.data ?? [],
        },
      });
      setMessages((prev) => [...prev, { id: `${Date.now()}-a`, role: 'assistant', text: answer }]);
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        { id: `${Date.now()}-e`, role: 'assistant', text: error?.message ?? 'Something went wrong. Please try again.' },
      ]);
    }
  };

  if (!open) {
    return (
      <Pressable style={styles.fab} onPress={() => setOpen(true)} accessibilityRole="button" accessibilityLabel="Open leave assistant">
        <MaterialCommunityIcons name="chat-processing-outline" size={24} color={theme.colors.onPrimary} />
      </Pressable>
    );
  }

  return (
    <View style={styles.panel}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <MaterialCommunityIcons name="creation" size={18} color={theme.colors.primary} />
          <Text style={styles.headerTitle}>Leave Assistant</Text>
        </View>
        <Pressable onPress={() => setOpen(false)} accessibilityRole="button" accessibilityLabel="Close leave assistant">
          <MaterialCommunityIcons name="close" size={20} color={theme.colors.textMuted} />
        </Pressable>
      </View>

      <ScrollView style={styles.messages} contentContainerStyle={styles.messagesContent}>
        {messages.map((m) => (
          <View key={m.id} style={[styles.bubble, m.role === 'user' ? styles.bubbleUser : styles.bubbleAssistant]}>
            <Text style={m.role === 'user' ? styles.bubbleUserText : styles.bubbleAssistantText}>{m.text}</Text>
          </View>
        ))}
        {assistantMutation.isPending && (
          <View style={[styles.bubble, styles.bubbleAssistant]}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
          </View>
        )}
      </ScrollView>

      <View style={styles.inputRow}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Ask about your leave..."
          placeholderTextColor={theme.colors.textMuted}
          style={styles.input}
          onSubmitEditing={send}
          editable={!assistantMutation.isPending}
        />
        <Pressable
          onPress={send}
          disabled={assistantMutation.isPending || !input.trim()}
          style={[styles.sendButton, !input.trim() && styles.sendButtonDisabled]}
          accessibilityRole="button"
          accessibilityLabel="Send"
        >
          <MaterialCommunityIcons name="send" size={16} color={theme.colors.onPrimary} />
        </Pressable>
      </View>
    </View>
  );
}

function createStyles(theme: WebTheme) {
  return StyleSheet.create({
    fab: {
      position: 'absolute',
      bottom: 24,
      right: 24,
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      ...theme.elevation.md,
    },
    panel: {
      position: 'absolute',
      bottom: 24,
      right: 24,
      width: 340,
      height: 460,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: 'hidden',
      ...theme.elevation.md,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    headerTitle: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textPrimary,
    },
    messages: {
      flex: 1,
    },
    messagesContent: {
      padding: theme.spacing.sm,
      gap: 8,
    },
    bubble: {
      maxWidth: '85%',
      borderRadius: theme.radius.md,
      paddingHorizontal: 10,
      paddingVertical: 8,
    },
    bubbleUser: {
      alignSelf: 'flex-end',
      backgroundColor: theme.colors.primary,
    },
    bubbleAssistant: {
      alignSelf: 'flex-start',
      backgroundColor: theme.colors.surfaceAlt,
    },
    bubbleUserText: {
      ...theme.typography.body,
      color: theme.colors.onPrimary,
    },
    bubbleAssistantText: {
      ...theme.typography.body,
      color: theme.colors.textPrimary,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      padding: theme.spacing.sm,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    input: {
      flex: 1,
      ...theme.typography.body,
      color: theme.colors.textPrimary,
      backgroundColor: theme.colors.surfaceAlt,
      borderRadius: theme.radius.md,
      paddingHorizontal: 10,
      paddingVertical: 8,
    },
    sendButton: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sendButtonDisabled: {
      opacity: 0.5,
    },
  });
}
