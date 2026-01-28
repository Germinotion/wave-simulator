import { create } from 'zustand';

const useAppStore = create((set, get) => ({
  // Visualization
  mode: 'ocean',
  colorScheme: 0,

  // Audio
  isListening: false,
  error: null,
  sources: [],           // { id, type:'mic'|'file'|'tone', label, active }
  nextSourceId: 1,

  // Transport
  isPaused: false,
  timeScale: 1.0,
  currentTime: 0,

  // View
  viewMode: 'single',    // 'single' | 'split'
  splitAssignment: { a: null, b: null },
  showLabels: false,
  showHarmonics: false,
  showOnboarding: false,

  // Actions
  setMode: (mode) => set({ mode }),
  setColorScheme: (colorScheme) => set({ colorScheme }),
  setIsListening: (isListening) => set({ isListening }),
  setError: (error) => set({ error }),
  setIsPaused: (isPaused) => set({ isPaused }),
  setTimeScale: (timeScale) => set({ timeScale }),
  setCurrentTime: (currentTime) => set({ currentTime }),
  setViewMode: (viewMode) => set({ viewMode }),
  setShowLabels: (showLabels) => set({ showLabels }),
  setShowHarmonics: (showHarmonics) => set({ showHarmonics }),
  setShowOnboarding: (showOnboarding) => set({ showOnboarding }),

  setSplitAssignment: (slot, sourceId) =>
    set((state) => ({
      splitAssignment: { ...state.splitAssignment, [slot]: sourceId },
    })),

  addSource: (source) =>
    set((state) => {
      const id = state.nextSourceId;
      return {
        sources: [...state.sources, { ...source, id, active: true }],
        nextSourceId: id + 1,
      };
    }),

  removeSource: (id) =>
    set((state) => ({
      sources: state.sources.filter((s) => s.id !== id),
    })),

  toggleSource: (id) =>
    set((state) => ({
      sources: state.sources.map((s) =>
        s.id === id ? { ...s, active: !s.active } : s
      ),
    })),

  updateSource: (id, patch) =>
    set((state) => ({
      sources: state.sources.map((s) =>
        s.id === id ? { ...s, ...patch } : s
      ),
    })),

  reset: () =>
    set({
      mode: 'ocean',
      colorScheme: 0,
      isPaused: false,
      timeScale: 1.0,
      viewMode: 'single',
      showLabels: false,
      showHarmonics: false,
    }),
}));

export default useAppStore;
