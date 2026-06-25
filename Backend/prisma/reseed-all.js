import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Redemption City center ~6.4531, 3.3958
const REDEMPTION_LAT = 6.4531;
const REDEMPTION_LNG = 3.3958;

const zoneData = [
  { name: 'Main Gate', code: 'GATE_MAIN', capacity: 5000, lat: 6.4480, lng: 3.3970 },
  { name: 'Gate A', code: 'GATE_A', capacity: 3000, lat: 6.4510, lng: 3.3920 },
  { name: 'Gate B', code: 'GATE_B', capacity: 3000, lat: 6.4550, lng: 3.4000 },
  { name: 'Main Auditorium', code: 'ARENA_MAIN', capacity: 100000, lat: 6.4531, lng: 3.3958 },
  { name: 'Youth Centre', code: 'YOUTH_CENTRE', capacity: 5000, lat: 6.4570, lng: 3.3930 },
  { name: 'Medical Centre', code: 'MEDICAL_ZONE', capacity: 500, lat: 6.4495, lng: 3.3945 },
  { name: 'Guest Houses', code: 'GUEST_HOUSES', capacity: 2000, lat: 6.4560, lng: 3.3970 },
  { name: 'Market Area', code: 'MARKET_AREA', capacity: 3000, lat: 6.4500, lng: 3.3960 },
  { name: 'Parking Lot', code: 'PARKING_LOT', capacity: 8000, lat: 6.4470, lng: 3.3935 },
  { name: 'New Jerusalem', code: 'NEW_JERUSALEM', capacity: 5000, lat: 6.4600, lng: 3.4000 },
  { name: 'Admin Block', code: 'ADMIN_BLOCK', capacity: 1000, lat: 6.4520, lng: 3.3945 },
  { name: 'Power Plant', code: 'POWER_PLANT', capacity: 200, lat: 6.4460, lng: 3.3910 },
];

const assetZoneMap = {
  GATE_MAIN: { name: 'Main Gate Entry Point', type: 'GATE', code: 'AST-GATE-MAIN' },
  GATE_A: { name: 'Gate A Entry Point', type: 'GATE', code: 'AST-GATE-A' },
  GATE_B: { name: 'Gate B Entry Point', type: 'GATE', code: 'AST-GATE-B' },
  ARENA_MAIN: { name: 'Main Auditorium', type: 'BUILDING', code: 'AST-ARENA-MAIN' },
  YOUTH_CENTRE: { name: 'Youth Centre Complex', type: 'BUILDING', code: 'AST-YOUTH-CTR' },
  MEDICAL_ZONE: { name: 'Medical Centre', type: 'BUILDING', code: 'AST-MED-CENTRE' },
  GUEST_HOUSES: { name: 'Guest Houses Complex', type: 'BUILDING', code: 'AST-GUEST-HSE' },
  MARKET_AREA: { name: 'Market Area Shops', type: 'BUILDING', code: 'AST-MARKET' },
  PARKING_LOT: { name: 'Main Parking Lot', type: 'PARKING_ZONE', code: 'AST-PARKING' },
  NEW_JERUSALEM: { name: 'New Jerusalem Extension', type: 'ROAD', code: 'AST-NEW-JER' },
  ADMIN_BLOCK: { name: 'Administrative Block', type: 'BUILDING', code: 'AST-ADMIN' },
  POWER_PLANT: { name: 'Power Plant', type: 'BUILDING', code: 'AST-POWER' },
};

const mayorNames = [
  { name: 'Odusola Olawale', email: 'odusolaolawale@gmail.com' },
  { name: 'Chidi Okonkwo', email: 'chidi.okonkwo@halocity.ng' },
  { name: 'Fatima Bello', email: 'fatima.bello@halocity.ng' },
  { name: 'Segun Adeyemi', email: 'segun.adeyemi@halocity.ng' },
  { name: 'Amina Mohammed', email: 'amina.mohammed@halocity.ng' },
  { name: 'Emeka Okafor', email: 'emeka.okafor@halocity.ng' },
  { name: 'Tunde Balogun', email: 'tunde.balogun@halocity.ng' },
  { name: 'Ngozi Eze', email: 'ngozi.eze@halocity.ng' },
  { name: 'Kunle Salami', email: 'kunle.salami@halocity.ng' },
  { name: 'Halima Yusuf', email: 'halima.yusuf@halocity.ng' },
];

const INCIDENT_TYPES = ['MEDICAL', 'SECURITY', 'TRAFFIC', 'INFRASTRUCTURE'];
const SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

const incTypeTitles = {
  MEDICAL: [
    'Patient collapsed at Main Gate', 'Asthma attack in queue at Medical Centre',
    'Pregnant woman in distress at Guest Houses', 'Dehydration at Main Auditorium',
    'Allergic reaction at Market Area', 'Cuts from broken glass at Youth Centre',
    'Heat stroke victim at Parking Lot', 'Diabetic emergency at Admin Block',
    'Sprained ankle near New Jerusalem', 'Mass fainting at Main Auditorium',
    'Child lost near Market Area', 'Elderly visitor needs wheelchair at Gate A',
  ],
  SECURITY: [
    'Suspicious package at Main Gate', 'Unauthorized entry at Gate B',
    'Fight broke out at Market Area', 'Pickpocketing at Main Auditorium',
    'Vehicle with no plate denied at Gate A', 'Drone spotted over Admin Block',
    'Hawkers harassing attendees at Parking Lot', 'Stolen phone reported at Youth Centre',
    'Gate scanner malfunction at Gate B', 'Intruder in New Jerusalem area',
    'Suspicious movement near Power Plant', 'Crowd surge at Main Gate',
    'Vehicle fire near Parking Lot', 'False alarm at Medical Centre',
  ],
  TRAFFIC: [
    'Gridlock at Main Gate approach', 'Vehicle breakdown blocking expressway exit',
    'Bus obstructing access road to Guest Houses', 'Overflow parking on sidewalk near Market',
    'Taxi queue causing obstruction at Main Gate', 'Motorcycle weaving through crowd at Arena',
    'Accident on access road near Admin Block', 'Ambulance blocked at Gate A',
    'Convoy causing delay at Main Gate', 'Parking Lot full, cars diverted',
    'Tow truck requested at Parking Lot', 'Road blocked by fallen tree near New Jerusalem',
    'Pedestrian crossing hazard at Market Area',
  ],
  INFRASTRUCTURE: [
    'Power outage at Main Auditorium', 'Water pipe burst at Medical Centre',
    'Gate A barrier arm stuck', 'Toilet facilities overflowing at Market Area',
    'Lighting pole fallen at Parking Lot', 'PA system not working at Main Auditorium',
    'Fence breach near New Jerusalem', 'Generator failure at Admin Block',
    'Signage blown off at Main Gate', 'Drainage blocked near Market Area',
    'Footbridge overcrowded at Main Gate', 'Security light out at Youth Centre',
  ],
};

const descriptions = [
  'Visitors report feeling unwell due to heat and overcrowding. Immediate medical attention required.',
  'Security personnel spotted unusual activity. Area cordoned off pending investigation.',
  'Vehicles backed up for over 500 metres. Traffic control dispatched but needs reinforcement.',
  'Reports of structural damage affecting pedestrian movement. Engineers have been notified.',
  'Witnesses report a scuffle. Security team has intervened. No serious injuries reported.',
  'Visitor experiencing difficulty breathing. First responders on site administering oxygen.',
  'Barrier at entry point jammed in upright position. Manual override attempted but failed.',
  'Complaints of dizziness and nausea from multiple attendees. Possible food poisoning.',
  'Large group attempting to force entry through side gate. Reinforcement requested.',
  'Water-logged area creating slip hazard. Cleanup team en route.',
  'Unattended bag found near the main stage. Bomb squad has been alerted.',
  'Pedestrian flow bottleneck at key junction. Crowd control barriers being repositioned.',
  'Individual apprehended attempting to scale perimeter fence. Handed over to security.',
  'Emergency vehicle struggling to navigate through traffic. Escort requested.',
];

const statusConfig = [
  { status: 'PENDING', assigned: false, count: 8 },
  { status: 'PENDING', assigned: true, count: 5 },
  { status: 'ACKNOWLEDGED', assigned: true, count: 6 },
  { status: 'IN_PROGRESS', assigned: true, count: 8 },
  { status: 'ESCALATED', assigned: true, count: 3 },
  { status: 'RESOLVED', assigned: true, count: 12 },
  { status: 'CLOSED', assigned: true, count: 8 },
];

function randomItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randomFloat(min, max) { return min + Math.random() * (max - min); }

function generateRefCode(index) {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `INC-${y}${m}${d}-${String(100 + index).padStart(3, '0')}`;
}

function randomRedemptionCoords() {
  return {
    lat: REDEMPTION_LAT + randomFloat(-0.015, 0.015),
    lng: REDEMPTION_LNG + randomFloat(-0.01, 0.01),
  };
}

async function main() {
  console.log('Reseeding HaloCity — Redemption City\n');

  // 0. Clean up existing data
  console.log('Cleaning up existing data...');
  await prisma.escalationLog.deleteMany();
  await prisma.escalationRule.deleteMany();
  await prisma.incident.deleteMany();
  await prisma.marshalAssignment.deleteMany();
  await prisma.marshalLocation.deleteMany();
  await prisma.maintenanceTicket.deleteMany();
  await prisma.maintenanceLog.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.zone.deleteMany();
  console.log('  ✓ All dependent data deleted\n');

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
  console.log(`  ✓ Admin: ${admin.email}`);

  // 2. Citizen reporter
  const citizenHash = await bcrypt.hash('HaloCity@2026', 12);
  const reporter = await prisma.user.upsert({
    where: { email: 'citizen@halocity.ng' },
    update: {},
    create: {
      name: 'Segun Reporter',
      email: 'citizen@halocity.ng',
      phone: '+2348012345000',
      passwordHash: citizenHash,
      role: 'CITIZEN',
      isActive: true,
    },
  });
  console.log(`  ✓ Citizen reporter: ${reporter.email}`);

  // 3. Zones — Redemption City
  const zones = [];
  for (const z of zoneData) {
    const zone = await prisma.zone.create({
      data: {
        name: z.name,
        code: z.code,
        capacity: z.capacity,
        isActive: true,
        coordinates: { lat: z.lat, lng: z.lng },
      },
    });
    zones.push(zone);
    console.log(`  ✓ Zone: ${zone.name} (${zone.code}) — ${z.lat}, ${z.lng}`);
  }

  // 4. Assets
  for (const zone of zones) {
    const assetDef = assetZoneMap[zone.code];
    if (assetDef) {
      await prisma.asset.create({
        data: {
          name: assetDef.name,
          type: assetDef.type,
          code: assetDef.code,
          zoneId: zone.id,
          status: 'OPERATIONAL',
        },
      });
    }
    console.log(`  ✓ Asset: ${assetDef?.name || zone.name}`);
  }

  // 5. Escalation Rules
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
      data: { ...rule, createdById: admin.id, isActive: true },
    });
  }
  console.log(`  ✓ ${escalationRules.length} escalation rules created`);

  // 6. Mayors (find or create)
  const mayors = [];
  for (const m of mayorNames) {
    let mayor = await prisma.user.findUnique({ where: { email: m.email } });
    if (!mayor) {
      const hash = await bcrypt.hash('HaloCity@2026', 12);
      mayor = await prisma.user.create({
        data: {
          name: m.name,
          email: m.email,
          phone: `+234801234${String(1000 + mayors.length).padStart(4, '0')}`,
          passwordHash: hash,
          role: 'MAYOR',
          isActive: true,
        },
      });
    }
    mayors.push(mayor);
    console.log(`  ✓ Mayor: ${mayor.name} (${mayor.email})`);
  }

  const primaryMayor = mayors[0];
  const otherMayors = mayors.slice(1);

  // 7. Assign mayors to zones
  for (const mayor of mayors) {
    const zone = randomItem(zones);
    await prisma.marshalAssignment.create({
      data: {
        mayorId: mayor.id,
        zoneId: zone.id,
        assignedById: admin.id,
        status: 'ACTIVE',
      },
    });
    console.log(`  ✓ ${mayor.name} → ${zone.name}`);
  }

  // 8. Generate 50 incidents
  let incIndex = 0;
  for (const cfg of statusConfig) {
    for (let i = 0; i < cfg.count; i++) {
      incIndex++;

      const type = randomItem(INCIDENT_TYPES);
      const titles = incTypeTitles[type];
      const title = randomItem(titles);
      const description = randomItem(descriptions);
      const severity = randomItem(SEVERITIES);
      const zone = randomItem(zones);
      const coords = randomRedemptionCoords();

      let assignedTo = null;
      if (cfg.assigned) {
        assignedTo = Math.random() < 0.55 ? primaryMayor.id : randomItem(otherMayors).id;
      }

      const now = new Date();
      const createdAt = new Date(now.getTime() - randomInt(0, 72) * 60 * 60 * 1000);
      let resolvedAt = null;
      if (cfg.status === 'RESOLVED' || cfg.status === 'CLOSED') {
        resolvedAt = new Date(createdAt.getTime() + randomInt(5, 180) * 60 * 1000);
      }

      await prisma.incident.create({
        data: {
          referenceCode: generateRefCode(incIndex + 50),
          type,
          severity,
          title,
          description,
          status: cfg.status,
          zoneId: zone.id,
          reporterId: reporter.id,
          assignedTo,
          locationLat: coords.lat,
          locationLng: coords.lng,
          mediaUrls: [],
          createdAt,
          resolvedAt,
          updatedAt: cfg.status === 'CLOSED' || cfg.status === 'RESOLVED' ? (resolvedAt || createdAt) : createdAt,
        },
      });
    }
  }

  console.log(`\n  ✓ Created ${incIndex} incidents across Redemption City`);
  console.log('\n✅ Reseeding complete!');
}

main()
  .catch((e) => {
    console.error('Reseeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
