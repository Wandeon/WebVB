/**
 * Archive Outdated Announcements and Events Script
 *
 * This script:
 * 1. Archives announcements older than 6 months (sets publishedAt to null)
 * 2. Deletes events that ended more than 30 days ago
 *
 * Announcements are "archived" by setting publishedAt to null (unpublishing them).
 * Events are deleted since they have no status field and past events are no longer needed.
 *
 * Run with: npx tsx scripts/cleanup/archive-outdated.ts [--dry-run] [--execute]
 *
 * Options:
 *   --dry-run   Show what would be archived without making changes (default)
 *   --execute   Actually perform the archival
 *
 * Launch Readiness - Task 3: Archive outdated announcements and events
 */

import { PrismaClient } from '@prisma/client';

const db = new PrismaClient({
  log: ['error'],
});

// Constants
const SIX_MONTHS_AGO = new Date();
SIX_MONTHS_AGO.setMonth(SIX_MONTHS_AGO.getMonth() - 6);

const THIRTY_DAYS_AGO = new Date();
THIRTY_DAYS_AGO.setDate(THIRTY_DAYS_AGO.getDate() - 30);

interface ArchiveData {
  announcements: { id: string; title: string; publishedAt: Date | null }[];
  events: { id: string; title: string; eventDate: Date; endDate: Date | null }[];
}

async function analyzeContent(): Promise<ArchiveData> {
  console.log('\nAnalyzing content for archival...\n');

  // Find announcements older than 6 months that are currently published
  const announcements = await db.announcement.findMany({
    where: {
      publishedAt: {
        not: null,
        lt: SIX_MONTHS_AGO,
      },
    },
    select: {
      id: true,
      title: true,
      publishedAt: true,
    },
    orderBy: { publishedAt: 'asc' },
  });

  console.log(
    `Found ${announcements.length} published announcements older than 6 months (before ${SIX_MONTHS_AGO.toISOString().split('T')[0]})`
  );

  // Find events that ended more than 30 days ago
  // Events can have either endDate or just eventDate
  // If no endDate, use eventDate as the end date
  const events = await db.event.findMany({
    where: {
      OR: [
        // Events with explicit end date that ended > 30 days ago
        {
          endDate: {
            lt: THIRTY_DAYS_AGO,
          },
        },
        // Events without end date where event date was > 30 days ago
        {
          endDate: null,
          eventDate: {
            lt: THIRTY_DAYS_AGO,
          },
        },
      ],
    },
    select: {
      id: true,
      title: true,
      eventDate: true,
      endDate: true,
    },
    orderBy: { eventDate: 'asc' },
  });

  console.log(
    `Found ${events.length} events that ended more than 30 days ago (before ${THIRTY_DAYS_AGO.toISOString().split('T')[0]})`
  );

  return { announcements, events };
}

function showPreview(data: ArchiveData): void {
  console.log('\n' + '='.repeat(70));
  console.log('ARCHIVE PREVIEW');
  console.log('='.repeat(70));

  console.log('\nANNOUNCEMENTS to archive (set publishedAt to null):');
  console.log('-'.repeat(50));
  if (data.announcements.length === 0) {
    console.log('  (none)');
  } else {
    data.announcements.slice(0, 10).forEach((a, i) => {
      const date = a.publishedAt ? a.publishedAt.toISOString().split('T')[0] : 'N/A';
      console.log(`  ${i + 1}. [${date}] ${a.title.substring(0, 50)}...`);
    });
    if (data.announcements.length > 10) {
      console.log(`  ... and ${data.announcements.length - 10} more`);
    }
  }

  console.log('\nEVENTS to delete (past events no longer needed):');
  console.log('-'.repeat(50));
  if (data.events.length === 0) {
    console.log('  (none)');
  } else {
    data.events.slice(0, 10).forEach((e, i) => {
      const date = e.eventDate.toISOString().split('T')[0];
      const endStr = e.endDate ? ` - ${e.endDate.toISOString().split('T')[0]}` : '';
      console.log(`  ${i + 1}. [${date}${endStr}] ${e.title.substring(0, 45)}...`);
    });
    if (data.events.length > 10) {
      console.log(`  ... and ${data.events.length - 10} more`);
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log('SUMMARY:');
  console.log(`  ${data.announcements.length} announcements will be ARCHIVED (unpublished)`);
  console.log(`  ${data.events.length} events will be DELETED`);
  console.log('='.repeat(70));
}

async function executeArchival(data: ArchiveData): Promise<{
  announcementsArchived: number;
  eventsDeleted: number;
  errors: string[];
}> {
  const stats = {
    announcementsArchived: 0,
    eventsDeleted: 0,
    errors: [] as string[],
  };

  console.log('\nStarting archival...\n');

  // Archive announcements by setting publishedAt to null
  if (data.announcements.length > 0) {
    console.log('Archiving announcements (setting publishedAt to null)...');
    try {
      const announcementIds = data.announcements.map((a) => a.id);
      const result = await db.announcement.updateMany({
        where: { id: { in: announcementIds } },
        data: { publishedAt: null },
      });
      stats.announcementsArchived = result.count;
      console.log(`  Archived ${result.count} announcements`);
    } catch (error) {
      const message = `Failed to archive announcements: ${(error as Error).message}`;
      stats.errors.push(message);
      console.log(`  Error: ${message}`);
    }
  } else {
    console.log('No announcements to archive.');
  }

  // Delete old events
  if (data.events.length > 0) {
    console.log('Deleting old events...');
    try {
      const eventIds = data.events.map((e) => e.id);
      const result = await db.event.deleteMany({
        where: { id: { in: eventIds } },
      });
      stats.eventsDeleted = result.count;
      console.log(`  Deleted ${result.count} events`);
    } catch (error) {
      const message = `Failed to delete events: ${(error as Error).message}`;
      stats.errors.push(message);
      console.log(`  Error: ${message}`);
    }
  } else {
    console.log('No events to delete.');
  }

  return stats;
}

async function showFinalState(): Promise<void> {
  console.log('\nFinal database state:');
  console.log('-'.repeat(40));

  const publishedAnnouncements = await db.announcement.count({
    where: { publishedAt: { not: null } },
  });
  const draftAnnouncements = await db.announcement.count({
    where: { publishedAt: null },
  });
  console.log(
    `Announcements: ${publishedAnnouncements} published, ${draftAnnouncements} drafts/archived`
  );

  const upcomingEvents = await db.event.count({
    where: {
      OR: [{ endDate: { gte: new Date() } }, { endDate: null, eventDate: { gte: new Date() } }],
    },
  });
  const totalEvents = await db.event.count();
  console.log(`Events: ${totalEvents} total (${upcomingEvents} upcoming)`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const isDryRun = !args.includes('--execute');

  console.log('='.repeat(70));
  console.log('Archive Outdated Announcements and Events');
  console.log('='.repeat(70));

  if (isDryRun) {
    console.log('\nDRY RUN MODE - No changes will be made');
    console.log('Run with --execute to perform the archival\n');
  } else {
    console.log('\nEXECUTE MODE - Changes WILL be made!\n');
  }

  try {
    // Analyze content
    const data = await analyzeContent();

    // Show preview
    showPreview(data);

    if (isDryRun) {
      console.log('\nTo execute this archival, run:');
      console.log('  npx tsx scripts/cleanup/archive-outdated.ts --execute\n');
    } else {
      // Execute archival
      const stats = await executeArchival(data);

      console.log('\n' + '='.repeat(70));
      console.log('ARCHIVAL COMPLETE');
      console.log('='.repeat(70));
      console.log(`  ${stats.announcementsArchived} announcements archived`);
      console.log(`  ${stats.eventsDeleted} events deleted`);

      if (stats.errors.length > 0) {
        console.log(`\n  ${stats.errors.length} errors occurred:`);
        stats.errors.forEach((e) => console.log(`    - ${e}`));
      }

      // Show final state
      await showFinalState();
    }

    console.log('\nDone!');
  } catch (error) {
    console.error('\nArchival failed:', error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

main();
