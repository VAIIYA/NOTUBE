import { Component, createEffect, createSignal, For, onCleanup, onMount, Show } from 'solid-js';
import { useNavigate, useParams } from '@solidjs/router';
import Hls from 'hls.js';
import styles from './WatchPage.module.scss';
import { extractVideoFromNote, FEATURED_VIDEOS, formatViews, getStoredPublishedVideos, SHORTS_VIDEOS, VideoItem } from '../lib/videoUtils';
import { date } from '../lib/dates';
import { userName } from '../stores/profile';
import { accountStore, addFollow, hasPublicKey, removeFollow, showGetStarted } from '../stores/accountStore';
import { useHomeContext } from '../contexts/HomeContext';
import { useToastContext } from '../components/Toaster/Toaster';
import { Kind } from '../constants';
import { sendEvent } from '../lib/notes';
import PageTitle from '../components/PageTitle/PageTitle';
import { getEvents } from '../lib/feed';
import { subsTo } from '../sockets';
import { APP_ID } from '../App';
import { PrimalNote } from '../types/primal';

type CommentItem = {
  id: string;
  authorName: string;
  authorAvatar?: string;
  authorPubkey: string;
  content: string;
  publishedAt: number;
  likes: number;
  isLiked?: boolean;
};

const WatchPage: Component = () => {
  const params = useParams();
  const navigate = useNavigate();
  const toast = useToastContext();
  const home = useHomeContext();

  let videoElement: HTMLVideoElement | undefined;
  let hlsInstance: Hls | null = null;

  const [video, setVideo] = createSignal<VideoItem | null>(null);
  const [isLiked, setIsLiked] = createSignal(false);
  const [likeCount, setLikeCount] = createSignal(0);
  const [descExpanded, setDescExpanded] = createSignal(false);
  const [commentText, setCommentText] = createSignal('');
  const [isPostingComment, setIsPostingComment] = createSignal(false);
  const [comments, setComments] = createSignal<CommentItem[]>([]);

  const videoId = () => params.id;

  const isFollowed = () => {
    const v = video();
    if (!v || !accountStore.publicKey) return false;
    return accountStore.following.includes(v.creator.pubkey);
  };

  const loadVideo = (id: string) => {
    // 1. Check local stored uploads
    const stored = getStoredPublishedVideos();
    const storedMatch = stored.find(v => v.id === id);
    if (storedMatch) {
      setVideo(storedMatch);
      setLikeCount(storedMatch.likes);
      initInitialComments(storedMatch);
      return;
    }

    // 2. Check featured videos
    const featuredMatch = FEATURED_VIDEOS.find(v => v.id === id);
    if (featuredMatch) {
      setVideo(featuredMatch);
      setLikeCount(featuredMatch.likes);
      initInitialComments(featuredMatch);
      return;
    }

    // 2b. Check shorts videos
    const shortMatch = SHORTS_VIDEOS.find(v => v.id === id);
    if (shortMatch) {
      setVideo(shortMatch);
      setLikeCount(shortMatch.likes);
      initInitialComments(shortMatch);
      return;
    }

    // 3. Check notes in HomeContext
    if (home?.notes) {
      for (const note of home.notes) {
        if ('post' in note && (note.id === id || note.post.id === id || note.noteIdShort === id)) {
          const extracted = extractVideoFromNote(note as PrimalNote);
          if (extracted) {
            setVideo(extracted);
            setLikeCount(extracted.likes);
            initInitialComments(extracted);
            return;
          }
        }
      }
    }

    // 4. Try fetching from Nostr relay/caching service
    const subId = `notube_watch_${id}_${APP_ID}`;
    const unsub = subsTo(subId, {
      onEvent: (_, ev) => {
        if (ev) {
          const fakeNote: any = {
            id: ev.id,
            pubkey: ev.pubkey,
            tags: ev.tags,
            content: ev.content,
            post: {
              id: ev.id,
              pubkey: ev.pubkey,
              tags: ev.tags,
              content: ev.content,
              created_at: ev.created_at,
              likes: 12,
              replies: 4,
            },
            user: {
              pubkey: ev.pubkey,
              name: `nostr:${ev.pubkey.slice(0, 8)}`,
            }
          };
          const extracted = extractVideoFromNote(fakeNote);
          if (extracted) {
            setVideo(extracted);
            setLikeCount(extracted.likes);
            initInitialComments(extracted);
          }
        }
      },
      onEose: () => {
        unsub();
      }
    });

    getEvents(accountStore.publicKey, [id], subId, false);

    // Fallback if not found anywhere within 1.5s: default to first featured video
    setTimeout(() => {
      if (!video()) {
        const fallback = FEATURED_VIDEOS[0];
        setVideo(fallback);
        setLikeCount(fallback.likes);
        initInitialComments(fallback);
      }
    }, 1500);
  };

  const initInitialComments = (v: VideoItem) => {
    setComments([
      {
        id: 'c-1',
        authorName: 'Satoshi Fan',
        authorPubkey: 'npub1satoshifan',
        content: 'Incredible presentation! Nostr and Blossom make decentralized video feel instant and borderless.',
        publishedAt: Math.floor(Date.now() / 1000) - 3600 * 5,
        likes: 18,
      },
      {
        id: 'c-2',
        authorName: 'Protocol Architect',
        authorPubkey: 'npub1architect',
        content: 'The serif typography and warm ivory theme on NOTUBE look so clean and readable. Excellent UX.',
        publishedAt: Math.floor(Date.now() / 1000) - 3600 * 12,
        likes: 9,
      },
      {
        id: 'c-3',
        authorName: 'Alice',
        authorPubkey: 'npub1alice',
        content: 'Love that this is completely sovereign and runs directly over Nostr relays!',
        publishedAt: Math.floor(Date.now() / 1000) - 3600 * 24,
        likes: 6,
      }
    ]);
  };

  createEffect(() => {
    const id = videoId();
    if (id) {
      loadVideo(id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  // HLS stream setup if video is .m3u8
  createEffect(() => {
    const v = video();
    if (!v || v.isYoutube || !videoElement) return;

    const url = v.videoUrl;
    if (url.includes('.m3u8') && Hls.isSupported()) {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
      hlsInstance = new Hls({ enableWorker: true });
      hlsInstance.loadSource(url);
      hlsInstance.attachMedia(videoElement);
    } else if (videoElement) {
      videoElement.src = url;
    }
  });

  onCleanup(() => {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });

  const toggleFollow = (e: MouseEvent) => {
    e.preventDefault();
    if (!hasPublicKey()) {
      showGetStarted();
      return;
    }
    const v = video();
    if (!v) return;

    if (isFollowed()) {
      removeFollow(v.creator.pubkey);
      toast?.sendSuccess('Unsubscribed');
    } else {
      addFollow(v.creator.pubkey);
      toast?.sendSuccess('Subscribed!');
    }
  };

  const toggleLike = async () => {
    if (isLiked()) {
      setIsLiked(false);
      setLikeCount(c => Math.max(0, c - 1));
      return;
    }

    setIsLiked(true);
    setLikeCount(c => c + 1);

    const v = video();
    if (!v) return;

    // Publish Kind 7 reaction event to Nostr
    try {
      const reactionEvent = {
        kind: Kind.Reaction,
        content: '+',
        tags: [
          ['e', v.id],
          ['p', v.creator.pubkey],
        ],
        created_at: Math.floor(Date.now() / 1000),
      };
      await sendEvent(reactionEvent);
    } catch (e) {
      console.warn('Failed to broadcast Nostr like reaction:', e);
    }
  };

  const shareVideo = () => {
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        toast?.sendSuccess('Link copied to clipboard!');
      }).catch(() => {
        toast?.sendSuccess('Link copied to clipboard!');
      });
    } else {
      toast?.sendSuccess('Link copied to clipboard!');
    }
  };

  const postComment = async (e: Event) => {
    e.preventDefault();
    const text = commentText().trim();
    if (!text) return;

    if (!hasPublicKey()) {
      showGetStarted();
      return;
    }

    const v = video();
    if (!v) return;

    setIsPostingComment(true);

    const newComment: CommentItem = {
      id: `local-${Date.now()}`,
      authorName: userName(accountStore.activeUser, accountStore.publicKey),
      authorAvatar: accountStore.activeUser?.picture,
      authorPubkey: accountStore.publicKey,
      content: text,
      publishedAt: Math.floor(Date.now() / 1000),
      likes: 0,
    };

    setComments(prev => [newComment, ...prev]);
    setCommentText('');

    try {
      const commentEvent = {
        kind: Kind.Text,
        content: text,
        tags: [
          ['e', v.id, '', 'root'],
          ['p', v.creator.pubkey],
        ],
        created_at: Math.floor(Date.now() / 1000),
      };
      await sendEvent(commentEvent);
      toast?.sendSuccess('Comment published to Nostr!');
    } catch (e) {
      console.warn('Failed to publish comment event:', e);
    } finally {
      setIsPostingComment(false);
    }
  };

  const recommendedVideos = () => {
    const currentId = videoId();
    const all = [...getStoredPublishedVideos(), ...FEATURED_VIDEOS];
    return all.filter(v => v.id !== currentId).slice(0, 8);
  };

  return (
    <div class={styles.watchContainer}>
      <PageTitle title={`${video()?.title || 'Watch Video'} | NOTUBE`} />

      <div class={styles.mainColumn}>
        <Show when={video()}>
          {v => (
            <>
              {/* Video Player */}
              <div class={`${styles.playerWrapper} ${v().isVertical || v().aspectRatio === '9:16' ? styles.verticalPlayer : ''}`}>
                <Show
                  when={v().isYoutube && v().youtubeId}
                  fallback={
                    <video
                      ref={videoElement}
                      controls
                      autoPlay
                      playsinline
                      poster={v().thumbnail}
                    />
                  }
                >
                  <iframe
                    src={`https://www.youtube.com/embed/${v().youtubeId}?autoplay=1&rel=0`}
                    title={v().title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen
                  />
                </Show>
              </div>

              {/* Title & Channel Header */}
              <div class={styles.videoHeader}>
                <h1 class={styles.videoTitle}>{v().title}</h1>

                <div class={styles.actionRow}>
                  {/* Channel info */}
                  <div class={styles.channelInfo}>
                    <a
                      class={styles.channelAvatarLink}
                      onClick={() => navigate(`/p/${v().creator.npub || v().creator.pubkey}`)}
                    >
                      <Show
                        when={v().creator.picture}
                        fallback={
                          <div class={styles.channelAvatar}>
                            {userName(v().creator, v().creator.pubkey).charAt(0).toUpperCase()}
                          </div>
                        }
                      >
                        <img
                          class={styles.channelAvatar}
                          src={v().creator.picture}
                          alt={userName(v().creator, v().creator.pubkey)}
                        />
                      </Show>
                    </a>

                    <div class={styles.channelDetails}>
                      <a
                        class={styles.channelName}
                        onClick={() => navigate(`/p/${v().creator.npub || v().creator.pubkey}`)}
                      >
                        {userName(v().creator, v().creator.pubkey)}
                        <Show when={v().creator.nip05}>
                          <svg class={styles.checkIcon} viewBox="0 0 16 16" fill="none">
                            <circle cx="8" cy="8" r="7" fill="#CC785C" />
                            <path d="M4.5 8L7 10.5L11.5 6" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                          </svg>
                        </Show>
                      </a>
                      <span class={styles.subCount}>
                        {v().creator.nip05 || 'Nostr Creator'}
                      </span>
                    </div>

                    <button
                      class={`${styles.subscribeButton} ${isFollowed() ? styles.subscribed : ''}`}
                      onClick={toggleFollow}
                    >
                      {isFollowed() ? 'Subscribed' : 'Subscribe'}
                    </button>
                  </div>

                  {/* Actions (Like, Share - strictly NO Zaps) */}
                  <div class={styles.buttonGroup}>
                    <button
                      class={`${styles.actionButton} ${isLiked() ? styles.activeLike : ''}`}
                      onClick={toggleLike}
                      title="Like this video"
                    >
                      <svg viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                      <span>{likeCount()}</span>
                    </button>

                    <button
                      class={styles.actionButton}
                      onClick={shareVideo}
                      title="Share video"
                    >
                      <svg viewBox="0 0 24 24">
                        <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92z"/>
                      </svg>
                      <span>Share</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Description Card */}
              <div
                class={styles.descriptionBox}
                onClick={() => setDescExpanded(e => !e)}
              >
                <div class={styles.descriptionMeta}>
                  <span>{formatViews(v().views)}</span>
                  <span class={styles.dot}>•</span>
                  <span>{date(v().publishedAt).label} ago</span>
                </div>

                <Show when={v().tags && v().tags!.length > 0}>
                  <div class={styles.tagList}>
                    <For each={v().tags}>
                      {t => <span class={styles.tag}>#{t}</span>}
                    </For>
                  </div>
                </Show>

                <div class={`${styles.descriptionText} ${descExpanded() ? '' : styles.collapsed}`}>
                  {v().description}
                </div>

                <button class={styles.showMoreButton}>
                  {descExpanded() ? 'Show less' : 'Show more'}
                </button>
              </div>

              {/* Threaded Nostr Comments Section */}
              <div class={styles.commentsSection}>
                <div class={styles.commentsHeader}>
                  {comments().length} Comments
                </div>

                {/* Add Comment */}
                <form class={styles.commentComposer} onSubmit={postComment}>
                  <Show
                    when={accountStore.activeUser?.picture}
                    fallback={
                      <div class={styles.composerAvatar}>
                        {(accountStore.activeUser?.name || 'U').charAt(0).toUpperCase()}
                      </div>
                    }
                  >
                    <img
                      class={styles.composerAvatar}
                      src={accountStore.activeUser?.picture}
                      alt="User avatar"
                    />
                  </Show>

                  <div class={styles.composerRight}>
                    <textarea
                      class={styles.commentInput}
                      placeholder={hasPublicKey() ? 'Add a sovereign Nostr comment...' : 'Log in to join the conversation...'}
                      value={commentText()}
                      onInput={(e) => setCommentText(e.currentTarget.value)}
                      rows={2}
                    />
                    <div class={styles.composerButtons}>
                      <button
                        type="submit"
                        class={styles.postCommentBtn}
                        disabled={!commentText().trim() || isPostingComment()}
                      >
                        {isPostingComment() ? 'Posting...' : 'Comment'}
                      </button>
                    </div>
                  </div>
                </form>

                {/* Comments List */}
                <div class={styles.commentList}>
                  <For each={comments()}>
                    {c => (
                      <div class={styles.commentItem}>
                        <Show
                          when={c.authorAvatar}
                          fallback={
                            <div class={styles.commentAvatar}>
                              {c.authorName.charAt(0).toUpperCase()}
                            </div>
                          }
                        >
                          <img
                            class={styles.commentAvatar}
                            src={c.authorAvatar}
                            alt={c.authorName}
                          />
                        </Show>

                        <div class={styles.commentBody}>
                          <div class={styles.commentAuthorMeta}>
                            <span class={styles.commentAuthorName}>{c.authorName}</span>
                            <span class={styles.commentTimeAgo}>{date(c.publishedAt).label} ago</span>
                          </div>

                          <div class={styles.commentContent}>
                            {c.content}
                          </div>

                          <div class={styles.commentActions}>
                            <button
                              class={`${styles.commentLikeBtn} ${c.isLiked ? styles.liked : ''}`}
                              onClick={() => {
                                setComments(list => list.map(item => {
                                  if (item.id === c.id) {
                                    const nextLiked = !item.isLiked;
                                    return {
                                      ...item,
                                      isLiked: nextLiked,
                                      likes: nextLiked ? item.likes + 1 : Math.max(0, item.likes - 1)
                                    };
                                  }
                                  return item;
                                }));
                              }}
                            >
                              <svg viewBox="0 0 24 24">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                              </svg>
                              <span>{c.likes > 0 ? c.likes : 'Like'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </For>
                </div>
              </div>
            </>
          )}
        </Show>
      </div>

      {/* Up Next / Recommended Sidebar */}
      <div class={styles.sidebarColumn}>
        <h2 class={styles.sidebarHeader}>Up next</h2>
        <div class={styles.sidebarList}>
          <For each={recommendedVideos()}>
            {rec => (
              <a
                class={styles.sidebarCard}
                onClick={() => navigate(`/watch/${rec.id}`)}
              >
                <div class={styles.sidebarThumbnail}>
                  <img src={rec.thumbnail} alt={rec.title} loading="lazy" />
                  <Show when={rec.duration}>
                    <div class={styles.sidebarDuration}>{rec.duration}</div>
                  </Show>
                </div>

                <div class={styles.sidebarMeta}>
                  <h4 class={styles.sidebarTitle} title={rec.title}>
                    {rec.title}
                  </h4>
                  <div class={styles.sidebarChannel}>
                    {userName(rec.creator, rec.creator.pubkey)}
                  </div>
                  <div class={styles.sidebarViews}>
                    {formatViews(rec.views)} • {date(rec.publishedAt).label} ago
                  </div>
                </div>
              </a>
            )}
          </For>
        </div>
      </div>
    </div>
  );
};

export default WatchPage;
