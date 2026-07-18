import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { RideProvider } from './context/RideContext.jsx';
import { SocketProvider } from './context/SocketContext.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';
import { WalletProvider } from './context/WalletContext.jsx';
import { Toaster } from 'react-hot-toast';
import appRoutes from './routes/index.jsx';

const router = createBrowserRouter(appRoutes);

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <NotificationProvider>
          <RideProvider>
            <WalletProvider>
              <RouterProvider router={router} />
              <Toaster
                position="top-right"
                toastOptions={{
                  className: 'text-sm font-semibold rounded-2xl bg-white text-slate-900 border border-slate-200 shadow-xl shadow-slate-100/50',
                  duration: 4000,
                  style: {
                    padding: '12px 24px',
                  },
                }}
              />
            </WalletProvider>
          </RideProvider>
        </NotificationProvider>
      </SocketProvider>
    </AuthProvider>
  );
}
