import { Component, Show } from 'solid-js';
import { useLocation, A } from '@solidjs/router';
import styles from './YouTubeSidebar.module.scss';
import { accountStore, hasPublicKey, showLogin } from '../../stores/accountStore';
import { useNotificationsContext } from '../../contexts/NotificationsContext';
import { useDMContext } from '../../contexts/DMContext';

const YouTubeSidebar: Component<{
  collapsed: boolean;
}> = (props) => {
  const location = useLocation();
  const notifications = useNotificationsContext();
  const dms = useDMContext();

  const isCurrent = (path: string, exact: boolean = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside class={`${styles.sidebar} ${props.collapsed ? styles.collapsed : styles.expanded}`}>
      <Show
        when={props.collapsed}
        fallback={
          <>
            {/* Primary Navigation Section */}
            <div class={styles.menuSection}>
              <A
                href="/home"
                class={`${styles.menuItem} ${isCurrent('/home', true) && !location.search.includes('shorts') && !location.search.includes('following') && !location.search.includes('search=') ? styles.active : ''}`}
                title="Home"
              >
                <div class={styles.iconHolder}>
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  </svg>
                </div>
                <span class={styles.label}>Home</span>
              </A>

              <A
                href="/home?view=shorts"
                class={`${styles.menuItem} ${location.search.includes('shorts') ? styles.active : ''}`}
                title="Shorts"
              >
                <div class={styles.iconHolder}>
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                    <path d="M17.77 10.32l-1.2-.5a3.9 3.9 0 0 0-1.12-.27 4.1 4.1 0 0 0-2.82.72l-4.14 2.63a4 4 0 0 0-1.85 3.39c0 1.25.56 2.44 1.54 3.23a4 4 0 0 0 2.48.86c.38 0 .76-.05 1.13-.16l1.2.5c.36.14.74.22 1.12.22a4.1 4.1 0 0 0 2.82-.72l4.14-2.63a4 4 0 0 0 1.85-3.39c0-1.25-.56-2.44-1.54-3.23a4 4 0 0 0-2.48-.86c-.38 0-.76.05-1.13.16zM10 14.5v-5l4.5 2.5-4.5 2.5z"/>
                  </svg>
                </div>
                <span class={styles.label}>Shorts</span>
              </A>

              <A
                href="/home?category=following"
                class={`${styles.menuItem} ${location.search.includes('following') ? styles.active : ''}`}
                title="Subscriptions"
              >
                <div class={styles.iconHolder}>
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    <rect x="2" y="3" width="20" height="18" rx="3" />
                  </svg>
                </div>
                <span class={styles.label}>Subscriptions</span>
              </A>
            </div>

            <div class={styles.divider}></div>

            {/* You / Library Section */}
            <div class={styles.menuSection}>
              <div class={styles.sectionTitle}>
                <span>You</span>
                <span class={styles.arrow}>›</span>
              </div>

              <A
                href="/upload"
                class={`${styles.menuItem} ${isCurrent('/upload') ? styles.active : ''}`}
                title="Upload Video"
              >
                <div class={styles.iconHolder}>
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M23 7l-7 5 7 5V7z" />
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                    <line x1="8.5" y1="9" x2="8.5" y2="15" />
                    <line x1="5.5" y1="12" x2="11.5" y2="12" />
                  </svg>
                </div>
                <span class={styles.label}>Upload Video</span>
              </A>

              <A
                href="/bookmarks"
                class={`${styles.menuItem} ${isCurrent('/bookmarks') ? styles.active : ''}`}
                title="Library & Bookmarks"
              >
                <div class={styles.iconHolder}>
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                  </svg>
                </div>
                <span class={styles.label}>Library</span>
              </A>

              <A
                href="/reads"
                class={`${styles.menuItem} ${isCurrent('/reads') ? styles.active : ''}`}
                title="History & Reads"
              >
                <div class={styles.iconHolder}>
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </div>
                <span class={styles.label}>History</span>
              </A>

              <A
                href="/downloads"
                class={`${styles.menuItem} ${isCurrent('/downloads') ? styles.active : ''}`}
                title="Downloads"
              >
                <div class={styles.iconHolder}>
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                </div>
                <span class={styles.label}>Downloads</span>
              </A>
            </div>

            <div class={styles.divider}></div>

            {/* Explore & System Section */}
            <div class={styles.menuSection}>
              <A
                href="/explore"
                class={`${styles.menuItem} ${isCurrent('/explore') ? styles.active : ''}`}
                title="Explore"
              >
                <div class={styles.iconHolder}>
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
                  </svg>
                </div>
                <span class={styles.label}>Explore</span>
              </A>

              <A
                href="/dms"
                class={`${styles.menuItem} ${isCurrent('/dms') ? styles.active : ''}`}
                title="Messages"
              >
                <div class={styles.iconHolder}>
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                </div>
                <span class={styles.label}>Messages</span>
                <Show when={(dms?.dmCount || 0) > 0}>
                  <span class={styles.badge}>{dms?.dmCount}</span>
                </Show>
              </A>

              <A
                href="/settings"
                class={`${styles.menuItem} ${isCurrent('/settings') ? styles.active : ''}`}
                title="Settings"
              >
                <div class={styles.iconHolder}>
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                  </svg>
                </div>
                <span class={styles.label}>Settings</span>
              </A>
            </div>

            {/* Sign in prompt when not signed in */}
            <Show when={!hasPublicKey()}>
              <div class={styles.divider}></div>
              <div class={styles.signInCard}>
                <p>Sign in to like videos, comment, and subscribe.</p>
                <button class={styles.signInBtn} onClick={showLogin}>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                  <span>Sign In</span>
                </button>
              </div>
            </Show>

            {/* Footer */}
            <div class={styles.footerInfo}>
              <div class={styles.footerLinks}>
                <A href="/terms">Terms</A>
                <A href="/privacy">Privacy</A>
                <A href="/help">Help</A>
                <A href="/support">Support</A>
              </div>
              <div class={styles.copyright}>
                © 2026 NOTUBE<br />Decentralized & Sovereign
              </div>
            </div>
          </>
        }
      >
        {/* Collapsed Mini Navigation */}
        <div class={styles.menuSection}>
          <A
            href="/home"
            class={`${styles.collapsedItem} ${isCurrent('/home', true) && !location.search.includes('shorts') && !location.search.includes('following') && !location.search.includes('search=') ? styles.active : ''}`}
            title="Home"
          >
            <div class={styles.iconHolder}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </div>
            <span class={styles.label}>Home</span>
          </A>

          <A
            href="/home?view=shorts"
            class={`${styles.collapsedItem} ${location.search.includes('shorts') ? styles.active : ''}`}
            title="Shorts"
          >
            <div class={styles.iconHolder}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M17.77 10.32l-1.2-.5a3.9 3.9 0 0 0-1.12-.27 4.1 4.1 0 0 0-2.82.72l-4.14 2.63a4 4 0 0 0-1.85 3.39c0 1.25.56 2.44 1.54 3.23a4 4 0 0 0 2.48.86c.38 0 .76-.05 1.13-.16l1.2.5c.36.14.74.22 1.12.22a4.1 4.1 0 0 0 2.82-.72l4.14-2.63a4 4 0 0 0 1.85-3.39c0-1.25-.56-2.44-1.54-3.23a4 4 0 0 0-2.48-.86c-.38 0-.76.05-1.13.16zM10 14.5v-5l4.5 2.5-4.5 2.5z"/>
              </svg>
            </div>
            <span class={styles.label}>Shorts</span>
          </A>

          <A
            href="/home?category=following"
            class={`${styles.collapsedItem} ${location.search.includes('following') ? styles.active : ''}`}
            title="Subscriptions"
          >
            <div class={styles.iconHolder}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                <rect x="2" y="3" width="20" height="18" rx="3" />
              </svg>
            </div>
            <span class={styles.label}>Subs</span>
          </A>

          <A
            href="/upload"
            class={`${styles.collapsedItem} ${isCurrent('/upload') ? styles.active : ''}`}
            title="Upload"
          >
            <div class={styles.iconHolder}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M23 7l-7 5 7 5V7z" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                <line x1="8.5" y1="9" x2="8.5" y2="15" />
                <line x1="5.5" y1="12" x2="11.5" y2="12" />
              </svg>
            </div>
            <span class={styles.label}>Upload</span>
          </A>

          <A
            href="/bookmarks"
            class={`${styles.collapsedItem} ${isCurrent('/bookmarks') ? styles.active : ''}`}
            title="Library"
          >
            <div class={styles.iconHolder}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <span class={styles.label}>Library</span>
          </A>

          <A
            href="/settings"
            class={`${styles.collapsedItem} ${isCurrent('/settings') ? styles.active : ''}`}
            title="Settings"
          >
            <div class={styles.iconHolder}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
            </div>
            <span class={styles.label}>Settings</span>
          </A>
        </div>
      </Show>
    </aside>
  );
};

export default YouTubeSidebar;
