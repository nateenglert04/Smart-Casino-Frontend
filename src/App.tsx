import { Routes, Route, BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext" 

function App() {

  return (
    <BrowserRouter>
      <ThemeProvider>
        <Routes>
          {/* Add Routes here with relevant paths and page references*/}
        </Routes>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
