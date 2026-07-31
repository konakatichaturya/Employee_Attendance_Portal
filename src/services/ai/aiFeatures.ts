import type { LeaveBalance, LeaveRequest, LeaveType } from '../../types';

// These "AI" features are simulated with deterministic, rule-based logic rather
// than a real LLM call - no API key or backend required. Each function still
// returns a Promise (with a short artificial delay) so the UI/loading states
// behave the same as a real network-backed AI call would.
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const LEAVE_OPENINGS: Record<LeaveType, string> = {
  Casual: 'I would like to request casual leave.',
  Sick: 'I am feeling unwell and need to take sick leave to recover.',
  Earned: 'I would like to use my earned leave for planned time off.',
  Unpaid: 'I would like to request unpaid leave due to personal circumstances.',
};

const LEAVE_CLOSINGS: Record<LeaveType, string> = {
  Casual: 'I will make sure my work is handed over before I take this time off.',
  Sick: 'I will keep my manager updated and return as soon as I am fit to work.',
  Earned: 'I will complete my pending tasks and ensure a smooth handover beforehand.',
  Unpaid: 'I appreciate your understanding and will be reachable for anything urgent if needed.',
};

export async function improveLeaveReason(type: LeaveType, reason: string): Promise<string> {
  await sleep(500);

  const cleaned = reason.trim().replace(/\s+/g, ' ');
  if (!cleaned) {
    return `${LEAVE_OPENINGS[type]} ${LEAVE_CLOSINGS[type]}`;
  }

  const capitalized = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  const withPeriod = /[.!?]$/.test(capitalized) ? capitalized : `${capitalized}.`;
  return `${withPeriod} ${LEAVE_CLOSINGS[type]}`;
}

interface LeaveAssistantContext {
  employeeName?: string;
  balances: LeaveBalance[];
  requests: LeaveRequest[];
}

function formatBalance(b: LeaveBalance): string {
  return `${b.type}: ${b.total - b.used} of ${b.total} day(s) remaining (${b.used} used)`;
}

export async function askLeaveAssistant(question: string, context: LeaveAssistantContext): Promise<string> {
  await sleep(500);
  const q = question.toLowerCase();
  const { balances, requests } = context;
  const firstName = context.employeeName?.split(' ')[0] ?? 'there';

  const typeMatch = (['casual', 'sick', 'earned', 'unpaid'] as const).find((t) => q.includes(t));
  if (typeMatch) {
    const balance = balances.find((b) => b.type.toLowerCase() === typeMatch);
    if (balance) return `You have ${balance.total - balance.used} ${balance.type} day(s) remaining out of ${balance.total} (${balance.used} used so far).`;
  }

  if (/(balance|remaining|left|how many days)/.test(q)) {
    if (balances.length === 0) return "I don't see any leave balance data for you yet.";
    return `Here's your current balance — ${balances.map(formatBalance).join('; ')}.`;
  }

  if (/(pending|status|waiting|awaiting|progress)/.test(q)) {
    const pending = requests.filter((r) => r.status === 'Pending');
    if (pending.length === 0) return "You don't have any leave requests currently pending approval.";
    return `You have ${pending.length} request(s) in progress: ${pending
      .map((r) => `${r.type} leave ${r.fromDate} to ${r.toDate} (${r.status})`)
      .join('; ')}.`;
  }

  if (/(history|recent|last|previous)/.test(q)) {
    if (requests.length === 0) return "You haven't applied for any leave yet.";
    return `Your most recent requests: ${requests
      .slice(0, 3)
      .map((r) => `${r.type} leave ${r.fromDate} to ${r.toDate} - ${r.status}`)
      .join('; ')}.`;
  }

  if (/(apply|request|how do i|how to)/.test(q)) {
    return "To apply, go to the Apply Leave tab, choose a leave type, pick your from and to dates, add a brief reason, and submit. It'll route to your team lead and then your manager for approval.";
  }

  if (/(hi|hello|hey)/.test(q)) {
    return `Hi ${firstName}! Ask me about your leave balance, pending requests, or how to apply.`;
  }

  if (balances.length > 0) {
    return `I can help with your leave balance and requests. Right now you have ${balances
      .map(formatBalance)
      .join('; ')}. Try asking "how many sick days do I have left?" or "what's pending?".`;
  }
  return 'I can help answer questions about your leave balance, request status, and how to apply. Try asking something like "how many casual days do I have left?".';
}

interface AttendanceInsightsInput {
  presentRate: number;
  presentToday: number;
  absentToday: number;
  lateToday: number;
  onLeaveToday: number;
  totalEmployees: number;
  departmentBreakdown: { department: string; employeeCount: number; presentRate: number }[];
}

export async function summarizeAttendanceInsights(input: AttendanceInsightsInput): Promise<string> {
  await sleep(500);
  if (input.totalEmployees === 0) return 'No employee data yet — insights will appear once people register.';

  const parts: string[] = [];

  if (input.presentRate >= 90) {
    parts.push(`Attendance is strong today at ${input.presentRate}% present.`);
  } else if (input.presentRate >= 75) {
    parts.push(`Attendance is reasonable today at ${input.presentRate}% present, with some room for improvement.`);
  } else {
    parts.push(`Attendance is low today at only ${input.presentRate}% present — worth investigating.`);
  }

  if (input.lateToday > 0) {
    const lateRate = Math.round((input.lateToday / input.totalEmployees) * 100);
    parts.push(`${input.lateToday} employee(s) (${lateRate}%) checked in late.`);
  }

  if (input.onLeaveToday > 0) {
    parts.push(`${input.onLeaveToday} employee(s) are on approved leave today.`);
  }

  if (input.absentToday > 0) {
    parts.push(`${input.absentToday} employee(s) have not checked in and are marked absent.`);
  }

  if (input.departmentBreakdown.length > 1) {
    const sorted = [...input.departmentBreakdown].sort((a, b) => b.presentRate - a.presentRate);
    const best = sorted[0];
    const worst = sorted[sorted.length - 1];
    if (best.department !== worst.department) {
      parts.push(
        `${best.department} leads with ${best.presentRate}% present, while ${worst.department} is lowest at ${worst.presentRate}% and may need attention.`,
      );
    }
  }

  return parts.join(' ');
}

interface ApprovalRecommendationInput {
  request: Pick<LeaveRequest, 'type' | 'fromDate' | 'toDate' | 'reason' | 'days'>;
  employeeName: string;
  recentRequests: Pick<LeaveRequest, 'type' | 'fromDate' | 'toDate' | 'status'>[];
}

export async function recommendLeaveDecision(input: ApprovalRecommendationInput): Promise<string> {
  await sleep(400);
  const signals: string[] = [];

  if (input.request.days >= 5) {
    signals.push(`this is an extended request (${input.request.days} days) — confirm coverage is arranged`);
  }

  if (input.request.reason.trim().length < 15) {
    signals.push('the stated reason is quite brief');
  }

  const sameTypeRecentCount = input.recentRequests.filter((r) => r.type === input.request.type).length;
  if (sameTypeRecentCount >= 2) {
    signals.push(`this employee has ${sameTypeRecentCount} other recent ${input.request.type} leave request(s)`);
  }

  const noticeDays = Math.round(
    (new Date(input.request.fromDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
  );
  if (noticeDays >= 0 && noticeDays < 2 && input.request.type !== 'Sick') {
    signals.push('this is short-notice (less than 2 days ahead)');
  }

  if (signals.length === 0) {
    return 'Looks routine — no concerns detected based on the request and recent history.';
  }
  return `Worth a second look: ${signals.join('; ')}.`;
}
