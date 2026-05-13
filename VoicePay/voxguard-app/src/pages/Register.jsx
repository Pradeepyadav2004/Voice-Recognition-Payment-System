import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [balance, setBalance] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await axios.post(
        "http://localhost:8080/api/auth/register",
        { name, email, password }
      );

      alert("Registration Successful! Please login.");
      navigate("/");

    } catch (err) {
      setError("Registration Failed");
    }

    setLoading(false);
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Create Account</h2>
        <p className="subtitle">Register to use VoxGuard</p>

        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Full Name"
            required
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="email"
            placeholder="Email"
            required
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            required
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* <input
            type="number"
            placeholder="Initial Balance"
            required
            onChange={(e) => setBalance(e.target.value)}
          /> */}

          {error && <p className="error">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="link">
          Already have an account?{" "}
          <span onClick={() => navigate("/")}>
            Login
          </span>
        </p>
      </div>
    </div>
  );
}

export default Register;
