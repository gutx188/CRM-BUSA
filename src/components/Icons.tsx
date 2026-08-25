import type { ReactNode } from "react";

type IconProps = { className?: string };

function Svg({
  className = "w-5 h-5",
  children,
  strokeWidth = 1.8,
}: {
  className?: string;
  children: ReactNode;
  strokeWidth?: number;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export const IconShield = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
    <path d="M9 12l2 2 4-4" />
  </Svg>
);

/** Logo da Busa: gota d'água com cauda em espiral. */
export const IconBusaDroplet = ({ className = "w-full h-full" }: IconProps) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M14.5 2.6c-.4.4-6.9 6.6-6.9 11.7a6.9 6.9 0 1 0 11.1-5.5" />
    <path d="M13.7 20.9a4.1 4.1 0 1 1-2.6-7.3 2.5 2.5 0 1 1 1.6 4.5 1.1 1.1 0 1 1-.7-2" />
  </svg>
);
export const IconDashboard = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="3" width="7" height="9" rx="1.5" />
    <rect x="14" y="3" width="7" height="5" rx="1.5" />
    <rect x="14" y="12" width="7" height="9" rx="1.5" />
    <rect x="3" y="16" width="7" height="5" rx="1.5" />
  </Svg>
);
export const IconPlusAssist = (p: IconProps) => (
  <Svg {...p}>
    <path d="M10 3h7a2 2 0 0 1 2 2v3" />
    <path d="M14 21H7a2 2 0 0 1-2-2v-3" />
    <path d="M12 8v6M9 11h6" />
  </Svg>
);
export const IconListAssist = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 7l2 2 3-3" />
    <path d="M12 7h8M12 17h8" />
    <path d="M4 17l2 2 3-3" />
  </Svg>
);
export const IconCar = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11" />
    <path d="M3 16v-2a2 2 0 0 1 .6-1.4L5 11h14l1.4 1.6A2 2 0 0 1 21 14v2a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1H6v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" />
    <circle cx="7.5" cy="14.5" r="1" />
    <circle cx="16.5" cy="14.5" r="1" />
  </Svg>
);
export const IconHome = (p: IconProps) => (
  <Svg {...p}>
    <path d="m3 10 9-7 9 7" />
    <path d="M5 9v11h14V9M9 20v-6h6v6" />
  </Svg>
);
export const IconPlusCar = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 11l1.4-4.2A2 2 0 0 1 8.3 5h6.4" />
    <path d="M17 5h3v3" />
    <path d="M3 15v-1a1.8 1.8 0 0 1 .5-1.2L5 11h9" />
    <path d="M19 14l2 1v1a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1" />
    <circle cx="7.5" cy="14.5" r="1" />
  </Svg>
);
export const IconSearch = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </Svg>
);
export const IconUsers = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
    <path d="M16 5.2a3.2 3.2 0 0 1 0 5.6" />
    <path d="M17.5 19a5.5 5.5 0 0 0-3-4.9" />
  </Svg>
);
export const IconBuilding = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 21V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v16" />
    <path d="M15 9h3a2 2 0 0 1 2 2v10" />
    <path d="M7 7h4M7 11h4M7 15h4M3 21h18" />
  </Svg>
);
export const IconWrench = (p: IconProps) => (
  <Svg {...p}>
    <path d="M14.5 6.5a3.5 3.5 0 0 1 4.6 4.6l-9.6 9.6-4.6-4.6 9.6-9.6z" />
    <path d="M14.5 6.5l3-3" />
    <circle cx="6.5" cy="17.5" r="1.2" />
  </Svg>
);
export const IconHistory = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 12a9 9 0 1 0 3-6.7" />
    <path d="M3 4v4h4" />
    <path d="M12 8v4l3 2" />
  </Svg>
);
export const IconEdit = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
  </Svg>
);
export const IconTrash = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 7h16" />
    <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
    <path d="M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" />
    <path d="M10 11v6M14 11v6" />
  </Svg>
);
export const IconCheck = (p: IconProps) => (
  <Svg {...p}>
    <path d="M20 6L9 17l-5-5" />
  </Svg>
);
export const IconCheckCircle = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M8.5 12.5l2.5 2.5 4.5-5" />
  </Svg>
);
export const IconClose = (p: IconProps) => (
  <Svg {...p}>
    <path d="M18 6 6 18M6 6l12 12" />
  </Svg>
);
export const IconChevronDown = (p: IconProps) => (
  <Svg {...p}>
    <path d="m6 9 6 6 6-6" />
  </Svg>
);
export const IconChevronRight = (p: IconProps) => (
  <Svg {...p}>
    <path d="m9 6 6 6-6 6" />
  </Svg>
);
export const IconArrowLeft = (p: IconProps) => (
  <Svg {...p}>
    <path d="M19 12H5" />
    <path d="m12 19-7-7 7-7" />
  </Svg>
);
export const IconPhone = (p: IconProps) => (
  <Svg {...p}>
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2 4.2 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.5 2.1L8 9.6a16 16 0 0 0 6 6l1.1-1.1a2 2 0 0 1 2.1-.5c.9.3 1.8.5 2.7.6a2 2 0 0 1 1.7 2z" />
  </Svg>
);
export const IconCalendar = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="4" width="18" height="17" rx="2" />
    <path d="M3 9h18M8 2v4M16 2v4" />
  </Svg>
);
export const IconClock = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Svg>
);
export const IconFilter = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 5h18l-7 8v6l-4 2v-8L3 5z" />
  </Svg>
);
export const IconMenu = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </Svg>
);
export const IconBell = (p: IconProps) => (
  <Svg {...p}>
    <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.7 21a2 2 0 0 1-3.4 0" />
  </Svg>
);
export const IconUpload = (p: IconProps) => (
  <Svg {...p}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <path d="M12 16V4M7 9l5-5 5 5" />
  </Svg>
);
export const IconDoc = (p: IconProps) => (
  <Svg {...p}>
    <path d="M14 3v4a1 1 0 0 0 1 1h4" />
    <path d="M5 3h9l5 5v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
    <path d="M8 13h8M8 17h6" />
  </Svg>
);
export const IconMapPin = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z" />
    <circle cx="12" cy="10" r="2.5" />
  </Svg>
);
export const IconTrend = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 17l6-6 4 4 8-8" />
    <path d="M17 7h4v4" />
  </Svg>
);
export const IconLayers = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3l9 5-9 5-9-5 9-5z" />
    <path d="M3 13l9 5 9-5" />
  </Svg>
);
export const IconRefresh = (p: IconProps) => (
  <Svg {...p}>
    <path d="M21 12a9 9 0 1 1-3-6.7" />
    <path d="M21 4v5h-5" />
  </Svg>
);
export const IconMail = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </Svg>
);
export const IconUser = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M5 20a7 7 0 0 1 14 0" />
  </Svg>
);
export const IconKey = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="7.5" cy="15.5" r="4.5" />
    <path d="m10.5 12.5 8-8" />
    <path d="m16 5 3 3M19 4l1.5 1.5" />
  </Svg>
);
export const IconLock = (p: IconProps) => (
  <Svg {...p}>
    <rect x="4" y="10" width="16" height="11" rx="2" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
  </Svg>
);
export const IconAlert = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3 2 20h20L12 3z" />
    <path d="M12 9v5M12 17h.01" />
  </Svg>
);
export const IconInbox = (p: IconProps) => (
  <Svg {...p}>
    <path d="M22 12h-6l-2 3h-4l-2-3H2" />
    <path d="M5 12l2-7h10l2 7v6a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-6z" />
  </Svg>
);
export const IconCloud = (p: IconProps) => (
  <Svg {...p}>
    <path d="M17.5 19a4.5 4.5 0 0 0 .5-9 6 6 0 0 0-11.6-1.5A4 4 0 0 0 6.5 19h11z" />
    <path d="M9 14.5v3M12 12.5v5M15 14.5v3" />
  </Svg>
);
