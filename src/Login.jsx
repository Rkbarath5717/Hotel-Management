
import { useState } from "react";

const API_URL = "http://localhost:5000";

function LoginPage({
  onLogin,
  onRegister,
  isRegistered,
  onRegisterSuccess
}) {
  const [isLogin, setIsLogin] = useState(isRegistered);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!isLogin) {
      if (password.length < 8) {
        setError("Password must contain at least 8 characters.");
        return;
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
    }

    setLoading(true);

    try {
      const endpoint = isLogin
        ? "/api/auth/login"
        : "/api/auth/register";

      const body = isLogin
        ? { email: email.trim(), password }
        : {
            name: name.trim(),
            email: email.trim(),
            password,
            confirmPassword
          };

      const response = await fetch(API_URL + endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Something went wrong");
      }

      if (isLogin) {
        onLogin(result);
      } else {
        setMessage("Registration successful! Please login.");

        setName("");
        setPassword("");
        setConfirmPassword("");

        setIsLogin(true);

        if (onRegisterSuccess) {
          onRegisterSuccess();
        }
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setError("");
    setMessage("");
    setPassword("");
    setConfirmPassword("");

    if (isLogin && onRegister) {
      onRegister();
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1>Hotel Management</h1>

        <h2>{isLogin ? "Login Page" : "Create New Account"}</h2>

        {!isLogin && (
          <>
            <label>Full Name</label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </>
        )}

        <label>Email Address</label>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <label>Password</label>
        <input
          type="password"
          placeholder={isLogin ? "Enter your password" : "Minimum 8 characters"}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          minLength={isLogin ? undefined : 8}
          required
        />

        {!isLogin && (
          <>
            <label>Confirm Password</label>
            <input
              type="password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              minLength={8}
              required
            />
          </>
        )}

        {error && <p className="error">{error}</p>}
        {message && <p className="success">{message}</p>}

        <button type="submit" disabled={loading}>
          {loading
            ? "Please wait..."
            : isLogin
              ? "Login"
              : "Register"}
        </button>

        <h1 className="login-help">
          {isLogin ? "Don't have an account...?" : "Already registered?....."}
          {" "}
          <button
            type="button"
            className="text-button"
            onClick={switchMode}
          >
            {isLogin ? "Register here" : "Login here"}
          </button>
        </h1>

        {isLogin && (
          <p className="login-help">
            Admin : rkbarath5717@gmail.com
          </p>
        )}
      </form>
    </div>
  );
}

export default LoginPage;