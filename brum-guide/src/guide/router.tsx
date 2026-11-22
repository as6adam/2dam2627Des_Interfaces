import { createHashRouter } from 'react-router';
import { GuideLayout } from './GuideLayout';
import { UsefulNumbers } from './UsefulNumbers';
import { HomePage } from './HomePage';
import { SectorPage } from './SectorPage';
import { PlacePage } from './PlacePage';
import { NotFoundPage } from './NotFoundPage';

/**
 * Navegación por hash: #/ · #/sector/:sectorId · #/sector/:sectorId/:placeId · resto → 404.
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
      { path: 'useful-numbers', element: <UsefulNumbers /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
