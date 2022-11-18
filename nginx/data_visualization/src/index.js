import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";
import {
  useLocation,
  useNavigationType,
  createRoutesFromChildren,
  matchRoutes,
} from "react-router-dom";

Sentry.init({
  dsn: "https://15b5f4a11ed143b89a1dba7af4ee76e7@o4504179650723840.ingest.sentry.io/4504179659898881",
  integrations: [
    new BrowserTracing({
        routingInstrumentation: Sentry.reactRouterV6Instrumentation(
            React.useEffect,
            useLocation,
            useNavigationType,
            createRoutesFromChildren,
            matchRoutes,
        ),
    }),
],  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 0.7,
});

function FallbackComponent() {
  return <div>An error has occurred! Please reload the page</div>;
}

const myFallback = <FallbackComponent />;


ReactDOM.render(
  <React.StrictMode>
    <Sentry.ErrorBoundary fallback={myFallback} showDialog>
    <App />
    </Sentry.ErrorBoundary>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(//console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
