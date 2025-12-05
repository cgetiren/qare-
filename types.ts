export interface Earthquake {
  id: string;
  date: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  depth: number;
  mag: number;
  title: string;
}

export interface AssemblyPoint {
  id: number;
  name: string;
  lat: number;
  lng: number;
  description: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string; // Should include country code
}

export interface KitItem {
  id: string;
  label: string;
  category: 'essentials' | 'medical' | 'docs' | 'tools';
  checked: boolean;
}

export type Tab = 'map' | 'list' | 'kit' | 'sos';