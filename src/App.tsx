import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoutes";
import { ThemeProvider } from "./contexts/ThemeContext" 
import { AuthProvider } from "./contexts/AuthContext";
import { GamificationProvider } from "./contexts/GamificationContext";
import LoginPage from "./pages/Register/LoginPage";
import CreateAccountPage from "./pages/Register/CreateAccountPage";
import AppLayout from './layouts/AppLayout';
import Dashboard from './pages/Dashboard';
import GamesHome from "./pages/Games/GamesHomePage";
import PokerPage from "./pages/Games/PokerPage";
import BlackjackPage from "./pages/Games/BlackjackPage";
import ResetPasswordPage from "./pages/Register/ResetPasswordPage";

function App() {

  return (
    <BrowserRouter>
      <AuthProvider>
        <GamificationProvider>
          <ThemeProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/createAccount" element={<CreateAccountPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              {/* Protected Routes Wrapper */}
              <Route element={<ProtectedRoute />}>
                {/* Any route placed inside here requires login */}
                <Route path="/" element={<AppLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="games">
                    <Route index element={<GamesHome />} />
                    <Route path="blackjack" element={<BlackjackPage />} />
                    <Route path="poker" element={<PokerPage />} />
                  </Route>
                  {/*Will need to implement these pages*/}
                  {/*<Route path="lessons" element={<Lessons />} />
                  <Route path="leaderboard" element={<Leaderboard />} />
                  <Route path="account" element={<Account />} />*/}
                </Route>
              </Route>

              {/* Default Redirect */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </ThemeProvider>
        </GamificationProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
