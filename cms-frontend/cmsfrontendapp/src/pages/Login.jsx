import { useState } from "react";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();

    console.log("LOGIN BUTTON CLICKED");

    setError("");
    setLoading(true);

    try {
      // STEP 1: Login and get JWT tokens
      const response = await fetch(
        "http://127.0.0.1:8000/api/auth/login/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: username,
            password: password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError("Invalid username or password.");
        setLoading(false);
        return;
      }

      // Save JWT tokens
      localStorage.setItem("accessToken", data.access);
      localStorage.setItem("refreshToken", data.refresh);

      // STEP 2: Get logged-in user's information
      const meResponse = await fetch(
        "http://127.0.0.1:8000/api/auth/me/",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${data.access}`,
          },
        }
      );

      const userData = await meResponse.json();

      if (!meResponse.ok) {
        setError("Unable to get user information.");
        setLoading(false);
        return;
      }

      // Check the actual user information returned by backend
      console.log("LOGGED IN USER:", userData);
      console.log("USER ROLE:", userData.role);

      // Save user information
      localStorage.setItem("user", JSON.stringify(userData));

      // STEP 3: Redirect according to role
      if (userData.role === "ADMIN") {
        window.location.href = "/admin";
      } else if (userData.role === "DOCTOR") {
        window.location.href = "/doctor";
      } else if (userData.role === "RECEPTIONIST") {
        window.location.href = "/receptionist";
      } else if (userData.role === "PHARMACIST") {
        window.location.href = "/pharmacist";
      } else if (userData.role === "LAB_TECHNICIAN") {
        window.location.href = "/lab-technician";
      } else {
        setError("Unknown user role.");
      }

    } catch (error) {
      console.error("LOGIN ERROR:", error);
      setError("Unable to connect to the server.");
    }

    setLoading(false);
  };

  return (
    <div className="login-page">

      <div className="login-card">

        <h1>Clinic Management System</h1>

        <h2>Login</h2>

        <form onSubmit={handleLogin}>

          <div className="form-group">

            <label>Username</label>

            <input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(event) =>
                setUsername(event.target.value)
              }
              required
            />

          </div>

          <div className="form-group">

            <label>Password</label>

            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              required
            />

          </div>

          {error && (
            <p className="login-error">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

      </div>

    </div>
  );
}

export default Login;