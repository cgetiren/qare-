import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Earthquake, AssemblyPoint } from '../types';
import { MOCK_ASSEMBLY_POINTS } from '../constants';
import { useStore } from '../store/useStore';
import { Navigation, MapPin } from 'lucide-react';

interface Props {
  earthquakes: Earthquake[];
}

// Helper to recenter map
const RecenterAutomatically = ({ lat, lng }: { lat: number; lng: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng]);
  }, [lat, lng, map]);
  return null;
};

// Custom Icons
const createIcon = (color: string, size: number = 24) => {
  return L.divIcon({
    className: 'custom-icon',
    html: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
};

const userIcon = createIcon('#3b82f6', 32); // Blue for user
const quakeIcon = createIcon('#ef4444', 24); // Red for quake
const safeZoneIcon = createIcon('#22c55e', 32); // Green for safe zone

const MapComponent: React.FC<Props> = ({ earthquakes }) => {
  const { userLocation, setUserLocation } = useStore();
  const [assemblyPoints, setAssemblyPoints] = useState<AssemblyPoint[]>([]);

  // Get User Location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          
          // Generate mock assembly points around user location
          const points = MOCK_ASSEMBLY_POINTS.map(p => ({
            ...p,
            lat: latitude + p.latOffset,
            lng: longitude + p.lngOffset
          }));
          setAssemblyPoints(points);
        },
        (error) => {
          console.error("Error fetching location:", error);
          // Default to Istanbul center if location fails
          setUserLocation({ lat: 41.0082, lng: 28.9784 });
        }
      );
    } else {
       // Fallback for browsers without geolocation
       setUserLocation({ lat: 41.0082, lng: 28.9784 });
    }
  }, [setUserLocation]);

  const handleNavigate = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  };

  if (!userLocation) return <div className="h-full w-full bg-slate-100 flex items-center justify-center">Harita yükleniyor...</div>;

  return (
    <div className="h-[calc(100vh-80px)] w-full relative z-0">
      <MapContainer
        center={[userLocation.lat, userLocation.lng]}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <RecenterAutomatically lat={userLocation.lat} lng={userLocation.lng} />

        {/* User Marker */}
        <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
          <Popup>
            <div className="text-center">
              <span className="font-bold">Siz Buradasınız</span>
            </div>
          </Popup>
        </Marker>

        {/* Assembly Points */}
        {assemblyPoints.map((point) => (
          <Marker key={point.id} position={[point.lat, point.lng]} icon={safeZoneIcon}>
            <Popup>
              <div className="p-1 min-w-[150px]">
                <h3 className="font-bold text-green-700 flex items-center gap-1 mb-1">
                  <MapPin size={14} /> {point.name}
                </h3>
                <p className="text-xs text-slate-600 mb-2">{point.description}</p>
                <button 
                  onClick={() => handleNavigate(point.lat, point.lng)}
                  className="w-full bg-blue-500 text-white text-xs py-1 px-2 rounded flex items-center justify-center gap-1 hover:bg-blue-600 transition"
                >
                  <Navigation size={12} /> Yol Tarifi Al
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Recent Earthquakes (Top 20 significant) */}
        {earthquakes.slice(0, 20).map((quake, idx) => {
          // Only show quakes larger than 2.0 to avoid clutter, or recently
          if (quake.mag < 2.0) return null;

          return (
            <Marker 
              key={`quake-${idx}`} 
              position={[quake.latitude, quake.longitude]} 
              icon={quakeIcon}
            >
              <Popup>
                <div className="text-center">
                  <strong className="text-red-600 block text-lg">{quake.mag.toFixed(1)}</strong>
                  <span className="text-xs font-semibold">{quake.title}</span> <br/>
                  <span className="text-xs text-slate-500">{quake.date}</span>
                </div>
              </Popup>
            </Marker>
          );
        })}

      </MapContainer>

      {/* Legend Overlay */}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-md z-[1000] text-xs space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span>Konumunuz</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span>Toplanma Alanı</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span>Son Depremler</span>
        </div>
      </div>
    </div>
  );
};

export default MapComponent;