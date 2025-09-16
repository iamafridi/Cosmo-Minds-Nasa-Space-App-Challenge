import { createBrowserRouter } from "react-router";
import App from "../App";
import TerraEarthGame from "../sections/TerraEarthGame";

export const router = createBrowserRouter([
    {
        path: '/',
        element: <App />
    },
    {
        path: '/terra-game',
        element: <TerraEarthGame />
    }
])