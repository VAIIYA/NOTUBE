import { Component, Show } from 'solid-js';
import styles from './Branding.module.scss';
import { useNavigate } from '@solidjs/router';

const Branding: Component<{ small?: boolean, isHome?: boolean }> = (props) => {
  const navigate = useNavigate();

  const toHomeOrScrollToTop = () => {
    if (props.isHome) {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      return;
    }

    navigate('/home');
  }

  return (
    <button
      class={styles.logoLink}
      onClick={toHomeOrScrollToTop}
      title="NOTUBE Home"
      aria-label="NOTUBE Home"
    >
      <Show
        when={!props.small}
        fallback={
          <div class={styles.brandingSmall}>
            <svg class={styles.playIcon} viewBox="0 0 32 32" width="32" height="32" fill="none">
              <rect width="32" height="32" rx="8" fill="#CC785C" />
              <path d="M12 9.5L23 16L12 22.5V9.5Z" fill="#FFFFFF" />
            </svg>
          </div>
        }
      >
        <div class={styles.branding}>
          <svg class={styles.playIcon} viewBox="0 0 32 32" width="30" height="30" fill="none">
            <rect width="32" height="32" rx="8" fill="#CC785C" />
            <path d="M12 9.5L23 16L12 22.5V9.5Z" fill="#FFFFFF" />
          </svg>
          <span class={styles.brandText}>
            <span class={styles.brandNo}>NO</span>
            <span class={styles.brandTube}>TUBE</span>
          </span>
        </div>
      </Show>
    </button>
  );
}

export default Branding;

