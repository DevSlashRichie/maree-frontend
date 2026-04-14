import { Button } from "./button";

interface CardProps {
  image: string;
  title: string;
  price: string;
  description?: string | null;
  badge?: string;
  onAdd?: () => void;
}

export function FoodCard({
  image,
  title,
  price,
  description,
  badge,
  onAdd,
}: CardProps) {
  return (
    <div className="group bg-white rounded-3xl overflow-hidden shadow-[0_4px_25px_rgba(232,213,213,0.2)] border border-pink-soft/10 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(232,213,213,0.4)] hover:-translate-y-2">
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary/10">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000 ease-out"
        />
        {badge && (
          <div className="absolute top-4 left-4 bg-accent/90 backdrop-blur-md px-3 py-1 rounded-full shadow-lg">
            <span className="text-[9px] font-bold tracking-widest text-white uppercase">
              {badge}
            </span>
          </div>
        )}
        <div className="absolute bottom-4 right-4 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <Button
            type="button"
            variant="primary"
            onClick={onAdd}
            className="!w-10 !h-10 !p-0 !px-0 rounded-full flex items-center justify-center shadow-xl"
          >
            +
          </Button>
        </div>
      </div>

      <div className="p-6">
        <div className="flex justify-between items-start mb-2 gap-2">
          <h3 className="font-display text-lg text-text-main font-bold uppercase tracking-tight leading-tight">
            {title}
          </h3>
          <span className="font-body text-base text-accent font-bold shrink-0">
            {price}
          </span>
        </div>
        <p className="text-sm text-text-main/50 font-light leading-snug mb-4 line-clamp-2 min-h-[2.5rem]">
          {description}
        </p>

        <div className="pt-4 border-t border-pink-soft/10 flex items-center justify-between">
          <span className="text-[10px] text-text-main/30 font-bold tracking-widest uppercase">
            Maree Special
          </span>
          <button
            type="button"
            onClick={onAdd}
            className="text-accent text-xs font-bold uppercase tracking-widest hover:text-accent/70 transition-colors sm:hidden"
          >
            Agregar +
          </button>
        </div>
      </div>
    </div>
  );
}
