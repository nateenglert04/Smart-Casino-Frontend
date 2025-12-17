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
import BlackjackPage from "./pages/Games/BlackjackPage";
import ResetPasswordPage from "./pages/Register/ResetPasswordPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import CoursesHomePage from "./pages/Courses/CoursesHomePage";
import LessonViewer from "./pages/Courses/LessonViewer";
import AccountPage from "./pages/AccountPage";

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
                  </Route>
                  <Route path="leaderboard" element={<LeaderboardPage />} />
                  <Route path="lessons">
                    <Route index element={<CoursesHomePage />} />
                    <Route path=":courseId" element={<LessonViewer />} />
                  </Route>
                  <Route path="account" element={<AccountPage />} />
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
