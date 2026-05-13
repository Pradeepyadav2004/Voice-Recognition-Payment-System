import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          "http://localhost:8080/api/user/me",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        setUser(res.data);

      } catch (err) {
        navigate("/");
      }
    };

    fetchUser();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Welcome {user?.name}</h2>

        <h3>Balance: ₹ {user?.balance}</h3>

        <button onClick={() => navigate("/send")}>
          Send Money
        </button>

        <button onClick={() => navigate("/enroll")}>
          Enroll Voice
        </button>

        <button
          onClick={handleLogout}
          style={{ background: "red", marginTop: "10px" }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
