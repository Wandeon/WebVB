'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';

interface Village {
  id: string;
  name: string;
  image: string;
  video?: string;
}

const villages: Village[] = [
  {
    id: 'veliki-bukovec',
    name: 'Veliki Bukovec',
    image: '/images/hero/veliki-bukovec-hero-1.jpg',
    // video: '/videos/hero/veliki-bukovec.webm',
  },
  {
    id: 'kapela-podravska',
    name: 'Kapela Podravska',
    image: '/images/hero/veliki-bukovec-hero-2.jpg',
    // video: '/videos/hero/kapela-podravska.webm',
  },
  {
    id: 'dubovica',
    name: 'Dubovica',
    image: '/images/hero/veliki-bukovec-hero-3.jpg',
    // video: '/videos/hero/dubovica.webm',
  },
];

const CYCLE_DURATION = 6000; // 6 seconds per village

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
  // Always valid since displayIndex is 0-2 and villages has 3 items
  const activeVillage = villages[displayIndex]!;

  return (
    <section className="relative h-[100svh] min-h-[600px] w-full overflow-hidden bg-neutral-900">
      {/* Background Images/Videos with Ken Burns */}
      <AnimatePresence mode="sync">
        <motion.div
          key={activeVillage.id}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          {/* Ken Burns animation container */}
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
            {activeVillage.video ? (
              <video
                src={activeVillage.video}
                autoPlay
                muted
                loop
                playsInline
                className="h-full w-full object-cover"
              />
            ) : (
              <Image
                src={activeVillage.image}
                alt={activeVillage.name}
                fill
                priority
                className="object-cover"
                sizes="100vw"
              />
            )}
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/90 via-neutral-900/30 to-neutral-900/40" />
      <div className="absolute inset-0 bg-gradient-to-r from-neutral-900/30 via-transparent to-neutral-900/30" />

      {/* Particle overlay effect */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute h-1 w-1 animate-pulse rounded-full bg-white/60 top-[20%] left-[30%]" />
        <div className="absolute h-1.5 w-1.5 animate-pulse rounded-full bg-white/40 top-[40%] left-[70%] animation-delay-1000" />
        <div className="absolute h-1 w-1 animate-pulse rounded-full bg-white/50 top-[60%] left-[20%] animation-delay-2000" />
        <div className="absolute h-1 w-1 animate-pulse rounded-full bg-white/40 top-[30%] left-[80%] animation-delay-3000" />
        <div className="absolute h-1.5 w-1.5 animate-pulse rounded-full bg-white/30 top-[70%] left-[60%] animation-delay-1500" />
      </div>

      {/* Content */}
      <div className="container relative z-10 mx-auto flex h-full flex-col justify-between px-4 py-8">
        {/* Top spacer */}
        <div />

        {/* Center content */}
        <div className="text-center">
          {/* Big village name on hover */}
          <AnimatePresence mode="wait">
            {hoveredIndex !== null && (
              <motion.div
                key={`village-name-${hoveredIndex}`}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="mb-4"
              >
                <span className="font-display text-5xl font-bold uppercase tracking-wider text-white drop-shadow-2xl md:text-7xl lg:text-8xl">
                  {villages[hoveredIndex]?.name}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className={`font-display text-3xl font-bold text-white drop-shadow-lg transition-all duration-500 md:text-4xl lg:text-5xl ${
              hoveredIndex !== null ? 'opacity-60 scale-90' : ''
            }`}
          >
            Dobro došli u Općinu Veliki Bukovec
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className={`mx-auto mt-4 max-w-2xl text-lg text-white/80 drop-shadow transition-all duration-500 md:text-xl ${
              hoveredIndex !== null ? 'opacity-0' : ''
            }`}
          >
            Tri sela. Jedna općina. Otkrijte ljepote Podravine.
          </motion.p>

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
              <div
                key={index}
                className={`h-1 rounded-full transition-all duration-500 ${
                  index === displayIndex
                    ? 'w-8 bg-white'
                    : 'w-2 bg-white/40'
                }`}
              />
            ))}
          </div>

          {/* Village Cards */}
          <div className="flex justify-center gap-4 md:gap-6">
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
                  rotateY: 5,
                  rotateX: -5,
                }}
                className={`group relative overflow-hidden rounded-2xl transition-all duration-300 ${
                  index === displayIndex
                    ? 'ring-2 ring-white ring-offset-2 ring-offset-transparent shadow-2xl shadow-white/20'
                    : 'opacity-70 hover:opacity-100'
                }`}
                style={{
                  perspective: '1000px',
                  transformStyle: 'preserve-3d',
                }}
              >
                {/* Glass card */}
                <div className="relative h-24 w-32 overflow-hidden rounded-2xl backdrop-blur-md md:h-32 md:w-44 lg:h-36 lg:w-52">
                  {/* Background image */}
                  <Image
                    src={village.image}
                    alt={village.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 768px) 128px, (max-width: 1024px) 176px, 208px"
                  />

                  {/* Glass overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/80 via-neutral-900/20 to-transparent" />

                  {/* Glow effect on active */}
                  {index === displayIndex && (
                    <div className="absolute inset-0 bg-gradient-to-t from-primary-500/20 to-transparent" />
                  )}

                  {/* Village name */}
                  <div className="absolute inset-x-0 bottom-0 p-3 text-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-white drop-shadow-lg md:text-sm">
                      {village.name}
                    </span>
                  </div>

                  {/* Hover glow border */}
                  <div className="absolute inset-0 rounded-2xl border border-white/0 transition-all duration-300 group-hover:border-white/40" />
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
