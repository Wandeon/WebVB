import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

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

  console.log('Created admin user:', adminUser.email);

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

  console.log('Created staff user:', staffUser.email);

  // Create initial settings
  const settings = [
    { key: 'site_name', value: { hr: 'Općina Veliki Bukovec' } },
    { key: 'site_description', value: { hr: 'Službena web stranica Općine Veliki Bukovec' } },
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

  console.log('Created initial settings');

  // Create sample page
  const aboutPage = await prisma.page.upsert({
    where: { slug: 'o-opcini' },
    update: {},
    create: {
      title: 'O Općini',
      slug: 'o-opcini',
      content: JSON.stringify({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Dobrodošli u Općinu Veliki Bukovec.' }],
          },
        ],
      }),
      menuOrder: 1,
    },
  });

  console.log('Created sample page:', aboutPage.slug);

  console.log('Seeding completed!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
