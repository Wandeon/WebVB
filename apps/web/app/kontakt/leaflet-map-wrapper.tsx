'use client';

import dynamic from 'next/dynamic';

// Dynamic import for Leaflet (client-side only)
const LeafletMap = dynamic(
  () => import('@repo/ui').then((mod) => mod.LeafletMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[350px] animate-pulse rounded-lg bg-neutral-200" />
    ),
  }
);

interface LeafletMapWrapperProps {
  latitude: number;
  longitude: number;
  markerLabel: string;
  className?: string;
}

export function LeafletMapWrapper({
  latitude,
  longitude,
  markerLabel,
  className = '',
}: LeafletMapWrapperProps) {
  return (
    <LeafletMap
      latitude={latitude}
      longitude={longitude}
      markerLabel={markerLabel}
      className={className}
    />
  );
}
