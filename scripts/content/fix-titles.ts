import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Croatian diacritics mapping
const DIACRITICS_MAP: Record<string, string> = {
  'Opcine': 'Općine', 'opcine': 'općine',
  'Opcina': 'Općina', 'opcina': 'općina',
  'Opcinu': 'Općinu', 'opcinu': 'općinu',
  'Proracun': 'Proračun', 'proracun': 'proračun',
  'Proracuna': 'Proračuna', 'proracuna': 'proračuna',
  'Natjecaj': 'Natječaj', 'natjecaj': 'natječaj',
  'Ciscenja': 'Čišćenja', 'ciscenja': 'čišćenja',
  'Novcane': 'Novčane', 'novcane': 'novčane',
  'Novcanoj': 'Novčanoj', 'novcanoj': 'novčanoj',
  'Godisnje': 'Godišnje', 'godisnje': 'godišnje',
  'Godisnji': 'Godišnji', 'godisnji': 'godišnji',
  'Godisnjeg': 'Godišnjeg', 'godisnjeg': 'godišnjeg',
  'Izvrsavanju': 'Izvršavanju', 'izvrsavanju': 'izvršavanju',
  'Donosenju': 'Donošenju', 'donosenju': 'donošenju',
  'Stratesku': 'Stratešku', 'stratesku': 'stratešku',
  'Pedagosku': 'Pedagošku', 'pedagosku': 'pedagošku',
  'Skolsku': 'Školsku', 'skolsku': 'školsku',
  'Poduzetnistva': 'Poduzetništva', 'poduzetnistva': 'poduzetništva',
  'Uzivajte': 'Uživajte', 'uzivajte': 'uživajte',
  'Obrazlozenje': 'Obrazloženje', 'obrazlozenje': 'obrazloženje',
  'Reciklazno': 'Reciklažno', 'reciklazno': 'reciklažno',
  'Podruznica': 'Podružnica', 'podruznica': 'podružnica',
  'Lozenje': 'Loženje', 'lozenje': 'loženje',
  'Uredenja': 'Uređenja', 'uredenja': 'uređenja',
  'Uredanja': 'Uređaja', 'uredanja': 'uređaja',
  'Izvjesce': 'Izvješće', 'izvjesce': 'izvješće',
  'Dvoriste': 'Dvorište', 'dvoriste': 'dvorište',
  'Vrtica': 'Vrtića', 'vrtica': 'vrtića',
  'Djecjeg': 'Dječjeg', 'djecjeg': 'dječjeg',
  'Ucenicima': 'Učenicima', 'ucenicima': 'učenicima',
  'Podrucja': 'Područja', 'podrucja': 'područja',
  'Podrucju': 'Području', 'podrucju': 'području',
  // Typo fixes
  'Obvijest': 'Obavijest', 'obvijest': 'obavijest',
  'Dimovodih': 'Dimovodnih', 'dimovodih': 'dimovodnih',
  'Odrazavanju': 'Održavanju', 'odrazavanju': 'održavanju',
  'Odrzavanju': 'Održavanju', 'odrzavanju': 'održavanju',
};

// Fix spaced out letters like "O B A V I J E S T" → "Obavijest"
// Handle special case "J A V N I P O Z I V" → "Javni poziv"
function removeSpacedLetters(text: string): string {
  // Pattern: detect sequences of single letters separated by spaces
  return text.replace(/\b([A-ZČĆŽŠĐ])(\s+[A-ZČĆŽŠĐ]){2,}\b/g, (match) => {
    const word = match.replace(/\s+/g, '');
    // Special cases that should be two words
    if (word === 'JAVNIPOZIV') return 'Javni poziv';
    // Convert to sentence case
    return word.charAt(0) + word.slice(1).toLowerCase();
  });
}

// Convert ALL CAPS text to sentence case
function toSentenceCase(text: string): string {
  // Split into words
  const words = text.split(/\s+/);

  // Check if it's ALL CAPS (more than 60% uppercase letters, at least 3 words)
  const allText = words.join('');
  const upperCount = (allText.match(/[A-ZČĆŽŠĐ]/g) || []).length;
  const lowerCount = (allText.match(/[a-zčćžšđ]/g) || []).length;

  if (words.length >= 2 && upperCount > (upperCount + lowerCount) * 0.6) {
    // Convert whole thing to lowercase first
    const lowered = text.toLowerCase();
    // Capitalize first letter and after sentence punctuation
    return lowered
      .replace(/^[a-zčćžšđ]/, c => c.toUpperCase())
      .replace(/([\.\!\?]\s+)([a-zčćžšđ])/g, (_, punct, char) => punct + char.toUpperCase())
      .replace(/(:\s+)([a-zčćžšđ])/g, (_, punct, char) => punct + char.toUpperCase())
      .replace(/(„)([a-zčćžšđ])/g, (_, quot, char) => quot + char.toUpperCase());
  }
  return text;
}

// Apply diacritics
function applyDiacritics(text: string): string {
  let result = text;
  for (const [wrong, correct] of Object.entries(DIACRITICS_MAP)) {
    const regex = new RegExp(`\\b${wrong}\\b`, 'g');
    result = result.replace(regex, correct);
  }
  return result;
}

// Fix Title Case to proper Croatian (only capitalize first word and proper nouns)
function fixTitleCase(text: string): string {
  // Words that should stay capitalized (proper nouns, acronyms)
  const properNouns = ['Veliki', 'Bukovec', 'Općine', 'Općina', 'Općinu', 'Krijesnica', 'Rotary', 'Ludbreg', 'Croatia', 'Club', 'Cluba', 'ISPU', 'ZPPI', 'OVB'];

  const words = text.split(/\s+/);

  // Check if it's Title Case: most words start with capital followed by lowercase
  const titleCaseWords = words.filter(w => /^[A-ZČĆŽŠĐ][a-zčćžšđ]+$/.test(w));

  if (titleCaseWords.length > words.length * 0.4 && words.length > 2) {
    return words.map((word, index) => {
      // Keep first word capitalized
      if (index === 0) return word;

      // Keep proper nouns
      if (properNouns.includes(word)) return word;

      // Roman numerals with period at position 0 stay uppercase
      if (index === 0 && /^[IVXLCDMivxlcdm]+\.$/.test(word)) {
        return word.toUpperCase();
      }

      // Standalone "I" in middle of sentence is Croatian conjunction "i" = lowercase
      if (word === 'I' || word === 'i') return 'i';

      // Roman numerals with period (like "VIII.") at start - keep uppercase
      // But NOT standalone I/V/X in the middle (those are likely conjunction)
      if (/^[IVXLCDMivxlcdm]{2,}\.?$/.test(word)) {
        return word.toUpperCase().replace(/\.$/, '') + (word.endsWith('.') ? '.' : '');
      }

      // Keep years
      if (/^\d{4}\.?[a-z]?$/i.test(word)) return word.toLowerCase();

      // Lowercase words that start with capital followed by lowercase
      if (/^[A-ZČĆŽŠĐ][a-zčćžšđ]+$/.test(word)) {
        return word.toLowerCase();
      }

      return word;
    }).join(' ');
  }
  return text;
}

// Fix acronyms that should be uppercase
function fixAcronyms(text: string): string {
  const acronyms = ['ISPU', 'ZPPI', 'OVB'];
  let result = text;
  for (const acronym of acronyms) {
    const regex = new RegExp(`\\b${acronym.toLowerCase()}\\b`, 'gi');
    result = result.replace(regex, acronym);
  }
  return result;
}

// Fix roman numerals at start of sentence
function fixRomanNumerals(text: string): string {
  // Fix lowercase roman numerals followed by period at start
  return text.replace(/^(i{1,3}|iv|vi{0,3}|ix|x{1,3})\.\s/i, (match) => match.toUpperCase());
}

// Main fix function
function fixTitle(title: string): string {
  let fixed = title;

  // Step 1: Remove spaced letters and convert to sentence case (O B A V I J E S T → Obavijest)
  fixed = removeSpacedLetters(fixed);

  // Step 2: Convert remaining ALL CAPS to sentence case
  fixed = toSentenceCase(fixed);

  // Step 3: Fix Title Case
  fixed = fixTitleCase(fixed);

  // Step 4: Apply diacritics
  fixed = applyDiacritics(fixed);

  // Step 5: Fix acronyms
  fixed = fixAcronyms(fixed);

  // Step 6: Fix roman numerals
  fixed = fixRomanNumerals(fixed);

  // Step 7: Clean up multiple spaces
  fixed = fixed.replace(/\s+/g, ' ').trim();

  // Step 8: Ensure first letter is capitalized
  fixed = fixed.charAt(0).toUpperCase() + fixed.slice(1);

  return fixed;
}

async function main() {
  const dryRun = !process.argv.includes('--execute');

  console.log(dryRun ? '=== DRY RUN (use --execute to apply) ===' : '=== EXECUTING ===');

  // Get last 20 posts
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20,
    select: { id: true, title: true }
  });

  console.log('\n=== POSTS ===');
  let postChanges = 0;
  for (const post of posts) {
    const fixed = fixTitle(post.title);
    if (fixed !== post.title) {
      console.log(`BEFORE: ${post.title}`);
      console.log(`AFTER:  ${fixed}`);
      console.log('');
      postChanges++;

      if (!dryRun) {
        await prisma.post.update({
          where: { id: post.id },
          data: { title: fixed }
        });
      }
    }
  }

  // Get last 20 documents
  const docs = await prisma.document.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20,
    select: { id: true, title: true }
  });

  console.log('\n=== DOCUMENTS ===');
  let docChanges = 0;
  for (const doc of docs) {
    const fixed = fixTitle(doc.title);
    if (fixed !== doc.title) {
      console.log(`BEFORE: ${doc.title}`);
      console.log(`AFTER:  ${fixed}`);
      console.log('');
      docChanges++;

      if (!dryRun) {
        await prisma.document.update({
          where: { id: doc.id },
          data: { title: fixed }
        });
      }
    }
  }

  console.log(`\n=== SUMMARY ===`);
  console.log(`Posts to fix: ${postChanges}`);
  console.log(`Documents to fix: ${docChanges}`);

  if (dryRun && (postChanges > 0 || docChanges > 0)) {
    console.log('\nRun with --execute to apply changes');
  } else if (!dryRun) {
    console.log('\nChanges applied successfully!');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
