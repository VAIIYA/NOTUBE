import { Component, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import styles from './VideoCard.module.scss';
import { formatViews, VideoItem } from '../../lib/videoUtils';
import { date } from '../../lib/dates';
import { userName } from '../../stores/profile';
import videoPlaceholder from '../../assets/images/video_placeholder.png';

const VideoCard: Component<{
  video: VideoItem;
}> = (props) => {
  const navigate = useNavigate();

  const timeAgo = () => {
    try {
      return date(props.video.publishedAt).label;
    } catch (e) {
      return 'recently';
    }
  };

  const creatorName = () => {
    return userName(props.video.creator, props.video.creator.pubkey || 'Creator');
  };

  const onCardClick = (e: MouseEvent) => {
    // If the click is on the avatar link, do not navigate to watch page
    const target = e.target as HTMLElement;
    if (target.closest(`.${styles.avatarLink}`)) {
      return;
    }
    navigate(`/watch/${props.video.id}`);
  };

  const onAvatarClick = (e: MouseEvent) => {
    e.stopPropagation();
    const pk = props.video.creator.npub || props.video.creator.pubkey;
    if (pk) {
      navigate(`/p/${pk}`);
    }
  };

  return (
    <div class={styles.videoCard} onClick={onCardClick}>
      <div class={styles.thumbnailWrapper}>
        <img
          src={props.video.thumbnail}
          alt={props.video.title}
          loading="lazy"
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement;
            target.onerror = null;
            target.src = videoPlaceholder;
          }}
        />

        <div class={styles.playOverlay}>
          <div class={styles.playCircle}>
            <svg viewBox="0 0 24 24" width="22" height="22">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>

        <Show when={props.video.isVertical || props.video.aspectRatio === '9:16'}>
          <div class={styles.verticalBadge}>
            9:16
          </div>
        </Show>

        <Show when={props.video.duration}>
          <div class={styles.durationBadge}>
            {props.video.duration}
          </div>
        </Show>
      </div>

      <div class={styles.cardDetails}>
        <a
          class={styles.avatarLink}
          onClick={onAvatarClick}
          title={creatorName()}
        >
          <Show
            when={props.video.creator.picture}
            fallback={
              <div class={styles.avatar}>
                {creatorName().charAt(0).toUpperCase()}
              </div>
            }
          >
            <img
              class={styles.avatar}
              src={props.video.creator.picture}
              alt={creatorName()}
              loading="lazy"
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </Show>
        </a>

        <div class={styles.metaInfo}>
          <h3 class={styles.videoTitle} title={props.video.title}>
            {props.video.title}
          </h3>

          <a
            class={styles.channelName}
            onClick={onAvatarClick}
            title={creatorName()}
          >
            {creatorName()}
            <Show when={props.video.creator.nip05}>
              <svg class={styles.checkIcon} viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" fill="#CC785C" />
                <path d="M4.5 8L7 10.5L11.5 6" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </Show>
          </a>

          <div class={styles.statsRow}>
            <span>{formatViews(props.video.views)}</span>
            <span class={styles.dot}>•</span>
            <span>{timeAgo()} ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
