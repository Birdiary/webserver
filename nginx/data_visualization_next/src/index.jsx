import React from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/inter';
import './index.css';
import App from './App';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import * as Sentry from "@sentry/react";
import {
  useLocation,
  useNavigationType,
  createRoutesFromChildren,
  matchRoutes,
} from "react-router-dom";
import { AuthProvider } from './context/AuthContext';

Sentry.init({
  dsn: "https://15b5f4a11ed143b89a1dba7af4ee76e7@o4504179650723840.ingest.sentry.io/4504179659898881",
  integrations: [
    Sentry.reactRouterV6BrowserTracingIntegration({
      useEffect: React.useEffect,
      useLocation,
      useNavigationType,
      createRoutesFromChildren,
      matchRoutes,
    }),
  ],
  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 0.7,
});

function FallbackComponent() {
  return <div>An error has occurred! Please reload the page</div>;
}

const myFallback = <FallbackComponent />;

// Reuse the root across Vite HMR updates instead of calling createRoot() again
// on the same container (which warns in React 18/19).
const container = document.getElementById('root');
const root = container.__reactRoot ?? (container.__reactRoot = createRoot(container));
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Sentry.ErrorBoundary fallback={myFallback} showDialog>
        <AuthProvider>
          <App />
        </AuthProvider>
      </Sentry.ErrorBoundary>
    </ThemeProvider>
  </React.StrictMode>
);
