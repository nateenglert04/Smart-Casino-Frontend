import { Routes, Route, BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext" 
import LoginPage from "./pages/Register/LoginPage";

function App() {

  return (
    <BrowserRouter>
      <ThemeProvider>
        <Routes>
          {/* Add Routes here with relevant paths and page references*/}
          <Route path="/" element={<LoginPage />} /> {/*Change to /login once authentication is implemented*/}
        </Routes>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
