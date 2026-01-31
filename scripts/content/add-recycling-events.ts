import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mobile recycling yard events for 2026
const RECYCLING_EVENTS = [
  // Veliki Bukovec
  { date: '2026-01-28', location: 'Veliki Bukovec – kod društvenog doma' },
  { date: '2026-04-22', location: 'Veliki Bukovec – kod društvenog doma' },
  { date: '2026-07-22', location: 'Veliki Bukovec – kod društvenog doma' },
  { date: '2026-10-14', location: 'Veliki Bukovec – kod društvenog doma' },
  // Dubovica
  { date: '2026-01-29', location: 'Dubovica – kod društvenog doma' },
  { date: '2026-04-23', location: 'Dubovica – kod društvenog doma' },
  { date: '2026-07-23', location: 'Dubovica – kod društvenog doma' },
  { date: '2026-10-15', location: 'Dubovica – kod društvenog doma' },
  // Kapela Podravska
  { date: '2026-01-30', location: 'Kapela Podravska – kod društvenog doma' },
  { date: '2026-04-24', location: 'Kapela Podravska – kod društvenog doma' },
  { date: '2026-07-24', location: 'Kapela Podravska – kod društvenog doma' },
  { date: '2026-10-16', location: 'Kapela Podravska – kod društvenog doma' },
];

const TITLE = 'Mobilno reciklažno dvorište';
const DESCRIPTION = `Mobilno reciklažno dvorište bit će postavljeno od 12:00 do 16:00 sati (4 sata).

Možete odložiti:
• Glomazni otpad
• Električni i elektronički otpad
• Građevinski otpad (manje količine)
• Stari namještaj
• Bijelu tehniku
• Stare gume (do 4 komada)

Molimo građane da otpad donesu sortirano.`;

async function main() {
  const dryRun = !process.argv.includes('--execute');

  console.log(dryRun ? '=== DRY RUN (use --execute to apply) ===' : '=== EXECUTING ===');
  console.log(`\nCreating ${RECYCLING_EVENTS.length} mobile recycling yard events...\n`);

  for (const event of RECYCLING_EVENTS) {
    const eventDate = new Date(event.date);
    const village = event.location.split(' – ')[0];

    console.log(`${event.date} - ${village}`);

    if (!dryRun) {
      // eventTime needs a DateTime - use a date with just the time component
      const eventTime = new Date('1970-01-01T12:00:00Z');

      await prisma.event.create({
        data: {
          title: TITLE,
          description: DESCRIPTION,
          eventDate,
          eventTime,
          endDate: eventDate, // Same day
          location: event.location,
        },
      });
    }
  }

  console.log(`\n=== SUMMARY ===`);
  console.log(`Events to create: ${RECYCLING_EVENTS.length}`);

  if (dryRun) {
    console.log('\nRun with --execute to create events');
  } else {
    console.log('\nEvents created successfully!');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
