import { useMutation } from '@tanstack/react-query';
import {
  askLeaveAssistant,
  improveLeaveReason,
  recommendLeaveDecision,
  summarizeAttendanceInsights,
} from '../services/ai/aiFeatures';
import type { LeaveType } from '../types';

export function useImproveLeaveReason() {
  return useMutation({
    mutationFn: ({ type, reason }: { type: LeaveType; reason: string }) => improveLeaveReason(type, reason),
  });
}

export function useLeaveAssistant() {
  return useMutation({
    mutationFn: (params: { question: string; context: Parameters<typeof askLeaveAssistant>[1] }) =>
      askLeaveAssistant(params.question, params.context),
  });
}

export function useAttendanceInsights() {
  return useMutation({
    mutationFn: (input: Parameters<typeof summarizeAttendanceInsights>[0]) => summarizeAttendanceInsights(input),
  });
}

export function useApprovalRecommendation() {
  return useMutation({
    mutationFn: (input: Parameters<typeof recommendLeaveDecision>[0]) => recommendLeaveDecision(input),
  });
}
