import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Startseite from "./pages/Startseite";
import NeueListe from "./pages/NeueListe";
import ListenAnsicht from "./pages/ListenAnsicht";

const router = createBrowserRouter([
  { path: "/", element: <Startseite /> },
  { path: "/neue-liste", element: <NeueListe /> },
  { path: "/liste/:key/:submissionKey?", element: <ListenAnsicht /> },
]);

export default function App() {
  return <RouterProvider router={router} />;
}