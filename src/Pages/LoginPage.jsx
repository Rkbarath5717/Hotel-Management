
import { useState } from "react";

const API_URL = "http://localhost:5000";

function LoginPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Password and Confirm Password do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        API_URL + "/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            password: password,
            confirmPassword: confirmPassword
          })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Registration failed");
      }

      setMessage("Registration successful!");

      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleRegister}>
        <h1>Hotel Management</h1>

        <h2>Create Your Account</h2>

        <label>Full Name</label>
        <input
          type="text"
          placeholder="Enter your full name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />

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
          placeholder="Minimum 8 characters"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          minLength={8}
          required
        />

        <label>Confirm Password</label>
        <input
          type="password"
          placeholder="Re-enter your password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          minLength={8}
          required
        />

        {error && <p className="error">{error}</p>}

        {message && <p className="success">{message}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
}

export default LoginPage;