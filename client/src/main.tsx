import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import App from './App';
import "./index.css";

// Generate a unique version id for this deployment
const DEPLOY_VERSION = Date.now().toString();

// Function to check for new deployments
const checkForNewDeployment = async () => {
  try {
    const response = await fetch(`/version?v=${DEPLOY_VERSION}`);
    const { version } = await response.json();

    if (version && version !== DEPLOY_VERSION) {
      // Clear cache and reload
      if ('caches' in window) {
        await caches.keys().then(cacheNames => {
          return Promise.all(
            cacheNames.map(cacheName => {
              return caches.delete(cacheName);
            })
          );
        });
      }

      // Reload the page to get new version
      window.location.reload();
    }
  } catch (error) {
    console.error('Failed to check for new deployment:', error);
  }
};

// Wrapper component to handle version checking
function AppWrapper() {
  useEffect(() => {
    // Check for new deployment every minute
    const interval = setInterval(checkForNewDeployment, 60000);

    // Cleanup on unmount
    return () => clearInterval(interval);
  }, []);

  return <App />;
}

// Remove any existing service workers
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(registration => {
      registration.unregister();
    });
  });
}

// Clear browser cache on load
if ('caches' in window) {
  caches.keys().then(cacheNames => {
    cacheNames.forEach(cacheName => {
      caches.delete(cacheName);
    });
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppWrapper />
  </StrictMode>,
);