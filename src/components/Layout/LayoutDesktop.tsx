import { Component, createSignal, JSXElement, onCleanup, onMount } from 'solid-js';
import styles from './Layout.module.scss';
import { useLocation } from '@solidjs/router';
import NewNote from '../NewNote/NewNote';
import { SendNoteResult } from '../../types/primal';
import EventQueueWidget from '../EventQueueWidget/EventQueueWidget';
import TopNavbar from '../TopNavbar/TopNavbar';
import YouTubeSidebar from '../YouTubeSidebar/YouTubeSidebar';
import { isHome } from './Layout';

export const [sidebarCollapsed, setSidebarCollapsed] = createSignal(
  typeof window !== 'undefined' ? window.innerWidth < 1200 : false
);

const LayoutDesktop: Component<{
  children: JSXElement,
  onNewNotePosted: (result: SendNoteResult) => void,
}> = (props) => {
  const location = useLocation();

  onMount(() => {
    const handleResize = () => {
      if (window.innerWidth < 1200 && !sidebarCollapsed()) {
        setSidebarCollapsed(true);
      }
    };
    window.addEventListener('resize', handleResize);
    onCleanup(() => window.removeEventListener('resize', handleResize));
  });

  const isFullBleed = () => {
    return location.pathname.startsWith('/watch/') || location.pathname.includes('/citadel_stream');
  };

  return (
    <div class={styles.youtubeAppContainer}>
      {/* Full-width YouTube-style Top Navbar */}
      <TopNavbar
        sidebarCollapsed={sidebarCollapsed()}
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed())}
        isHome={isHome()}
      />

      {/* Main YouTube layout: Left Sidebar + Remaining Full-Width Content Area (No Right Sidebar) */}
      <div class={styles.youtubeBody}>
        <YouTubeSidebar
          collapsed={sidebarCollapsed()}
        />

        <main class={`${styles.youtubeMainContent} ${isFullBleed() ? styles.fullBleed : ''}`}>
          <div id="new_note_input" class={styles.headerFloater}>
            <NewNote onSuccess={props.onNewNotePosted} />
          </div>

          {/* Hidden anchor points for any legacy wormholes or widgets */}
          <div style="display: none;" aria-hidden="true">
            <div id="search_section"></div>
            <div id="right_sidebar"></div>
            <EventQueueWidget isSmall={true} />
          </div>

          {props.children}
        </main>
      </div>
    </div>
  );
};

export default LayoutDesktop;
