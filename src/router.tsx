import {
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
  useRouterState,
} from '@tanstack/react-router';
import { SchoolsPage } from './features/trips/SchoolsPage';
import { TripsPage } from './features/trips/TripsPage';
import { TripDetailPage } from './features/trips/TripDetailPage';
import { ShareTripPage } from './features/share-links/ShareTripPage';
import { ShareSchoolPage } from './features/share-links/ShareSchoolPage';
import { StaffNav } from './components/StaffNav';
import { ReconciliationPage } from './features/reconciliation/ReconciliationPage';
import { CreateShareLinkPage } from './features/share-links/CreateShareLinkPage';

function RootLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const showStaff = pathname.startsWith('/staff');
  return (
    <>
      {showStaff && <StaffNav />}
      <Outlet />
    </>
  );
}

const rootRoute = createRootRoute({
  component: RootLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/staff/schools' });
  },
});

const staffSchoolsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/staff/schools',
  component: SchoolsPage,
});

const staffTripsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/staff/schools/$schoolId/trips',
  component: TripsPage,
});

const staffTripDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/staff/trips/$tripId',
  component: TripDetailPage,
});

const staffReconciliationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/staff/reconciliation',
  component: ReconciliationPage,
});

const staffShareLinkNewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/staff/share-links/new',
  component: CreateShareLinkPage,
});

const shareTripRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/share/trip',
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === 'string' ? search.token : '',
  }),
  component: ShareTripPage,
});

const shareSchoolRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/share/school',
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === 'string' ? search.token : '',
  }),
  component: ShareSchoolPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  staffSchoolsRoute,
  staffTripsRoute,
  staffTripDetailRoute,
  staffReconciliationRoute,
  staffShareLinkNewRoute,
  shareTripRoute,
  shareSchoolRoute,
]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
