/**
 * Main JavaScript Entry Point for PDF Editor by ib
 * 
 * This file serves as the primary JavaScript entry point.
 * It handles:
 * - Service Worker registration
 * - Initialization of core functionality
 * - Global state management setup
 * - Performance monitoring
 * 
 * Architecture:
 * - Modular: Each feature is in its own module
 * - Non-blocking: All operations are async where possible
 * - Progressive Enhancement: Works without JavaScript
 * - Performance-first: Lazy loading and code splitting ready
 */

/**
 * Initialize application when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
    // Register Service Worker for PWA support
    if ('serviceWorker' in navigator) {
        registerServiceWorker();
    }
    
    // Initialize core features
    initializeApp();
});

/**
 * Register Service Worker
 * Enables offline support and PWA functionality
 */
async function registerServiceWorker() {
    try {
        const registration = await navigator.serviceWorker.register('sw.js', {
            scope: '/'
        });

        // Handle service worker updates
        registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;

            if (!newWorker) {
                return;
            }

            newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'activated') {
                    // Future: Notify user of update
                }
            });
        });

    } catch (error) {
        console.warn('[ServiceWorker] Registration failed:', error);
        // Application continues to work without service worker
    }
}

/**
 * Initialize core application features
 * Called when DOM is ready
 */
function initializeApp() {
    // Feature detection
    detectFeatures();
    
    // Setup global event listeners
    setupEventListeners();
    
    // Initialize accessibility features
    setupAccessibility();
}

/**
 * Detect browser features and capabilities
 */
function detectFeatures() {
    const features = {
        serviceWorker: 'serviceWorker' in navigator,
        localStorage: isLocalStorageAvailable(),
        fetch: 'fetch' in window,
        fileApi: typeof FileReader !== 'undefined',
        webWorkers: typeof Worker !== 'undefined',
        notifications: 'Notification' in window,
    };
    
    // Store features globally for use throughout app
    window.APP_FEATURES = features;
}

/**
 * Setup global event listeners
 */
function setupEventListeners() {
    // Handle visibility changes (tab focus)
    document.addEventListener('visibilitychange', () => {
        window.APP_STATE = {
            ...window.APP_STATE,
            isVisible: !document.hidden,
        };
    });

    // Handle before unload (unsaved changes warning - future)
    window.addEventListener('beforeunload', () => {
        // Future: Implement unsaved changes detection
    });
}

/**
 * Setup accessibility features
 */
function setupAccessibility() {
    // Skip to main content link
    const skipLink = document.createElement('a');
    skipLink.href = '#main';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'skip-link';
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Announce page changes for screen readers
    const observer = new MutationObserver((mutations) => {
        // Announce significant changes
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                // Future: Implement live region announcements
            }
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: false
    });
}

/**
 * Detect localStorage safely, including privacy modes where access throws.
 */
function isLocalStorageAvailable() {
    try {
        const testKey = '__pdf_editor_storage_test__';
        localStorage.setItem(testKey, testKey);
        localStorage.removeItem(testKey);
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Utility: Load external JavaScript module
 * Used for lazy loading features
 */
async function loadModule(modulePath) {
    try {
        const module = await import(modulePath);
        return module;
    } catch (error) {
        console.error(`[Module] Failed to load ${modulePath}:`, error);
        throw error;
    }
}

/**
 * Utility: Measure performance
 */
function measurePerformance(label) {
    if ('performance' in window) {
        performance.mark(label);
    }
}

// Export for use in other modules
export { loadModule, measurePerformance };
