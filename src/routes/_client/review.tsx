// src/routes/_client/review.tsx
import { createFileRoute } from "@tanstack/react-router";
import ReviewForm from "@/features/review/components/review-form";

export const Route = createFileRoute("/_client/review")({
  component: RouteComponent,
});

function RouteComponent() {
  const handleSubmit = async ({
    rating,
    text,
  }: {
    rating: number;
    text: string;
  }) => {
    console.log({ rating, text });
  };

  return (
    <div className="flex justify-center px-4 py-10">
      <ReviewForm onSubmit={handleSubmit} />
    </div>
  );
}
