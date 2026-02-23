import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, Users, ShieldCheck, UserCircle } from "lucide-react";
import api from "../../api/axios";

function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await api.get("/users");
        const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setUsers(data);
        if (data.length > 0) setSelectedUserId(data[0]._id);
      } catch (err) {
        console.error("FETCH USERS ERROR:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      const roleMatch = role ? u.role === role : true;
      const searchMatch = q
        ? u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
        : true;
      return roleMatch && searchMatch;
    });
  }, [users, search, role]);

  const selectedUser = filteredUsers.find((u) => u._id === selectedUserId) || filteredUsers[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Users</h1>
            <p className="text-slate-600 mt-1">View and manage user details</p>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Users className="w-5 h-5" />
            <span className="font-semibold">Total: {users.length}</span>
          </div>
        </div>

        {/* SEARCH + FILTER */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col md:flex-row gap-3">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 w-full md:w-1/2">
            <Search className="w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none w-full text-sm"
            />
          </div>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
        </div>

        {/* CONTENT */}
        {loading ? (
          <div className="text-slate-500">Loading users...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-500">
            No users found
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* USER LIST */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-200 text-sm font-semibold text-slate-700">
                User List
              </div>
              <div className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <button
                    key={user._id}
                    onClick={() => setSelectedUserId(user._id)}
                    className={`w-full text-left px-4 py-4 flex items-center justify-between hover:bg-slate-50 transition ${
                      selectedUserId === user._id ? "bg-slate-50" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                        {user.name?.[0]?.toUpperCase() || "U"}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        user.role === "admin"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {user.role}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* USER DETAIL PANEL */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              {selectedUser ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg">
                      {selectedUser.name?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{selectedUser.name}</p>
                      <p className="text-sm text-slate-600">{selectedUser.email}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-slate-700">
                      <UserCircle className="w-4 h-4" />
                      <span className="text-sm">Role: {selectedUser.role}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <ShieldCheck className="w-4 h-4" />
                      <span className="text-sm">
                        Joined: {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : "N/A"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 text-xs text-slate-500">
                    More user actions can be added here (role update, deactivate, etc.)
                  </div>
                </motion.div>
              ) : (
                <div className="text-slate-500">Select a user to view details</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UsersPage;
