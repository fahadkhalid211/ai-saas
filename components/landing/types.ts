import { LandingPageConfig } from '@/lib/landing/types';

export interface IndustryTemplateProps {
  config: LandingPageConfig;
  isDark: boolean;
  currentTheme?: {
    accentBg?: string;
    accentHoverBg?: string;
    accentText?: string;
    accentBorder?: string;
    badgeBg?: string;
    lightBg?: string;
    btnBg?: string;
    btnHoverBg?: string;
    btnText?: string;
    selectionBg?: string;
    bg?: string;
    text?: string;
    border?: string;
    subtext?: string;
    cardBg?: string;
    cardBorder?: string;
    pillBg?: string;
    pillText?: string;
    [key: string]: any;
  };
  onOpenBooking: (serviceId?: string) => void;
  onOpenChat: () => void;
  chatMessagesCount?: number;
}
