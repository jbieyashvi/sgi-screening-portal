import { useState } from "react";
import { X, Plus, Pencil } from "lucide-react";
import { useApp } from "../store";

const TABS = ["Users", "Roles & Permissions"];

const ROLE_OPTIONS = ["Admin", "Recruiter", "Hiring Manager", "Viewer"];

const SEED_USERS = [
  { name: "Candace W.", email: "candace.w@safeguard.com", role: "Recruiter", active: true, lastLogin: "2 min ago" },
  { name: "Marcus Johnson", email: "marcus.johnson@safeguard.com", role: "Hiring Manager", active: true, lastLogin: "1 hr ago" },
  { name: "Spencer Strobel", email: "spencer.strobel@safeguard.com", role: "Recruiter", active: true, lastLogin: "Yesterday" },
  { name: "Admin User", email: "admin@safeguard.com", role: "Admin", active: true, lastLogin: "3 days ago" },
];

const PERMS = [
  "View Candidates",
  "Screen Candidates",
  "Decline Candidates",
  "Upload Resumes",
  "Manage Users",
  "View Analytics",
  "Edit Requisitions",
];

const ROLE_PERMS = {
  Admin: PERMS.reduce((m, p) => ({ ...m, [p]: true }), {}),
  Recruiter: { "View Candidates": true, "Screen Candidates": true, "Decline Candidates": true, "Upload Resumes": true, "Manage Users": false, "View Analytics": true, "Edit Requisitions": false },
  "Hiring Manager": { "View Candidates": true, "Screen Candidates": true, "Decline Candidates": true, "Upload Resumes": false, "Manage Users": false, "View Analytics": true, "Edit Requisitions": true },
  Viewer: { "View Candidates": true, "Screen Candidates": false, "Decline Candidates": false, "Upload Resumes": false, "Manage Users": false, "View Analytics": true, "Edit Requisitions": false },
};

export default function Settings() {
  const { showToast } = useApp();
  const [tab, setTab] = useState("Users");

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <h1 className="text-2xl font-semibold text-slate-900">Users</h1>
      <p className="text-slate-500 text-sm mt-1 mb-5">Manage team members, roles, and permissions.</p>

      {/* sub-nav tabs */}
      <div className="border-b border-[#f0f0f0] flex gap-1 mb-6">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`text-[13px] font-medium px-3 py-2.5 border-b-2 -mb-px transition ${
              tab === t ? "border-sgi text-[#1a1a1a]" : "border-transparent text-[#888] hover:text-[#1a1a1a]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Users" && <UsersTab showToast={showToast} />}
      {tab === "Roles & Permissions" && <RolesTab />}
    </div>
  );
}

/* ------------------------------- Users ---------------------------------- */

function UsersTab({ showToast }) {
  const [users, setUsers] = useState(SEED_USERS);
  const [invite, setInvite] = useState(false);

  const setRole = (i, role) => setUsers((u) => u.map((x, j) => (j === i ? { ...x, role } : x)));
  const toggleActive = (i) => setUsers((u) => u.map((x, j) => (j === i ? { ...x, active: !x.active } : x)));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[15px] font-semibold text-slate-900">User Management</h2>
        <button
          onClick={() => setInvite(true)}
          className="h-8 px-3.5 inline-flex items-center gap-1.5 bg-[#023E8A] text-white rounded-md text-[13px] font-medium hover:bg-[#1A5EBF] transition"
        >
          <Plus size={14} /> Invite User
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#fbfbfc] text-[11px] uppercase tracking-wide text-[#8a93a0]">
            <tr>
              <th className="px-5 py-2.5 font-semibold">Name</th>
              <th className="px-3 py-2.5 font-semibold">Email</th>
              <th className="px-3 py-2.5 font-semibold">Role</th>
              <th className="px-3 py-2.5 font-semibold">Status</th>
              <th className="px-3 py-2.5 font-semibold">Last Login</th>
              <th className="px-3 py-2.5 font-semibold text-right pr-5">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={u.email} className="border-t border-[#f3f4f6] text-[13px]">
                <td className="px-5 py-3 font-medium text-slate-900">{u.name}</td>
                <td className="px-3 py-3 text-slate-600">{u.email}</td>
                <td className="px-3 py-3">
                  <select
                    value={u.role}
                    onChange={(e) => setRole(i, e.target.value)}
                    className="text-[12px] font-medium text-[#023E8A] bg-[#EFF6FF] border border-[#BFDBFE] rounded-full px-2.5 py-[3px] focus:outline-none cursor-pointer"
                  >
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-3">
                  <button
                    onClick={() => toggleActive(i)}
                    className="inline-flex items-center gap-2"
                    title="Toggle status"
                  >
                    <span className={`relative w-8 h-[18px] rounded-full transition ${u.active ? "bg-[#023E8A]" : "bg-slate-300"}`}>
                      <span className={`absolute top-[2px] w-3.5 h-3.5 rounded-full bg-white transition-all ${u.active ? "left-[16px]" : "left-[2px]"}`} />
                    </span>
                    <span className={`text-[12px] ${u.active ? "text-slate-700" : "text-slate-400"}`}>
                      {u.active ? "Active" : "Inactive"}
                    </span>
                  </button>
                </td>
                <td className="px-3 py-3 text-slate-500">{u.lastLogin}</td>
                <td className="px-3 py-3 pr-5 text-right whitespace-nowrap">
                  <button
                    onClick={() => showToast(`Editing ${u.name}`)}
                    className="inline-flex items-center gap-1 text-[12px] text-sgi hover:underline mr-3"
                  >
                    <Pencil size={12} /> Edit
                  </button>
                  <button
                    onClick={() => { toggleActive(i); showToast(`${u.name} ${u.active ? "deactivated" : "reactivated"}`); }}
                    className="text-[12px] text-[#DC2626] hover:underline"
                  >
                    {u.active ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {invite && <InviteModal onClose={() => setInvite(false)} showToast={showToast} />}
    </div>
  );
}

function InviteModal({ onClose, showToast }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Recruiter");
  return (
    <div onClick={onClose} className="fixed inset-0 z-[70] bg-black/40 grid place-items-center px-4">
      <div onClick={(e) => e.stopPropagation()} className="relative w-[420px] max-w-full bg-white rounded-[12px] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.25)] p-6">
        <button onClick={onClose} className="absolute top-3 right-3 p-1 rounded-md text-[#888] hover:bg-[#f5f5f5]" aria-label="Close">
          <X size={16} />
        </button>
        <h3 className="text-[15px] font-semibold text-[#1a1a1a] mb-4">Invite User</h3>
        <label className="block text-[11px] uppercase tracking-wide font-medium text-[#94A3B8] mb-1">Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="name@safeguard.com"
          className="w-full h-9 px-3 mb-4 border border-[#E2E8F0] rounded-md text-[13px] focus:outline-none focus:border-sgi-400 focus:shadow-[0_0_0_3px_rgba(2,62,138,0.1)]"
        />
        <label className="block text-[11px] uppercase tracking-wide font-medium text-[#94A3B8] mb-1">Role</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full h-9 px-3 mb-5 border border-[#E2E8F0] rounded-md text-[13px] bg-white focus:outline-none focus:border-sgi-400"
        >
          {ROLE_OPTIONS.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <button
          disabled={!email.trim()}
          onClick={() => { showToast(`Invite sent to ${email}`); onClose(); }}
          className="w-full h-9 rounded-md bg-[#023E8A] text-white text-[13px] font-medium hover:bg-[#1A5EBF] transition disabled:opacity-40"
        >
          Send Invite
        </button>
      </div>
    </div>
  );
}

/* --------------------------- Roles & Permissions ------------------------- */

function RolesTab() {
  const [perms, setPerms] = useState(ROLE_PERMS);
  const toggle = (role, perm) =>
    setPerms((m) => ({ ...m, [role]: { ...m[role], [perm]: !m[role][perm] } }));

  return (
    <div className="grid grid-cols-2 gap-5">
      {ROLE_OPTIONS.map((role) => (
        <div key={role} className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-[14px] font-semibold text-slate-900 mb-3">{role}</h3>
          <ul className="space-y-2">
            {PERMS.map((perm) => (
              <li key={perm}>
                <label className="flex items-center gap-2.5 text-[13px] text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!perms[role][perm]}
                    onChange={() => toggle(role, perm)}
                    className="minicheck"
                  />
                  {perm}
                </label>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

