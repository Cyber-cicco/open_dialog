import "./App.css";
import { createHashRouter, Outlet, RouterProvider } from "react-router-dom"
import { MainLayout } from "./components/layout/main-layout";
import { OuterDialogPage } from "./pages/dialog-page";
import { HomePage } from "./pages/home.page";
import { useGlobalState } from "./context/global-state.context";
import { CharacterPage } from "./pages/character-page";
import { ProjectPage } from "./pages/project-page";

const router = createHashRouter([
  {
    path: '/',
    element: <MainLayout><Outlet /></MainLayout>,
    errorElement: <MainLayout><ProjectPage/></MainLayout>,
    children: [
      {
        path: "",
        element: <ProjectPage />
      },
      {
        path: "dialog/:id",
        element: <OuterDialogPage />
      },
      {
        path: "character/:id",
        element: <CharacterPage />
      }
    ]
  }
])


function App() {
  const { project } = useGlobalState();
  if (!project) {
    return <HomePage />
  }
  return (
    <RouterProvider router={router} />
  );
}

export default App;
