import "./App.css";
import { createHashRouter, Outlet, RouterProvider } from "react-router-dom"
import { MainLayout } from "./components/layout/main-layout";
import { DialogPage } from "./pages/dialog-page";
import { HomePage } from "./pages/home.page";
import { useGlobalState } from "./context/global-state.context";

const router = createHashRouter([
  {
    path: '/',
    element: <MainLayout><Outlet /></MainLayout>,
    children: [
      {
        path: "",
        element: <DialogPage />
      },
      {
        path: "home",
        element: <DialogPage />
      }
    ]
  }
])


function App() {
  const { projectId } = useGlobalState();
  if (!projectId) {
    return <HomePage />
  }
  return (
    <RouterProvider router={router} />
  );
}

export default App;
