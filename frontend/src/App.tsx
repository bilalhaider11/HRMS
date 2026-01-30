import { BrowserRouter as Router } from "react-router-dom";
import AppContent from "./app/AppContent";
import { ThemeProvider } from "../src/app/ThemeContext";
import { VerifyContextProvider } from "../src/app/VerifyContext";
import "./App.css";

function App() {
  return (
    <ThemeProvider>
      <VerifyContextProvider>
        <Router>
          <AppContent />
        </Router>
      </VerifyContextProvider>
    </ThemeProvider>
  );
}

export default App;
