import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loading from "../components/Loading";

export default function GoogleSuccess() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const userParam = params.get("user");

    setTimeout(() => {
      if (token && userParam) {
        const user = JSON.parse(decodeURIComponent(userParam));
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        setUser(user);
        navigate("/dashboard");
      } else {
        navigate("/auth?error=google_auth_failed");
      }
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) return <Loading />;

  return <div>Signing you in with Google...</div>;
}
