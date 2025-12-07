import { Routes, Route, BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext" 
import { AuthProvider } from "./contexts/AuthContext";
import LoginPage from "./pages/Register/LoginPage";
import CreateAccountPage from "./pages/Register/CreateAccountPage";

function App() {

  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <Routes>
            {/* Add Routes here with relevant paths and page references*/}
            <Route path="/login" element={<LoginPage />} /> {/*Change to /login once authentication is implemented*/}
            <Route path="/createAccount" element={<CreateAccountPage />} />
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
