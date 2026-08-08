import React, { useState, useMemo } from "react";
import {
  LayoutDashboard, Package, Truck, Undo2, ClipboardList, Boxes, ArrowLeftRight,
  FileBarChart, Database, Users, Settings as SettingsIcon, ChevronDown, ChevronRight,
  Search, Bell, LogOut, Plus, Minus, X, Check, AlertTriangle, Camera, ChevronLeft,
  Filter, Download, Upload, Eye, MapPin, Phone, User as UserIcon, Menu
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import Papa from "papaparse";

/* ============================================================
   MOCK DATA LAYER (stand-in for backend/database)
   ============================================================ */

const AREAS_SEED = [
  { code: "AR001", name: "Papua", status: "Active" },
  { code: "AR002", name: "Kalimantan", status: "Active" },
  { code: "AR003", name: "Nusra", status: "Active" },
  { code: "AR004", name: "Sumatera", status: "Active" },
];

const HOMEBASES_SEED = [
  { code: "HB001", name: "Merauke", area: "Papua", address: "Jl. Trikora No. 12, Merauke", pic: "Budi Santoso", phone: "0812-1111-2222", status: "Active" },
  { code: "HB002", name: "Tabonji", area: "Papua", address: "Jl. Kamp. Tabonji, Yahukimo", pic: "Andi Wijaya", phone: "0812-3333-4444", status: "Active" },
  { code: "HB003", name: "Long Payau", area: "Kalimantan", address: "Jl. Poros Long Payau, Malinau", pic: "Rudi Hartono", phone: "0813-5555-6666", status: "Active" },
  { code: "HB004", name: "Pontianak", area: "Kalimantan", address: "Jl. Ahmad Yani No. 8, Pontianak", pic: "Sari Dewi", phone: "0813-7777-8888", status: "Active" },
  { code: "HB005", name: "Maumere", area: "Nusra", address: "Jl. Sudirman No. 3, Maumere", pic: "Yohanes K.", phone: "0814-1111-2222", status: "Active" },
  { code: "HB006", name: "Ende", area: "Nusra", address: "Jl. Melati No. 9, Ende", pic: "Maria F.", phone: "0814-3333-4444", status: "Active" },
  { code: "HB007", name: "Pekanbaru", area: "Sumatera", address: "Jl. Riau No. 21, Pekanbaru", pic: "Doni Saputra", phone: "0815-1111-2222", status: "Active" },
];

const CUSTOMERS_SEED = [
  { id: "CUST001", name: "Paramitra", status: "Active" },
  { id: "CUST002", name: "Telkomsel Regional", status: "Active" },
  { id: "CUST003", name: "XL Axiata", status: "Active" },
];

const SITES_SEED = [
  { code: "ST0001", terminalId: "TID-001", name: "Long Pada", customer: "Paramitra", area: "Kalimantan", homebase: "Long Payau", status: "Active" },
  { code: "ST0002", terminalId: "TID-002", name: "Apau Ping", customer: "Paramitra", area: "Kalimantan", homebase: "Long Payau", status: "Active" },
  { code: "ST0003", terminalId: "TID-003", name: "Long Ketaman", customer: "Paramitra", area: "Kalimantan", homebase: "Long Payau", status: "Active" },
  { code: "ST0004", terminalId: "TID-004", name: "Merauke Barat", customer: "Telkomsel Regional", area: "Papua", homebase: "Merauke", status: "Active" },
  { code: "ST0005", terminalId: "TID-005", name: "Kampung Yame", customer: "Telkomsel Regional", area: "Papua", homebase: "Tabonji", status: "Active" },
  { code: "ST0006", terminalId: "TID-006", name: "Rumang", customer: "XL Axiata", area: "Nusra", homebase: "Maumere", status: "Active" },
  { code: "ST0007", terminalId: "TID-007", name: "Nampar Sepang", customer: "XL Axiata", area: "Nusra", homebase: "Ende", status: "Active" },
];

const MATERIALS = [
  { id: "MAT001", name: "Modem HT3300", category: "Modem", unit: "Unit", serialized: true, minStock: 5, status: "Active", ready: 25, faulty: 3, reserved: 4, transit: 2 },
  { id: "MAT002", name: "LNB Ku-Band", category: "RF Component", unit: "Unit", serialized: true, minStock: 8, status: "Active", ready: 40, faulty: 5, reserved: 3, transit: 0 },
  { id: "MAT003", name: "Router Mikrotik RB450Gx4", category: "Router", unit: "Unit", serialized: true, minStock: 4, status: "Active", ready: 12, faulty: 2, reserved: 2, transit: 0 },
  { id: "MAT004", name: "DC to DC Meanwell 48-24V", category: "Power", unit: "Unit", serialized: false, minStock: 6, status: "Active", ready: 18, faulty: 1, reserved: 0, transit: 3 },
  { id: "MAT005", name: "Inverter AC to DC", category: "Power", unit: "Unit", serialized: true, minStock: 3, status: "Active", ready: 2, faulty: 0, reserved: 0, transit: 0 },
  { id: "MAT006", name: "Feedhorn 1.8M", category: "RF Component", unit: "Unit", serialized: false, minStock: 4, status: "Active", ready: 9, faulty: 1, reserved: 1, transit: 0 },
  { id: "MAT007", name: "SCC Morningstar", category: "Controller", unit: "Unit", serialized: true, minStock: 3, status: "Active", ready: 6, faulty: 0, reserved: 0, transit: 0 },
];

const initialMovements = [
  { id: "SM-000001", date: "2026-08-07 09:20", material: "Modem HT3300", qty: -2, ref: "DR-250807-012", remaining: 25, type: "Delivery" },
  { id: "SM-000002", date: "2026-08-06 15:10", material: "LNB Ku-Band", qty: 10, ref: "Warehouse Receipt", remaining: 40, type: "Receipt" },
  { id: "SM-000003", date: "2026-08-06 11:05", material: "Router Mikrotik RB450Gx4", qty: -1, ref: "DR-250806-009", remaining: 12, type: "Delivery" },
  { id: "SM-000004", date: "2026-08-05 14:40", material: "Modem HT3300", qty: 1, ref: "RF-250805-004", remaining: 27, type: "Faulty Return" },
];

const KEPERLUAN_OPTIONS = ["CM / PM", "Installation", "Other"];

const initialDeliveries = [
  {
    id: "DR-250807-012", requester: "Fariz Asad", role: "SPV", homebase: "Long Payau", site: "Long Pada",
    keperluan: "Installation", note: "", items: [{ material: "Modem HT3300", qty: 2 }, { material: "LNB Ku-Band", qty: 1 }],
    status: "In Progress", date: "2026-08-07",
    history: [
      { time: "07 Agu 2026 09:10", text: "Dibuat oleh SPV Fariz Asad" },
      { time: "07 Agu 2026 09:15", text: "Submitted" },
      { time: "07 Agu 2026 09:40", text: "Approved by Logistics" },
      { time: "07 Agu 2026 10:00", text: "Preparing" },
    ],
  },
  {
    id: "DR-250807-011", requester: "Andi Wijaya", role: "SPV", homebase: "Merauke", site: "",
    keperluan: "CM / PM", note: "Untuk perbaikan link putus", items: [{ material: "Router Mikrotik RB450Gx4", qty: 1 }],
    status: "Waiting Logistics Approval", date: "2026-08-07",
    history: [
      { time: "07 Agu 2026 08:00", text: "Dibuat oleh SPV Andi Wijaya" },
      { time: "07 Agu 2026 08:05", text: "Submitted" },
    ],
  },
  {
    id: "DR-250806-010", requester: "Rudi Hartono", role: "SPV", homebase: "Long Payau", site: "Apau Ping",
    keperluan: "Installation", note: "", items: [{ material: "DC to DC Meanwell 48-24V", qty: 4 }],
    status: "In Progress", date: "2026-08-06",
    history: [
      { time: "06 Agu 2026 09:00", text: "Dibuat oleh SPV Rudi Hartono" },
      { time: "06 Agu 2026 09:10", text: "Submitted" },
      { time: "06 Agu 2026 10:00", text: "Approved by Logistics" },
    ],
  },
  {
    id: "DR-250806-009", requester: "Sari Dewi", role: "SPV", homebase: "Pontianak", site: "",
    keperluan: "Other", note: "Kebutuhan spare gudang homebase", items: [{ material: "Router Mikrotik RB450Gx4", qty: 1 }],
    status: "Selesai Dikirim", date: "2026-08-06",
    history: [
      { time: "06 Agu 2026 07:00", text: "Dibuat oleh SPV Sari Dewi" },
      { time: "06 Agu 2026 07:10", text: "Submitted" },
      { time: "06 Agu 2026 08:00", text: "Approved by Logistics" },
      { time: "06 Agu 2026 11:00", text: "Shipped" },
      { time: "06 Agu 2026 15:00", text: "Delivered" },
    ],
  },
];

const initialReturns = [
  {
    id: "RF-250805-004", technician: "Yohanes K.", homebase: "Maumere", site: "Rumang", date: "2026-08-05",
    items: [{ material: "Modem HT3300", qty: 1, serials: [{ sn: "HT33001125", photo: true }] }],
    docs: { beforePacking: true, afterPacking: true, weighing: true, resi: false },
    resiNumber: "", status: "Waiting Logistics Review",
    history: [
      { time: "05 Agu 2026 13:00", text: "Draft dibuat" },
      { time: "05 Agu 2026 14:20", text: "Submitted oleh Technician Yohanes K." },
    ],
  },
  {
    id: "RF-250803-002", technician: "Doni Saputra", homebase: "Pekanbaru", site: "", date: "2026-08-03",
    items: [{ material: "LNB Ku-Band", qty: 2, serials: [{ sn: "LNBKU00291", photo: true }, { sn: "LNBKU00292", photo: false }] }],
    docs: { beforePacking: true, afterPacking: false, weighing: false, resi: false },
    resiNumber: "", status: "Revision Required",
    revisionNote: "Foto SN LNBKU00292 kurang jelas, mohon diulang.",
    history: [
      { time: "03 Agu 2026 10:00", text: "Draft dibuat" },
      { time: "03 Agu 2026 10:30", text: "Submitted oleh Technician Doni Saputra" },
      { time: "03 Agu 2026 15:00", text: "Revision Required oleh Logistics" },
    ],
  },
];

const initialReconciliations = [
  {
    id: "RC-250801-001", homebase: "Merauke", period: "01 - 15 Agustus 2026", date: "2026-08-01", status: "Waiting Logistics Review",
    items: [
      { material: "Modem HT3300", serialized: true, systemQty: 3, serials: ["HT33009981", "HT33009982"], actualQty: 2, photo: true, reason: "1 unit rusak dan sudah diajukan Return Faulty terpisah, belum tercatat sistem." },
      { material: "DC to DC Meanwell 48-24V", serialized: false, systemQty: 20, actualQty: 18, photo: true, reason: "2 unit hilang saat perpindahan gudang lapangan." },
    ],
    history: [
      { time: "01 Agu 2026 08:00", text: "Draft dibuat" },
      { time: "01 Agu 2026 16:00", text: "Submitted oleh Technician Budi Santoso" },
    ],
  },
  {
    id: "RC-250715-000", homebase: "Long Payau", period: "01 - 15 Juli 2026", date: "2026-07-15", status: "Completed",
    items: [
      { material: "Router Mikrotik RB450Gx4", serialized: true, systemQty: 2, serials: ["RB45001", "RB45002"], actualQty: 2, photo: true, reason: "" },
    ],
    history: [
      { time: "15 Jul 2026 09:00", text: "Submitted" },
      { time: "16 Jul 2026 10:00", text: "Approved by Logistics" },
      { time: "16 Jul 2026 10:05", text: "Completed" },
    ],
  },
];

const activityData = [
  { day: "1 Agu", delivery: 18, faulty: 12, recon: 6 },
  { day: "2 Agu", delivery: 22, faulty: 14, recon: 9 },
  { day: "3 Agu", delivery: 38, faulty: 26, recon: 14 },
  { day: "4 Agu", delivery: 15, faulty: 15, recon: 6 },
  { day: "5 Agu", delivery: 30, faulty: 18, recon: 12 },
  { day: "6 Agu", delivery: 27, faulty: 22, recon: 8 },
  { day: "7 Agu", delivery: 32, faulty: 21, recon: 13 },
];

const ROLES = {
  MANAGER: "Admin / Manager Logistics",
  LOGISTICS: "Logistics Staff",
  SPV: "SPV",
  TECH: "Technician",
};

const NAV_ACCESS = {
  dashboard: [ROLES.MANAGER, ROLES.LOGISTICS, ROLES.SPV, ROLES.TECH],
  delivery: [ROLES.MANAGER, ROLES.LOGISTICS, ROLES.SPV],
  returnFaulty: [ROLES.MANAGER, ROLES.LOGISTICS, ROLES.TECH],
  reconciliation: [ROLES.MANAGER, ROLES.LOGISTICS, ROLES.TECH],
  stock: [ROLES.MANAGER, ROLES.LOGISTICS],
  movement: [ROLES.MANAGER, ROLES.LOGISTICS, ROLES.SPV],
  receipts: [ROLES.MANAGER, ROLES.LOGISTICS],
  reports: [ROLES.MANAGER, ROLES.LOGISTICS],
  master: [ROLES.MANAGER],
  users: [ROLES.MANAGER],
  settings: [ROLES.MANAGER, ROLES.LOGISTICS, ROLES.SPV, ROLES.TECH],
};

const USERS_SEED = [
  { id: "USR001", name: "Fariz Asad", role: ROLES.MANAGER, assignment: "Semua Area", status: "Active" },
  { id: "USR002", name: "Sari Dewi", role: ROLES.LOGISTICS, assignment: "Warehouse Pusat", status: "Active" },
  { id: "USR003", name: "Andi Wijaya", role: ROLES.SPV, assignment: "Merauke", status: "Active" },
  { id: "USR004", name: "Yohanes K.", role: ROLES.TECH, assignment: "Maumere", status: "Active" },
];

/* ============================================================
   SMALL HELPERS / UI PRIMITIVES
   ============================================================ */

const STATUS_STYLES = {
  "Draft": "bg-gray-100 text-gray-600",
  "Submitted": "bg-blue-50 text-blue-700",
  "Waiting Logistics Approval": "bg-amber-50 text-amber-700",
  "Waiting Logistics Review": "bg-amber-50 text-amber-700",
  "Waiting Stock Assignment": "bg-amber-50 text-amber-700",
  "Preparing": "bg-blue-50 text-blue-700",
  "In Progress": "bg-blue-50 text-blue-700",
  "Shipped": "bg-indigo-50 text-indigo-700",
  "On Delivery": "bg-indigo-50 text-indigo-700",
  "Received by Warehouse": "bg-blue-50 text-blue-700",
  "QC Checking": "bg-amber-50 text-amber-700",
  "Delivered": "bg-emerald-50 text-emerald-700",
  "Selesai Dikirim": "bg-emerald-50 text-emerald-700",
  "Completed": "bg-emerald-50 text-emerald-700",
  "Rejected": "bg-red-50 text-red-700",
  "Cancelled": "bg-gray-100 text-gray-500",
  "Revision Required": "bg-red-50 text-red-700",
  "Ready to Ship": "bg-emerald-50 text-emerald-700",
  "Ready": "bg-emerald-50 text-emerald-700",
  "Reserved": "bg-blue-50 text-blue-700",
  "In Transit": "bg-indigo-50 text-indigo-700",
  "Faulty": "bg-red-50 text-red-700",
};

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[status] || "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}

function Card({ children, className = "" }) {
  return <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm ${className}`}>{children}</div>;
}

function PrimaryButton({ children, onClick, disabled, className = "", type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-emerald-800 text-white text-sm font-medium hover:bg-emerald-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors ${className}`}
    >
      {children}
    </button>
  );
}

function GhostButton({ children, onClick, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors ${className}`}
    >
      {children}
    </button>
  );
}

function DangerButton({ children, onClick, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors ${className}`}
    >
      {children}
    </button>
  );
}

/* Small confirmation modal for actions that are annoying to undo (stock
   reservation, shipping/delivery status changes) — a lightweight guard
   against mis-clicks, styled to match the rest of the app instead of a
   native browser confirm(). */
function ConfirmDialog({ open, title, message, confirmLabel = "Konfirmasi", onConfirm, onCancel, danger }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onCancel} />
      <Card className="relative w-full max-w-md p-6 space-y-4">
        <div className="text-base font-semibold text-gray-900">{title}</div>
        <div className="text-sm text-gray-600">{message}</div>
        <div className="flex justify-end gap-2 pt-2">
          <GhostButton onClick={onCancel}>Batal</GhostButton>
          {danger ? (
            <DangerButton onClick={onConfirm} className="border-red-600 bg-red-600 text-white hover:bg-red-700">{confirmLabel}</DangerButton>
          ) : (
            <PrimaryButton onClick={onConfirm}>{confirmLabel}</PrimaryButton>
          )}
        </div>
      </Card>
    </div>
  );
}

function SectionTitle({ title, subtitle, right }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="py-16 text-center text-gray-400 text-sm">{text}</div>
  );
}

/* ============================================================
   SIDEBAR
   ============================================================ */

const NAV_TREE = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  {
    key: "material", label: "Material", icon: Package,
    children: [
      { key: "delivery", label: "Delivery Request" },
      { key: "returnFaulty", label: "Return Material Faulty" },
      { key: "reconciliation", label: "Reconciliation" },
    ],
  },
  {
    key: "inventory", label: "Inventory", icon: Boxes,
    children: [
      { key: "stock", label: "Warehouse Stock" },
      { key: "movement", label: "Stock Movement" },
    ],
  },
  {
    key: "reportsGroup", label: "Reports", icon: FileBarChart,
    children: [
      { key: "reports", label: "Delivery Report" },
      { key: "reportsFaulty", label: "Faulty Return Report" },
      { key: "reportsRecon", label: "Reconciliation Report" },
    ],
  },
  {
    key: "masterGroup", label: "Master Data", icon: Database,
    children: [
      { key: "masterMaterial", label: "Master Material" },
      { key: "masterSite", label: "Master Site" },
      { key: "masterHomebase", label: "Master Homebase" },
      { key: "masterArea", label: "Master Area" },
      { key: "masterCustomer", label: "Master Customer" },
    ],
  },
  { key: "users", label: "User Management", icon: Users },
  { key: "settings", label: "Settings", icon: SettingsIcon },
];

function hasAccess(key, role) {
  const map = {
    delivery: NAV_ACCESS.delivery, returnFaulty: NAV_ACCESS.returnFaulty, reconciliation: NAV_ACCESS.reconciliation,
    stock: NAV_ACCESS.stock, movement: NAV_ACCESS.movement,
    reports: NAV_ACCESS.reports, reportsFaulty: NAV_ACCESS.reports, reportsRecon: NAV_ACCESS.reports,
    masterMaterial: NAV_ACCESS.master, masterSite: NAV_ACCESS.master, masterHomebase: NAV_ACCESS.master,
    masterArea: NAV_ACCESS.master, masterCustomer: NAV_ACCESS.master,
    users: NAV_ACCESS.users, dashboard: NAV_ACCESS.dashboard, settings: NAV_ACCESS.settings,
  };
  const allowed = map[key];
  return !allowed || allowed.includes(role);
}

function Sidebar({ page, setPage, role, userName, mobileOpen, onClose }) {
  const [open, setOpen] = useState({ material: true, inventory: false, reportsGroup: false, masterGroup: false });

  const toggle = (key) => setOpen((o) => ({ ...o, [key]: !o[key] }));
  const navigate = (key) => { setPage(key); onClose?.(); };

  return (
    <>
      {mobileOpen && <div className="fixed inset-0 bg-black/30 z-30 lg:hidden" onClick={onClose} />}
      <div className={`w-64 shrink-0 bg-white border-r border-gray-100 h-full flex flex-col fixed inset-y-0 left-0 z-40 transform transition-transform duration-200 lg:static lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="w-10 h-10 rounded-xl bg-emerald-800 flex items-center justify-center shrink-0">
          <Truck size={20} className="text-white" />
        </div>
        <div className="flex-1">
          <div className="text-emerald-900 font-bold text-lg leading-none tracking-tight">TEREX</div>
          <div className="text-[10px] text-emerald-700 font-semibold tracking-[0.15em]">LOGISTICS</div>
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-50 lg:hidden"><X size={18} /></button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-1">
        {NAV_TREE.map((item) => {
          if (!item.children) {
            if (!hasAccess(item.key, role)) return null;
            const active = page === item.key;
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                onClick={() => navigate(item.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active ? "bg-emerald-800 text-white" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          }
          const visibleChildren = item.children.filter((c) => hasAccess(c.key, role));
          if (visibleChildren.length === 0) return null;
          const Icon = item.icon;
          const isOpen = open[item.key];
          const childActive = visibleChildren.some((c) => c.key === page);
          return (
            <div key={item.key}>
              <button
                onClick={() => toggle(item.key)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  childActive ? "text-emerald-800" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <span className="flex items-center gap-3"><Icon size={18} />{item.label}</span>
                {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              {isOpen && (
                <div className="ml-[1.85rem] mt-1 space-y-0.5 border-l border-gray-100 pl-3">
                  {visibleChildren.map((c) => (
                    <button
                      key={c.key}
                      onClick={() => navigate(c.key)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        page === c.key ? "bg-emerald-50 text-emerald-800 font-medium" : "text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="p-3 border-t border-gray-100">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-semibold text-sm shrink-0">
            {(userName || "?").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate">{userName || "—"}</div>
            <div className="text-xs text-gray-500 truncate">{role}</div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}

/* ============================================================
   TOP BAR (with role switcher for prototype demo purposes)
   ============================================================ */

function TopBar({ user, onLogout, title, subtitle, searchQuery, setSearchQuery, searchResults, notifications, onNotificationClick, onMenuClick }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const resultsDropdown = (
    <div className="absolute mt-1.5 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-96 overflow-y-auto py-1.5 z-30">
      {searchResults.length === 0 ? (
        <div className="px-4 py-6 text-center text-sm text-gray-400">Tidak ada hasil untuk "{searchQuery}"</div>
      ) : (
        searchResults.map((r, i) => (
          <button
            key={i}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => { r.onSelect(); setSearchQuery(""); setSearchOpen(false); setMobileSearchOpen(false); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0"><r.icon size={15} /></div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-gray-800 truncate">{r.label}</div>
              <div className="text-xs text-gray-400 truncate">{r.type} · {r.sub}</div>
            </div>
          </button>
        ))
      )}
    </div>
  );

  return (
    <div className="relative z-20 bg-white border-b border-gray-100">
      <div className="flex items-center justify-between px-4 sm:px-8 py-4 sm:py-5">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={onMenuClick} className="lg:hidden w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center shrink-0 hover:bg-gray-50">
            <Menu size={18} className="text-gray-600" />
          </button>
          <div className="min-w-0">
            <div className="text-lg sm:text-xl font-bold text-gray-900 truncate">{title}</div>
            {subtitle && <div className="text-sm text-gray-500 mt-0.5 truncate">{subtitle}</div>}
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="relative hidden md:block w-72">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
              <Search size={16} className="text-gray-400 shrink-0" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchOpen(true)}
                onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
                placeholder="Cari site, material, SN, atau dokumen..."
                className="bg-transparent text-sm outline-none w-full placeholder:text-gray-400"
              />
              {searchQuery && (
                <button onMouseDown={(e) => e.preventDefault()} onClick={() => setSearchQuery("")} className="text-gray-300 hover:text-gray-500 shrink-0"><X size={14} /></button>
              )}
            </div>
            {searchOpen && searchQuery.trim() && resultsDropdown}
          </div>

          <button onClick={() => setMobileSearchOpen((o) => !o)} className="md:hidden w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50">
            <Search size={17} className="text-gray-600" />
          </button>

          <div className="relative">
            <button onClick={() => setNotifOpen((o) => !o)} className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50">
              <Bell size={18} className="text-gray-600" />
              {notifications.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-semibold rounded-full w-4 h-4 flex items-center justify-center">
                  {notifications.length > 9 ? "9+" : notifications.length}
                </span>
              )}
            </button>
            {notifOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setNotifOpen(false)} />
                <div className="absolute right-0 mt-1.5 w-[calc(100vw-2rem)] sm:w-80 bg-white border border-gray-200 rounded-xl shadow-lg max-h-96 overflow-y-auto z-20">
                  <div className="px-4 py-3 border-b border-gray-50 text-sm font-semibold text-gray-800">Notifikasi ({notifications.length})</div>
                  {notifications.length === 0 ? (
                    <div className="px-4 py-6 text-center text-sm text-gray-400">Tidak ada notifikasi baru.</div>
                  ) : (
                    notifications.map((n, i) => (
                      <button
                        key={i}
                        onClick={() => { onNotificationClick(n); setNotifOpen(false); }}
                        className="w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 text-left border-b border-gray-50 last:border-0"
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${n.color}`}><n.icon size={15} /></div>
                        <div className="min-w-0">
                          <div className="text-sm text-gray-800">{n.text}</div>
                          <div className="text-xs text-gray-400 mt-0.5">{n.sub}</div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </>
            )}
          </div>

          <div className="hidden sm:block text-right">
            <div className="text-xs font-medium text-gray-800 truncate max-w-[140px]">{user?.name}</div>
            <div className="text-[11px] text-gray-400 truncate max-w-[140px]">{user?.role}</div>
          </div>
          <button
            onClick={onLogout}
            title="Logout"
            className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-gray-500"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {mobileSearchOpen && (
        <div className="md:hidden px-4 pb-4 relative">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
            <Search size={16} className="text-gray-400 shrink-0" />
            <input
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari site, material, SN, atau dokumen..."
              className="bg-transparent text-sm outline-none w-full placeholder:text-gray-400"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="text-gray-300 hover:text-gray-500 shrink-0"><X size={14} /></button>
            )}
          </div>
          {searchQuery.trim() && <div className="relative">{resultsDropdown}</div>}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   DASHBOARD
   ============================================================ */

function Dashboard({ role, setPage, deliveries, returns, reconciliations, materials }) {
  const pendingApproval = deliveries.filter((d) => d.status === "Waiting Logistics Approval").length;
  const inProgress = deliveries.filter((d) => ["In Progress", "Waiting Stock Assignment", "Preparing", "Shipped"].includes(d.status)).length;
  const waitingReview = returns.filter((r) => r.status === "Waiting Logistics Review").length;
  const reconReview = reconciliations.filter((r) => r.status === "Waiting Logistics Review").length;
  const lowStock = materials.filter((m) => m.ready <= m.minStock).length;
  const totalMaterial = materials.reduce((s, m) => s + m.ready + m.faulty + m.reserved + m.transit, 0);

  const actions = [
    { icon: Undo2, color: "bg-red-50 text-red-600", title: "Return Faulty menunggu review", sub: "Diajukan oleh tim lapangan", count: waitingReview, cta: "Review", page: "returnFaulty" },
    { icon: ClipboardList, color: "bg-amber-50 text-amber-600", title: "Rekonsiliasi menunggu review", sub: "Periode berjalan", count: reconReview, cta: "Review", page: "reconciliation" },
    { icon: Truck, color: "bg-emerald-50 text-emerald-700", title: "Delivery Request menunggu approval", sub: "Diajukan oleh tim lapangan", count: pendingApproval, cta: "Approval", page: "delivery" },
    { icon: AlertTriangle, color: "bg-blue-50 text-blue-600", title: "Material mendekati stok minimum", sub: "Perlu perhatian", count: lowStock, cta: "Lihat", page: "stock" },
  ].filter((a) => a.count > 0);

  return (
    <div className="p-4 sm:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Good afternoon, Fariz 👋</h1>
        <p className="text-gray-500 mt-1">Kamis, 07 Agustus 2026 · {role}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Delivery Request", value: inProgress, sub: "In Progress", icon: Truck, color: "bg-emerald-50 text-emerald-700", page: "delivery" },
          { label: "Return Material Faulty", value: waitingReview, sub: "Menunggu Review", icon: Undo2, color: "bg-amber-50 text-amber-600", page: "returnFaulty" },
          { label: "Rekonsiliasi Material", value: reconReview, sub: "Menunggu Review", icon: ClipboardList, color: "bg-blue-50 text-blue-600", page: "reconciliation" },
          { label: "Material On Hand", value: totalMaterial.toLocaleString("id-ID"), sub: "Total Material", icon: Boxes, color: "bg-emerald-50 text-emerald-700", page: "stock" },
        ].map((c) => (
          <Card key={c.label} className="p-5">
            <div className="flex items-start gap-3">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${c.color}`}><c.icon size={20} /></div>
              <div>
                <div className="text-sm font-medium text-gray-500">{c.label}</div>
                <div className="text-2xl font-bold text-gray-900 mt-0.5">{c.value}</div>
                <div className="text-xs text-gray-400">{c.sub}</div>
              </div>
            </div>
            <button onClick={() => setPage(c.page)} className="mt-4 text-sm font-medium text-emerald-800 flex items-center gap-1 hover:gap-2 transition-all">
              Lihat detail <ChevronRight size={15} />
            </button>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-5 lg:col-span-2">
          <SectionTitle title="Aktivitas Diperlukan" subtitle="Item yang membutuhkan tindakan Anda" />
          {actions.length === 0 ? (
            <EmptyState text="Tidak ada tindakan yang tertunda saat ini." />
          ) : (
            <div className="space-y-1">
              {actions.map((a, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${a.color}`}><a.icon size={17} /></div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{a.title}</div>
                      <div className="text-xs text-gray-500">{a.sub}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-700">{a.count}</span>
                    <GhostButton onClick={() => setPage(a.page)} className="py-1.5 px-3 text-xs">{a.cta}</GhostButton>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <SectionTitle title="Activity Overview" subtitle="7 hari terakhir" />
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Line type="monotone" dataKey="delivery" stroke="#065f46" strokeWidth={2} dot={false} name="Delivery" />
              <Line type="monotone" dataKey="faulty" stroke="#d97706" strokeWidth={2} dot={false} name="Faulty" />
              <Line type="monotone" dataKey="recon" stroke="#2563eb" strokeWidth={2} dot={false} name="Rekonsiliasi" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-5 lg:col-span-2">
          <SectionTitle title="Pengiriman Terbaru" right={<button onClick={() => setPage("delivery")} className="text-sm text-emerald-800 font-medium">Lihat semua</button>} />
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                <th className="pb-2 font-medium">No. Request</th>
                <th className="pb-2 font-medium">Tujuan</th>
                <th className="pb-2 font-medium">Tgl</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {deliveries.slice(0, 5).map((d) => (
                <tr key={d.id} className="border-b border-gray-50 last:border-0">
                  <td className="py-2.5 font-medium text-gray-800">{d.id}</td>
                  <td className="py-2.5 text-gray-600">{d.homebase}</td>
                  <td className="py-2.5 text-gray-500">{d.date}</td>
                  <td className="py-2.5"><StatusBadge status={d.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </Card>

        <Card className="p-5">
          <SectionTitle title="Inventory Summary" />
          <div className="space-y-3">
            {[
              { label: "Total Jenis Material", value: materials.length },
              { label: "Low Stock", value: lowStock, warn: lowStock > 0 },
              { label: "Out of Stock", value: materials.filter((m) => m.ready === 0).length, warn: true },
              { label: "Reserved", value: materials.reduce((s, m) => s + m.reserved, 0) },
            ].map((r) => (
              <div key={r.label} className="flex items-center justify-between text-sm">
                <span className="text-gray-500">{r.label}</span>
                <span className={`font-semibold ${r.warn && r.value > 0 ? "text-red-600" : "text-gray-800"}`}>{r.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ============================================================
   DELIVERY REQUEST MODULE
   ============================================================ */

function DeliveryList({ deliveries, setSelected, setPage, role }) {
  const [filter, setFilter] = useState("All");
  const statuses = ["All", "Waiting Logistics Approval", "In Progress", "Selesai Dikirim", "Rejected"];
  const filtered = filter === "All" ? deliveries : deliveries.filter((d) => d.status === filter || (filter === "In Progress" && ["In Progress", "Preparing", "Shipped", "Waiting Stock Assignment"].includes(d.status)));

  return (
    <div className="p-4 sm:p-8 space-y-5">
      <SectionTitle
        title="Delivery Request"
        subtitle="Pengajuan dan pengiriman material ke homebase / site"
        right={role === ROLES.SPV || role === ROLES.MANAGER ? (
          <PrimaryButton onClick={() => setPage("deliveryCreate")}><Plus size={16} /> Buat Request</PrimaryButton>
        ) : null}
      />
      <div className="flex gap-2 flex-wrap">
        {statuses.map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${filter === s ? "bg-emerald-800 text-white border-emerald-800" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
            {s}
          </button>
        ))}
      </div>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-400 bg-gray-50/60 border-b border-gray-100">
              <th className="px-5 py-3 font-medium">No. Request</th>
              <th className="px-5 py-3 font-medium">Requester</th>
              <th className="px-5 py-3 font-medium">Homebase</th>
              <th className="px-5 py-3 font-medium">Site</th>
              <th className="px-5 py-3 font-medium">Keperluan</th>
              <th className="px-5 py-3 font-medium">Tgl</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d) => (
              <tr key={d.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                <td className="px-5 py-3 font-medium text-gray-800">{d.id}</td>
                <td className="px-5 py-3 text-gray-600">{d.requester}</td>
                <td className="px-5 py-3 text-gray-600">{d.homebase}</td>
                <td className="px-5 py-3 text-gray-500">{d.site || "-"}</td>
                <td className="px-5 py-3 text-gray-500">{d.keperluan}</td>
                <td className="px-5 py-3 text-gray-500">{d.date}</td>
                <td className="px-5 py-3"><StatusBadge status={d.status} /></td>
                <td className="px-5 py-3">
                  <button onClick={() => setSelected(d.id)} className="text-emerald-800 text-xs font-medium flex items-center gap-1">
                    <Eye size={14} /> Detail
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8}><EmptyState text="Tidak ada data untuk filter ini." /></td></tr>
            )}
          </tbody>
        </table>
        </div>
      </Card>
    </div>
  );
}

function DeliveryCreate({ onSubmit, onCancel, materials, sites, homebases }) {
  const [step, setStep] = useState(1);
  const [homebase, setHomebase] = useState("");
  const [site, setSite] = useState("");
  const [siteSearch, setSiteSearch] = useState("");
  const [keperluan, setKeperluan] = useState("");
  const [otherDesc, setOtherDesc] = useState("");
  const [note, setNote] = useState("");
  const [cart, setCart] = useState({});
  const [matSearch, setMatSearch] = useState("");

  const hb = homebases.find((h) => h.name === homebase);
  const siteOptions = sites.filter((s) =>
    s.homebase === homebase &&
    (s.name.toLowerCase().includes(siteSearch.toLowerCase()) || s.code.toLowerCase().includes(siteSearch.toLowerCase()) || s.terminalId.toLowerCase().includes(siteSearch.toLowerCase()))
  );

  const filteredMaterials = materials.filter((m) => m.name.toLowerCase().includes(matSearch.toLowerCase()));

  const updateQty = (matId, delta) => {
    setCart((c) => {
      const current = c[matId] || 0;
      const next = Math.max(0, current + delta);
      return { ...c, [matId]: next };
    });
  };

  const cartItems = Object.entries(cart).filter(([, q]) => q > 0).map(([id, q]) => ({ material: materials.find((m) => m.id === id), qty: q }));
  const step1Valid = homebase && keperluan && (keperluan !== "Other" || otherDesc.trim());
  const step2Valid = cartItems.length > 0 && cartItems.every((i) => i.qty <= i.material.ready);

  return (
    <div className="p-4 sm:p-8 max-w-3xl mx-auto space-y-6">
      <SectionTitle title="Buat Delivery Request" subtitle="Ajukan kebutuhan material untuk homebase / site Anda" />

      <div className="flex items-center gap-2">
        {["Detail Kebutuhan", "Pilih Material", "Review & Submit"].map((label, i) => (
          <React.Fragment key={label}>
            <div className={`flex items-center gap-2 text-sm font-medium ${step === i + 1 ? "text-emerald-800" : step > i + 1 ? "text-emerald-600" : "text-gray-300"}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= i + 1 ? "bg-emerald-800 text-white" : "bg-gray-100 text-gray-400"}`}>
                {step > i + 1 ? <Check size={13} /> : i + 1}
              </div>
              <span className="hidden sm:inline">{label}</span>
            </div>
            {i < 2 && <div className="flex-1 h-px bg-gray-100" />}
          </React.Fragment>
        ))}
      </div>

      {step === 1 && (
        <Card className="p-6 space-y-5">
          <div>
            <label className="text-sm font-medium text-gray-700">Homebase / Area <span className="text-red-500">*</span></label>
            <select value={homebase} onChange={(e) => { setHomebase(e.target.value); setSite(""); }} className="mt-1.5 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-emerald-600">
              <option value="">Pilih homebase...</option>
              {homebases.map((h) => <option key={h.code} value={h.name}>{h.name} — {h.area}</option>)}
            </select>
            {hb && (
              <div className="mt-2 text-xs text-gray-500 bg-gray-50 rounded-lg p-3 space-y-1">
                <div className="flex items-center gap-1.5"><MapPin size={13} /> {hb.address}</div>
                <div className="flex items-center gap-1.5"><UserIcon size={13} /> {hb.pic} · <Phone size={13} /> {hb.phone}</div>
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Site <span className="text-gray-400 font-normal">(opsional, untuk pengiriman urgent)</span></label>
            <div className="relative mt-1.5">
              <input
                disabled={!homebase}
                value={site ? sites.find((s) => s.code === site)?.name : siteSearch}
                onChange={(e) => { setSiteSearch(e.target.value); setSite(""); }}
                placeholder={homebase ? "Cari nama site..." : "Pilih homebase terlebih dahulu"}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-emerald-600 disabled:bg-gray-50"
              />
              {siteSearch && !site && siteOptions.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {siteOptions.map((s) => (
                    <button key={s.code} onClick={() => { setSite(s.code); setSiteSearch(""); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">
                      {s.name} <span className="text-xs text-gray-400 ml-1">{s.code}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Keperluan <span className="text-red-500">*</span></label>
            <div className="mt-1.5 space-y-2">
              {KEPERLUAN_OPTIONS.map((k) => (
                <label key={k} className={`flex items-center gap-2.5 border rounded-lg px-3 py-2.5 cursor-pointer text-sm ${keperluan === k ? "border-emerald-600 bg-emerald-50/50" : "border-gray-200"}`}>
                  <input type="radio" checked={keperluan === k} onChange={() => setKeperluan(k)} className="accent-emerald-800" />
                  {k}
                </label>
              ))}
            </div>
            {keperluan === "Other" && (
              <input value={otherDesc} onChange={(e) => setOtherDesc(e.target.value)} placeholder="Jelaskan keperluan..." className="mt-2 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-emerald-600" />
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Catatan <span className="text-gray-400 font-normal">(opsional)</span></label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} className="mt-1.5 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-emerald-600" />
          </div>

          <div className="flex justify-between pt-2">
            <GhostButton onClick={onCancel}>Batal</GhostButton>
            <PrimaryButton disabled={!step1Valid} onClick={() => setStep(2)}>Lanjut <ChevronRight size={16} /></PrimaryButton>
          </div>
        </Card>
      )}

      {step === 2 && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5">
            <Search size={16} className="text-gray-400" />
            <input value={matSearch} onChange={(e) => setMatSearch(e.target.value)} placeholder="Cari material..." className="bg-transparent text-sm outline-none w-full" />
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {filteredMaterials.map((m) => {
              const qty = cart[m.id] || 0;
              const insufficient = qty > m.ready;
              return (
                <div key={m.id} className={`flex items-center justify-between border rounded-xl px-4 py-3 ${qty > 0 ? "border-emerald-200 bg-emerald-50/30" : "border-gray-100"}`}>
                  <div>
                    <div className="text-sm font-medium text-gray-800">{m.name}</div>
                    <div className={`text-xs mt-0.5 ${insufficient ? "text-red-600 font-medium" : "text-gray-400"}`}>
                      Stock Available: {m.ready}{qty > 0 && ` · Requested: ${qty} · ${insufficient ? "Insufficient Stock" : "Available"}`}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => updateQty(m.id, -1)} className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100"><Minus size={13} /></button>
                    <span className="w-6 text-center text-sm font-semibold">{qty}</span>
                    <button onClick={() => updateQty(m.id, 1)} className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100"><Plus size={13} /></button>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between pt-2">
            <GhostButton onClick={() => setStep(1)}><ChevronLeft size={16} /> Kembali</GhostButton>
            <PrimaryButton disabled={!step2Valid} onClick={() => setStep(3)}>Lanjut <ChevronRight size={16} /></PrimaryButton>
          </div>
        </Card>
      )}

      {step === 3 && (
        <Card className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><div className="text-gray-400 text-xs">Homebase</div><div className="font-medium text-gray-800">{homebase}</div></div>
            <div><div className="text-gray-400 text-xs">Site</div><div className="font-medium text-gray-800">{site ? sites.find((s) => s.code === site)?.name : "-"}</div></div>
            <div><div className="text-gray-400 text-xs">Keperluan</div><div className="font-medium text-gray-800">{keperluan === "Other" ? otherDesc : keperluan}</div></div>
            <div><div className="text-gray-400 text-xs">Catatan</div><div className="font-medium text-gray-800">{note || "-"}</div></div>
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-2">Material Diajukan</div>
            <div className="divide-y divide-gray-50 border border-gray-100 rounded-xl">
              {cartItems.map((i) => (
                <div key={i.material.id} className="flex justify-between px-4 py-2.5 text-sm">
                  <span className="text-gray-700">{i.material.name}</span>
                  <span className="font-medium text-gray-800">Qty {i.qty}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-between pt-2">
            <GhostButton onClick={() => setStep(2)}><ChevronLeft size={16} /> Kembali</GhostButton>
            <PrimaryButton onClick={() => onSubmit({ homebase, site: site ? sites.find((s) => s.code === site)?.name : "", keperluan: keperluan === "Other" ? `Other - ${otherDesc}` : keperluan, note, items: cartItems.map((i) => ({ material: i.material.name, qty: i.qty })) })}>
              <Check size={16} /> Submit Request
            </PrimaryButton>
          </div>
        </Card>
      )}
    </div>
  );
}

function DeliveryDetail({ delivery, onBack, onApprove, onReject, onAssignStock, onAdvance, role, materials, api }) {
  // Stage 1 — Manager reviews qty only, no SN involved.
  const canApprove = role === ROLES.MANAGER && delivery.status === "Waiting Logistics Approval";
  // Stage 2 — Logistics Staff (or Manager) picks the actual units to fulfill it.
  const canAssignStock = (role === ROLES.LOGISTICS || role === ROLES.MANAGER) && delivery.status === "Waiting Stock Assignment";
  const canAdvance = (role === ROLES.LOGISTICS || role === ROLES.MANAGER) && ["Preparing", "Shipped"].includes(delivery.status);
  const nextStatusMap = { Preparing: "Shipped", Shipped: "Delivered" };

  const [approving, setApproving] = useState(false);
  const handleApprove = async () => {
    setApproving(true);
    try { await onApprove(delivery.id); } finally { setApproving(false); }
  };

  const serializedItems = delivery.items.filter((i) => materials.find((m) => m.name === i.material)?.serialized);
  const [availableSerials, setAvailableSerials] = useState({}); // { material: [{sn,status},...] }
  const [selectedSerials, setSelectedSerials] = useState({}); // { material: Set<sn> }
  const [loadingSerials, setLoadingSerials] = useState(false);
  const [assigning, setAssigning] = useState(false);

  React.useEffect(() => {
    if (!canAssignStock || serializedItems.length === 0) return;
    let cancelled = false;
    setLoadingSerials(true);
    Promise.all(serializedItems.map((i) => api.getSerials(i.material, "Ready").then((data) => [i.material, data])))
      .then((results) => {
        if (cancelled) return;
        const map = {};
        results.forEach(([mat, data]) => { map[mat] = data; });
        setAvailableSerials(map);
      })
      .finally(() => { if (!cancelled) setLoadingSerials(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delivery.id, canAssignStock]);

  const toggleSerial = (material, sn, qty) => {
    setSelectedSerials((prev) => {
      const current = new Set(prev[material] || []);
      if (current.has(sn)) current.delete(sn);
      else {
        if (current.size >= qty) return prev;
        current.add(sn);
      }
      return { ...prev, [material]: current };
    });
  };

  const allSelected = serializedItems.every((i) => (selectedSerials[i.material]?.size || 0) === i.qty);
  const assignDisabled = serializedItems.length > 0 && (!allSelected || loadingSerials);

  const [confirmAssign, setConfirmAssign] = useState(false);
  const [confirmAdvance, setConfirmAdvance] = useState(false);

  const handleAssignStock = async () => {
    setAssigning(true);
    try {
      let serialSelections;
      if (serializedItems.length > 0) {
        serialSelections = {};
        serializedItems.forEach((i) => { serialSelections[i.material] = Array.from(selectedSerials[i.material] || []); });
      }
      await onAssignStock(delivery.id, serialSelections);
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-5">
      <button onClick={onBack} className="text-sm text-gray-500 flex items-center gap-1 hover:text-gray-800"><ChevronLeft size={16} /> Kembali ke daftar</button>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xl font-bold text-gray-900">{delivery.id}</div>
          <div className="text-sm text-gray-500 mt-1">Diajukan oleh {delivery.requester} · {delivery.date}</div>
        </div>
        <StatusBadge status={delivery.status} />
      </div>

      <Card className="p-5 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div><div className="text-gray-400 text-xs">Homebase</div><div className="font-medium text-gray-800">{delivery.homebase}</div></div>
        <div><div className="text-gray-400 text-xs">Site</div><div className="font-medium text-gray-800">{delivery.site || "-"}</div></div>
        <div><div className="text-gray-400 text-xs">Keperluan</div><div className="font-medium text-gray-800">{delivery.keperluan}</div></div>
        <div><div className="text-gray-400 text-xs">Catatan</div><div className="font-medium text-gray-800">{delivery.note || "-"}</div></div>
      </Card>

      <Card className="p-5">
        <SectionTitle title="Material Diajukan" />
        <div className="divide-y divide-gray-50">
          {delivery.items.map((i, idx) => (
            <div key={idx} className="py-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-700">{i.material}</span>
                <span className="font-medium text-gray-800">Qty {i.qty}</span>
              </div>
              {i.serials?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {i.serials.map((sn) => <span key={sn} className="text-xs bg-gray-50 rounded-full px-2 py-0.5 text-gray-500">{sn}</span>)}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {canAssignStock && serializedItems.length > 0 && (
        <Card className="p-5 space-y-5">
          <SectionTitle title="Pilih Serial Number" subtitle="Material serialized wajib dipilih unitnya sebelum stock bisa direservasi" />
          {loadingSerials ? (
            <div className="text-sm text-gray-400">Memuat Serial Number tersedia...</div>
          ) : (
            serializedItems.map((item) => {
              const selected = selectedSerials[item.material]?.size || 0;
              const options = availableSerials[item.material] || [];
              return (
                <div key={item.material}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-gray-800">{item.material}</div>
                    <span className={`text-xs font-semibold ${selected === item.qty ? "text-emerald-700" : "text-amber-600"}`}>{selected} / {item.qty} dipilih</span>
                  </div>
                  {options.length === 0 ? (
                    <div className="text-xs text-red-600">Tidak ada Serial Number Ready untuk material ini.</div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                      {options.map((opt) => {
                        const checked = selectedSerials[item.material]?.has(opt.sn) || false;
                        return (
                          <label key={opt.sn} className={`flex items-center gap-2 text-xs border rounded-lg px-2.5 py-2 cursor-pointer ${checked ? "border-emerald-300 bg-emerald-50/50" : "border-gray-200"}`}>
                            <input type="checkbox" checked={checked} onChange={() => toggleSerial(item.material, opt.sn, item.qty)} className="accent-emerald-800" />
                            {opt.sn}
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </Card>
      )}

      {canApprove && (
        <Card className="p-5 flex items-center justify-between">
          <div className="text-sm text-gray-600">Tinjau permintaan ini berdasarkan jumlah yang diajukan dan tentukan persetujuan.</div>
          <div className="flex gap-2">
            <DangerButton onClick={() => onReject(delivery.id)}><X size={15} /> Reject</DangerButton>
            <PrimaryButton onClick={handleApprove} disabled={approving}>
              <Check size={15} /> {approving ? "Memproses..." : "Approve"}
            </PrimaryButton>
          </div>
        </Card>
      )}

      {canAssignStock && (
        <Card className="p-5 flex items-center justify-between">
          <div className="text-sm text-gray-600">Sudah disetujui Manager — tentukan unit stock yang akan dikirim.</div>
          <PrimaryButton onClick={() => setConfirmAssign(true)} disabled={assignDisabled || assigning}>
            <Check size={15} /> {assigning ? "Memproses..." : "Reservasi Stock"}
          </PrimaryButton>
        </Card>
      )}

      {canAdvance && (
        <Card className="p-5 flex items-center justify-between">
          <div className="text-sm text-gray-600">Ubah status pengiriman ke "{nextStatusMap[delivery.status]}".</div>
          <PrimaryButton onClick={() => setConfirmAdvance(true)}>Set: {nextStatusMap[delivery.status]}</PrimaryButton>
        </Card>
      )}

      <ConfirmDialog
        open={confirmAssign}
        title="Reservasi Stock"
        message={
          <div className="space-y-3">
            <div>Stock berikut akan direservasi untuk {delivery.id}:</div>
            {delivery.items.map((item) => {
              const isSerialized = serializedItems.some((si) => si.material === item.material);
              const chosen = isSerialized ? Array.from(selectedSerials[item.material] || []) : null;
              return (
                <div key={item.material}>
                  <div className="text-xs font-medium text-gray-800">{item.material} · Qty {item.qty}</div>
                  {isSerialized ? (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {chosen.map((sn) => (
                        <span key={sn} className="text-xs bg-emerald-50 text-emerald-700 rounded-full px-2 py-0.5">{sn}</span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400 mt-0.5">Non-serialized — tanpa SN</div>
                  )}
                </div>
              );
            })}
          </div>
        }
        confirmLabel="Ya, Reservasi"
        onConfirm={() => { setConfirmAssign(false); handleAssignStock(); }}
        onCancel={() => setConfirmAssign(false)}
      />

      <ConfirmDialog
        open={confirmAdvance}
        title={`Set status ke "${nextStatusMap[delivery.status]}"`}
        message={`Ubah status pengiriman ${delivery.id} menjadi "${nextStatusMap[delivery.status]}"? Aksi ini tidak bisa dibatalkan.`}
        confirmLabel="Ya, Ubah Status"
        onConfirm={() => { setConfirmAdvance(false); onAdvance(delivery.id); }}
        onCancel={() => setConfirmAdvance(false)}
      />

      <Card className="p-5">
        <SectionTitle title="Audit Trail" />
        <div className="space-y-3">
          {delivery.history.map((h, i) => (
            <div key={i} className="flex gap-3 text-sm">
              <div className="text-xs text-gray-400 w-32 shrink-0">{h.time}</div>
              <div className="text-gray-700">{h.text}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ============================================================
   WAREHOUSE STOCK + MOVEMENT
   ============================================================ */

function GoodsReceiptForm({ materials, onSubmit, onCancel, showToast }) {
  const [material, setMaterial] = useState("");
  const [serials, setSerials] = useState([""]);
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const mat = materials.find((m) => m.name === material);

  const addSN = () => setSerials([...serials, ""]);
  const updateSN = (i, val) => setSerials(serials.map((s, idx) => (idx === i ? val : s)));
  const removeSN = (i) => setSerials(serials.filter((_, idx) => idx !== i));

  const trimmedSerials = serials.map((s) => s.trim()).filter(Boolean);
  const hasDuplicates = new Set(trimmedSerials).size !== trimmedSerials.length;
  const valid = mat && (mat.serialized ? trimmedSerials.length > 0 && !hasDuplicates : qty > 0);

  const submit = async () => {
    setSaving(true); setError("");
    const submittedMaterial = material;
    const submittedQty = mat.serialized ? trimmedSerials.length : qty;
    try {
      await onSubmit(mat.serialized ? { material, serials: trimmedSerials, note } : { material, qty, note });
      showToast(`Berhasil menerima ${submittedQty} unit ${submittedMaterial}`);
      // Reset fields for the next entry, but keep the form open.
      setMaterial(""); setSerials([""]); setQty(1); setNote("");
    } catch (err) {
      setError(err.message || "Gagal menyimpan penerimaan barang");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="p-5 space-y-4">
      <div className="text-sm font-semibold text-gray-800">Terima Barang</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-gray-500">Material <span className="text-red-500">*</span></label>
          <select value={material} onChange={(e) => { setMaterial(e.target.value); setSerials([""]); }} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-600">
            <option value="">Pilih material...</option>
            {materials.map((m) => <option key={m.id} value={m.name}>{m.name} {m.serialized ? "(Serialized)" : ""}</option>)}
          </select>
        </div>

        {mat && !mat.serialized && (
          <div>
            <label className="text-xs font-medium text-gray-500">Qty <span className="text-red-500">*</span></label>
            <input type="number" min={1} value={qty} onChange={(e) => setQty(Number(e.target.value))} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-600" />
          </div>
        )}

        <div className={mat && !mat.serialized ? "" : "sm:col-span-2"}>
          <label className="text-xs font-medium text-gray-500">Catatan <span className="text-gray-400 font-normal">(opsional, mis. nomor PO)</span></label>
          <input value={note} onChange={(e) => setNote(e.target.value)} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-600" />
        </div>
      </div>

      {mat && mat.serialized && (
        <div className="space-y-3 pt-2 border-t border-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-gray-800">Serial Number Unit Baru</div>
            <button onClick={addSN} className="text-xs text-emerald-800 font-medium flex items-center gap-1"><Plus size={14} /> Add SN</button>
          </div>
          {serials.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs text-gray-400 w-5">{i + 1}.</span>
              <input value={s} onChange={(e) => updateSN(i, e.target.value)} placeholder="Masukkan Serial Number" className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-600" />
              {serials.length > 1 && <button onClick={() => removeSN(i)} className="text-gray-300 hover:text-red-500"><X size={16} /></button>}
            </div>
          ))}
          {hasDuplicates && <div className="text-xs text-red-600">Ada Serial Number duplikat dalam daftar ini.</div>}
          <div className="text-xs text-gray-400">Total unit: {trimmedSerials.length}</div>
        </div>
      )}

      {error && <div className="bg-red-50 border border-red-100 text-red-700 text-xs rounded-lg px-3 py-2">{error}</div>}

      <div className="flex justify-end gap-2">
        <GhostButton onClick={onCancel}>Batal</GhostButton>
        <PrimaryButton disabled={!valid || saving} onClick={submit}>{saving ? "Menyimpan..." : "Simpan Penerimaan"}</PrimaryButton>
      </div>
    </Card>
  );
}

function WarehouseStock({ materials, setPage, setMovementFilter, setSerialMaterial, onSubmitReceipt, showToast }) {
  const [search, setSearch] = useState("");
  const [showReceiptForm, setShowReceiptForm] = useState(false);
  const filtered = materials.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-4 sm:p-8 space-y-5">
      <SectionTitle
        title="Warehouse Stock" subtitle="Ketersediaan material di gudang pusat"
        right={<PrimaryButton onClick={() => setShowReceiptForm(!showReceiptForm)}><Plus size={16} /> Terima Barang</PrimaryButton>}
      />

      {showReceiptForm && (
        <GoodsReceiptForm
          materials={materials}
          onCancel={() => setShowReceiptForm(false)}
          onSubmit={onSubmitReceipt}
          showToast={showToast}
        />
      )}

      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2.5 w-80">
        <Search size={16} className="text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari material..." className="bg-transparent text-sm outline-none w-full" />
      </div>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-400 bg-gray-50/60 border-b border-gray-100">
              <th className="px-5 py-3 font-medium">Material</th>
              <th className="px-5 py-3 font-medium">Category</th>
              <th className="px-5 py-3 font-medium">Ready</th>
              <th className="px-5 py-3 font-medium">Faulty</th>
              <th className="px-5 py-3 font-medium">Reserved</th>
              <th className="px-5 py-3 font-medium">In Transit</th>
              <th className="px-5 py-3 font-medium">Total</th>
              <th className="px-5 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => {
              const total = m.ready + m.faulty + m.reserved + m.transit;
              const low = m.ready <= m.minStock;
              return (
                <tr key={m.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                  <td className="px-5 py-3">
                    <div className="font-medium text-gray-800">{m.name}</div>
                    {low && <div className="text-xs text-red-600 font-medium mt-0.5 flex items-center gap-1"><AlertTriangle size={11} /> Mendekati stok minimum ({m.minStock})</div>}
                  </td>
                  <td className="px-5 py-3 text-gray-500">{m.category}</td>
                  <td className="px-5 py-3 font-semibold text-emerald-700">{m.ready}</td>
                  <td className="px-5 py-3 text-amber-600">{m.faulty}</td>
                  <td className="px-5 py-3 text-blue-600">{m.reserved}</td>
                  <td className="px-5 py-3 text-indigo-600">{m.transit}</td>
                  <td className="px-5 py-3 font-medium text-gray-800">{total}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {m.serialized && <button onClick={() => { setSerialMaterial(m.name); setPage("serialDetail"); }} className="text-emerald-800 text-xs font-medium">Lihat SN</button>}
                      <button onClick={() => { setMovementFilter(m.name); setPage("movement"); }} className="text-gray-500 text-xs font-medium">Riwayat</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </Card>
    </div>
  );
}

function MaterialSerialDetail({ material, api, onBack }) {
  const [status, setStatus] = useState("All");
  const [serials, setSerials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api.getSerials(material, status === "All" ? undefined : status)
      .then((data) => { if (!cancelled) { setSerials(data); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [material, status]);

  const filtered = search ? serials.filter((s) => s.sn.toLowerCase().includes(search.toLowerCase())) : serials;
  const statusOptions = ["All", "Ready", "Reserved", "In Transit", "Delivered", "Faulty"];

  return (
    <div className="p-4 sm:p-8 space-y-5">
      <button onClick={onBack} className="text-sm text-gray-500 flex items-center gap-1 hover:text-gray-800"><ChevronLeft size={16} /> Kembali ke Warehouse Stock</button>
      <SectionTitle title={`Serial Number — ${material}`} subtitle="Daftar unit per Serial Number dan status terkininya" />

      <div className="flex flex-wrap gap-2">
        {statusOptions.map((s) => (
          <button key={s} onClick={() => setStatus(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${status === s ? "bg-emerald-800 text-white border-emerald-800" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
            {s}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2.5 w-80">
        <Search size={16} className="text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari Serial Number..." className="bg-transparent text-sm outline-none w-full" />
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-400 bg-gray-50/60 border-b border-gray-100">
              <th className="px-5 py-3 font-medium">Serial Number</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Referensi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={3}><div className="py-10 text-center text-sm text-gray-400">Memuat...</div></td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={3}><EmptyState text="Tidak ada Serial Number untuk filter ini." /></td></tr>
            ) : (
              filtered.map((s) => (
                <tr key={s.sn} className="border-b border-gray-50 last:border-0">
                  <td className="px-5 py-3 font-medium text-gray-800">{s.sn}</td>
                  <td className="px-5 py-3"><StatusBadge status={s.status} /></td>
                  <td className="px-5 py-3 text-gray-500 text-xs">{s.current_ref || s.received_ref || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </Card>
    </div>
  );
}

function StockMovement({ movements, filter, setFilter }) {
  const filtered = filter ? movements.filter((m) => m.material === filter) : movements;
  const [expandedId, setExpandedId] = useState(null);

  return (
    <div className="p-4 sm:p-8 space-y-5">
      <SectionTitle title="Stock Movement" subtitle="Riwayat pergerakan seluruh material gudang" right={filter && <GhostButton onClick={() => setFilter("")}>Hapus filter: {filter} <X size={14} /></GhostButton>} />
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-400 bg-gray-50/60 border-b border-gray-100">
              <th className="px-5 py-3 font-medium">ID</th>
              <th className="px-5 py-3 font-medium">Tanggal</th>
              <th className="px-5 py-3 font-medium">Material</th>
              <th className="px-5 py-3 font-medium">Perubahan</th>
              <th className="px-5 py-3 font-medium">Referensi</th>
              <th className="px-5 py-3 font-medium">Remaining</th>
              <th className="px-5 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => {
              const hasSerials = m.serials && m.serials.length > 0;
              const expanded = expandedId === m.id;
              return (
                <React.Fragment key={m.id}>
                  <tr className="border-b border-gray-50 last:border-0">
                    <td className="px-5 py-3 font-medium text-gray-800">{m.id}</td>
                    <td className="px-5 py-3 text-gray-500">{m.date}</td>
                    <td className="px-5 py-3 text-gray-700">{m.material}</td>
                    <td className={`px-5 py-3 font-semibold ${m.qty > 0 ? "text-emerald-700" : "text-red-600"}`}>{m.qty > 0 ? `+${m.qty}` : m.qty}</td>
                    <td className="px-5 py-3 text-gray-500">{m.ref}</td>
                    <td className="px-5 py-3 font-medium text-gray-800">{m.remaining}</td>
                    <td className="px-5 py-3">
                      {hasSerials && (
                        <button onClick={() => setExpandedId(expanded ? null : m.id)} className="text-emerald-800 text-xs font-medium">
                          {expanded ? "Sembunyikan" : `Lihat SN (${m.serials.length})`}
                        </button>
                      )}
                    </td>
                  </tr>
                  {expanded && hasSerials && (
                    <tr className="bg-gray-50/60 border-b border-gray-50 last:border-0">
                      <td colSpan={7} className="px-5 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          {m.serials.map((sn) => <span key={sn} className="text-xs bg-white border border-gray-200 rounded-full px-2.5 py-1 text-gray-600">{sn}</span>)}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
            {filtered.length === 0 && <tr><td colSpan={7}><EmptyState text="Belum ada pergerakan stock." /></td></tr>}
          </tbody>
        </table>
        </div>
      </Card>
    </div>
  );
}


/* ============================================================
   RETURN MATERIAL FAULTY MODULE
   ============================================================ */

function ReturnFaultyList({ returns, setSelected, setPage, role }) {
  return (
    <div className="p-4 sm:p-8 space-y-5">
      <SectionTitle
        title="Return Material Faulty"
        subtitle="Pengembalian material rusak oleh teknisi lapangan"
        right={role === ROLES.TECH || role === ROLES.MANAGER ? <PrimaryButton onClick={() => setPage("returnFaultyCreate")}><Plus size={16} /> Buat Return</PrimaryButton> : null}
      />
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-400 bg-gray-50/60 border-b border-gray-100">
              <th className="px-5 py-3 font-medium">Return ID</th>
              <th className="px-5 py-3 font-medium">Technician</th>
              <th className="px-5 py-3 font-medium">Homebase</th>
              <th className="px-5 py-3 font-medium">Material</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {returns.map((r) => (
              <tr key={r.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                <td className="px-5 py-3 font-medium text-gray-800">{r.id}</td>
                <td className="px-5 py-3 text-gray-600">{r.technician}</td>
                <td className="px-5 py-3 text-gray-600">{r.homebase}</td>
                <td className="px-5 py-3 text-gray-500">{r.items.map((i) => i.material).join(", ")}</td>
                <td className="px-5 py-3"><StatusBadge status={r.status} /></td>
                <td className="px-5 py-3 flex items-center gap-3">
                  <button onClick={() => setSelected(r.id)} className="text-emerald-800 text-xs font-medium flex items-center gap-1"><Eye size={14} /> Detail</button>
                  {role === ROLES.TECH && r.status === "Revision Required" && (
                    <span className="text-red-600 text-xs font-medium">Perlu Revisi</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </Card>
    </div>
  );
}

function DocCheck({ label, checked, onToggle }) {
  return (
    <button onClick={onToggle} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm text-left transition-colors ${checked ? "border-emerald-200 bg-emerald-50/50" : "border-gray-200"}`}>
      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${checked ? "bg-emerald-800 text-white" : "border-2 border-gray-300"}`}>
        {checked && <Check size={13} />}
      </div>
      <span className={checked ? "text-gray-800 font-medium" : "text-gray-500"}>{label}</span>
      <Camera size={15} className="ml-auto text-gray-300" />
    </button>
  );
}

/* Real photo upload with thumbnail preview - stores a data URL so the checklist
   reflects an actual captured/selected image rather than a plain boolean flag. */
function PhotoUpload({ label, value, onChange, compact }) {
  const inputRef = React.useRef(null);
  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result);
    reader.readAsDataURL(file);
  };
  if (compact) {
    return (
      <>
        <input ref={inputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />
        <button onClick={() => inputRef.current?.click()} className={`px-3 py-2 rounded-lg text-xs font-medium border flex items-center gap-1.5 shrink-0 ${value ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-gray-200 text-gray-400"}`}>
          {value ? <img src={value} alt="" className="w-4 h-4 rounded object-cover" /> : <Camera size={13} />}
          {value ? "Foto ✓" : "Upload Foto"}
        </button>
      </>
    );
  }
  return (
    <div>
      <input ref={inputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />
      <button onClick={() => inputRef.current?.click()} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm text-left transition-colors ${value ? "border-emerald-200 bg-emerald-50/50" : "border-gray-200"}`}>
        {value ? (
          <img src={value} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0" />
        ) : (
          <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0"><Camera size={16} className="text-gray-400" /></div>
        )}
        <span className={value ? "text-gray-800 font-medium" : "text-gray-500"}>{label}</span>
        <span className="ml-auto text-xs text-gray-400">{value ? "Ganti foto" : "Ambil / pilih foto"}</span>
      </button>
    </div>
  );
}

/* Scans all active (non-completed/rejected) Return Faulty and Reconciliation
   transactions for a serial number already in use elsewhere. */
function findSNConflict(sn, { returns = [], reconciliations = [], excludeId = null }) {
  if (!sn?.trim()) return null;
  const activeReturnStatuses = ["Waiting Logistics Review", "Revision Required", "Ready to Ship", "On Delivery", "Received by Warehouse", "QC Checking"];
  const activeReconStatuses = ["Waiting Logistics Review", "Revision Required"];
  for (const r of returns) {
    if (r.id === excludeId || !activeReturnStatuses.includes(r.status)) continue;
    for (const item of r.items) {
      if (item.serials.some((s) => s.sn.trim() === sn.trim())) return `Return Faulty ${r.id}`;
    }
  }
  for (const r of reconciliations) {
    if (r.id === excludeId || !activeReconStatuses.includes(r.status)) continue;
    for (const item of r.items) {
      if (item.serials?.some((s) => s.trim() === sn.trim())) return `Reconciliation ${r.id}`;
    }
  }
  return null;
}

function ReturnFaultyCreate({ onSubmit, onCancel, materials, returns, reconciliations, initialData, excludeId, revisionNote }) {
  const isEdit = !!initialData;
  const [material, setMaterial] = useState(initialData?.material || "");
  const [qty, setQty] = useState(initialData?.qty || 1);
  const [serials, setSerials] = useState(initialData?.serials?.length ? initialData.serials.map((s) => ({ ...s })) : [{ sn: "", photo: "" }]);
  const [docs, setDocs] = useState(initialData?.docs ? { ...initialData.docs } : { beforePacking: "", afterPacking: "", weighing: "" });

  const mat = materials.find((m) => m.name === material);
  const addSN = () => setSerials([...serials, { sn: "", photo: "" }]);
  const updateSN = (i, field, val) => setSerials(serials.map((s, idx) => (idx === i ? { ...s, [field]: val } : s)));
  const removeSN = (i) => setSerials(serials.filter((_, idx) => idx !== i));

  const docsCompleted = Object.values(docs).filter(Boolean).length + serials.filter((s) => s.photo).length;
  const docsTotal = 3 + serials.length;
  const allSNFilled = serials.length > 0 && serials.every((s) => s.sn.trim() && s.photo);
  const hasDuplicateSN = new Set(serials.map((s) => s.sn.trim()).filter(Boolean)).size !== serials.map((s) => s.sn.trim()).filter(Boolean).length;
  const conflicts = serials.map((s) => ({ sn: s.sn, conflict: findSNConflict(s.sn, { returns, reconciliations, excludeId }) })).filter((c) => c.conflict);
  const valid = material && qty > 0 && allSNFilled && !hasDuplicateSN && conflicts.length === 0 && docs.beforePacking && docs.afterPacking && docs.weighing;

  return (
    <div className="p-4 sm:p-8 max-w-2xl mx-auto space-y-6">
      <SectionTitle
        title={isEdit ? `Perbaiki Return Material Faulty — ${excludeId}` : "Buat Return Material Faulty"}
        subtitle={isEdit ? "Perbarui data sesuai catatan revisi, lalu kirim ulang ke Logistics" : "Input Serial Number secara manual untuk setiap unit"}
      />

      {isEdit && revisionNote && (
        <Card className="p-4 border-red-200 bg-red-50/50 flex items-start gap-3">
          <AlertTriangle size={18} className="text-red-500 mt-0.5 shrink-0" />
          <div className="text-sm text-red-700"><span className="font-semibold">Catatan revisi dari Logistics: </span>{revisionNote}</div>
        </Card>
      )}

      <Card className="p-6 space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700">Material <span className="text-red-500">*</span></label>
          <select value={material} onChange={(e) => setMaterial(e.target.value)} className="mt-1.5 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-emerald-600">
            <option value="">Pilih material...</option>
            {materials.map((m) => <option key={m.id} value={m.name}>{m.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Qty <span className="text-red-500">*</span></label>
          <input type="number" min={1} value={qty} onChange={(e) => setQty(Number(e.target.value))} className="mt-1.5 w-32 border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-emerald-600" />
        </div>
      </Card>

      <Card className="p-6 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-gray-800">Serial Number (Input Manual)</div>
          <button onClick={addSN} className="text-xs text-emerald-800 font-medium flex items-center gap-1"><Plus size={14} /> Add SN</button>
        </div>
        {serials.map((s, i) => {
          const conflict = findSNConflict(s.sn, { returns, reconciliations, excludeId });
          return (
            <div key={i} className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-5">{i + 1}.</span>
                <input value={s.sn} onChange={(e) => updateSN(i, "sn", e.target.value)} placeholder="Masukkan Serial Number" className={`flex-1 border rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-600 ${conflict ? "border-red-300" : "border-gray-200"}`} />
                <PhotoUpload compact value={s.photo} onChange={(val) => updateSN(i, "photo", val)} />
                {serials.length > 1 && <button onClick={() => removeSN(i)} className="text-gray-300 hover:text-red-500"><X size={16} /></button>}
              </div>
              {conflict && <div className="text-xs text-red-600 pl-7">Serial Number ini sedang digunakan pada {conflict}.</div>}
            </div>
          );
        })}
        {hasDuplicateSN && <div className="text-xs text-red-600">Terdapat Serial Number duplikat dalam transaksi ini.</div>}
      </Card>

      <Card className="p-6 space-y-3">
        <div className="flex items-center justify-between mb-1">
          <div className="text-sm font-semibold text-gray-800">Dokumentasi</div>
          <div className="text-xs text-gray-500">Documentation {docsCompleted} / {docsTotal} Completed</div>
        </div>
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-700 transition-all" style={{ width: `${(docsCompleted / docsTotal) * 100}%` }} />
        </div>
        <PhotoUpload label="Foto Seluruh Material Sebelum Packing" value={docs.beforePacking} onChange={(v) => setDocs({ ...docs, beforePacking: v })} />
        <PhotoUpload label="Foto Seluruh Material Setelah Packing" value={docs.afterPacking} onChange={(v) => setDocs({ ...docs, afterPacking: v })} />
        <PhotoUpload label="Foto Packing Setelah Ditimbang" value={docs.weighing} onChange={(v) => setDocs({ ...docs, weighing: v })} />
        <div className="text-xs text-gray-400 pt-1">Nomor / foto resi tidak wajib sekarang — bisa ditambahkan setelah resi terbit dari ekspedisi.</div>
      </Card>

      <div className="flex justify-between">
        <GhostButton onClick={onCancel}>Batal</GhostButton>
        <PrimaryButton disabled={!valid} onClick={() => onSubmit({ material, qty, serials, docs })}>
          <Check size={16} /> {isEdit ? "Kirim Ulang ke Logistics" : "Submit Return"}
        </PrimaryButton>
      </div>
    </div>
  );
}

function ReturnFaultyDetail({ r, onBack, onApprove, onRevise, onShip, onAddResi, onReceive, onQC, onComplete, onEdit, role }) {
  const [revisionText, setRevisionText] = useState("");
  const [showRevisionInput, setShowRevisionInput] = useState(false);
  const [resiInput, setResiInput] = useState("");
  const [showResiInput, setShowResiInput] = useState(false);

  const canReview = (role === ROLES.LOGISTICS || role === ROLES.MANAGER) && r.status === "Waiting Logistics Review";
  const canShip = role === ROLES.TECH && r.status === "Ready to Ship";
  const canEdit = role === ROLES.TECH && r.status === "Revision Required";
  const canAddResi = role === ROLES.TECH && !r.resiNumber && ["On Delivery", "Received by Warehouse", "QC Checking"].includes(r.status);
  const canReceive = (role === ROLES.LOGISTICS || role === ROLES.MANAGER) && r.status === "On Delivery";
  const canQC = (role === ROLES.LOGISTICS || role === ROLES.MANAGER) && r.status === "Received by Warehouse";
  const canComplete = (role === ROLES.LOGISTICS || role === ROLES.MANAGER) && r.status === "QC Checking";

  const checklist = [
    { label: "Semua SN terdokumentasi", ok: r.items.every((i) => i.serials.every((s) => s.sn)) },
    { label: "Foto SN jelas", ok: r.items.every((i) => i.serials.every((s) => s.photo)) },
    { label: "Foto barang sebelum packing", ok: !!r.docs.beforePacking },
    { label: "Foto barang setelah packing", ok: !!r.docs.afterPacking },
    { label: "Foto packing + timbangan", ok: !!r.docs.weighing },
  ];

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-5">
      <button onClick={onBack} className="text-sm text-gray-500 flex items-center gap-1 hover:text-gray-800"><ChevronLeft size={16} /> Kembali ke daftar</button>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xl font-bold text-gray-900">{r.id}</div>
          <div className="text-sm text-gray-500 mt-1">Teknisi {r.technician} · {r.homebase}{r.site ? ` / ${r.site}` : ""}</div>
        </div>
        <StatusBadge status={r.status} />
      </div>

      {r.status === "Revision Required" && r.revisionNote && (
        <Card className="p-4 border-red-200 bg-red-50/50 flex items-start gap-3">
          <AlertTriangle size={18} className="text-red-500 mt-0.5" />
          <div className="text-sm text-red-700 flex-1"><span className="font-semibold">Revisi diminta: </span>{r.revisionNote}</div>
          {canEdit && (
            <PrimaryButton onClick={() => onEdit(r.id)} className="shrink-0">Perbaiki & Kirim Ulang</PrimaryButton>
          )}
        </Card>
      )}

      <Card className="p-5">
        <SectionTitle title="Material & Serial Number" />
        {r.items.map((i, idx) => (
          <div key={idx} className="mb-3 last:mb-0">
            <div className="text-sm font-medium text-gray-800 mb-1.5">{i.material} · Qty {i.qty}</div>
            <div className="grid grid-cols-2 gap-2">
              {i.serials.map((s, si) => (
                <div key={si} className="flex items-center gap-2 text-xs bg-gray-50 rounded-lg px-3 py-2">
                  {typeof s.photo === "string" && s.photo ? <img src={s.photo} alt="" className="w-7 h-7 rounded object-cover" /> : <div className="w-7 h-7 rounded bg-gray-200" />}
                  <span className="text-gray-600 flex-1">{s.sn}</span>
                  <span className={s.photo ? "text-emerald-600" : "text-red-500"}>{s.photo ? "Foto ✓" : "Foto belum ada"}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </Card>

      <Card className="p-5">
        <SectionTitle title="Checklist Dokumentasi" />
        <div className="space-y-2">
          {checklist.map((c, i) => (
            <div key={i} className="flex items-center gap-2.5 text-sm">
              <div className={`w-5 h-5 rounded-md flex items-center justify-center ${c.ok ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>
                {c.ok ? <Check size={12} /> : <X size={12} />}
              </div>
              <span className={c.ok ? "text-gray-700" : "text-red-600"}>{c.label}</span>
            </div>
          ))}
          <div className="flex items-center gap-2.5 text-sm pt-1 border-t border-gray-50 mt-2">
            <span className="text-gray-400">Resi: {r.resiNumber || "Belum tersedia (optional)"}</span>
          </div>
        </div>
      </Card>

      {canReview && (
        <Card className="p-5">
          {showRevisionInput ? (
            <div className="space-y-3">
              <textarea value={revisionText} onChange={(e) => setRevisionText(e.target.value)} placeholder="Jelaskan alasan revisi..." rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-emerald-600" />
              <div className="flex justify-end gap-2">
                <GhostButton onClick={() => setShowRevisionInput(false)}>Batal</GhostButton>
                <DangerButton onClick={() => revisionText.trim() && onRevise(r.id, revisionText)}>Kirim Revisi</DangerButton>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">Review dokumentasi return sebelum barang boleh dikirim.</div>
              <div className="flex gap-2">
                <DangerButton onClick={() => setShowRevisionInput(true)}>Request Revision</DangerButton>
                <PrimaryButton onClick={() => onApprove(r.id)}><Check size={15} /> Approve</PrimaryButton>
              </div>
            </div>
          )}
        </Card>
      )}

      {canShip && (
        <Card className="p-5 flex items-center justify-between">
          <div className="text-sm text-gray-600">Barang sudah disetujui — silakan kirim. Resi boleh ditambahkan setelah tersedia.</div>
          <PrimaryButton onClick={() => onShip(r.id)}>Tandai Sudah Dikirim</PrimaryButton>
        </Card>
      )}

      {canAddResi && (
        <Card className="p-5">
          {showResiInput ? (
            <div className="flex items-center gap-2">
              <input value={resiInput} onChange={(e) => setResiInput(e.target.value)} placeholder="Nomor resi..." className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-600" />
              <PrimaryButton onClick={() => resiInput.trim() && onAddResi(r.id, resiInput)}>Simpan</PrimaryButton>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">Resi sudah terbit dari ekspedisi? Tambahkan nomornya di sini.</div>
              <GhostButton onClick={() => setShowResiInput(true)}>+ Tambah Resi</GhostButton>
            </div>
          )}
        </Card>
      )}

      {canReceive && (
        <Card className="p-5 flex items-center justify-between">
          <div className="text-sm text-gray-600">Konfirmasi barang telah diterima kembali di warehouse.</div>
          <PrimaryButton onClick={() => onReceive(r.id)}>Received by Warehouse</PrimaryButton>
        </Card>
      )}
      {canQC && (
        <Card className="p-5 flex items-center justify-between">
          <div className="text-sm text-gray-600">Lakukan QC checking terhadap material yang diterima.</div>
          <PrimaryButton onClick={() => onQC(r.id)}>Selesai QC Checking</PrimaryButton>
        </Card>
      )}
      {canComplete && (
        <Card className="p-5 flex items-center justify-between">
          <div className="text-sm text-gray-600">Selesaikan transaksi — stock warehouse (Faulty) akan diperbarui.</div>
          <PrimaryButton onClick={() => onComplete(r.id)}><Check size={15} /> Complete</PrimaryButton>
        </Card>
      )}

      <Card className="p-5">
        <SectionTitle title="Audit Trail" />
        <div className="space-y-3">
          {r.history.map((h, i) => (
            <div key={i} className="flex gap-3 text-sm">
              <div className="text-xs text-gray-400 w-32 shrink-0">{h.time}</div>
              <div className="text-gray-700">{h.text}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ============================================================
   RECONCILIATION MODULE
   ============================================================ */

function ReconciliationList({ items, setSelected, setPage, role }) {
  return (
    <div className="p-4 sm:p-8 space-y-5">
      <SectionTitle
        title="Reconciliation Material"
        subtitle="Verifikasi fisik material yang dikuasai field team / homebase"
        right={role === ROLES.TECH || role === ROLES.MANAGER ? <PrimaryButton onClick={() => setPage("reconciliationCreate")}><Plus size={16} /> Buat Rekonsiliasi</PrimaryButton> : null}
      />
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-400 bg-gray-50/60 border-b border-gray-100">
              <th className="px-5 py-3 font-medium">Reconciliation ID</th>
              <th className="px-5 py-3 font-medium">Homebase</th>
              <th className="px-5 py-3 font-medium">Periode</th>
              <th className="px-5 py-3 font-medium">Discrepancy</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((r) => {
              const totalDisc = r.items.reduce((s, i) => s + (i.systemQty - i.actualQty), 0);
              return (
                <tr key={r.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                  <td className="px-5 py-3 font-medium text-gray-800">{r.id}</td>
                  <td className="px-5 py-3 text-gray-600">{r.homebase}</td>
                  <td className="px-5 py-3 text-gray-500">{r.period}</td>
                  <td className={`px-5 py-3 font-medium ${totalDisc !== 0 ? "text-red-600" : "text-emerald-600"}`}>{totalDisc !== 0 ? `-${totalDisc}` : "0"}</td>
                  <td className="px-5 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <button onClick={() => setSelected(r.id)} className="text-emerald-800 text-xs font-medium flex items-center gap-1"><Eye size={14} /> Detail</button>
                      {role === ROLES.TECH && r.status === "Revision Required" && <span className="text-red-600 text-xs font-medium">Perlu Revisi</span>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </Card>
    </div>
  );
}

function ReconciliationCreate({ onSubmit, onCancel, materials, returns, reconciliations, homebases, initialData, excludeId, revisionNote }) {
  const isEdit = !!initialData;
  const [homebase, setHomebase] = useState(initialData?.homebase || "");
  const [period, setPeriod] = useState(initialData?.period || "01 - 15 Agustus 2026");
  const [rows, setRows] = useState(
    initialData?.items
      ? initialData.items.map((r) => ({ ...r, serials: r.serials ? [...r.serials] : [] }))
      : materials.slice(0, 3).map((m) => ({
          material: m.name, serialized: m.serialized,
          systemQty: 3, serials: m.serialized ? ["", "", ""] : [],
          actualQty: 3, photo: "", reason: "",
        }))
  );

  const updateRow = (idx, patch) => setRows(rows.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  const updateSerial = (idx, si, val) => setRows(rows.map((r, i) => (i === idx ? { ...r, serials: r.serials.map((s, j) => (j === si ? val : s)) } : r)));

  const snConflicts = rows.flatMap((r) => (r.serials || []).map((sn) => findSNConflict(sn, { returns, reconciliations, excludeId })).filter(Boolean));
  const valid = homebase && snConflicts.length === 0 && rows.every((r) => r.photo && (r.systemQty === r.actualQty || r.reason.trim()) && (!r.serialized || r.serials.every((s) => s.trim())));

  return (
    <div className="p-4 sm:p-8 max-w-3xl mx-auto space-y-6">
      <SectionTitle
        title={isEdit ? `Perbaiki Reconciliation — ${excludeId}` : "Buat Reconciliation"}
        subtitle={isEdit ? "Perbarui data sesuai catatan revisi, lalu kirim ulang ke Logistics" : "Verifikasi fisik material dan input SN secara manual"}
      />
      {isEdit && revisionNote && (
        <Card className="p-4 border-red-200 bg-red-50/50 flex items-start gap-3">
          <AlertTriangle size={18} className="text-red-500 mt-0.5 shrink-0" />
          <div className="text-sm text-red-700"><span className="font-semibold">Catatan revisi dari Logistics: </span>{revisionNote}</div>
        </Card>
      )}
      <Card className="p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Homebase <span className="text-red-500">*</span></label>
            <select value={homebase} onChange={(e) => setHomebase(e.target.value)} disabled={isEdit} className="mt-1.5 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-emerald-600 disabled:bg-gray-50 disabled:text-gray-500">
              <option value="">Pilih homebase...</option>
              {homebases.map((h) => <option key={h.code} value={h.name}>{h.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Periode</label>
            <input value={period} onChange={(e) => setPeriod(e.target.value)} disabled={isEdit} className="mt-1.5 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-emerald-600 disabled:bg-gray-50 disabled:text-gray-500" />
          </div>
        </div>
      </Card>

      {rows.map((r, idx) => {
        const disc = r.systemQty - r.actualQty;
        return (
          <Card key={idx} className="p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-gray-800">{r.material}</div>
              {disc !== 0 && <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded-full">Discrepancy: {disc > 0 ? -disc : Math.abs(disc)}</span>}
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div>System Qty: <span className="font-medium">{r.systemQty}</span></div>
              <div className="flex items-center gap-2">
                Actual Qty:
                <input type="number" value={r.actualQty} onChange={(e) => updateRow(idx, { actualQty: Number(e.target.value) })} className="w-20 border border-gray-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-emerald-600" />
              </div>
            </div>
            {r.serialized && (
              <div className="grid grid-cols-2 gap-2">
                {r.serials.map((s, si) => {
                  const conflict = findSNConflict(s, { returns, reconciliations, excludeId });
                  return (
                    <div key={si}>
                      <input value={s} onChange={(e) => updateSerial(idx, si, e.target.value)} placeholder={`SN ${si + 1}`} className={`w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-600 ${conflict ? "border-red-300" : "border-gray-200"}`} />
                      {conflict && <div className="text-xs text-red-600 mt-1">SN digunakan pada {conflict}.</div>}
                    </div>
                  );
                })}
              </div>
            )}
            <PhotoUpload label="Foto Keseluruhan Material" value={r.photo} onChange={(v) => updateRow(idx, { photo: v })} />
            {disc !== 0 && (
              <textarea value={r.reason} onChange={(e) => updateRow(idx, { reason: e.target.value })} placeholder="Reason / Explanation untuk discrepancy..." rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-emerald-600" />
            )}
          </Card>
        );
      })}

      <div className="flex justify-between">
        <GhostButton onClick={onCancel}>Batal</GhostButton>
        <PrimaryButton disabled={!valid} onClick={() => onSubmit({ homebase, period, items: rows })}>
          <Check size={16} /> {isEdit ? "Kirim Ulang ke Logistics" : "Submit Reconciliation"}
        </PrimaryButton>
      </div>
    </div>
  );
}

function ReconciliationDetail({ r, onBack, onApprove, onRevise, onEdit, role }) {
  const [revisionText, setRevisionText] = useState("");
  const [showRevisionInput, setShowRevisionInput] = useState(false);
  const canReview = (role === ROLES.LOGISTICS || role === ROLES.MANAGER) && r.status === "Waiting Logistics Review";
  const canEdit = role === ROLES.TECH && r.status === "Revision Required";

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-5">
      <button onClick={onBack} className="text-sm text-gray-500 flex items-center gap-1 hover:text-gray-800"><ChevronLeft size={16} /> Kembali ke daftar</button>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xl font-bold text-gray-900">{r.id}</div>
          <div className="text-sm text-gray-500 mt-1">{r.homebase} · {r.period}</div>
        </div>
        <StatusBadge status={r.status} />
      </div>

      {r.status === "Revision Required" && r.revisionNote && (
        <Card className="p-4 border-red-200 bg-red-50/50 flex items-start gap-3">
          <AlertTriangle size={18} className="text-red-500 mt-0.5" />
          <div className="text-sm text-red-700 flex-1"><span className="font-semibold">Revisi diminta: </span>{r.revisionNote}</div>
          {canEdit && <PrimaryButton onClick={() => onEdit(r.id)} className="shrink-0">Perbaiki & Kirim Ulang</PrimaryButton>}
        </Card>
      )}

      {r.items.map((i, idx) => {
        const disc = i.systemQty - i.actualQty;
        return (
          <Card key={idx} className="p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-semibold text-gray-800">{i.material}</div>
              {disc !== 0 && <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded-full">Discrepancy: -{disc}</span>}
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm mb-2">
              <div>System Qty: <span className="font-medium">{i.systemQty}</span></div>
              <div>Actual Qty: <span className="font-medium">{i.actualQty}</span></div>
            </div>
            {i.serialized && i.serials?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {i.serials.map((s, si) => <span key={si} className="text-xs bg-gray-50 rounded-full px-2.5 py-1 text-gray-600">{s}</span>)}
              </div>
            )}
            {typeof i.photo === "string" && i.photo && (
              <img src={i.photo} alt="" className="w-16 h-16 rounded-lg object-cover mb-2" />
            )}
            {i.reason && <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">{i.reason}</div>}
          </Card>
        );
      })}

      {canReview && (
        <Card className="p-5 space-y-3">
          {r.items.some((i) => i.systemQty - i.actualQty !== 0) && (
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-xs text-amber-800">
              <div className="font-semibold mb-1">Penyesuaian stock jika di-Approve:</div>
              {r.items.filter((i) => i.systemQty - i.actualQty !== 0).map((i, idx) => {
                const disc = i.systemQty - i.actualQty;
                return <div key={idx}>{i.material}: {disc > 0 ? `-${disc}` : `+${Math.abs(disc)}`} unit dari Warehouse Stock</div>;
              })}
            </div>
          )}
          {showRevisionInput ? (
            <div className="space-y-3">
              <textarea value={revisionText} onChange={(e) => setRevisionText(e.target.value)} placeholder="Jelaskan alasan revisi..." rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-emerald-600" />
              <div className="flex justify-end gap-2">
                <GhostButton onClick={() => setShowRevisionInput(false)}>Batal</GhostButton>
                <DangerButton onClick={() => revisionText.trim() && onRevise(r.id, revisionText)}>Kirim Revisi</DangerButton>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">Investigasi discrepancy sebelum menyetujui penyesuaian stock.</div>
              <div className="flex gap-2">
                <DangerButton onClick={() => setShowRevisionInput(true)}>Request Revision</DangerButton>
                <PrimaryButton onClick={() => onApprove(r.id)}><Check size={15} /> Approve</PrimaryButton>
              </div>
            </div>
          )}
        </Card>
      )}

      <Card className="p-5">
        <SectionTitle title="Audit Trail" />
        <div className="space-y-3">
          {r.history.map((h, i) => (
            <div key={i} className="flex gap-3 text-sm">
              <div className="text-xs text-gray-400 w-32 shrink-0">{h.time}</div>
              <div className="text-gray-700">{h.text}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ============================================================
   MASTER DATA
   ============================================================ */

function MasterMaterial({ materials, onCreate, onToggle, onImport, showToast }) {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [form, setForm] = useState({ id: "", name: "", category: "", unit: "Unit", serialized: true, minStock: 1 });
  const [saving, setSaving] = useState(false);

  const filtered = materials.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()));

  const addMaterial = async () => {
    if (!form.name || !form.category) return;
    setSaving(true);
    const submittedName = form.name;
    try {
      await onCreate({ name: form.name, category: form.category, unit: form.unit, serialized: form.serialized, minStock: form.minStock });
      showToast(`Material "${submittedName}" berhasil ditambahkan`);
      setForm({ id: "", name: "", category: "", unit: "Unit", serialized: true, minStock: 1 });
    } finally {
      setSaving(false);
    }
  };

  const materialColumns = [
    { key: "name", header: "Material Name" },
    { key: "category", header: "Category" },
    { key: "unit", header: "Unit" },
    { key: "serialized", header: "Serialized (Yes/No)" },
    { key: "minStock", header: "Min Stock" },
    { key: "status", header: "Status" },
  ];

  const validateMaterialRow = (v) => {
    const errors = [];
    if (!v.name) errors.push("Material Name kosong");
    else if (materials.some((m) => m.name.toLowerCase() === v.name.toLowerCase())) errors.push("Material Name sudah ada");
    if (!v.category) errors.push("Category kosong");
    return errors;
  };

  return (
    <div className="p-4 sm:p-8 space-y-5">
      <SectionTitle
        title="Master Material" subtitle="Kelola data material perusahaan"
        right={
          <div className="flex gap-2">
            <GhostButton onClick={() => setShowImport(!showImport)}><Upload size={15} /> Import Excel</GhostButton>
            <PrimaryButton onClick={() => setShowForm(!showForm)}><Plus size={16} /> Tambah Material</PrimaryButton>
          </div>
        }
      />

      {showForm && (
        <Card className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input placeholder="Nama material" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-emerald-600" />
          <input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-emerald-600" />
          <input placeholder="Unit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-emerald-600" />
          <input type="number" placeholder="Minimum stock" value={form.minStock} onChange={(e) => setForm({ ...form, minStock: Number(e.target.value) })} className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-emerald-600" />
          <label className="flex items-center gap-2 text-sm text-gray-600 sm:col-span-2">
            <input type="checkbox" checked={form.serialized} onChange={(e) => setForm({ ...form, serialized: e.target.checked })} className="accent-emerald-800" /> Serialized (butuh Serial Number)
          </label>
          <div className="sm:col-span-2 flex justify-end gap-2">
            <GhostButton onClick={() => setShowForm(false)}>Tutup</GhostButton>
            <PrimaryButton onClick={addMaterial} disabled={saving}>{saving ? "Menyimpan..." : "Simpan"}</PrimaryButton>
          </div>
        </Card>
      )}

      {showImport && (
        <ImportExcelPanel
          templateFilename="template_master_material.csv"
          columns={materialColumns}
          sampleRow={["Contoh Material", "Modem", "Unit", "Yes", "5", "Active"]}
          validateRow={validateMaterialRow}
          onImport={async (rows) => {
            const result = await onImport(rows.map((r) => ({ name: r.name, category: r.category, unit: r.unit || "Unit", serialized: /^y/i.test(r.serialized), minStock: Number(r.minStock) || 0, status: r.status || "Active" })));
            showToast(`${result?.imported ?? rows.length} material berhasil diimpor`);
          }}
        />
      )}

      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2.5 w-80">
        <Search size={16} className="text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari material..." className="bg-transparent text-sm outline-none w-full" />
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-400 bg-gray-50/60 border-b border-gray-100">
              <th className="px-5 py-3 font-medium">Material ID</th>
              <th className="px-5 py-3 font-medium">Nama</th>
              <th className="px-5 py-3 font-medium">Category</th>
              <th className="px-5 py-3 font-medium">Unit</th>
              <th className="px-5 py-3 font-medium">Serialized</th>
              <th className="px-5 py-3 font-medium">Min Stock</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => (
              <tr key={m.id} className="border-b border-gray-50 last:border-0">
                <td className="px-5 py-3 text-gray-500">{m.id}</td>
                <td className="px-5 py-3 font-medium text-gray-800">{m.name}</td>
                <td className="px-5 py-3 text-gray-600">{m.category}</td>
                <td className="px-5 py-3 text-gray-500">{m.unit}</td>
                <td className="px-5 py-3 text-gray-500">{m.serialized ? "Yes" : "No"}</td>
                <td className="px-5 py-3 text-gray-500">{m.minStock}</td>
                <td className="px-5 py-3"><StatusBadge status={m.status} /></td>
                <td className="px-5 py-3"><button onClick={() => onToggle(m.id)} className="text-xs font-medium text-emerald-800">{m.status === "Active" ? "Deactivate" : "Activate"}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </Card>
    </div>
  );
}

/* Generic Excel/CSV import panel — download template → upload → validated
   preview → confirm. Shared across every Master Data screen instead of
   duplicating this flow per-resource; each caller just supplies its own
   column mapping and validation rule. */
function ImportExcelPanel({ templateFilename, description, columns, sampleRow, validateRow, onImport }) {
  const [preview, setPreview] = useState(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = React.useRef(null);

  const downloadTemplate = () => {
    const csv = Papa.unparse({ fields: columns.map((c) => c.header), data: [sampleRow] });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = templateFilename; a.click();
    URL.revokeObjectURL(url);
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        const rows = res.data.map((raw) => {
          const values = {};
          columns.forEach((c) => { values[c.key] = (raw[c.header] || "").trim(); });
          const errors = validateRow(values);
          return { ...values, errors };
        });
        setPreview({ rows });
      },
    });
    e.target.value = "";
  };

  const confirmImport = async () => {
    const validRows = preview.rows.filter((r) => r.errors.filter((e) => !e.includes("warning")).length === 0);
    setImporting(true);
    try {
      await onImport(validRows);
      setPreview(null);
    } finally {
      setImporting(false);
    }
  };

  return (
    <Card className="p-5 space-y-3">
      <div className="text-sm font-medium text-gray-800">Import via Excel/CSV</div>
      {description && <div className="text-xs text-gray-500">{description}</div>}
      <div className="flex gap-2 flex-wrap">
        <GhostButton onClick={downloadTemplate}><Download size={14} /> Download Template</GhostButton>
        <PrimaryButton onClick={() => fileInputRef.current?.click()}><Upload size={14} /> Upload File</PrimaryButton>
        <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleFile} />
      </div>
      <div className="text-xs text-gray-400">Terima file .csv (export dari Excel sebagai CSV). Preview & validasi ditampilkan sebelum konfirmasi.</div>

      {preview && (
        <div className="space-y-3 pt-2">
          <div className="text-sm font-medium text-gray-800">Preview Import ({preview.rows.length} baris)</div>
          <div className="max-h-64 overflow-y-auto overflow-x-auto border border-gray-100 rounded-lg">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-gray-400 bg-gray-50 border-b border-gray-100">
                  {columns.map((c) => <th key={c.key} className="px-3 py-2 whitespace-nowrap">{c.header}</th>)}
                  <th className="px-3 py-2">Validasi</th>
                </tr>
              </thead>
              <tbody>
                {preview.rows.map((r, i) => (
                  <tr key={i} className="border-b border-gray-50 last:border-0">
                    {columns.map((c) => <td key={c.key} className="px-3 py-2 whitespace-nowrap">{r[c.key]}</td>)}
                    <td className="px-3 py-2">
                      {r.errors.length === 0 ? <span className="text-emerald-600 flex items-center gap-1"><Check size={12} /> OK</span> : <span className="text-red-600">{r.errors.join(", ")}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end gap-2">
            <GhostButton onClick={() => setPreview(null)}>Batal</GhostButton>
            <PrimaryButton onClick={confirmImport} disabled={importing}>
              {importing ? "Mengimpor..." : `Konfirmasi Import (${preview.rows.filter((r) => r.errors.filter((e) => !e.includes("warning")).length === 0).length} valid)`}
            </PrimaryButton>
          </div>
        </div>
      )}
    </Card>
  );
}

const SITE_TEMPLATE_HEADERS = ["Site Code", "Terminal ID", "Nama Site", "Customer", "Area", "Homebase", "Status"];

function MasterSite({ sites, homebases, customers, onImport, onCreate, showToast }) {
  const [showImport, setShowImport] = useState(false);
  const [preview, setPreview] = useState(null); // { rows: [...], errors: [...] }
  const [importing, setImporting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [addError, setAddError] = useState("");
  const emptyForm = { code: "", terminalId: "", name: "", customer: "", area: "", homebase: "", status: "Active" };
  const [form, setForm] = useState(emptyForm);
  const fileInputRef = React.useRef(null);

  const addSite = async () => {
    if (!form.code.trim() || !form.name.trim() || !form.homebase) return;
    setSaving(true); setAddError("");
    const submittedName = form.name;
    try {
      await onCreate(form);
      showToast(`Site "${submittedName}" berhasil ditambahkan`);
      setForm(emptyForm);
    } catch (err) {
      setAddError(err.message || "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

  const downloadTemplate = () => {
    const csv = Papa.unparse({ fields: SITE_TEMPLATE_HEADERS, data: [["ST0099", "TID-099", "Contoh Site", "Paramitra", "Kalimantan", "Long Payau", "Active"]] });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "template_master_site.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        const rows = res.data.map((row) => {
          const code = (row["Site Code"] || "").trim();
          const terminalId = (row["Terminal ID"] || "").trim();
          const name = (row["Nama Site"] || "").trim();
          const customer = (row["Customer"] || "").trim();
          const area = (row["Area"] || "").trim();
          const homebase = (row["Homebase"] || "").trim();
          const status = (row["Status"] || "Active").trim();
          const errors = [];
          if (!code) errors.push("Site Code kosong");
          else if (sites.some((s) => s.code === code)) errors.push("Site Code duplikat");
          if (!name) errors.push("Nama Site kosong");
          if (!homebase) errors.push("Homebase kosong");
          else if (!homebases.some((h) => h.name === homebase)) errors.push("Homebase tidak ditemukan di Master Homebase");
          if (customer && !customers.some((c) => c.name === customer)) errors.push("Customer tidak ditemukan (warning)");
          return { code, terminalId, name, customer, area, homebase, status, errors };
        });
        setPreview({ rows });
      },
    });
    e.target.value = "";
  };

  const confirmImport = async () => {
    const validRows = preview.rows.filter((r) => r.errors.filter((e) => !e.includes("warning")).length === 0);
    setImporting(true);
    try {
      await onImport(validRows.map((r) => ({ code: r.code, terminalId: r.terminalId, name: r.name, customer: r.customer, area: r.area, homebase: r.homebase, status: r.status || "Active" })));
      showToast(`${validRows.length} site berhasil diimpor`);
      setPreview(null);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-5">
      <SectionTitle
        title="Master Site" subtitle="Data site terhubung dengan Homebase & Customer"
        right={
          <div className="flex gap-2">
            <GhostButton onClick={() => { setShowImport(!showImport); setPreview(null); }}><Upload size={15} /> Import Excel</GhostButton>
            <PrimaryButton onClick={() => { setShowAddForm(!showAddForm); setAddError(""); }}><Plus size={16} /> Tambah</PrimaryButton>
          </div>
        }
      />

      {showAddForm && (
        <Card className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-500">Site Code <span className="text-red-500">*</span></label>
            <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="mis. ST0008" className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-600" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">Terminal ID</label>
            <input value={form.terminalId} onChange={(e) => setForm({ ...form, terminalId: e.target.value })} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-600" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">Nama Site <span className="text-red-500">*</span></label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-600" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">Customer</label>
            <select value={form.customer} onChange={(e) => setForm({ ...form, customer: e.target.value })} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-600">
              <option value="">Pilih...</option>
              {customers.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">Homebase <span className="text-red-500">*</span></label>
            <select value={form.homebase} onChange={(e) => setForm({ ...form, homebase: e.target.value, area: homebases.find((h) => h.name === e.target.value)?.area || form.area })} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-600">
              <option value="">Pilih...</option>
              {homebases.map((h) => <option key={h.code} value={h.name}>{h.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">Area</label>
            <input value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-600" />
          </div>
          {addError && <div className="sm:col-span-2 bg-red-50 border border-red-100 text-red-700 text-xs rounded-lg px-3 py-2">{addError}</div>}
          <div className="sm:col-span-2 flex justify-end gap-2">
            <GhostButton onClick={() => { setShowAddForm(false); setForm(emptyForm); setAddError(""); }}>Batal</GhostButton>
            <PrimaryButton onClick={addSite} disabled={saving}>{saving ? "Menyimpan..." : "Simpan"}</PrimaryButton>
          </div>
        </Card>
      )}

      {showImport && (
        <Card className="p-5 space-y-3">
          <div className="text-sm font-medium text-gray-800">Import Master Site via Excel/CSV</div>
          <div className="text-xs text-gray-500">Kolom: Site Code | Terminal ID | Nama Site | Customer | Area | Homebase | Status</div>
          <div className="flex gap-2">
            <GhostButton onClick={downloadTemplate}><Download size={14} /> Download Template</GhostButton>
            <PrimaryButton onClick={() => fileInputRef.current?.click()}><Upload size={14} /> Upload File</PrimaryButton>
            <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleFile} />
          </div>
          <div className="text-xs text-gray-400">Terima file .csv (export dari Excel sebagai CSV). Sistem akan menampilkan preview, validasi duplikasi Site Code, dan verifikasi Homebase sebelum konfirmasi import.</div>

          {preview && (
            <div className="space-y-3 pt-2">
              <div className="text-sm font-medium text-gray-800">Preview Import ({preview.rows.length} baris)</div>
              <div className="max-h-64 overflow-y-auto border border-gray-100 rounded-lg">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left text-gray-400 bg-gray-50 border-b border-gray-100">
                      <th className="px-3 py-2">Site Code</th><th className="px-3 py-2">Nama Site</th><th className="px-3 py-2">Homebase</th><th className="px-3 py-2">Validasi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.rows.map((r, i) => (
                      <tr key={i} className="border-b border-gray-50 last:border-0">
                        <td className="px-3 py-2">{r.code}</td>
                        <td className="px-3 py-2">{r.name}</td>
                        <td className="px-3 py-2">{r.homebase}</td>
                        <td className="px-3 py-2">
                          {r.errors.length === 0 ? <span className="text-emerald-600 flex items-center gap-1"><Check size={12} /> OK</span> : <span className="text-red-600">{r.errors.join(", ")}</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end gap-2">
                <GhostButton onClick={() => setPreview(null)}>Batal</GhostButton>
                <PrimaryButton onClick={confirmImport} disabled={importing}>{importing ? "Mengimpor..." : `Konfirmasi Import (${preview.rows.filter((r) => r.errors.filter((e) => !e.includes("warning")).length === 0).length} valid)`}</PrimaryButton>
              </div>
            </div>
          )}
        </Card>
      )}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-400 bg-gray-50/60 border-b border-gray-100">
              <th className="px-5 py-3 font-medium">Nama Site</th>
              <th className="px-5 py-3 font-medium">Site Code</th>
              <th className="px-5 py-3 font-medium">Terminal ID</th>
              <th className="px-5 py-3 font-medium">Customer</th>
              <th className="px-5 py-3 font-medium">Area</th>
              <th className="px-5 py-3 font-medium">Homebase</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {sites.map((s) => (
              <tr key={s.code} className="border-b border-gray-50 last:border-0">
                <td className="px-5 py-3 font-medium text-gray-800">{s.name}</td>
                <td className="px-5 py-3 text-gray-400 text-xs">{s.code}</td>
                <td className="px-5 py-3 text-gray-400 text-xs">{s.terminalId}</td>
                <td className="px-5 py-3 text-gray-600">{s.customer}</td>
                <td className="px-5 py-3 text-gray-600">{s.area}</td>
                <td className="px-5 py-3 text-gray-600">{s.homebase}</td>
                <td className="px-5 py-3"><StatusBadge status={s.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </Card>
    </div>
  );
}

/* Generic, schema-driven Master Data CRUD table: used for Homebase, Area,
   Customer, and Users so each master gets a real Add form + Activate/Deactivate
   toggle without duplicating table/form boilerplate per module. */
function MasterCrudTable({ title, subtitle, entityLabel, fields, items, idField = "id", buildLabel, onCreate, onToggle, onUpdate, importConfig, showToast }) {
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null); // null = adding new, otherwise editing this id
  const emptyForm = Object.fromEntries(fields.map((f) => [f.key, f.default ?? ""]));
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const label = entityLabel || title;

  const closeForm = () => { setShowForm(false); setEditingId(null); setForm(emptyForm); setError(""); };

  const startEdit = (item) => {
    const next = { ...emptyForm };
    fields.forEach((f) => { if (f.key in item) next[f.key] = item[f.key]; });
    setForm(next);
    setEditingId(item[idField]);
    setShowForm(true);
    setError("");
  };

  const handleSubmit = async () => {
    // Fields marked createOnlyRequired (e.g. password) aren't mandatory when editing.
    const requiredMissing = fields.some((f) => f.required && !(editingId && f.createOnlyRequired) && !String(form[f.key] ?? "").trim());
    if (requiredMissing) return;
    setSaving(true); setError("");
    try {
      if (editingId) {
        await onUpdate(editingId, form);
        showToast(`${label} berhasil diperbarui`);
        closeForm();
      } else {
        await onCreate(form);
        showToast(`${label} berhasil ditambahkan`);
        setForm(emptyForm); // keep the panel open, ready for the next entry
      }
    } catch (err) {
      setError(err.message || "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

  const filtered = search ? items.filter((it) => buildLabel(it).toLowerCase().includes(search.toLowerCase())) : items;

  return (
    <div className="p-4 sm:p-8 space-y-5">
      <SectionTitle
        title={title} subtitle={subtitle}
        right={
          <div className="flex gap-2">
            {importConfig && <GhostButton onClick={() => setShowImport(!showImport)}><Upload size={15} /> Import Excel</GhostButton>}
            <PrimaryButton onClick={() => { if (showForm && !editingId) { closeForm(); } else { setForm(emptyForm); setEditingId(null); setShowForm(true); setError(""); } }}><Plus size={16} /> Tambah</PrimaryButton>
          </div>
        }
      />

      {showForm && (
        <Card className="p-5 space-y-4">
          <div className="text-sm font-semibold text-gray-800">{editingId ? `Edit — ${editingId}` : "Tambah Baru"}</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map((f) => (
              <div key={f.key} className={f.fullWidth ? "sm:col-span-2" : ""}>
                <label className="text-xs font-medium text-gray-500">
                  {f.label}
                  {f.required && !(editingId && f.createOnlyRequired) && <span className="text-red-500"> *</span>}
                </label>
                {f.type === "select" ? (
                  <select value={form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-600">
                    <option value="">Pilih...</option>
                    {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input
                    type={f.inputType || "text"}
                    value={form[f.key]}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    placeholder={editingId && f.createOnlyRequired ? "Kosongkan jika tidak diubah" : (f.placeholder || f.label)}
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-600"
                  />
                )}
              </div>
            ))}
          </div>
          {error && <div className="bg-red-50 border border-red-100 text-red-700 text-xs rounded-lg px-3 py-2">{error}</div>}
          <div className="flex justify-end gap-2">
            <GhostButton onClick={closeForm}>{editingId ? "Batal" : "Tutup"}</GhostButton>
            <PrimaryButton onClick={handleSubmit} disabled={saving}>{saving ? "Menyimpan..." : editingId ? "Simpan Perubahan" : "Simpan"}</PrimaryButton>
          </div>
        </Card>
      )}

      {showImport && importConfig && (
        <ImportExcelPanel
          templateFilename={importConfig.templateFilename}
          columns={importConfig.columns}
          sampleRow={importConfig.sampleRow}
          validateRow={importConfig.validateRow}
          onImport={async (rows) => {
            const result = await importConfig.onImport(rows);
            showToast(`${result?.imported ?? rows.length} ${label} berhasil diimpor`);
          }}
        />
      )}

      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2.5 w-80">
        <Search size={16} className="text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari..." className="bg-transparent text-sm outline-none w-full" />
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-400 bg-gray-50/60 border-b border-gray-100">
              <th className="px-5 py-3 font-medium">{idField === "id" ? "ID" : "Code"}</th>
              {fields.filter((f) => f.key !== "status" && f.key !== "password").map((f) => <th key={f.key} className="px-5 py-3 font-medium">{f.label}</th>)}
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((it) => (
              <tr key={it[idField]} className="border-b border-gray-50 last:border-0">
                <td className="px-5 py-3 text-gray-400 text-xs">{it[idField]}</td>
                {fields.filter((f) => f.key !== "status" && f.key !== "password").map((f) => <td key={f.key} className="px-5 py-3 text-gray-700">{it[f.key]}</td>)}
                <td className="px-5 py-3"><StatusBadge status={it.status} /></td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    {onUpdate && <button onClick={() => startEdit(it)} className="text-xs font-medium text-emerald-800">Edit</button>}
                    <button onClick={() => onToggle(it[idField])} className="text-xs font-medium text-gray-500">{it.status === "Active" ? "Deactivate" : "Activate"}</button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={fields.length + 2}><EmptyState text="Belum ada data." /></td></tr>}
          </tbody>
        </table>
        </div>
      </Card>
    </div>
  );
}

/* ============================================================
   REPORTS
   ============================================================ */

/* Generic, data-driven Reports page: filters operate on the raw data array
   (not pre-rendered rows) so date range, status, and search all actually work
   against real fields instead of decorating a static table. */
function ReportsPage({ title, subtitle, data, columns, statusOf, dateOf, searchOf }) {
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [status, setStatus] = useState("All");

  const statusOptions = ["All", ...Array.from(new Set(data.map(statusOf)))];

  const filtered = data.filter((item) => {
    if (status !== "All" && statusOf(item) !== status) return false;
    const d = dateOf(item);
    if (dateFrom && d && d < dateFrom) return false;
    if (dateTo && d && d > dateTo) return false;
    if (search && !searchOf(item).toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleExport = () => {
    const fields = columns.map((c) => c.label);
    const rows = filtered.map((item) => columns.map((c) => c.exportValue(item)));
    const csv = Papa.unparse({ fields, data: rows });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${title.replace(/\s+/g, "_").toLowerCase()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const clearFilters = () => { setSearch(""); setDateFrom(""); setDateTo(""); setStatus("All"); };
  const hasActiveFilters = search || dateFrom || dateTo || status !== "All";

  return (
    <div className="p-4 sm:p-8 space-y-5">
      <SectionTitle title={title} subtitle={subtitle} right={<GhostButton onClick={handleExport}><Download size={15} /> Export CSV ({filtered.length})</GhostButton>} />

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 w-64">
          <Search size={15} className="text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari ID, nama, material..." className="bg-transparent text-sm outline-none w-full" />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 outline-none">
          {statusOptions.map((s) => <option key={s} value={s}>{s === "All" ? "Semua Status" : s}</option>)}
        </select>
        <div className="flex items-center gap-2">
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-500 outline-none" />
          <span className="text-gray-300 text-sm">-</span>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-500 outline-none" />
        </div>
        {hasActiveFilters && <GhostButton onClick={clearFilters}><X size={14} /> Reset Filter</GhostButton>}
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-400 bg-gray-50/60 border-b border-gray-100">
              {columns.map((c) => <th key={c.label} className="px-5 py-3 font-medium">{c.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {filtered.map((item, i) => (
              <tr key={i} className="border-b border-gray-50 last:border-0">
                {columns.map((c) => <td key={c.label} className="px-5 py-3 text-gray-700">{c.render(item)}</td>)}
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={columns.length}><EmptyState text="Tidak ada data yang cocok dengan filter ini." /></td></tr>}
          </tbody>
        </table>
        </div>
      </Card>
    </div>
  );
}

/* ============================================================
   REAL BACKEND API CLIENT
   Talks to the Express + SQLite backend (see terex-logistics-backend.zip).
   ============================================================ */

const DEFAULT_API_BASE = "https://backend-production-5543.up.railway.app/api";

function createApiClient(baseUrl, getToken) {
  async function request(path, options = {}) {
    const token = getToken();
    const res = await fetch(`${baseUrl}${path}`, {
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
    let data = null;
    try { data = await res.json(); } catch (e) { /* empty body */ }
    if (!res.ok) throw new Error((data && data.error) || res.statusText || "Request failed");
    return data;
  }

  return {
    login: (username, password) => request("/auth/login", { method: "POST", body: { username, password } }),

    getMaterials: () => request("/materials"),
    createMaterial: (payload) => request("/materials", { method: "POST", body: payload }),
    toggleMaterialStatus: (id) => request(`/materials/${id}/toggle-status`, { method: "PATCH" }),
    importMaterials: (rows) => request("/materials/import", { method: "POST", body: { rows } }),

    getAreas: () => request("/areas"),
    createArea: (payload) => request("/areas", { method: "POST", body: payload }),
    toggleAreaStatus: (code) => request(`/areas/${code}/toggle-status`, { method: "PATCH" }),
    importAreas: (rows) => request("/areas/import", { method: "POST", body: { rows } }),

    getHomebases: () => request("/homebases"),
    createHomebase: (payload) => request("/homebases", { method: "POST", body: payload }),
    toggleHomebaseStatus: (code) => request(`/homebases/${code}/toggle-status`, { method: "PATCH" }),
    importHomebases: (rows) => request("/homebases/import", { method: "POST", body: { rows } }),

    getCustomers: () => request("/customers"),
    createCustomer: (payload) => request("/customers", { method: "POST", body: payload }),
    toggleCustomerStatus: (id) => request(`/customers/${id}/toggle-status`, { method: "PATCH" }),
    importCustomers: (rows) => request("/customers/import", { method: "POST", body: { rows } }),

    getSites: () => request("/sites"),
    createSite: (payload) => request("/sites", { method: "POST", body: payload }),
    importSites: (rows) => request("/sites/import", { method: "POST", body: { rows } }),

    getUsers: () => request("/users"),
    createUser: (payload) => request("/users", { method: "POST", body: payload }),
    updateUser: (id, payload) => request(`/users/${id}`, { method: "PATCH", body: payload }),
    toggleUserStatus: (id) => request(`/users/${id}/toggle-status`, { method: "PATCH" }),

    getStock: () => request("/stock"),
    getMovements: (material) => request(`/stock/movements${material ? `?material=${encodeURIComponent(material)}` : ""}`),
    getSerials: (material, status) => {
      const params = new URLSearchParams();
      if (material) params.set("material", material);
      if (status) params.set("status", status);
      const qs = params.toString();
      return request(`/stock/serials${qs ? `?${qs}` : ""}`);
    },
    searchSerials: (q) => request(`/stock/serials?q=${encodeURIComponent(q)}`),
    createReceipt: (payload) => request("/stock/receipts", { method: "POST", body: payload }),
    getReceipts: () => request("/stock/receipts"),

    getDeliveries: () => request("/deliveries"),
    createDelivery: (payload) => request("/deliveries", { method: "POST", body: payload }),
    approveDelivery: (id) => request(`/deliveries/${id}/approve`, { method: "POST" }),
    rejectDelivery: (id) => request(`/deliveries/${id}/reject`, { method: "POST" }),
    assignDeliveryStock: (id, serialSelections) => request(`/deliveries/${id}/assign-stock`, { method: "POST", body: serialSelections ? { serialSelections } : {} }),
    advanceDelivery: (id) => request(`/deliveries/${id}/advance`, { method: "POST" }),

    getReturns: () => request("/returns"),
    createReturn: (payload) => request("/returns", { method: "POST", body: payload }),
    approveReturn: (id) => request(`/returns/${id}/approve`, { method: "POST" }),
    reviseReturn: (id, note) => request(`/returns/${id}/revise`, { method: "POST", body: { note } }),
    resubmitReturn: (id, payload) => request(`/returns/${id}/resubmit`, { method: "POST", body: payload }),
    shipReturn: (id) => request(`/returns/${id}/ship`, { method: "POST" }),
    addResi: (id, resiNumber) => request(`/returns/${id}/resi`, { method: "POST", body: { resiNumber } }),
    receiveReturn: (id) => request(`/returns/${id}/receive`, { method: "POST" }),
    qcReturn: (id) => request(`/returns/${id}/qc`, { method: "POST" }),
    completeReturn: (id) => request(`/returns/${id}/complete`, { method: "POST" }),

    getReconciliations: () => request("/reconciliations"),
    createReconciliation: (payload) => request("/reconciliations", { method: "POST", body: payload }),
    reviseReconciliation: (id, note) => request(`/reconciliations/${id}/revise`, { method: "POST", body: { note } }),
    resubmitReconciliation: (id, payload) => request(`/reconciliations/${id}/resubmit`, { method: "POST", body: payload }),
    approveReconciliation: (id) => request(`/reconciliations/${id}/approve`, { method: "POST" }),
  };
}

/* ============================================================
   LOGIN SCREEN
   ============================================================ */

function LoginScreen({ apiBase, setApiBase, onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const demoAccounts = [
    { username: "fariz", label: "Manager Logistics" },
    { username: "sari", label: "Logistics Staff" },
    { username: "andi", label: "SPV" },
    { username: "yohanes", label: "Technician" },
  ];

  const doLogin = async (loginUsername, loginPassword) => {
    setLoading(true); setError("");
    try {
      const client = createApiClient(apiBase, () => null);
      const result = await client.login(loginUsername, loginPassword);
      onLogin(result.token, result.user);
    } catch (err) {
      setError(err.message || "Login gagal — periksa kembali API URL dan koneksi ke backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-800 flex items-center justify-center mx-auto mb-3">
            <Truck size={26} className="text-white" />
          </div>
          <div className="text-2xl font-bold text-emerald-900">TEREX Logistics</div>
          <div className="text-sm text-gray-500 mt-1">Masuk untuk melanjutkan</div>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500">Backend API URL</label>
          <input
            value={apiBase}
            onChange={(e) => setApiBase(e.target.value)}
            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-600"
            placeholder="https://your-backend.example.com/api"
          />
          <div className="text-xs text-gray-400 mt-1">
            Ganti ke URL publik backend setelah di-deploy. <span className="font-medium">localhost</span> hanya berfungsi jika halaman ini dibuka di komputer yang sama dengan server backend-nya.
          </div>
        </div>

        {error && <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-lg px-3 py-2">{error}</div>}

        <form onSubmit={(e) => { e.preventDefault(); doLogin(username, password); }} className="space-y-3">
          <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" type="text" autoCapitalize="none" autoCorrect="off" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-emerald-600" />
          <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-emerald-600" />
          <PrimaryButton type="submit" disabled={loading} className="w-full">{loading ? "Masuk..." : "Masuk"}</PrimaryButton>
        </form>

        <div>
          <div className="text-xs text-gray-400 text-center mb-2">atau login cepat sebagai akun demo (password: password123)</div>
          <div className="grid grid-cols-2 gap-2">
            {demoAccounts.map((a) => (
              <button key={a.username} onClick={() => doLogin(a.username, "password123")} disabled={loading} className="text-xs border border-gray-200 rounded-lg px-2 py-2 hover:bg-gray-50 text-gray-600 disabled:opacity-50">
                {a.label}
              </button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

/* ============================================================
   ROOT APP
   ============================================================ */

export default function App() {
  const [apiBase, setApiBase] = useState(DEFAULT_API_BASE);
  const [authToken, setAuthToken] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [toast, setToast] = useState(null); // { message }
  const toastTimerRef = React.useRef(null);
  const showToast = (message) => {
    setToast({ message });
    clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 3000);
  };

  const [page, setPage] = useState("dashboard");
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [selectedRecon, setSelectedRecon] = useState(null);
  const [movementFilter, setMovementFilter] = useState("");
  const [serialMaterial, setSerialMaterial] = useState("");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [materials, setMaterials] = useState([]);
  const [movements, setMovements] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [returns, setReturns] = useState([]);
  const [reconciliations, setReconciliations] = useState([]);
  const [sites, setSites] = useState([]);
  const [homebases, setHomebases] = useState([]);
  const [areas, setAreas] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const role = currentUser?.role;

  const api = useMemo(() => createApiClient(apiBase, () => authToken), [apiBase, authToken]);

  // Backend rows use snake_case for a couple of fields — normalize once here
  // so every component downstream can keep using the camelCase shape it
  // always used against the old mock data.
  const normalizeMaterial = (m) => ({
    id: m.id, name: m.name, category: m.category, unit: m.unit,
    serialized: !!m.serialized, minStock: m.min_stock ?? m.minStock,
    status: m.status, ready: m.ready, faulty: m.faulty, reserved: m.reserved,
    transit: m.in_transit ?? m.transit,
  });
  const normalizeSite = (s) => ({
    code: s.code, terminalId: s.terminal_id ?? s.terminalId, name: s.name,
    customer: s.customer, area: s.area, homebase: s.homebase, status: s.status,
  });

  const loadAllData = async () => {
    setDataLoading(true);
    setApiError("");
    try {
      const [mats, movs, dels, rets, recs, sts, hbs, ars, custs, usrs] = await Promise.all([
        api.getMaterials(), api.getMovements(), api.getDeliveries(), api.getReturns(),
        api.getReconciliations(), api.getSites(), api.getHomebases(), api.getAreas(),
        api.getCustomers(), api.getUsers().catch(() => []), // Users list is Manager-only; ignore 403 for other roles
      ]);
      setMaterials(mats.map(normalizeMaterial));
      setMovements(movs);
      setDeliveries(dels);
      setReturns(rets);
      setReconciliations(recs);
      setSites(sts.map(normalizeSite));
      setHomebases(hbs);
      setAreas(ars);
      setCustomers(custs);
      setUsers(usrs);
    } catch (err) {
      setApiError(err.message || "Gagal memuat data dari server");
    } finally {
      setDataLoading(false);
    }
  };

  React.useEffect(() => {
    if (authToken) loadAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authToken]);

  const handleLogin = (token, user) => { setAuthToken(token); setCurrentUser(user); };
  const handleLogout = () => {
    setAuthToken(null); setCurrentUser(null);
    setMaterials([]); setMovements([]); setDeliveries([]); setReturns([]); setReconciliations([]);
    setSites([]); setHomebases([]); setAreas([]); setCustomers([]); setUsers([]);
    setPage("dashboard");
  };

  // Refreshes just materials + movements — used after any action that
  // touches warehouse stock, instead of a full reload of every collection.
  const refreshStock = async () => {
    try {
      const [mats, movs] = await Promise.all([api.getMaterials(), api.getMovements()]);
      setMaterials(mats.map(normalizeMaterial));
      setMovements(movs);
    } catch (err) {
      setApiError(err.message);
    }
  };

  const createReceipt = async (payload) => {
    await api.createReceipt(payload);
    await refreshStock();
  };

  const goto = (p) => { setPage(p); setSelectedDelivery(null); setSelectedReturn(null); setSelectedRecon(null); };

  /* Navigates directly to a specific record's detail view — clears the other
     two selection states in the same pass so stale selections from a previous
     module don't linger (goto() alone would race with setting the new id). */
  const gotoDetail = (targetPage, kind, id) => {
    setSelectedDelivery(kind === "delivery" ? id : null);
    setSelectedReturn(kind === "return" ? id : null);
    setSelectedRecon(kind === "recon" ? id : null);
    setPage(targetPage);
  };

  const localSearchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    const results = [];

    deliveries.forEach((d) => {
      const matMatch = d.items.some((i) => i.material.toLowerCase().includes(q));
      if (d.id.toLowerCase().includes(q) || d.homebase.toLowerCase().includes(q) || (d.site || "").toLowerCase().includes(q) || matMatch) {
        results.push({ type: "Delivery Request", icon: Truck, label: d.id, sub: `${d.homebase} · ${d.status}`, onSelect: () => gotoDetail("delivery", "delivery", d.id) });
      }
    });

    returns.forEach((r) => {
      const snMatch = r.items.some((i) => i.serials.some((s) => s.sn.toLowerCase().includes(q)));
      const matMatch = r.items.some((i) => i.material.toLowerCase().includes(q));
      if (r.id.toLowerCase().includes(q) || r.homebase.toLowerCase().includes(q) || snMatch || matMatch) {
        results.push({ type: "Return Faulty", icon: Undo2, label: r.id, sub: snMatch ? `SN cocok · ${r.status}` : `${r.homebase} · ${r.status}`, onSelect: () => gotoDetail("returnFaulty", "return", r.id) });
      }
    });

    reconciliations.forEach((r) => {
      const snMatch = r.items.some((i) => i.serials?.some((s) => s.toLowerCase().includes(q)));
      const matMatch = r.items.some((i) => i.material.toLowerCase().includes(q));
      if (r.id.toLowerCase().includes(q) || r.homebase.toLowerCase().includes(q) || snMatch || matMatch) {
        results.push({ type: "Reconciliation", icon: ClipboardList, label: r.id, sub: snMatch ? `SN cocok · ${r.status}` : `${r.homebase} · ${r.status}`, onSelect: () => gotoDetail("reconciliation", "recon", r.id) });
      }
    });

    materials.forEach((m) => {
      if (m.name.toLowerCase().includes(q) || m.category.toLowerCase().includes(q) || m.id.toLowerCase().includes(q)) {
        results.push({ type: "Material", icon: Package, label: m.name, sub: `Stock Ready: ${m.ready} · ${m.category}`, onSelect: () => goto("stock") });
      }
    });

    sites.forEach((s) => {
      if (s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q) || s.terminalId.toLowerCase().includes(q)) {
        results.push({ type: "Site", icon: MapPin, label: s.name, sub: `${s.homebase} · ${s.code}`, onSelect: () => goto("masterSite") });
      }
    });

    returns.forEach((r) => {
      if (r.resiNumber && r.resiNumber.toLowerCase().includes(q)) {
        results.push({ type: "Resi Pengiriman", icon: FileBarChart, label: r.resiNumber, sub: `${r.id} · ${r.status}`, onSelect: () => gotoDetail("returnFaulty", "return", r.id) });
      }
    });

    return results.slice(0, 8);
  }, [searchQuery, deliveries, returns, reconciliations, materials, sites]);

  // Serial Numbers live in the warehouse SN registry, not in any locally
  // loaded list — so unlike the rest of global search (computed instantly
  // from state already in memory) this piece asks the server, debounced,
  // and merges in once it resolves.
  const [snSearchResults, setSnSearchResults] = useState([]);
  React.useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 3) { setSnSearchResults([]); return; }
    let cancelled = false;
    const timer = setTimeout(() => {
      api.searchSerials(q).then((rows) => {
        if (cancelled) return;
        setSnSearchResults(rows.map((r) => {
          let sub, onSelect;
          if (r.current_ref?.startsWith("DR-")) {
            sub = `${r.material} · ${r.status} · ${r.current_ref}`;
            onSelect = () => gotoDetail("delivery", "delivery", r.current_ref);
          } else if (r.current_ref?.startsWith("RF-")) {
            sub = `${r.material} · ${r.status} · ${r.current_ref}`;
            onSelect = () => gotoDetail("returnFaulty", "return", r.current_ref);
          } else {
            sub = `${r.material} · ${r.status} · di Warehouse`;
            onSelect = () => { setSerialMaterial(r.material); goto("serialDetail"); };
          }
          return { type: "Serial Number", icon: Package, label: r.sn, sub, onSelect };
        }));
      }).catch(() => { if (!cancelled) setSnSearchResults([]); });
    }, 300);
    return () => { cancelled = true; clearTimeout(timer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const searchResults = useMemo(() => [...snSearchResults, ...localSearchResults].slice(0, 8), [snSearchResults, localSearchResults]);

  const notifications = useMemo(() => {
    const list = [];
    const isLogisticsView = role === ROLES.LOGISTICS || role === ROLES.MANAGER;

    if (role === ROLES.MANAGER) {
      deliveries.filter((d) => d.status === "Waiting Logistics Approval").forEach((d) => {
        list.push({ icon: Truck, color: "bg-emerald-50 text-emerald-700", text: `Delivery Request ${d.id} menunggu approval`, sub: `${d.homebase} · ${d.requester}`, onSelect: () => gotoDetail("delivery", "delivery", d.id) });
      });
    }
    if (isLogisticsView) {
      deliveries.filter((d) => d.status === "Waiting Stock Assignment").forEach((d) => {
        list.push({ icon: Truck, color: "bg-blue-50 text-blue-700", text: `Delivery Request ${d.id} menunggu penugasan stock`, sub: `${d.homebase} · ${d.requester}`, onSelect: () => gotoDetail("delivery", "delivery", d.id) });
      });
      returns.filter((r) => r.status === "Waiting Logistics Review").forEach((r) => {
        list.push({ icon: Undo2, color: "bg-red-50 text-red-600", text: `Return Faulty ${r.id} menunggu review`, sub: `${r.homebase} · ${r.technician}`, onSelect: () => gotoDetail("returnFaulty", "return", r.id) });
      });
      reconciliations.filter((r) => r.status === "Waiting Logistics Review").forEach((r) => {
        list.push({ icon: ClipboardList, color: "bg-amber-50 text-amber-600", text: `Rekonsiliasi ${r.id} menunggu review`, sub: `${r.homebase} · ${r.period}`, onSelect: () => gotoDetail("reconciliation", "recon", r.id) });
      });
      materials.filter((m) => m.ready <= m.minStock).forEach((m) => {
        list.push({ icon: AlertTriangle, color: "bg-blue-50 text-blue-600", text: `${m.name} mendekati stok minimum`, sub: `Ready: ${m.ready} · Min: ${m.minStock}`, onSelect: () => goto("stock") });
      });
    }

    if (role === ROLES.TECH) {
      returns.filter((r) => r.status === "Revision Required").forEach((r) => {
        list.push({ icon: AlertTriangle, color: "bg-red-50 text-red-600", text: `Return Faulty ${r.id} perlu revisi`, sub: r.revisionNote || "Lihat detail untuk catatan revisi", onSelect: () => gotoDetail("returnFaulty", "return", r.id) });
      });
      reconciliations.filter((r) => r.status === "Revision Required").forEach((r) => {
        list.push({ icon: AlertTriangle, color: "bg-red-50 text-red-600", text: `Reconciliation ${r.id} perlu revisi`, sub: r.revisionNote || "Lihat detail untuk catatan revisi", onSelect: () => gotoDetail("reconciliation", "recon", r.id) });
      });
      returns.filter((r) => r.status === "Ready to Ship").forEach((r) => {
        list.push({ icon: Truck, color: "bg-emerald-50 text-emerald-700", text: `Return Faulty ${r.id} siap dikirim`, sub: `${r.homebase}`, onSelect: () => gotoDetail("returnFaulty", "return", r.id) });
      });
    }

    if (role === ROLES.SPV) {
      deliveries.filter((d) => ["Waiting Stock Assignment", "Preparing", "Shipped"].includes(d.status)).forEach((d) => {
        list.push({ icon: Truck, color: "bg-blue-50 text-blue-600", text: `Delivery Request ${d.id} status: ${d.status}`, sub: `${d.homebase}`, onSelect: () => gotoDetail("delivery", "delivery", d.id) });
      });
      deliveries.filter((d) => d.status === "Rejected").forEach((d) => {
        list.push({ icon: AlertTriangle, color: "bg-red-50 text-red-600", text: `Delivery Request ${d.id} ditolak`, sub: `${d.homebase}`, onSelect: () => gotoDetail("delivery", "delivery", d.id) });
      });
    }

    return list;
  }, [role, deliveries, returns, reconciliations, materials]);

  /* ---- Delivery actions — every one calls the API, then merges the
     server's response (the source of truth) back into local state. ---- */
  const submitDelivery = async (data) => {
    try {
      const created = await api.createDelivery(data);
      setDeliveries((prev) => [created, ...prev]);
      showToast(`Delivery Request ${created.id} berhasil dibuat`);
      goto("delivery");
    } catch (err) { setApiError(err.message); }
  };

  const approveDelivery = async (id) => {
    try {
      const updated = await api.approveDelivery(id);
      setDeliveries((prev) => prev.map((d) => (d.id === id ? updated : d)));
    } catch (err) { setApiError(err.message); }
  };

  const assignDeliveryStock = async (id, serialSelections) => {
    try {
      const updated = await api.assignDeliveryStock(id, serialSelections);
      setDeliveries((prev) => prev.map((d) => (d.id === id ? updated : d)));
      await refreshStock();
    } catch (err) { setApiError(err.message); }
  };

  const rejectDelivery = async (id) => {
    try {
      const updated = await api.rejectDelivery(id);
      setDeliveries((prev) => prev.map((d) => (d.id === id ? updated : d)));
    } catch (err) { setApiError(err.message); }
  };

  const advanceDelivery = async (id) => {
    try {
      const updated = await api.advanceDelivery(id);
      setDeliveries((prev) => prev.map((d) => (d.id === id ? updated : d)));
      await refreshStock();
    } catch (err) { setApiError(err.message); }
  };

  /* ---- Return Faulty actions ---- */
  const submitReturn = async (data) => {
    try {
      const created = await api.createReturn(data);
      setReturns((prev) => [created, ...prev]);
      goto("returnFaulty");
    } catch (err) { setApiError(err.message); }
  };

  const approveReturn = async (id) => {
    try {
      const updated = await api.approveReturn(id);
      setReturns((prev) => prev.map((r) => (r.id === id ? updated : r)));
    } catch (err) { setApiError(err.message); }
  };

  const reviseReturn = async (id, note) => {
    try {
      const updated = await api.reviseReturn(id, note);
      setReturns((prev) => prev.map((r) => (r.id === id ? updated : r)));
    } catch (err) { setApiError(err.message); }
  };

  const resubmitReturn = async (id, data) => {
    try {
      const updated = await api.resubmitReturn(id, data);
      setReturns((prev) => prev.map((r) => (r.id === id ? updated : r)));
      setPage("returnFaulty");
    } catch (err) { setApiError(err.message); }
  };

  const shipReturn = async (id) => {
    try {
      const updated = await api.shipReturn(id);
      setReturns((prev) => prev.map((r) => (r.id === id ? updated : r)));
    } catch (err) { setApiError(err.message); }
  };

  const addResiReturn = async (id, resi) => {
    try {
      const updated = await api.addResi(id, resi);
      setReturns((prev) => prev.map((r) => (r.id === id ? updated : r)));
    } catch (err) { setApiError(err.message); }
  };

  const receiveReturn = async (id) => {
    try {
      const updated = await api.receiveReturn(id);
      setReturns((prev) => prev.map((r) => (r.id === id ? updated : r)));
    } catch (err) { setApiError(err.message); }
  };

  const qcReturn = async (id) => {
    try {
      const updated = await api.qcReturn(id);
      setReturns((prev) => prev.map((r) => (r.id === id ? updated : r)));
    } catch (err) { setApiError(err.message); }
  };

  const completeReturn = async (id) => {
    try {
      const updated = await api.completeReturn(id);
      setReturns((prev) => prev.map((r) => (r.id === id ? updated : r)));
      await refreshStock();
    } catch (err) { setApiError(err.message); }
  };

  /* ---- Reconciliation actions ---- */
  const submitRecon = async (data) => {
    try {
      const created = await api.createReconciliation(data);
      setReconciliations((prev) => [created, ...prev]);
      goto("reconciliation");
    } catch (err) { setApiError(err.message); }
  };

  const approveRecon = async (id) => {
    try {
      const updated = await api.approveReconciliation(id);
      setReconciliations((prev) => prev.map((r) => (r.id === id ? updated : r)));
      await refreshStock();
    } catch (err) { setApiError(err.message); }
  };

  const reviseRecon = async (id, note) => {
    try {
      const updated = await api.reviseReconciliation(id, note);
      setReconciliations((prev) => prev.map((r) => (r.id === id ? updated : r)));
    } catch (err) { setApiError(err.message); }
  };

  const resubmitRecon = async (id, data) => {
    try {
      const updated = await api.resubmitReconciliation(id, data.items);
      setReconciliations((prev) => prev.map((r) => (r.id === id ? updated : r)));
      setPage("reconciliation");
    } catch (err) { setApiError(err.message); }
  };

  /* ---- Master data actions ---- */
  const createMaterial = async (payload) => {
    const created = await api.createMaterial(payload);
    setMaterials((prev) => [...prev, normalizeMaterial(created)]);
  };
  const toggleMaterial = async (id) => {
    const updated = await api.toggleMaterialStatus(id);
    setMaterials((prev) => prev.map((m) => (m.id === id ? normalizeMaterial(updated) : m)));
  };
  const importMaterialsToServer = async (rows) => {
    const result = await api.importMaterials(rows);
    const list = await api.getMaterials();
    setMaterials(list.map(normalizeMaterial));
    return result;
  };

  const createSiteToServer = async (payload) => {
    const created = await api.createSite(payload);
    setSites((prev) => [...prev, normalizeSite(created)]);
  };
  const importSitesToServer = async (rows) => {
    const result = await api.importSites(rows);
    const sitesList = await api.getSites();
    setSites(sitesList.map(normalizeSite));
    return result;
  };

  const createHomebase = async (payload) => {
    const created = await api.createHomebase(payload);
    setHomebases((prev) => [...prev, created]);
  };
  const toggleHomebase = async (code) => {
    const updated = await api.toggleHomebaseStatus(code);
    setHomebases((prev) => prev.map((h) => (h.code === code ? updated : h)));
  };
  const importHomebasesToServer = async (rows) => {
    const result = await api.importHomebases(rows);
    const list = await api.getHomebases();
    setHomebases(list);
    return result;
  };

  const createArea = async (payload) => {
    const created = await api.createArea(payload);
    setAreas((prev) => [...prev, created]);
  };
  const toggleArea = async (code) => {
    const updated = await api.toggleAreaStatus(code);
    setAreas((prev) => prev.map((a) => (a.code === code ? updated : a)));
  };
  const importAreasToServer = async (rows) => {
    const result = await api.importAreas(rows);
    const list = await api.getAreas();
    setAreas(list);
    return result;
  };

  const createCustomer = async (payload) => {
    const created = await api.createCustomer(payload);
    setCustomers((prev) => [...prev, created]);
  };
  const toggleCustomer = async (id) => {
    const updated = await api.toggleCustomerStatus(id);
    setCustomers((prev) => prev.map((c) => (c.id === id ? updated : c)));
  };
  const importCustomersToServer = async (rows) => {
    const result = await api.importCustomers(rows);
    const list = await api.getCustomers();
    setCustomers(list);
    return result;
  };

  const createUserAccount = async (payload) => {
    if (!payload.username || !payload.password) {
      throw new Error("Username dan password wajib diisi untuk membuat user baru");
    }
    const created = await api.createUser(payload);
    setUsers((prev) => [...prev, created]);
  };
  const toggleUser = async (id) => {
    const updated = await api.toggleUserStatus(id);
    setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
  };
  const updateUserAccount = async (id, payload) => {
    const updated = await api.updateUser(id, payload);
    setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
  };

  const titles = {
    dashboard: ["Dashboard", "Ringkasan operasional logistics"],
    delivery: ["Delivery Request", ""], deliveryCreate: ["Delivery Request", ""],
    returnFaulty: ["Return Material Faulty", ""], returnFaultyCreate: ["Return Material Faulty", ""], returnFaultyEdit: ["Return Material Faulty", "Perbaiki & kirim ulang"],
    reconciliation: ["Reconciliation", ""], reconciliationCreate: ["Reconciliation", ""], reconciliationEdit: ["Reconciliation", "Perbaiki & kirim ulang"],
    stock: ["Warehouse Stock", ""], movement: ["Stock Movement", ""],
    serialDetail: ["Warehouse Stock", "Detail Serial Number"],
    reports: ["Reports", ""], reportsFaulty: ["Reports", ""], reportsRecon: ["Reports", ""],
    masterMaterial: ["Master Data", ""], masterSite: ["Master Data", ""], masterHomebase: ["Master Data", ""], masterArea: ["Master Data", ""], masterCustomer: ["Master Data", ""],
    users: ["User Management", ""], settings: ["Settings", ""],
  };
  const [titleMain, titleSub] = titles[page] || ["TEREX Logistics", ""];

  if (!authToken) {
    return <LoginScreen apiBase={apiBase} setApiBase={setApiBase} onLogin={handleLogin} />;
  }

  let content = null;
  if (dataLoading) {
    content = (
      <div className="p-8 flex items-center justify-center h-full text-gray-400 text-sm">Memuat data dari server...</div>
    );
  } else if (page === "dashboard") content = <Dashboard role={role} setPage={goto} deliveries={deliveries} returns={returns} reconciliations={reconciliations} materials={materials} />;
  else if (page === "delivery") {
    if (selectedDelivery) {
      const d = deliveries.find((x) => x.id === selectedDelivery);
      content = <DeliveryDetail delivery={d} onBack={() => setSelectedDelivery(null)} onApprove={approveDelivery} onReject={rejectDelivery} onAssignStock={assignDeliveryStock} onAdvance={advanceDelivery} role={role} materials={materials} api={api} />;
    } else content = <DeliveryList deliveries={deliveries} setSelected={setSelectedDelivery} setPage={goto} role={role} />;
  } else if (page === "deliveryCreate") content = <DeliveryCreate onSubmit={submitDelivery} onCancel={() => goto("delivery")} materials={materials} sites={sites} homebases={homebases} />;
  else if (page === "returnFaulty") {
    if (selectedReturn) {
      const r = returns.find((x) => x.id === selectedReturn);
      content = <ReturnFaultyDetail r={r} onBack={() => setSelectedReturn(null)} onApprove={approveReturn} onRevise={reviseReturn} onShip={shipReturn} onAddResi={addResiReturn} onReceive={receiveReturn} onQC={qcReturn} onComplete={completeReturn} onEdit={() => setPage("returnFaultyEdit")} role={role} />;
    } else content = <ReturnFaultyList returns={returns} setSelected={setSelectedReturn} setPage={goto} role={role} />;
  } else if (page === "returnFaultyCreate") content = <ReturnFaultyCreate onSubmit={submitReturn} onCancel={() => goto("returnFaulty")} materials={materials} returns={returns} reconciliations={reconciliations} />;
  else if (page === "returnFaultyEdit") {
    const r = returns.find((x) => x.id === selectedReturn);
    content = <ReturnFaultyCreate
      onSubmit={(data) => resubmitReturn(r.id, data)}
      onCancel={() => setPage("returnFaulty")}
      materials={materials}
      returns={returns}
      reconciliations={reconciliations}
      initialData={{ material: r.items[0].material, qty: r.items[0].qty, serials: r.items[0].serials, docs: r.docs }}
      excludeId={r.id}
      revisionNote={r.revisionNote}
    />;
  }
  else if (page === "reconciliation") {
    if (selectedRecon) {
      const r = reconciliations.find((x) => x.id === selectedRecon);
      content = <ReconciliationDetail r={r} onBack={() => setSelectedRecon(null)} onApprove={approveRecon} onRevise={reviseRecon} onEdit={() => setPage("reconciliationEdit")} role={role} />;
    } else content = <ReconciliationList items={reconciliations} setSelected={setSelectedRecon} setPage={goto} role={role} />;
  } else if (page === "reconciliationCreate") content = <ReconciliationCreate onSubmit={submitRecon} onCancel={() => goto("reconciliation")} materials={materials} returns={returns} reconciliations={reconciliations} homebases={homebases} />;
  else if (page === "reconciliationEdit") {
    const r = reconciliations.find((x) => x.id === selectedRecon);
    content = <ReconciliationCreate
      onSubmit={(data) => resubmitRecon(r.id, data)}
      onCancel={() => setPage("reconciliation")}
      materials={materials}
      returns={returns}
      reconciliations={reconciliations}
      homebases={homebases}
      initialData={{ homebase: r.homebase, period: r.period, items: r.items }}
      excludeId={r.id}
      revisionNote={r.revisionNote}
    />;
  }
  else if (page === "stock") content = <WarehouseStock materials={materials} setPage={goto} setMovementFilter={setMovementFilter} setSerialMaterial={setSerialMaterial} onSubmitReceipt={createReceipt} showToast={showToast} />;
  else if (page === "movement") content = <StockMovement movements={movements} filter={movementFilter} setFilter={setMovementFilter} />;
  else if (page === "serialDetail") content = <MaterialSerialDetail material={serialMaterial} api={api} onBack={() => goto("stock")} />;
  else if (page === "reports") content = <ReportsPage
    title="Delivery Report" subtitle="Laporan seluruh pengajuan delivery"
    data={deliveries}
    statusOf={(d) => d.status}
    dateOf={(d) => d.date}
    searchOf={(d) => `${d.id} ${d.requester} ${d.homebase} ${d.site} ${d.items.map((i) => i.material).join(" ")}`}
    columns={[
      { label: "Request ID", render: (d) => d.id, exportValue: (d) => d.id },
      { label: "Requester", render: (d) => d.requester, exportValue: (d) => d.requester },
      { label: "Homebase", render: (d) => d.homebase, exportValue: (d) => d.homebase },
      { label: "Material", render: (d) => d.items.map((i) => i.material).join(", "), exportValue: (d) => d.items.map((i) => i.material).join(", ") },
      { label: "Status", render: (d) => <StatusBadge status={d.status} />, exportValue: (d) => d.status },
      { label: "Tanggal", render: (d) => d.date, exportValue: (d) => d.date },
    ]}
  />;
  else if (page === "reportsFaulty") content = <ReportsPage
    title="Faulty Return Report" subtitle="Laporan return material faulty"
    data={returns}
    statusOf={(r) => r.status}
    dateOf={(r) => r.date}
    searchOf={(r) => `${r.id} ${r.technician} ${r.homebase} ${r.items.map((i) => i.material).join(" ")}`}
    columns={[
      { label: "Return ID", render: (r) => r.id, exportValue: (r) => r.id },
      { label: "Technician", render: (r) => r.technician, exportValue: (r) => r.technician },
      { label: "Homebase", render: (r) => r.homebase, exportValue: (r) => r.homebase },
      { label: "Material", render: (r) => r.items.map((i) => i.material).join(", "), exportValue: (r) => r.items.map((i) => i.material).join(", ") },
      { label: "Status", render: (r) => <StatusBadge status={r.status} />, exportValue: (r) => r.status },
      { label: "Tanggal", render: (r) => r.date, exportValue: (r) => r.date },
    ]}
  />;
  else if (page === "reportsRecon") content = <ReportsPage
    title="Reconciliation Report" subtitle="Laporan rekonsiliasi material"
    data={reconciliations}
    statusOf={(r) => r.status}
    dateOf={(r) => r.date}
    searchOf={(r) => `${r.id} ${r.homebase} ${r.period} ${r.items.map((i) => i.material).join(" ")}`}
    columns={[
      { label: "Reconciliation ID", render: (r) => r.id, exportValue: (r) => r.id },
      { label: "Homebase", render: (r) => r.homebase, exportValue: (r) => r.homebase },
      { label: "Periode", render: (r) => r.period, exportValue: (r) => r.period },
      { label: "Discrepancy", render: (r) => { const t = r.items.reduce((s, i) => s + (i.systemQty - i.actualQty), 0); return t !== 0 ? `-${t}` : "0"; }, exportValue: (r) => { const t = r.items.reduce((s, i) => s + (i.systemQty - i.actualQty), 0); return t !== 0 ? `-${t}` : "0"; } },
      { label: "Status", render: (r) => <StatusBadge status={r.status} />, exportValue: (r) => r.status },
      { label: "Tanggal", render: (r) => r.date, exportValue: (r) => r.date },
    ]}
  />;
  else if (page === "masterMaterial") content = <MasterMaterial materials={materials} onCreate={createMaterial} onToggle={toggleMaterial} onImport={importMaterialsToServer} showToast={showToast} />;
  else if (page === "masterSite") content = <MasterSite sites={sites} homebases={homebases} customers={customers} onImport={importSitesToServer} onCreate={createSiteToServer} showToast={showToast} />;
  else if (page === "masterHomebase") content = <MasterCrudTable
    title="Master Homebase" subtitle="Data homebase & PIC tim lapangan"
    entityLabel="Homebase" showToast={showToast}
    items={homebases} idField="code"
    buildLabel={(h) => `${h.name} ${h.area} ${h.pic}`}
    onCreate={createHomebase} onToggle={toggleHomebase}
    fields={[
      { key: "name", label: "Nama Homebase", required: true },
      { key: "area", label: "Area", type: "select", options: areas.map((a) => a.name), required: true },
      { key: "address", label: "Alamat", fullWidth: true },
      { key: "pic", label: "PIC" },
      { key: "phone", label: "Phone" },
    ]}
    importConfig={{
      templateFilename: "template_master_homebase.csv",
      columns: [
        { key: "name", header: "Nama Homebase" },
        { key: "area", header: "Area" },
        { key: "address", header: "Alamat" },
        { key: "pic", header: "PIC" },
        { key: "phone", header: "Phone" },
        { key: "status", header: "Status" },
      ],
      sampleRow: ["Contoh Homebase", "Kalimantan", "Jl. Contoh No. 1", "Nama PIC", "0812-0000-0000", "Active"],
      validateRow: (v) => {
        const errors = [];
        if (!v.name) errors.push("Nama Homebase kosong");
        else if (homebases.some((h) => h.name.toLowerCase() === v.name.toLowerCase())) errors.push("Nama Homebase sudah ada");
        if (!v.area) errors.push("Area kosong");
        else if (!areas.some((a) => a.name === v.area)) errors.push("Area tidak ditemukan di Master Area");
        return errors;
      },
      onImport: importHomebasesToServer,
    }}
  />;
  else if (page === "masterArea") content = <MasterCrudTable
    title="Master Area" subtitle="Wilayah operasional"
    entityLabel="Area" showToast={showToast}
    items={areas} idField="code"
    buildLabel={(a) => a.name}
    onCreate={createArea} onToggle={toggleArea}
    fields={[{ key: "name", label: "Area Name", required: true }]}
    importConfig={{
      templateFilename: "template_master_area.csv",
      columns: [{ key: "name", header: "Area Name" }, { key: "status", header: "Status" }],
      sampleRow: ["Contoh Area", "Active"],
      validateRow: (v) => {
        const errors = [];
        if (!v.name) errors.push("Area Name kosong");
        else if (areas.some((a) => a.name.toLowerCase() === v.name.toLowerCase())) errors.push("Area Name sudah ada");
        return errors;
      },
      onImport: importAreasToServer,
    }}
  />;
  else if (page === "masterCustomer") content = <MasterCrudTable
    title="Master Customer" subtitle="Data pelanggan"
    entityLabel="Customer" showToast={showToast}
    items={customers} idField="id"
    buildLabel={(c) => c.name}
    onCreate={createCustomer} onToggle={toggleCustomer}
    fields={[{ key: "name", label: "Customer Name", required: true }]}
    importConfig={{
      templateFilename: "template_master_customer.csv",
      columns: [{ key: "name", header: "Customer Name" }, { key: "status", header: "Status" }],
      sampleRow: ["Contoh Customer", "Active"],
      validateRow: (v) => {
        const errors = [];
        if (!v.name) errors.push("Customer Name kosong");
        else if (customers.some((c) => c.name.toLowerCase() === v.name.toLowerCase())) errors.push("Customer Name sudah ada");
        return errors;
      },
      onImport: importCustomersToServer,
    }}
  />;
  else if (page === "users") content = <MasterCrudTable
    title="User Management" subtitle="Kelola akses pengguna sistem"
    entityLabel="User" showToast={showToast}
    items={users} idField="id"
    buildLabel={(u) => `${u.name} ${u.role} ${u.assignment}`}
    onCreate={createUserAccount} onToggle={toggleUser} onUpdate={updateUserAccount}
    fields={[
      { key: "name", label: "Nama", required: true },
      { key: "username", label: "Username", required: true },
      { key: "password", label: "Password", required: true, createOnlyRequired: true, inputType: "password" },
      { key: "role", label: "Role", type: "select", options: Object.values(ROLES), required: true },
      { key: "assignment", label: "Homebase / Area", placeholder: "mis. Merauke, atau Semua Area" },
    ]}
  />;
  else if (page === "settings") content = (
    <div className="p-4 sm:p-8 max-w-xl space-y-5">
      <SectionTitle title="Settings" subtitle="Preferensi umum aplikasi" />
      <Card className="p-5 space-y-4 text-sm text-gray-600">
        <div className="flex items-center justify-between"><span>Notifikasi email</span><input type="checkbox" defaultChecked className="accent-emerald-800 w-4 h-4" /></div>
        <div className="flex items-center justify-between"><span>Notifikasi in-app</span><input type="checkbox" defaultChecked className="accent-emerald-800 w-4 h-4" /></div>
        <div className="flex items-center justify-between"><span>Bahasa</span><span className="text-gray-800 font-medium">Bahasa Indonesia</span></div>
        <div className="flex items-center justify-between"><span>Backend API URL</span><span className="text-gray-800 font-medium text-xs">{apiBase}</span></div>
        <div className="pt-2 border-t border-gray-100">
          <DangerButton onClick={handleLogout}><LogOut size={14} /> Logout</DangerButton>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50/50 font-sans text-gray-900" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Sidebar page={page} setPage={goto} role={role} userName={currentUser?.name} mobileOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar
          user={currentUser} onLogout={handleLogout} title={titleMain} subtitle={titleSub}
          searchQuery={searchQuery} setSearchQuery={setSearchQuery} searchResults={searchResults}
          notifications={notifications} onNotificationClick={(n) => n.onSelect()}
          onMenuClick={() => setMobileSidebarOpen(true)}
        />
        {apiError && (
          <div className="bg-red-50 border-b border-red-100 text-red-700 text-sm px-4 sm:px-8 py-2.5 flex items-center justify-between">
            <span>{apiError}</span>
            <button onClick={() => setApiError("")} className="text-red-400 hover:text-red-600"><X size={14} /></button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto">{content}</div>
      </div>

      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-emerald-800 text-white text-sm font-medium rounded-xl shadow-lg px-4 py-3 flex items-center gap-2.5 max-w-sm">
          <Check size={16} className="shrink-0" />
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
