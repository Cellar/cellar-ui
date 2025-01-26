import "normalize.css";
import "./index.css";

import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { CreateSecret } from "./pages/CreateSecret";
import { AccessSecret, AccessSecretLoader } from "./pages/AccessSecret";
import { NotFound } from "./pages/NotFound";
import { SecretMetadata, SecretMetadataLoader } from "./pages/SecretMetadata";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <NotFound />,
    children: [
      {
        path: "/",
        element: <CreateSecret />,
      },
      {
        path: "/secret/create",
        element: <CreateSecret />,
      },
      {
        path: "/secret/:secretId/access",
        element: <AccessSecret />,
        loader: AccessSecretLoader,
      },
      {
        path: "/secret/:secretId",
        element: <SecretMetadata />,
        loader: SecretMetadataLoader,
      },
    ],
  },
]);

const root = ReactDOM.createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
