import { create } from "zustand";
import type { Branch } from "@/features/admin/components/selector-branch";

interface BranchState {
  branch: Branch | null;
  setBranch: (branch: Branch) => void;
}

export const useSetBranch = create<BranchState>()((set) => ({
  branch: null,
  setBranch: (branch) => set({ branch }),
}));
