import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const INCIDENT_TYPES = ['MEDICAL', 'SECURITY', 'TRAFFIC', 'INFRASTRUCTURE'];
const SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const STATUSES = ['PENDING', 'ACKNOWLEDGED', 'IN_PROGRESS', 'ESCALATED', 'RESOLVED', 'CLOSED'];

const incTypes = [
  { type: 'MEDICAL', titles: ['Patient collapsed at entrance', 'Asthma attack in queue', 'Pregnant woman in distress', 'Dehydration case reported', 'Inhalation of tear gas', 'Allergic reaction from food', 'Cuts from broken glass', 'Heat stroke victim', 'Diabetic emergency', 'Sprained ankle on stairs', 'Head injury from fall', 'Mass fainting incident'] },
  { type: 'SECURITY', titles: ['Suspicious package spotted', 'Unauthorized entry at Gate A', 'Fight broke out in queue', 'Pickpocketing incident', 'Vehicle with no plate denied entry', 'Charred vehicle near parking', 'Drone spotted over VIP zone', 'Hawkers harassing attendees', 'Abduction attempt foiled', 'Stolen phone reported', 'Gate B scanner malfunction', 'Intruder in restricted area', 'Suspicious movement near corridor', 'Crowd surge at Gate A'] },
  { type: 'TRAFFIC', titles: ['Gridlock at Main Gate approach', 'Vehicle breakdown blocking lane', 'Bus obstructing access road', 'Overflow parking on sidewalk', 'Taxi queue causing obstruction', 'Motorcycle weaving through crowd', 'Accident at Camp Road junction', 'Ambulance blocked at Gate B', 'Traffic light out at intersection', 'Convoy causing delay', 'Parking lot full, cars diverted', 'Lane closure for emergency vehicle', 'Tow truck requested at parking'] },
  { type: 'INFRASTRUCTURE', titles: ['Power outage at Arena Main', 'Water pipe burst at medical centre', 'Gate A barrier arm stuck', 'Toilet facilities overflowing', 'Lighting pole fallen at parking', 'PA system not working', 'Fence breach near corridor', 'Generator failure at VIP zone', 'Signage blown off by wind', 'Drainage blocked near entrance', 'Footbridge overcrowded at exit'] },
];

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

const descriptions = [
  'Attendees report feeling unwell due to heat and overcrowding. Immediate medical attention required.',
  'Security personnel spotted unusual activity. Area cordoned off pending investigation.',
  'Vehicles are backed up for over 500 metres. Traffic control personnel dispatched but need reinforcement.',
  'Reports of structural damage affecting pedestrian movement. Engineers have been notified.',
  'Witnesses report a scuffle. Security team has intervened. No serious injuries reported.',
  'Visitor is experiencing difficulty breathing. First responders on site administering oxygen.',
  'The barrier at the entry point is jammed in the upright position. Manual override attempted but failed.',
  'Complaints of dizziness and nausea from multiple attendees in the same area. Possible food poisoning.',
  'Large group attempting to force entry through side gate. Reinforcement requested.',
  'Water-logged area creating slip hazard. Cleanup team en route.',
  'Unattended bag found near the main stage. Bomb squad has been alerted.',
  'Pedestrian flow bottleneck at key junction. Crowd control barriers being repositioned.',
  'Individual apprehended attempting to scale the perimeter fence. Handed over to security.',
  'Emergency vehicle struggling to navigate through traffic gridlock. Escort requested.',
];

const statusConfig = [
  // 8 PENDING (unassigned)
  { status: 'PENDING', assigned: false, count: 8 },
  // 5 PENDING (assigned)
  { status: 'PENDING', assigned: true, count: 5 },
  // 6 ACKNOWLEDGED
  { status: 'ACKNOWLEDGED', assigned: true, count: 6 },
  // 8 IN_PROGRESS
  { status: 'IN_PROGRESS', assigned: true, count: 8 },
  // 3 ESCALATED
  { status: 'ESCALATED', assigned: true, count: 3 },
  // 12 RESOLVED
  { status: 'RESOLVED', assigned: true, count: 12 },
  // 8 CLOSED
  { status: 'CLOSED', assigned: true, count: 8 },
];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateReferenceCode(index) {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const seq = String(100 + index).padStart(3, '0');
  return `INC-${y}${m}${d}-${seq}`;
}

async function main() {
  console.log('Seeding incidents and mayors...\n');

  const admin = await prisma.user.findUnique({ where: { email: 'admin@halocity.ng' } });
  if (!admin) {
    console.error('Admin user not found. Run the primary seed first.');
    process.exit(1);
  }

  const zones = await prisma.zone.findMany();
  if (zones.length === 0) {
    console.error('No zones found. Run the primary seed first.');
    process.exit(1);
  }

  // 1. Find or create a citizen reporter
  let reporter = await prisma.user.findUnique({ where: { email: 'citizen@halocity.ng' } });
  if (!reporter) {
    const hash = await bcrypt.hash('HaloCity@2026', 12);
    reporter = await prisma.user.create({
      data: {
        name: 'Segun Reporter',
        email: 'citizen@halocity.ng',
        phone: '+2348012345000',
        passwordHash: hash,
        role: 'CITIZEN',
        isActive: true,
      },
    });
    console.log(`  ✓ Citizen reporter created: ${reporter.email}`);
  }

  // 2. Find or create 10 mayors
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

  // odusolaolawale is first — assign more to them
  const primaryMayor = mayors[0];
  const otherMayors = mayors.slice(1);

  // 3. Assign each mayor to a random zone (for MarshalAssignment records)
  for (const mayor of mayors) {
    const zone = randomItem(zones);
    const existing = await prisma.marshalAssignment.findFirst({
      where: { mayorId: mayor.id, status: 'ACTIVE' },
    });
    if (!existing) {
      await prisma.marshalAssignment.create({
        data: {
          mayorId: mayor.id,
          zoneId: zone.id,
          assignedById: admin.id,
          status: 'ACTIVE',
        },
      });
      console.log(`  ✓ ${mayor.name} assigned to zone: ${zone.name}`);
    }
  }

  // 4. Generate 50 incidents
  let totalCreated = 0;
  let incIndex = 0;

  for (const cfg of statusConfig) {
    for (let i = 0; i < cfg.count; i++) {
      incIndex++;

      const typeEntry = randomItem(incTypes);
      const type = typeEntry.type;
      const title = randomItem(typeEntry.titles);
      const description = randomItem(descriptions);
      const severity = randomItem(SEVERITIES);
      const zone = randomItem(zones);

      // Choose assignee
      let assignedTo = null;
      if (cfg.assigned) {
        // 55% chance to assign to primary mayor
        if (Math.random() < 0.55) {
          assignedTo = primaryMayor.id;
        } else {
          assignedTo = randomItem(otherMayors).id;
        }
      }

      // Generate timestamps
      const now = new Date();
      const createdAt = new Date(now.getTime() - randomInt(0, 48) * 60 * 60 * 1000);
      let resolvedAt = null;
      if (cfg.status === 'RESOLVED' || cfg.status === 'CLOSED') {
        resolvedAt = new Date(createdAt.getTime() + randomInt(5, 120) * 60 * 1000);
      }

      // Coordinates within Lagos (approx 6.45, 3.4)
      const lat = 6.45 + (Math.random() - 0.5) * 0.05;
      const lng = 3.4 + (Math.random() - 0.5) * 0.05;

      const referenceCode = generateReferenceCode(incIndex + 50);

      const incident = await prisma.incident.upsert({
        where: { referenceCode },
        update: {},
        create: {
          referenceCode,
          type,
          severity,
          title,
          description,
          status: cfg.status,
          zoneId: zone.id,
          reporterId: reporter.id,
          assignedTo,
          locationLat: lat,
          locationLng: lng,
          mediaUrls: [],
          createdAt,
          resolvedAt,
          updatedAt: cfg.status === 'CLOSED' || cfg.status === 'RESOLVED' ? (resolvedAt || createdAt) : createdAt,
        },
      });

      totalCreated++;
      const assigneeEmail = assignedTo
        ? mayors.find((m) => m.id === assignedTo)?.email || 'unknown'
        : 'unassigned';
      if (totalCreated <= 5 || totalCreated >= 47) {
        console.log(`  ${totalCreated}. ${referenceCode} [${type}/${severity}] "${title}" → ${assigneeEmail} (${zone.code})`);
      }
    }
  }

  console.log(`\n  ✓ Created ${totalCreated} incidents total`);
  console.log('\n✅ Incident seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
