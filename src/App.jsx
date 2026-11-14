import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./Components/Navbar";
import LoginPage from "./Login";
import HotelListPage from "./Pages/HotelListPage";
import HotelDetailPage from "./Pages/HotelDetailPage";

function App() {
  const [login, setLogin] = useState(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const email = localStorage.getItem("email");

    if (token && (role === "admin" || role === "user")) {
      return {
        token: token,
        role: role,
        email: email
      };
    }

    return null;
  });

  const [isRegistered, setIsRegistered] = useState(false);

  const handleLogin = (result) => {
    localStorage.setItem("token", result.token);
    localStorage.setItem("role", result.role);
    localStorage.setItem("email", result.email);

    setLogin(result);
  };

  const handleRegisterSuccess = () => {
    setIsRegistered(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");

    setLogin(null);
    setIsRegistered(true);
  };

  if (!login) {
    return (
      <LoginPage
        onLogin={handleLogin}
        isRegistered={isRegistered}
        onRegisterSuccess={handleRegisterSuccess}
      />
    );
  }

  return (
    <>
      <Navbar />

      <div className="user-bar">
        <span>
          {login.role.toUpperCase()} : {login.email}
        </span>

        <button onClick={handleLogout}>
          Logout
        </button>
      </div>

      <Routes>
        <Route
          path="/"
          element={<Navigate to="/hotels" replace />}
        />

        <Route
          path="/hotels"
          element={<HotelListPage role={login.role} />}
        />

        <Route
          path="/hotels/:id"
          element={<HotelDetailPage />}
        />

        <Route
          path="*"
          element={<Navigate to="/hotels" replace />}
        />
      </Routes>
    </>
  );
}

export default App;
