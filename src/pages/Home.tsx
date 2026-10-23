import {
  Component,
  createEffect,
  createMemo,
  createSignal,
  For,
  Match,
  onCleanup,
  onMount,
  Show,
  Switch
} from 'solid-js';
import { useNavigate, useSearchParams } from '@solidjs/router';
import Note from '../components/Note/Note';
import styles from './Home.module.scss';
import Paginator from '../components/Paginator/Paginator';
import { scrollWindowTo } from '../lib/scroll';
import { useHomeContext } from '../contexts/HomeContext';
import { useIntl } from '@cookbook/solid-intl';
import { createStore } from 'solid-js/store';
import { PrimalNote, PrimalUser } from '../types/primal';
import { branding } from '../translations';
import { setIsHome } from '../components/Layout/Layout';
import PageTitle from '../components/PageTitle/PageTitle';
import { useAppContext } from '../contexts/AppContext';
import FeedNoteSkeleton from '../components/Skeleton/FeedNoteSkeleton';
import { Transition } from 'solid-transition-group';
import { isPhone } from '../utils';
import { Kind } from '../constants';
import UserPoll from '../components/UserPoll/UserPoll';
import VideoCard from '../components/VideoCard/VideoCard';
import {
  extractVideoFromNote,
  FEATURED_VIDEOS,
  formatViews,
  getStoredPublishedVideos,
  VideoItem
} from '../lib/videoUtils';
import { accountStore } from '../stores/accountStore';
import { userName } from '../stores/profile';

const DEFAULT_CATEGORY_CHIPS = [
  { id: 'all', label: 'All' },
  { id: 'trending', label: 'Trending' },
  { id: 'nostr', label: 'Nostr' },
  { id: 'tech', label: 'Tech' },
  { id: 'podcasts', label: 'Podcasts' },
  { id: 'music', label: 'Music' },
  { id: 'gaming', label: 'Gaming' },
  { id: 'bitcoin', label: 'Bitcoin' },
  { id: 'education', label: 'Education' },
  { id: 'live', label: 'Live' },
  { id: 'following', label: 'Following' },
  { id: 'newest', label: 'Newest' },
];

const Home: Component = () => {
  const context = useHomeContext();
  const intl = useIntl();
  const app = useAppContext();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  let checkNewNotesTimer: number = 0;

  const [hasNewPosts, setHasNewPosts] = createSignal(false);
  const [newNotesCount, setNewNotesCount] = createSignal(0);
  const [newPostAuthors, setNewPostAuthors] = createStore<PrimalUser[]>([]);
  const [activeCategory, setActiveCategory] = createSignal('all');
  const [viewMode, setViewMode] = createSignal<'videos' | 'notes'>('videos');

  const newPostCount = () => (newNotesCount() < 100 ? newNotesCount() : 100);

  createEffect(() => {
    if (searchParams.view === 'shorts') {
      setActiveCategory('shorts');
      return;
    }
    if (searchParams.category) {
      setActiveCategory(searchParams.category);
      return;
    }
    if (!searchParams.search && !searchParams.q && !searchParams.category && !searchParams.view) {
      setActiveCategory('all');
    }
  });

  onMount(() => {
    setIsHome(true);
    scrollWindowTo(context?.scrollTop);
  });

  createEffect(() => {
    if ((context?.futureNotes.length || 0) > 99 || app?.isInactive) {
      clearInterval(checkNewNotesTimer);
      return;
    }

    const spec = context?.selectedFeed?.spec || '';

    if (checkNewNotesTimer) {
      clearInterval(checkNewNotesTimer);
      setHasNewPosts(false);
      setNewNotesCount(0);
      setNewPostAuthors(() => []);
    }

    const timeout = 25_000 + Math.random() * 10_000;

    checkNewNotesTimer = setInterval(() => {
      context?.actions.checkForNewNotes(spec);
    }, timeout);
  });

  createEffect(() => {
    const count = context?.futureNotes.length || 0;
    if (count === 0) {
      return;
    }

    if (!hasNewPosts()) {
      setHasNewPosts(true);
    }

    if (newPostAuthors.length < 3) {
      const users = context?.futureNotes.map(note => note.user) || [];

      const uniqueUsers = users.reduce<PrimalUser[]>((acc, user) => {
        const isDuplicate = acc.find(u => u.pubkey === user.pubkey);
        return isDuplicate ? acc : [...acc, user];
      }, []).slice(0, 3);

      setNewPostAuthors(() => [...uniqueUsers]);
    }

    setNewNotesCount(count);
  });

  onCleanup(() => {
    clearInterval(checkNewNotesTimer);
    setIsHome(false);
  });

  const loadNewContent = () => {
    if (newNotesCount() > 100 || app?.appState === 'waking') {
      context?.actions.getFirstPage();
      return;
    }

    context?.actions.loadFutureContent();
    scrollWindowTo(0, true);
    setHasNewPosts(false);
    setNewNotesCount(0);
    setNewPostAuthors(() => []);
  };

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);

    if (category === 'all') {
      setSearchParams({ category: undefined, view: undefined, search: undefined, q: undefined });
    } else if (category === 'shorts') {
      setSearchParams({ view: 'shorts', category: undefined, search: undefined, q: undefined });
    } else {
      setSearchParams({ category, view: undefined, search: undefined, q: undefined });
    }

    if (category === 'trending') {
      context?.actions.fetchNotes('network;trending');
    } else if (category === 'following') {
      context?.actions.fetchNotes('follows;latest');
    } else if (category === 'newest') {
      context?.actions.fetchNotes('global;latest');
    }
  };

  // Compile video items from published videos, live notes, and featured videos
  const allVideos = createMemo(() => {
    const localVideos = getStoredPublishedVideos();
    const noteVideos: VideoItem[] = [];

    if (context?.notes) {
      for (const note of context.notes) {
        if ('post' in note) {
          const video = extractVideoFromNote(note as PrimalNote);
          if (video && !localVideos.some(v => v.id === video.id)) {
            noteVideos.push(video);
          }
        }
      }
    }

    // Combine local uploads, extracted feed videos, and featured videos
    const combined = [...localVideos, ...noteVideos];

    // Supplement with featured videos if needed
    for (const fv of FEATURED_VIDEOS) {
      if (!combined.some(v => v.id === fv.id)) {
        combined.push(fv);
      }
    }

    return combined;
  });

  // Real detected 9:16 vertical videos (NIP-71 Kind 34236, dimensions with height > width, or aspect_ratio 9:16)
  const verticalVideos = createMemo(() => {
    return allVideos().filter(v => v.isVertical || v.aspectRatio === '9:16');
  });

  const hasVerticalVideos = () => verticalVideos().length > 0;

  // Dynamic Category Chips: Only show 'Shorts' if real 9:16 videos exist or if actively filtering
  const categoryChips = createMemo(() => {
    if (hasVerticalVideos() || activeCategory() === 'shorts') {
      return [
        DEFAULT_CATEGORY_CHIPS[0],
        { id: 'shorts', label: 'Shorts' },
        ...DEFAULT_CATEGORY_CHIPS.slice(1),
      ];
    }
    return DEFAULT_CATEGORY_CHIPS;
  });

  const videosList = createMemo(() => {
    const combined = allVideos();

    const searchQuery = (searchParams.search || searchParams.q || '').trim().toLowerCase();
    if (searchQuery) {
      return combined.filter(v => {
        const matchTitle = v.title.toLowerCase().includes(searchQuery);
        const matchDesc = v.description.toLowerCase().includes(searchQuery);
        const matchTags = v.tags?.some(t => t.toLowerCase().includes(searchQuery));
        const matchCreator = userName(v.creator, v.creator.pubkey).toLowerCase().includes(searchQuery);
        return matchTitle || matchDesc || matchTags || matchCreator;
      });
    }

    const cat = activeCategory();

    if (cat === 'shorts') {
      return verticalVideos();
    }
    if (cat === 'trending') {
      return [...combined].sort((a, b) => b.views - a.views);
    }
    if (cat === 'newest') {
      return [...combined].sort((a, b) => b.publishedAt - a.publishedAt);
    }
    if (cat === 'all') {
      return combined;
    }
    if (cat === 'following') {
      const followingPubkeys = accountStore.following || [];
      const filtered = combined.filter(v => followingPubkeys.includes(v.creator.pubkey));
      return filtered.length > 0 ? filtered : combined;
    }

    // Filter by keyword / tag for specific categories
    const keyword = cat.toLowerCase();
    const filtered = combined.filter(v => {
      const matchTitle = v.title.toLowerCase().includes(keyword);
      const matchDesc = v.description.toLowerCase().includes(keyword);
      const matchTags = v.tags?.some(t => t.toLowerCase().includes(keyword));
      return matchTitle || matchDesc || matchTags;
    });

    return filtered.length > 0 ? filtered : combined;
  });

  const displayedVideos = createMemo(() => {
    return videosList();
  });

  return (
    <div class={styles.homeContent}>
      <PageTitle title={intl.formatMessage(branding)} />

      {/* Horizontal Category Chips Bar */}
      <div class={styles.categoryFilterBar}>
        <For each={categoryChips()}>
          {chip => (
            <button
              class={`${styles.categoryPill} ${activeCategory() === chip.id ? styles.activeCategory : ''}`}
              onClick={() => handleCategoryChange(chip.id)}
            >
              {chip.label}
            </button>
          )}
        </For>
      </div>

      {/* Search active notification */}
      <Show when={searchParams.search || searchParams.q}>
        <div class={styles.searchHeadingRow}>
          <div class={styles.searchHeading}>
            Search results for <strong>"{searchParams.search || searchParams.q}"</strong>
          </div>
          <button
            class={styles.clearSearchBtn}
            onClick={() => setSearchParams({ search: undefined, q: undefined })}
          >
            Clear Search
          </button>
        </div>
      </Show>

      {/* Notification banner when new videos / posts arrive */}
      <Show when={hasNewPosts()}>
        <div class={styles.newVideosNotification}>
          <button onClick={loadNewContent}>
            <span class={styles.pulseDot}></span>
            <span>{newPostCount()} new video{newPostCount() > 1 ? 's' : ''} available</span>
          </button>
        </div>
      </Show>

      {/* Full Dedicated Shorts Grid when Shorts is selected */}
      <Show when={activeCategory() === 'shorts'}>
        <section class={styles.allShortsSection}>
          <div class={styles.shortsHeader}>
            <svg viewBox="0 0 24 24" width="22" height="22">
              <path
                fill="#CC785C"
                d="M17.77 10.32l-1.2-.5a3.9 3.9 0 0 0-1.12-.27 4.1 4.1 0 0 0-2.82.72l-4.14 2.63a4 4 0 0 0-1.85 3.39c0 1.25.56 2.44 1.54 3.23a4 4 0 0 0 2.48.86c.38 0 .76-.05 1.13-.16l1.2.5c.36.14.74.22 1.12.22a4.1 4.1 0 0 0 2.82-.72l4.14-2.63a4 4 0 0 0 1.85-3.39c0-1.25-.56-2.44-1.54-3.23a4 4 0 0 0-2.48-.86c-.38 0-.76.05-1.13.16zM10 14.5v-5l4.5 2.5-4.5 2.5z"
              />
            </svg>
            <h2 class={styles.shortsTitle}>Shorts (9:16)</h2>
          </div>
          <Show
            when={verticalVideos().length > 0}
            fallback={
              <div class={styles.noVideosFound}>
                <p>No 9:16 vertical videos detected on the network.</p>
                <button
                  class={styles.clearSearchBtn}
                  onClick={() => {
                    setActiveCategory('all');
                    setSearchParams({ category: undefined, view: undefined, search: undefined, q: undefined });
                  }}
                >
                  Browse Standard 16:9 Videos
                </button>
              </div>
            }
          >
            <div class={styles.allShortsGrid}>
              <For each={verticalVideos()}>
                {short => (
                  <div
                    class={styles.shortCard}
                    onClick={() => navigate(`/watch/${short.id}`)}
                    title={short.title}
                  >
                    <img
                      class={styles.shortImg}
                      src={short.thumbnail}
                      alt={short.title}
                      loading="lazy"
                    />
                    <div class={styles.shortDuration}>{short.duration}</div>
                    <div class={styles.shortPlayOverlay}>
                      <div class={styles.shortPlayIcon}>
                        <svg viewBox="0 0 24 24" width="20" height="20">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                    <div class={styles.shortDetails}>
                      <h3 class={styles.shortTitle}>{short.title}</h3>
                      <div class={styles.shortViews}>{formatViews(short.views)}</div>
                    </div>
                  </div>
                )}
              </For>
            </div>
          </Show>
        </section>
      </Show>

      {/* Main Video View when not in shorts-only mode */}
      <Show when={activeCategory() !== 'shorts'}>
        {/* View Toggle (Videos vs All Posts) */}
        <div class={styles.viewToggleRow}>
          <div class={styles.viewTitle}>
            {viewMode() === 'videos' ? (searchParams.search ? 'Matching Videos' : 'Recommended Videos') : 'All Nostr Posts'}
          </div>
          <div class={styles.viewToggleButtons}>
            <button
              class={`${styles.toggleBtn} ${viewMode() === 'videos' ? styles.activeToggle : ''}`}
              onClick={() => setViewMode('videos')}
            >
              Videos
            </button>
            <button
              class={`${styles.toggleBtn} ${viewMode() === 'notes' ? styles.activeToggle : ''}`}
              onClick={() => setViewMode('notes')}
            >
              All Posts
            </button>
          </div>
        </div>

        {/* Multi-column YouTube Video Grid (standard 16:9 layout) */}
        <Show when={viewMode() === 'videos'}>
          <Show
            when={displayedVideos().length > 0}
            fallback={
              <div class={styles.noVideosFound}>
                <p>No videos found matching your criteria.</p>
                <button
                  class={styles.clearSearchBtn}
                  onClick={() => {
                    setActiveCategory('all');
                    setSearchParams({ category: undefined, view: undefined, search: undefined, q: undefined });
                  }}
                >
                  Browse All Videos
                </button>
              </div>
            }
          >
            <div class={styles.videoGrid}>
              <For each={displayedVideos()}>
                {video => <VideoCard video={video} />}
              </For>
            </div>
          </Show>
        </Show>
      </Show>

      {/* Fallback All Notes Stream View */}
      <Show when={viewMode() === 'notes'}>
        <div class={styles.homeFeed}>
          <Transition name="slide-fade">
            <Show
              when={context?.notes && context.notes.length > 0}
              fallback={
                <div>
                  <For each={new Array(5)}>
                    {() => <FeedNoteSkeleton />}
                  </For>
                </div>
              }
            >
              <div class={isPhone() ? styles.readsFeed : ''}>
                <For each={context?.notes}>
                  {note => (
                    <Switch>
                      <Match when={note.msg.kind === Kind.Text}>
                        <div class="animated">
                          <Note
                            note={note}
                            shorten={true}
                            onRemove={(id: string) => {
                              context?.actions.removeEvent(id, 'notes');
                            }}
                          />
                        </div>
                      </Match>
                      <Match when={note.msg.kind === Kind.UserPoll}>
                        <div class="animated">
                          <UserPoll
                            poll={note}
                            onRemove={(id: string) => {
                              context?.actions.removeEvent(id, 'notes');
                            }}
                          />
                        </div>
                      </Match>
                    </Switch>
                  )}
                </For>
              </div>
            </Show>
          </Transition>
        </div>
      </Show>

      <Paginator loadNextPage={context?.actions.fetchNextPage} />
    </div>
  );
};

export default Home;
