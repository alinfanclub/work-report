import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import MainPage from "./pages/MainPage";
import WritePage from "./pages/WritePage";
import LoginPage from "./pages/LoginPage";
import CreateUser from "./pages/CreateUser";
import ViewReport from "./pages/ViewReport";
import FixReportPage from "./pages/FixReportPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <MainPage />,
        path: "/",
      },
      {
        path: "/write",
        element: <WritePage />,
      },
      {
        path: "/reports/:id",
        element: <ViewReport />,
      },
      {
        path: "/reports/:id/fix",
        element: <FixReportPage />,
      },
    ],
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/join",
    element: <CreateUser />,
  },
]);

const queryClient = new QueryClient();

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <QueryClientProvider client={queryClient}>
    <RouterProvider router={router}>
      <App />
    </RouterProvider>
  </QueryClientProvider>
);
