import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { KitItem, EmergencyContact } from '../types';
import { DEFAULT_KIT_ITEMS } from '../constants';

interface AppState {
  kitItems: KitItem[];
  contacts: EmergencyContact[];
  toggleKitItem: (id: string) => void;
  resetKit: () => void;
  addContact: (contact: EmergencyContact) => void;
  removeContact: (id: string) => void;
  userLocation: { lat: number; lng: number } | null;
  setUserLocation: (loc: { lat: number; lng: number }) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      kitItems: DEFAULT_KIT_ITEMS,
      contacts: [],
      userLocation: null,
      
      toggleKitItem: (id) =>
        set((state) => ({
          kitItems: state.kitItems.map((item) =>
            item.id === id ? { ...item, checked: !item.checked } : item
          ),
        })),

      resetKit: () => set({ kitItems: DEFAULT_KIT_ITEMS }),

      addContact: (contact) =>
        set((state) => ({ contacts: [...state.contacts, contact] })),

      removeContact: (id) =>
        set((state) => ({
          contacts: state.contacts.filter((c) => c.id !== id),
        })),

      setUserLocation: (loc) => set({ userLocation: loc }),
    }),
    {
      name: 'qare-storage',
      partialize: (state) => ({ kitItems: state.kitItems, contacts: state.contacts }),
    }
  )
);