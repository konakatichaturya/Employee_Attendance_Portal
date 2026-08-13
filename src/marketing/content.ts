import type { MaterialCommunityIcons } from '@expo/vector-icons';

export type HeroVariant = 'attendance' | 'leave' | 'calendar';

export interface HeroSlide {
  variant: HeroVariant;
  headline: string;
  subheadline: string;
  ctaLabel: string;
}

export const NAV_LINKS = ['Attendance', 'Leave', 'Calendar', 'Teams'] as const;

export const ANNOUNCEMENT = "New: company holidays & meetings calendar — see what's new.";

export const HERO_SLIDES: HeroSlide[] = [
  {
    variant: 'attendance',
    headline: 'Attendance, made effortless.',
    subheadline: 'One tap to check in or out, with location verified automatically — no spreadsheets, no guesswork.',
    ctaLabel: 'Get Started',
  },
  {
    variant: 'leave',
    headline: 'Leave requests, streamlined.',
    subheadline: 'Employees apply, managers approve — balances update instantly and everyone stays in sync.',
    ctaLabel: 'Get Started',
  },
  {
    variant: 'calendar',
    headline: 'Every holiday and meeting, in view.',
    subheadline: "A shared company calendar so nobody's caught off guard by a holiday or a missed sync.",
    ctaLabel: 'Get Started',
  },
];

export interface FeatureItem {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  /** Optional card background photo — see public/images/NOTICE.md for source/license. */
  bgImage?: string;
}

export const FEATURES: FeatureItem[] = [
  { icon: 'fingerprint', label: 'Attendance Tracking', bgImage: '/images/feature-attendance.jpg' },
  { icon: 'calendar-clock-outline', label: 'Leave Management', bgImage: '/images/feature-leave.jpg' },
  { icon: 'calendar-month-outline', label: 'Company Calendar', bgImage: '/images/feature-calendar.jpg' },
  { icon: 'account-group-outline', label: 'Team & Reporting Lines', bgImage: '/images/feature-team.jpg' },
  { icon: 'map-marker-check-outline', label: 'Location Verification', bgImage: '/images/feature-location.jpg' },
  { icon: 'clipboard-check-outline', label: 'Approvals', bgImage: '/images/feature-approvals.jpg' },
];

export interface FooterColumn {
  heading: string;
  links: string[];
}

// Decorative only, like NAV_LINKS above — there are no real destination pages
// behind these, so the footer renders them as plain (non-navigating) text.
export const FOOTER_COLUMNS: FooterColumn[] = [
  { heading: 'Product', links: ['Attendance Tracking', 'Leave Management', 'Company Calendar', 'Approvals'] },
  { heading: 'Company', links: ['About', 'Careers', 'Contact', 'Blog'] },
  { heading: 'Resources', links: ['Help Center', 'FAQs', 'Support', 'Status'] },
  { heading: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'Security'] },
];

export const SOCIAL_ICONS: (keyof typeof MaterialCommunityIcons.glyphMap)[] = [
  'twitter',
  'linkedin',
  'facebook',
  'instagram',
  'youtube',
];
