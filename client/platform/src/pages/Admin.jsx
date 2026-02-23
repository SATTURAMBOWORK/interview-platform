import { useEffect } from "react";
import api from "../api/axios";

function Admin() {
  useEffect(() => {
    api.get("/admin/protected-route")
      .then(() => console.log("Admin verified"))
      .catch(() => alert("Unauthorized"));
  }, []);

  return <h1>Admin Dashboard</h1>;
}

export default Admin;
