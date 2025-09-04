import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import Layout from "./routes/Layout.jsx";
import NotesList from "./pages/NotesList.jsx";
import NoteDetails from "./pages/NoteDetails.jsx";
import Tags from "./pages/Tags.jsx";
import NotFound from "./pages/NotFound.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Logout from "./pages/Logout.jsx";
import Account from "./pages/Account.jsx";
import { RequireAuth, RequireGuest } from "./routes/Guards.jsx";
import Starred from "./pages/Starred.jsx";
import TagNotes from "./pages/TagNotes.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <NotesList /> },
      { path: "notes/:id", element: <NoteDetails /> },
      { path: "tags", element: <Tags /> },
      { path: "*", element: <NotFound /> },
      { path: "/starred", element: <Starred /> },
      { path: "/tags/:tagId", element: <TagNotes /> },
      { path: "/account", element: (
        <RequireAuth>
          <Account />
        </RequireAuth>
      ) },
      { path: "/login", element: (
        <RequireGuest>
          <Login />
        </RequireGuest>
      ) },
      { path: "/signup", element: (
        <RequireGuest>
          <Signup />
        </RequireGuest>
      ) },
      { path: "/logout", element: (
        <RequireAuth>
          <Logout />
        </RequireAuth>
      ) },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
