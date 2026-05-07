import {
  FaDiscord,
  FaFacebook,
  FaInstagram,
  FaTiktok,
  FaTwitch,
  FaTwitter,
  FaYoutube,
} from 'react-icons/fa';
import type {IconType} from 'react-icons';

export interface SocialLink {
  /** Short id used as React key. */
  id: string;
  /** Display label for the platform. */
  label: string;
  /** Public URL. */
  href: string;
  /** Aria label for the icon link. */
  ariaLabel: string;
  /** Icon component. */
  icon: IconType;
  /** Optional one-line description for the Community hub. */
  description?: string;
}

export const SOCIAL_LINKS: SocialLink[] = [
  {
    id: 'instagram',
    label: 'Instagram',
    href: 'https://www.instagram.com/lzxindustries',
    ariaLabel: 'LZX on Instagram',
    icon: FaInstagram,
    description: 'Patches, performances, and behind-the-scenes from the workshop.',
  },
  {
    id: 'youtube',
    label: 'YouTube',
    href: 'https://www.youtube.com/lzxindustries',
    ariaLabel: 'LZX on YouTube',
    icon: FaYoutube,
    description: 'Tutorials, product walkthroughs, and artist features.',
  },
  {
    id: 'discord',
    label: 'Discord',
    href: 'https://discord.gg/7xzD4XzhGn',
    ariaLabel: 'LZX on Discord',
    icon: FaDiscord,
    description: 'Real-time chat with artists, engineers, and the LZX team.',
  },
  {
    id: 'twitch',
    label: 'Twitch',
    href: 'https://www.twitch.tv/lzxindustries',
    ariaLabel: 'LZX on Twitch',
    icon: FaTwitch,
    description: 'Live streams of patching sessions, demos, and Q&As.',
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    href: 'https://www.tiktok.com/@lzxindustries',
    ariaLabel: 'LZX on TikTok',
    icon: FaTiktok,
    description: 'Short clips of synths in motion.',
  },
  {
    id: 'facebook',
    label: 'Facebook',
    href: 'https://www.facebook.com/lzxindustries',
    ariaLabel: 'LZX on Facebook',
    icon: FaFacebook,
    description: 'Announcements and event updates.',
  },
  {
    id: 'twitter',
    label: 'X',
    href: 'https://x.com/lzxindustries',
    ariaLabel: 'LZX on X',
    icon: FaTwitter,
    description: 'Quick news and release notes.',
  },
];

export const COMMUNITY_LINKS = {
  forum: 'https://community.lzxindustries.net',
  newsletterSignup:
    'https://lzxindustries.us11.list-manage.com/subscribe/post?u=7da8b11822c70e5b64240e14f&amp;id=352bd533b6&amp;f_id=0076a2e0f0',
  newsletterArchive:
    'https://us11.campaign-archive.com/home/?u=7da8b11822c70e5b64240e14f&id=352bd533b6',
} as const;
