import { useState } from "react";
import { X, Plus, Pencil, Trash2, Check, Search } from "lucide-react";
import { useApp } from "../store";

const TABS = ["Users", "Roles", "Permissions"];
const ROLE_OPTIONS = ["Admin", "Hiring Manager", "Recruiter", "Interviewer", "Coordinator", "Reviewer"];

const REQ_LIST = [
  { id: "REQ-2715", title: "Senior Data Analyst" },
  { id: "REQ-2701", title: "Regional Performance Manager" },
  { id: "REQ-2698", title: "BSC Representative" },
  { id: "REQ-2690", title: "Field Sales" },
];

// reqs: null = all requisitions, [...ids] = specific
const SEED_USERS = [
  { name: "Jatin Sharma", email: "jatin.sharma@safeguard.com", role: "Admin", active: true, invite: "Active", color: "bg-blue-100 text-blue-700", reqs: null },
  { name: "Yashvi Patel", email: "yashvi.patel@safeguard.com", role: "Hiring Manager", active: true, invite: "Active", color: "bg-teal-100 text-teal-700", reqs: ["REQ-2715"] },
  { name: "Rahul Verma", email: "rahul.verma@safeguard.com", role: "Recruiter", active: true, invite: "Active", color: "bg-green-100 text-green-700", reqs: null },
  { name: "Priya Nair", email: "priya.nair@safeguard.com", role: "Interviewer", active: true, invite: "Active", color: "bg-red-100 text-red-700", reqs: ["REQ-2715", "REQ-2701"] },
  { name: "Arjun Singh", email: "arjun.singh@safeguard.com", role: "Coordinator", active: false, invite: "Invited", color: "bg-orange-100 text-orange-700", reqs: ["REQ-2698"] },
  { name: "Divya Menon", email: "divya.menon@safeguard.com", role: "Recruiter", active: true, invite: "Active", color: "bg-amber-100 text-amber-700", reqs: null },
  { name: "Karan Mehta", email: "karan.mehta@safeguard.com", role: "Reviewer", active: false, invite: "Pending", color: "bg-teal-100 text-teal-700", reqs: ["REQ-2715", "REQ-2701", "REQ-2690"] },
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
  const [editUser, setEditUser] = useState(null);
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
              <th className="px-3 py-2.5 font-semibold">REQ Access</th>
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
                  <ReqAccessChip reqs={u.reqs} />
                </td>
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
                  <button onClick={() => setEditUser(u)} className="p-1 rounded text-[#6B7280] hover:text-sgi hover:bg-sgi-50 transition mr-1" title="Edit">
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
      {editUser && (
        <EditUserDrawer
          user={editUser}
          onClose={() => setEditUser(null)}
          onSave={(patch) => {
            setUsers((us) => us.map((x) => (x.email === editUser.email ? { ...x, ...patch } : x)));
            showToast(`${editUser.name} updated`);
            setEditUser(null);
          }}
        />
      )}
    </div>
  );
}

function InviteModal({ onClose, showToast }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Recruiter");
  const [reqs, setReqs] = useState(null); // null = All
  return (
    <div onClick={onClose} className="fixed inset-0 z-[70] bg-black/40 grid place-items-center px-4">
      <div onClick={(e) => e.stopPropagation()} className="relative w-[440px] max-w-full max-h-[90vh] overflow-auto bg-white rounded-[12px] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.25)] p-6">
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
        <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full h-9 px-3 mb-4 border border-[#E2E8F0] rounded-md text-[13px] bg-white focus:outline-none focus:border-sgi-400">
          {ROLE_OPTIONS.map((r) => (<option key={r} value={r}>{r}</option>))}
        </select>

        <div className="mb-5">
          <ReqAccessPicker value={reqs} onChange={setReqs} />
        </div>

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

function ReqAccessChip({ reqs }) {
  if (reqs == null) {
    return (
      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#E8F0FB] text-[#023E8A]" title="All requisitions">
        All
      </span>
    );
  }
  const titles = reqs
    .map((id) => REQ_LIST.find((r) => r.id === id))
    .filter(Boolean)
    .map((r) => `${r.id} — ${r.title}`)
    .join("\n");
  return (
    <span
      className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[#023E8A] border border-[#BFDBFE] cursor-default"
      title={titles}
    >
      {reqs.length} REQ{reqs.length === 1 ? "" : "s"}
    </span>
  );
}

function ReqAccessPicker({ value, onChange }) {
  // value: null = all, array = specific
  const isAll = value == null;
  const list = isAll ? [] : value;
  const [search, setSearch] = useState("");
  const q = search.trim().toLowerCase();
  const visible = q
    ? REQ_LIST.filter((r) => `${r.id} ${r.title}`.toLowerCase().includes(q))
    : REQ_LIST;
  const toggle = (id) =>
    onChange(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

  return (
    <div>
      <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#94A3B8] mb-2">
        Requisition Access
      </label>
      <div className="space-y-1.5">
        <label className="flex items-center gap-2 text-[13px] text-[#1a1a1a] cursor-pointer">
          <input
            type="radio"
            checked={isAll}
            onChange={() => onChange(null)}
            className="accent-[#023E8A]"
          />
          All Requisitions
        </label>
        <label className="flex items-center gap-2 text-[13px] text-[#1a1a1a] cursor-pointer">
          <input
            type="radio"
            checked={!isAll}
            onChange={() => onChange([])}
            className="accent-[#023E8A]"
          />
          Specific Requisitions
        </label>
      </div>

      {!isAll && (
        <>
          <div className="mt-2 border border-[#E2E8F0] rounded-md max-h-[220px] overflow-auto">
            {/* sticky search */}
            <div className="sticky top-0 bg-white border-b border-[#E2E8F0] p-2">
              <div className="relative">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9aa5b1]" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search requisitions…"
                  className="w-full pl-7 pr-2.5 py-1.5 border border-[#E2E8F0] rounded-md text-[12px] text-[#1a1a1a] placeholder:text-[#9aa5b1] focus:outline-none focus:border-sgi-400"
                />
              </div>
            </div>

            <div className="p-2 space-y-1.5">
              {visible.length === 0 && (
                <div className="text-[12px] text-[#9aa5b1] px-1.5 py-2 text-center">
                  No requisitions found
                </div>
              )}
              {visible.map((r) => {
                const on = list.includes(r.id);
                return (
                  <label
                    key={r.id}
                    className="flex items-start gap-2 px-1.5 py-1 rounded hover:bg-[#fafafa] cursor-pointer"
                  >
                    <span
                      onClick={(e) => { e.preventDefault(); toggle(r.id); }}
                      className={`mt-[2px] w-[14px] h-[14px] rounded border grid place-items-center shrink-0 transition ${
                        on ? "bg-[#023E8A] border-[#023E8A]" : "bg-white border-[#cbd5e0]"
                      }`}
                    >
                      {on && <Check size={10} strokeWidth={3} className="text-white" />}
                    </span>
                    <div className="leading-tight">
                      <div className="text-[12px] font-semibold text-[#1a1a1a]">{r.id}</div>
                      <div className="text-[11px] text-[#6B7280]">{r.title}</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={() => toggle(r.id)}
                      className="sr-only"
                    />
                  </label>
                );
              })}
            </div>
          </div>
          <p className="text-[11px] text-[#6B7280] mt-1.5">
            User will only see candidates from selected requisitions
          </p>
        </>
      )}
    </div>
  );
}

function Switch({ on }) {
  return (
    <span className={`relative w-8 h-[18px] rounded-full transition shrink-0 ${on ? "bg-[#023E8A]" : "bg-slate-300"}`}>
      <span className={`absolute top-[2px] w-3.5 h-3.5 rounded-full bg-white transition-all ${on ? "left-[16px]" : "left-[2px]"}`} />
    </span>
  );
}

/* --------------------------- edit user drawer --------------------------- */

const PERM_LIST = [
  { label: "View Candidates", key: "View Candidates" },
  { label: "Accept / Reject Candidates", key: "Accept/Reject" },
  { label: "Upload Resumes", key: "Upload Resumes" },
  { label: "Use Ask AI", key: "Use Ask AI" },
  { label: "View Analytics", key: "View Analytics" },
  { label: "Manage Users", key: "Manage Users" },
  { label: "Sync ADP", key: "Sync ADP" },
];

const permsForRole = (role) =>
  PERM_LIST.reduce((m, p) => ({ ...m, [p.key]: (PERM_MATRIX[role]?.[p.key] ?? "No Access") !== "No Access" }), {});

function EditUserDrawer({ user, onClose, onSave }) {
  const [name, setName] = useState(user.name);
  const [role, setRole] = useState(user.role);
  const [active, setActive] = useState(user.active);
  const [reqs, setReqs] = useState(user.reqs ?? null);
  const [perms, setPerms] = useState(() => permsForRole(user.role));

  const changeRole = (r) => { setRole(r); setPerms(permsForRole(r)); };
  const toggle = (key) => setPerms((m) => ({ ...m, [key]: !m[key] }));

  return (
    <div className="fixed inset-0 z-[60]">
      <div onClick={onClose} className="absolute inset-0 bg-black/20" />
      <aside className="absolute right-0 top-0 h-full w-[380px] bg-white border-l border-[#ececec] shadow-[-8px_0_30px_-12px_rgba(0,0,0,0.2)] flex flex-col">
        {/* header */}
        <div className="px-5 pt-5 pb-4 border-b border-[#f0f0f0] relative">
          <button onClick={onClose} className="absolute top-3 right-3 p-1.5 rounded-md text-[#888] hover:bg-[#f5f5f5]" aria-label="Close">
            <X size={16} />
          </button>
          <div className="flex flex-col items-center text-center">
            <span className={`w-12 h-12 rounded-full grid place-items-center text-[15px] font-semibold ${user.color}`}>
              {initials(user.name)}
            </span>
            <h2 className="text-[16px] font-bold text-[#1a1a1a] mt-2">{name}</h2>
            <span className="inline-block mt-1.5 text-[11px] font-medium px-2 py-[3px] rounded-full bg-[#EFF6FF] border border-[#BFDBFE] text-[#023E8A]">
              {role}
            </span>
          </div>
        </div>

        {/* body */}
        <div className="flex-1 overflow-auto px-5 py-4 space-y-4">
          <div>
            <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#94A3B8] mb-1">Full Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-9 px-3 border border-[#E2E8F0] rounded-md text-[13px] focus:outline-none focus:border-sgi-400 focus:shadow-[0_0_0_3px_rgba(2,62,138,0.1)]"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#94A3B8] mb-1">Email</label>
            <input
              value={user.email}
              disabled
              className="w-full h-9 px-3 border border-[#E2E8F0] rounded-md text-[13px] bg-[#F8FAFC] text-[#94A3B8] cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#94A3B8] mb-1">Role</label>
            <select
              value={role}
              onChange={(e) => changeRole(e.target.value)}
              className="w-full h-9 px-3 border border-[#E2E8F0] rounded-md text-[13px] bg-white focus:outline-none focus:border-sgi-400"
            >
              {ROLE_OPTIONS.map((r) => (<option key={r} value={r}>{r}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#94A3B8] mb-1">Status</label>
            <button onClick={() => setActive((a) => !a)} className="inline-flex items-center gap-2">
              <Switch on={active} />
              <span className={`text-[13px] ${active ? "text-slate-700" : "text-slate-400"}`}>{active ? "Active" : "Inactive"}</span>
            </button>
          </div>

          <ReqAccessPicker value={reqs} onChange={setReqs} />

          <div className="pt-1">
            <div className="text-[10px] uppercase tracking-wider font-semibold text-[#94A3B8] mb-2.5">Permissions</div>
            <div className="space-y-2.5">
              {PERM_LIST.map((p) => (
                <button key={p.key} onClick={() => toggle(p.key)} className="w-full flex items-center justify-between gap-3 text-[13px] text-[#1a1a1a]">
                  <span>{p.label}</span>
                  <Switch on={!!perms[p.key]} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* footer */}
        <div className="border-t border-[#f0f0f0] px-5 py-4">
          <button
            onClick={() => onSave({ name, role, active, reqs })}
            className="w-full h-9 rounded-md bg-[#023E8A] text-white text-[13px] font-medium hover:bg-[#1A5EBF] transition"
          >
            Save Changes
          </button>
          <div className="text-center mt-2.5">
            <button onClick={onClose} className="text-[12px] text-[#6B7280] hover:underline">Cancel</button>
          </div>
        </div>
      </aside>
    </div>
  );
}

/* -------------------------------- Roles --------------------------------- */

function RolesTab({ showToast }) {
  const [roles, setRoles] = useState(ROLES);
  const [drawer, setDrawer] = useState(null); // { mode:"add" } | { mode:"edit", role }
  const del = (name) => setRoles((r) => r.filter((x) => x.name !== name));

  const save = (patch) => {
    if (drawer.mode === "add") {
      setRoles((r) => [...r, { name: patch.name || "New Role", desc: patch.desc, users: 0 }]);
      showToast(`${patch.name || "New role"} created`);
    } else {
      setRoles((r) => r.map((x) => (x.name === drawer.role.name ? { ...x, name: patch.name, desc: patch.desc } : x)));
      showToast(`${patch.name} role updated`);
    }
    setDrawer(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Stat label="Total Roles" value={roles.length} color="text-slate-900" />
        <button
          onClick={() => setDrawer({ mode: "add" })}
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
                  <button onClick={() => setDrawer({ mode: "edit", role: r })} className="p-1 rounded text-[#6B7280] hover:text-sgi hover:bg-sgi-50 transition mr-1" title="Edit">
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

      {drawer && <RoleDrawer mode={drawer.mode} role={drawer.role} onClose={() => setDrawer(null)} onSave={save} />}
    </div>
  );
}

function RoleDrawer({ mode, role, onClose, onSave }) {
  const add = mode === "add";
  const [name, setName] = useState(add ? "" : role.name);
  const [desc, setDesc] = useState(add ? "" : role.desc);
  const [perms, setPerms] = useState(() =>
    add ? PERM_LIST.reduce((m, p) => ({ ...m, [p.key]: false }), {}) : permsForRole(role.name)
  );
  const toggle = (key) => setPerms((m) => ({ ...m, [key]: !m[key] }));

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/20" />
      <aside className="absolute right-0 top-0 h-full w-[380px] bg-white border-l border-[#ececec] shadow-[-8px_0_30px_-12px_rgba(0,0,0,0.2)] flex flex-col">
        <div className="px-5 pt-5 pb-4 border-b border-[#f0f0f0] relative">
          <button onClick={onClose} className="absolute top-3 right-3 p-1.5 rounded-md text-[#888] hover:bg-[#f5f5f5]" aria-label="Close">
            <X size={16} />
          </button>
          <h2 className="text-[16px] font-bold text-[#1a1a1a]">{add ? "Add New Role" : name || role.name}</h2>
          {!add && <p className="text-[12px] text-[#6B7280] mt-0.5">Edit Role</p>}
        </div>

        <div className="flex-1 overflow-auto px-5 py-4 space-y-4">
          <div>
            <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#94A3B8] mb-1">Role Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sourcer"
              className="w-full h-9 px-3 border border-[#E2E8F0] rounded-md text-[13px] focus:outline-none focus:border-sgi-400 focus:shadow-[0_0_0_3px_rgba(2,62,138,0.1)]"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#94A3B8] mb-1">Description</label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="What can this role do?"
              className="w-full min-h-[72px] p-3 border border-[#E2E8F0] rounded-md text-[13px] resize-y focus:outline-none focus:border-sgi-400 focus:shadow-[0_0_0_3px_rgba(2,62,138,0.1)]"
            />
          </div>
          {!add && (
            <div className="text-[12px] text-[#6B7280]">
              {role.users} user{role.users === 1 ? "" : "s"} assigned to this role
            </div>
          )}

          <div className="pt-1">
            <div className="text-[10px] uppercase tracking-wider font-semibold text-[#94A3B8] mb-2.5">Permissions</div>
            <div className="space-y-2.5">
              {PERM_LIST.map((p) => (
                <button key={p.key} onClick={() => toggle(p.key)} className="w-full flex items-center justify-between gap-3 text-[13px] text-[#1a1a1a]">
                  <span>{p.label}</span>
                  <Switch on={!!perms[p.key]} />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-[#f0f0f0] px-5 py-4">
          <button
            onClick={() => onSave({ name, desc })}
            className="w-full h-9 rounded-md bg-[#023E8A] text-white text-[13px] font-medium hover:bg-[#1A5EBF] transition"
          >
            {add ? "Create Role" : "Save Changes"}
          </button>
          <div className="text-center mt-2.5">
            <button onClick={onClose} className="text-[12px] text-[#6B7280] hover:underline">Cancel</button>
          </div>
        </div>
      </aside>
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
