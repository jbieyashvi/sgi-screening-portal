import { useState } from "react";
import { X, Plus, Pencil, Trash2 } from "lucide-react";
import { useApp } from "../store";

const TABS = ["Users", "Roles", "Permissions"];
const ROLE_OPTIONS = ["Admin", "Hiring Manager", "Recruiter", "Interviewer", "Coordinator", "Reviewer"];

const SEED_USERS = [
  { name: "Jatin Sharma", email: "jatin.sharma@safeguard.com", role: "Admin", active: true, invite: "Active", color: "bg-blue-100 text-blue-700" },
  { name: "Yashvi Patel", email: "yashvi.patel@safeguard.com", role: "Hiring Manager", active: true, invite: "Active", color: "bg-teal-100 text-teal-700" },
  { name: "Rahul Verma", email: "rahul.verma@safeguard.com", role: "Recruiter", active: true, invite: "Active", color: "bg-green-100 text-green-700" },
  { name: "Priya Nair", email: "priya.nair@safeguard.com", role: "Interviewer", active: true, invite: "Active", color: "bg-red-100 text-red-700" },
  { name: "Arjun Singh", email: "arjun.singh@safeguard.com", role: "Coordinator", active: false, invite: "Invited", color: "bg-orange-100 text-orange-700" },
  { name: "Divya Menon", email: "divya.menon@safeguard.com", role: "Recruiter", active: true, invite: "Active", color: "bg-amber-100 text-amber-700" },
  { name: "Karan Mehta", email: "karan.mehta@safeguard.com", role: "Reviewer", active: false, invite: "Pending", color: "bg-teal-100 text-teal-700" },
];

const ROLES = [
  { name: "Admin", desc: "Full system access", users: 1 },
  { name: "Hiring Manager", desc: "Oversees hiring", users: 1 },
  { name: "Recruiter", desc: "Sources candidates", users: 2 },
  { name: "Interviewer", desc: "Conducts interviews", users: 1 },
  { name: "Coordinator", desc: "Manages scheduling", users: 1 },
  { name: "Reviewer", desc: "Reviews profiles", users: 1 },
];

const STAGES = ["View Candidates", "Accept/Reject", "Upload Resumes", "Use Ask AI", "View Analytics", "Manage Users", "Sync ADP"];
const ACCESS = ["Full Access", "Edit Access", "View Only", "No Access"];

const PERM_MATRIX = {
  Admin: { "View Candidates": "Full Access", "Accept/Reject": "Full Access", "Upload Resumes": "Full Access", "Use Ask AI": "Full Access", "View Analytics": "Full Access", "Manage Users": "Full Access", "Sync ADP": "Full Access" },
  "Hiring Manager": { "View Candidates": "View Only", "Accept/Reject": "View Only", "Upload Resumes": "No Access", "Use Ask AI": "View Only", "View Analytics": "Full Access", "Manage Users": "No Access", "Sync ADP": "No Access" },
  Recruiter: { "View Candidates": "Full Access", "Accept/Reject": "Full Access", "Upload Resumes": "Full Access", "Use Ask AI": "Full Access", "View Analytics": "View Only", "Manage Users": "No Access", "Sync ADP": "Edit Access" },
  Interviewer: { "View Candidates": "View Only", "Accept/Reject": "No Access", "Upload Resumes": "No Access", "Use Ask AI": "No Access", "View Analytics": "No Access", "Manage Users": "No Access", "Sync ADP": "No Access" },
  Coordinator: { "View Candidates": "View Only", "Accept/Reject": "View Only", "Upload Resumes": "Edit Access", "Use Ask AI": "No Access", "View Analytics": "No Access", "Manage Users": "No Access", "Sync ADP": "No Access" },
  Reviewer: { "View Candidates": "View Only", "Accept/Reject": "No Access", "Upload Resumes": "No Access", "Use Ask AI": "No Access", "View Analytics": "No Access", "Manage Users": "No Access", "Sync ADP": "No Access" },
};

const initials = (name) => name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();

export default function Settings() {
  const { showToast } = useApp();
  const [tab, setTab] = useState("Users");

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <h1 className="text-2xl font-semibold text-slate-900">Users</h1>

      <div className="border-b border-[#f0f0f0] flex gap-1 mt-3 mb-6">
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
      {tab === "Roles" && <RolesTab showToast={showToast} />}
      {tab === "Permissions" && <PermissionsTab />}
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <span className="text-[13px] text-slate-500">
      {label}: <span className={`font-semibold ${color}`}>{value}</span>
    </span>
  );
}

/* -------------------------------- Users --------------------------------- */

function UsersTab({ showToast }) {
  const [users, setUsers] = useState(SEED_USERS);
  const [invite, setInvite] = useState(false);
  const active = users.filter((u) => u.active).length;

  const del = (email) => setUsers((u) => u.filter((x) => x.email !== email));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <Stat label="Total" value={users.length} color="text-slate-900" />
          <span className="text-[#e2e2e2]">|</span>
          <Stat label="Active" value={active} color="text-emerald-600" />
          <span className="text-[#e2e2e2]">|</span>
          <Stat label="Inactive" value={users.length - active} color="text-slate-500" />
        </div>
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
              <th className="px-3 py-2.5 font-semibold">Invite Status</th>
              <th className="px-3 py-2.5 font-semibold text-right pr-5">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.email} className="border-t border-[#f3f4f6] text-[13px]">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-7 h-7 rounded-full grid place-items-center text-[11px] font-semibold ${u.color}`}>
                      {initials(u.name)}
                    </span>
                    <span className="font-medium text-slate-900">{u.name}</span>
                  </div>
                </td>
                <td className="px-3 py-3 text-slate-600">{u.email}</td>
                <td className="px-3 py-3 text-slate-700">{u.role}</td>
                <td className="px-3 py-3">
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${u.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                    {u.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-3 py-3">
                  {u.invite === "Active" && (
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">Active</span>
                  )}
                  {u.invite !== "Active" && (
                    <span className="inline-flex items-center gap-2">
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${u.invite === "Invited" ? "bg-[#EFF6FF] text-[#023E8A]" : "bg-amber-50 text-amber-700"}`}>
                        {u.invite}
                      </span>
                      <button onClick={() => showToast(`Invite resent to ${u.email}`)} className="text-[12px] text-sgi hover:underline">
                        Resend
                      </button>
                    </span>
                  )}
                </td>
                <td className="px-3 py-3 pr-5 text-right whitespace-nowrap">
                  <button onClick={() => showToast(`Editing ${u.name}`)} className="p-1 rounded text-[#6B7280] hover:text-sgi hover:bg-sgi-50 transition mr-1" title="Edit">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => { del(u.email); showToast(`${u.name} removed`); }} className="p-1 rounded text-[#DC2626] hover:bg-red-50 transition" title="Delete">
                    <Trash2 size={14} />
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
        <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full h-9 px-3 mb-5 border border-[#E2E8F0] rounded-md text-[13px] bg-white focus:outline-none focus:border-sgi-400">
          {ROLE_OPTIONS.map((r) => (<option key={r} value={r}>{r}</option>))}
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

/* -------------------------------- Roles --------------------------------- */

function RolesTab({ showToast }) {
  const [roles, setRoles] = useState(ROLES);
  const del = (name) => setRoles((r) => r.filter((x) => x.name !== name));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Stat label="Total Roles" value={roles.length} color="text-slate-900" />
        <button
          onClick={() => showToast("Add Role form coming soon")}
          className="h-8 px-3.5 inline-flex items-center gap-1.5 bg-[#023E8A] text-white rounded-md text-[13px] font-medium hover:bg-[#1A5EBF] transition"
        >
          <Plus size={14} /> Add Role
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#fbfbfc] text-[11px] uppercase tracking-wide text-[#8a93a0]">
            <tr>
              <th className="px-5 py-2.5 font-semibold">Role Name</th>
              <th className="px-3 py-2.5 font-semibold">Description</th>
              <th className="px-3 py-2.5 font-semibold text-right pr-5">Actions</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((r) => (
              <tr key={r.name} className="border-t border-[#f3f4f6] text-[13px]">
                <td className="px-5 py-3 font-medium text-slate-900">{r.name}</td>
                <td className="px-3 py-3 text-slate-600">
                  {r.desc} <span className="text-slate-400">· {r.users} user{r.users === 1 ? "" : "s"}</span>
                </td>
                <td className="px-3 py-3 pr-5 text-right whitespace-nowrap">
                  <button onClick={() => showToast(`Editing ${r.name} role`)} className="p-1 rounded text-[#6B7280] hover:text-sgi hover:bg-sgi-50 transition mr-1" title="Edit">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => { del(r.name); showToast(`${r.name} role removed`); }} className="p-1 rounded text-[#DC2626] hover:bg-red-50 transition" title="Delete">
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ----------------------------- Permissions ------------------------------ */

function PermissionsTab() {
  const [matrix, setMatrix] = useState(PERM_MATRIX);
  const set = (role, stage, val) => setMatrix((m) => ({ ...m, [role]: { ...m[role], [stage]: val } }));

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead className="bg-[#fbfbfc] text-[11px] uppercase tracking-wide text-[#8a93a0]">
          <tr>
            <th className="px-4 py-2.5 font-semibold sticky left-0 bg-[#fbfbfc] z-10">Role</th>
            {STAGES.map((s) => (
              <th key={s} className="px-3 py-2.5 font-semibold whitespace-nowrap">{s}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROLE_OPTIONS.map((role) => (
            <tr key={role} className="border-t border-[#f3f4f6]">
              <td className="px-4 py-2.5 font-medium text-[13px] text-slate-900 sticky left-0 bg-white z-10 whitespace-nowrap">{role}</td>
              {STAGES.map((stage) => (
                <td key={stage} className="px-3 py-2.5">
                  <select
                    value={matrix[role][stage]}
                    onChange={(e) => set(role, stage, e.target.value)}
                    className="text-[12px] text-[#1a1a1a] border border-[#E2E8F0] rounded-md px-2 py-1 bg-white focus:outline-none focus:border-sgi-400 cursor-pointer"
                  >
                    {ACCESS.map((a) => (<option key={a} value={a}>{a}</option>))}
                  </select>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
