import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const YEAR = 2026;

// Waste collection schedules for 2026
const WASTE_SCHEDULES = {
  'Miješani komunalni otpad': {
    dates: ['07.01', '21.01', '04.02', '18.02', '04.03', '18.03', '01.04', '15.04', '29.04', '13.05', '27.05', '10.06', '24.06', '08.07', '22.07', '06.08', '19.08', '02.09', '16.09', '30.09', '14.10', '28.10', '11.11', '25.11', '09.12', '23.12'],
    description: 'Odvoz miješanog komunalnog otpada. Kante postavite na rub ceste do 7:00 sati ujutro.',
  },
  'Pelene': {
    dates: ['07.01', '21.01', '04.02', '18.02', '04.03', '18.03', '01.04', '15.04', '29.04', '13.05', '27.05', '10.06', '24.06', '08.07', '22.07', '06.08', '19.08', '02.09', '16.09', '30.09', '14.10', '28.10', '11.11', '25.11', '09.12', '23.12'],
    description: 'Odvoz pelena. Kante postavite na rub ceste do 7:00 sati ujutro.',
  },
  'Biootpad': {
    dates: ['08.01', '22.01', '05.02', '19.02', '05.03', '19.03', '02.04', '16.04', '30.04', '14.05', '28.05', '11.06', '25.06', '09.07', '23.07', '06.08', '20.08', '03.09', '17.09', '01.10', '15.10', '29.10', '12.11', '26.11', '10.12', '24.12'],
    description: 'Odvoz biootpada (organski otpad). Smeđe kante postavite na rub ceste do 7:00 sati ujutro.',
  },
  'Papir i karton': {
    dates: ['28.01', '25.02', '25.03', '22.04', '20.05', '17.06', '15.07', '12.08', '09.09', '07.10', '04.11', '02.12', '30.12'],
    description: 'Odvoz papira i kartona. Plave kante/vreće postavite na rub ceste do 7:00 sati ujutro.',
  },
  'Metal': {
    dates: ['28.01', '25.02', '25.03', '22.04', '20.05', '17.06', '15.07', '12.08', '09.09', '07.10', '04.11', '02.12', '30.12'],
    description: 'Odvoz metalnog otpada. Postavite na rub ceste do 7:00 sati ujutro.',
  },
  'Plastika': {
    dates: ['14.01', '11.02', '11.03', '08.04', '06.05', '03.06', '01.07', '29.07', '26.08', '23.09', '21.10', '19.11', '16.12'],
    description: 'Odvoz plastike. Žute kante/vreće postavite na rub ceste do 7:00 sati ujutro.',
  },
  'Staklo': {
    dates: ['04.03', '10.06', '02.09', '09.12'],
    description: 'Odvoz staklenog otpada. Zelene kante postavite na rub ceste do 7:00 sati ujutro.',
  },
  'Tekstil': {
    dates: ['18.03', '24.06', '16.09', '23.12'],
    description: 'Odvoz tekstilnog otpada. Vreće s tekstilom postavite na rub ceste do 7:00 sati ujutro.',
  },
};

function parseDate(dateStr: string, year: number): Date {
  const [day, month] = dateStr.split('.');
  return new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
}

async function main() {
  const dryRun = !process.argv.includes('--execute');

  console.log(dryRun ? '=== DRY RUN (use --execute to apply) ===' : '=== EXECUTING ===');

  let totalEvents = 0;
  const summary: Record<string, number> = {};

  for (const [wasteType, schedule] of Object.entries(WASTE_SCHEDULES)) {
    console.log(`\n${wasteType}: ${schedule.dates.length} events`);
    summary[wasteType] = schedule.dates.length;
    totalEvents += schedule.dates.length;

    if (!dryRun) {
      for (const dateStr of schedule.dates) {
        const eventDate = parseDate(dateStr, YEAR);
        const title = `Odvoz otpada: ${wasteType}`;

        await prisma.event.create({
          data: {
            title,
            description: schedule.description,
            eventDate,
            eventTime: new Date('1970-01-01T07:00:00Z'), // 7:00 pickup time
            location: 'Općina Veliki Bukovec',
          },
        });
      }
    }
  }

  console.log(`\n=== SUMMARY ===`);
  for (const [type, count] of Object.entries(summary)) {
    console.log(`  ${type}: ${count}`);
  }
  console.log(`  TOTAL: ${totalEvents} events`);

  if (dryRun) {
    console.log('\nRun with --execute to create events');
  } else {
    console.log('\nEvents created successfully!');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
