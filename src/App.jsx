import { LoaderProvider } from "./context/LoaderContext";
import AppRoutes from "./routes/AppRoutes";
import { Toaster } from "react-hot-toast";

export default function App() {

  return (
    <LoaderProvider>
      <AppRoutes />
      <Toaster position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 3500,
        }} />
    </LoaderProvider>
  );
}