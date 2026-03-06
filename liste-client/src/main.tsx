import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';

// correctly pages import
import Startseite from "./pages/Startseite";
import NeueListe from "./pages/NeueListe";
import ListenAnsicht from "./pages/ListenAnsicht";
import PersoenlicheAnsicht from "./pages/PersonlicheAnsicht";

const queryClient = new QueryClient();

// Router sitting to compare with my projekt
const router = createBrowserRouter([
  {
    path: "/",
    element: <Startseite />,
  },
  {
    path: "/neue-liste",
    element: <NeueListe />,
  },
  {
    path: "/liste/:key",
    element: <ListenAnsicht />,
  },
  {
    path: "/liste/:key/:submissionKey",
    element: <PersoenlicheAnsicht />,
  }
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
);
