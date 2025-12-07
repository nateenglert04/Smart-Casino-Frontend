import { Routes, Route, BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext" 
import LoginPage from "./pages/Register/LoginPage";
import CreateAccountPage from "./pages/Register/CreateAccountPage";

function App() {

  return (
    <BrowserRouter>
      <ThemeProvider>
        <Routes>
          {/* Add Routes here with relevant paths and page references*/}
          <Route path="/" element={<LoginPage />} /> {/*Change to /login once authentication is implemented*/}
          <Route path="/createAccount" element={<CreateAccountPage />} />
        </Routes>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
