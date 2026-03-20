import { RouterProvider } from 'react-router';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ViewThemeProvider } from './context/ViewThemeContext';
import { router } from './routes'; // El archivo ahora es .tsx
import { Toaster } from 'sonner';
import 'leaflet/dist/leaflet.css';

export default function App() {
  return (
    <ThemeProvider>
      <ViewThemeProvider>
        <AuthProvider>
          <RouterProvider router={router} />
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </ViewThemeProvider>
    </ThemeProvider>
  );
}