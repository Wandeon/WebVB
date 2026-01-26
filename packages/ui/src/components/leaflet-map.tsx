'use client';

import 'leaflet/dist/leaflet.css';

import { useEffect, useState } from 'react';

import { cn } from '../lib/utils';

export interface LeafletMapProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  markerLabel?: string;
  className?: string;
}

export function LeafletMap({
  latitude,
  longitude,
  zoom = 15,
  markerLabel,
  className,
}: LeafletMapProps) {
  const [MapComponent, setMapComponent] = useState<React.ComponentType<{
    center: [number, number];
    zoom: number;
    scrollWheelZoom: boolean;
    className: string;
    children: React.ReactNode;
  }> | null>(null);
  const [MarkerComponent, setMarkerComponent] = useState<React.ComponentType<{
    position: [number, number];
    children?: React.ReactNode;
  }> | null>(null);
  const [PopupComponent, setPopupComponent] = useState<React.ComponentType<{
    children: React.ReactNode;
  }> | null>(null);
  const [TileLayerComponent, setTileLayerComponent] = useState<React.ComponentType<{
    attribution: string;
    url: string;
  }> | null>(null);

  useEffect(() => {
    // Dynamically import Leaflet only on client side
    async function loadLeaflet() {
      const L = (await import('leaflet')).default;
      const { MapContainer, Marker, Popup, TileLayer } = await import('react-leaflet');

      // Fix for default marker icon in Next.js/webpack
      const defaultIcon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });
      L.Marker.prototype.options.icon = defaultIcon;

      setMapComponent(() => MapContainer);
      setMarkerComponent(() => Marker);
      setPopupComponent(() => Popup);
      setTileLayerComponent(() => TileLayer);
    }

    void loadLeaflet();
  }, []);

  // Show loading placeholder during SSR and while loading
  if (!MapComponent || !MarkerComponent || !TileLayerComponent) {
    return (
      <div className={cn('h-[300px] w-full animate-pulse rounded-lg bg-neutral-200', className)} />
    );
  }

  return (
    <MapComponent
      center={[latitude, longitude]}
      zoom={zoom}
      scrollWheelZoom={false}
      className={cn('h-[300px] w-full rounded-lg', className)}
    >
      <TileLayerComponent
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MarkerComponent position={[latitude, longitude]}>
        {markerLabel && PopupComponent && <PopupComponent>{markerLabel}</PopupComponent>}
      </MarkerComponent>
    </MapComponent>
  );
}
