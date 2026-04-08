"use client";

import { create } from "zustand";

export interface Spot {
  id: string;
  name: string;
  description?: string;
  address?: string;
  lat: number;
  lng: number;
  category: string;
  yajang_type: string;
  is_outdoor: boolean;
  has_heater: boolean;
  has_shelter: boolean;
  pet_friendly: boolean;
  is_verified: boolean;
  review_count: number;
  avg_rating?: string;
  created_at: string;
}

interface SpotStore {
  spots: Spot[];
  selectedSpot: Spot | null;
  isLoading: boolean;
  userLocation: { lat: number; lng: number } | null;

  setSpots: (spots: Spot[]) => void;
  setSelectedSpot: (spot: Spot | null) => void;
  setLoading: (v: boolean) => void;
  setUserLocation: (loc: { lat: number; lng: number }) => void;

  fetchSpots: (lat: number, lng: number, radius?: number) => Promise<void>;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export const useSpotStore = create<SpotStore>((set) => ({
  spots: [],
  selectedSpot: null,
  isLoading: false,
  userLocation: null,

  setSpots: (spots) => set({ spots }),
  setSelectedSpot: (selectedSpot) => set({ selectedSpot }),
  setLoading: (isLoading) => set({ isLoading }),
  setUserLocation: (userLocation) => set({ userLocation }),

  fetchSpots: async (lat, lng, radius = 3000) => {
    set({ isLoading: true });
    try {
      const params = new URLSearchParams({
        lat: String(lat),
        lng: String(lng),
        radius: String(radius),
      });
      const res = await fetch(`${API_BASE}/api/v1/spots?${params}`);
      if (!res.ok) throw new Error(`API ${res.status}`);
      const data = await res.json() as { spots: Spot[] };
      set({ spots: data.spots });
    } catch (err) {
      console.error("spots fetch error:", err);
    } finally {
      set({ isLoading: false });
    }
  },
}));
