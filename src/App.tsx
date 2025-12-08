import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoutes";
import { ThemeProvider } from "./contexts/ThemeContext" 
import { AuthProvider } from "./contexts/AuthContext";
import LoginPage from "./pages/Register/LoginPage";
import CreateAccountPage from "./pages/Register/CreateAccountPage";
import AppLayout from './layouts/AppLayout';
import Dashboard from './pages/Dashboard';

function App() {

  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/createAccount" element={<CreateAccountPage />} />

            {/* Protected Routes Wrapper */}
            <Route element={<ProtectedRoute />}>
              {/* Any route placed inside here requires login */}
              <Route path="/" element={<AppLayout />}>
                <Route index element={<Dashboard />} />
                {/*Will need to implement these pages*/}
                {/*<Route path="games" element={<Games />} />
                <Route path="lessons" element={<Lessons />} />
                <Route path="leaderboard" element={<Leaderboard />} />
                <Route path="settings" element={<Settings />} />
                <Route path="account" element={<Account />} />*/}
              </Route>
            </Route>

            {/* Default Redirect */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
