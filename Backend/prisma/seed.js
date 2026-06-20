import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding HaloCity database...');

  // 1. Admin user
  const adminPasswordHash = await bcrypt.hash('HaloCity@2026', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@halocity.ng' },
    update: {},
    create: {
      name: 'City Commander',
      email: 'admin@halocity.ng',
      phone: '+2348000000001',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      isActive: true,
    },
  });
  console.log(`  ✓ Admin user created: ${admin.email}`);

  // 2. Zones
  const zoneData = [
    { name: 'Main Gate', code: 'GATE_MAIN', capacity: 5000 },
    { name: 'Gate A', code: 'GATE_A', capacity: 3000 },
    { name: 'Gate B', code: 'GATE_B', capacity: 3000 },
    { name: 'Parking Zone 1', code: 'PARKING_1', capacity: 2000 },
    { name: 'Parking Zone 2', code: 'PARKING_2', capacity: 2000 },
    { name: 'Arena Main', code: 'ARENA_MAIN', capacity: 100000 },
    { name: 'Canaan Land Corridor', code: 'CORRIDOR_CL', capacity: 10000 },
    { name: 'Camp Road East', code: 'ROAD_EAST', capacity: 8000 },
    { name: 'Medical Centre Zone', code: 'MEDICAL_ZONE', capacity: 500 },
    { name: 'VIP Zone', code: 'VIP_ZONE', capacity: 1000 },
  ];

  const zones = [];
  for (const z of zoneData) {
    const zone = await prisma.zone.upsert({
      where: { code: z.code },
      update: {},
      create: {
        name: z.name,
        code: z.code,
        capacity: z.capacity,
        isActive: true,
      },
    });
    zones.push(zone);
    console.log(`  ✓ Zone created: ${zone.name} (${zone.code})`);
  }

  // 3. Assets
  const assetZoneMap = {
    GATE_MAIN: { name: 'Main Gate Entry Point', type: 'GATE', code: 'AST-GATE-MAIN' },
    GATE_A: { name: 'Gate A Entry Point', type: 'GATE', code: 'AST-GATE-A' },
    GATE_B: { name: 'Gate B Entry Point', type: 'GATE', code: 'AST-GATE-B' },
    PARKING_1: { name: 'Parking Zone 1 Lot', type: 'PARKING_ZONE', code: 'AST-PARK-1' },
    PARKING_2: { name: 'Parking Zone 2 Lot', type: 'PARKING_ZONE', code: 'AST-PARK-2' },
    ARENA_MAIN: { name: 'Main Arena', type: 'BUILDING', code: 'AST-ARENA-MAIN' },
    CORRIDOR_CL: { name: 'Canaan Land Corridor Road', type: 'ROAD', code: 'AST-CORR-CL' },
    ROAD_EAST: { name: 'Camp Road East', type: 'ROAD', code: 'AST-ROAD-EAST' },
    MEDICAL_ZONE: { name: 'Medical Centre Building', type: 'BUILDING', code: 'AST-MED-CENTRE' },
    VIP_ZONE: { name: 'VIP Pavilion', type: 'BUILDING', code: 'AST-VIP-PAV' },
  };

  for (const zone of zones) {
    const assetDef = assetZoneMap[zone.code];
    if (assetDef) {
      const asset = await prisma.asset.upsert({
        where: { code: assetDef.code },
        update: {},
        create: {
          name: assetDef.name,
          type: assetDef.type,
          code: assetDef.code,
          zoneId: zone.id,
          status: 'OPERATIONAL',
        },
      });
      console.log(`  ✓ Asset created: ${asset.name} (${asset.code}) in ${zone.name}`);
    }
  }

  // 4. Escalation Rules
  const escalationRules = [
    { incidentType: 'MEDICAL', severity: 'HIGH', windowSeconds: 60, escalateTo: 'MAYOR', notifyVia: ['SMS', 'WEBSOCKET', 'WHATSAPP'] },
    { incidentType: 'MEDICAL', severity: 'CRITICAL', windowSeconds: 30, escalateTo: 'ADMIN', notifyVia: ['SMS', 'WEBSOCKET', 'WHATSAPP'] },
    { incidentType: 'SECURITY', severity: 'HIGH', windowSeconds: 90, escalateTo: 'MAYOR', notifyVia: ['SMS', 'WEBSOCKET'] },
    { incidentType: 'SECURITY', severity: 'CRITICAL', windowSeconds: 45, escalateTo: 'ADMIN', notifyVia: ['SMS', 'WEBSOCKET', 'WHATSAPP'] },
    { incidentType: 'TRAFFIC', severity: 'HIGH', windowSeconds: 120, escalateTo: 'MAYOR', notifyVia: ['WEBSOCKET'] },
    { incidentType: 'INFRASTRUCTURE', severity: 'CRITICAL', windowSeconds: 60, escalateTo: 'ADMIN', notifyVia: ['SMS', 'WEBSOCKET'] },
  ];

  for (const rule of escalationRules) {
    await prisma.escalationRule.create({
      data: {
        ...rule,
        createdById: admin.id,
        isActive: true,
      },
    });
    console.log(`  ✓ Escalation rule created: ${rule.incidentType}/${rule.severity} → ${rule.escalateTo} in ${rule.windowSeconds}s`);
  }

  console.log('\n✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
