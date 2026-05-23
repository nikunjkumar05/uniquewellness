import { App } from '@capacitor/app';
import { Keyboard } from '@capacitor/keyboard';
import { StatusBar } from '@capacitor/status-bar';
import { Network } from '@capacitor/network';

/**
 * Android Lifecycle Manager
 * Handles critical OS lifecycle events and native API bridges
 */
export class AndroidLifecycleManager {
  private static instance: AndroidLifecycleManager;
  private appState: 'active' | 'paused' | 'resumed' = 'active';
  private listeners: ((state: 'paused' | 'resumed') => void)[] = [];

  private constructor() {
    this.initializeLifecycleListeners();
    this.initializeKeyboard();
    this.initializeStatusBar();
    this.initializeNetwork();
  }

  static getInstance(): AndroidLifecycleManager {
    if (!AndroidLifecycleManager.instance) {
      AndroidLifecycleManager.instance = new AndroidLifecycleManager();
    }
    return AndroidLifecycleManager.instance;
  }

  /**
   * Initialize app pause/resume listeners
   */
  private initializeLifecycleListeners(): void {
    // Handle app pause
    App.addListener('pause', () => {
      this.appState = 'paused';
      console.log('[AndroidLifecycle] App paused');
      this.notifyListeners('paused');
      this.saveApplicationState();
    });

    // Handle app resume
    App.addListener('resume', () => {
      this.appState = 'resumed';
      console.log('[AndroidLifecycle] App resumed');
      this.notifyListeners('resumed');
      this.restoreApplicationState();
    });

    // Handle app destruction
    App.addListener('appStateChange', (state) => {
      if (!state.isActive) {
        this.saveApplicationState();
      }
    });
  }

  /**
   * Initialize keyboard lifecycle
   */
  private initializeKeyboard(): void {
    Keyboard.addListener('keyboardWillShow', () => {
      console.log('[AndroidLifecycle] Keyboard will show');
      document.body.classList.add('keyboard-visible');
    });

    Keyboard.addListener('keyboardDidShow', () => {
      console.log('[AndroidLifecycle] Keyboard did show');
    });

    Keyboard.addListener('keyboardWillHide', () => {
      document.body.classList.remove('keyboard-visible');
      console.log('[AndroidLifecycle] Keyboard will hide');
    });

    Keyboard.addListener('keyboardDidHide', () => {
      console.log('[AndroidLifecycle] Keyboard did hide');
    });
  }

  /**
   * Initialize status bar styling
   */
  private initializeStatusBar(): void {
    StatusBar.setBackgroundColor({ color: '#ffffff' });
    StatusBar.setStyle({ style: 'dark' });
    StatusBar.show();
  }

  /**
   * Initialize network status monitoring
   */
  private initializeNetwork(): void {
    Network.addListener('networkStatusChange', (status) => {
      const isOnline = status.connected;
      console.log('[AndroidLifecycle] Network status changed:', isOnline);
      document.body.classList.toggle('offline', !isOnline);
      
      // Dispatch custom event for app to respond to network changes
      window.dispatchEvent(
        new CustomEvent('networkStatusChange', {
          detail: { isOnline, type: status.connectionType },
        })
      );
    });
  }

  /**
   * Handle hardware back button
   */
  public setupBackButtonHandler(onBackPress: () => boolean): void {
    App.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back();
      } else {
        // Custom logic can be passed via callback
        const handled = onBackPress();
        if (!handled) {
          // Exit app
          App.exitApp();
        }
      }
    });
  }

  /**
   * Save application state before pause
   */
  private saveApplicationState(): void {
    try {
      const state = {
        timestamp: Date.now(),
        scrollPosition: window.scrollY,
        routerState: sessionStorage.getItem('router-state'),
      };
      sessionStorage.setItem('app-state-before-pause', JSON.stringify(state));
      console.log('[AndroidLifecycle] Application state saved');
    } catch (error) {
      console.error('[AndroidLifecycle] Failed to save state:', error);
    }
  }

  /**
   * Restore application state after resume
   */
  private restoreApplicationState(): void {
    try {
      const savedState = sessionStorage.getItem('app-state-before-pause');
      if (savedState) {
        const state = JSON.parse(savedState);
        window.scrollTo(0, state.scrollPosition || 0);
        console.log('[AndroidLifecycle] Application state restored');
      }
    } catch (error) {
      console.error('[AndroidLifecycle] Failed to restore state:', error);
    }
  }

  /**
   * Register listener for lifecycle changes
   */
  public onLifecycleChange(callback: (state: 'paused' | 'resumed') => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  /**
   * Notify all listeners of lifecycle changes
   */
  private notifyListeners(state: 'paused' | 'resumed'): void {
    this.listeners.forEach((listener) => listener(state));
  }

  /**
   * Get current app state
   */
  public getAppState(): 'active' | 'paused' | 'resumed' {
    return this.appState;
  }

  /**
   * Freeze non-essential loops during pause
   */
  public freezeAnimationLoops(): void {
    document.body.classList.add('animations-frozen');
    console.log('[AndroidLifecycle] Animation loops frozen');
  }

  /**
   * Resume animation loops
   */
  public resumeAnimationLoops(): void {
    document.body.classList.remove('animations-frozen');
    console.log('[AndroidLifecycle] Animation loops resumed');
  }
}

// Auto-initialize on module load
export const androidLifecycle = AndroidLifecycleManager.getInstance();
