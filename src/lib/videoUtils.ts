import { Kind } from "../constants";
import { PrimalNote, PrimalUser } from "../types/primal";
import { date } from "./dates";
import videoPlaceholder from "../assets/images/video_placeholder.png";

export type VideoAspectRatio = '9:16' | '16:9';

export type VideoAspectRatioInfo = {
  isVertical: boolean;
  aspectRatio: VideoAspectRatio;
  dimensions?: { width: number; height: number };
};

export type VideoItem = {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnail: string;
  duration?: string;
  publishedAt: number;
  views: number;
  likes: number;
  creator: PrimalUser;
  isLive?: boolean;
  isYoutube?: boolean;
  youtubeId?: string;
  tags?: string[];
  isShort?: boolean;
  isVertical?: boolean;
  aspectRatio?: VideoAspectRatio;
  dimensions?: { width: number; height: number };
};

export const detectVideoAspectRatio = (
  kind?: number,
  tags: string[][] = [],
  videoUrl: string = '',
  content: string = ''
): VideoAspectRatioInfo => {
  let isVertical: boolean | undefined = undefined;
  let parsedDimensions: { width: number; height: number } | undefined = undefined;

  // 1. Inspect tags for dimensions (e.g. ["dim", "1080x1920"] or aspect ratio where height > width)
  for (const tag of tags) {
    if (!tag || tag.length < 2) continue;
    const key = (tag[0] || '').toLowerCase();
    const val = (tag[1] || '').trim();

    // Direct dimension tag: ["dim", "1080x1920"] or ["dimensions", "1080x1920"] (supports whitespace e.g. 1080 x 1920)
    if (key === 'dim' || key === 'dimensions') {
      const match = val.match(/^(\d+)\s*x\s*(\d+)$/i);
      if (match) {
        const width = parseInt(match[1], 10);
        const height = parseInt(match[2], 10);
        if (width > 0 && height > 0) {
          parsedDimensions = { width, height };
          isVertical = height > width;
        }
      }
    }

    // Direct aspect ratio tag: ["aspect_ratio", "9:16"], ["aspect-ratio", "9:16"], ["r", "9:16"]
    if (key === 'aspect_ratio' || key === 'aspect-ratio' || key === 'aspectratio' || key === 'r') {
      const lowerVal = val.toLowerCase();
      if (lowerVal === '9:16' || lowerVal === '9/16' || lowerVal.includes('vertical')) {
        isVertical = true;
      } else if (lowerVal === '16:9' || lowerVal === '16/9' || lowerVal.includes('horizontal')) {
        isVertical = false;
      }
    }

    // NIP-92 imeta tag: e.g. ["imeta", "url https://... dim 1080x1920"] or ["imeta", "url ...", "dim 1080x1920"]
    if (key === 'imeta') {
      const imetaStr = tag.slice(1).join(' ');
      const dimMatch = imetaStr.match(/dim\s+(\d+)\s*x\s*(\d+)/i);
      if (dimMatch) {
        const width = parseInt(dimMatch[1], 10);
        const height = parseInt(dimMatch[2], 10);
        if (width > 0 && height > 0) {
          parsedDimensions = { width, height };
          isVertical = height > width;
        }
      }
      if (/aspect_ratio\s+9:16|aspect-ratio\s+9:16/i.test(imetaStr)) {
        isVertical = true;
      } else if (/aspect_ratio\s+16:9|aspect-ratio\s+16:9/i.test(imetaStr)) {
        isVertical = false;
      }
    }
  }

  // 2. Check for Nostr NIP-71 short-form video specification:
  // Kind 34236 (NIP-71 Addressable Short Video) or Kind 22 (NIP-71 Non-addressable Short Video)
  if (kind === Kind.ShortVideo || kind === 34236 || kind === 22) {
    return {
      isVertical: true,
      aspectRatio: '9:16',
      dimensions: parsedDimensions,
    };
  }

  // If explicit dimension or aspect ratio tags indicated vertical or horizontal:
  if (isVertical !== undefined) {
    return {
      isVertical,
      aspectRatio: isVertical ? '9:16' : '16:9',
      dimensions: parsedDimensions,
    };
  }

  // 3. YouTube Shorts detection: youtube.com/shorts/... or youtu.be/shorts/...
  if (
    (videoUrl && /(?:youtube\.com|youtu\.be)\/shorts\//i.test(videoUrl)) ||
    (content && /(?:youtube\.com|youtu\.be)\/shorts\//i.test(content))
  ) {
    return { isVertical: true, aspectRatio: '9:16', dimensions: parsedDimensions };
  }

  // 4. Default standard 16:9 layout (also covers NIP-71 Kind 34235 / Kind 21)
  return { isVertical: false, aspectRatio: '16:9', dimensions: parsedDimensions };
};

// Recognizes direct video URLs (.mp4, .webm, .mov, .m3u8, .ogg)
export const videoRegex = /(https?:\/\/[^\s"'<>]+\.(?:mp4|webm|mov|m3u8|ogg)(?:\?[^\s"'<>]*)?)/i;

// Recognizes YouTube URLs
export const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i;

// Recognizes image URLs for thumbnails
export const imageRegex = /(https?:\/\/[^\s"'<>]+\.(?:png|jpg|jpeg|webp|gif)(?:\?[^\s"'<>]*)?)/i;

export const formatDuration = (seconds?: number | string): string => {
  if (!seconds) return '';
  const sec = typeof seconds === 'string' ? parseInt(seconds, 10) : seconds;
  if (isNaN(sec) || sec <= 0) return '';

  const hrs = Math.floor(sec / 3600);
  const mins = Math.floor((sec % 3600) / 60);
  const remainingSecs = Math.floor(sec % 60);

  if (hrs > 0) {
    return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  }
  return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
};

export const formatViews = (views: number): string => {
  if (views >= 1_000_000) {
    return `${(views / 1_000_000).toFixed(1).replace(/\.0$/, '')}M views`;
  }
  if (views >= 1_000) {
    return `${(views / 1_000).toFixed(1).replace(/\.0$/, '')}K views`;
  }
  return `${views} ${views === 1 ? 'view' : 'views'}`;
};

export const extractVideoFromNote = (note: PrimalNote): VideoItem | null => {
  if (!note) return null;

  const content = note.post?.content || note.content || (note as any).msg?.content || '';
  const tags = note.post?.tags || note.tags || (note as any).msg?.tags || [];

  let videoUrl = '';
  let thumbnail = '';
  let title = '';
  let duration = '';
  let description = '';
  let isYoutube = false;
  let youtubeId = '';
  const extractedTags: string[] = [];

  // 1. Inspect tags (NIP-71 / NIP-92 / Blossom)
  for (const tag of tags) {
    const key = tag[0];
    const val = tag[1] || '';

    if (key === 'url' && !videoUrl) {
      videoUrl = val;
    } else if ((key === 'thumb' || key === 'image') && !thumbnail) {
      thumbnail = val;
    } else if (key === 'title' && !title) {
      title = val;
    } else if (key === 'summary' && !description) {
      description = val;
    } else if (key === 'duration' && !duration) {
      duration = formatDuration(val);
    } else if (key === 't') {
      extractedTags.push(val);
    } else if (key === 'imeta') {
      // parse NIP-92 imeta tag: ['imeta', 'url https://... image https://... duration 120']
      const imetaStr = tag.slice(1).join(' ');
      const urlMatch = imetaStr.match(/url\s+([^\s]+)/i);
      const imgMatch = imetaStr.match(/image\s+([^\s]+)/i);
      const durMatch = imetaStr.match(/duration\s+([^\s]+)/i);

      if (urlMatch && !videoUrl) videoUrl = urlMatch[1];
      if (imgMatch && !thumbnail) thumbnail = imgMatch[1];
      if (durMatch && !duration) duration = formatDuration(durMatch[1]);
    } else if (key === 'streaming' && !videoUrl) {
      videoUrl = val;
    }
  }

  // 2. Inspect content for video links if not in tags
  if (!videoUrl) {
    const vMatch = content.match(videoRegex);
    if (vMatch) {
      videoUrl = vMatch[1];
    } else {
      const ytMatch = content.match(youtubeRegex);
      if (ytMatch) {
        isYoutube = true;
        youtubeId = ytMatch[1];
        videoUrl = `https://www.youtube.com/watch?v=${youtubeId}`;
        if (!thumbnail) {
          thumbnail = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
        }
      }
    }
  }

  // 3. Inspect content for thumbnail image if not in tags
  if (!thumbnail) {
    const imgMatch = content.match(imageRegex);
    if (imgMatch && imgMatch[1] !== videoUrl) {
      thumbnail = imgMatch[1];
    }
  }

  // 4. Inspect YouTube from videoUrl if videoUrl was set from tags
  if (videoUrl && !isYoutube) {
    const ytMatch = videoUrl.match(youtubeRegex);
    if (ytMatch) {
      isYoutube = true;
      youtubeId = ytMatch[1];
      if (!thumbnail) {
        thumbnail = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
      }
    }
  }

  // If no video found, this note is not a video
  if (!videoUrl) {
    return null;
  }

  // 5. Clean up title
  if (!title) {
    // Strip URLs from content to generate a clean title
    const cleanLines = content
      .replace(videoRegex, '')
      .replace(youtubeRegex, '')
      .replace(imageRegex, '')
      .replace(/#\w+/g, '')
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    if (cleanLines.length > 0) {
      title = cleanLines[0].slice(0, 85);
      if (cleanLines[0].length > 85) title += '...';
    } else {
      title = 'Nostr Video Broadcast';
    }
  }

  // 6. Clean up description
  if (!description) {
    description = content
      .replace(videoRegex, '')
      .replace(youtubeRegex, '')
      .trim();
  }

  // Default fallback thumbnail if still missing
  if (!thumbnail) {
    thumbnail = videoPlaceholder;
  }

  const views = Math.max((note.post?.likes || 0) * 8 + (note.post?.replies || 0) * 14 + 42, note.post?.score || 120);

  const kind =
    note.post?.kind ??
    (note as any).msg?.kind ??
    (note as any).kind ??
    (note as any).event?.kind;

  const { isVertical, aspectRatio, dimensions } = detectVideoAspectRatio(kind, tags, videoUrl, content);

  return {
    id: note.id || note.noteId || note.noteIdShort,
    title,
    description: description || 'No description provided.',
    videoUrl,
    thumbnail,
    duration: duration || '3:45',
    publishedAt: note.post?.created_at || Math.floor(Date.now() / 1000),
    views,
    likes: note.post?.likes || 0,
    creator: note.user || {
      pubkey: note.pubkey || 'unknown',
      npub: note.user?.npub || '',
      name: note.user?.name || 'Nostr Creator',
      picture: note.user?.picture || '',
      nip05: note.user?.nip05 || '',
    },
    isYoutube,
    youtubeId,
    tags: extractedTags,
    isShort: isVertical,
    isVertical,
    aspectRatio,
    dimensions,
  };
};

// Curated high quality Nostr & open-source video feed items for instant preview & demonstration
export const FEATURED_VIDEOS: VideoItem[] = [
  {
    id: 'notube-featured-1',
    title: 'Nostr: The Protocol of Freedom and Uncensorable Media',
    description: 'An architectural exploration of Nostr protocols, decentralized relays, Blossom media distribution, and peer-to-peer social computing.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    duration: '9:56',
    publishedAt: Math.floor(Date.now() / 1000) - 3600 * 24 * 2,
    views: 14820,
    likes: 1240,
    isVertical: false,
    aspectRatio: '16:9',
    creator: {
      pubkey: 'npub1dergigi2024notubecreator897654321fedcba',
      npub: 'npub1dergigi',
      name: 'Der Gigi',
      displayName: 'Der Gigi',
      picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      nip05: 'gigi@dergigi.com',
      about: 'Author of 21 Lessons. Exploring decentralized protocols.',
    },
    tags: ['Nostr', 'OpenProtocols', 'Technology', 'Freedom'],
  },
  {
    id: 'notube-featured-2',
    title: 'Building Decentralized Video Platforms on NIP-71 & Blossom',
    description: 'How Blossom servers and NIP-71 specifications enable censorship-resistant video publishing across independent relays without centralized gatekeepers.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=80',
    duration: '14:22',
    publishedAt: Math.floor(Date.now() / 1000) - 3600 * 24 * 4,
    views: 8930,
    likes: 742,
    isVertical: false,
    aspectRatio: '16:9',
    creator: {
      pubkey: 'npub1jack2024notubecreator897654321fedcba',
      npub: 'npub1jack',
      name: 'Jack',
      displayName: 'Jack Dorsey',
      picture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
      nip05: 'jack@cash.app',
      about: 'Open protocols, open source, peer to peer.',
    },
    tags: ['Blossom', 'Development', 'NIP71', 'Architecture'],
  },
  {
    id: 'notube-featured-3',
    title: 'The Art of Simplicity: Designing with Anthropic Principles',
    description: 'A deep dive into warm parchment palettes, restrained typography, and functional minimalism in modern software design.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
    duration: '8:15',
    publishedAt: Math.floor(Date.now() / 1000) - 3600 * 12,
    views: 5320,
    likes: 489,
    isVertical: false,
    aspectRatio: '16:9',
    creator: {
      pubkey: 'npub1designernotube2024creator897654321fedcba',
      npub: 'npub1designer',
      name: 'Elena Rostova',
      displayName: 'Elena Rostova',
      picture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
      nip05: 'elena@design.nostr',
      about: 'Lead UI/UX Designer & Typographer.',
    },
    tags: ['Design', 'Typography', 'Anthropic', 'UI'],
  },
  {
    id: 'notube-featured-4',
    title: 'Peer-to-Peer Relays & Cryptographic Identity Explained',
    description: 'Understanding public key cryptography (secp256k1), Schnorr signatures, and decentralized relays that power modern Nostr applications.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
    duration: '18:50',
    publishedAt: Math.floor(Date.now() / 1000) - 3600 * 24 * 7,
    views: 22100,
    likes: 1980,
    isVertical: false,
    aspectRatio: '16:9',
    creator: {
      pubkey: 'npub1cryptonotube2024creator897654321fedcba',
      npub: 'npub1crypto',
      name: 'Alex Rivera',
      displayName: 'Alex Rivera',
      picture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
      nip05: 'alex@nostr.tech',
      about: 'Cryptographer & systems engineer.',
    },
    tags: ['Cryptography', 'Security', 'Relays'],
  },
  {
    id: 'notube-featured-5',
    title: 'Cinematic Ambient Journey Through the Mountains',
    description: 'Relaxing high definition 4K nature exploration with atmospheric soundscapes and cinematic visual storytelling.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80',
    duration: '11:08',
    publishedAt: Math.floor(Date.now() / 1000) - 3600 * 24 * 1,
    views: 3410,
    likes: 312,
    isVertical: false,
    aspectRatio: '16:9',
    creator: {
      pubkey: 'npub1cinemanotube2024creator897654321fedcba',
      npub: 'npub1cinema',
      name: 'Wild Horizons',
      displayName: 'Wild Horizons',
      picture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
      nip05: 'media@wildhorizons.net',
      about: 'Visual artist documenting the great outdoors.',
    },
    tags: ['Nature', 'Cinematic', 'Travel'],
  },
  {
    id: 'notube-featured-6',
    title: 'TypeScript & Modern Reactive State: Building Fast Web Apps',
    description: 'Master fine-grained reactivity, component primitives, signals, and high-performance Web Worker architecture.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
    duration: '16:40',
    publishedAt: Math.floor(Date.now() / 1000) - 3600 * 24 * 5,
    views: 11400,
    likes: 950,
    isVertical: false,
    aspectRatio: '16:9',
    creator: {
      pubkey: 'npub1devnotube2024creator897654321fedcba',
      npub: 'npub1dev',
      name: 'Dev Insights',
      displayName: 'Marcus Vance',
      picture: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
      nip05: 'marcus@devinsights.io',
      about: 'Full-stack software engineer & mentor.',
    },
    tags: ['Coding', 'TypeScript', 'WebDev'],
  }
];

export const SHORTS_VIDEOS: VideoItem[] = [
  {
    id: 'notube-short-1',
    title: 'How Nostr Relays Work Under The Hood ⚡️',
    description: 'Decentralized websocket relays distribute messages instantly to verified pubkeys without centralized servers.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=480&auto=format&fit=crop&q=80',
    duration: '0:42',
    publishedAt: Math.floor(Date.now() / 1000) - 3600 * 6,
    views: 142000,
    likes: 12500,
    isShort: true,
    isVertical: true,
    aspectRatio: '9:16',
    dimensions: { width: 1080, height: 1920 },
    creator: {
      pubkey: 'npub1dergigi',
      name: 'Der Gigi',
      picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      nip05: 'gigi@dergigi.com'
    },
    tags: ['Nostr', 'Relays', 'Tech']
  },
  {
    id: 'notube-short-2',
    title: 'Blossom Blob Storage Protocol in 30 Seconds 🌸',
    description: 'Blossom servers provide cryptographic, content-addressed media hosting on Nostr.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=480&auto=format&fit=crop&q=80',
    duration: '0:31',
    publishedAt: Math.floor(Date.now() / 1000) - 3600 * 14,
    views: 89000,
    likes: 7400,
    isShort: true,
    isVertical: true,
    aspectRatio: '9:16',
    dimensions: { width: 1080, height: 1920 },
    creator: {
      pubkey: 'npub1jack',
      name: 'Jack Dorsey',
      picture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      nip05: 'jack@cash.app'
    },
    tags: ['Blossom', 'Storage', 'Shorts']
  },
  {
    id: 'notube-short-3',
    title: 'Decentralized Video on NOTUBE is Sovereign 🔥',
    description: 'No algorithmic suppression, no shadowbans. Pure peer-to-peer creator freedom.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=480&auto=format&fit=crop&q=80',
    duration: '0:55',
    publishedAt: Math.floor(Date.now() / 1000) - 3600 * 20,
    views: 265000,
    likes: 24000,
    isShort: true,
    isVertical: true,
    aspectRatio: '9:16',
    dimensions: { width: 1080, height: 1920 },
    creator: {
      pubkey: 'npub1notube',
      name: 'NOTUBE Team',
      picture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
      nip05: 'team@notube.org'
    },
    tags: ['NOTUBE', 'Sovereignty', 'Web3']
  },
  {
    id: 'notube-short-4',
    title: 'Why Lightning Micropayments Change Everything ⚡️',
    description: 'Streaming satoshis per second directly from viewer to creator with zero middleman fees.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=480&auto=format&fit=crop&q=80',
    duration: '0:48',
    publishedAt: Math.floor(Date.now() / 1000) - 3600 * 30,
    views: 118000,
    likes: 9200,
    isShort: true,
    isVertical: true,
    aspectRatio: '9:16',
    dimensions: { width: 1080, height: 1920 },
    creator: {
      pubkey: 'npub1crypto',
      name: 'Alex Rivera',
      picture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
      nip05: 'alex@nostr.tech'
    },
    tags: ['Bitcoin', 'Lightning', 'Payments']
  },
  {
    id: 'notube-short-5',
    title: 'SolidJS Fine-Grained Reactivity Explained',
    description: 'Why SolidJS out-performs virtual DOM frameworks with direct DOM reconciliation.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=480&auto=format&fit=crop&q=80',
    duration: '0:38',
    publishedAt: Math.floor(Date.now() / 1000) - 3600 * 48,
    views: 74000,
    likes: 6100,
    isShort: true,
    isVertical: true,
    aspectRatio: '9:16',
    dimensions: { width: 1080, height: 1920 },
    creator: {
      pubkey: 'npub1dev',
      name: 'Marcus Vance',
      picture: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
      nip05: 'marcus@devinsights.io'
    },
    tags: ['SolidJS', 'Coding', 'Dev']
  }
];

// In-memory or localStorage cache for newly published videos so they immediately appear in the feed
const PUBLISHED_VIDEOS_KEY = 'notube_published_videos';

export const getStoredPublishedVideos = (): VideoItem[] => {
  try {
    const raw = localStorage.getItem(PUBLISHED_VIDEOS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const savePublishedVideo = (video: VideoItem): void => {
  try {
    const current = getStoredPublishedVideos();
    const updated = [video, ...current.filter(v => v.id !== video.id)];
    localStorage.setItem(PUBLISHED_VIDEOS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save published video:', e);
  }
};
