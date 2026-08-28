import { createBrowserRouter, RouterProvider, type RouteObject } from 'react-router-dom';
import { RootLayout } from '@/components/layout/RootLayout';
import { ROUTES } from '@/app/routes';
import NotFound from '@/pages/NotFound';

/**
 * Router assembly.
 *
 * Every child route is generated from the route table in `app/routes.tsx` —
 * this file contains no page-specific knowledge and should not need editing
 * when pages are added.
 */
const children: RouteObject[] = ROUTES.map((route) =>
  route.path === '/'
    ? { index: true, element: <route.Component /> }
    : { path: route.path.slice(1), element: <route.Component /> },
);

children.push({ path: '*', element: <NotFound /> });

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children,
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
