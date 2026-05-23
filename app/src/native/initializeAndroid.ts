import { isPlatform } from '@capacitor/core';
import { androidLifecycle } from './AndroidLifecycle';

/**
 * Initialize Android-specific features and lifecycle handlers
 * Call this in your app's main entry point (main.tsx / index.tsx)
 */
export function initializeAndroidApp(): void {
  // Only run on Android platform
  if (!isPlatform('android')) {
    console.log('[InitAndroid] Not running on Android, skipping initialization');
    return;
  }

  console.log('[InitAndroid] Initializing Android app environment');

  // Initialize lifecycle manager singleton
  const lifecycle = androidLifecycle;

  // Handle back button navigation
  lifecycle.setupBackButtonHandler(() => {
    // Return true if you handled the back press, false to exit app
    const canGoBack = window.history.length > 1;
    if (!canGoBack) {
      console.log('[InitAndroid] At root, exiting app on back press');
    }
    return canGoBack;
  });

  // Listen for lifecycle changes
  lifecycle.onLifecycleChange((state) => {
    console.log('[InitAndroid] Lifecycle changed:', state);

    if (state === 'paused') {
      // Freeze animations during pause
      lifecycle.freezeAnimationLoops();
    } else if (state === 'resumed') {
      // Resume animations on return
      lifecycle.resumeAnimationLoops();
    }
  });

  // Listen for network changes
  window.addEventListener('networkStatusChange', (event: any) => {
    const { isOnline, type } = event.detail;
    console.log(`[InitAndroid] Network: ${isOnline ? 'ONLINE' : 'OFFLINE'} (${type})`);

    // Dispatch to your app state management
    if (window.__APP_STORE__) {
      window.__APP_STORE__.dispatch({
        type: 'SET_NETWORK_STATUS',
        payload: { isOnline, connectionType: type },
      });
    }
  });

  // CSS for keyboard visibility state
  const style = document.createElement('style');
  style.textContent = `
    body.keyboard-visible {
      overflow-y: scroll;
    }

    body.animations-frozen {
      animation-play-state: paused !important;
    }

    body.animations-frozen * {
      animation-play-state: paused !important;
    }

    body.offline {
      opacity: 0.8;
      pointer-events: none;
    }

    body.offline::after {
      content: 'No internet connection';
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 9999;
      background: #ff6b6b;
      color: white;
      padding: 8px;
      text-align: center;
      font-size: 14px;
      font-weight: bold;
    }
  `;
  document.head.appendChild(style);

  console.log('[InitAndroid] Android app initialization complete');
}

// Declare global for optional app store integration
declare global {
  interface Window {
    __APP_STORE__?: any;
  }
}
