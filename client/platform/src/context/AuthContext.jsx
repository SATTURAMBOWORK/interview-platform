import { useState } from "react";
import { AuthContext } from "./AuthContextValue";

export const AuthProvider = ({ children }) => {
  const getToken = () => {
    const t = localStorage.getItem("token");
    return t && t !== "null" && t !== "undefined" ? t : null;
  };

  const getRole = () => {
    const r = localStorage.getItem("role");
    return r && r !== "null" && r !== "undefined" ? r : null;
  };

  const [token, setToken] = useState(getToken);
  const [role, setRole] = useState(getRole);

  const login = (jwt, userRole) => {
    localStorage.setItem("token", jwt);
    localStorage.setItem("role", userRole);
    setToken(jwt);
    setRole(userRole);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setToken(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ token, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
