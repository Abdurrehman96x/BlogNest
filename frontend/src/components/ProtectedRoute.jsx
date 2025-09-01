import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { setUser } from "@/redux/authSlice";

const ProtectedRoute = ({ children }) => {
  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const verify = async () => {
      // if no user in store → redirect to login
      if (!user) {
        setChecking(false);
        return;
      }
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/user/me`, { withCredentials: true });
        if (!cancelled && res?.data?.user) {
          // keep store fresh
          dispatch(setUser(res.data.user));
          // admin redirect protection
          const isAdmin = res.data.user.role === "admin" || res.data.user.isAdmin === true;
          const path = location.pathname || "";
          if (isAdmin && (path === "/dashboard" || path.startsWith("/dashboard"))) {
            navigate("/admin", { replace: true });
          }
        }
      } catch (err) {
        const status = err?.response?.status;
        const msg = err?.response?.data?.message || "";
        // 403 from backend means blocked
        if (status === 403) {
          dispatch(setUser(null));
          navigate("/blocked", { replace: true, state: { email: user?.email } });
          return;
        }
        if (status === 401) {
          dispatch(setUser(null));
          navigate("/login", { replace: true, state: { from: location } });
          return;
        }
      } finally {
        if (!cancelled) setChecking(false);
      }
    };

    verify();
    return () => { cancelled = true; };
  }, [user, dispatch, location, navigate]);

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (checking) return null; // or a small spinner

  return children;
};

export default ProtectedRoute;
