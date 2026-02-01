import { getSeedEnv } from '@repo/shared';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const { SEED_USER_PASSWORD } = getSeedEnv();

// Seed-specific logger (console is acceptable in development scripts)
const log = (message: string) => process.stdout.write(`${message}\n`);

async function main() {
  log('Seeding database...');

  // Hash the test password
  const passwordHash = await bcrypt.hash(SEED_USER_PASSWORD, 10);

  // Create test admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@velikibukovec.hr' },
    update: {},
    create: {
      email: 'admin@velikibukovec.hr',
      name: 'Admin',
      role: 'super_admin',
      emailVerified: true,
    },
  });

  // Create Account record for admin user (required for Better Auth credential login)
  const existingAdminAccount = await prisma.account.findFirst({
    where: {
      userId: adminUser.id,
      providerId: 'credential',
    },
  });
  if (existingAdminAccount) {
    await prisma.account.update({
      where: { id: existingAdminAccount.id },
      data: { password: passwordHash },
    });
  } else {
    await prisma.account.create({
      data: {
        userId: adminUser.id,
        providerId: 'credential',
        accountId: adminUser.id,
        password: passwordHash,
      },
    });
  }

  log(`Created admin user: ${adminUser.email}`);

  // Create test staff user
  const staffUser = await prisma.user.upsert({
    where: { email: 'staff@velikibukovec.hr' },
    update: {},
    create: {
      email: 'staff@velikibukovec.hr',
      name: 'Staff Member',
      role: 'staff',
      emailVerified: true,
    },
  });

  // Create Account record for staff user (required for Better Auth credential login)
  const existingStaffAccount = await prisma.account.findFirst({
    where: {
      userId: staffUser.id,
      providerId: 'credential',
    },
  });
  if (existingStaffAccount) {
    await prisma.account.update({
      where: { id: existingStaffAccount.id },
      data: { password: passwordHash },
    });
  } else {
    await prisma.account.create({
      data: {
        userId: staffUser.id,
        providerId: 'credential',
        accountId: staffUser.id,
        password: passwordHash,
      },
    });
  }

  log(`Created staff user: ${staffUser.email}`);

  // Create initial settings
  const settings = [
    { key: 'site_name', value: { hr: 'Opcina Veliki Bukovec' } },
    { key: 'site_description', value: { hr: 'Sluzbena web stranica Opcine Veliki Bukovec' } },
    { key: 'contact_email', value: 'info@velikibukovec.hr' },
    { key: 'contact_phone', value: '+385 42 XXX XXX' },
    { key: 'contact_address', value: 'Veliki Bukovec XX, 42231 Veliki Bukovec' },
    { key: 'social_facebook', value: 'https://facebook.com/opcinaveliki.bukovec' },
    { key: 'newsletter_enabled', value: true },
    { key: 'ai_generation_enabled', value: false },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }

  log('Created initial settings');

  // Create sample page
  const aboutPage = await prisma.page.upsert({
    where: { slug: 'o-opcini' },
    update: {},
    create: {
      title: 'O Opcini',
      slug: 'o-opcini',
      content: JSON.stringify({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Dobrodosli u Opcinu Veliki Bukovec.' }],
          },
        ],
      }),
      menuOrder: 1,
    },
  });

  log(`Created sample page: ${aboutPage.slug}`);

  log('Seeding completed!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    process.stderr.write(`${String(e)}\n`);
    await prisma.$disconnect();
    process.exit(1);
  });
