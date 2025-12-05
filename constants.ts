import { KitItem } from './types';

export const DEFAULT_KIT_ITEMS: KitItem[] = [
  { id: '1', label: 'Su (Kişi başı 4 litre)', category: 'essentials', checked: false },
  { id: '2', label: 'Konserve Gıda & Bisküvi', category: 'essentials', checked: false },
  { id: '3', label: 'Fener & Yedek Piller', category: 'tools', checked: false },
  { id: '4', label: 'İlk Yardım Çantası', category: 'medical', checked: false },
  { id: '5', label: 'Düdük', category: 'tools', checked: false },
  { id: '6', label: 'Powerbank', category: 'tools', checked: false },
  { id: '7', label: 'Önemli Evrak Fotokopileri', category: 'docs', checked: false },
  { id: '8', label: 'Reçeteli İlaçlar', category: 'medical', checked: false },
  { id: '9', label: 'Battaniye / Uyku Tulumu', category: 'essentials', checked: false },
  { id: '10', label: 'Nakit Para', category: 'essentials', checked: false },
];

export const MOCK_ASSEMBLY_POINTS = [
  // These are relative offsets applied to user location for demo purposes
  { id: 1, name: 'Merkez Parkı', latOffset: 0.005, lngOffset: 0.005, description: 'Park alanı girişi' },
  { id: 2, name: 'Okul Bahçesi', latOffset: -0.003, lngOffset: 0.004, description: 'Lise bahçesi' },
  { id: 3, name: 'Pazar Yeri', latOffset: 0.002, lngOffset: -0.006, description: 'Kapalı pazar alanı' },
];
