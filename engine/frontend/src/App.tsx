import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ClerkProvider } from '@clerk/clerk-react';
import { store } from './store/store';
import { ConfigProvider } from './contexts/ConfigContext';
import { DynamicThemeProvider } from './contexts/DynamicThemeProvider';
import { GlobalStyle } from './styles/GlobalStyle';
import SurveyPage from './pages/SurveyPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminDisabled from './pages/AdminDisabled';
import ClerkPrivateRoute from './components/Admin/ClerkPrivateRoute';
import ClerkSignIn from './pages/ClerkSignIn';
import ClerkSignUp from './pages/ClerkSignUp';
import ErrorBoundary from './components/ErrorBoundary';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '';

// Optional Clerk wrapper - only enables if publishable key is configured
// This allows the survey to run without Clerk (admin features will be disabled)
const OptionalClerkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();

  // If no Clerk key, just render children (admin will be disabled)
  if (!clerkPubKey) {
    console.warn('Clerk not configured - admin features will be disabled. Set VITE_CLERK_PUBLISHABLE_KEY to enable.');
    return <>{children}</>;
  }

  // If Clerk key exists, wrap with ClerkProvider
  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      routerPush={(to) => navigate(to)}
      routerReplace={(to) => navigate(to, { replace: true })}
    >
      {children}
    </ClerkProvider>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <ConfigProvider>
          <Router>
            <OptionalClerkProvider>
              <DynamicThemeProvider>
                <GlobalStyle />
                <Routes>
                  <Route path="/" element={<SurveyPage />} />
                  {clerkPubKey ? (
                    <>
                      <Route path="/admin/sign-in/*" element={<ClerkSignIn />} />
                      <Route path="/admin/sign-up/*" element={<ClerkSignUp />} />
                      <Route
                        path="/admin/*"
                        element={
                          <ClerkPrivateRoute>
                            <AdminDashboard />
                          </ClerkPrivateRoute>
                        }
                      />
                    </>
                  ) : (
                    <Route path="/admin/*" element={<AdminDisabled />} />
                  )}
                </Routes>
              </DynamicThemeProvider>
            </OptionalClerkProvider>
          </Router>
        </ConfigProvider>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;
