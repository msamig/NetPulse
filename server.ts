import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  initialPackages,
  initialCustomers,
  initialVouchers,
  initialSessions,
  initialPayments,
  initialRouters,
  initialSettings,
  sampleDailyRevenue,
  sampleHourlyTraffic,
} from './src/mockData.js';
import type {
  WifiPackage,
  Customer,
  Voucher,
  HotspotSession,
  Payment,
  RouterDevice,
  SystemSettings,
} from './src/types.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // In-memory data store for persistent live server state
  let packages: WifiPackage[] = [...initialPackages];
  let customers: Customer[] = [...initialCustomers];
  let vouchers: Voucher[] = [...initialVouchers];
  let sessions: HotspotSession[] = [...initialSessions];
  let payments: Payment[] = [...initialPayments];
  let routers: RouterDevice[] = [...initialRouters];
  let settings: SystemSettings = { ...initialSettings };

  // ==========================================
  // 1. STATS & ANALYTICS API
  // ==========================================
  app.get('/api/stats', (req, res) => {
    const todayRevenue = payments
      .filter((p) => p.status === 'completed')
      .reduce((acc, curr) => acc + curr.amount, 0);

    const totalBandwidthBytes = sessions.reduce(
      (acc, s) => acc + s.bytesIn + s.bytesOut,
      0
    );
    const totalBandwidthTodayGb = +(totalBandwidthBytes / (1024 * 1024 * 1024)).toFixed(2);

    const availableVouchersCount = vouchers.filter((v) => v.status === 'available').length;
    const activeCustomersCount = customers.filter((c) => c.status === 'active').length;
    const onlineRoutersCount = routers.filter((r) => r.status === 'online').length;

    res.json({
      todayRevenue: +todayRevenue.toFixed(2),
      monthRevenue: +(todayRevenue * 18.5).toFixed(2),
      activeSessionsCount: sessions.length,
      totalBandwidthTodayGb,
      availableVouchersCount,
      activeCustomersCount,
      onlineRoutersCount,
      totalRoutersCount: routers.length,
    });
  });

  app.get('/api/reports', (req, res) => {
    res.json({
      dailyRevenue: sampleDailyRevenue,
      hourlyTraffic: sampleHourlyTraffic,
      packagePopularity: packages.map((pkg) => {
        const count = vouchers.filter((v) => v.packageId === pkg.id).length;
        const revenue = payments
          .filter((p) => p.packageId === pkg.id)
          .reduce((sum, p) => sum + p.amount, 0);
        return {
          id: pkg.id,
          name: pkg.name,
          count,
          revenue,
        };
      }),
    });
  });

  // ==========================================
  // 2. PACKAGES API
  // ==========================================
  app.get('/api/packages', (req, res) => {
    res.json(packages);
  });

  app.post('/api/packages', (req, res) => {
    const newPkg: WifiPackage = {
      id: `pkg-${Date.now()}`,
      name: req.body.name || 'New Plan',
      price: Number(req.body.price) || 0,
      duration: Number(req.body.duration) || 1,
      durationType: req.body.durationType || 'hours',
      dataLimitMb: Number(req.body.dataLimitMb) || 0,
      downloadSpeedMbps: Number(req.body.downloadSpeedMbps) || 10,
      uploadSpeedMbps: Number(req.body.uploadSpeedMbps) || 5,
      simultaneousDevices: Number(req.body.simultaneousDevices) || 1,
      isActive: req.body.isActive !== undefined ? Boolean(req.body.isActive) : true,
      description: req.body.description || '',
      validityDays: Number(req.body.validityDays) || 7,
      isPopular: Boolean(req.body.isPopular),
    };
    packages.unshift(newPkg);
    res.status(201).json(newPkg);
  });

  app.put('/api/packages/:id', (req, res) => {
    const idx = packages.findIndex((p) => p.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Package not found' });
    }
    packages[idx] = { ...packages[idx], ...req.body, id: req.params.id };
    res.json(packages[idx]);
  });

  app.delete('/api/packages/:id', (req, res) => {
    packages = packages.filter((p) => p.id !== req.params.id);
    res.json({ success: true });
  });

  // ==========================================
  // 3. VOUCHERS API (Batch Generator, Redeem)
  // ==========================================
  app.get('/api/vouchers', (req, res) => {
    res.json(vouchers);
  });

  app.post('/api/vouchers/generate', (req, res) => {
    const {
      packageId,
      count = 10,
      batchName = 'Manual Batch',
      prefix = 'WIFI',
      codeLength = 8,
      includePin = true,
    } = req.body;

    const pkg = packages.find((p) => p.id === packageId);
    if (!pkg) {
      return res.status(400).json({ error: 'Package invalid' });
    }

    const batchId = `batch-${Date.now().toString(36)}`;
    const newVouchers: Voucher[] = [];

    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    const numCount = Math.min(Math.max(1, Number(count) || 10), 100);

    for (let i = 0; i < numCount; i++) {
      let codePart1 = '';
      let codePart2 = '';
      for (let c = 0; c < 4; c++) {
        codePart1 += chars.charAt(Math.floor(Math.random() * chars.length));
        codePart2 += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      const code = `${prefix ? prefix.toUpperCase() + '-' : ''}${codePart1}-${codePart2}`;
      const pin = includePin
        ? Math.floor(1000 + Math.random() * 9000).toString()
        : undefined;

      const v: Voucher = {
        id: `v-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
        code,
        pin,
        packageId: pkg.id,
        packageName: pkg.name,
        price: pkg.price,
        status: 'available',
        batchId,
        batchName,
        createdAt: new Date().toISOString(),
      };
      newVouchers.push(v);
    }

    vouchers = [...newVouchers, ...vouchers];
    res.status(201).json({ count: newVouchers.length, vouchers: newVouchers });
  });

  app.delete('/api/vouchers/:id', (req, res) => {
    vouchers = vouchers.filter((v) => v.id !== req.params.id);
    res.json({ success: true });
  });

  app.post('/api/vouchers/batch-delete', (req, res) => {
    const { batchId } = req.body;
    if (!batchId) return res.status(400).json({ error: 'Batch ID required' });
    vouchers = vouchers.filter((v) => v.batchId !== batchId);
    res.json({ success: true });
  });

  // ==========================================
  // 4. CUSTOMERS API
  // ==========================================
  app.get('/api/customers', (req, res) => {
    res.json(customers);
  });

  app.post('/api/customers', (req, res) => {
    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      name: req.body.name || 'New Customer',
      phone: req.body.phone || '',
      email: req.body.email || '',
      status: req.body.status || 'active',
      macAddresses: Array.isArray(req.body.macAddresses)
        ? req.body.macAddresses
        : req.body.macAddress
        ? [req.body.macAddress]
        : [],
      activePackageId: req.body.activePackageId,
      activePackageName: req.body.activePackageName,
      dataUsedMb: 0,
      totalPaid: Number(req.body.totalPaid) || 0,
      expiresAt: req.body.expiresAt || new Date(Date.now() + 86400000).toISOString(),
      notes: req.body.notes || '',
      createdAt: new Date().toISOString(),
    };
    customers.unshift(newCust);
    res.status(201).json(newCust);
  });

  app.put('/api/customers/:id', (req, res) => {
    const idx = customers.findIndex((c) => c.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Customer not found' });
    customers[idx] = { ...customers[idx], ...req.body, id: req.params.id };
    res.json(customers[idx]);
  });

  app.delete('/api/customers/:id', (req, res) => {
    customers = customers.filter((c) => c.id !== req.params.id);
    res.json({ success: true });
  });

  // ==========================================
  // 5. LIVE HOTSPOT SESSIONS & ROUTER API
  // ==========================================
  app.get('/api/sessions', (req, res) => {
    res.json(sessions);
  });

  // Router API: Kick / Disconnect Hotspot User
  app.post('/api/sessions/:id/kick', (req, res) => {
    const session = sessions.find((s) => s.id === req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    // Remove active session
    sessions = sessions.filter((s) => s.id !== req.params.id);

    // Update router user count
    routers = routers.map((r) => {
      if (r.id === session.routerId) {
        return {
          ...r,
          activeHotspotUsers: Math.max(0, r.activeHotspotUsers - 1),
          lastSynced: new Date().toISOString(),
        };
      }
      return r;
    });

    res.json({
      success: true,
      message: `Router API Command Sent: /ip hotspot active remove [find user="${session.username}"] - Client ${session.macAddress} disconnected.`,
    });
  });

  // ==========================================
  // 6. PAYMENTS & BILLING API
  // ==========================================
  app.get('/api/payments', (req, res) => {
    res.json(payments);
  });

  app.post('/api/payments', (req, res) => {
    const pkg = packages.find((p) => p.id === req.body.packageId);
    const amount = Number(req.body.amount) || (pkg ? pkg.price : 0);
    const receiptNumber = `REC-${new Date().getFullYear()}-${Math.floor(
      1000 + Math.random() * 9000
    )}`;

    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      receiptNumber,
      customerName: req.body.customerName || 'Walk-in Guest',
      customerPhone: req.body.customerPhone || '',
      amount,
      packageId: req.body.packageId || (pkg ? pkg.id : ''),
      packageName: req.body.packageName || (pkg ? pkg.name : 'Custom Payment'),
      method: req.body.method || 'cash',
      status: 'completed',
      reference: req.body.reference || `REF-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      createdAt: new Date().toISOString(),
    };

    payments.unshift(newPayment);

    // Also issue an active voucher if requested
    if (req.body.generateVoucher && pkg) {
      const code = `WIFI-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(
        1000 + Math.random() * 9000
      )}`;
      const v: Voucher = {
        id: `v-${Date.now()}`,
        code,
        pin: Math.floor(1000 + Math.random() * 9000).toString(),
        packageId: pkg.id,
        packageName: pkg.name,
        price: pkg.price,
        status: 'available',
        batchId: 'direct-sale',
        batchName: 'POS Direct Sale',
        createdAt: new Date().toISOString(),
      };
      vouchers.unshift(v);
      return res.status(201).json({ payment: newPayment, voucher: v });
    }

    res.status(201).json({ payment: newPayment });
  });

  // ==========================================
  // 7. ROUTER MANAGEMENT & SCRIPT GENERATION
  // ==========================================
  app.get('/api/routers', (req, res) => {
    res.json(routers);
  });

  app.post('/api/routers', (req, res) => {
    const newRouter: RouterDevice = {
      id: `r-${Date.now()}`,
      name: req.body.name || 'New Router Gateway',
      type: req.body.type || 'mikrotik',
      ipAddress: req.body.ipAddress || '192.168.88.1',
      apiPort: Number(req.body.apiPort) || 8728,
      username: req.body.username || 'admin',
      status: 'online',
      firmware: req.body.firmware || 'RouterOS v7.14',
      cpuLoad: Math.floor(10 + Math.random() * 20),
      ramUsage: Math.floor(30 + Math.random() * 20),
      activeHotspotUsers: 0,
      lastSynced: new Date().toISOString(),
      model: req.body.model || 'MikroTik Gateway',
      location: req.body.location || 'Server Rack',
    };
    routers.push(newRouter);
    res.status(201).json(newRouter);
  });

  app.post('/api/routers/:id/sync', (req, res) => {
    const idx = routers.findIndex((r) => r.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Router not found' });

    routers[idx] = {
      ...routers[idx],
      lastSynced: new Date().toISOString(),
      cpuLoad: Math.floor(8 + Math.random() * 25),
      ramUsage: Math.floor(25 + Math.random() * 30),
      status: 'online',
    };
    res.json(routers[idx]);
  });

  // Export RouterOS script / RADIUS config
  app.get('/api/routers/:id/script', (req, res) => {
    const router = routers.find((r) => r.id === req.params.id);
    if (!router) return res.status(404).json({ error: 'Router not found' });

    let script = '';
    if (router.type === 'mikrotik') {
      script = `# ======================================================
# MikroTik RouterOS Hotspot Provisioning Script
# Generated for: ${router.name} (${router.ipAddress})
# Date: ${new Date().toISOString()}
# ======================================================

# 1. Enable API Service for Web Billing System
/ip service set api disabled=no port=${router.apiPort} address=0.0.0.0/0
/ip service set api-ssl disabled=yes

# 2. Configure Hotspot Server Profile & RADIUS / Login Mode
/ip hotspot profile
set [ find default=yes ] html-directory=hotspot login-by=http-chap,http-pap,mac-cookie use-radius=no

# 3. Create User Profiles for Billing Packages
${packages
  .map(
    (pkg) =>
      `/ip hotspot user profile add name="${pkg.name.replace(
        /[^a-zA-Z0-9_-]/g,
        '_'
      )}" rate-limit="${pkg.uploadSpeedMbps}M/${pkg.downloadSpeedMbps}M" shared-users=${
        pkg.simultaneousDevices
      } transparent-proxy=no status-autorefresh=1m`
  )
  .join('\n')}

# 4. Walled Garden Rules (Allow Payment Gateways & Venue Portal before Login)
${settings.walledGarden
  .map((domain) => `/ip hotspot walled-garden add dst-host="${domain}" action=allow`)
  .join('\n')}

# 5. Enable Hotspot NAT & IP Pool
/ip firewall nat add chain=srcnat action=masquerade src-address=192.168.88.0/24 comment="Hotspot Masquerade"

# MikroTik Config Generation Complete!
`;
    } else if (router.type === 'tplink_omada') {
      script = `// TP-Link Omada External Portal API Config
{
  "portalType": "external_web_portal",
  "portalUrl": "https://hotspot-portal.local/login",
  "ipSubnet": "192.168.0.1/24",
  "authMethod": "voucher_or_radius",
  "apiPort": ${router.apiPort},
  "preAuthAccess": [
    ${settings.walledGarden.map((d) => `"${d}"`).join(',\n    ')}
  ]
}`;
    } else {
      script = `# OpenWrt CoovaChilli / nodogsplash Config
# /etc/config/nodogsplash
config nodogsplash
    option enabled 1
    option gatewayinterface 'br-lan'
    option gatewayname '${settings.venueName}'
    option maxclients 150
    option clientidletimeout 10
    option preauth 'https://hotspot-portal.local/login'
`;
    }

    res.json({ script, type: router.type, routerName: router.name });
  });

  // ==========================================
  // 8. CAPTIVE PORTAL API (Simulated Guest Access)
  // ==========================================
  app.post('/api/portal/login', (req, res) => {
    const { voucherCode, pin, macAddress, deviceName, isFreeTrial } = req.body;
    const clientMac = macAddress || '4A:2C:19:8B:7F:3D';
    const clientName = deviceName || 'Guest Mobile Phone';

    // Handle 30-min Free Trial
    if (isFreeTrial) {
      const trialDurationMinutes = settings.freeTrialMinutes || 30;
      const trialSession: HotspotSession = {
        id: `sess-${Date.now()}`,
        username: `Trial-${clientMac.slice(-5)}`,
        ipAddress: `192.168.88.${Math.floor(50 + Math.random() * 150)}`,
        macAddress: clientMac,
        deviceType: 'phone',
        deviceName: clientName,
        uptimeSeconds: 0,
        bytesIn: 0,
        bytesOut: 0,
        signalDbm: -55,
        rateLimit: '5M/2M',
        startedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + trialDurationMinutes * 60000).toISOString(),
        routerId: routers[0]?.id || 'r-1',
        routerName: routers[0]?.name || 'Core Router',
        dataLimitMb: 500,
      };

      sessions.unshift(trialSession);
      return res.json({
        success: true,
        session: trialSession,
        message: `Welcome! Free ${trialDurationMinutes}-minute trial activated.`,
      });
    }

    // Voucher Login
    if (!voucherCode) {
      return res.status(400).json({ error: 'Please enter a voucher code' });
    }

    const cleanedCode = voucherCode.trim().toUpperCase();
    const voucher = vouchers.find(
      (v) =>
        v.code.toUpperCase() === cleanedCode ||
        v.code.replace(/[^A-Z0-9]/g, '') === cleanedCode.replace(/[^A-Z0-9]/g, '')
    );

    if (!voucher) {
      return res.status(404).json({ error: 'Voucher code not found. Please check and try again.' });
    }

    if (voucher.status === 'used') {
      return res.status(400).json({ error: 'This voucher has already been completely used.' });
    }

    if (voucher.status === 'expired') {
      return res.status(400).json({ error: 'This voucher code has expired.' });
    }

    if (voucher.pin && pin && voucher.pin !== pin.trim()) {
      return res.status(400).json({ error: 'Incorrect Voucher PIN.' });
    }

    const pkg = packages.find((p) => p.id === voucher.packageId) || {
      id: 'pkg-fallback',
      name: voucher.packageName,
      duration: 1,
      durationType: 'hours' as const,
      dataLimitMb: 1024,
      downloadSpeedMbps: 10,
      uploadSpeedMbps: 5,
    };

    let durationMs = 3600000;
    if (pkg.durationType === 'minutes') durationMs = pkg.duration * 60000;
    else if (pkg.durationType === 'hours') durationMs = pkg.duration * 3600000;
    else if (pkg.durationType === 'days') durationMs = pkg.duration * 86400000;

    const expiresAt = new Date(Date.now() + durationMs).toISOString();

    // Mark voucher as active/used
    voucher.status = 'active';
    voucher.usedBy = `${clientName} (${clientMac})`;
    voucher.usedAt = voucher.usedAt || new Date().toISOString();
    voucher.activatedAt = voucher.activatedAt || new Date().toISOString();
    voucher.expiresAt = expiresAt;

    // Create or update Hotspot Session
    const newSession: HotspotSession = {
      id: `sess-${Date.now()}`,
      username: voucher.code,
      ipAddress: `192.168.88.${Math.floor(50 + Math.random() * 150)}`,
      macAddress: clientMac,
      deviceType: 'phone',
      deviceName: clientName,
      uptimeSeconds: 0,
      bytesIn: 0,
      bytesOut: 0,
      signalDbm: -52,
      rateLimit: `${pkg.downloadSpeedMbps}M/${pkg.uploadSpeedMbps}M`,
      startedAt: new Date().toISOString(),
      expiresAt,
      routerId: routers[0]?.id || 'r-1',
      routerName: routers[0]?.name || 'Core Router',
      dataLimitMb: pkg.dataLimitMb,
    };

    sessions = [newSession, ...sessions.filter((s) => s.macAddress !== clientMac)];

    // Increment router user count
    if (routers[0]) {
      routers[0].activeHotspotUsers = sessions.length;
    }

    res.json({
      success: true,
      session: newSession,
      package: pkg,
      message: `Access granted! Connected to ${settings.venueName}.`,
    });
  });

  // Captive Portal Online Purchase & Instant Connect
  app.post('/api/portal/purchase-connect', (req, res) => {
    const { packageId, customerName, customerPhone, paymentMethod, macAddress, deviceName } =
      req.body;
    const pkg = packages.find((p) => p.id === packageId);
    if (!pkg) return res.status(404).json({ error: 'Package not found' });

    const clientMac = macAddress || '2E:77:99:A1:3B:4C';
    const clientDevice = deviceName || 'Guest Phone';
    const receiptNumber = `REC-${new Date().getFullYear()}-${Math.floor(
      1000 + Math.random() * 9000
    )}`;

    // Create payment
    const payment: Payment = {
      id: `pay-${Date.now()}`,
      receiptNumber,
      customerName: customerName || 'Portal Guest',
      customerPhone: customerPhone || '',
      amount: pkg.price,
      packageId: pkg.id,
      packageName: pkg.name,
      method: paymentMethod || 'card',
      status: 'completed',
      reference: `ONLINE-${paymentMethod?.toUpperCase() || 'CARD'}-${Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase()}`,
      createdAt: new Date().toISOString(),
    };
    payments.unshift(payment);

    // Calculate duration
    let durationMs = 3600000;
    if (pkg.durationType === 'minutes') durationMs = pkg.duration * 60000;
    else if (pkg.durationType === 'hours') durationMs = pkg.duration * 3600000;
    else if (pkg.durationType === 'days') durationMs = pkg.duration * 86400000;

    const expiresAt = new Date(Date.now() + durationMs).toISOString();

    // Create active session
    const session: HotspotSession = {
      id: `sess-${Date.now()}`,
      username: customerName || `Guest-${clientMac.slice(-5)}`,
      ipAddress: `192.168.88.${Math.floor(50 + Math.random() * 150)}`,
      macAddress: clientMac,
      deviceType: 'phone',
      deviceName: clientDevice,
      uptimeSeconds: 0,
      bytesIn: 0,
      bytesOut: 0,
      signalDbm: -54,
      rateLimit: `${pkg.downloadSpeedMbps}M/${pkg.uploadSpeedMbps}M`,
      startedAt: new Date().toISOString(),
      expiresAt,
      routerId: routers[0]?.id || 'r-1',
      routerName: routers[0]?.name || 'Core Router',
      dataLimitMb: pkg.dataLimitMb,
    };
    sessions = [session, ...sessions.filter((s) => s.macAddress !== clientMac)];

    // Also issue a voucher for customer's record
    const voucher: Voucher = {
      id: `v-${Date.now()}`,
      code: `WIFI-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(
        1000 + Math.random() * 9000
      )}`,
      pin: Math.floor(1000 + Math.random() * 9000).toString(),
      packageId: pkg.id,
      packageName: pkg.name,
      price: pkg.price,
      status: 'active',
      usedBy: `${customerName} (${clientMac})`,
      usedAt: new Date().toISOString(),
      activatedAt: new Date().toISOString(),
      expiresAt,
      batchId: 'portal-purchase',
      batchName: 'Online Portal Purchases',
      createdAt: new Date().toISOString(),
    };
    vouchers.unshift(voucher);

    res.status(201).json({
      success: true,
      payment,
      session,
      voucher,
      message: `Payment confirmed! Enjoy ${pkg.name}.`,
    });
  });

  // ==========================================
  // 9. SETTINGS API
  // ==========================================
  app.get('/api/settings', (req, res) => {
    res.json(settings);
  });

  app.put('/api/settings', (req, res) => {
    settings = { ...settings, ...req.body };
    res.json(settings);
  });

  // ==========================================
  // VITE & STATIC SERVING
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Hotspot Billing System server listening on port ${PORT}`);
  });
}

startServer();
