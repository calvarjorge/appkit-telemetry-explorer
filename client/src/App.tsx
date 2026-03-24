import { createBrowserRouter, RouterProvider, NavLink, Outlet, Navigate } from 'react-router';
import { TelemetryConfigProvider } from './context/TelemetryConfigContext';
import { ConfigBar } from './components/ConfigBar';
import { LogsPage } from './pages/logs/LogsPage';
import { MetricsPage } from './pages/metrics/MetricsPage';
import { TracesPage } from './pages/traces/TracesPage';
import { TraceDetailPage } from './pages/traces/TraceDetailPage';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
    isActive
      ? 'bg-primary text-primary-foreground'
      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
  }`;

function Layout() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b px-6 py-3 space-y-2">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-foreground">Telemetry Explorer</h1>
          <nav className="flex gap-1">
            <NavLink to="/logs" className={navLinkClass}>
              Logs
            </NavLink>
            <NavLink to="/metrics" className={navLinkClass}>
              Metrics
            </NavLink>
            <NavLink to="/traces" className={navLinkClass}>
              Traces
            </NavLink>
          </nav>
        </div>
        <ConfigBar />
      </header>

      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="/logs" replace /> },
      { path: '/logs', element: <LogsPage /> },
      { path: '/metrics', element: <MetricsPage /> },
      { path: '/traces', element: <TracesPage /> },
      { path: '/traces/:traceId', element: <TraceDetailPage /> },
    ],
  },
]);

export default function App() {
  return (
    <TelemetryConfigProvider>
      <RouterProvider router={router} />
    </TelemetryConfigProvider>
  );
}
