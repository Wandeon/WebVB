const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verify() {
  console.log('=== Migration Verification Report ===\n');

  // Posts with R2 images
  const postsWithR2 = await prisma.$queryRaw`SELECT COUNT(*)::int as count FROM posts WHERE content LIKE '%r2.dev%'`;
  console.log('Posts with R2 images: ' + postsWithR2[0].count);

  // Total posts
  const totalPosts = await prisma.post.count();
  console.log('Total posts: ' + totalPosts);

  // Pages with content > 500 chars
  const pagesWithContent = await prisma.$queryRaw`SELECT COUNT(*)::int as count FROM pages WHERE LENGTH(content) > 500`;
  console.log('Pages with content (>500 chars): ' + pagesWithContent[0].count);

  // Total pages
  const totalPages = await prisma.page.count();
  console.log('Total pages: ' + totalPages);

  // Documents count
  const documentsCount = await prisma.document.count();
  console.log('Documents: ' + documentsCount);

  // Galleries count
  const galleriesCount = await prisma.gallery.count();
  console.log('Galleries: ' + galleriesCount);

  // Gallery images count
  const galleryImagesCount = await prisma.galleryImage.count();
  console.log('Gallery images: ' + galleryImagesCount);

  // Events count
  const eventsCount = await prisma.event.count();
  console.log('Events: ' + eventsCount);

  // Sample post with R2 URL
  const samplePost = await prisma.post.findFirst({
    where: {
      content: {
        contains: 'r2.dev'
      }
    },
    select: {
      title: true,
      content: true
    }
  });

  if (samplePost) {
    console.log('\n--- Sample Post with R2 Images ---');
    console.log('Title: ' + samplePost.title);
    const r2Matches = samplePost.content.match(/https:\/\/[^"'\s]+r2\.dev[^"'\s]*/g);
    if (r2Matches) {
      console.log('R2 URLs found: ' + r2Matches.length);
      console.log('First R2 URL: ' + r2Matches[0].substring(0, 100) + '...');
    }
  }

  // Sample page with content
  const samplePage = await prisma.page.findFirst({
    where: {
      content: {
        not: ''
      }
    },
    orderBy: {
      content: 'desc'
    },
    select: {
      title: true,
      content: true
    }
  });

  if (samplePage) {
    console.log('\n--- Sample Page with Content ---');
    console.log('Title: ' + samplePage.title);
    console.log('Content length: ' + samplePage.content.length + ' chars');
    console.log('Preview: ' + samplePage.content.substring(0, 200) + '...');
  }

  await prisma.$disconnect();
}

verify().catch(console.error);
