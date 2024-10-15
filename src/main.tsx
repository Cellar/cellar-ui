import 'normalize.css'
import './index.css'

import React from 'react'
import ReactDOM from 'react-dom/client'

import App from './App'
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import {CreateSecret} from "./pages/CreateSecret";
import {AccessSecret} from "./pages/AccessSecret";
import {NotFound} from "./pages/NotFound";
import {SecretMetadata} from "./pages/SecretMetadata";

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <NotFound />,
    children: [
      {
        path: '/',
        element: <CreateSecret />
      },
      {
        path: '/create',
        element: <CreateSecret />
      },
      {
        path: '/secret',
        element: <AccessSecret />
      },
      {
        path: '/secret/metadata',
        element: <SecretMetadata />
      },
    ]
  }
])

const root = ReactDOM.createRoot(document.getElementById('root')!)

root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
