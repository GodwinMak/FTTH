import { Navigate, Outlet } from "react-router-dom";
import { useAuthContext } from "./hooks/useAuthContext";

const PrivateRoute = ({ allowed }) => {
    const user = JSON.parse(localStorage.getItem("userData"));


  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;