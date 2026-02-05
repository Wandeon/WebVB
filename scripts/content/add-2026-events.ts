/**
 * Add 2026 community events for Općina Veliki Bukovec.
 *
 * Usage: npx tsx scripts/content/add-2026-events.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const events = [
  {
    title: 'Bukovečki fašnjak',
    eventDate: new Date('2026-02-15'),
    location: 'Veliki Bukovec',
  },
  {
    title: 'Otvoreno prvenstvo Centra svijeta i kup Velikog Bukovca - u kajaku, kanuu, raftingu i supu',
    eventDate: new Date('2026-03-21'),
    location: 'Veliki Bukovec',
  },
  {
    title: 'Uskršnji kviz',
    eventDate: new Date('2026-04-06'),
    location: 'Društveni dom Veliki Bukovec',
  },
  {
    title: 'Prvomajski grah',
    eventDate: new Date('2026-05-01'),
    location: 'Veliki Bukovec',
  },
  {
    title: '7. Tradicionalna biciklijada Općine Veliki Bukovec',
    eventDate: new Date('2026-09-27'),
    location: 'Općina Veliki Bukovec',
  },
  {
    title: 'Svečana sjednica općinskog vijeća Općine Veliki Bukovec',
    eventDate: new Date('2026-10-02'),
    location: 'Veliki Bukovec',
  },
  {
    title: 'Druženje za dan općine',
    eventDate: new Date('2026-10-03'),
    location: 'Veliki Bukovec',
  },
  {
    title: 'Dan Općine Veliki Bukovec i zaštitnika sv. Franje Asiškog',
    eventDate: new Date('2026-10-04'),
    location: 'Veliki Bukovec',
  },
];

async function main() {
  let created = 0;
  let skipped = 0;

  for (const event of events) {
    const existing = await prisma.event.findFirst({
      where: {
        title: event.title,
        eventDate: event.eventDate,
      },
    });

    if (existing) {
      console.log(`SKIP: "${event.title}" already exists`);
      skipped++;
      continue;
    }

    await prisma.event.create({ data: event });
    console.log(`CREATE: "${event.title}" on ${event.eventDate.toISOString().split('T')[0]}`);
    created++;
  }

  console.log(`\nDone: ${created} created, ${skipped} skipped`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
