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
    <div className="space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-[10px] font-black tracking-widest text-indigo-400 uppercase font-mono mb-2">
              User Management
            </div>
            <h1 className="text-4xl font-black text-white uppercase tracking-tight">Users</h1>
            <p className="text-slate-500 text-sm mt-1">View and manage user details</p>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <Users className="w-5 h-5 text-indigo-400" />
            <span className="font-black text-white font-mono">{users.length}</span>
            <span className="text-slate-500 text-sm">total</span>
          </div>
        </div>

        {/* SEARCH + FILTER */}
        <div className="bg-white/[0.03] rounded-2xl border border-white/[0.08] p-4 flex flex-col md:flex-row gap-3">
          <div className="flex items-center gap-2 bg-white/[0.05] border border-white/[0.1] rounded-xl px-3 py-2 w-full md:w-1/2">
            <Search className="w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none w-full text-sm text-white placeholder:text-slate-600"
            />
          </div>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="bg-[#0d0d1a] border border-white/[0.1] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-400/50"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
        </div>

        {/* CONTENT */}
        {loading ? (
          <div className="text-slate-500 font-mono text-sm">Loading users...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="bg-white/[0.03] rounded-2xl border border-white/[0.08] p-10 text-center text-slate-500">
            No users found
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* USER LIST */}
            <div className="lg:col-span-2 bg-white/[0.03] rounded-2xl border border-white/[0.08] overflow-hidden">
              <div className="px-4 py-3 border-b border-white/[0.08] text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono">
                User List
              </div>
              <div className="divide-y divide-white/[0.05]">
                {filteredUsers.map((user) => (
                  <button
                    key={user._id}
                    onClick={() => setSelectedUserId(user._id)}
                    className={`w-full text-left px-4 py-4 flex items-center justify-between hover:bg-white/[0.04] transition ${
                      selectedUserId === user._id ? "bg-indigo-500/[0.08] border-l-2 border-l-indigo-400" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-black text-sm">
                        {user.name?.[0]?.toUpperCase() || "U"}
                      </div>
                      <div>
                        <p className="font-semibold text-white text-sm">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-black px-2 py-1 rounded-lg font-mono uppercase ${
                        user.role === "admin"
                          ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                          : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      }`}
                    >
                      {user.role}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* USER DETAIL PANEL */}
            <div className="bg-white/[0.03] rounded-2xl border border-white/[0.08] p-6">
              {selectedUser ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center font-black text-lg text-white">
                      {selectedUser.name?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div>
                      <p className="font-black text-white">{selectedUser.name}</p>
                      <p className="text-xs text-slate-500">{selectedUser.email}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                      <UserCircle className="w-4 h-4 text-indigo-400" />
                      <span>Role: <span className="text-white font-semibold">{selectedUser.role}</span></span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>
                        Joined: <span className="text-white font-semibold">{selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : "N/A"}</span>
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 text-xs text-slate-600 font-mono">
                    More user actions can be added here (role update, deactivate, etc.)
                  </div>
                </motion.div>
              ) : (
                <div className="text-slate-500 text-sm">Select a user to view details</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UsersPage;
