import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  isPlannerOpen: boolean;
  isThesisOpen: boolean;
  selectedCourseId: string | null;
  exportPopoverOpen: boolean;
  settingsPopoverOpen: boolean;
  openPlanner: () => void;
  closePlanner: () => void;
  togglePlanner: () => void;
  openThesis: () => void;
  closeThesis: () => void;
  toggleThesis: () => void;
  openCourseDetail: (courseId: string) => void;
  closeCourseDetail: () => void;
  setExportPopover: (open: boolean) => void;
  setSettingsPopover: (open: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      isPlannerOpen: false,
      isThesisOpen: false,
      selectedCourseId: null,
      exportPopoverOpen: false,
      settingsPopoverOpen: false,
      openPlanner: () => set({ isPlannerOpen: true }),
      closePlanner: () => set({ isPlannerOpen: false }),
      togglePlanner: () => set((state) => ({ isPlannerOpen: !state.isPlannerOpen })),
      openThesis: () => set({ isThesisOpen: true }),
      closeThesis: () => set({ isThesisOpen: false }),
      toggleThesis: () => set((state) => ({ isThesisOpen: !state.isThesisOpen })),
      openCourseDetail: (courseId: string) => set({ selectedCourseId: courseId }),
      closeCourseDetail: () => set({ selectedCourseId: null }),
      setExportPopover: (open: boolean) => set({ exportPopoverOpen: open }),
      setSettingsPopover: (open: boolean) => set({ settingsPopoverOpen: open }),
    }),
    {
      name: 'ui-store',
      partialize: (state) => ({
        isPlannerOpen: state.isPlannerOpen,
        isThesisOpen: state.isThesisOpen,
      }),
    }
  )
);