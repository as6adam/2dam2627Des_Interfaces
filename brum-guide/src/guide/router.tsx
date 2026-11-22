import { createHashRouter } from 'react-router';
import { GuideLayout } from './GuideLayout';
import { UsefulNumbers } from './UsefulNumbers';
import { HomePage } from './HomePage';
import { SectorPage } from './SectorPage';
import { PlacePage } from './PlacePage';
import { NotFoundPage } from './NotFoundPage';
import { BeforeYouGo, DayRoutes, GettingAround, PlanHub, SpeakBrummie, YearAgenda } from './PlanPages';
import { MapPage } from './MapPage';

/**
 * Navegación por hash: #/ · #/sector/:sectorId · #/sector/:sectorId/:placeId ·
 * #/plan y sus secciones · #/useful-numbers · resto → 404.
 * No requiere reescrituras en el servidor, por lo que funciona en GitHub Pages.
 */
export const guideRouter = createHashRouter([
  {
    path: '/',
    element: <GuideLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'sector/:sectorId', element: <SectorPage /> },
      { path: 'sector/:sectorId/:placeId', element: <PlacePage /> },
      { path: 'plan', element: <PlanHub /> },
      { path: 'plan/before', element: <BeforeYouGo /> },
      { path: 'plan/getting-around', element: <GettingAround /> },
      { path: 'plan/routes', element: <DayRoutes /> },
      { path: 'plan/calendar', element: <YearAgenda /> },
      { path: 'plan/brummie', element: <SpeakBrummie /> },
      { path: 'plan/map', element: <MapPage /> },
      { path: 'useful-numbers', element: <UsefulNumbers /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
