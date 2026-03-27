import { MapPin } from "lucide-react";
import { useGetV1BranchesBranch } from "@/lib/api";

interface BranchCardProps {
  branchId: string;
}

export function BranchCard({ branchId }: BranchCardProps) {
  const { data, isLoading } = useGetV1BranchesBranch(branchId);

  if (isLoading) {
    return <div>Cargando</div>;
  }

  if (!data || data.status !== 200) {
    return <div>{data?.data.message}</div>;
  }

  const branch = data.data;

  return (
    <div className="bg-card-light dark:bg-card-dark p-5 rounded-xl border border-accent/30 dark:border-charcoal hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 rounded-full bg-secondary/20 text-charcoal dark:text-white">
          <MapPin className="w-5 h-5" />
        </div>
      </div>

      <h4 className="font-display text-lg text-charcoal dark:text-gray-100 mb-1">
        {branch.name}
      </h4>
    </div>
  );
}
