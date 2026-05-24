import { create } from "zustand";

export interface SearchHeading {
  text: string;
  level: number;
  slug: string;
}

export interface SearchItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  track: string;
  trackName: string;
  subCategory: string;
  subCategoryName: string;
  headings: SearchHeading[];
}

interface SearchState {
  items: SearchItem[];
  isLoading: boolean;
  isOpen: boolean;
  hasLoadedOnce: boolean;
  setIsOpen: (open: boolean) => void;
  fetchSearchIndex: () => Promise<void>;
}

export const useSearchStore = create<SearchState>((set, get) => ({
  items: [],
  isLoading: false,
  isOpen: false,
  hasLoadedOnce: false,
  setIsOpen: (open) => set({ isOpen: open }),
  fetchSearchIndex: async () => {
    // Return early if already cached or currently loading
    if (get().hasLoadedOnce || get().isLoading) return;

    set({ isLoading: true });
    try {
      const res = await fetch("/api/search");
      if (res.ok) {
        const data = await res.json();
        set({
          items: data.items || [],
          hasLoadedOnce: true,
        });
      }
    } catch (error) {
      console.error("Failed to load search index:", error);
    } finally {
      set({ isLoading: false });
    }
  },
}));
