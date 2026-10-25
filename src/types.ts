export type PackageDurationType = 'minutes' | 'hours' | 'days';

export interface WifiPackage {
  id: string;
  name: string;
  price: number;
  duration: number;
  durationType: PackageDurationType;
  dataLimitMb: number; // 0 = unlimited
  downloadSpeedMbps: number;
  uploadSpeedMbps: number;
  simultaneousDevices: number;
  isActive: boolean;
  description: string;
  isPopular?: boolean;
  validityDays: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  status: 'active' | 'expired' | 'blocked';
  macAddresses: string[];
  activePackageId?: string;
  activePackageName?: string;
  dataUsedMb: number;
  totalPaid: number;
  expiresAt?: string;
  notes?: string;
  createdAt: string;
}

export type VoucherStatus = 'available' | 'active' | 'used' | 'expired';

export interface Voucher {
  id: string;
  code: string;
  pin?: string;
  packageId: string;
  packageName: string;
  price: number;
  status: VoucherStatus;
  usedBy?: string; // customer name or MAC
  usedAt?: string;
  activatedAt?: string;
  expiresAt?: string;
  batchId: string;
  batchName: string;
  createdAt: string;
}

export interface HotspotSession {
  id: string;
  username: string; // voucher code or phone/user
  ipAddress: string;
  macAddress: string;
  deviceType: 'phone' | 'laptop' | 'tablet' | 'smart_tv' | 'other';
  deviceName: string;
  uptimeSeconds: number;
  bytesIn: number; // download
  bytesOut: number; // upload
  signalDbm: number;
  rateLimit: string;
  startedAt: string;
  expiresAt: string;
  routerId: string;
  routerName: string;
  dataLimitMb: number;
}

export type PaymentMethod = 'cash' | 'mpesa' | 'card' | 'paypal' | 'stripe' | 'crypto';
export type PaymentStatus = 'completed' | 'pending' | 'refunded';

export interface Payment {
  id: string;
  receiptNumber: string;
  customerName: string;
  customerPhone?: string;
  amount: number;
  packageId: string;
  packageName: string;
  method: PaymentMethod;
  status: PaymentStatus;
  reference: string;
  createdAt: string;
}

export type RouterType = 'mikrotik' | 'tplink_omada' | 'openwrt' | 'coovachilli' | 'radius';

export interface RouterDevice {
  id: string;
  name: string;
  type: RouterType;
  ipAddress: string;
  apiPort: number;
  username: string;
  status: 'online' | 'offline' | 'warning';
  firmware: string;
  cpuLoad: number;
  ramUsage: number;
  activeHotspotUsers: number;
  lastSynced: string;
  model: string;
  location: string;
}

export interface SystemSettings {
  venueName: string;
  venueType: 'hostel' | 'cafe' | 'apartment' | 'office' | 'gaming' | 'neighborhood_isp';
  currency: string;
  currencySymbol: string;
  supportPhone: string;
  supportEmail: string;
  termsUrl: string;
  walledGarden: string[];
  autoDisconnectOnExpiry: boolean;
  enableSmsAlerts: boolean;
  captivePortalTitle: string;
  captivePortalWelcomeMsg: string;
  allowFreeTrial: boolean;
  freeTrialMinutes: number;
}

export interface DashboardStats {
  todayRevenue: number;
  monthRevenue: number;
  activeSessionsCount: number;
  totalBandwidthTodayGb: number;
  availableVouchersCount: number;
  activeCustomersCount: number;
  onlineRoutersCount: number;
  totalRoutersCount: number;
}

export interface HourlyTraffic {
  hour: string;
  activeUsers: number;
  downloadMb: number;
  uploadMb: number;
}

export interface DailyRevenue {
  date: string;
  revenue: number;
  vouchersSold: number;
}
