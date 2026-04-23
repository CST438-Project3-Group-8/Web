import { useState } from "react";
import "./App.css";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";

function App() {
    const [currentPage, setCurrentPage] = useState<"login" | "signup">("login");

    return currentPage === "login" ? (
        <LoginPage onShowSignup={() => setCurrentPage("signup")} />
    ) : (
        <SignupPage onShowLogin={() => setCurrentPage("login")} />
    );
}

export default App;