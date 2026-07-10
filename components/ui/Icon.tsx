import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { title?: string };

const base = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

export function IconPhone(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M2.5 5.5c0-1 .8-2 2-2h2.2c.5 0 .9.3 1 .8l.9 3.2c.1.4 0 .9-.4 1.2l-1.5 1.2a13 13 0 0 0 5.9 5.9l1.2-1.5c.3-.4.8-.5 1.2-.4l3.2.9c.5.1.8.5.8 1V19c0 1.1-1 2-2 2A16.5 16.5 0 0 1 2.5 5.5Z" />
    </svg>
  );
}

export function IconVideo(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <rect x="2.5" y="6" width="13" height="12" rx="2.5" />
      <path d="M15.5 10.5 21 7.5v9l-5.5-3" />
    </svg>
  );
}

export function IconShieldCheck(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M12 3 5 6v5.5c0 4.3 3 7.4 7 9 4-1.6 7-4.7 7-9V6l-7-3Z" />
      <path d="m9 11.5 2 2 4-4" />
    </svg>
  );
}

export function IconBrain(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M12 5.5a2.5 2.5 0 0 0-4.9-.7A2.6 2.6 0 0 0 4.5 9a2.6 2.6 0 0 0-.4 4.6A2.6 2.6 0 0 0 7 18a2.5 2.5 0 0 0 5 .3Z" />
      <path d="M12 5.5a2.5 2.5 0 0 1 4.9-.7A2.6 2.6 0 0 1 19.5 9a2.6 2.6 0 0 1 .4 4.6A2.6 2.6 0 0 1 17 18a2.5 2.5 0 0 1-5 .3Z" />
      <path d="M12 5.5v13" />
    </svg>
  );
}

export function IconHeartHand(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M11.5 8.6c-1-2.3-4.5-2.1-4.5.7 0 2 3 4 4.5 5 1.5-1 4.5-3 4.5-5 0-2.8-3.5-3-4.5-.7Z" />
      <path d="M4 14v5.5h9.5c1 0 3.5-1 5-2.5l2-2c.8-.8-.3-2.1-1.3-1.5l-2.7 1.6" />
    </svg>
  );
}

export function IconClock(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  );
}

export function IconHome(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M4 10.5 12 4l8 6.5" />
      <path d="M6 9.5V20h12V9.5" />
      <path d="M10 20v-5h4v5" />
    </svg>
  );
}

export function IconChat(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M4 5.5h16v10H9l-4 3.5v-3.5H4Z" />
      <path d="M8.5 10h7M8.5 12.5h4.5" />
    </svg>
  );
}

export function IconClipboard(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <rect x="5.5" y="4.5" width="13" height="16" rx="2" />
      <path d="M9 4.5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 4.5v1H9Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export function IconUsers(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <circle cx="9" cy="8.5" r="3" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
      <path d="M16 6.2a3 3 0 0 1 0 5.6M17.5 19a5.5 5.5 0 0 0-2.3-4.5" />
    </svg>
  );
}

export function IconLeaf(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M20 4C10 4 5 9 5 16c0 1.5.3 2.7.8 3.8" />
      <path d="M20 4c0 9-4 14-11 14M20 4c-.5 6-3 9-7 11" />
    </svg>
  );
}

export function IconStar(p: IconProps) {
  return (
    <svg {...base} {...p} fill="currentColor" stroke="none">
      <path d="m12 3 2.6 5.3 5.9.9-4.2 4.1 1 5.8L12 16.9 6.7 19.6l1-5.8-4.2-4.1 5.9-.9Z" />
    </svg>
  );
}

export function IconLock(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <rect x="5" y="10.5" width="14" height="9.5" rx="2" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
      <path d="M12 14v2.5" />
    </svg>
  );
}

export function IconMapPin(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M12 21c4-4 7-7.4 7-11a7 7 0 1 0-14 0c0 3.6 3 7 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

export function IconMail(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 6.5 8.5 6 8.5-6" />
    </svg>
  );
}

export function IconArrowRight(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M4 12h15M13 6l6 6-6 6" />
    </svg>
  );
}

export function IconArrowLeft(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M20 12H5M11 6l-6 6 6 6" />
    </svg>
  );
}

export function IconChevronDown(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function IconCheck(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="m5 12.5 4.5 4.5L19 6.5" />
    </svg>
  );
}

export function IconMenu(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function IconClose(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

export function IconSparkle(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M12 4v4M12 16v4M4 12h4M16 12h4" />
      <path d="M12 8a4 4 0 0 0 4 4 4 4 0 0 0-4 4 4 4 0 0 0-4-4 4 4 0 0 0 4-4Z" fill="currentColor" stroke="none" />
    </svg>
  );
}
