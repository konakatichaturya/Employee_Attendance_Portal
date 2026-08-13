import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, type Theme } from '../../theme/ThemeContext';
import { useAppSelector } from '../../store/hooks';
import { useLeaveBalances, useLeaveRequests } from '../../hooks/useLeaveQueries';
import { useLeaveAssistant } from '../../hooks/useAskAi';
import type { LeaveBalance, LeaveRequest } from '../../types';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function buildSummary(firstName: string, balances: LeaveBalance[], requests: LeaveRequest[]): string {
  if (balances.length === 0 && requests.length === 0) {
    return `Hi ${firstName}! I don't see any leave data for you yet — once you apply for leave, I'll be able to show your balance and request status here.`;
  }

  const lines: string[] = [`Hi ${firstName}! Here's your leave snapshot:`];

  if (balances.length > 0) {
    lines.push('', 'Balance remaining:');
    balances.forEach((b) => lines.push(`• ${b.type}: ${b.total - b.used}/${b.total} days`));
  }

  if (requests.length > 0) {
    const pending = requests.filter((r) => r.status === 'Pending').length;
    const approved = requests.filter((r) => r.status === 'Approved').length;
    const rejected = requests.filter((r) => r.status === 'Rejected').length;
    lines.push('', `Requests: ${requests.length} total — ${approved} approved, ${pending} pending, ${rejected} rejected.`);
    lines.push('', 'Recent:');
    requests
      .slice(0, 4)
      .forEach((r) => lines.push(`• ${r.type}, ${formatDate(r.fromDate)} – ${formatDate(r.toDate)}: ${r.status}`));
  } else {
    lines.push('', "You haven't applied for any leave yet.");
  }

  lines.push('', 'Ask me anything else — like "how many sick days do I have left?".');
  return lines.join('\n');
}

// Native counterpart to the web dashboard's floating Leave Assistant — same
// data-driven summary-on-open behavior and the same rule-based Q&A engine
// (useLeaveAssistant), presented as a bottom-sheet modal instead of a
// viewport-pinned web widget.
export function NativeLeaveAssistant() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = React.useMemo(() => createStyles(theme, insets.bottom), [theme, insets.bottom]);
  const employee = useAppSelector((s) => s.auth.employee);
  const balancesQuery = useLeaveBalances();
  const requestsQuery = useLeaveRequests();
  const assistantMutation = useLeaveAssistant();

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const summarized = useRef(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (summarized.current) return;
    if (balancesQuery.isLoading || requestsQuery.isLoading) return;
    summarized.current = true;
    const firstName = employee?.name?.split(' ')[0] ?? 'there';
    setMessages([
      { id: 'summary', role: 'assistant', text: buildSummary(firstName, balancesQuery.data ?? [], requestsQuery.data ?? []) },
    ]);
  }, [balancesQuery.isLoading, requestsQuery.isLoading, balancesQuery.data, requestsQuery.data, employee?.name]);

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

  return (
    <>
      <Pressable onPress={() => setOpen(true)} style={styles.fab} accessibilityRole="button" accessibilityLabel="Open leave assistant">
        <MaterialCommunityIcons name="creation" size={24} color={theme.colors.onPrimary} />
      </Pressable>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <View style={styles.backdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setOpen(false)} accessibilityElementsHidden />

          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.sheetWrapper}>
            <View style={styles.sheet}>
              <View style={styles.sheetHandle} />
              <View style={styles.header}>
                <View style={styles.headerTitleRow}>
                  <MaterialCommunityIcons name="creation" size={18} color={theme.colors.primary} />
                  <Text style={styles.headerTitle}>Leave Assistant</Text>
                </View>
                <Pressable onPress={() => setOpen(false)} accessibilityRole="button" accessibilityLabel="Close leave assistant">
                  <MaterialCommunityIcons name="close" size={22} color={theme.colors.textMuted} />
                </Pressable>
              </View>

              <ScrollView
                ref={scrollRef}
                style={styles.messages}
                contentContainerStyle={styles.messagesContent}
                onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
              >
                {messages.map((m) => (
                  <View key={m.id} style={[styles.bubble, m.role === 'user' ? styles.bubbleUser : styles.bubbleAssistant]}>
                    <Text style={m.role === 'user' ? styles.bubbleUserText : styles.bubbleAssistantText}>{m.text}</Text>
                  </View>
                ))}
                {(assistantMutation.isPending || (!summarized.current && (balancesQuery.isLoading || requestsQuery.isLoading))) && (
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
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </>
  );
}

function createStyles(theme: Theme, bottomInset: number) {
  return StyleSheet.create({
    fab: {
      position: 'absolute',
      bottom: 24 + bottomInset,
      right: 20,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      ...theme.elevation.lg,
    },
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.4)',
      justifyContent: 'flex-end',
    },
    sheetWrapper: {
      width: '100%',
    },
    sheet: {
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: theme.radius.xl,
      borderTopRightRadius: theme.radius.xl,
      height: '72%',
      paddingBottom: 8 + bottomInset,
    },
    sheetHandle: {
      alignSelf: 'center',
      width: 36,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.colors.border,
      marginTop: 10,
      marginBottom: 4,
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
      padding: theme.spacing.md,
      gap: 8,
    },
    bubble: {
      maxWidth: '85%',
      borderRadius: theme.radius.md,
      paddingHorizontal: 12,
      paddingVertical: 10,
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
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    sendButton: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sendButtonDisabled: {
      opacity: 0.5,
    },
  });
}
