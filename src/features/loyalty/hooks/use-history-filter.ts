import { useMemo, useState } from "react";
import { HISTORY_DATA, type HistoryStatus } from "../data/history-data";

export function useHistoryFilter() {
  const [historySearch, setHistorySearch] = useState("");
  const [historyFilter, setHistoryFilter] = useState<"all" | HistoryStatus>(
    "all",
  );

  const filteredHistory = useMemo(() => {
    return HISTORY_DATA.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(historySearch.toLowerCase()) ||
        item.location.toLowerCase().includes(historySearch.toLowerCase());
      const matchesFilter =
        historyFilter === "all" || item.status === historyFilter;
      return matchesSearch && matchesFilter;
    });
  }, [historySearch, historyFilter]);

  const groupedHistory = useMemo(() => {
    const groups: Record<string, typeof HISTORY_DATA> = {};
    for (const item of filteredHistory) {
      if (!groups[item.month]) groups[item.month] = [];
      groups[item.month].push(item);
    }
    return groups;
  }, [filteredHistory]);

  return {
    historySearch,
    setHistorySearch,
    historyFilter,
    setHistoryFilter,
    filteredHistory,
    groupedHistory,
  };
}
