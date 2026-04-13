import { create } from "zustand";

interface Branch {
  id: string;
  name: string;
  state: string;
}

interface BranchState {
  selectedBranch: Branch | null;
  setSelectedBranch: (branch: Branch | null) => void;
  clearSelectedBranch: () => void;
}

export const useBranchStore = create<BranchState>()((set) => ({
  selectedBranch: null,
  setSelectedBranch: (branch) => set({ selectedBranch: branch }),
  clearSelectedBranch: () => set({ selectedBranch: null }),
}));
