'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, MapPin, Users, Building2, Landmark } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

interface VillageFact {
  icon: typeof Users;
  label: string;
  value: string;
}

interface Village {
  id: string;
  name: string;
  image: string;
  href: string;
  facts: VillageFact[];
}

const villages: Village[] = [
  {
    id: 'veliki-bukovec',
    name: 'Veliki Bukovec',
    image: '/images/hero/veliki-bukovec-hero-1.webp',
    href: '/naselja/veliki-bukovec',
    facts: [
      { icon: Users, label: 'Stanovnika', value: '~600' },
      { icon: Landmark, label: 'Znamenitost', value: 'Dvorac Drašković' },
      { icon: Building2, label: 'Status', value: 'Sjedište općine' },
    ],
  },
  {
    id: 'kapela-podravska',
    name: 'Kapela Podravska',
    image: '/images/hero/veliki-bukovec-hero-2.webp',
    href: '/naselja/kapela',
    facts: [
      { icon: Users, label: 'Stanovnika', value: '~350' },
      { icon: MapPin, label: 'Posebnost', value: 'Plodno podravsko tlo' },
      { icon: Building2, label: 'Tradicija', value: 'Poljoprivreda' },
    ],
  },
  {
    id: 'dubovica',
    name: 'Dubovica',
    image: '/images/hero/veliki-bukovec-hero-3.webp',
    href: '/naselja/dubovica',
    facts: [
      { icon: Users, label: 'Stanovnika', value: '~400' },
      { icon: MapPin, label: 'Posebnost', value: 'Rijeka Plitvica' },
      { icon: Building2, label: 'Dijelovi', value: 'Gornja i Donja' },
    ],
  },
];

const CYCLE_DURATION = 8000; // 8 seconds per village

// Typewriter component
function Typewriter({ text, speed = 50, delay = 0 }: { text: string; speed?: number; delay?: number }) {
  const [displayedText, setDisplayedText] = useState('');
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    // Reset state asynchronously to avoid cascading renders
    const resetTimeout = setTimeout(() => {
      setDisplayedText('');
      setHasStarted(false);
    }, 0);

    const startTimeout = setTimeout(() => {
      setHasStarted(true);
    }, delay);

    return () => {
      clearTimeout(resetTimeout);
      clearTimeout(startTimeout);
    };
  }, [text, delay]);

  useEffect(() => {
    if (!hasStarted) return;

    if (displayedText.length < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(text.slice(0, displayedText.length + 1));
      }, speed);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [displayedText, text, speed, hasStarted]);

  return (
    <span>
      {displayedText}
      {displayedText.length < text.length && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.4, repeat: Infinity }}
          className="ml-0.5 text-primary-400"
        >
          |
        </motion.span>
      )}
    </span>
  );
}

// Animated fact component
function AnimatedFact({ fact, delay, villageKey }: { fact: VillageFact; delay: number; villageKey: string }) {
  const Icon = fact.icon;

  return (
    <motion.div
      key={`${villageKey}-${fact.label}`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: delay / 1000, duration: 0.5, ease: 'easeOut' }}
      className="flex items-center gap-3"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm">
        <Icon className="h-5 w-5 text-primary-400" />
      </div>
      <div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay / 1000, duration: 0.3 }}
          className="text-xs font-medium uppercase tracking-wider text-white/60"
        >
          {fact.label}
        </motion.div>
        <div className="text-lg font-bold text-white">
          <Typewriter text={fact.value} speed={40} delay={delay + 300} />
        </div>
      </div>
    </motion.div>
  );
}

export function VillageHero() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Auto-cycle when not hovering
  useEffect(() => {
    if (isHovering) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % villages.length);
    }, CYCLE_DURATION);

    return () => clearInterval(interval);
  }, [isHovering]);

  const handleCardHover = useCallback((index: number) => {
    setIsHovering(true);
    setHoveredIndex(index);
    setActiveIndex(index);
  }, []);

  const handleCardLeave = useCallback(() => {
    setIsHovering(false);
    setHoveredIndex(null);
  }, []);

  const displayIndex = hoveredIndex !== null ? hoveredIndex : activeIndex;
  const activeVillage = villages[displayIndex]!;

  return (
    <section className="relative -mt-16 h-[100svh] min-h-[600px] w-full overflow-hidden bg-neutral-900">
      {/* Background Images with Ken Burns */}
      <AnimatePresence mode="sync">
        <motion.div
          key={activeVillage.id}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          <motion.div
            animate={{
              scale: [1, 1.08],
              x: [0, 15],
              y: [0, -10],
            }}
            transition={{
              duration: 20,
              ease: 'linear',
              repeat: Infinity,
              repeatType: 'reverse',
            }}
            className="absolute inset-[-10%] h-[120%] w-[120%]"
          >
            <Image
              src={activeVillage.image}
              alt={activeVillage.name}
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/95 via-neutral-900/40 to-neutral-900/50" />
      <div className="absolute inset-0 bg-gradient-to-r from-neutral-900/70 via-transparent to-neutral-900/50 lg:from-neutral-900/80" />

      {/* Content */}
      <div className="container relative z-10 mx-auto flex h-full flex-col justify-between px-4 pb-8 pt-24">
        {/* Top spacer */}
        <div />

        {/* Main content area */}
        <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
          {/* Left: Village info with typewriter */}
          <div className="flex-1 text-center lg:text-left">
            {/* Village name with typewriter */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeVillage.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <Link
                  href={activeVillage.href}
                  className="group inline-block"
                >
                  <motion.h2
                    className="font-display text-4xl font-bold text-white drop-shadow-2xl transition-colors group-hover:text-primary-300 sm:text-5xl lg:text-6xl xl:text-7xl"
                  >
                    <Typewriter text={activeVillage.name} speed={60} delay={200} />
                  </motion.h2>
                </Link>

                {/* Facts with typewriter - Desktop */}
                <div className="mt-8 hidden space-y-4 lg:block">
                  {activeVillage.facts.map((fact, index) => (
                    <AnimatedFact
                      key={`${activeVillage.id}-${fact.label}`}
                      fact={fact}
                      delay={800 + index * 400}
                      villageKey={activeVillage.id}
                    />
                  ))}
                </div>

                {/* Mobile: Compact facts with typewriter */}
                <div className="mt-6 flex flex-wrap justify-center gap-4 lg:hidden">
                  {activeVillage.facts.slice(0, 2).map((fact, index) => (
                    <motion.div
                      key={`${activeVillage.id}-${fact.label}-mobile`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + index * 0.2 }}
                      className="rounded-lg bg-white/10 px-4 py-2 backdrop-blur-sm"
                    >
                      <div className="text-xs font-medium uppercase tracking-wider text-white/60">
                        {fact.label}
                      </div>
                      <div className="text-sm font-bold text-white">
                        <Typewriter text={fact.value} speed={50} delay={800 + index * 300} />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-6 max-w-md text-lg text-white/70 lg:mt-10"
            >
              Tri sela. Jedna općina. Otkrijte ljepote Podravine.
            </motion.p>
          </div>

          {/* Right: Gonfalon - Desktop only */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 4, ease: 'easeOut' }}
            className="hidden flex-shrink-0 lg:block"
          >
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute -inset-8 rounded-full bg-primary-500/20 blur-3xl" />

              {/* Gonfalon image - doubled size */}
              <div className="relative h-[36rem] w-80 xl:h-[48rem] xl:w-[26rem]">
                <Image
                  src="/images/gonfalon.webp"
                  alt="Gonfalon Općine Veliki Bukovec"
                  fill
                  className="object-contain drop-shadow-2xl"
                  sizes="(max-width: 1280px) 320px, 416px"
                  priority
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom: Village Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="pb-4"
        >
          {/* Progress indicators */}
          <div className="mb-6 flex justify-center gap-2">
            {villages.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setActiveIndex(index);
                  setIsHovering(true);
                  setTimeout(() => setIsHovering(false), 100);
                }}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  index === displayIndex
                    ? 'w-10 bg-primary-400'
                    : 'w-3 bg-white/40 hover:bg-white/60'
                }`}
                aria-label={`Prikaži ${villages[index]?.name}`}
              />
            ))}
          </div>

          {/* Village Cards */}
          <div className="flex justify-center gap-3 sm:gap-4 md:gap-6">
            {villages.map((village, index) => (
              <motion.button
                key={village.id}
                onMouseEnter={() => handleCardHover(index)}
                onMouseLeave={handleCardLeave}
                onClick={() => handleCardHover(index)}
                animate={{
                  y: [0, -4, 0],
                }}
                transition={{
                  duration: 3,
                  ease: 'easeInOut',
                  repeat: Infinity,
                  delay: index * 0.3,
                }}
                whileHover={{
                  scale: 1.05,
                  y: -8,
                }}
                className={`group relative overflow-hidden rounded-xl transition-all duration-300 sm:rounded-2xl ${
                  index === displayIndex
                    ? 'ring-2 ring-primary-400 ring-offset-2 ring-offset-transparent shadow-2xl shadow-primary-500/20'
                    : 'opacity-70 hover:opacity-100'
                }`}
              >
                {/* Glass card */}
                <div className="relative h-20 w-24 overflow-hidden rounded-xl backdrop-blur-md sm:h-24 sm:w-32 md:h-32 md:w-44 lg:h-36 lg:w-52">
                  {/* Background image */}
                  <Image
                    src={village.image}
                    alt={village.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 640px) 96px, (max-width: 768px) 128px, (max-width: 1024px) 176px, 208px"
                  />

                  {/* Glass overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/80 via-neutral-900/20 to-transparent" />

                  {/* Glow effect on active */}
                  {index === displayIndex && (
                    <div className="absolute inset-0 bg-gradient-to-t from-primary-500/30 to-transparent" />
                  )}

                  {/* Village name */}
                  <div className="absolute inset-x-0 bottom-0 p-2 text-center sm:p-3 lg:text-left">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white drop-shadow-lg sm:text-xs md:text-sm">
                      {village.name}
                    </span>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-4 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-white/60"
        >
          <ChevronDown className="h-6 w-6" />
        </motion.div>
      </motion.div>
    </section>
  );
}
