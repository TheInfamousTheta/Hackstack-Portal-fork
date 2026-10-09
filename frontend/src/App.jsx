import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ModulesProvider } from "./context/ModulesContext";
import { ThemeProvider } from "./context/ThemeContext";
import { AppLayout } from "./components/AppLayout";
import AuthCallback from "./pages/AuthCallback";
import Dashboard from "./pages/Dashboard";
import ModuleCatalog from "./pages/ModuleCatalog";
import ModuleDetail from "./pages/ModuleDetail";
import Leaderboard from "./pages/Leaderboard";
import Onboarding from "./pages/Onboarding";
import Login from "./pages/Login";
import PublicCertificatePage from "./pages/PublicCertificatePage";

// ── Admin imports ─────────────────────────────────────────────────────────────
import AdminLogin from "../adminportal/admin-login";
import AdminDashboard from "../adminportal/admin-dashboard";
import CreateModule from "../adminportal/create-module";
import EditModule from "../adminportal/edit-module";
import DeleteModule from "../adminportal/delete-module";
import AdminLeaderboard from "../adminportal/leaderboard";
import AdminUsers from "../adminportal/admin-users";
import AdminNotifications from "../adminportal/admin-notifications";
import AdminProtectedRoute from "../adminportal/admin-protected-route";
import { AdminAuthProvider } from "../adminportal/admin-auth-context";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [loading, user]);

  useEffect(() => {
    if (!loading && user && !user.profileCompleted) {
      navigate('/onboarding');
    }
  }, [loading, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex justify-center items-center">
        Loading...
      </div>
    );
  }

  if (!user || !user.profileCompleted) {
    return null;
  }

  return children;
};

const ProtectedApp = ({ children }) => (
  <ProtectedRoute>
    <ModulesProvider>
      <AppLayout>{children}</AppLayout>
    </ModulesProvider>
  </ProtectedRoute>
);

const AdminApp = () => (
                <AdminAuthProvider>
                  <Routes>
                    <Route path="login" element={<AdminLogin />} />

                    <Route
                      path="dashboard"
                      element={
                        <AdminProtectedRoute>
                          <AdminDashboard />
                        </AdminProtectedRoute>
                      }
                    />
                  <Route
                      path="modules/create"
                      element={
                        <AdminProtectedRoute>
                          <CreateModule />
                        </AdminProtectedRoute>
                      }
                    />
                    <Route
                      path="modules/edit"
                      element={
                        <AdminProtectedRoute>
                          <EditModule />
                        </AdminProtectedRoute>
                      }
                    />
                    <Route
                      path="modules/edit/:id"
                      element={
                        <AdminProtectedRoute>
                          <EditModule />
                        </AdminProtectedRoute>
                      }
                    />
                    <Route
                      path="modules/delete"
                      element={
                        <AdminProtectedRoute>
                          <DeleteModule />
                        </AdminProtectedRoute>
                      }
                    />
                    <Route
                      path="leaderboard"
                      element={
                        <AdminProtectedRoute>
                          <AdminLeaderboard />
                        </AdminProtectedRoute>
                      }
                    />
                    <Route
                      path="users"
                      element={
                        <AdminProtectedRoute>
                          <AdminUsers />
                        </AdminProtectedRoute>
                      }
                    />
                    <Route
                      path="notifications"
                      element={
                        <AdminProtectedRoute>
                          <AdminNotifications />
                        </AdminProtectedRoute>
                      }
                    />
                  </Routes>
                </AdminAuthProvider>
)

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router basename="/hackstack">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/auth-callback" element={<AuthCallback />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/certificate/:certCode" element={<PublicCertificatePage />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedApp>
                  <Dashboard />
                </ProtectedApp>
              }
            />
            <Route
              path="/modules"
              element={
                <ProtectedApp>
                  <ModuleCatalog />
                </ProtectedApp>
              }
            />
            <Route
              path="/modules/:slug"
              element={
                <ProtectedApp>
                  <ModuleDetail />
                </ProtectedApp>
              }
            />
            <Route
              path="/leaderboard"
              element={
                <ProtectedApp>
                  <Leaderboard />
                </ProtectedApp>
              }
            />
            <Route
              path="/admin/*"
              element={
                <AdminApp/>
              }
            />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};



export default App;
