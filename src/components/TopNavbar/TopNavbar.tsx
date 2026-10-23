import { Component, createEffect, createSignal, Show } from 'solid-js';
import { useNavigate, useSearchParams, A } from '@solidjs/router';
import styles from './TopNavbar.module.scss';
import Branding from '../Branding/Branding';
import Avatar from '../Avatar/Avatar';
import { accountStore, hasPublicKey, showLogin } from '../../stores/accountStore';
import { useNotificationsContext } from '../../contexts/NotificationsContext';
import { useAppContext } from '../../contexts/AppContext';

const TopNavbar: Component<{
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  isHome?: boolean;
  hideHamburger?: boolean;
}> = (props) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const notifications = useNotificationsContext();
  const app = useAppContext();
  const [searchQuery, setSearchQuery] = createSignal(searchParams.search || searchParams.q || '');

  createEffect(() => {
    const q = searchParams.search || searchParams.q;
    if (q && q !== searchQuery()) {
      setSearchQuery(q);
    } else if (!q && searchParams.category && !searchParams.search) {
      setSearchQuery('');
    }
  });

  const handleSearchSubmit = (e: SubmitEvent) => {
    e.preventDefault();
    const q = searchQuery().trim();
    if (q) {
      navigate(`/home?search=${encodeURIComponent(q)}`);
    }
  };

  return (
    <header class={styles.topNavbar}>
      <div class={styles.navLeft}>
        <Show when={!props.hideHamburger}>
          <button
            class={styles.hamburgerBtn}
            onClick={props.onToggleSidebar}
            title="Toggle Navigation Menu"
            aria-label="Toggle Navigation Menu"
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </Show>
        <Branding isHome={props.isHome} />
      </div>

      <div class={styles.navCenter}>
        <form class={styles.searchForm} onSubmit={handleSearchSubmit}>
          <div class={styles.searchInputWrapper}>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery()}
              onInput={(e) => setSearchQuery(e.currentTarget.value)}
              class={styles.searchInput}
            />
            <Show when={searchQuery().length > 0}>
              <button
                type="button"
                class={styles.clearBtn}
                onClick={() => setSearchQuery('')}
                title="Clear search"
              >
                ✕
              </button>
            </Show>
          </div>
          <button
            type="submit"
            class={styles.searchBtn}
            title="Search"
            aria-label="Search"
          >
            <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="7"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </form>
      </div>

      <div class={styles.navRight}>
        <button
          class={styles.uploadBtn}
          onClick={() => navigate('/upload')}
          title="Upload Video"
        >
          <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M23 7l-7 5 7 5V7z" />
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            <line x1="8.5" y1="9" x2="8.5" y2="15" />
            <line x1="5.5" y1="12" x2="11.5" y2="12" />
          </svg>
          <span class={styles.uploadLabel}>Upload</span>
        </button>

        <button
          class={styles.iconBtn}
          onClick={() => navigate('/notifications')}
          title="Notifications"
          aria-label="Notifications"
        >
          <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          <Show when={(notifications?.notificationCount || 0) > 0}>
            <span class={styles.notifBadge}>
              {(notifications?.notificationCount || 0) > 99 ? '99+' : notifications?.notificationCount}
            </span>
          </Show>
        </button>

        <Show
          when={hasPublicKey()}
          fallback={
            <button
              class={styles.signInBtn}
              onClick={showLogin}
              title="Sign In with Nostr"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
              <span>Sign In</span>
            </button>
          }
        >
          <A
            href={app?.actions.profileLink(accountStore.publicKey) || `/p/${accountStore.publicKey}`}
            class={styles.profileLink}
            title="Your Channel"
          >
            <Avatar
              user={accountStore.activeUser}
              size="vs"
              showCheck={false}
            />
          </A>
        </Show>
      </div>
    </header>
  );
};

export default TopNavbar;
