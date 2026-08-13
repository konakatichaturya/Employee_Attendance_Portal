import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useAppSelector } from '../../store/hooks';
import { useLeaveBalances, useLeaveRequests } from '../../hooks/useLeaveQueries';
import { useLeaveAssistant } from '../../hooks/useAskAi';
import type { WebTheme } from '../../admin/ThemeContext';
import { vivid } from '../../marketing/vividPalette';
import type { LeaveBalance, LeaveRequest } from '../../types';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

const PUCK_SIZE = 60;
const SHELL = '#F2F4F7';
const SHELL_SHADE = '#D7DCE3';
const TEAL = '#2FD5C8';
const VISOR = '#151B2C';
const EYE_GLOW = '#5FE3FF';

function formatDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

// Builds the assistant's opening message directly from real leave data, so
// opening the chat immediately answers "what's my balance / did I get
// approved" without the employee needing to type anything first. Follow-up
// questions still go through the rule-based askLeaveAssistant engine.
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

export function LeaveAssistantChat({ theme }: { theme: WebTheme }) {
  const styles = React.useMemo(() => createStyles(theme), [theme]);
  const employee = useAppSelector((s) => s.auth.employee);
  const balancesQuery = useLeaveBalances();
  const requestsQuery = useLeaveRequests();
  const assistantMutation = useLeaveAssistant();

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const summarized = useRef(false);

  const breathe = useSharedValue(0);
  const glow = useSharedValue(0.5);
  useEffect(() => {
    breathe.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
    );
    glow.value = withRepeat(withSequence(withTiming(1, { duration: 900 }), withTiming(0.5, { duration: 900 })), -1, true);
  }, []);
  const botStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -breathe.value * 2 }, { scale: 1 + breathe.value * 0.015 }],
  }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: 0.6 + glow.value * 0.4 }));

  useEffect(() => {
    if (summarized.current) return;
    if (balancesQuery.isLoading || requestsQuery.isLoading) return;
    summarized.current = true;
    const firstName = employee?.name?.split(' ')[0] ?? 'there';
    setMessages([
      {
        id: 'summary',
        role: 'assistant',
        text: buildSummary(firstName, balancesQuery.data ?? [], requestsQuery.data ?? []),
      },
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
    <View style={styles.dock} pointerEvents="box-none">
      {open && (
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
      )}

      <Pressable onPress={() => setOpen((o) => !o)} accessibilityRole="button" accessibilityLabel="Toggle leave assistant">
        <View style={styles.puck}>
          <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
            <Defs>
              <LinearGradient id="leaveBotPuck" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor={vivid.blue} />
                <Stop offset="1" stopColor={vivid.purple} />
              </LinearGradient>
            </Defs>
            <Circle cx={PUCK_SIZE / 2} cy={PUCK_SIZE / 2} r={PUCK_SIZE / 2} fill="url(#leaveBotPuck)" />
          </Svg>
          <Animated.View style={[styles.bot, botStyle]}>
            <View style={styles.head}>
              <View style={styles.visor}>
                <Animated.View style={[styles.eye, glowStyle]} />
                <Animated.View style={[styles.eye, glowStyle]} />
              </View>
            </View>
          </Animated.View>
        </View>
      </Pressable>
    </View>
  );
}

function createStyles(theme: WebTheme) {
  return StyleSheet.create({
    dock: {
      position: 'fixed',
      bottom: 24,
      right: 24,
      alignItems: 'flex-end',
      zIndex: 60,
    } as any,
    puck: {
      width: PUCK_SIZE,
      height: PUCK_SIZE,
      borderRadius: PUCK_SIZE / 2,
      alignItems: 'center',
      justifyContent: 'center',
      ...theme.elevation.lg,
    },
    bot: {
      width: 40,
      alignItems: 'center',
    },
    head: {
      width: 38,
      height: 30,
      borderRadius: 16,
      backgroundColor: SHELL,
      borderWidth: 2,
      borderColor: SHELL_SHADE,
      alignItems: 'center',
      justifyContent: 'center',
    },
    visor: {
      width: 26,
      height: 16,
      borderRadius: 9,
      backgroundColor: VISOR,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5,
    },
    eye: {
      width: 7,
      height: 4,
      borderTopLeftRadius: 4,
      borderTopRightRadius: 4,
      backgroundColor: EYE_GLOW,
    },
    panel: {
      width: 340,
      height: 460,
      borderRadius: theme.radius.lg,
      backgroundColor: 'rgba(255,255,255,0.72)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.8)',
      overflow: 'hidden',
      marginBottom: 14,
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      ...theme.elevation.lg,
    } as any,
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(0,0,0,0.08)',
    },
    headerTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    headerTitle: {
      ...theme.typography.bodyMedium,
      color: '#16305C',
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
      backgroundColor: vivid.blue,
    },
    bubbleAssistant: {
      alignSelf: 'flex-start',
      backgroundColor: 'rgba(255,255,255,0.75)',
      borderWidth: 1,
      borderColor: 'rgba(0,0,0,0.06)',
    },
    bubbleUserText: {
      ...theme.typography.body,
      color: '#FFFFFF',
    },
    bubbleAssistantText: {
      ...theme.typography.body,
      color: '#16305C',
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      padding: theme.spacing.sm,
      borderTopWidth: 1,
      borderTopColor: 'rgba(0,0,0,0.08)',
    },
    input: {
      flex: 1,
      ...theme.typography.body,
      color: '#16305C',
      backgroundColor: 'rgba(255,255,255,0.7)',
      borderRadius: theme.radius.md,
      paddingHorizontal: 10,
      paddingVertical: 8,
    },
    sendButton: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: vivid.blue,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sendButtonDisabled: {
      opacity: 0.5,
    },
  });
}
