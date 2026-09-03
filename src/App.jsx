import React, { useState, useMemo } from "react";
import {
  LayoutDashboard, Package, Truck, Undo2, ClipboardList, Boxes, ArrowLeftRight,
  FileBarChart, Database, Users, Settings as SettingsIcon, ChevronDown, ChevronRight, ChevronUp, ArrowUpDown,
  Search, Bell, LogOut, Plus, Minus, X, Check, AlertTriangle, Camera, ChevronLeft,
  Filter, Download, Upload, Eye, MapPin, Phone, User as UserIcon, Menu, FileText, Wrench, HelpCircle
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import Papa from "papaparse";
import * as XLSX from "xlsx";

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
  DIVISION_MANAGER: "Manager Divisi",
};

const NAV_ACCESS = {
  dashboard: [ROLES.MANAGER, ROLES.LOGISTICS, ROLES.SPV, ROLES.TECH, ROLES.DIVISION_MANAGER],
  delivery: [ROLES.MANAGER, ROLES.LOGISTICS, ROLES.SPV, ROLES.DIVISION_MANAGER],
  returnFaulty: [ROLES.MANAGER, ROLES.LOGISTICS, ROLES.TECH, ROLES.DIVISION_MANAGER],
  reconciliation: [ROLES.MANAGER, ROLES.LOGISTICS, ROLES.TECH, ROLES.DIVISION_MANAGER],
  materialSwap: [ROLES.MANAGER, ROLES.LOGISTICS, ROLES.TECH, ROLES.DIVISION_MANAGER],
  stock: [ROLES.MANAGER, ROLES.LOGISTICS, ROLES.SPV, ROLES.DIVISION_MANAGER],
  movement: [ROLES.MANAGER, ROLES.LOGISTICS, ROLES.SPV, ROLES.DIVISION_MANAGER],
  stockTransfer: [ROLES.MANAGER, ROLES.LOGISTICS, ROLES.DIVISION_MANAGER],
  receipts: [ROLES.MANAGER, ROLES.LOGISTICS],
  reports: [ROLES.MANAGER, ROLES.LOGISTICS, ROLES.DIVISION_MANAGER],
  reportsDeviceLocation: [ROLES.MANAGER, ROLES.LOGISTICS, ROLES.SPV, ROLES.DIVISION_MANAGER],
  toolStock: [ROLES.MANAGER, ROLES.LOGISTICS, ROLES.SPV, ROLES.DIVISION_MANAGER],
  consumableStock: [ROLES.MANAGER, ROLES.LOGISTICS, ROLES.SPV, ROLES.DIVISION_MANAGER],
  master: [ROLES.MANAGER],
  users: [ROLES.MANAGER],
  settings: [ROLES.MANAGER, ROLES.LOGISTICS, ROLES.SPV, ROLES.TECH, ROLES.DIVISION_MANAGER],
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
  "Waiting Approval": "bg-amber-50 text-amber-700",
  "Checked Out": "bg-indigo-50 text-indigo-700",
  "Returned": "bg-emerald-50 text-emerald-700",
  "Available": "bg-emerald-50 text-emerald-700",
  "Under Repair": "bg-red-50 text-red-700",
  "Installed": "bg-emerald-100 text-emerald-800",
  "Sent to Customer": "bg-purple-50 text-purple-700",
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

/* Full-size photo viewer — any thumbnail in the app can open into this by
   setting a shared "lightboxSrc" state and rendering this once per page. */
function ImageLightbox({ src, onClose }) {
  if (!src) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 text-white bg-white/10 rounded-full p-2 hover:bg-white/20">
        <X size={20} />
      </button>
      <img src={src} alt="" className="max-w-full max-h-full rounded-lg object-contain" onClick={(e) => e.stopPropagation()} />
    </div>
  );
}

/* Thumbnail that opens the shared lightbox on click — small helper to avoid
   repeating the cursor/hover/onClick wiring at every photo display site. */
function PhotoThumb({ src, alt, className, onOpen }) {
  if (!src) return null;
  return (
    <img
      src={src}
      alt={alt || ""}
      className={`cursor-pointer hover:opacity-80 transition-opacity ${className || ""}`}
      onClick={() => onOpen(src)}
    />
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

// Clickable column header for sortable tables — click cycles asc -> desc,
// clicking a different column resets to asc on that column instead.
function SortableHeader({ label, sortKey, sort, onSort, className = "" }) {
  const isActive = sort.key === sortKey;
  return (
    <th className={`px-5 py-3 font-medium cursor-pointer select-none hover:text-gray-700 ${className}`} onClick={() => onSort(sortKey)}>
      <span className="inline-flex items-center gap-1">
        {label}
        {isActive ? (sort.dir === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : <ArrowUpDown size={11} className="text-gray-300" />}
      </span>
    </th>
  );
}

// Generic comparator for the sort state above — handles numbers, strings,
// and null/undefined (always sorted last regardless of direction) the same
// way across every Master Data table.
function sortRows(rows, sort) {
  if (!sort.key) return rows;
  return [...rows].sort((a, b) => {
    const av = a[sort.key], bv = b[sort.key];
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    let cmp;
    if (typeof av === "number" && typeof bv === "number") cmp = av - bv;
    else cmp = String(av).localeCompare(String(bv), "id", { numeric: true, sensitivity: "base" });
    return sort.dir === "asc" ? cmp : -cmp;
  });
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
      { key: "materialSwap", label: "Penggantian Material" },
    ],
  },
  {
    key: "inventory", label: "Inventory", icon: Boxes,
    children: [
      { key: "stock", label: "Warehouse Stock" },
      { key: "movement", label: "Stock Movement" },
      { key: "toolStock", label: "Stock Alat" },
      { key: "consumableStock", label: "Stock Consumable" },
      { key: "stockTransfer", label: "Transfer Stock" },
    ],
  },
  {
    key: "reportsGroup", label: "Reports", icon: FileBarChart,
    children: [
      { key: "reports", label: "Delivery Report" },
      { key: "reportsFaulty", label: "Faulty Return Report" },
      { key: "reportsRecon", label: "Reconciliation Report" },
      { key: "reportsDeviceLocation", label: "Lokasi Perangkat" },
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
      { key: "masterTools", label: "Master Alat" },
      { key: "masterConsumable", label: "Master Consumable" },
    ],
  },
  { key: "users", label: "User Management", icon: Users },
  { key: "help", label: "Panduan Penggunaan", icon: HelpCircle },
  { key: "settings", label: "Settings", icon: SettingsIcon },
];

function hasAccess(key, role) {
  const map = {
    delivery: NAV_ACCESS.delivery, returnFaulty: NAV_ACCESS.returnFaulty, reconciliation: NAV_ACCESS.reconciliation,
    materialSwap: NAV_ACCESS.materialSwap,
    stock: NAV_ACCESS.stock, movement: NAV_ACCESS.movement,
    toolStock: NAV_ACCESS.toolStock, stockTransfer: NAV_ACCESS.stockTransfer, consumableStock: NAV_ACCESS.consumableStock,
    reports: NAV_ACCESS.reports, reportsFaulty: NAV_ACCESS.reports, reportsRecon: NAV_ACCESS.reports, reportsDeviceLocation: NAV_ACCESS.reportsDeviceLocation,
    masterMaterial: NAV_ACCESS.master, masterSite: NAV_ACCESS.master, masterHomebase: NAV_ACCESS.master,
    masterArea: NAV_ACCESS.master, masterCustomer: NAV_ACCESS.master, masterTools: NAV_ACCESS.master, masterConsumable: NAV_ACCESS.master,
    users: NAV_ACCESS.users, dashboard: NAV_ACCESS.dashboard, settings: NAV_ACCESS.settings,
  };
  const allowed = map[key];
  return !allowed || allowed.includes(role);
}

function Sidebar({ page, setPage, role, userName, userCustomers, mobileOpen, onClose }) {
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
            <div className="text-xs text-gray-500 truncate">{role}{userCustomers?.length ? ` · ${userCustomers.join(", ")}` : ""}</div>
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
  const [searchDismissed, setSearchDismissed] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const updateSearch = (val) => { setSearchQuery(val); setSearchDismissed(false); };
  const showDesktopDropdown = searchQuery.trim() && !searchDismissed;

  const resultsDropdown = (
    <div className="absolute mt-1.5 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-96 overflow-y-auto py-1.5 z-30">
      {searchResults.length === 0 ? (
        <div className="px-4 py-6 text-center text-sm text-gray-400">Tidak ada hasil untuk "{searchQuery}"</div>
      ) : (
        searchResults.map((r, i) => (
          <button
            key={i}
            onClick={() => { r.onSelect(); setSearchQuery(""); setSearchDismissed(true); setMobileSearchOpen(false); }}
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
                onChange={(e) => updateSearch(e.target.value)}
                onFocus={() => setSearchDismissed(false)}
                placeholder="Cari site, material, SN, atau dokumen..."
                className="bg-transparent text-sm outline-none w-full placeholder:text-gray-400"
              />
              {searchQuery && (
                <button onClick={() => { setSearchQuery(""); setSearchDismissed(false); }} className="text-gray-300 hover:text-gray-500 shrink-0"><X size={14} /></button>
              )}
            </div>
            {showDesktopDropdown && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setSearchDismissed(true)} />
                <div className="relative z-30">{resultsDropdown}</div>
              </>
            )}
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
            <div className="text-[11px] text-gray-400 truncate max-w-[140px]">{user?.role}{user?.customers?.length ? ` · ${user.customers.join(", ")}` : ""}</div>
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

function Dashboard({ role, userName, setPage, deliveries, returns, reconciliations, materials, tools, materialSwaps }) {
  const pendingApproval = deliveries.filter((d) => d.status === "Waiting Logistics Approval").length;
  const inProgress = deliveries.filter((d) => ["In Progress", "Waiting Stock Assignment", "Preparing", "Shipped"].includes(d.status)).length;
  const waitingReview = returns.filter((r) => r.status === "Waiting Logistics Review").length;
  const reconReview = reconciliations.filter((r) => r.status === "Waiting Logistics Review").length;
  const lowStock = materials.filter((m) => m.ready <= m.minStock).length;
  const totalMaterial = materials.reduce((s, m) => s + m.ready + m.faulty + m.reserved + m.transit, 0);
  const toolsCheckedOut = tools.reduce((s, t) => s + (t.checked_out || 0), 0);
  const swapsToday = materialSwaps.filter((s) => s.date === new Date().toISOString().slice(0, 10)).length;

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 11 ? "Good morning" : hour < 15 ? "Good afternoon" : hour < 19 ? "Good evening" : "Good night";
  const firstName = (userName || "").trim().split(" ")[0] || "there";
  const formattedDate = now.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const actions = [
    { icon: Undo2, color: "bg-red-50 text-red-600", title: "Return Faulty menunggu review", sub: "Diajukan oleh tim lapangan", count: waitingReview, cta: "Review", page: "returnFaulty" },
    { icon: ClipboardList, color: "bg-amber-50 text-amber-600", title: "Rekonsiliasi menunggu review", sub: "Periode berjalan", count: reconReview, cta: "Review", page: "reconciliation" },
    { icon: Truck, color: "bg-emerald-50 text-emerald-700", title: "Delivery Request menunggu approval", sub: "Diajukan oleh tim lapangan", count: pendingApproval, cta: "Approval", page: "delivery" },
    { icon: AlertTriangle, color: "bg-blue-50 text-blue-600", title: "Material mendekati stok minimum", sub: "Perlu perhatian", count: lowStock, cta: "Lihat", page: "stock" },
  ].filter((a) => a.count > 0);

  return (
    <div className="p-4 sm:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{greeting}, {firstName} 👋</h1>
        <p className="text-gray-500 mt-1">{formattedDate} · {role}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Delivery Request", value: inProgress, sub: "In Progress", icon: Truck, color: "bg-emerald-50 text-emerald-700", page: "delivery" },
          { label: "Return Material Faulty", value: waitingReview, sub: "Menunggu Review", icon: Undo2, color: "bg-amber-50 text-amber-600", page: "returnFaulty" },
          { label: "Rekonsiliasi Material", value: reconReview, sub: "Menunggu Review", icon: ClipboardList, color: "bg-blue-50 text-blue-600", page: "reconciliation" },
          { label: "Material On Hand", value: totalMaterial.toLocaleString("id-ID"), sub: "Total Material", icon: Boxes, color: "bg-emerald-50 text-emerald-700", page: "stock" },
          { label: "Alat Sedang Dipinjam", value: toolsCheckedOut, sub: "Checked Out", icon: Wrench, color: "bg-indigo-50 text-indigo-700", page: "toolStock" },
          { label: "Penggantian Material", value: swapsToday, sub: "Hari Ini", icon: ArrowLeftRight, color: "bg-teal-50 text-teal-700", page: "materialSwap" },
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
   PANDUAN PENGGUNAAN
   ============================================================ */

function HelpSection({ icon: Icon, color, title, children }) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${color}`}><Icon size={18} /></div>
        <div className="text-sm font-semibold text-gray-800">{title}</div>
      </div>
      <div className="space-y-2 text-sm text-gray-600 pl-12">{children}</div>
    </Card>
  );
}

function HelpStep({ n, children }) {
  return (
    <div className="flex gap-2.5">
      <span className="shrink-0 w-5 h-5 rounded-full bg-gray-100 text-gray-500 text-xs font-medium flex items-center justify-center mt-0.5">{n}</span>
      <span>{children}</span>
    </div>
  );
}

function HelpPage({ role }) {
  return (
    <div className="p-4 sm:p-8 max-w-3xl space-y-5">
      <SectionTitle title="Panduan Penggunaan" subtitle="Ringkasan alur kerja utama di TEREX Logistics" />

      <Card className="p-5 bg-emerald-50/50 border-emerald-100">
        <div className="text-sm text-emerald-900">
          Anda login sebagai <span className="font-semibold">{role}</span>. Halaman yang muncul di sidebar sudah disesuaikan dengan akses peran Anda — kalau ada menu yang menurut Anda seharusnya bisa diakses tapi tidak muncul, hubungi Manager Logistics.
        </div>
      </Card>

      <HelpSection icon={Truck} color="bg-emerald-50 text-emerald-700" title="Delivery Request — Pengiriman Material & Alat">
        <HelpStep n={1}>SPV mengajukan kebutuhan material dan/atau alat (pilih dari katalog gabungan, alat ditandai "Alat · Pinjam").</HelpStep>
        <HelpStep n={2}>Manager Logistics menyetujui dari sisi jumlah (belum tentukan unit fisik).</HelpStep>
        <HelpStep n={3}>Logistics Staff menentukan Serial Number spesifik yang dikirim, lalu dokumentasikan sebelum status "Shipped".</HelpStep>
        <HelpStep n={4}>Setelah barang sampai, status diubah ke "Delivered". Untuk alat, sekali diserahkan langsung berstatus "Checked Out" — wajib dikembalikan lewat panel "Kembalikan Alat" di halaman detail, kapan saja.</HelpStep>
        <div className="pt-1 text-xs text-gray-400">Catatan: konfirmasi bahwa material sudah benar-benar terpasang di site dilakukan lewat menu terpisah "Penggantian Material", bukan di sini.</div>
      </HelpSection>

      <HelpSection icon={ArrowLeftRight} color="bg-teal-50 text-teal-700" title="Penggantian Material — Instalasi & Ganti Unit Rusak">
        <HelpStep n={1}>Pilih unit yang mau dipasang — harus unit yang sudah berstatus "Delivered" di sistem.</HelpStep>
        <HelpStep n={2}>Isi Homebase dan Site tempat pemasangan, lalu upload foto bukti terpasang.</HelpStep>
        <HelpStep n={3}>Kalau ini penggantian (bukan instalasi baru), isi juga Serial Number unit lama beserta foto buktinya — unit ini boleh belum pernah tercatat di sistem, cukup ditulis manual.</HelpStep>
        <HelpStep n={4}>Setelah tersimpan, unit baru otomatis berstatus "Installed", dan unit lama (jika ada) otomatis berstatus "Faulty" — tinggal klik "Buat Return Faulty" untuk melaporkannya balik ke gudang.</HelpStep>
      </HelpSection>

      <HelpSection icon={Undo2} color="bg-amber-50 text-amber-700" title="Return Material Faulty — Lapor Barang Rusak">
        <HelpStep n={1}>Technician input Serial Number material rusak secara manual, lengkap dengan foto per unit.</HelpStep>
        <HelpStep n={2}>Upload dokumentasi: foto sebelum packing, setelah packing, dan foto timbangan.</HelpStep>
        <HelpStep n={3}>Logistics Staff meninjau — bisa disetujui atau diminta revisi dengan catatan.</HelpStep>
        <HelpStep n={4}>Setelah dikirim dan diterima gudang, Logistics melakukan QC lalu menyelesaikan laporan — stock Faulty otomatis bertambah.</HelpStep>
      </HelpSection>

      <HelpSection icon={ClipboardList} color="bg-blue-50 text-blue-700" title="Reconciliation — Verifikasi Stock Fisik">
        <HelpStep n={1}>Technician menghitung fisik material di lapangan, input jumlah aktual dan foto bukti.</HelpStep>
        <HelpStep n={2}>Kalau ada selisih dengan catatan sistem, wajib isi alasan (reason).</HelpStep>
        <HelpStep n={3}>Logistics Staff meninjau dan menyetujui — begitu disetujui, stock sistem otomatis disesuaikan mengikuti hasil hitung fisik.</HelpStep>
      </HelpSection>

      <HelpSection icon={Wrench} color="bg-indigo-50 text-indigo-700" title="Peralatan — Stock & Peminjaman Alat">
        <HelpStep n={1}>Alat kerja (OTDR, tang crimping, dll.) dikelola terpisah dari material — dipinjam dan wajib dikembalikan, bukan dikirim permanen.</HelpStep>
        <HelpStep n={2}>Terima alat baru lewat menu "Stock Alat", sama seperti Terima Barang material.</HelpStep>
        <HelpStep n={3}>Peminjaman alat diajukan lewat Delivery Request (dicampur dengan material dalam satu pengajuan yang sama).</HelpStep>
        <HelpStep n={4}>Pengembalian dilakukan lewat panel "Kembalikan Alat" di halaman detail Delivery Request terkait — catat kondisi Baik atau Rusak.</HelpStep>
      </HelpSection>

      <HelpSection icon={Search} color="bg-gray-100 text-gray-600" title="Pencarian Global">
        Gunakan kolom pencarian di pojok kanan atas untuk mencari cepat berdasarkan nomor request/laporan, nama site, nama material/alat, atau Serial Number — hasilnya langsung mengarahkan ke halaman detail yang relevan.
      </HelpSection>

      <div className="text-xs text-gray-400 text-center pt-2">Ada pertanyaan lain? Hubungi Admin / Manager Logistics.</div>
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

function DeliveryCreate({ onSubmit, onCancel, materials, tools, consumables, sites, homebases, currentUser, customers, api }) {
  const [step, setStep] = useState(1);
  const [homebase, setHomebase] = useState("");
  const [site, setSite] = useState("");
  const [siteSearch, setSiteSearch] = useState("");
  const [keperluan, setKeperluan] = useState("");
  const [otherDesc, setOtherDesc] = useState("");
  const [note, setNote] = useState("");
  const [cart, setCart] = useState({});
  const [matSearch, setMatSearch] = useState("");
  const [customer, setCustomer] = useState("");

  const isManager = currentUser?.role === ROLES.MANAGER;
  const myDivisions = currentUser?.customers || [];
  const needsDivisionPicker = isManager || myDivisions.length > 1;
  const divisionOptions = isManager ? customers.filter((c) => c.status === "Active").map((c) => c.name) : myDivisions;

  // Someone who has to explicitly pick a division (Manager, or anyone
  // covering more than one) sees stock via `materials`/`tools` props that
  // are either global aggregates or summed across every division they
  // cover — not the ONE division this request is actually being made for.
  // Once that division is chosen, re-fetch real per-division numbers so
  // "18 available" here always matches what assign-stock will actually see.
  const [divisionStock, setDivisionStock] = useState(null); // null = not fetched / not needed
  React.useEffect(() => {
    if (!needsDivisionPicker || !customer) { setDivisionStock(null); return; }
    let cancelled = false;
    api.getStock(customer).then((rows) => { if (!cancelled) setDivisionStock(rows); }).catch(() => { if (!cancelled) setDivisionStock(null); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needsDivisionPicker, customer]);

  const effectiveMaterials = needsDivisionPicker && customer && divisionStock ? divisionStock : materials;

  const hb = homebases.find((h) => h.name === homebase);
  const siteOptions = sites.filter((s) =>
    s.homebase === homebase && s.status === "Active" &&
    (s.name.toLowerCase().includes(siteSearch.toLowerCase()) || s.code.toLowerCase().includes(siteSearch.toLowerCase()) || s.terminalId.toLowerCase().includes(siteSearch.toLowerCase()))
  );

  // Sparepart (dikirim, one-way), alat (dipinjam, harus dikembalikan), and
  // consumable (habis pakai, tidak dikembalikan) live in one combined
  // catalog here so a single request can mix all three — `ready` is
  // aliased onto tools (from `available`) so the rest of this component's
  // qty-vs-stock logic works the same across all kinds. Tools stay
  // unscoped (shared pool, no division split) regardless.
  const catalogItems = [
    ...effectiveMaterials.filter((m) => m.status === "Active").map((m) => ({ ...m, _type: "material" })),
    ...tools.filter((t) => t.status === "Active").map((t) => ({ ...t, _type: "tool", ready: t.available })),
    ...consumables.filter((c) => c.status === "Active").map((c) => ({ ...c, _type: "consumable" })),
  ];
  const filteredCatalog = catalogItems.filter((m) => m.name.toLowerCase().includes(matSearch.toLowerCase()));

  const updateQty = (matId, delta) => {
    setCart((c) => {
      const current = c[matId] || 0;
      const next = Math.max(0, current + delta);
      return { ...c, [matId]: next };
    });
  };
  // For items typically requested in bulk (consumables especially — often
  // dozens or hundreds at once) clicking + repeatedly isn't practical.
  // Lets the qty be typed directly instead of only stepped.
  const setQtyDirect = (matId, raw) => {
    const n = raw === "" ? 0 : Math.max(0, Math.floor(Number(raw)) || 0);
    setCart((c) => ({ ...c, [matId]: n }));
  };

  const cartItems = Object.entries(cart).filter(([, q]) => q > 0).map(([id, q]) => ({ material: catalogItems.find((m) => m.id === id), qty: q }));
  const step1Valid = homebase && keperluan && (keperluan !== "Other" || otherDesc.trim()) && (!needsDivisionPicker || (customer && divisionStock !== null));
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
          {needsDivisionPicker && (
            <div>
              <label className="text-sm font-medium text-gray-700">Divisi (Customer) <span className="text-red-500">*</span></label>
              <select value={customer} onChange={(e) => setCustomer(e.target.value)} className="mt-1.5 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-emerald-600">
                <option value="">Pilih divisi...</option>
                {divisionOptions.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <div className="text-xs text-gray-400 mt-1">{divisionStock === null && customer ? "Memuat stock untuk divisi ini..." : "Stock yang ditampilkan di langkah berikutnya adalah stock nyata untuk divisi yang dipilih."}</div>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700">Homebase / Area <span className="text-red-500">*</span></label>
            <select value={homebase} onChange={(e) => { setHomebase(e.target.value); setSite(""); }} className="mt-1.5 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-emerald-600">
              <option value="">Pilih homebase...</option>
              {homebases.filter((h) => h.status === "Active").map((h) => <option key={h.code} value={h.name}>{h.name} — {h.area}</option>)}
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
            <input value={matSearch} onChange={(e) => setMatSearch(e.target.value)} placeholder="Cari material atau alat..." className="bg-transparent text-sm outline-none w-full" />
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {filteredCatalog.map((m) => {
              const qty = cart[m.id] || 0;
              const insufficient = qty > m.ready;
              const isTool = m._type === "tool";
              const isConsumable = m._type === "consumable";
              return (
                <div key={m.id} className={`flex items-center justify-between border rounded-xl px-4 py-3 ${qty > 0 ? "border-emerald-200 bg-emerald-50/30" : "border-gray-100"}`}>
                  <div>
                    <div className="text-sm font-medium text-gray-800 flex items-center gap-2">
                      {m.name}
                      {isTool && <span className="text-[10px] font-semibold uppercase tracking-wide text-indigo-600 bg-indigo-50 rounded-full px-2 py-0.5">Alat · Pinjam</span>}
                      {isConsumable && <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-600 bg-amber-50 rounded-full px-2 py-0.5">Consumable</span>}
                    </div>
                    <div className={`text-xs mt-0.5 ${insufficient ? "text-red-600 font-medium" : "text-gray-400"}`}>
                      Stock Available: {m.ready}{qty > 0 && ` · Requested: ${qty} · ${insufficient ? "Insufficient Stock" : "Available"}`}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => updateQty(m.id, -1)} className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100"><Minus size={13} /></button>
                    <input
                      type="number"
                      min="0"
                      value={qty}
                      onChange={(e) => setQtyDirect(m.id, e.target.value)}
                      onFocus={(e) => e.target.select()}
                      className="w-14 text-center text-sm font-semibold border border-gray-200 rounded-lg py-1 outline-none focus:border-emerald-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
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
            <div className="text-xs text-gray-400 mb-2">Item Diajukan</div>
            <div className="divide-y divide-gray-50 border border-gray-100 rounded-xl">
              {cartItems.map((i) => (
                <div key={i.material.id} className="flex justify-between px-4 py-2.5 text-sm">
                  <span className="text-gray-700 flex items-center gap-2">
                    {i.material.name}
                    {i.material._type === "tool" && <span className="text-[10px] font-semibold uppercase tracking-wide text-indigo-600 bg-indigo-50 rounded-full px-2 py-0.5">Alat · Pinjam</span>}
                    {i.material._type === "consumable" && <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-600 bg-amber-50 rounded-full px-2 py-0.5">Consumable</span>}
                  </span>
                  <span className="font-medium text-gray-800">Qty {i.qty}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-between pt-2">
            <GhostButton onClick={() => setStep(2)}><ChevronLeft size={16} /> Kembali</GhostButton>
            <PrimaryButton onClick={() => onSubmit({ homebase, site: site ? sites.find((s) => s.code === site)?.name : "", keperluan: keperluan === "Other" ? `Other - ${otherDesc}` : keperluan, note, items: cartItems.map((i) => ({ material: i.material.name, qty: i.qty, type: i.material._type })), ...(needsDivisionPicker ? { customer } : {}) })}>
              <Check size={16} /> Submit Request
            </PrimaryButton>
          </div>
        </Card>
      )}
    </div>
  );
}

function DeliveryDetail({ delivery, onBack, onApprove, onReject, onAssignStock, onShip, onAddResi, onAddBast, onAddBkbLink, onAdvance, onReturnTools, role, materials, tools, api }) {
  // Stage 1 — Manager reviews qty only, no SN involved.
  const canApprove = role === ROLES.MANAGER && delivery.status === "Waiting Logistics Approval";
  // Stage 2 — Logistics Staff (or Manager) picks the actual units to fulfill it.
  const canAssignStock = (role === ROLES.LOGISTICS || role === ROLES.MANAGER) && delivery.status === "Waiting Stock Assignment";
  // Stage 3 — before Shipped, Logistics Staff documents the shipment.
  const canShip = (role === ROLES.LOGISTICS || role === ROLES.MANAGER) && delivery.status === "Preparing";
  const canEditResi = (role === ROLES.LOGISTICS || role === ROLES.MANAGER) && ["Shipped", "Delivered"].includes(delivery.status);
  const hasResi = !!(delivery.resiNumber || delivery.resiPhoto);
  const canEditBast = (role === ROLES.LOGISTICS || role === ROLES.MANAGER) && ["Shipped", "Delivered"].includes(delivery.status);
  const canAdvance = (role === ROLES.LOGISTICS || role === ROLES.MANAGER) && delivery.status === "Shipped";

  const [approving, setApproving] = useState(false);
  const handleApprove = async () => {
    setApproving(true);
    try { await onApprove(delivery.id); } finally { setApproving(false); }
  };

  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  // Serialized items needing a Serial Number pick at assign-stock time —
  // works for both sparepart (materials) and alat (tools), just checking a
  // different master list depending on the item's type.
  const serializedItems = delivery.items.filter((i) =>
    i.type === "tool" ? tools.find((t) => t.name === i.material)?.serialized : materials.find((m) => m.name === i.material)?.serialized
  );
  const [availableSerials, setAvailableSerials] = useState({}); // { material: [{sn,status},...] }
  const [selectedSerials, setSelectedSerials] = useState({}); // { material: Set<sn> }
  const [loadingSerials, setLoadingSerials] = useState(false);
  const [assigning, setAssigning] = useState(false);

  React.useEffect(() => {
    if (!canAssignStock || serializedItems.length === 0) return;
    let cancelled = false;
    setLoadingSerials(true);
    Promise.all(serializedItems.map((i) =>
      (i.type === "tool" ? api.getToolSerials(i.material, "Available") : api.getSerials(i.material, "Ready", delivery.customer)).then((data) => [i.material, data])
    ))
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

  // ---- Stage 3: shipment documentation ----
  const allShipmentSerials = delivery.items.flatMap((i) => i.serials || []);
  const [docOverall, setDocOverall] = useState("");
  const [docAfterPacking, setDocAfterPacking] = useState("");
  const [serialPhotos, setSerialPhotos] = useState({}); // { sn: dataUrl }
  const [shipping, setShipping] = useState(false);
  const [confirmShip, setConfirmShip] = useState(false);
  const [shipError, setShipError] = useState("");

  const docsCompleted = (docOverall ? 1 : 0) + (docAfterPacking ? 1 : 0) + allShipmentSerials.filter((sn) => serialPhotos[sn]).length;
  const docsTotal = 2 + allShipmentSerials.length;
  const shipValid = docOverall && docAfterPacking && allShipmentSerials.every((sn) => serialPhotos[sn]);

  const handleShip = async () => {
    setShipping(true); setShipError("");
    try {
      await onShip(delivery.id, { docOverall, docAfterPacking, serialPhotos });
    } catch (err) {
      setShipError(err.message || "Gagal menandai Shipped");
    } finally {
      setShipping(false);
    }
  };

  // ---- Stage 4: proof of receipt before Shipped -> Delivered ----
  const [deliveredPhoto, setDeliveredPhoto] = useState("");
  const [receivedBy, setReceivedBy] = useState("");
  const [advancing, setAdvancing] = useState(false);
  const [advanceError, setAdvanceError] = useState("");
  const deliveredValid = !!deliveredPhoto;

  const handleAdvance = async () => {
    setAdvancing(true); setAdvanceError("");
    try {
      await onAdvance(delivery.id, { deliveredPhoto, receivedBy: receivedBy.trim() || undefined });
    } catch (err) {
      setAdvanceError(err.message || "Gagal menandai Delivered");
    } finally {
      setAdvancing(false);
    }
  };

  // ---- Kembalikan Alat — independent of the delivery's own status/stage;
  // any tool unit still Checked Out under this delivery can be returned any
  // time, including long after the delivery itself reached Delivered.
  // Partial returns are supported (return some units now, more later). ----
  const canReturnTools = (role === ROLES.LOGISTICS || role === ROLES.MANAGER || role === ROLES.SPV || role === ROLES.TECH) && (delivery.outstandingTools?.length || 0) > 0;
  const [selectedReturns, setSelectedReturns] = useState(new Set());
  const [returnCondition, setReturnCondition] = useState("Baik");
  const [returnNote, setReturnNote] = useState("");
  const [returnPhoto, setReturnPhoto] = useState("");
  const [returningTools, setReturningTools] = useState(false);
  const [confirmReturnTools, setConfirmReturnTools] = useState(false);

  const toggleReturnSn = (sn) => {
    setSelectedReturns((prev) => {
      const next = new Set(prev);
      if (next.has(sn)) next.delete(sn); else next.add(sn);
      return next;
    });
  };

  const handleReturnTools = async () => {
    setReturningTools(true);
    try {
      await onReturnTools(delivery.id, { serials: Array.from(selectedReturns), condition: returnCondition, note: returnNote, photo: returnPhoto || undefined });
      setSelectedReturns(new Set()); setReturnNote(""); setReturnPhoto(""); setReturnCondition("Baik");
    } finally {
      setReturningTools(false);
    }
  };

  // ---- Resi (optional, can be added after shipping) ----
  const [resiInput, setResiInput] = useState("");
  const [resiPhotoInput, setResiPhotoInput] = useState("");
  const [showResiInput, setShowResiInput] = useState(false);

  // ---- BAST (Berita Acara Serah Terima — optional, added after shipping) ----
  const [bastInput, setBastInput] = useState("");
  const [bastNameInput, setBastNameInput] = useState("");
  const [showBastInput, setShowBastInput] = useState(false);

  // ---- BKB / Surat Jalan link — kept in a separate external system, this
  // is just an optional reference URL, same "add any time" pattern as resi/BAST ----
  const [bkbInput, setBkbInput] = useState("");
  const [showBkbInput, setShowBkbInput] = useState(false);

  const [lightboxSrc, setLightboxSrc] = useState(null);

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

      {delivery.status === "Rejected" && delivery.rejectionReason && (
        <Card className="p-4 border-red-200 bg-red-50/50 flex items-start gap-3">
          <AlertTriangle size={18} className="text-red-500 mt-0.5 shrink-0" />
          <div className="text-sm text-red-700"><span className="font-semibold">Alasan penolakan: </span>{delivery.rejectionReason}</div>
        </Card>
      )}

      <Card className="p-5 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div><div className="text-gray-400 text-xs">Homebase</div><div className="font-medium text-gray-800">{delivery.homebase}</div></div>
        <div><div className="text-gray-400 text-xs">Site</div><div className="font-medium text-gray-800">{delivery.site || "-"}</div></div>
        <div><div className="text-gray-400 text-xs">Keperluan</div><div className="font-medium text-gray-800">{delivery.keperluan}</div></div>
        <div><div className="text-gray-400 text-xs">Catatan</div><div className="font-medium text-gray-800">{delivery.note || "-"}</div></div>
      </Card>

      <Card className="p-5">
        <SectionTitle title="Item Diajukan" />
        <div className="divide-y divide-gray-50">
          {delivery.items.map((i, idx) => (
            <div key={idx} className="py-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-700 flex items-center gap-2">
                  {i.material}
                  {i.type === "tool" && <span className="text-[10px] font-semibold uppercase tracking-wide text-indigo-600 bg-indigo-50 rounded-full px-2 py-0.5">Alat · Pinjam</span>}
                  {i.type === "consumable" && <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-600 bg-amber-50 rounded-full px-2 py-0.5">Consumable</span>}
                </span>
                <span className="font-medium text-gray-800">Qty {i.qty}</span>
              </div>
              {i.serials?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {i.serials.map((sn) => {
                    const snStatus = i.serialStatuses?.[sn];
                    const badgeClass = snStatus === "Checked Out" ? "bg-indigo-50 text-indigo-700"
                      : snStatus === "Installed" ? "bg-emerald-100 text-emerald-800"
                      : snStatus === "Delivered" ? "bg-amber-50 text-amber-700"
                      : snStatus ? "bg-emerald-50 text-emerald-700"
                      : "bg-gray-50 text-gray-500";
                    return (
                      <span key={sn} className={`text-xs rounded-full px-2 py-0.5 ${badgeClass}`}>
                        {sn}{snStatus ? ` · ${snStatus}` : ""}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {canAssignStock && serializedItems.length > 0 && (
        <Card className="p-5 space-y-5">
          <SectionTitle title="Pilih Serial Number" subtitle="Material atau alat serialized wajib dipilih unitnya sebelum stock bisa direservasi" />
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

      {canShip && (
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <SectionTitle title="Dokumentasi Pengiriman" subtitle="Wajib lengkap sebelum status bisa diubah ke Shipped" />
            <div className="text-xs text-gray-500 shrink-0">{docsCompleted} / {docsTotal} lengkap</div>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden -mt-2">
            <div className="h-full bg-emerald-700 transition-all" style={{ width: `${(docsCompleted / docsTotal) * 100}%` }} />
          </div>

          <PhotoUpload label="Foto Seluruh Material" value={docOverall} onChange={setDocOverall} />
          <PhotoUpload label="Foto Setelah Packing" value={docAfterPacking} onChange={setDocAfterPacking} />

          {allShipmentSerials.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-gray-50">
              <div className="text-sm font-semibold text-gray-800">Foto per Serial Number</div>
              {delivery.items.filter((i) => i.serials?.length > 0).map((item) => (
                <div key={item.material} className="space-y-1.5">
                  <div className="text-xs text-gray-500">{item.material}</div>
                  {item.serials.map((sn) => (
                    <div key={sn} className="flex items-center gap-2">
                      <span className="text-xs text-gray-600 flex-1">{sn}</span>
                      <PhotoUpload compact value={serialPhotos[sn]} onChange={(v) => setSerialPhotos((prev) => ({ ...prev, [sn]: v }))} />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {shipError && <div className="bg-red-50 border border-red-100 text-red-700 text-xs rounded-lg px-3 py-2">{shipError}</div>}
        </Card>
      )}

      {canApprove && (
        <Card className="p-5">
          {showRejectInput ? (
            <div className="space-y-3">
              <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Jelaskan alasan penolakan..." rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-emerald-600" />
              <div className="flex justify-end gap-2">
                <GhostButton onClick={() => { setShowRejectInput(false); setRejectReason(""); }}>Batal</GhostButton>
                <DangerButton onClick={() => rejectReason.trim() && onReject(delivery.id, rejectReason)}>Kirim Penolakan</DangerButton>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">Tinjau permintaan ini berdasarkan jumlah yang diajukan dan tentukan persetujuan.</div>
              <div className="flex gap-2">
                <DangerButton onClick={() => setShowRejectInput(true)}><X size={15} /> Reject</DangerButton>
                <PrimaryButton onClick={handleApprove} disabled={approving}>
                  <Check size={15} /> {approving ? "Memproses..." : "Approve"}
                </PrimaryButton>
              </div>
            </div>
          )}
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

      {canShip && (
        <Card className="p-5 flex items-center justify-between">
          <div className="text-sm text-gray-600">Lengkapi dokumentasi di atas, lalu tandai barang sudah dikirim.</div>
          <PrimaryButton onClick={() => setConfirmShip(true)} disabled={!shipValid || shipping}>
            <Check size={15} /> {shipping ? "Memproses..." : "Tandai Sudah Dikirim"}
          </PrimaryButton>
        </Card>
      )}


      {canAdvance && (
        <Card className="p-5 space-y-4">
          <SectionTitle title="Bukti Penerimaan Barang" subtitle="Wajib lengkap sebelum status bisa diubah ke Delivered" />
          <PhotoUpload label="Foto Bukti Diterima Tim" value={deliveredPhoto} onChange={setDeliveredPhoto} />
          <div>
            <label className="text-xs font-medium text-gray-500">Diterima oleh <span className="text-gray-400 font-normal">(opsional)</span></label>
            <input value={receivedBy} onChange={(e) => setReceivedBy(e.target.value)} placeholder="Nama penerima di lapangan" className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-600" />
          </div>
          {advanceError && <div className="bg-red-50 border border-red-100 text-red-700 text-xs rounded-lg px-3 py-2">{advanceError}</div>}
          <div className="flex items-center justify-between pt-2 border-t border-gray-50">
            <div className="text-sm text-gray-600">Ubah status pengiriman ke "Delivered".</div>
            <PrimaryButton onClick={() => setConfirmAdvance(true)} disabled={!deliveredValid || advancing}>
              {advancing ? "Memproses..." : "Set: Delivered"}
            </PrimaryButton>
          </div>
        </Card>
      )}

      {["Shipped", "Delivered"].includes(delivery.status) && (
        <Card className="p-5 space-y-4">
          <SectionTitle title="Dokumentasi & Resi" />

          <div>
            <div className="text-xs font-medium text-gray-500 mb-2">Dokumentasi Pengiriman</div>
            {(delivery.docOverall || delivery.docAfterPacking) ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {delivery.docOverall && (
                  <div>
                    <PhotoThumb src={delivery.docOverall} alt="Foto keseluruhan" className="w-full h-24 object-cover rounded-lg border border-gray-100" onOpen={setLightboxSrc} />
                    <div className="text-xs text-gray-400 mt-1">Foto keseluruhan</div>
                  </div>
                )}
                {delivery.docAfterPacking && (
                  <div>
                    <PhotoThumb src={delivery.docAfterPacking} alt="Foto setelah packing" className="w-full h-24 object-cover rounded-lg border border-gray-100" onOpen={setLightboxSrc} />
                    <div className="text-xs text-gray-400 mt-1">Setelah packing</div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-gray-400 italic bg-gray-50 rounded-lg px-3 py-2">Tidak tersedia — dikirim sebelum fitur dokumentasi pengiriman aktif</div>
            )}
          </div>

          {delivery.items.some((i) => i.serials?.length > 0) && (
            <div>
              <div className="text-xs font-medium text-gray-500 mb-2">Foto per Serial Number</div>
              {delivery.serialPhotos && Object.keys(delivery.serialPhotos).length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {delivery.items.filter((i) => i.serials?.length > 0).flatMap((item) =>
                    item.serials.filter((sn) => delivery.serialPhotos[sn]).map((sn) => (
                      <div key={sn}>
                        <PhotoThumb src={delivery.serialPhotos[sn]} alt={sn} className="w-full h-24 object-cover rounded-lg border border-gray-100" onOpen={setLightboxSrc} />
                        <div className="text-xs text-gray-400 mt-1 truncate">{sn}</div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="text-xs text-gray-400 italic bg-gray-50 rounded-lg px-3 py-2">Tidak tersedia — dikirim sebelum fitur dokumentasi pengiriman aktif</div>
              )}
            </div>
          )}

          <div className="pt-2 border-t border-gray-50 space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Resi: <span className="font-medium text-gray-800">{delivery.resiNumber || (delivery.resiPhoto ? "(nomor belum diisi)" : "Belum tersedia (optional)")}</span>
              </div>
              {canEditResi && !showResiInput && (
                <GhostButton onClick={() => { setResiInput(delivery.resiNumber || ""); setResiPhotoInput(delivery.resiPhoto || ""); setShowResiInput(true); }}>
                  {hasResi ? "Edit Resi" : "+ Tambah Resi"}
                </GhostButton>
              )}
            </div>

            {delivery.resiPhoto && !showResiInput && (
              <div className="w-32">
                <PhotoThumb src={delivery.resiPhoto} alt="Foto resi" className="w-full h-24 object-cover rounded-lg border border-gray-100" onOpen={setLightboxSrc} />
                <div className="text-xs text-gray-400 mt-1">Foto resi</div>
              </div>
            )}

            {showResiInput && (
              <div className="space-y-3 pt-1">
                <input value={resiInput} onChange={(e) => setResiInput(e.target.value)} placeholder="Nomor resi (opsional jika ada foto)..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-600" />
                <PhotoUpload label="Foto Resi" value={resiPhotoInput} onChange={setResiPhotoInput} />
                <div className="flex justify-end gap-2">
                  <GhostButton onClick={() => { setShowResiInput(false); setResiInput(""); setResiPhotoInput(""); }}>Batal</GhostButton>
                  <PrimaryButton
                    disabled={!resiInput.trim() && !resiPhotoInput}
                    onClick={() => {
                      onAddResi(delivery.id, { resiNumber: resiInput.trim() || undefined, resiPhoto: resiPhotoInput || undefined });
                      setShowResiInput(false); setResiInput(""); setResiPhotoInput("");
                    }}
                  >
                    Simpan
                  </PrimaryButton>
                </div>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-gray-50 space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                BAST: <span className="font-medium text-gray-800">{delivery.bastDocument ? (delivery.bastFilename || "Dokumen terupload") : "Belum tersedia (optional)"}</span>
              </div>
              {canEditBast && !showBastInput && (
                <GhostButton onClick={() => { setBastInput(delivery.bastDocument || ""); setBastNameInput(delivery.bastFilename || ""); setShowBastInput(true); }}>
                  {delivery.bastDocument ? "Ganti BAST" : "+ Upload BAST"}
                </GhostButton>
              )}
            </div>

            {delivery.bastDocument && !showBastInput && (
              <div className="w-32">
                {delivery.bastDocument.startsWith("data:image/") ? (
                  <PhotoThumb src={delivery.bastDocument} alt="Dokumen BAST" className="w-full h-24 object-cover rounded-lg border border-gray-100" onOpen={setLightboxSrc} />
                ) : (
                  <button onClick={() => openDataUrlInNewTab(delivery.bastDocument)} className="flex flex-col items-center justify-center gap-1.5 w-full h-24 rounded-lg border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors">
                    <FileText size={22} className="text-gray-400" />
                    <span className="text-xs text-gray-500 px-2 truncate max-w-full">{delivery.bastFilename || "Lihat PDF"}</span>
                  </button>
                )}
              </div>
            )}

            {showBastInput && (
              <div className="space-y-3 pt-1">
                <DocumentUpload label="Upload Dokumen BAST" value={bastInput} valueName={bastNameInput} onChange={(v, name) => { setBastInput(v); setBastNameInput(name); }} />
                <div className="flex justify-end gap-2">
                  <GhostButton onClick={() => { setShowBastInput(false); setBastInput(""); setBastNameInput(""); }}>Batal</GhostButton>
                  <PrimaryButton
                    disabled={!bastInput}
                    onClick={() => {
                      onAddBast(delivery.id, { bastDocument: bastInput, bastFilename: bastNameInput });
                      setShowBastInput(false); setBastInput(""); setBastNameInput("");
                    }}
                  >
                    Simpan
                  </PrimaryButton>
                </div>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-gray-50 space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                BKB / Surat Jalan: <span className="font-medium text-gray-800">{delivery.bkbLink ? "Link tersimpan" : "Belum tersedia (optional)"}</span>
              </div>
              {canEditBast && !showBkbInput && (
                <GhostButton onClick={() => { setBkbInput(delivery.bkbLink || ""); setShowBkbInput(true); }}>
                  {delivery.bkbLink ? "Ganti Link" : "+ Tambah Link BKB"}
                </GhostButton>
              )}
            </div>

            {delivery.bkbLink && !showBkbInput && (
              <a href={delivery.bkbLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs text-emerald-800 font-medium hover:underline">
                <FileText size={13} /> Buka BKB / Surat Jalan
              </a>
            )}

            {showBkbInput && (
              <div className="space-y-3 pt-1">
                <input
                  value={bkbInput}
                  onChange={(e) => setBkbInput(e.target.value)}
                  placeholder="https://... (link ke BKB / Surat Jalan di sistem lain)"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-600"
                />
                <div className="flex justify-end gap-2">
                  <GhostButton onClick={() => { setShowBkbInput(false); setBkbInput(""); }}>Batal</GhostButton>
                  <PrimaryButton
                    disabled={!bkbInput.trim()}
                    onClick={() => {
                      onAddBkbLink(delivery.id, bkbInput.trim());
                      setShowBkbInput(false); setBkbInput("");
                    }}
                  >
                    Simpan
                  </PrimaryButton>
                </div>
              </div>
            )}
          </div>

          {delivery.status === "Delivered" && (
            <div className="pt-2 border-t border-gray-50 space-y-2">
              <div className="text-xs font-medium text-gray-500">Bukti Penerimaan</div>
              {delivery.deliveredPhoto ? (
                <div className="w-32">
                  <PhotoThumb src={delivery.deliveredPhoto} alt="Bukti diterima" className="w-full h-24 object-cover rounded-lg border border-gray-100" onOpen={setLightboxSrc} />
                </div>
              ) : (
                <div className="text-xs text-gray-400 italic bg-gray-50 rounded-lg px-3 py-2">Tidak tersedia — diterima sebelum fitur bukti penerimaan aktif</div>
              )}
              {delivery.receivedBy && <div className="text-sm text-gray-600">Diterima oleh: <span className="font-medium text-gray-800">{delivery.receivedBy}</span></div>}
            </div>
          )}
        </Card>
      )}

      <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />

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
        open={confirmShip}
        title="Tandai Sudah Dikirim"
        message={`Dokumentasi pengiriman untuk ${delivery.id} sudah lengkap (${docsCompleted}/${docsTotal}). Tandai status jadi "Shipped"?`}
        confirmLabel="Ya, Sudah Dikirim"
        onConfirm={() => { setConfirmShip(false); handleShip(); }}
        onCancel={() => setConfirmShip(false)}
      />

      <ConfirmDialog
        open={confirmAdvance}
        title={'Set status ke "Delivered"'}
        message={`Ubah status pengiriman ${delivery.id} menjadi "Delivered"? Aksi ini tidak bisa dibatalkan.`}
        confirmLabel="Ya, Ubah Status"
        onConfirm={() => { setConfirmAdvance(false); handleAdvance(); }}
        onCancel={() => setConfirmAdvance(false)}
      />

      {canReturnTools && (
        <Card className="p-5 space-y-4 border-indigo-100 bg-indigo-50/20">
          <SectionTitle title="Kembalikan Alat" subtitle="Alat berikut masih dipinjam pada request ini — bisa dikembalikan sebagian atau sekaligus, kapan saja" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {delivery.outstandingTools.map(({ tool, sn }) => {
              const checked = selectedReturns.has(sn);
              return (
                <label key={sn} className={`flex items-center gap-2 text-xs border rounded-lg px-2.5 py-2 cursor-pointer ${checked ? "border-indigo-300 bg-indigo-50" : "border-gray-200 bg-white"}`}>
                  <input type="checkbox" checked={checked} onChange={() => toggleReturnSn(sn)} className="accent-indigo-700" />
                  <span className="truncate"><span className="font-medium">{sn}</span> <span className="text-gray-400">({tool})</span></span>
                </label>
              );
            })}
          </div>
          <div className="flex gap-3">
            {["Baik", "Rusak"].map((c) => (
              <button key={c} onClick={() => setReturnCondition(c)} className={`px-4 py-2 rounded-lg text-sm font-medium border ${returnCondition === c ? (c === "Baik" ? "bg-emerald-800 text-white border-emerald-800" : "bg-red-600 text-white border-red-600") : "border-gray-200 text-gray-600 bg-white"}`}>
                {c === "Baik" ? "Kondisi Baik" : "Rusak / Perlu Perbaikan"}
              </button>
            ))}
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">Catatan <span className="text-gray-400 font-normal">(opsional)</span></label>
            <input value={returnNote} onChange={(e) => setReturnNote(e.target.value)} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-600" />
          </div>
          <PhotoUpload label="Foto Kondisi Alat (opsional)" value={returnPhoto} onChange={setReturnPhoto} />
          <div className="flex justify-end pt-2 border-t border-indigo-100">
            <PrimaryButton onClick={() => setConfirmReturnTools(true)} disabled={selectedReturns.size === 0 || returningTools}>
              {returningTools ? "Memproses..." : `Kembalikan ${selectedReturns.size || ""} Unit`}
            </PrimaryButton>
          </div>
        </Card>
      )}

      <ConfirmDialog
        open={confirmReturnTools}
        title="Kembalikan Alat"
        message={`Tandai ${selectedReturns.size} unit alat sebagai dikembalikan dengan kondisi "${returnCondition}"?`}
        confirmLabel="Ya, Kembalikan"
        onConfirm={() => { setConfirmReturnTools(false); handleReturnTools(); }}
        onCancel={() => setConfirmReturnTools(false)}
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

function GoodsReceiptForm({ materials, onSubmit, onCancel, showToast, currentUser, customers }) {
  const [material, setMaterial] = useState("");
  const [serials, setSerials] = useState([""]);
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  const [customer, setCustomer] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkText, setBulkText] = useState("");

  // Manager has no fixed division and must pick one explicitly; someone
  // covering just one division is pinned to it automatically — no choice to
  // make (and no way to accidentally credit someone else's stock). Someone
  // covering more than one division (e.g. staff handling two customers)
  // must pick which one this particular receipt is for, same as Manager.
  const isManager = currentUser?.role === ROLES.MANAGER;
  const myDivisions = currentUser?.customers || [];
  const needsDivisionPicker = isManager || myDivisions.length > 1;
  const effectiveCustomer = needsDivisionPicker ? customer : myDivisions[0];
  const divisionOptions = isManager ? customers.filter((c) => c.status === "Active").map((c) => c.name) : myDivisions;

  const mat = materials.find((m) => m.name === material);

  const addSN = () => setSerials([...serials, ""]);
  const updateSN = (i, val) => setSerials(serials.map((s, idx) => (idx === i ? val : s)));
  const removeSN = (i) => setSerials(serials.filter((_, idx) => idx !== i));

  // Splits on newline, comma, semicolon, or tab — covers pasting straight
  // out of Excel (one SN per row) or a comma-separated list either way.
  const bulkSerials = bulkText.split(/[\n,;\t]+/).map((s) => s.trim()).filter(Boolean);

  const trimmedSerials = bulkMode ? bulkSerials : serials.map((s) => s.trim()).filter(Boolean);
  const hasDuplicates = new Set(trimmedSerials).size !== trimmedSerials.length;
  const valid = mat && !!effectiveCustomer && (mat.serialized ? trimmedSerials.length > 0 && !hasDuplicates : qty > 0);

  const submit = async () => {
    setSaving(true); setError("");
    const submittedMaterial = material;
    const submittedQty = mat.serialized ? trimmedSerials.length : qty;
    try {
      const payload = mat.serialized ? { material, serials: trimmedSerials, note } : { material, qty, note };
      if (needsDivisionPicker) payload.customer = customer;
      await onSubmit(payload);
      showToast(`Berhasil menerima ${submittedQty} unit ${submittedMaterial}`);
      // Reset fields for the next entry, but keep the form open.
      setMaterial(""); setSerials([""]); setQty(1); setNote(""); setBulkText("");
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
          <select value={material} onChange={(e) => { setMaterial(e.target.value); setSerials([""]); setBulkText(""); }} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-600">
            <option value="">Pilih material...</option>
            {materials.filter((m) => m.status === "Active").map((m) => <option key={m.id} value={m.name}>{m.name} {m.serialized ? "(Serialized)" : ""}</option>)}
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500">Divisi (Customer) <span className="text-red-500">*</span></label>
          {needsDivisionPicker ? (
            <select value={customer} onChange={(e) => setCustomer(e.target.value)} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-600">
              <option value="">Pilih divisi tujuan...</option>
              {divisionOptions.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          ) : (
            <div className="mt-1 w-full border border-gray-100 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-600">{myDivisions[0] || "—"}</div>
          )}
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
            <div className="flex items-center gap-3">
              {!bulkMode && <button onClick={addSN} className="text-xs text-emerald-800 font-medium flex items-center gap-1"><Plus size={14} /> Add SN</button>}
              <button
                onClick={() => { setBulkMode(!bulkMode); setSerials([""]); setBulkText(""); }}
                className="text-xs text-gray-500 font-medium underline decoration-dotted"
              >
                {bulkMode ? "Input satu-satu" : "Tempel banyak SN sekaligus"}
              </button>
            </div>
          </div>

          {bulkMode ? (
            <div className="space-y-1.5">
              <textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder={"Tempel daftar Serial Number di sini, satu per baris.\nContoh:\nSN00123456\nSN00123457\nSN00123458"}
                rows={8}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-600 font-mono"
              />
              <div className="text-xs text-gray-400">Bisa langsung copy-paste dari Excel/spreadsheet (satu SN per baris, atau dipisah koma) — {trimmedSerials.length} SN terdeteksi.</div>
            </div>
          ) : (
            serials.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-5">{i + 1}.</span>
                <input value={s} onChange={(e) => updateSN(i, e.target.value)} placeholder="Masukkan Serial Number" className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-600" />
                {serials.length > 1 && <button onClick={() => removeSN(i)} className="text-gray-300 hover:text-red-500"><X size={16} /></button>}
              </div>
            ))
          )}
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

function WarehouseStock({ materials, setPage, setMovementFilter, setSerialMaterial, onSubmitReceipt, showToast, clearSerialHighlight, currentUser, customers, role, api }) {
  const [search, setSearch] = useState("");
  const [showReceiptForm, setShowReceiptForm] = useState(false);
  const canReceive = role === ROLES.MANAGER || role === ROLES.LOGISTICS;

  // For anyone scoped to specific divisions, the shared `materials` prop
  // (loaded once for the whole app) includes every material company-wide —
  // fine for the Delivery Request picker where requesting something for
  // the first time is normal, but on THIS page it's just noise: rows for
  // materials their divisions have literally never touched. Fetch a
  // narrower, page-local view instead. Manager keeps seeing everything, as
  // before — they're meant to have the full picture here. Normalized the
  // same way as the shared `materials` prop (min_stock/in_transit ->
  // minStock/transit) — this endpoint returns raw snake_case, so skipping
  // that step silently breaks the table's Total column (NaN).
  const [scopedMaterials, setScopedMaterials] = useState(null);
  React.useEffect(() => {
    if (role === ROLES.MANAGER) return;
    api.getStock(undefined, true)
      .then((rows) => setScopedMaterials(rows.map((m) => ({
        id: m.id, name: m.name, category: m.category, unit: m.unit,
        serialized: !!m.serialized, minStock: m.min_stock ?? m.minStock,
        status: m.status, ready: m.ready, faulty: m.faulty, reserved: m.reserved,
        transit: m.in_transit ?? m.transit,
      }))))
      .catch(() => setScopedMaterials(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  // Optional drill-down to ONE specific division instead of the aggregate
  // (the grand total for Manager, or the summed total across every
  // division a scoped user covers). Reuses the same `customer` override
  // /api/stock already supports for the Delivery Request picker.
  const [divisionFilter, setDivisionFilter] = useState("");
  const divisionOptions = role === ROLES.MANAGER ? customers.filter((c) => c.status === "Active").map((c) => c.name) : (currentUser?.customers || []);
  const [divisionMaterials, setDivisionMaterials] = useState(null);
  React.useEffect(() => {
    if (!divisionFilter) { setDivisionMaterials(null); return; }
    // `true` = onlyWithHistory: hides materials this division has never
    // actually had stock for — otherwise every material company-wide
    // shows up as a row of zeros, which is just noise once drilled into
    // one division. Also normalize here (min_stock/in_transit -> minStock/
    // transit) same as the shared `materials` prop already is, or the
    // table's Total column silently breaks (NaN) reading fields that
    // don't exist under those snake_case names.
    api.getStock(divisionFilter, true)
      .then((rows) => setDivisionMaterials(rows.map((m) => ({
        id: m.id, name: m.name, category: m.category, unit: m.unit,
        serialized: !!m.serialized, minStock: m.min_stock ?? m.minStock,
        status: m.status, ready: m.ready, faulty: m.faulty, reserved: m.reserved,
        transit: m.in_transit ?? m.transit,
      }))))
      .catch(() => setDivisionMaterials(null));
  }, [divisionFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const displayMaterials = divisionFilter && divisionMaterials
    ? divisionMaterials
    : (role === ROLES.MANAGER ? materials : (scopedMaterials || materials));

  const filtered = displayMaterials.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-4 sm:p-8 space-y-5">
      <SectionTitle
        title="Warehouse Stock" subtitle="Ketersediaan material di gudang pusat"
        right={canReceive ? <PrimaryButton onClick={() => setShowReceiptForm(!showReceiptForm)}><Plus size={16} /> Terima Barang</PrimaryButton> : null}
      />

      {showReceiptForm && canReceive && (
        <GoodsReceiptForm
          materials={materials}
          onCancel={() => setShowReceiptForm(false)}
          onSubmit={onSubmitReceipt}
          showToast={showToast}
          currentUser={currentUser}
          customers={customers}
        />
      )}

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2.5 w-80">
          <Search size={16} className="text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari material..." className="bg-transparent text-sm outline-none w-full" />
        </div>
        {divisionOptions.length > 1 && (
          <select value={divisionFilter} onChange={(e) => setDivisionFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none bg-white text-gray-600">
            <option value="">Semua Divisi (Total)</option>
            {divisionOptions.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        )}
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
                      {m.serialized && <button onClick={() => { setSerialMaterial(m.name); clearSerialHighlight?.(); setPage("serialDetail"); }} className="text-emerald-800 text-xs font-medium">Lihat SN</button>}
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

/* Turns a raw reference id (e.g. "DR-260808-005") into a human-readable
   location when it points at a delivery already loaded client-side — "Long
   Payau · Long Pada (DR-260808-005)" is a lot more useful at a glance than
   the bare code, especially for "where is this unit right now" questions. */
function describeRef(ref, deliveries) {
  if (!ref) return "-";
  if (ref.startsWith("DR-") && deliveries) {
    const d = deliveries.find((x) => x.id === ref);
    if (d) return `${d.homebase}${d.site ? ` · ${d.site}` : ""} (${ref})`;
  }
  return ref;
}

function SendToCustomerDialog({ open, mode, serialNumber, onSubmit, onCancel, saving, error }) {
  const [ref, setRef] = useState("");
  const [note, setNote] = useState("");
  React.useEffect(() => { if (open) { setRef(""); setNote(""); } }, [open]);
  if (!open) return null;
  const isSend = mode === "send";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onCancel}>
      <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="text-sm font-semibold text-gray-800">
          {isSend ? "Kirim ke Customer untuk Perbaikan" : "Terima Kembali dari Customer"}
        </div>
        <div className="text-xs text-gray-500">Serial Number: <span className="font-mono font-medium text-gray-700">{serialNumber}</span></div>
        <div>
          <label className="text-sm font-medium text-gray-700">Nomor Surat/BA <span className="text-red-500">*</span></label>
          <input value={ref} onChange={(e) => setRef(e.target.value)} placeholder={isSend ? "mis. BA-OUT-001" : "Nomor surat baru, beda dari saat dikirim"} className="mt-1.5 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-emerald-600" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Catatan <span className="text-gray-400 font-normal">(opsional)</span></label>
          <input value={note} onChange={(e) => setNote(e.target.value)} className="mt-1.5 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-emerald-600" />
        </div>
        {error && <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-lg px-3 py-2">{error}</div>}
        <div className="flex justify-end gap-2 pt-2">
          <GhostButton onClick={onCancel}>Batal</GhostButton>
          <PrimaryButton onClick={() => onSubmit({ ref, note })} disabled={!ref.trim() || saving}>{saving ? "Menyimpan..." : "Simpan"}</PrimaryButton>
        </div>
      </div>
    </div>
  );
}

function MaterialSerialDetail({ material, api, onBack, highlightSerial, highlightToken, deliveries, role, showToast }) {
  const [status, setStatus] = useState("All");
  const [serials, setSerials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [highlighted, setHighlighted] = useState(highlightSerial || null);
  const rowRefs = React.useRef({});
  const canManage = role === ROLES.MANAGER || role === ROLES.LOGISTICS;
  const [dialog, setDialog] = useState(null); // { mode: "send"|"receive", sn }
  const [saving, setSaving] = useState(false);
  const [dialogError, setDialogError] = useState("");

  const reload = () => {
    setLoading(true);
    api.getSerials(material, status === "All" ? undefined : status)
      .then((data) => setSerials(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  React.useEffect(reload, [material, status]); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-sync from the prop on every new search selection — not just on first
  // mount. Without this, clicking a second SN result while already on this
  // page (same material, component never unmounts) silently did nothing,
  // since useState's initial value is only read once.
  React.useEffect(() => {
    if (highlightSerial) setHighlighted(highlightSerial);
  }, [highlightSerial, highlightToken]);

  // Scroll the searched-for SN into view and briefly flash it once the list
  // has actually loaded, so it's obvious which row is the one being looked for.
  React.useEffect(() => {
    if (loading || !highlighted) return;
    const el = rowRefs.current[highlighted];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    const timer = setTimeout(() => setHighlighted(null), 2200);
    return () => clearTimeout(timer);
  }, [loading, highlighted]);

  const filtered = search ? serials.filter((s) => s.sn.toLowerCase().includes(search.toLowerCase())) : serials;
  const statusOptions = ["All", "Ready", "Reserved", "In Transit", "Delivered", "Installed", "Faulty", "Sent to Customer"];

  const submitDialog = async ({ ref, note }) => {
    setSaving(true); setDialogError("");
    try {
      if (dialog.mode === "send") await api.sendSerialToCustomer(dialog.sn, ref, note);
      else await api.receiveSerialFromCustomer(dialog.sn, ref, note);
      showToast(dialog.mode === "send" ? `${dialog.sn} dikirim ke customer` : `${dialog.sn} diterima kembali, status Ready`);
      setDialog(null);
      reload();
    } catch (err) {
      setDialogError(err.message || "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

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
              {canManage && <th className="px-5 py-3 font-medium"></th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4}><div className="py-10 text-center text-sm text-gray-400">Memuat...</div></td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={4}><EmptyState text="Tidak ada Serial Number untuk filter ini." /></td></tr>
            ) : (
              filtered.map((s) => (
                <tr
                  key={s.sn}
                  ref={(el) => { rowRefs.current[s.sn] = el; }}
                  className={`border-b border-gray-50 last:border-0 transition-colors duration-700 ${highlighted === s.sn ? "bg-emerald-100" : ""}`}
                >
                  <td className="px-5 py-3 font-medium text-gray-800">{s.sn}</td>
                  <td className="px-5 py-3"><StatusBadge status={s.status} /></td>
                  <td className="px-5 py-3 text-gray-500 text-xs">{s.current_ref ? describeRef(s.current_ref, deliveries) : (s.received_ref || "-")}</td>
                  {canManage && (
                    <td className="px-5 py-3">
                      {s.status === "Faulty" && (
                        <button onClick={() => setDialog({ mode: "send", sn: s.sn })} className="text-xs font-medium text-emerald-800">Kirim ke Customer</button>
                      )}
                      {s.status === "Sent to Customer" && (
                        <button onClick={() => setDialog({ mode: "receive", sn: s.sn })} className="text-xs font-medium text-emerald-800">Terima Kembali</button>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </Card>

      <SendToCustomerDialog
        open={!!dialog}
        mode={dialog?.mode}
        serialNumber={dialog?.sn}
        onSubmit={submitDialog}
        onCancel={() => { setDialog(null); setDialogError(""); }}
        saving={saving}
        error={dialogError}
      />
    </div>
  );
}

function StockMovement({ movements, filter, setFilter, deliveries }) {
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
                    <td className="px-5 py-3 text-gray-500 text-xs">{m.type === "Delivery" ? describeRef(m.ref, deliveries) : m.ref}</td>
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

/* Very long data: URIs (a base64 PDF can easily be a few MB of text) are
   unreliable to open directly — some browsers cap URL length or refuse to
   render them, showing a blank tab instead of the PDF (exactly what
   happened when opening a BAST PDF this way). Converting to a Blob and
   opening THAT URL instead is what browsers' native PDF viewers expect. */
function openDataUrlInNewTab(dataUrl) {
  try {
    const [header, base64] = dataUrl.split(",");
    const mime = header.match(/data:(.*?);base64/)?.[1] || "application/octet-stream";
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const blob = new Blob([bytes], { type: mime });
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, "_blank");
    // Revoke well after the new tab has had time to load the resource.
    setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
  } catch {
    window.open(dataUrl, "_blank");
  }
}

/* Real photo upload with thumbnail preview - stores a data URL so the checklist
   reflects an actual captured/selected image rather than a plain boolean flag. */
// Phone camera photos routinely come in at several MB each — several of
// those stacked in one request (SN photos + overall + packing) is exactly
// what tipped the earlier "Internal server error" over the body size limit.
// Resizing to a sane max dimension and re-encoding as JPEG keeps photos
// perfectly legible for documentation purposes while cutting them down to
// a few hundred KB, so this is applied before the data URL ever leaves the
// browser — not just a server-side limit increase.
function compressImage(file, maxDimension = 1600, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;
      if (width > maxDimension || height > maxDimension) {
        if (width >= height) { height = Math.round((height / width) * maxDimension); width = maxDimension; }
        else { width = Math.round((width / height) * maxDimension); height = maxDimension; }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error("Gagal memproses gambar")); };
    img.src = objectUrl;
  });
}

function PhotoUpload({ label, value, onChange, compact }) {
  const inputRef = React.useRef(null);
  const [compressing, setCompressing] = useState(false);
  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCompressing(true);
    try {
      const compressed = await compressImage(file);
      onChange(compressed);
    } catch {
      // Fallback: if compression fails for any reason, still let the photo
      // through uncompressed rather than blocking the user entirely.
      const reader = new FileReader();
      reader.onload = () => onChange(reader.result);
      reader.readAsDataURL(file);
    } finally {
      setCompressing(false);
      e.target.value = "";
    }
  };
  if (compact) {
    return (
      <>
        <input ref={inputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />
        <button onClick={() => inputRef.current?.click()} disabled={compressing} className={`px-3 py-2 rounded-lg text-xs font-medium border flex items-center gap-1.5 shrink-0 ${value ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-gray-200 text-gray-400"}`}>
          {value ? <img src={value} alt="" className="w-4 h-4 rounded object-cover" /> : <Camera size={13} />}
          {compressing ? "Memproses..." : value ? "Foto ✓" : "Upload Foto"}
        </button>
      </>
    );
  }
  return (
    <div>
      <input ref={inputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />
      <button onClick={() => inputRef.current?.click()} disabled={compressing} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm text-left transition-colors ${value ? "border-emerald-200 bg-emerald-50/50" : "border-gray-200"}`}>
        {value ? (
          <img src={value} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0" />
        ) : (
          <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0"><Camera size={16} className="text-gray-400" /></div>
        )}
        <span className={value ? "text-gray-800 font-medium" : "text-gray-500"}>{compressing ? "Memproses foto..." : label}</span>
        <span className="ml-auto text-xs text-gray-400">{value ? "Ganti foto" : "Ambil / pilih foto"}</span>
      </button>
    </div>
  );
}

/* Upload for formal documents like BAST — accepts PDF or a scanned photo.
   Images get compressed the same way PhotoUpload does; PDFs are read as-is
   since they can't go through canvas resizing. */
function DocumentUpload({ label, value, valueName, onChange }) {
  const inputRef = React.useRef(null);
  const [processing, setProcessing] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProcessing(true);
    try {
      if (file.type.startsWith("image/")) {
        const compressed = await compressImage(file);
        onChange(compressed, file.name);
      } else {
        const dataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(new Error("Gagal membaca file"));
          reader.readAsDataURL(file);
        });
        onChange(dataUrl, file.name);
      }
    } catch {
      // ignore — user can just retry the upload
    } finally {
      setProcessing(false);
      e.target.value = "";
    }
  };

  return (
    <div>
      <input ref={inputRef} type="file" accept="application/pdf,image/*" className="hidden" onChange={handleFile} />
      <button onClick={() => inputRef.current?.click()} disabled={processing} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm text-left transition-colors ${value ? "border-emerald-200 bg-emerald-50/50" : "border-gray-200"}`}>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${value ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-400"}`}>
          <FileText size={16} />
        </div>
        <span className={value ? "text-gray-800 font-medium truncate" : "text-gray-500"}>
          {processing ? "Memproses dokumen..." : value ? (valueName || "Dokumen terupload") : label}
        </span>
        <span className="ml-auto text-xs text-gray-400 shrink-0">{value ? "Ganti" : "Upload PDF / Foto"}</span>
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

function ReturnFaultyCreate({ onSubmit, onCancel, materials, returns, reconciliations, initialData, excludeId, revisionNote, currentUser, customers, prefillItems }) {
  const isEdit = !!initialData;
  const isManager = currentUser?.role === ROLES.MANAGER;
  const myDivisions = currentUser?.customers || [];
  const needsDivisionPicker = isManager || myDivisions.length > 1;
  const divisionOptions = isManager ? customers.filter((c) => c.status === "Active").map((c) => c.name) : myDivisions;
  const [customer, setCustomer] = useState("");
  const [items, setItems] = useState(
    initialData?.items?.length
      ? initialData.items.map((it) => ({ material: it.material, serials: it.serials.map((s) => ({ ...s })) }))
      : prefillItems?.length
      ? prefillItems.map((it) => ({ material: it.material, serials: [{ sn: it.sn, photo: it.photo || "" }] }))
      : [{ material: "", serials: [{ sn: "", photo: "" }] }]
  );
  const [docs, setDocs] = useState(initialData?.docs ? { ...initialData.docs } : { beforePacking: "", afterPacking: "", weighing: "" });

  const addItem = () => setItems([...items, { material: "", serials: [{ sn: "", photo: "" }] }]);
  const removeItem = (itemIdx) => setItems(items.filter((_, i) => i !== itemIdx));
  const updateItem = (itemIdx, field, val) => setItems(items.map((it, i) => (i === itemIdx ? { ...it, [field]: val } : it)));
  const addSN = (itemIdx) => setItems(items.map((it, i) => (i === itemIdx ? { ...it, serials: [...it.serials, { sn: "", photo: "" }] } : it)));
  const updateSN = (itemIdx, snIdx, field, val) => setItems(items.map((it, i) => (i === itemIdx ? { ...it, serials: it.serials.map((s, j) => (j === snIdx ? { ...s, [field]: val } : s)) } : it)));
  const removeSN = (itemIdx, snIdx) => setItems(items.map((it, i) => (i === itemIdx ? { ...it, serials: it.serials.filter((_, j) => j !== snIdx) } : it)));

  const allSerials = items.flatMap((it) => it.serials);
  const docsCompleted = Object.values(docs).filter(Boolean).length + allSerials.filter((s) => s.photo).length;
  const docsTotal = 3 + allSerials.length;
  const allSNFilled = items.every((it) => it.material && it.serials.length > 0 && it.serials.every((s) => s.sn.trim() && s.photo));
  const allSNTrimmed = allSerials.map((s) => s.sn.trim()).filter(Boolean);
  const hasDuplicateSN = new Set(allSNTrimmed).size !== allSNTrimmed.length;
  const conflicts = allSerials.map((s) => ({ sn: s.sn, conflict: findSNConflict(s.sn, { returns, reconciliations, excludeId }) })).filter((c) => c.conflict);
  const valid = items.length > 0 && items.every((it) => it.material) && allSNFilled && !hasDuplicateSN && conflicts.length === 0 && docs.beforePacking && docs.afterPacking && docs.weighing && (isEdit || !needsDivisionPicker || customer);

  // qty is always derived from how many SN rows are filled in — a material
  // can't be submitted with a qty that doesn't match its Serial Numbers,
  // so there's no separate qty field to keep in sync by hand.
  const buildSubmission = () => ({
    items: items.map((it) => ({ material: it.material, qty: it.serials.length, serials: it.serials })),
    docs,
    ...(!isEdit && needsDivisionPicker ? { customer } : {}),
  });

  return (
    <div className="p-4 sm:p-8 max-w-2xl mx-auto space-y-6">
      <SectionTitle
        title={isEdit ? `Perbaiki Return Material Faulty — ${excludeId}` : "Buat Return Material Faulty"}
        subtitle={isEdit ? "Perbarui data sesuai catatan revisi, lalu kirim ulang ke Logistics" : "Input Serial Number secara manual untuk setiap unit — bisa lebih dari satu material"}
      />

      {!isEdit && needsDivisionPicker && (
        <Card className="p-5">
          <label className="text-sm font-medium text-gray-700">Divisi (Customer) <span className="text-red-500">*</span></label>
          <select value={customer} onChange={(e) => setCustomer(e.target.value)} className="mt-1.5 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-emerald-600">
            <option value="">Pilih divisi...</option>
            {divisionOptions.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Card>
      )}

      {isEdit && revisionNote && (
        <Card className="p-4 border-red-200 bg-red-50/50 flex items-start gap-3">
          <AlertTriangle size={18} className="text-red-500 mt-0.5 shrink-0" />
          <div className="text-sm text-red-700"><span className="font-semibold">Catatan revisi dari Logistics: </span>{revisionNote}</div>
        </Card>
      )}

      {!isEdit && prefillItems?.length > 0 && (
        <Card className="p-4 border-emerald-200 bg-emerald-50/50 flex items-start gap-3">
          <Check size={18} className="text-emerald-600 mt-0.5 shrink-0" />
          <div className="text-sm text-emerald-800">Material, Serial Number, dan foto sudah terisi otomatis dari Penggantian Material — lengkapi dokumentasi lain di bawah untuk mengirim.</div>
        </Card>
      )}

      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-gray-800">Material yang Dikembalikan</div>
        <button onClick={addItem} className="text-xs text-emerald-800 font-medium flex items-center gap-1"><Plus size={14} /> Tambah Material</button>
      </div>

      {items.map((item, itemIdx) => (
        <Card key={itemIdx} className="p-6 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Material <span className="text-red-500">*</span></label>
                <select value={item.material} onChange={(e) => updateItem(itemIdx, "material", e.target.value)} className="mt-1.5 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-emerald-600">
                  <option value="">Pilih material...</option>
                  {materials.filter((m) => m.status === "Active").map((m) => <option key={m.id} value={m.name}>{m.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Qty</label>
                <div className="mt-1.5 w-full border border-gray-100 bg-gray-50 rounded-lg px-3 py-2.5 text-sm text-gray-600">
                  {item.serials.length} <span className="text-xs text-gray-400">(mengikuti jumlah SN di bawah)</span>
                </div>
              </div>
            </div>
            {items.length > 1 && (
              <button onClick={() => removeItem(itemIdx)} className="text-gray-300 hover:text-red-500 mt-6" title="Hapus material ini"><X size={18} /></button>
            )}
          </div>

          <div className="space-y-3 pt-3 border-t border-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-gray-800">Serial Number (Input Manual)</div>
              <button onClick={() => addSN(itemIdx)} className="text-xs text-emerald-800 font-medium flex items-center gap-1"><Plus size={14} /> Add SN</button>
            </div>
            {item.serials.map((s, snIdx) => {
              const conflict = findSNConflict(s.sn, { returns, reconciliations, excludeId });
              return (
                <div key={snIdx} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 w-5">{snIdx + 1}.</span>
                    <input value={s.sn} onChange={(e) => updateSN(itemIdx, snIdx, "sn", e.target.value)} placeholder="Masukkan Serial Number" className={`flex-1 border rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-600 ${conflict ? "border-red-300" : "border-gray-200"}`} />
                    <PhotoUpload compact value={s.photo} onChange={(val) => updateSN(itemIdx, snIdx, "photo", val)} />
                    {item.serials.length > 1 && <button onClick={() => removeSN(itemIdx, snIdx)} className="text-gray-300 hover:text-red-500"><X size={16} /></button>}
                  </div>
                  {conflict && <div className="text-xs text-red-600 pl-7">Serial Number ini sedang digunakan pada {conflict}.</div>}
                </div>
              );
            })}
          </div>
        </Card>
      ))}

      {hasDuplicateSN && <div className="text-xs text-red-600 -mt-2">Terdapat Serial Number duplikat dalam transaksi ini.</div>}

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
        <PrimaryButton disabled={!valid} onClick={() => onSubmit(buildSubmission())}>
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
  const [resiPhotoInput, setResiPhotoInput] = useState("");
  const [showResiInput, setShowResiInput] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState(null);

  const canReview = (role === ROLES.LOGISTICS || role === ROLES.MANAGER) && r.status === "Waiting Logistics Review";
  const canShip = role === ROLES.TECH && r.status === "Ready to Ship";
  const canEdit = role === ROLES.TECH && r.status === "Revision Required";
  const canEditResi = role === ROLES.TECH && ["On Delivery", "Received by Warehouse", "QC Checking"].includes(r.status);
  const hasResi = !!(r.resiNumber || r.resiPhoto);
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
                  {typeof s.photo === "string" && s.photo ? (
                    <PhotoThumb src={s.photo} alt={s.sn} className="w-7 h-7 rounded object-cover" onOpen={setLightboxSrc} />
                  ) : (
                    <div className="w-7 h-7 rounded bg-gray-200" />
                  )}
                  <span className="text-gray-600 flex-1">{s.sn}</span>
                  <span className={s.photo ? "text-emerald-600" : "text-red-500"}>{s.photo ? "Foto ✓" : "Foto belum ada"}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </Card>

      {(r.docs.beforePacking || r.docs.afterPacking || r.docs.weighing) && (
        <Card className="p-5">
          <SectionTitle title="Dokumentasi Foto" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {r.docs.beforePacking && (
              <div>
                <PhotoThumb src={r.docs.beforePacking} alt="Sebelum packing" className="w-full h-24 object-cover rounded-lg border border-gray-100" onOpen={setLightboxSrc} />
                <div className="text-xs text-gray-400 mt-1">Sebelum packing</div>
              </div>
            )}
            {r.docs.afterPacking && (
              <div>
                <PhotoThumb src={r.docs.afterPacking} alt="Setelah packing" className="w-full h-24 object-cover rounded-lg border border-gray-100" onOpen={setLightboxSrc} />
                <div className="text-xs text-gray-400 mt-1">Setelah packing</div>
              </div>
            )}
            {r.docs.weighing && (
              <div>
                <PhotoThumb src={r.docs.weighing} alt="Packing + timbangan" className="w-full h-24 object-cover rounded-lg border border-gray-100" onOpen={setLightboxSrc} />
                <div className="text-xs text-gray-400 mt-1">Packing + timbangan</div>
              </div>
            )}
          </div>
        </Card>
      )}

      <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />

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
          <div className="pt-2 border-t border-gray-50 mt-2 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Resi: <span className="font-medium text-gray-800">{r.resiNumber || (r.resiPhoto ? "(nomor belum diisi)" : "Belum tersedia (optional)")}</span>
              </span>
              {canEditResi && !showResiInput && (
                <GhostButton onClick={() => { setResiInput(r.resiNumber || ""); setResiPhotoInput(r.resiPhoto || ""); setShowResiInput(true); }}>
                  {hasResi ? "Edit Resi" : "+ Tambah Resi"}
                </GhostButton>
              )}
            </div>

            {r.resiPhoto && !showResiInput && (
              <div className="w-32">
                <PhotoThumb src={r.resiPhoto} alt="Foto resi" className="w-full h-24 object-cover rounded-lg border border-gray-100" onOpen={setLightboxSrc} />
                <div className="text-xs text-gray-400 mt-1">Foto resi</div>
              </div>
            )}

            {showResiInput && (
              <div className="space-y-3 pt-1">
                <input value={resiInput} onChange={(e) => setResiInput(e.target.value)} placeholder="Nomor resi (opsional jika ada foto)..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-600" />
                <PhotoUpload label="Foto Resi" value={resiPhotoInput} onChange={setResiPhotoInput} />
                <div className="flex justify-end gap-2">
                  <GhostButton onClick={() => { setShowResiInput(false); setResiInput(""); setResiPhotoInput(""); }}>Batal</GhostButton>
                  <PrimaryButton
                    disabled={!resiInput.trim() && !resiPhotoInput}
                    onClick={() => {
                      onAddResi(r.id, { resiNumber: resiInput.trim() || undefined, resiPhoto: resiPhotoInput || undefined });
                      setShowResiInput(false); setResiInput(""); setResiPhotoInput("");
                    }}
                  >
                    Simpan
                  </PrimaryButton>
                </div>
              </div>
            )}
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

function ReconciliationCreate({ onSubmit, onCancel, materials, returns, reconciliations, homebases, initialData, excludeId, revisionNote, currentUser, customers }) {
  const isEdit = !!initialData;
  const isManager = currentUser?.role === ROLES.MANAGER;
  const myDivisions = currentUser?.customers || [];
  const needsDivisionPicker = isManager || myDivisions.length > 1;
  const divisionOptions = isManager ? customers.filter((c) => c.status === "Active").map((c) => c.name) : myDivisions;
  const [customer, setCustomer] = useState("");
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
  const valid = homebase && snConflicts.length === 0 && rows.every((r) => r.photo && (r.systemQty === r.actualQty || r.reason.trim()) && (!r.serialized || r.serials.every((s) => s.trim()))) && (isEdit || !needsDivisionPicker || customer);

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
        {!isEdit && needsDivisionPicker && (
          <div>
            <label className="text-sm font-medium text-gray-700">Divisi (Customer) <span className="text-red-500">*</span></label>
            <select value={customer} onChange={(e) => setCustomer(e.target.value)} className="mt-1.5 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-emerald-600">
              <option value="">Pilih divisi...</option>
              {divisionOptions.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Homebase <span className="text-red-500">*</span></label>
            <select value={homebase} onChange={(e) => setHomebase(e.target.value)} disabled={isEdit} className="mt-1.5 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-emerald-600 disabled:bg-gray-50 disabled:text-gray-500">
              <option value="">Pilih homebase...</option>
              {homebases.filter((h) => h.status === "Active").map((h) => <option key={h.code} value={h.name}>{h.name}</option>)}
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
        <PrimaryButton disabled={!valid} onClick={() => onSubmit({ homebase, period, items: rows, ...(!isEdit && needsDivisionPicker ? { customer } : {}) })}>
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
   PENGGANTIAN MATERIAL (Material Swap)
   Swaps a faulty Installed unit at a site for a new one: new unit becomes
   Installed at the same site, old unit becomes Faulty and is ready to be
   picked up in a normal Return Material Faulty submission (this doesn't
   replace that flow — it just feeds into it).
   ============================================================ */

function MaterialSwapPage({ swaps, api, materials, sites, homebases, onSubmit, showToast, setPage, setReturnPrefill, setSelectedSwap, role }) {
  const [newSn, setNewSn] = useState("");
  const [homebase, setHomebase] = useState("");
  const [site, setSite] = useState(""); // stores the site CODE, resolved to a name on submit — same pattern as Delivery Request
  const [siteSearch, setSiteSearch] = useState("");
  const [oldSn, setOldSn] = useState("");
  const [oldMaterial, setOldMaterial] = useState("");
  const [note, setNote] = useState("");
  const [photo, setPhoto] = useState("");
  const [oldPhoto, setOldPhoto] = useState("");
  const [newInfo, setNewInfo] = useState(undefined); // undefined = not checked, null = invalid, object = valid
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [lastSwap, setLastSwap] = useState(null);
  const [confirmSubmit, setConfirmSubmit] = useState(false);

  const hb = homebases.find((h) => h.name === homebase);
  const siteOptions = sites.filter((s) =>
    s.homebase === homebase && s.status === "Active" &&
    (s.name.toLowerCase().includes(siteSearch.toLowerCase()) || s.code.toLowerCase().includes(siteSearch.toLowerCase()) || s.terminalId.toLowerCase().includes(siteSearch.toLowerCase()))
  );

  // Only the unit being INSTALLED needs to be a known, tracked unit — it
  // must already exist in the system with status Delivered, so this is a
  // real browsable list. The old/faulty unit being removed is NOT looked
  // up here — it may never have been tracked at all (predates the system,
  // or was never a proper Delivery Request), so it's free text instead.
  const [deliveredOptions, setDeliveredOptions] = useState([]);
  const [newFocused, setNewFocused] = useState(false);

  const loadDeliveredOptions = () => api.getSerials(undefined, "Delivered").then(setDeliveredOptions).catch(() => {});
  React.useEffect(() => { loadDeliveredOptions(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const filterOptions = (list, query) => {
    const q = query.trim().toLowerCase();
    const matches = q ? list.filter((r) => r.sn.toLowerCase().includes(q) || r.material.toLowerCase().includes(q)) : list;
    return matches.slice(0, 8);
  };

  React.useEffect(() => {
    const trimmed = newSn.trim();
    if (!trimmed) { setNewInfo(undefined); return; }
    const t = setTimeout(async () => {
      try {
        const results = await api.searchSerials(trimmed);
        const exact = results.find((r) => r.sn === trimmed);
        setNewInfo(exact ? { ...exact, ok: exact.status === "Delivered" } : null);
      } catch {
        setNewInfo(null);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [newSn]); // eslint-disable-line react-hooks/exhaustive-deps

  // Old material choices are narrowed to the SAME category as the unit
  // being installed (e.g. installing a Modem should only offer other modem
  // variants as the possible old unit) — falls back to the full list until
  // a valid new unit (and therefore a known category) is picked.
  const newMaterialCategory = useMemo(() => {
    if (!newInfo?.ok) return null;
    return materials.find((m) => m.name === newInfo.material)?.category || null;
  }, [newInfo, materials]);
  const oldMaterialOptions = useMemo(() => (
    newMaterialCategory ? materials.filter((m) => m.category === newMaterialCategory) : materials
  ), [newMaterialCategory, materials]);

  React.useEffect(() => {
    // If the category changes (new unit swapped for a different one) and
    // the previously-picked old material no longer fits, clear it so a
    // stale/incompatible choice can't slip through.
    if (oldMaterial && !oldMaterialOptions.some((m) => m.name === oldMaterial)) setOldMaterial("");
  }, [oldMaterialOptions]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedSiteName = sites.find((s) => s.code === site)?.name || "";
  const valid = newInfo?.ok && homebase && site && photo && (!oldSn.trim() || (oldMaterial.trim() && oldPhoto));

  const submit = async () => {
    setSaving(true); setError("");
    try {
      const created = await onSubmit({
        newSn: newSn.trim(), site: selectedSiteName, homebase: homebase || undefined,
        oldSn: oldSn.trim() || undefined, oldMaterial: oldSn.trim() ? oldMaterial.trim() : undefined,
        photo, oldPhoto: oldSn.trim() ? oldPhoto : undefined, note: note || undefined,
      });
      showToast(oldSn.trim() ? `Penggantian ${created.id} berhasil dicatat` : `Instalasi ${created.id} berhasil dicatat`);
      setLastSwap(created);
      setNewSn(""); setSite(""); setSiteSearch(""); setHomebase(""); setOldSn(""); setOldMaterial(""); setNote(""); setPhoto(""); setOldPhoto(""); setNewInfo(undefined);
      loadDeliveredOptions();
    } catch (err) {
      setError(err.message || "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

  const SnDropdown = ({ options, query, onPick }) => {
    const filtered = filterOptions(options, query);
    if (filtered.length === 0) {
      return <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-xs text-gray-400">Tidak ada unit Delivered yang cocok.</div>;
    }
    return (
      <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-y-auto">
        {filtered.map((opt) => (
          <button
            key={opt.sn}
            onMouseDown={(e) => { e.preventDefault(); onPick(opt.sn); }}
            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center justify-between gap-2 border-b border-gray-50 last:border-0"
          >
            <span className="font-medium text-gray-800">{opt.sn}</span>
            <span className="text-xs text-gray-400 truncate">{opt.material}</span>
          </button>
        ))}
      </div>
    );
  };

  const canSubmit = role === ROLES.TECH || role === ROLES.LOGISTICS || role === ROLES.MANAGER;

  return (
    <div className="p-4 sm:p-8 space-y-5">
      <SectionTitle title="Penggantian Material" subtitle={canSubmit ? "Konfirmasi unit yang dipasang di site — isi unit lama hanya jika ini penggantian karena rusak" : "Riwayat instalasi & penggantian material"} />

      {canSubmit && lastSwap && lastSwap.oldSn && (
        <Card className="p-4 border-emerald-200 bg-emerald-50/50 flex items-center justify-between">
          <div className="text-sm text-emerald-800">
            <span className="font-semibold">{lastSwap.id}</span> — unit lama ({lastSwap.oldSn}) sudah dicatat. Lanjutkan buat laporan Return Material Faulty untuk unit ini?
          </div>
          <PrimaryButton onClick={() => { setReturnPrefill({ material: lastSwap.oldMaterial, sn: lastSwap.oldSn, photo: lastSwap.oldPhoto }); setPage("returnFaultyCreate"); }}>
            Buat Return Faulty
          </PrimaryButton>
        </Card>
      )}

      {canSubmit && (
      <>
      <Card className="p-6 space-y-4 max-w-2xl">
        <div className="text-sm font-semibold text-gray-800">Unit yang Dipasang</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <label className="text-sm font-medium text-gray-700">Serial Number (Installed) <span className="text-red-500">*</span></label>
            <input
              value={newSn}
              onChange={(e) => setNewSn(e.target.value)}
              onFocus={() => setNewFocused(true)}
              onBlur={() => setTimeout(() => setNewFocused(false), 150)}
              placeholder="Cari atau pilih unit yang sudah Delivered..."
              className="mt-1.5 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-emerald-600"
            />
            {newFocused && <SnDropdown options={deliveredOptions} query={newSn} onPick={(sn) => { setNewSn(sn); setNewFocused(false); }} />}
            {newInfo === null && <div className="text-xs text-red-600 mt-1">Serial Number tidak ditemukan di sistem.</div>}
            {newInfo && !newInfo.ok && <div className="text-xs text-red-600 mt-1">{newInfo.material} — status saat ini <span className="font-medium">{newInfo.status}</span>, harus Delivered.</div>}
            {newInfo?.ok && <div className="text-xs text-emerald-700 mt-1">✓ {newInfo.material} — Delivered</div>}
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Homebase <span className="text-red-500">*</span></label>
            <select value={homebase} onChange={(e) => { setHomebase(e.target.value); setSite(""); setSiteSearch(""); }} className="mt-1.5 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-emerald-600">
              <option value="">Pilih homebase...</option>
              {homebases.filter((h) => h.status === "Active").map((h) => <option key={h.code} value={h.name}>{h.name} — {h.area}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Site <span className="text-red-500">*</span></label>
          <div className="relative mt-1.5">
            <input
              disabled={!homebase}
              value={site ? selectedSiteName : siteSearch}
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
        <PhotoUpload label="Foto Bukti Material Terpasang" value={photo} onChange={setPhoto} />
      </Card>

      <Card className="p-6 space-y-4 max-w-2xl">
        <div>
          <div className="text-sm font-semibold text-gray-800 mb-1">Unit Lama / Faulty yang Dicabut</div>
          <div className="text-xs text-gray-400">Isi hanya jika ini penggantian — unit ini boleh belum pernah tercatat di sistem, cukup tulis manual.</div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Serial Number Lama</label>
            <input value={oldSn} onChange={(e) => setOldSn(e.target.value)} placeholder="SN unit yang dicabut (tulis manual)" className="mt-1.5 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-emerald-600" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Jenis Material Lama {oldSn.trim() && <span className="text-red-500">*</span>}</label>
            <select value={oldMaterial} onChange={(e) => setOldMaterial(e.target.value)} className="mt-1.5 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-emerald-600">
              <option value="">{newMaterialCategory ? `Pilih jenis material (${newMaterialCategory})...` : "Pilih jenis material..."}</option>
              {oldMaterialOptions.map((m) => <option key={m.id} value={m.name}>{m.name}</option>)}
            </select>
            {!newMaterialCategory && <div className="text-xs text-gray-400 mt-1">Pilih unit yang dipasang terlebih dahulu untuk menyaring pilihan sesuai kategorinya.</div>}
          </div>
        </div>
        <PhotoUpload label="Foto Bukti Material Faulty / Dicabut" value={oldPhoto} onChange={setOldPhoto} />
      </Card>

      <Card className="p-6 space-y-4 max-w-2xl">
        <div>
          <label className="text-sm font-medium text-gray-700">Catatan <span className="text-gray-400 font-normal">(opsional)</span></label>
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="mis. alasan penggantian" className="mt-1.5 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-emerald-600" />
        </div>
        {error && <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-lg px-3 py-2">{error}</div>}
        <div className="flex justify-end pt-2 border-t border-gray-50">
          <PrimaryButton onClick={() => setConfirmSubmit(true)} disabled={!valid || saving}>{saving ? "Menyimpan..." : "Simpan"}</PrimaryButton>
        </div>
      </Card>

      <ConfirmDialog
        open={confirmSubmit}
        title={oldSn.trim() ? "Konfirmasi Penggantian Material" : "Konfirmasi Instalasi Material"}
        message={
          oldSn.trim()
            ? `${newSn.trim()} akan ditandai Installed di ${selectedSiteName}, dan ${oldSn.trim()} akan ditandai Faulty. Lanjutkan?`
            : `${newSn.trim()} akan ditandai Installed di ${selectedSiteName}. Lanjutkan?`
        }
        confirmLabel="Ya, Simpan"
        onConfirm={() => { setConfirmSubmit(false); submit(); }}
        onCancel={() => setConfirmSubmit(false)}
      />
      </>
      )}

      <Card className="overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 text-sm font-semibold text-gray-800">Riwayat Instalasi & Penggantian</div>
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-400 bg-gray-50/60 border-b border-gray-100">
              <th className="px-5 py-3 font-medium">No.</th>
              <th className="px-5 py-3 font-medium">Site</th>
              <th className="px-5 py-3 font-medium">SN Terpasang</th>
              <th className="px-5 py-3 font-medium">Material</th>
              <th className="px-5 py-3 font-medium">SN Lama (jika ada)</th>
              <th className="px-5 py-3 font-medium">Oleh</th>
              <th className="px-5 py-3 font-medium">Tgl</th>
              <th className="px-5 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {swaps.map((s) => (
              <tr key={s.id} className="border-b border-gray-50 last:border-0">
                <td className="px-5 py-3 font-medium text-gray-800">{s.id}</td>
                <td className="px-5 py-3 text-gray-600">{s.site || "-"}</td>
                <td className="px-5 py-3 text-emerald-700">{s.newSn}</td>
                <td className="px-5 py-3 text-gray-600">{s.newMaterial}</td>
                <td className="px-5 py-3 text-red-600">{s.oldSn || "-"}</td>
                <td className="px-5 py-3 text-gray-500">{s.performedBy}</td>
                <td className="px-5 py-3 text-gray-500">{s.date}</td>
                <td className="px-5 py-3"><button onClick={() => setSelectedSwap(s.id)} className="text-emerald-800 text-xs font-medium flex items-center gap-1"><Eye size={13} /> Detail</button></td>
              </tr>
            ))}
            {swaps.length === 0 && <tr><td colSpan={8}><EmptyState text="Belum ada riwayat instalasi/penggantian material." /></td></tr>}
          </tbody>
        </table>
        </div>
      </Card>
    </div>
  );
}

function MaterialSwapDetail({ swap, onBack, setPage, setReturnPrefill }) {
  const [lightboxSrc, setLightboxSrc] = useState(null);

  return (
    <div className="p-4 sm:p-8 max-w-3xl mx-auto space-y-5">
      <button onClick={onBack} className="text-sm text-gray-500 flex items-center gap-1 hover:text-gray-800"><ChevronLeft size={16} /> Kembali ke daftar</button>
      <div>
        <div className="text-xl font-bold text-gray-900">{swap.id}</div>
        <div className="text-sm text-gray-500 mt-1">Oleh {swap.performedBy} · {swap.date}</div>
      </div>

      <Card className="p-5 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div><div className="text-gray-400 text-xs">Site</div><div className="font-medium text-gray-800">{swap.site || "-"}</div></div>
        <div><div className="text-gray-400 text-xs">Homebase</div><div className="font-medium text-gray-800">{swap.homebase || "-"}</div></div>
        <div className="col-span-2"><div className="text-gray-400 text-xs">Catatan</div><div className="font-medium text-gray-800">{swap.note || "-"}</div></div>
      </Card>

      <Card className="p-5 space-y-3">
        <SectionTitle title="Unit yang Dipasang" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
          <div className="text-sm space-y-1.5">
            <div><span className="text-gray-400">Serial Number:</span> <span className="font-medium text-emerald-700">{swap.newSn}</span></div>
            <div><span className="text-gray-400">Material:</span> <span className="font-medium text-gray-800">{swap.newMaterial}</span></div>
            <div><StatusBadge status="Installed" /></div>
          </div>
          {swap.photo && (
            <div className="w-40">
              <PhotoThumb src={swap.photo} alt="Foto material terpasang" className="w-full h-28 object-cover rounded-lg border border-gray-100" onOpen={setLightboxSrc} />
              <div className="text-xs text-gray-400 mt-1">Foto bukti terpasang</div>
            </div>
          )}
        </div>
      </Card>

      {swap.oldSn && (
        <Card className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <SectionTitle title="Unit Lama / Faulty yang Dicabut" />
            <GhostButton onClick={() => { setReturnPrefill({ material: swap.oldMaterial, sn: swap.oldSn, photo: swap.oldPhoto }); setPage("returnFaultyCreate"); }}>
              Buat Return Faulty
            </GhostButton>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
            <div className="text-sm space-y-1.5">
              <div><span className="text-gray-400">Serial Number:</span> <span className="font-medium text-red-600">{swap.oldSn}</span></div>
              <div><span className="text-gray-400">Material:</span> <span className="font-medium text-gray-800">{swap.oldMaterial}</span></div>
              <div><StatusBadge status="Faulty" /></div>
            </div>
            {swap.oldPhoto && (
              <div className="w-40">
                <PhotoThumb src={swap.oldPhoto} alt="Foto material faulty" className="w-full h-28 object-cover rounded-lg border border-gray-100" onOpen={setLightboxSrc} />
                <div className="text-xs text-gray-400 mt-1">Foto bukti dicabut</div>
              </div>
            )}
          </div>
        </Card>
      )}

      <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
    </div>
  );
}


/* ============================================================
   TOOLS / PERALATAN (Peminjaman Alat)
   Separate pool from materials — round-trip (checkout/return), no
   division split. Mirrors the Warehouse Stock + Delivery Request patterns
   but simplified: single-stage approval (Logistics picks SN and hands
   over in one step), and returns come back as a whole transaction.
   ============================================================ */

function ToolStockPage({ tools, setPage, setToolSerialName, onSubmitReceipt, showToast, role }) {
  const [search, setSearch] = useState("");
  const [showReceiptForm, setShowReceiptForm] = useState(false);
  const canReceive = role === ROLES.MANAGER || role === ROLES.LOGISTICS;
  const filtered = tools.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-4 sm:p-8 space-y-5">
      <SectionTitle
        title="Stock Alat" subtitle="Ketersediaan peralatan kerja — dipinjam & dikembalikan, tanpa pembagian divisi"
        right={canReceive ? <PrimaryButton onClick={() => setShowReceiptForm(!showReceiptForm)}><Plus size={16} /> Terima Alat</PrimaryButton> : null}
      />

      {showReceiptForm && canReceive && (
        <ToolReceiptForm tools={tools} onCancel={() => setShowReceiptForm(false)} onSubmit={onSubmitReceipt} showToast={showToast} />
      )}

      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2.5 w-80">
        <Search size={16} className="text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari alat..." className="bg-transparent text-sm outline-none w-full" />
      </div>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-400 bg-gray-50/60 border-b border-gray-100">
              <th className="px-5 py-3 font-medium">Alat</th>
              <th className="px-5 py-3 font-medium">Category</th>
              <th className="px-5 py-3 font-medium">Available</th>
              <th className="px-5 py-3 font-medium">Checked Out</th>
              <th className="px-5 py-3 font-medium">Under Repair</th>
              <th className="px-5 py-3 font-medium">Total</th>
              <th className="px-5 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => {
              const total = t.available + t.checked_out + t.under_repair;
              const low = t.available <= t.min_stock;
              return (
                <tr key={t.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                  <td className="px-5 py-3">
                    <div className="font-medium text-gray-800">{t.name}</div>
                    {low && <div className="text-xs text-red-600 font-medium mt-0.5 flex items-center gap-1"><AlertTriangle size={11} /> Mendekati stok minimum ({t.min_stock})</div>}
                  </td>
                  <td className="px-5 py-3 text-gray-500">{t.category}</td>
                  <td className="px-5 py-3 font-semibold text-emerald-700">{t.available}</td>
                  <td className="px-5 py-3 text-indigo-600">{t.checked_out}</td>
                  <td className="px-5 py-3 text-red-600">{t.under_repair}</td>
                  <td className="px-5 py-3 font-medium text-gray-800">{total}</td>
                  <td className="px-5 py-3">
                    {t.serialized === true || t.serialized === 1 ? (
                      <button onClick={() => { setToolSerialName(t.name); setPage("toolSerialDetail"); }} className="text-emerald-800 text-xs font-medium">Lihat SN</button>
                    ) : null}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && <tr><td colSpan={7}><EmptyState text="Belum ada data alat." /></td></tr>}
          </tbody>
        </table>
        </div>
      </Card>
    </div>
  );
}

function TransferStockPage({ materials, homebases, customers, currentUser, role, api, showToast }) {
  const isManager = role === ROLES.MANAGER;
  const myDivisions = currentUser?.customers || [];
  const needsDivisionPicker = isManager || myDivisions.length > 1;
  const divisionOptions = isManager ? customers.filter((c) => c.status === "Active").map((c) => c.name) : myDivisions;
  const canSubmit = role === ROLES.MANAGER || role === ROLES.LOGISTICS;

  const [customer, setCustomer] = useState(needsDivisionPicker ? "" : (myDivisions[0] || ""));
  const [material, setMaterial] = useState("");
  const [homebaseFrom, setHomebaseFrom] = useState("");
  const [homebaseTo, setHomebaseTo] = useState("");
  const [transferOptions, setTransferOptions] = useState(null); // { serialized, breakdown: [{homebase, qty}] }
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [availableSerials, setAvailableSerials] = useState([]);
  const [selectedSerials, setSelectedSerials] = useState(new Set());
  const [qty, setQty] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [transfers, setTransfers] = useState([]);
  const [loadingTransfers, setLoadingTransfers] = useState(true);

  const activeMaterials = materials.filter((m) => m.status === "Active");
  const selectedMaterial = activeMaterials.find((m) => m.name === material);
  const isSerialized = !!selectedMaterial?.serialized;

  const loadTransfers = () => {
    setLoadingTransfers(true);
    api.getTransfers().then(setTransfers).catch(() => {}).finally(() => setLoadingTransfers(false));
  };
  React.useEffect(loadTransfers, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Every time material or division changes, the whole "where is it"
  // picture is stale — reset the homebase choices along with it rather
  // than leaving a source/destination selected that may no longer apply.
  React.useEffect(() => {
    setHomebaseFrom(""); setHomebaseTo(""); setSelectedSerials(new Set()); setQty(""); setTransferOptions(null); setError("");
    if (!material || !customer) return;
    setLoadingOptions(true);
    api.getTransferOptions(material, customer).then(setTransferOptions).catch((err) => setError(err.message)).finally(() => setLoadingOptions(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [material, customer]);

  // Once a source homebase is picked for a serialized material, fetch the
  // actual units sitting there so specific ones can be checked off.
  React.useEffect(() => {
    setSelectedSerials(new Set());
    if (!isSerialized || !homebaseFrom) { setAvailableSerials([]); return; }
    api.getSerials(material, "Delivered", customer, homebaseFrom).then(setAvailableSerials).catch(() => setAvailableSerials([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSerialized, homebaseFrom, material, customer]);

  const sourceQty = transferOptions?.breakdown.find((b) => b.homebase === homebaseFrom)?.qty || 0;
  const destinationOptions = homebases.filter((h) => h.status === "Active" && h.name !== homebaseFrom);

  const toggleSerial = (sn) => {
    setSelectedSerials((prev) => {
      const next = new Set(prev);
      if (next.has(sn)) next.delete(sn); else next.add(sn);
      return next;
    });
  };

  const valid = customer && material && homebaseFrom && homebaseTo && homebaseFrom !== homebaseTo &&
    (isSerialized ? selectedSerials.size > 0 : Number(qty) > 0 && Number(qty) <= sourceQty);

  const submit = async () => {
    setSaving(true); setError("");
    try {
      await api.createTransfer({
        material, customer, homebaseFrom, homebaseTo,
        serials: isSerialized ? Array.from(selectedSerials) : undefined,
        qty: isSerialized ? undefined : Number(qty),
        note: note || undefined,
      });
      showToast(`Transfer ${material} dari ${homebaseFrom} ke ${homebaseTo} berhasil dicatat`);
      setHomebaseTo(""); setSelectedSerials(new Set()); setQty(""); setNote("");
      api.getTransferOptions(material, customer).then(setTransferOptions).catch(() => {});
      if (isSerialized) api.getSerials(material, "Delivered", customer, homebaseFrom).then(setAvailableSerials).catch(() => {});
      loadTransfers();
    } catch (err) {
      setError(err.message || "Gagal memindahkan stock");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-5">
      <SectionTitle title="Transfer Stock" subtitle={canSubmit ? "Pindahkan stock material yang sudah Delivered dari satu homebase ke homebase lain" : "Riwayat transfer stock antar homebase"} />

      {canSubmit && (
      <Card className="p-6 space-y-4 max-w-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {needsDivisionPicker && (
            <div>
              <label className="text-sm font-medium text-gray-700">Divisi <span className="text-red-500">*</span></label>
              <select value={customer} onChange={(e) => setCustomer(e.target.value)} className="mt-1.5 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-emerald-600">
                <option value="">Pilih divisi...</option>
                {divisionOptions.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-gray-700">Material <span className="text-red-500">*</span></label>
            <select value={material} onChange={(e) => setMaterial(e.target.value)} disabled={!customer} className="mt-1.5 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-emerald-600 disabled:bg-gray-50">
              <option value="">Pilih material...</option>
              {activeMaterials.map((m) => <option key={m.id} value={m.name}>{m.name}</option>)}
            </select>
          </div>
        </div>

        {loadingOptions && <div className="text-xs text-gray-400">Memuat ketersediaan stock...</div>}

        {transferOptions && (
          <div>
            <div className="text-xs text-gray-500 mb-1.5">Stock {material} saat ini per homebase:</div>
            {transferOptions.breakdown.length === 0 ? (
              <div className="text-xs text-gray-400">Belum ada stock Delivered untuk material ini di divisi {customer}.</div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {transferOptions.breakdown.map((b) => (
                  <span key={b.homebase} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{b.homebase}: <span className="font-medium">{b.qty}</span></span>
                ))}
              </div>
            )}
          </div>
        )}

        {transferOptions && transferOptions.breakdown.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Dari Homebase <span className="text-red-500">*</span></label>
                <select value={homebaseFrom} onChange={(e) => setHomebaseFrom(e.target.value)} className="mt-1.5 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-emerald-600">
                  <option value="">Pilih homebase asal...</option>
                  {transferOptions.breakdown.map((b) => <option key={b.homebase} value={b.homebase}>{b.homebase} (tersedia: {b.qty})</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Ke Homebase <span className="text-red-500">*</span></label>
                <select value={homebaseTo} onChange={(e) => setHomebaseTo(e.target.value)} disabled={!homebaseFrom} className="mt-1.5 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-emerald-600 disabled:bg-gray-50">
                  <option value="">Pilih homebase tujuan...</option>
                  {destinationOptions.map((h) => <option key={h.code} value={h.name}>{h.name}</option>)}
                </select>
              </div>
            </div>

            {homebaseFrom && isSerialized && (
              <div>
                <label className="text-sm font-medium text-gray-700">Pilih Serial Number <span className="text-red-500">*</span></label>
                <div className="mt-1.5 border border-gray-200 rounded-lg max-h-48 overflow-y-auto divide-y divide-gray-50">
                  {availableSerials.length === 0 ? (
                    <div className="text-xs text-gray-400 p-3">Tidak ada unit tersedia di {homebaseFrom}.</div>
                  ) : availableSerials.map((s) => (
                    <label key={s.sn} className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-gray-50">
                      <input type="checkbox" checked={selectedSerials.has(s.sn)} onChange={() => toggleSerial(s.sn)} className="accent-emerald-800" />
                      <span className="font-mono text-xs">{s.sn}</span>
                    </label>
                  ))}
                </div>
                {selectedSerials.size > 0 && <div className="text-xs text-emerald-700 mt-1">{selectedSerials.size} unit dipilih</div>}
              </div>
            )}

            {homebaseFrom && !isSerialized && (
              <div>
                <label className="text-sm font-medium text-gray-700">Qty <span className="text-red-500">*</span></label>
                <input type="number" min="1" max={sourceQty} value={qty} onChange={(e) => setQty(e.target.value)} placeholder={`Maks. ${sourceQty}`} className="mt-1.5 w-full max-w-[160px] border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-emerald-600" />
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-700">Catatan <span className="text-gray-400 font-normal">(opsional)</span></label>
              <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="mis. alasan transfer" className="mt-1.5 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-emerald-600" />
            </div>
          </>
        )}

        {error && <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-lg px-3 py-2">{error}</div>}

        <div className="flex justify-end pt-2 border-t border-gray-50">
          <PrimaryButton onClick={submit} disabled={!valid || saving}>{saving ? "Memproses..." : "Transfer Stock"}</PrimaryButton>
        </div>
      </Card>
      )}

      <Card className="overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 text-sm font-semibold text-gray-800">Riwayat Transfer</div>
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-400 bg-gray-50/60 border-b border-gray-100">
              <th className="px-5 py-3 font-medium">ID</th>
              <th className="px-5 py-3 font-medium">Material</th>
              <th className="px-5 py-3 font-medium">Divisi</th>
              <th className="px-5 py-3 font-medium">Dari</th>
              <th className="px-5 py-3 font-medium">Ke</th>
              <th className="px-5 py-3 font-medium">Qty</th>
              <th className="px-5 py-3 font-medium">Oleh</th>
              <th className="px-5 py-3 font-medium">Tgl</th>
            </tr>
          </thead>
          <tbody>
            {transfers.map((t) => (
              <tr key={t.id} className="border-b border-gray-50 last:border-0">
                <td className="px-5 py-3 font-medium text-gray-800">{t.id}</td>
                <td className="px-5 py-3 text-gray-700">{t.material}</td>
                <td className="px-5 py-3 text-gray-600">{t.customer}</td>
                <td className="px-5 py-3 text-gray-600">{t.homebase_from}</td>
                <td className="px-5 py-3 text-emerald-700">{t.homebase_to}</td>
                <td className="px-5 py-3 text-gray-600">{t.qty}{t.serials?.length > 0 ? ` (${t.serials.join(", ")})` : ""}</td>
                <td className="px-5 py-3 text-gray-500">{t.performed_by}</td>
                <td className="px-5 py-3 text-gray-500">{t.date}</td>
              </tr>
            ))}
            {!loadingTransfers && transfers.length === 0 && <tr><td colSpan={8}><EmptyState text="Belum ada riwayat transfer." /></td></tr>}
          </tbody>
        </table>
        </div>
      </Card>
    </div>
  );
}

function ToolSerialDetail({ toolName, api, onBack }) {
  const [status, setStatus] = useState("All");
  const [serials, setSerials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api.getToolSerials(toolName, status === "All" ? undefined : status)
      .then((data) => { if (!cancelled) { setSerials(data); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [toolName, status]);

  const filtered = search ? serials.filter((s) => s.sn.toLowerCase().includes(search.toLowerCase())) : serials;
  const statusOptions = ["All", "Available", "Checked Out", "Under Repair"];

  return (
    <div className="p-4 sm:p-8 space-y-5">
      <button onClick={onBack} className="text-sm text-gray-500 flex items-center gap-1 hover:text-gray-800"><ChevronLeft size={16} /> Kembali ke Stock Alat</button>
      <SectionTitle title={`Serial Number — ${toolName}`} subtitle="Daftar unit alat dan status terkininya" />
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

function ToolReceiptForm({ tools, onSubmit, onCancel, showToast }) {
  const [tool, setTool] = useState("");
  const [serials, setSerials] = useState([""]);
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkText, setBulkText] = useState("");

  const t = tools.find((x) => x.name === tool);
  const addSN = () => setSerials([...serials, ""]);
  const updateSN = (i, val) => setSerials(serials.map((s, idx) => (idx === i ? val : s)));
  const removeSN = (i) => setSerials(serials.filter((_, idx) => idx !== i));
  const bulkSerials = bulkText.split(/[\n,;\t]+/).map((s) => s.trim()).filter(Boolean);
  const trimmedSerials = bulkMode ? bulkSerials : serials.map((s) => s.trim()).filter(Boolean);
  const hasDuplicates = new Set(trimmedSerials).size !== trimmedSerials.length;
  const valid = t && (t.serialized ? trimmedSerials.length > 0 && !hasDuplicates : qty > 0);

  const submit = async () => {
    setSaving(true); setError("");
    const submittedTool = tool;
    const submittedQty = t.serialized ? trimmedSerials.length : qty;
    try {
      await onSubmit(t.serialized ? { tool, serials: trimmedSerials, note } : { tool, qty, note });
      showToast(`Berhasil menerima ${submittedQty} unit ${submittedTool}`);
      setTool(""); setSerials([""]); setQty(1); setNote(""); setBulkText("");
    } catch (err) {
      setError(err.message || "Gagal menyimpan penerimaan alat");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="p-5 space-y-4">
      <div className="text-sm font-semibold text-gray-800">Terima Alat</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-gray-500">Alat <span className="text-red-500">*</span></label>
          <select value={tool} onChange={(e) => { setTool(e.target.value); setSerials([""]); setBulkText(""); }} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-600">
            <option value="">Pilih alat...</option>
            {tools.filter((x) => x.status === "Active").map((x) => <option key={x.id} value={x.name}>{x.name} {x.serialized ? "(Serialized)" : ""}</option>)}
          </select>
        </div>
        {t && !t.serialized && (
          <div>
            <label className="text-xs font-medium text-gray-500">Qty <span className="text-red-500">*</span></label>
            <input type="number" min={1} value={qty} onChange={(e) => setQty(Number(e.target.value))} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-600" />
          </div>
        )}
        <div className={t && !t.serialized ? "" : "sm:col-span-2"}>
          <label className="text-xs font-medium text-gray-500">Catatan <span className="text-gray-400 font-normal">(opsional)</span></label>
          <input value={note} onChange={(e) => setNote(e.target.value)} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-600" />
        </div>
      </div>

      {t && t.serialized && (
        <div className="space-y-3 pt-2 border-t border-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-gray-800">Serial Number Unit Baru</div>
            <div className="flex items-center gap-3">
              {!bulkMode && <button onClick={addSN} className="text-xs text-emerald-800 font-medium flex items-center gap-1"><Plus size={14} /> Add SN</button>}
              <button onClick={() => { setBulkMode(!bulkMode); setSerials([""]); setBulkText(""); }} className="text-xs text-gray-500 font-medium underline decoration-dotted">
                {bulkMode ? "Input satu-satu" : "Tempel banyak SN sekaligus"}
              </button>
            </div>
          </div>
          {bulkMode ? (
            <div className="space-y-1.5">
              <textarea value={bulkText} onChange={(e) => setBulkText(e.target.value)} placeholder={"Tempel daftar Serial Number, satu per baris."} rows={6} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-600 font-mono" />
              <div className="text-xs text-gray-400">{trimmedSerials.length} SN terdeteksi.</div>
            </div>
          ) : (
            serials.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-5">{i + 1}.</span>
                <input value={s} onChange={(e) => updateSN(i, e.target.value)} placeholder="Masukkan Serial Number" className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-600" />
                {serials.length > 1 && <button onClick={() => removeSN(i)} className="text-gray-300 hover:text-red-500"><X size={16} /></button>}
              </div>
            ))
          )}
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

/* ============================================================
   MASTER DATA
   ============================================================ */

function MasterMaterial({ materials, onCreate, onToggle, onImport, onDelete, onBulkDelete, onGetCascadePreview, onForceDelete, showToast }) {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [form, setForm] = useState({ id: "", name: "", category: "", unit: "Unit", serialized: true, minStock: 1 });
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const [confirmDelete, setConfirmDelete] = useState(null); // { type: "one"|"bulk", id? }
  const [blockedMaterial, setBlockedMaterial] = useState(null); // id — normal delete was blocked, offer cascade wipe
  const [cascadePreview, setCascadePreview] = useState(null); // { material, deliveries, returns, ... } once loaded
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [confirmForceDelete, setConfirmForceDelete] = useState(false);
  const [forceDeleting, setForceDeleting] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [sort, setSort] = useState({ key: null, dir: "asc" });
  const handleSort = (key) => setSort((prev) => (prev.key === key ? { key, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));

  const filtered = sortRows(
    materials.filter((m) => (statusFilter === "All" || m.status === statusFilter) && m.name.toLowerCase().includes(search.toLowerCase())),
    sort
  );

  const toggleOne = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const toggleAllVisible = () => {
    const visibleIds = filtered.map((m) => m.id);
    const allSelected = visibleIds.every((id) => selected.has(id));
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) visibleIds.forEach((id) => next.delete(id));
      else visibleIds.forEach((id) => next.add(id));
      return next;
    });
  };
  const handleDeleteOne = async (id) => {
    try {
      await onDelete(id);
      showToast("Material berhasil dihapus");
    } catch (err) {
      // Blocked because it still has stock/transaction history — offer the
      // cascade wipe path instead of just leaving the user stuck.
      if (/masih punya riwayat/i.test(err.message || "")) {
        setBlockedMaterial(id);
        openCascadePreview(id);
      } else {
        showToast(err.message || "Gagal menghapus material");
      }
    }
  };
  const handleBulkDelete = async () => {
    const ids = Array.from(selected);
    try {
      const result = await onBulkDelete(ids);
      const blockedCount = result?.blocked?.length || 0;
      showToast(blockedCount > 0 ? `${result.deleted} dihapus, ${blockedCount} gagal karena masih dipakai` : `${result.deleted} material berhasil dihapus`);
      setSelected(new Set());
    } catch (err) {
      showToast(err.message || "Gagal menghapus material");
    }
  };

  const openCascadePreview = async (id) => {
    setLoadingPreview(true);
    try {
      const preview = await onGetCascadePreview(id);
      setCascadePreview(preview);
    } catch (err) {
      showToast(err.message || "Gagal memuat detail riwayat");
      setBlockedMaterial(null);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleForceDelete = async () => {
    setForceDeleting(true);
    try {
      await onForceDelete(blockedMaterial);
      showToast(`Material "${cascadePreview?.material}" beserta seluruh riwayatnya berhasil dihapus`);
      setBlockedMaterial(null);
      setCascadePreview(null);
    } catch (err) {
      showToast(err.message || "Gagal menghapus total");
    } finally {
      setForceDeleting(false);
    }
  };

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

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2.5 w-80">
            <Search size={16} className="text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari material..." className="bg-transparent text-sm outline-none w-full" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none bg-white text-gray-600">
            <option value="All">Semua Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
        {selected.size > 0 && (
          <DangerButton onClick={() => setConfirmDelete({ type: "bulk" })}><X size={14} /> Hapus Terpilih ({selected.size})</DangerButton>
        )}
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-400 bg-gray-50/60 border-b border-gray-100">
              <th className="px-5 py-3 font-medium w-8">
                <input type="checkbox" checked={filtered.length > 0 && filtered.every((m) => selected.has(m.id))} onChange={toggleAllVisible} className="accent-emerald-800" />
              </th>
              <SortableHeader label="Material ID" sortKey="id" sort={sort} onSort={handleSort} />
              <SortableHeader label="Nama" sortKey="name" sort={sort} onSort={handleSort} />
              <SortableHeader label="Category" sortKey="category" sort={sort} onSort={handleSort} />
              <th className="px-5 py-3 font-medium">Unit</th>
              <th className="px-5 py-3 font-medium">Serialized</th>
              <SortableHeader label="Min Stock" sortKey="minStock" sort={sort} onSort={handleSort} />
              <SortableHeader label="Status" sortKey="status" sort={sort} onSort={handleSort} />
              <th className="px-5 py-3 font-medium"></th>
              <th className="px-5 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => (
              <tr key={m.id} className="border-b border-gray-50 last:border-0">
                <td className="px-5 py-3"><input type="checkbox" checked={selected.has(m.id)} onChange={() => toggleOne(m.id)} className="accent-emerald-800" /></td>
                <td className="px-5 py-3 text-gray-500">{m.id}</td>
                <td className="px-5 py-3 font-medium text-gray-800">{m.name}</td>
                <td className="px-5 py-3 text-gray-600">{m.category}</td>
                <td className="px-5 py-3 text-gray-500">{m.unit}</td>
                <td className="px-5 py-3 text-gray-500">{m.serialized ? "Yes" : "No"}</td>
                <td className="px-5 py-3 text-gray-500">{m.minStock}</td>
                <td className="px-5 py-3"><StatusBadge status={m.status} /></td>
                <td className="px-5 py-3"><button onClick={() => onToggle(m.id)} className="text-xs font-medium text-emerald-800">{m.status === "Active" ? "Deactivate" : "Activate"}</button></td>
                <td className="px-5 py-3"><button onClick={() => setConfirmDelete({ type: "one", id: m.id })} className="text-red-500 hover:text-red-700"><X size={14} /></button></td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={10}><EmptyState text="Belum ada data material." /></td></tr>}
          </tbody>
        </table>
        </div>
      </Card>

      <ConfirmDialog
        open={!!confirmDelete}
        title="Hapus Material"
        message={
          confirmDelete?.type === "bulk"
            ? `${selected.size} material terpilih akan dihapus permanen. Tindakan ini tidak bisa dibatalkan. Lanjutkan?`
            : `Material ini akan dihapus permanen. Tindakan ini tidak bisa dibatalkan. Lanjutkan?`
        }
        confirmLabel="Ya, Hapus"
        danger
        onConfirm={() => {
          const target = confirmDelete;
          setConfirmDelete(null);
          if (target.type === "bulk") handleBulkDelete();
          else handleDeleteOne(target.id);
        }}
        onCancel={() => setConfirmDelete(null)}
      />

      {blockedMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => { setBlockedMaterial(null); setCascadePreview(null); }}>
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start gap-3">
              <AlertTriangle size={20} className="text-amber-500 mt-0.5 shrink-0" />
              <div>
                <div className="text-sm font-semibold text-gray-800">Material Ini Masih Punya Riwayat</div>
                <div className="text-sm text-gray-500 mt-1">Tidak bisa dihapus biasa karena sudah punya data transaksi terkait. Anda bisa hapus material ini beserta <span className="font-medium text-red-600">SELURUH riwayatnya</span> — tindakan ini permanen dan tidak bisa dibatalkan.</div>
              </div>
            </div>

            {loadingPreview ? (
              <div className="text-sm text-gray-400 text-center py-4">Memuat rincian...</div>
            ) : cascadePreview ? (
              <div className="bg-red-50 border border-red-100 rounded-lg p-4 space-y-1.5 text-sm">
                {cascadePreview.deliveries > 0 && <div className="flex justify-between"><span className="text-gray-600">Delivery Request</span><span className="font-medium text-red-700">{cascadePreview.deliveries}</span></div>}
                {cascadePreview.returns > 0 && <div className="flex justify-between"><span className="text-gray-600">Return Material Faulty</span><span className="font-medium text-red-700">{cascadePreview.returns}</span></div>}
                {cascadePreview.reconciliations > 0 && <div className="flex justify-between"><span className="text-gray-600">Reconciliation</span><span className="font-medium text-red-700">{cascadePreview.reconciliations}</span></div>}
                {cascadePreview.serialNumbers > 0 && <div className="flex justify-between"><span className="text-gray-600">Serial Number</span><span className="font-medium text-red-700">{cascadePreview.serialNumbers}</span></div>}
                {cascadePreview.receipts > 0 && <div className="flex justify-between"><span className="text-gray-600">Riwayat Terima Barang</span><span className="font-medium text-red-700">{cascadePreview.receipts}</span></div>}
                {cascadePreview.stockMovements > 0 && <div className="flex justify-between"><span className="text-gray-600">Pergerakan Stock</span><span className="font-medium text-red-700">{cascadePreview.stockMovements}</span></div>}
              </div>
            ) : null}

            <div className="flex justify-end gap-2 pt-2">
              <GhostButton onClick={() => { setBlockedMaterial(null); setCascadePreview(null); }}>Batal</GhostButton>
              <DangerButton onClick={() => setConfirmForceDelete(true)} disabled={loadingPreview || forceDeleting}>
                {forceDeleting ? "Menghapus..." : "Hapus Semua Ini"}
              </DangerButton>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmForceDelete}
        title="Konfirmasi Terakhir"
        message={`Material "${cascadePreview?.material}" beserta SELURUH riwayat di atas akan dihapus PERMANEN. Ini tidak bisa dibatalkan. Yakin lanjutkan?`}
        confirmLabel="Ya, Hapus Permanen"
        danger
        onConfirm={() => { setConfirmForceDelete(false); handleForceDelete(); }}
        onCancel={() => setConfirmForceDelete(false)}
      />
    </div>
  );
}

function MasterTools({ tools, onCreate, onToggle, onDelete, onBulkDelete, showToast }) {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", category: "", unit: "Unit", serialized: true, minStock: 1 });
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const [confirmDelete, setConfirmDelete] = useState(null); // { type: "one"|"bulk", id? }
  const [statusFilter, setStatusFilter] = useState("All");
  const [sort, setSort] = useState({ key: null, dir: "asc" });
  const handleSort = (key) => setSort((prev) => (prev.key === key ? { key, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));

  const filtered = sortRows(
    tools.filter((t) => (statusFilter === "All" || t.status === statusFilter) && t.name.toLowerCase().includes(search.toLowerCase())),
    sort
  );

  const toggleOne = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const toggleAllVisible = () => {
    const visibleIds = filtered.map((t) => t.id);
    const allSelected = visibleIds.every((id) => selected.has(id));
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) visibleIds.forEach((id) => next.delete(id));
      else visibleIds.forEach((id) => next.add(id));
      return next;
    });
  };
  const handleDeleteOne = async (id) => {
    try {
      await onDelete(id);
      showToast("Alat berhasil dihapus");
    } catch (err) {
      showToast(err.message || "Gagal menghapus alat");
    }
  };
  const handleBulkDelete = async () => {
    const ids = Array.from(selected);
    try {
      const result = await onBulkDelete(ids);
      const blockedCount = result?.blocked?.length || 0;
      showToast(blockedCount > 0 ? `${result.deleted} dihapus, ${blockedCount} gagal karena masih dipakai` : `${result.deleted} alat berhasil dihapus`);
      setSelected(new Set());
    } catch (err) {
      showToast(err.message || "Gagal menghapus alat");
    }
  };

  const addTool = async () => {
    if (!form.name || !form.category) return;
    setSaving(true);
    const submittedName = form.name;
    try {
      await onCreate({ name: form.name, category: form.category, unit: form.unit, serialized: form.serialized, minStock: form.minStock });
      showToast(`Alat "${submittedName}" berhasil ditambahkan`);
      setForm({ name: "", category: "", unit: "Unit", serialized: true, minStock: 1 });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-5">
      <SectionTitle
        title="Master Alat" subtitle="Kelola jenis peralatan kerja (Peminjaman Alat)"
        right={<PrimaryButton onClick={() => setShowForm(!showForm)}><Plus size={16} /> Tambah Alat</PrimaryButton>}
      />

      {showForm && (
        <Card className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input placeholder="Nama alat" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-emerald-600" />
          <input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-emerald-600" />
          <input placeholder="Unit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-emerald-600" />
          <input type="number" placeholder="Minimum stock" value={form.minStock} onChange={(e) => setForm({ ...form, minStock: Number(e.target.value) })} className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-emerald-600" />
          <label className="flex items-center gap-2 text-sm text-gray-600 sm:col-span-2">
            <input type="checkbox" checked={form.serialized} onChange={(e) => setForm({ ...form, serialized: e.target.checked })} className="accent-emerald-800" /> Serialized (butuh Serial Number per unit)
          </label>
          <div className="sm:col-span-2 flex justify-end gap-2">
            <GhostButton onClick={() => setShowForm(false)}>Tutup</GhostButton>
            <PrimaryButton onClick={addTool} disabled={saving}>{saving ? "Menyimpan..." : "Simpan"}</PrimaryButton>
          </div>
        </Card>
      )}

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2.5 w-80">
            <Search size={16} className="text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari alat..." className="bg-transparent text-sm outline-none w-full" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none bg-white text-gray-600">
            <option value="All">Semua Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
        {selected.size > 0 && (
          <DangerButton onClick={() => setConfirmDelete({ type: "bulk" })}><X size={14} /> Hapus Terpilih ({selected.size})</DangerButton>
        )}
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-400 bg-gray-50/60 border-b border-gray-100">
              <th className="px-5 py-3 font-medium w-8">
                <input type="checkbox" checked={filtered.length > 0 && filtered.every((t) => selected.has(t.id))} onChange={toggleAllVisible} className="accent-emerald-800" />
              </th>
              <SortableHeader label="Alat ID" sortKey="id" sort={sort} onSort={handleSort} />
              <SortableHeader label="Nama" sortKey="name" sort={sort} onSort={handleSort} />
              <SortableHeader label="Category" sortKey="category" sort={sort} onSort={handleSort} />
              <th className="px-5 py-3 font-medium">Unit</th>
              <th className="px-5 py-3 font-medium">Serialized</th>
              <SortableHeader label="Min Stock" sortKey="min_stock" sort={sort} onSort={handleSort} />
              <SortableHeader label="Status" sortKey="status" sort={sort} onSort={handleSort} />
              <th className="px-5 py-3 font-medium"></th>
              <th className="px-5 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr key={t.id} className="border-b border-gray-50 last:border-0">
                <td className="px-5 py-3"><input type="checkbox" checked={selected.has(t.id)} onChange={() => toggleOne(t.id)} className="accent-emerald-800" /></td>
                <td className="px-5 py-3 text-gray-500">{t.id}</td>
                <td className="px-5 py-3 font-medium text-gray-800">{t.name}</td>
                <td className="px-5 py-3 text-gray-600">{t.category}</td>
                <td className="px-5 py-3 text-gray-500">{t.unit}</td>
                <td className="px-5 py-3 text-gray-500">{t.serialized ? "Yes" : "No"}</td>
                <td className="px-5 py-3 text-gray-500">{t.min_stock}</td>
                <td className="px-5 py-3"><StatusBadge status={t.status} /></td>
                <td className="px-5 py-3"><button onClick={() => onToggle(t.id)} className="text-xs font-medium text-emerald-800">{t.status === "Active" ? "Deactivate" : "Activate"}</button></td>
                <td className="px-5 py-3"><button onClick={() => setConfirmDelete({ type: "one", id: t.id })} className="text-red-500 hover:text-red-700"><X size={14} /></button></td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={10}><EmptyState text="Belum ada data alat." /></td></tr>}
          </tbody>
        </table>
        </div>
      </Card>

      <ConfirmDialog
        open={!!confirmDelete}
        title="Hapus Alat"
        message={
          confirmDelete?.type === "bulk"
            ? `${selected.size} alat terpilih akan dihapus permanen. Tindakan ini tidak bisa dibatalkan. Lanjutkan?`
            : `Alat ini akan dihapus permanen. Tindakan ini tidak bisa dibatalkan. Lanjutkan?`
        }
        confirmLabel="Ya, Hapus"
        danger
        onConfirm={() => {
          const target = confirmDelete;
          setConfirmDelete(null);
          if (target.type === "bulk") handleBulkDelete();
          else handleDeleteOne(target.id);
        }}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}

function MasterConsumable({ consumables, onCreate, onToggle, onDelete, onBulkDelete, showToast }) {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", category: "", unit: "Pcs", minStock: 1 });
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const [confirmDelete, setConfirmDelete] = useState(null); // { type: "one"|"bulk", id? }
  const [statusFilter, setStatusFilter] = useState("All");
  const [sort, setSort] = useState({ key: null, dir: "asc" });
  const handleSort = (key) => setSort((prev) => (prev.key === key ? { key, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));

  const filtered = sortRows(
    consumables.filter((c) => (statusFilter === "All" || c.status === statusFilter) && c.name.toLowerCase().includes(search.toLowerCase())),
    sort
  );

  const toggleOne = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const toggleAllVisible = () => {
    const visibleIds = filtered.map((c) => c.id);
    const allSelected = visibleIds.every((id) => selected.has(id));
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) visibleIds.forEach((id) => next.delete(id));
      else visibleIds.forEach((id) => next.add(id));
      return next;
    });
  };
  const handleDeleteOne = async (id) => {
    try {
      await onDelete(id);
      showToast("Consumable berhasil dihapus");
    } catch (err) {
      showToast(err.message || "Gagal menghapus consumable");
    }
  };
  const handleBulkDelete = async () => {
    const ids = Array.from(selected);
    try {
      const result = await onBulkDelete(ids);
      const blockedCount = result?.blocked?.length || 0;
      showToast(blockedCount > 0 ? `${result.deleted} dihapus, ${blockedCount} gagal karena masih dipakai` : `${result.deleted} consumable berhasil dihapus`);
      setSelected(new Set());
    } catch (err) {
      showToast(err.message || "Gagal menghapus consumable");
    }
  };

  const addConsumable = async () => {
    if (!form.name.trim() || !form.category.trim()) return;
    setSaving(true);
    try {
      await onCreate({ name: form.name.trim(), category: form.category.trim(), unit: form.unit, minStock: Number(form.minStock) || 0 });
      showToast(`Consumable "${form.name}" berhasil ditambahkan`);
      setForm({ name: "", category: "", unit: "Pcs", minStock: 1 });
      setShowForm(false);
    } catch (err) {
      showToast(err.message || "Gagal menambahkan consumable");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-5">
      <SectionTitle
        title="Master Consumable" subtitle="Barang habis pakai untuk maintenance — konektor, isolasi, rubber, dsb (tidak dipinjam, tidak ada Faulty)"
        right={<PrimaryButton onClick={() => setShowForm(!showForm)}><Plus size={16} /> Tambah Consumable</PrimaryButton>}
      />

      {showForm && (
        <Card className="p-6 space-y-4 max-w-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Nama Consumable <span className="text-red-500">*</span></label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="mis. Konektor RJ45" className="mt-1.5 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-emerald-600" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Category <span className="text-red-500">*</span></label>
              <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="mis. Konektor" className="mt-1.5 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-emerald-600" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Unit</label>
              <input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="mt-1.5 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-emerald-600" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Min Stock</label>
              <input type="number" min="0" value={form.minStock} onChange={(e) => setForm({ ...form, minStock: e.target.value })} className="mt-1.5 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-emerald-600" />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <GhostButton onClick={() => setShowForm(false)}>Batal</GhostButton>
            <PrimaryButton onClick={addConsumable} disabled={!form.name.trim() || !form.category.trim() || saving}>{saving ? "Menyimpan..." : "Simpan"}</PrimaryButton>
          </div>
        </Card>
      )}

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2.5 w-80">
            <Search size={16} className="text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari consumable..." className="bg-transparent text-sm outline-none w-full" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none bg-white text-gray-600">
            <option value="All">Semua Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
        {selected.size > 0 && (
          <DangerButton onClick={() => setConfirmDelete({ type: "bulk" })}><X size={14} /> Hapus Terpilih ({selected.size})</DangerButton>
        )}
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-400 bg-gray-50/60 border-b border-gray-100">
              <th className="px-5 py-3 font-medium w-8">
                <input type="checkbox" checked={filtered.length > 0 && filtered.every((c) => selected.has(c.id))} onChange={toggleAllVisible} className="accent-emerald-800" />
              </th>
              <SortableHeader label="Consumable ID" sortKey="id" sort={sort} onSort={handleSort} />
              <SortableHeader label="Nama" sortKey="name" sort={sort} onSort={handleSort} />
              <SortableHeader label="Category" sortKey="category" sort={sort} onSort={handleSort} />
              <th className="px-5 py-3 font-medium">Unit</th>
              <SortableHeader label="Min Stock" sortKey="min_stock" sort={sort} onSort={handleSort} />
              <SortableHeader label="Status" sortKey="status" sort={sort} onSort={handleSort} />
              <th className="px-5 py-3 font-medium"></th>
              <th className="px-5 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="border-b border-gray-50 last:border-0">
                <td className="px-5 py-3"><input type="checkbox" checked={selected.has(c.id)} onChange={() => toggleOne(c.id)} className="accent-emerald-800" /></td>
                <td className="px-5 py-3 text-gray-500">{c.id}</td>
                <td className="px-5 py-3 font-medium text-gray-800">{c.name}</td>
                <td className="px-5 py-3 text-gray-600">{c.category}</td>
                <td className="px-5 py-3 text-gray-500">{c.unit}</td>
                <td className="px-5 py-3 text-gray-500">{c.min_stock}</td>
                <td className="px-5 py-3"><StatusBadge status={c.status} /></td>
                <td className="px-5 py-3"><button onClick={() => onToggle(c.id)} className="text-xs font-medium text-emerald-800">{c.status === "Active" ? "Deactivate" : "Activate"}</button></td>
                <td className="px-5 py-3"><button onClick={() => setConfirmDelete({ type: "one", id: c.id })} className="text-red-500 hover:text-red-700"><X size={14} /></button></td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={9}><EmptyState text="Belum ada data consumable." /></td></tr>}
          </tbody>
        </table>
        </div>
      </Card>

      <ConfirmDialog
        open={!!confirmDelete}
        title="Hapus Consumable"
        message={
          confirmDelete?.type === "bulk"
            ? `${selected.size} consumable terpilih akan dihapus permanen. Tindakan ini tidak bisa dibatalkan. Lanjutkan?`
            : `Consumable ini akan dihapus permanen. Tindakan ini tidak bisa dibatalkan. Lanjutkan?`
        }
        confirmLabel="Ya, Hapus"
        danger
        onConfirm={() => {
          const target = confirmDelete;
          setConfirmDelete(null);
          if (target.type === "bulk") handleBulkDelete();
          else handleDeleteOne(target.id);
        }}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}

function ConsumableReceiptForm({ consumables, onSubmit, onCancel, showToast }) {
  const [consumable, setConsumable] = useState("");
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const valid = consumable && qty > 0;

  const submit = async () => {
    setSaving(true); setError("");
    const submittedConsumable = consumable;
    const submittedQty = qty;
    try {
      await onSubmit({ consumable, qty, note });
      showToast(`Berhasil menerima ${submittedQty} ${submittedConsumable}`);
      setConsumable(""); setQty(1); setNote("");
    } catch (err) {
      setError(err.message || "Gagal menyimpan penerimaan consumable");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="p-5 space-y-4">
      <div className="text-sm font-semibold text-gray-800">Terima Consumable</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-gray-500">Consumable <span className="text-red-500">*</span></label>
          <select value={consumable} onChange={(e) => setConsumable(e.target.value)} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-600">
            <option value="">Pilih consumable...</option>
            {consumables.filter((c) => c.status === "Active").map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500">Qty <span className="text-red-500">*</span></label>
          <input type="number" min={1} value={qty} onChange={(e) => setQty(Number(e.target.value))} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-600" />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs font-medium text-gray-500">Catatan <span className="text-gray-400 font-normal">(opsional)</span></label>
          <input value={note} onChange={(e) => setNote(e.target.value)} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-600" />
        </div>
      </div>
      {error && <div className="bg-red-50 border border-red-100 text-red-700 text-xs rounded-lg px-3 py-2">{error}</div>}
      <div className="flex justify-end gap-2">
        <GhostButton onClick={onCancel}>Batal</GhostButton>
        <PrimaryButton disabled={!valid || saving} onClick={submit}>{saving ? "Menyimpan..." : "Simpan Penerimaan"}</PrimaryButton>
      </div>
    </Card>
  );
}

function ConsumableStockPage({ consumables, onSubmitReceipt, showToast, role }) {
  const [search, setSearch] = useState("");
  const [showReceiptForm, setShowReceiptForm] = useState(false);
  const canReceive = role === ROLES.MANAGER || role === ROLES.LOGISTICS;
  const filtered = consumables.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-4 sm:p-8 space-y-5">
      <SectionTitle
        title="Stock Consumable" subtitle="Ketersediaan barang habis pakai untuk maintenance"
        right={canReceive ? <PrimaryButton onClick={() => setShowReceiptForm(!showReceiptForm)}><Plus size={16} /> Terima Consumable</PrimaryButton> : null}
      />

      {showReceiptForm && canReceive && (
        <ConsumableReceiptForm consumables={consumables} onCancel={() => setShowReceiptForm(false)} onSubmit={onSubmitReceipt} showToast={showToast} />
      )}

      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2.5 w-80">
        <Search size={16} className="text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari consumable..." className="bg-transparent text-sm outline-none w-full" />
      </div>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-400 bg-gray-50/60 border-b border-gray-100">
              <th className="px-5 py-3 font-medium">Consumable</th>
              <th className="px-5 py-3 font-medium">Category</th>
              <th className="px-5 py-3 font-medium">Ready</th>
              <th className="px-5 py-3 font-medium">Reserved</th>
              <th className="px-5 py-3 font-medium">In Transit</th>
              <th className="px-5 py-3 font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => {
              const total = c.ready + c.reserved + c.in_transit;
              const low = c.ready <= c.min_stock;
              return (
                <tr key={c.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                  <td className="px-5 py-3">
                    <div className="font-medium text-gray-800">{c.name}</div>
                    {low && <div className="text-xs text-red-600 font-medium mt-0.5 flex items-center gap-1"><AlertTriangle size={11} /> Mendekati stok minimum ({c.min_stock})</div>}
                  </td>
                  <td className="px-5 py-3 text-gray-500">{c.category}</td>
                  <td className="px-5 py-3 font-semibold text-emerald-700">{c.ready}</td>
                  <td className="px-5 py-3 text-blue-600">{c.reserved}</td>
                  <td className="px-5 py-3 text-indigo-600">{c.in_transit}</td>
                  <td className="px-5 py-3 font-medium text-gray-800">{total}</td>
                </tr>
              );
            })}
            {filtered.length === 0 && <tr><td colSpan={6}><EmptyState text="Belum ada data consumable." /></td></tr>}
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
    parseSpreadsheetFile(file, {
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
        <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleFile} />
      </div>
      <div className="text-xs text-gray-400">Terima file .csv atau .xlsx/.xls — bisa langsung upload dari Excel tanpa perlu convert dulu. Preview & validasi ditampilkan sebelum konfirmasi.</div>

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

// Reads a CSV or Excel (.xlsx/.xls) file and calls back with `{ data }` —
// an array of row objects keyed by header, same shape Papa.parse's
// `header:true` mode returns. Lets every "Import Excel" panel accept
// either format without changing how it consumes the parsed rows.
function parseSpreadsheetFile(file, { complete }) {
  const isExcel = /\.xlsx?$/i.test(file.name);
  if (!isExcel) {
    Papa.parse(file, { header: true, skipEmptyLines: true, complete });
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    const wb = XLSX.read(e.target.result, { type: "array" });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet, { defval: "", raw: false });
    complete({ data });
  };
  reader.readAsArrayBuffer(file);
}

const SITE_TEMPLATE_HEADERS = ["Site Code", "Terminal ID", "Nama Site", "Customer", "Area", "Homebase", "Status"];

function MasterSite({ sites, homebases, customers, onImport, onCreate, onDelete, onBulkDelete, onToggle, showToast }) {
  const [showImport, setShowImport] = useState(false);
  const [preview, setPreview] = useState(null); // { rows: [...], errors: [...] }
  const [importing, setImporting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [addError, setAddError] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(new Set());
  const [confirmDelete, setConfirmDelete] = useState(null); // { type: "one"|"bulk", code? }
  const emptyForm = { code: "", terminalId: "", name: "", customer: "", area: "", homebase: "", status: "Active" };
  const [form, setForm] = useState(emptyForm);
  const fileInputRef = React.useRef(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [homebaseFilter, setHomebaseFilter] = useState("All");
  const [sort, setSort] = useState({ key: null, dir: "asc" });
  const handleSort = (key) => setSort((prev) => (prev.key === key ? { key, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));

  const filteredSites = sortRows(
    sites.filter((s) =>
      (statusFilter === "All" || s.status === statusFilter) &&
      (homebaseFilter === "All" || s.homebase === homebaseFilter) &&
      (!search.trim() ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.code.toLowerCase().includes(search.toLowerCase()) ||
        (s.terminalId || "").toLowerCase().includes(search.toLowerCase()))
    ),
    sort
  );

  const toggleOne = (code) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code); else next.add(code);
      return next;
    });
  };
  const toggleAllVisible = () => {
    const visibleCodes = filteredSites.map((s) => s.code);
    const allSelected = visibleCodes.every((c) => selected.has(c));
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) visibleCodes.forEach((c) => next.delete(c));
      else visibleCodes.forEach((c) => next.add(c));
      return next;
    });
  };

  const handleDeleteOne = async (code) => {
    try {
      await onDelete(code);
      showToast(`Site "${code}" berhasil dihapus`);
    } catch (err) {
      showToast(err.message || "Gagal menghapus site");
    }
  };
  const handleBulkDelete = async () => {
    const codes = Array.from(selected);
    try {
      const result = await onBulkDelete(codes);
      showToast(`${result.deleted} site berhasil dihapus`);
      setSelected(new Set());
    } catch (err) {
      showToast(err.message || "Gagal menghapus site");
    }
  };

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
    parseSpreadsheetFile(file, {
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
              {customers.filter((c) => c.status === "Active").map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">Homebase <span className="text-red-500">*</span></label>
            <select value={form.homebase} onChange={(e) => setForm({ ...form, homebase: e.target.value, area: homebases.find((h) => h.name === e.target.value)?.area || form.area })} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-600">
              <option value="">Pilih...</option>
              {homebases.filter((h) => h.status === "Active").map((h) => <option key={h.code} value={h.name}>{h.name}</option>)}
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
            <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleFile} />
          </div>
          <div className="text-xs text-gray-400">Terima file .csv atau .xlsx/.xls — bisa langsung upload dari Excel tanpa perlu convert dulu. Sistem akan menampilkan preview, validasi duplikasi Site Code, dan verifikasi Homebase sebelum konfirmasi import.</div>

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
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2.5 w-80">
            <Search size={16} className="text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama, Site Code, atau Terminal ID..." className="bg-transparent text-sm outline-none w-full" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none bg-white text-gray-600">
            <option value="All">Semua Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <select value={homebaseFilter} onChange={(e) => setHomebaseFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none bg-white text-gray-600 max-w-[180px]">
            <option value="All">Semua Homebase</option>
            {homebases.map((h) => <option key={h.code} value={h.name}>{h.name}</option>)}
          </select>
        </div>
        {selected.size > 0 && (
          <DangerButton onClick={() => setConfirmDelete({ type: "bulk" })}><X size={14} /> Hapus Terpilih ({selected.size})</DangerButton>
        )}
      </div>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-400 bg-gray-50/60 border-b border-gray-100">
              <th className="px-5 py-3 font-medium w-8">
                <input type="checkbox" checked={filteredSites.length > 0 && filteredSites.every((s) => selected.has(s.code))} onChange={toggleAllVisible} className="accent-emerald-800" />
              </th>
              <SortableHeader label="Nama Site" sortKey="name" sort={sort} onSort={handleSort} />
              <SortableHeader label="Site Code" sortKey="code" sort={sort} onSort={handleSort} />
              <th className="px-5 py-3 font-medium">Terminal ID</th>
              <SortableHeader label="Customer" sortKey="customer" sort={sort} onSort={handleSort} />
              <SortableHeader label="Area" sortKey="area" sort={sort} onSort={handleSort} />
              <SortableHeader label="Homebase" sortKey="homebase" sort={sort} onSort={handleSort} />
              <SortableHeader label="Status" sortKey="status" sort={sort} onSort={handleSort} />
              <th className="px-5 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {filteredSites.map((s) => (
              <tr key={s.code} className="border-b border-gray-50 last:border-0">
                <td className="px-5 py-3"><input type="checkbox" checked={selected.has(s.code)} onChange={() => toggleOne(s.code)} className="accent-emerald-800" /></td>
                <td className="px-5 py-3 font-medium text-gray-800">{s.name}</td>
                <td className="px-5 py-3 text-gray-400 text-xs">{s.code}</td>
                <td className="px-5 py-3 text-gray-400 text-xs">{s.terminalId}</td>
                <td className="px-5 py-3 text-gray-600">{s.customer}</td>
                <td className="px-5 py-3 text-gray-600">{s.area}</td>
                <td className="px-5 py-3 text-gray-600">{s.homebase}</td>
                <td className="px-5 py-3"><StatusBadge status={s.status} /></td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <button onClick={() => onToggle(s.code)} className="text-xs font-medium text-gray-500">{s.status === "Active" ? "Deactivate" : "Activate"}</button>
                    <button onClick={() => setConfirmDelete({ type: "one", code: s.code })} className="text-red-500 hover:text-red-700"><X size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredSites.length === 0 && <tr><td colSpan={9}><EmptyState text="Tidak ada site yang cocok." /></td></tr>}
          </tbody>
        </table>
        </div>
      </Card>

      <ConfirmDialog
        open={!!confirmDelete}
        title="Hapus Site"
        message={
          confirmDelete?.type === "bulk"
            ? `${selected.size} site terpilih akan dihapus permanen. Tindakan ini tidak bisa dibatalkan. Lanjutkan?`
            : `Site "${confirmDelete?.code}" akan dihapus permanen. Tindakan ini tidak bisa dibatalkan. Lanjutkan?`
        }
        confirmLabel="Ya, Hapus"
        danger
        onConfirm={() => {
          const target = confirmDelete;
          setConfirmDelete(null);
          if (target.type === "bulk") handleBulkDelete();
          else handleDeleteOne(target.code);
        }}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}

/* Generic, schema-driven Master Data CRUD table: used for Homebase, Area,
   Customer, and Users so each master gets a real Add form + Activate/Deactivate
   toggle without duplicating table/form boilerplate per module. */
function MasterCrudTable({ title, subtitle, entityLabel, fields, items, idField = "id", buildLabel, onCreate, onToggle, onUpdate, onDelete, onBulkDelete, importConfig, showToast }) {
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null); // null = adding new, otherwise editing this id
  const [selected, setSelected] = useState(new Set());
  const [confirmDelete, setConfirmDelete] = useState(null); // { type: "one"|"bulk", id? }
  const [statusFilter, setStatusFilter] = useState("All");
  const [sort, setSort] = useState({ key: null, dir: "asc" });
  const handleSort = (key) => setSort((prev) => (prev.key === key ? { key, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));
  const emptyForm = Object.fromEntries(fields.map((f) => [f.key, f.default ?? (f.type === "multiselect" ? [] : "")]));
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
    const requiredMissing = fields.some((f) => {
      if (f.showIf && !f.showIf(form)) return false;
      if (!f.required || (editingId && f.createOnlyRequired)) return false;
      const val = form[f.key];
      return f.type === "multiselect" ? !Array.isArray(val) || val.length === 0 : !String(val ?? "").trim();
    });
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

  const filtered = sortRows(
    (search ? items.filter((it) => buildLabel(it).toLowerCase().includes(search.toLowerCase())) : items)
      .filter((it) => statusFilter === "All" || it.status === statusFilter),
    sort
  );

  const toggleOne = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const toggleAllVisible = () => {
    const visibleIds = filtered.map((it) => it[idField]);
    const allSelected = visibleIds.every((id) => selected.has(id));
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) visibleIds.forEach((id) => next.delete(id));
      else visibleIds.forEach((id) => next.add(id));
      return next;
    });
  };
  const handleDeleteOne = async (id) => {
    try {
      await onDelete(id);
      showToast(`${label} berhasil dihapus`);
    } catch (err) {
      showToast(err.message || "Gagal menghapus");
    }
  };
  const handleBulkDelete = async () => {
    const ids = Array.from(selected);
    try {
      const result = await onBulkDelete(ids);
      const blockedCount = result?.blocked?.length || 0;
      showToast(blockedCount > 0 ? `${result.deleted} dihapus, ${blockedCount} gagal karena masih dipakai` : `${result.deleted} ${label} berhasil dihapus`);
      setSelected(new Set());
    } catch (err) {
      showToast(err.message || "Gagal menghapus");
    }
  };

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
            {fields.filter((f) => !f.showIf || f.showIf(form)).map((f) => (
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
                ) : f.type === "multiselect" ? (
                  <div className="mt-1 border border-gray-200 rounded-lg p-2.5 max-h-40 overflow-y-auto space-y-1.5">
                    {f.options.length === 0 ? (
                      <div className="text-xs text-gray-400 px-1 py-1">Tidak ada opsi tersedia</div>
                    ) : (
                      f.options.map((o) => {
                        const checked = (form[f.key] || []).includes(o);
                        return (
                          <label key={o} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => {
                                const current = form[f.key] || [];
                                const next = checked ? current.filter((v) => v !== o) : [...current, o];
                                setForm({ ...form, [f.key]: next });
                              }}
                              className="accent-emerald-800"
                            />
                            {o}
                          </label>
                        );
                      })
                    )}
                  </div>
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

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2.5 w-80">
          <Search size={16} className="text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari..." className="bg-transparent text-sm outline-none w-full" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none bg-white text-gray-600">
          <option value="All">Semua Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>
      {onBulkDelete && selected.size > 0 && (
        <div><DangerButton onClick={() => setConfirmDelete({ type: "bulk" })}><X size={14} /> Hapus Terpilih ({selected.size})</DangerButton></div>
      )}

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-400 bg-gray-50/60 border-b border-gray-100">
              {onDelete && (
                <th className="px-5 py-3 font-medium w-8">
                  <input type="checkbox" checked={filtered.length > 0 && filtered.every((it) => selected.has(it[idField]))} onChange={toggleAllVisible} className="accent-emerald-800" />
                </th>
              )}
              <SortableHeader label={idField === "id" ? "ID" : "Code"} sortKey={idField} sort={sort} onSort={handleSort} />
              {fields.filter((f) => f.key !== "status" && f.key !== "password").map((f) => (
                f.type === "multiselect"
                  ? <th key={f.key} className="px-5 py-3 font-medium">{f.label}</th>
                  : <SortableHeader key={f.key} label={f.label} sortKey={f.key} sort={sort} onSort={handleSort} />
              ))}
              <SortableHeader label="Status" sortKey="status" sort={sort} onSort={handleSort} />
              <th className="px-5 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((it) => (
              <tr key={it[idField]} className="border-b border-gray-50 last:border-0">
                {onDelete && (
                  <td className="px-5 py-3"><input type="checkbox" checked={selected.has(it[idField])} onChange={() => toggleOne(it[idField])} className="accent-emerald-800" /></td>
                )}
                <td className="px-5 py-3 text-gray-400 text-xs">{it[idField]}</td>
                {fields.filter((f) => f.key !== "status" && f.key !== "password").map((f) => <td key={f.key} className="px-5 py-3 text-gray-700">{Array.isArray(it[f.key]) ? it[f.key].join(", ") : it[f.key]}</td>)}
                <td className="px-5 py-3"><StatusBadge status={it.status} /></td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    {onUpdate && <button onClick={() => startEdit(it)} className="text-xs font-medium text-emerald-800">Edit</button>}
                    <button onClick={() => onToggle(it[idField])} className="text-xs font-medium text-gray-500">{it.status === "Active" ? "Deactivate" : "Activate"}</button>
                    {onDelete && <button onClick={() => setConfirmDelete({ type: "one", id: it[idField] })} className="text-red-500 hover:text-red-700"><X size={14} /></button>}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={fields.length + (onDelete ? 3 : 2)}><EmptyState text="Belum ada data." /></td></tr>}
          </tbody>
        </table>
        </div>
      </Card>

      {onDelete && (
        <ConfirmDialog
          open={!!confirmDelete}
          title={`Hapus ${label}`}
          message={
            confirmDelete?.type === "bulk"
              ? `${selected.size} ${label} terpilih akan dihapus permanen. Tindakan ini tidak bisa dibatalkan. Lanjutkan?`
              : `${label} "${confirmDelete?.id}" akan dihapus permanen. Tindakan ini tidak bisa dibatalkan. Lanjutkan?`
          }
          confirmLabel="Ya, Hapus"
          danger
          onConfirm={() => {
            const target = confirmDelete;
            setConfirmDelete(null);
            if (target.type === "bulk") handleBulkDelete();
            else handleDeleteOne(target.id);
          }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}

/* ============================================================
   REPORTS
   ============================================================ */

/* Generic, data-driven Reports page: filters operate on the raw data array
   (not pre-rendered rows) so date range, status, and search all actually work
   against real fields instead of decorating a static table. */
function ReportsPage({ title, subtitle, data, columns, statusOf, dateOf, searchOf, statusLabel = "Status" }) {
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
          {statusOptions.map((s) => <option key={s} value={s}>{s === "All" ? `Semua ${statusLabel}` : s}</option>)}
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
    if (!res.ok) {
      // For 500s the top-level "error" is a deliberately generic message —
      // the actual cause is in "detail" (e.g. the raw DB error). Surface it
      // so it's visible in the UI instead of only in server logs.
      const message = (data && data.error) || res.statusText || "Request failed";
      const detail = data && data.detail && data.detail !== message ? ` (${data.detail})` : "";
      throw new Error(message + detail);
    }
    return data;
  }

  return {
    login: (username, password) => request("/auth/login", { method: "POST", body: { username, password } }),

    getMaterials: () => request("/materials"),
    createMaterial: (payload) => request("/materials", { method: "POST", body: payload }),
    toggleMaterialStatus: (id) => request(`/materials/${id}/toggle-status`, { method: "PATCH" }),
    importMaterials: (rows) => request("/materials/import", { method: "POST", body: { rows } }),
    deleteMaterial: (id) => request(`/materials/${id}`, { method: "DELETE" }),
    bulkDeleteMaterials: (ids) => request("/materials/bulk-delete", { method: "POST", body: { ids } }),
    getMaterialCascadePreview: (id) => request(`/materials/${id}/cascade-preview`),
    forceDeleteMaterial: (id) => request(`/materials/${id}/force`, { method: "DELETE" }),

    getConsumables: () => request("/consumables"),
    createConsumable: (payload) => request("/consumables", { method: "POST", body: payload }),
    toggleConsumableStatus: (id) => request(`/consumables/${id}/toggle-status`, { method: "PATCH" }),
    importConsumables: (rows) => request("/consumables/import", { method: "POST", body: { rows } }),
    deleteConsumable: (id) => request(`/consumables/${id}`, { method: "DELETE" }),
    bulkDeleteConsumables: (ids) => request("/consumables/bulk-delete", { method: "POST", body: { ids } }),
    getConsumableReceipts: () => request("/consumables/receipts"),
    createConsumableReceipt: (payload) => request("/consumables/receipts", { method: "POST", body: payload }),

    getAreas: () => request("/areas"),
    createArea: (payload) => request("/areas", { method: "POST", body: payload }),
    toggleAreaStatus: (code) => request(`/areas/${code}/toggle-status`, { method: "PATCH" }),
    importAreas: (rows) => request("/areas/import", { method: "POST", body: { rows } }),
    deleteArea: (code) => request(`/areas/${code}`, { method: "DELETE" }),
    bulkDeleteAreas: (codes) => request("/areas/bulk-delete", { method: "POST", body: { codes } }),

    getHomebases: () => request("/homebases"),
    createHomebase: (payload) => request("/homebases", { method: "POST", body: payload }),
    toggleHomebaseStatus: (code) => request(`/homebases/${code}/toggle-status`, { method: "PATCH" }),
    importHomebases: (rows) => request("/homebases/import", { method: "POST", body: { rows } }),
    deleteHomebase: (code) => request(`/homebases/${code}`, { method: "DELETE" }),
    bulkDeleteHomebases: (codes) => request("/homebases/bulk-delete", { method: "POST", body: { codes } }),

    getCustomers: () => request("/customers"),
    createCustomer: (payload) => request("/customers", { method: "POST", body: payload }),
    toggleCustomerStatus: (id) => request(`/customers/${id}/toggle-status`, { method: "PATCH" }),
    importCustomers: (rows) => request("/customers/import", { method: "POST", body: { rows } }),
    deleteCustomer: (id) => request(`/customers/${id}`, { method: "DELETE" }),
    bulkDeleteCustomers: (codes) => request("/customers/bulk-delete", { method: "POST", body: { codes } }),

    getSites: () => request("/sites"),
    createSite: (payload) => request("/sites", { method: "POST", body: payload }),
    importSites: (rows) => request("/sites/import", { method: "POST", body: { rows } }),
    deleteSite: (code) => request(`/sites/${encodeURIComponent(code)}`, { method: "DELETE" }),
    bulkDeleteSites: (codes) => request("/sites/bulk-delete", { method: "POST", body: { codes } }),
    toggleSiteStatus: (code) => request(`/sites/${encodeURIComponent(code)}/toggle-status`, { method: "PATCH" }),

    getUsers: () => request("/users"),
    createUser: (payload) => request("/users", { method: "POST", body: payload }),
    updateUser: (id, payload) => request(`/users/${id}`, { method: "PATCH", body: payload }),
    toggleUserStatus: (id) => request(`/users/${id}/toggle-status`, { method: "PATCH" }),

    getStock: (customer, onlyWithHistory) => {
      const params = new URLSearchParams();
      if (customer) params.set("customer", customer);
      if (onlyWithHistory) params.set("onlyWithHistory", "1");
      const qs = params.toString();
      return request(`/stock${qs ? `?${qs}` : ""}`);
    },
    getTransferOptions: (material, customer) => request(`/stock/transfer-options?material=${encodeURIComponent(material)}&customer=${encodeURIComponent(customer)}`),
    getTransfers: () => request("/stock/transfers"),
    createTransfer: (payload) => request("/stock/transfers", { method: "POST", body: payload }),
    getPhantomStockRows: () => request("/stock/phantom-check"),
    cleanupPhantomStockRows: () => request("/stock/phantom-cleanup", { method: "POST" }),
    getMovements: (material) => request(`/stock/movements${material ? `?material=${encodeURIComponent(material)}` : ""}`),
    getSerials: (material, status, customer, homebase) => {
      const params = new URLSearchParams();
      if (material) params.set("material", material);
      if (status) params.set("status", status);
      if (customer !== undefined) params.set("customer", customer || "");
      if (homebase) params.set("homebase", homebase);
      const qs = params.toString();
      return request(`/stock/serials${qs ? `?${qs}` : ""}`);
    },
    searchSerials: (q) => request(`/stock/serials?q=${encodeURIComponent(q)}`),
    sendSerialToCustomer: (sn, ref, note) => request(`/stock/serials/${encodeURIComponent(sn)}/send-to-customer`, { method: "POST", body: { ref, note } }),
    receiveSerialFromCustomer: (sn, ref, note) => request(`/stock/serials/${encodeURIComponent(sn)}/receive-from-customer`, { method: "POST", body: { ref, note } }),
    getSerialCustomerReturnHistory: (sn) => request(`/stock/serials/${encodeURIComponent(sn)}/customer-return-history`),
    createReceipt: (payload) => request("/stock/receipts", { method: "POST", body: payload }),
    getReceipts: () => request("/stock/receipts"),

    // ---- Tools / Alat (shared pool, no division split — Peminjaman now happens via Delivery Request) ----
    getTools: () => request("/tools"),
    createTool: (payload) => request("/tools", { method: "POST", body: payload }),
    toggleToolStatus: (id) => request(`/tools/${id}/toggle-status`, { method: "PATCH" }),
    deleteTool: (id) => request(`/tools/${id}`, { method: "DELETE" }),
    bulkDeleteTools: (ids) => request("/tools/bulk-delete", { method: "POST", body: { ids } }),
    getToolSerials: (tool, status) => {
      const params = new URLSearchParams();
      if (tool) params.set("tool", tool);
      if (status) params.set("status", status);
      const qs = params.toString();
      return request(`/tools/serials${qs ? `?${qs}` : ""}`);
    },
    createToolReceipt: (payload) => request("/tools/receipts", { method: "POST", body: payload }),
    getToolReceipts: () => request("/tools/receipts"),
    searchToolSerials: (q) => request(`/tools/serials?q=${encodeURIComponent(q)}`),

    getDeliveries: () => request("/deliveries"),
    createDelivery: (payload) => request("/deliveries", { method: "POST", body: payload }),
    approveDelivery: (id) => request(`/deliveries/${id}/approve`, { method: "POST" }),
    rejectDelivery: (id, reason) => request(`/deliveries/${id}/reject`, { method: "POST", body: { reason } }),
    assignDeliveryStock: (id, serialSelections) => request(`/deliveries/${id}/assign-stock`, { method: "POST", body: serialSelections ? { serialSelections } : {} }),
    shipDelivery: (id, payload) => request(`/deliveries/${id}/ship`, { method: "POST", body: payload }),
    addDeliveryResi: (id, payload) => request(`/deliveries/${id}/resi`, { method: "POST", body: payload }),
    addDeliveryBast: (id, payload) => request(`/deliveries/${id}/bast`, { method: "POST", body: payload }),
    addDeliveryBkbLink: (id, bkbLink) => request(`/deliveries/${id}/bkb-link`, { method: "POST", body: { bkbLink } }),
    returnDeliveryTools: (id, payload) => request(`/deliveries/${id}/return-tools`, { method: "POST", body: payload }),

    // ---- Penggantian Material (install & swap a faulty unit for a new one) ----
    getMaterialSwaps: () => request("/material-swaps"),
    createMaterialSwap: (payload) => request("/material-swaps", { method: "POST", body: payload }),
    advanceDelivery: (id, payload) => request(`/deliveries/${id}/advance`, { method: "POST", body: payload }),

    getReturns: () => request("/returns"),
    createReturn: (payload) => request("/returns", { method: "POST", body: payload }),
    approveReturn: (id) => request(`/returns/${id}/approve`, { method: "POST" }),
    reviseReturn: (id, note) => request(`/returns/${id}/revise`, { method: "POST", body: { note } }),
    resubmitReturn: (id, payload) => request(`/returns/${id}/resubmit`, { method: "POST", body: payload }),
    shipReturn: (id) => request(`/returns/${id}/ship`, { method: "POST" }),
    addResi: (id, payload) => request(`/returns/${id}/resi`, { method: "POST", body: payload }),
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

        {error && <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-lg px-3 py-2">{error}</div>}
        <form onSubmit={(e) => { e.preventDefault(); doLogin(username, password); }} className="space-y-3">
          <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" type="text" autoCapitalize="none" autoCorrect="off" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-emerald-600" />
          <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-emerald-600" />
          <PrimaryButton type="submit" disabled={loading} className="w-full">{loading ? "Masuk..." : "Masuk"}</PrimaryButton>
        </form>
      </Card>
    </div>
  );
}

function PhantomStockCleanup({ api, showToast }) {
  const [rows, setRows] = useState(null); // null = not checked yet
  const [checking, setChecking] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const check = async () => {
    setChecking(true);
    try {
      const result = await api.getPhantomStockRows();
      setRows(result.rows);
    } catch (err) {
      showToast(err.message || "Gagal memeriksa data");
    } finally {
      setChecking(false);
    }
  };

  const cleanup = async () => {
    setCleaning(true);
    try {
      const result = await api.cleanupPhantomStockRows();
      showToast(`${result.deleted} baris data kosong berhasil dibersihkan`);
      setRows([]);
    } catch (err) {
      showToast(err.message || "Gagal membersihkan data");
    } finally {
      setCleaning(false);
    }
  };

  return (
    <Card className="p-5 space-y-3 text-sm">
      <div>
        <div className="font-semibold text-gray-800">Pembersihan Data Stock Kosong</div>
        <div className="text-gray-500 text-xs mt-1">
          Cek apakah ada baris data stock per-divisi yang "kosong" (tidak pernah ada transaksi asli — bukan sekadar stock yang sudah habis). Ini yang menyebabkan material tampil di filter divisi Warehouse Stock padahal divisi itu tidak pernah menerimanya.
        </div>
      </div>

      <GhostButton onClick={check} disabled={checking}>{checking ? "Memeriksa..." : "Cek Data"}</GhostButton>

      {rows !== null && (
        <div className="pt-2 border-t border-gray-50">
          {rows.length === 0 ? (
            <div className="text-emerald-700 text-xs">✓ Tidak ada data kosong yang ditemukan.</div>
          ) : (
            <>
              <div className="text-red-600 text-xs font-medium mb-2">{rows.length} baris data kosong ditemukan:</div>
              <div className="max-h-40 overflow-y-auto border border-gray-100 rounded-lg divide-y divide-gray-50 mb-3">
                {rows.map((r, i) => (
                  <div key={i} className="px-3 py-1.5 text-xs text-gray-600">{r.material} — <span className="text-gray-400">{r.customer}</span></div>
                ))}
              </div>
              <DangerButton onClick={() => setConfirmOpen(true)} disabled={cleaning}>{cleaning ? "Membersihkan..." : `Bersihkan ${rows.length} Baris Ini`}</DangerButton>
            </>
          )}
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Bersihkan Data Kosong"
        message={`${rows?.length || 0} baris data akan dihapus permanen. Sistem sudah memverifikasi tidak ada riwayat transaksi asli di baris-baris ini. Lanjutkan?`}
        confirmLabel="Ya, Bersihkan"
        danger
        onConfirm={() => { setConfirmOpen(false); cleanup(); }}
        onCancel={() => setConfirmOpen(false)}
      />
    </Card>
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
  const [highlightSerial, setHighlightSerial] = useState("");
  const [highlightToken, setHighlightToken] = useState(0);
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
  const [tools, setTools] = useState([]);
  const [toolSerialName, setToolSerialName] = useState("");
  const [consumables, setConsumables] = useState([]);
  const [materialSwaps, setMaterialSwaps] = useState([]);
  const [returnPrefill, setReturnPrefill] = useState(null);
  const [selectedSwap, setSelectedSwap] = useState(null);
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
      const [mats, movs, dels, rets, recs, sts, hbs, ars, custs, usrs, tls, swaps, csms] = await Promise.all([
        api.getStock(), api.getMovements(), api.getDeliveries(), api.getReturns(),
        api.getReconciliations(), api.getSites(), api.getHomebases(), api.getAreas(),
        api.getCustomers(), api.getUsers().catch(() => []), // Users list is Manager-only; ignore 403 for other roles
        api.getTools(), api.getMaterialSwaps(), api.getConsumables(),
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
      setTools(tls);
      setMaterialSwaps(swaps);
      setConsumables(csms);
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
    setSites([]); setHomebases([]); setAreas([]); setCustomers([]); setUsers([]); setConsumables([]);
    setPage("dashboard");
  };

  // Refreshes just materials + movements — used after any action that
  // touches warehouse stock, instead of a full reload of every collection.
  const refreshStock = async () => {
    try {
      const [mats, movs, tls, csms] = await Promise.all([api.getStock(), api.getMovements(), api.getTools(), api.getConsumables()]);
      setMaterials(mats.map(normalizeMaterial));
      setMovements(movs);
      setTools(tls);
      setConsumables(csms);
    } catch (err) {
      setApiError(err.message);
    }
  };

  const createReceipt = async (payload) => {
    await api.createReceipt(payload);
    await refreshStock();
  };

  // ---- Tools / Peminjaman Alat ----
  const refreshTools = async () => {
    try {
      const tls = await api.getTools();
      setTools(tls);
    } catch (err) {
      setApiError(err.message);
    }
  };

  const createToolReceipt = async (payload) => {
    await api.createToolReceipt(payload);
    await refreshTools();
  };

  const createToolMaster = async (payload) => {
    const created = await api.createTool(payload);
    setTools((prev) => [...prev, created]);
  };
  const toggleTool = async (id) => {
    const updated = await api.toggleToolStatus(id);
    setTools((prev) => prev.map((t) => (t.id === id ? updated : t)));
  };
  const deleteToolFromServer = async (id) => {
    await api.deleteTool(id);
    setTools((prev) => prev.filter((t) => t.id !== id));
  };
  const bulkDeleteToolsFromServer = async (ids) => {
    const result = await api.bulkDeleteTools(ids);
    // Only remove from the visible list what the backend actually deleted —
    // ids in `blocked` are still protected (still in use) and must stay
    // visible, or the UI lies about what's really in the database.
    const blockedSet = new Set(result.blocked || []);
    setTools((prev) => prev.filter((t) => !ids.includes(t.id) || blockedSet.has(t.id)));
    return result;
  };

  const createConsumable = async (payload) => {
    const created = await api.createConsumable(payload);
    setConsumables((prev) => [...prev, created]);
  };
  const toggleConsumable = async (id) => {
    const updated = await api.toggleConsumableStatus(id);
    setConsumables((prev) => prev.map((c) => (c.id === id ? { ...c, status: updated.status } : c)));
  };
  const importConsumablesToServer = async (rows) => {
    const result = await api.importConsumables(rows);
    const list = await api.getConsumables();
    setConsumables(list);
    return result;
  };
  const deleteConsumableFromServer = async (id) => {
    await api.deleteConsumable(id);
    setConsumables((prev) => prev.filter((c) => c.id !== id));
  };
  const bulkDeleteConsumablesFromServer = async (ids) => {
    const result = await api.bulkDeleteConsumables(ids);
    const blockedSet = new Set(result.blocked || []);
    setConsumables((prev) => prev.filter((c) => !ids.includes(c.id) || blockedSet.has(c.id)));
    return result;
  };
  const createConsumableReceipt = async (payload) => {
    const created = await api.createConsumableReceipt(payload);
    const list = await api.getConsumables();
    setConsumables(list);
    return created;
  };

  // Tools attached to a Delivery Request come back independently of that
  // delivery's own status — this can be called any time, including long
  // after the delivery itself is "Delivered".
  const returnDeliveryTools = async (id, payload) => {
    try {
      const updated = await api.returnDeliveryTools(id, payload);
      setDeliveries((prev) => prev.map((d) => (d.id === id ? updated : d)));
      await refreshTools();
    } catch (err) { setApiError(err.message); }
  };

  // Confirming installed units doesn't touch stock (they already left the
  // warehouse when Delivered) — just update the delivery's SN statuses.
  const submitMaterialSwap = async (payload) => {
    const created = await api.createMaterialSwap(payload);
    setMaterialSwaps((prev) => [created, ...prev]);
    return created;
  };

  const goto = (p) => {
    setPage(p);
    setSelectedDelivery(null); setSelectedReturn(null); setSelectedRecon(null); setSelectedSwap(null);
    if (p !== "returnFaultyCreate") setReturnPrefill(null); // only meant for the one navigation right after a swap
  };

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

    tools.forEach((t) => {
      if (t.name.toLowerCase().includes(q) || t.category.toLowerCase().includes(q) || t.id.toLowerCase().includes(q)) {
        results.push({ type: "Alat", icon: Wrench, label: t.name, sub: `Available: ${t.available} · Checked Out: ${t.checked_out}`, onSelect: () => goto("toolStock") });
      }
    });

    materialSwaps.forEach((s) => {
      const matches = s.id.toLowerCase().includes(q) || (s.site || "").toLowerCase().includes(q)
        || s.newSn.toLowerCase().includes(q) || s.newMaterial.toLowerCase().includes(q)
        || (s.oldSn || "").toLowerCase().includes(q) || (s.oldMaterial || "").toLowerCase().includes(q);
      if (matches) {
        results.push({
          type: "Penggantian Material", icon: ArrowLeftRight, label: s.id,
          sub: s.oldSn ? `${s.oldSn} → ${s.newSn} · ${s.site}` : `${s.newSn} · ${s.site}`,
          onSelect: () => goto("materialSwap"),
        });
      }
    });

    return results.slice(0, 8);
  }, [searchQuery, deliveries, returns, reconciliations, materials, sites, tools, materialSwaps]);

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
            const d = deliveries.find((x) => x.id === r.current_ref);
            const location = d ? `${d.homebase}${d.site ? ` · ${d.site}` : ""}` : r.current_ref;
            sub = `${r.material} · ${r.status} · ${location}`;
            onSelect = () => gotoDetail("delivery", "delivery", r.current_ref);
          } else if (r.current_ref?.startsWith("RF-")) {
            sub = `${r.material} · ${r.status} · ${r.current_ref}`;
            onSelect = () => gotoDetail("returnFaulty", "return", r.current_ref);
          } else {
            sub = `${r.material} · ${r.status} · di Warehouse`;
            onSelect = () => { setSerialMaterial(r.material); setHighlightSerial(r.sn); setHighlightToken((t) => t + 1); goto("serialDetail"); };
          }
          return { type: "Serial Number", icon: Package, label: r.sn, sub, onSelect };
        }));
      }).catch(() => { if (!cancelled) setSnSearchResults([]); });
    }, 300);
    return () => { cancelled = true; clearTimeout(timer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // Same idea, but for the tool Serial Number registry — a separate table
  // (tool_serials) from the material one above, so it needs its own search.
  const [toolSnSearchResults, setToolSnSearchResults] = useState([]);
  React.useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 3) { setToolSnSearchResults([]); return; }
    let cancelled = false;
    const timer = setTimeout(() => {
      api.searchToolSerials(q).then((rows) => {
        if (cancelled) return;
        setToolSnSearchResults(rows.map((r) => {
          let sub, onSelect;
          if (r.current_ref?.startsWith("DR-")) {
            const d = deliveries.find((x) => x.id === r.current_ref);
            const location = d ? `${d.homebase}${d.site ? ` · ${d.site}` : ""}` : r.current_ref;
            sub = `${r.tool} · ${r.status} · ${location}`;
            onSelect = () => gotoDetail("delivery", "delivery", r.current_ref);
          } else {
            sub = `${r.tool} · ${r.status} · di Warehouse`;
            onSelect = () => { setToolSerialName(r.tool); goto("toolSerialDetail"); };
          }
          return { type: "Serial Number Alat", icon: Wrench, label: r.sn, sub, onSelect };
        }));
      }).catch(() => { if (!cancelled) setToolSnSearchResults([]); });
    }, 300);
    return () => { cancelled = true; clearTimeout(timer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const searchResults = useMemo(() => [...snSearchResults, ...toolSnSearchResults, ...localSearchResults].slice(0, 8), [snSearchResults, toolSnSearchResults, localSearchResults]);

  // Where is each delivered unit right now? Flatten every Delivered
  // delivery's items into one row per Serial Number (or per material line
  // for non-serialized items), carrying the destination Homebase/Site along
  // — this is exactly the data already tracked via delivery.items[].serials,
  // just reshaped for a location-first view instead of a request-first one.
  // Materials only — tools ride along in a delivery too but they get
  // returned rather than permanently placed, so they don't belong in a
  // "where are our devices" report.
  const deviceLocations = useMemo(() => {
    const rows = [];
    deliveries.filter((d) => d.status === "Delivered").forEach((d) => {
      d.items.filter((item) => item.type !== "tool").forEach((item) => {
        if (item.serials && item.serials.length > 0) {
          item.serials.forEach((sn) => {
            const status = item.serialStatuses?.[sn] || "Delivered";
            // If this unit's been confirmed Installed, the site recorded at
            // confirmation time is the accurate one — falls back to the
            // delivery's own site when that wasn't specified either way.
            const site = item.serialInstallInfo?.[sn]?.installSite || d.site;
            rows.push({ sn, material: item.material, qty: 1, homebase: d.homebase, site, requester: d.requester, deliveryId: d.id, date: d.date, status });
          });
        } else {
          rows.push({ sn: "-", material: item.material, qty: item.qty, homebase: d.homebase, site: d.site, requester: d.requester, deliveryId: d.id, date: d.date, status: "Delivered" });
        }
      });
    });
    return rows;
  }, [deliveries]);

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

  const shipDelivery = async (id, payload) => {
    try {
      const updated = await api.shipDelivery(id, payload);
      setDeliveries((prev) => prev.map((d) => (d.id === id ? updated : d)));
      await refreshStock();
    } catch (err) { setApiError(err.message); throw err; }
  };

  const addDeliveryResi = async (id, payload) => {
    try {
      const updated = await api.addDeliveryResi(id, payload);
      setDeliveries((prev) => prev.map((d) => (d.id === id ? updated : d)));
    } catch (err) { setApiError(err.message); }
  };

  const addDeliveryBast = async (id, payload) => {
    try {
      const updated = await api.addDeliveryBast(id, payload);
      setDeliveries((prev) => prev.map((d) => (d.id === id ? updated : d)));
    } catch (err) { setApiError(err.message); }
  };

  const addDeliveryBkbLink = async (id, bkbLink) => {
    try {
      const updated = await api.addDeliveryBkbLink(id, bkbLink);
      setDeliveries((prev) => prev.map((d) => (d.id === id ? updated : d)));
    } catch (err) { setApiError(err.message); }
  };

  const rejectDelivery = async (id, reason) => {
    try {
      const updated = await api.rejectDelivery(id, reason);
      setDeliveries((prev) => prev.map((d) => (d.id === id ? updated : d)));
    } catch (err) { setApiError(err.message); }
  };

  const advanceDelivery = async (id, payload) => {
    try {
      const updated = await api.advanceDelivery(id, payload);
      setDeliveries((prev) => prev.map((d) => (d.id === id ? updated : d)));
      await refreshStock();
    } catch (err) { setApiError(err.message); throw err; }
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
    // /api/materials/:id/toggle-status isn't division-scoped (it's a pure
    // Master Data endpoint) — only take its `status` field and keep the
    // ready/faulty/reserved/in_transit numbers already in state, which came
    // from the properly-scoped /api/stock instead.
    setMaterials((prev) => prev.map((m) => (m.id === id ? { ...m, status: updated.status } : m)));
  };
  const importMaterialsToServer = async (rows) => {
    const result = await api.importMaterials(rows);
    const list = await api.getStock();
    setMaterials(list.map(normalizeMaterial));
    return result;
  };
  const deleteMaterialFromServer = async (id) => {
    await api.deleteMaterial(id);
    setMaterials((prev) => prev.filter((m) => m.id !== id));
  };
  const bulkDeleteMaterialsFromServer = async (ids) => {
    const result = await api.bulkDeleteMaterials(ids);
    const blockedSet = new Set(result.blocked || []);
    setMaterials((prev) => prev.filter((m) => !ids.includes(m.id) || blockedSet.has(m.id)));
    return result;
  };
  const getMaterialCascadePreview = (id) => api.getMaterialCascadePreview(id);
  const forceDeleteMaterialFromServer = async (id) => {
    await api.forceDeleteMaterial(id);
    setMaterials((prev) => prev.filter((m) => m.id !== id));
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
  const deleteSiteFromServer = async (code) => {
    await api.deleteSite(code);
    setSites((prev) => prev.filter((s) => s.code !== code));
  };
  const bulkDeleteSitesFromServer = async (codes) => {
    const result = await api.bulkDeleteSites(codes);
    const blockedSet = new Set(result.blocked || []);
    setSites((prev) => prev.filter((s) => !codes.includes(s.code) || blockedSet.has(s.code)));
    return result;
  };
  const toggleSite = async (code) => {
    const updated = await api.toggleSiteStatus(code);
    setSites((prev) => prev.map((s) => (s.code === code ? normalizeSite(updated) : s)));
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
  const deleteHomebaseFromServer = async (code) => {
    await api.deleteHomebase(code);
    setHomebases((prev) => prev.filter((h) => h.code !== code));
  };
  const bulkDeleteHomebasesFromServer = async (codes) => {
    const result = await api.bulkDeleteHomebases(codes);
    const blockedSet = new Set(result.blocked || []);
    setHomebases((prev) => prev.filter((h) => !codes.includes(h.code) || blockedSet.has(h.code)));
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
  const deleteAreaFromServer = async (code) => {
    await api.deleteArea(code);
    setAreas((prev) => prev.filter((a) => a.code !== code));
  };
  const bulkDeleteAreasFromServer = async (codes) => {
    const result = await api.bulkDeleteAreas(codes);
    const blockedSet = new Set(result.blocked || []);
    setAreas((prev) => prev.filter((a) => !codes.includes(a.code) || blockedSet.has(a.code)));
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
  const deleteCustomerFromServer = async (id) => {
    await api.deleteCustomer(id);
    setCustomers((prev) => prev.filter((c) => c.id !== id));
  };
  const bulkDeleteCustomersFromServer = async (ids) => {
    const result = await api.bulkDeleteCustomers(ids);
    const blockedSet = new Set(result.blocked || []);
    setCustomers((prev) => prev.filter((c) => !ids.includes(c.id) || blockedSet.has(c.id)));
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
    stockTransfer: ["Transfer Stock", "Pindahkan stock antar homebase"],
    consumableStock: ["Stock Consumable", ""],
    serialDetail: ["Warehouse Stock", "Detail Serial Number"],
    reports: ["Reports", ""], reportsFaulty: ["Reports", ""], reportsRecon: ["Reports", ""],
    masterMaterial: ["Master Data", ""], masterSite: ["Master Data", ""], masterHomebase: ["Master Data", ""], masterArea: ["Master Data", ""], masterCustomer: ["Master Data", ""], masterConsumable: ["Master Data", ""],
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
  } else if (page === "dashboard") content = <Dashboard role={role} userName={currentUser?.name} setPage={goto} deliveries={deliveries} returns={returns} reconciliations={reconciliations} materials={materials} tools={tools} materialSwaps={materialSwaps} />;
  else if (page === "delivery") {
    if (selectedDelivery) {
      const d = deliveries.find((x) => x.id === selectedDelivery);
      content = <DeliveryDetail delivery={d} onBack={() => setSelectedDelivery(null)} onApprove={approveDelivery} onReject={rejectDelivery} onAssignStock={assignDeliveryStock} onShip={shipDelivery} onAddResi={addDeliveryResi} onAddBast={addDeliveryBast} onAddBkbLink={addDeliveryBkbLink} onAdvance={advanceDelivery} onReturnTools={returnDeliveryTools} role={role} materials={materials} tools={tools} api={api} />;
    } else content = <DeliveryList deliveries={deliveries} setSelected={setSelectedDelivery} setPage={goto} role={role} />;
  } else if (page === "deliveryCreate") content = <DeliveryCreate onSubmit={submitDelivery} onCancel={() => goto("delivery")} materials={materials} tools={tools} consumables={consumables} sites={sites} homebases={homebases} currentUser={currentUser} customers={customers} api={api} />;
  else if (page === "returnFaulty") {
    if (selectedReturn) {
      const r = returns.find((x) => x.id === selectedReturn);
      content = <ReturnFaultyDetail r={r} onBack={() => setSelectedReturn(null)} onApprove={approveReturn} onRevise={reviseReturn} onShip={shipReturn} onAddResi={addResiReturn} onReceive={receiveReturn} onQC={qcReturn} onComplete={completeReturn} onEdit={() => setPage("returnFaultyEdit")} role={role} />;
    } else content = <ReturnFaultyList returns={returns} setSelected={setSelectedReturn} setPage={goto} role={role} />;
  } else if (page === "returnFaultyCreate") content = <ReturnFaultyCreate onSubmit={submitReturn} onCancel={() => goto("returnFaulty")} materials={materials} returns={returns} reconciliations={reconciliations} currentUser={currentUser} customers={customers} prefillItems={returnPrefill ? [returnPrefill] : undefined} />;
  else if (page === "returnFaultyEdit") {
    const r = returns.find((x) => x.id === selectedReturn);
    content = <ReturnFaultyCreate
      onSubmit={(data) => resubmitReturn(r.id, data)}
      onCancel={() => setPage("returnFaulty")}
      materials={materials}
      returns={returns}
      reconciliations={reconciliations}
      initialData={{ items: r.items, docs: r.docs }}
      excludeId={r.id}
      revisionNote={r.revisionNote}
      currentUser={currentUser}
      customers={customers}
    />;
  }
  else if (page === "reconciliation") {
    if (selectedRecon) {
      const r = reconciliations.find((x) => x.id === selectedRecon);
      content = <ReconciliationDetail r={r} onBack={() => setSelectedRecon(null)} onApprove={approveRecon} onRevise={reviseRecon} onEdit={() => setPage("reconciliationEdit")} role={role} />;
    } else content = <ReconciliationList items={reconciliations} setSelected={setSelectedRecon} setPage={goto} role={role} />;
  } else if (page === "reconciliationCreate") content = <ReconciliationCreate onSubmit={submitRecon} onCancel={() => goto("reconciliation")} materials={materials} returns={returns} reconciliations={reconciliations} homebases={homebases} currentUser={currentUser} customers={customers} />;
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
      currentUser={currentUser}
      customers={customers}
    />;
  }
  else if (page === "materialSwap") {
    if (selectedSwap) {
      const s = materialSwaps.find((x) => x.id === selectedSwap);
      content = <MaterialSwapDetail swap={s} onBack={() => setSelectedSwap(null)} setPage={goto} setReturnPrefill={setReturnPrefill} />;
    } else content = <MaterialSwapPage swaps={materialSwaps} api={api} materials={materials} sites={sites} homebases={homebases} onSubmit={submitMaterialSwap} showToast={showToast} setPage={goto} setReturnPrefill={setReturnPrefill} setSelectedSwap={setSelectedSwap} role={role} />;
  }
  else if (page === "stock") content = <WarehouseStock materials={materials} setPage={goto} setMovementFilter={setMovementFilter} setSerialMaterial={setSerialMaterial} onSubmitReceipt={createReceipt} showToast={showToast} clearSerialHighlight={() => setHighlightSerial("")} currentUser={currentUser} customers={customers} role={role} api={api} />;
  else if (page === "movement") content = <StockMovement movements={movements} filter={movementFilter} setFilter={setMovementFilter} deliveries={deliveries} />;
  else if (page === "serialDetail") content = <MaterialSerialDetail material={serialMaterial} api={api} onBack={() => goto("stock")} highlightSerial={highlightSerial} highlightToken={highlightToken} deliveries={deliveries} role={role} showToast={showToast} />;
  else if (page === "toolStock") content = <ToolStockPage tools={tools} setPage={goto} setToolSerialName={setToolSerialName} onSubmitReceipt={createToolReceipt} showToast={showToast} role={role} />;
  else if (page === "consumableStock") content = <ConsumableStockPage consumables={consumables} onSubmitReceipt={createConsumableReceipt} showToast={showToast} role={role} />;
  else if (page === "stockTransfer") content = <TransferStockPage materials={materials} homebases={homebases} customers={customers} currentUser={currentUser} role={role} api={api} showToast={showToast} />;
  else if (page === "toolSerialDetail") content = <ToolSerialDetail toolName={toolSerialName} api={api} onBack={() => goto("toolStock")} />;
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
  else if (page === "reportsDeviceLocation") content = <ReportsPage
    title="Lokasi Perangkat" subtitle="Posisi perangkat yang sudah Delivered — status menunjukkan apakah sudah dikonfirmasi ter-install di site"
    data={deviceLocations}
    statusOf={(r) => r.homebase}
    statusLabel="Homebase"
    dateOf={(r) => r.date}
    searchOf={(r) => `${r.sn} ${r.material} ${r.homebase} ${r.site} ${r.requester} ${r.deliveryId}`}
    columns={[
      { label: "Serial Number", render: (r) => r.sn, exportValue: (r) => r.sn },
      { label: "Material", render: (r) => r.material, exportValue: (r) => r.material },
      { label: "Status", render: (r) => <StatusBadge status={r.status} />, exportValue: (r) => r.status },
      { label: "Qty", render: (r) => r.qty, exportValue: (r) => r.qty },
      { label: "Homebase", render: (r) => r.homebase, exportValue: (r) => r.homebase },
      { label: "Site", render: (r) => r.site || "-", exportValue: (r) => r.site || "-" },
      { label: "Diminta oleh", render: (r) => r.requester, exportValue: (r) => r.requester },
      { label: "No. Delivery", render: (r) => r.deliveryId, exportValue: (r) => r.deliveryId },
      { label: "Tgl Dikirim", render: (r) => r.date, exportValue: (r) => r.date },
    ]}
  />;
  else if (page === "masterMaterial") content = <MasterMaterial materials={materials} onCreate={createMaterial} onToggle={toggleMaterial} onImport={importMaterialsToServer} onDelete={deleteMaterialFromServer} onBulkDelete={bulkDeleteMaterialsFromServer} onGetCascadePreview={getMaterialCascadePreview} onForceDelete={forceDeleteMaterialFromServer} showToast={showToast} />;
  else if (page === "masterSite") content = <MasterSite sites={sites} homebases={homebases} customers={customers} onImport={importSitesToServer} onCreate={createSiteToServer} onDelete={deleteSiteFromServer} onBulkDelete={bulkDeleteSitesFromServer} onToggle={toggleSite} showToast={showToast} />;
  else if (page === "masterHomebase") content = <MasterCrudTable
    title="Master Homebase" subtitle="Data homebase & PIC tim lapangan"
    entityLabel="Homebase" showToast={showToast}
    items={homebases} idField="code"
    buildLabel={(h) => `${h.name} ${h.area} ${h.pic}`}
    onCreate={createHomebase} onToggle={toggleHomebase} onDelete={deleteHomebaseFromServer} onBulkDelete={bulkDeleteHomebasesFromServer}
    fields={[
      { key: "name", label: "Nama Homebase", required: true },
      { key: "area", label: "Area", type: "select", options: areas.filter((a) => a.status === "Active").map((a) => a.name), required: true },
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
    onCreate={createArea} onToggle={toggleArea} onDelete={deleteAreaFromServer} onBulkDelete={bulkDeleteAreasFromServer}
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
    onCreate={createCustomer} onToggle={toggleCustomer} onDelete={deleteCustomerFromServer} onBulkDelete={bulkDeleteCustomersFromServer}
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
  else if (page === "masterTools") content = <MasterTools tools={tools} onCreate={createToolMaster} onToggle={toggleTool} onDelete={deleteToolFromServer} onBulkDelete={bulkDeleteToolsFromServer} showToast={showToast} />;
  else if (page === "masterConsumable") content = <MasterConsumable consumables={consumables} onCreate={createConsumable} onToggle={toggleConsumable} onDelete={deleteConsumableFromServer} onBulkDelete={bulkDeleteConsumablesFromServer} showToast={showToast} />;
  else if (page === "users") content = <MasterCrudTable
    title="User Management" subtitle="Kelola akses pengguna sistem"
    entityLabel="User" showToast={showToast}
    items={users} idField="id"
    buildLabel={(u) => `${u.name} ${u.role} ${u.assignment} ${(u.customers || []).join(" ")}`}
    onCreate={createUserAccount} onToggle={toggleUser} onUpdate={updateUserAccount}
    fields={[
      { key: "name", label: "Nama", required: true },
      { key: "username", label: "Username", required: true },
      { key: "password", label: "Password", required: true, createOnlyRequired: true, inputType: "password" },
      { key: "role", label: "Role", type: "select", options: Object.values(ROLES), required: true },
      { key: "customers", label: "Divisi (Customer) — bisa pilih lebih dari satu", type: "multiselect", options: customers.map((c) => c.name), required: true, fullWidth: true, showIf: (f) => f.role && f.role !== ROLES.MANAGER },
      { key: "assignment", label: "Homebase / Area", placeholder: "mis. Merauke, atau Semua Area" },
    ]}
  />;
  else if (page === "help") content = <HelpPage role={role} />;
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
      {role === ROLES.MANAGER && <PhantomStockCleanup api={api} showToast={showToast} />}
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50/50 font-sans text-gray-900" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Sidebar page={page} setPage={goto} role={role} userName={currentUser?.name} userCustomers={currentUser?.customers} mobileOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />
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
