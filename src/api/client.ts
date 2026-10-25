import {
  WifiPackage,
  Customer,
  Voucher,
  HotspotSession,
  Payment,
  RouterDevice,
  SystemSettings,
  DashboardStats,
} from '../types';

export const api = {
  // Stats & Reports
  async getStats(): Promise<DashboardStats> {
    const res = await fetch('/api/stats');
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
  },

  async getReports(): Promise<any> {
    const res = await fetch('/api/reports');
    if (!res.ok) throw new Error('Failed to fetch reports');
    return res.json();
  },

  // Packages
  async getPackages(): Promise<WifiPackage[]> {
    const res = await fetch('/api/packages');
    if (!res.ok) throw new Error('Failed to fetch packages');
    return res.json();
  },

  async createPackage(data: Partial<WifiPackage>): Promise<WifiPackage> {
    const res = await fetch('/api/packages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create package');
    return res.json();
  },

  async updatePackage(id: string, data: Partial<WifiPackage>): Promise<WifiPackage> {
    const res = await fetch(`/api/packages/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update package');
    return res.json();
  },

  async deletePackage(id: string): Promise<void> {
    const res = await fetch(`/api/packages/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete package');
  },

  // Vouchers
  async getVouchers(): Promise<Voucher[]> {
    const res = await fetch('/api/vouchers');
    if (!res.ok) throw new Error('Failed to fetch vouchers');
    return res.json();
  },

  async generateVouchers(params: {
    packageId: string;
    count: number;
    batchName: string;
    prefix: string;
    includePin: boolean;
  }): Promise<{ count: number; vouchers: Voucher[] }> {
    const res = await fetch('/api/vouchers/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Failed to generate vouchers');
    return res.json();
  },

  async deleteVoucher(id: string): Promise<void> {
    const res = await fetch(`/api/vouchers/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete voucher');
  },

  async deleteVoucherBatch(batchId: string): Promise<void> {
    const res = await fetch('/api/vouchers/batch-delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ batchId }),
    });
    if (!res.ok) throw new Error('Failed to delete voucher batch');
  },

  // Customers
  async getCustomers(): Promise<Customer[]> {
    const res = await fetch('/api/customers');
    if (!res.ok) throw new Error('Failed to fetch customers');
    return res.json();
  },

  async createCustomer(data: Partial<Customer>): Promise<Customer> {
    const res = await fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create customer');
    return res.json();
  },

  async updateCustomer(id: string, data: Partial<Customer>): Promise<Customer> {
    const res = await fetch(`/api/customers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update customer');
    return res.json();
  },

  async deleteCustomer(id: string): Promise<void> {
    const res = await fetch(`/api/customers/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete customer');
  },

  // Sessions & Router API
  async getSessions(): Promise<HotspotSession[]> {
    const res = await fetch('/api/sessions');
    if (!res.ok) throw new Error('Failed to fetch active sessions');
    return res.json();
  },

  async kickSession(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`/api/sessions/${id}/kick`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to kick session from router');
    return res.json();
  },

  // Payments
  async getPayments(): Promise<Payment[]> {
    const res = await fetch('/api/payments');
    if (!res.ok) throw new Error('Failed to fetch payments');
    return res.json();
  },

  async createPayment(data: {
    customerName: string;
    customerPhone?: string;
    packageId: string;
    packageName: string;
    amount: number;
    method: string;
    generateVoucher?: boolean;
  }): Promise<{ payment: Payment; voucher?: Voucher }> {
    const res = await fetch('/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to record payment');
    return res.json();
  },

  // Routers
  async getRouters(): Promise<RouterDevice[]> {
    const res = await fetch('/api/routers');
    if (!res.ok) throw new Error('Failed to fetch routers');
    return res.json();
  },

  async addRouter(data: Partial<RouterDevice>): Promise<RouterDevice> {
    const res = await fetch('/api/routers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to add router');
    return res.json();
  },

  async syncRouter(id: string): Promise<RouterDevice> {
    const res = await fetch(`/api/routers/${id}/sync`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to sync router');
    return res.json();
  },

  async getRouterScript(id: string): Promise<{ script: string; type: string; routerName: string }> {
    const res = await fetch(`/api/routers/${id}/script`);
    if (!res.ok) throw new Error('Failed to get router script');
    return res.json();
  },

  // Settings
  async getSettings(): Promise<SystemSettings> {
    const res = await fetch('/api/settings');
    if (!res.ok) throw new Error('Failed to fetch settings');
    return res.json();
  },

  async updateSettings(data: Partial<SystemSettings>): Promise<SystemSettings> {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update settings');
    return res.json();
  },

  // Captive Portal
  async portalLogin(data: {
    voucherCode?: string;
    pin?: string;
    macAddress: string;
    deviceName: string;
    isFreeTrial?: boolean;
  }): Promise<{ success: boolean; session: HotspotSession; message: string; package?: WifiPackage }> {
    const res = await fetch('/api/portal/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Login failed');
    return json;
  },

  async portalPurchaseConnect(data: {
    packageId: string;
    customerName: string;
    customerPhone: string;
    paymentMethod: string;
    macAddress: string;
    deviceName: string;
  }): Promise<{ success: boolean; session: HotspotSession; payment: Payment; voucher: Voucher; message: string }> {
    const res = await fetch('/api/portal/purchase-connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Payment failed');
    return json;
  },
};
