// src/routes/_client/review.tsx
import { createFileRoute } from "@tanstack/react-router";
import ReviewForm from "@/features/review/components/review-form";

export const Route = createFileRoute("/_client/review")({
  component: RouteComponent,
});

function RouteComponent() {
  const userId = "bf040102-561a-4735-a970-ff5c410167ef";
  const branchId = "1c43d953-885e-4bb0-9d96-9e763be00428";
  const orderId = "a6d753c6-b48f-4994-b4ab-2fd642893a43";

  return (
    <div className="flex justify-center px-4 py-10">
      <ReviewForm orderId={orderId} userId={userId} branchId={branchId} />
    </div>
  );
}
