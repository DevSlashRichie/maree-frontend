import { Button } from "./button";

interface CardProps {
  image: string;
  title: string;
  price: string;
  description: string;
  badge?: string;
  onAdd?: () => void;
}

export function FoodCard({ image, title, price, description, badge, onAdd }: CardProps) {
  return (
    <div className="group bg-white rounded-t-[50%] rounded-b-3xl shadow-[0_4px_20px_rgba(232,213,213,0.3)] border border-pink-powder p-4 relative mt-12 transition-all hover:shadow-[0_8px_30px_rgba(232,213,213,0.5)]">
      <div className="relative h-64 -mt-16 arched-img shadow-inner border-4 border-white z-10 bg-secondary/20">
        <img src={image} alt={title} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
        {badge && (
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-1.5 border border-pink-soft">
            <span className="text-[10px] font-bold tracking-[0.2em] text-accent uppercase">{badge}</span>
          </div>
        )}
      </div>

      <div className="pt-8 pb-4 text-center bg-white rounded-b-3xl">
        <h3 className="font-display text-xl text-text-main font-bold mb-2 uppercase tracking-wide">{title}</h3>
        <span className="block font-body text-lg text-accent font-bold mb-4 tracking-widest">{price}</span>
        <p className="text-xs text-text-main/60 font-light leading-relaxed mb-8 px-4 h-10">{description}</p>
        
        <Button variant="action" onClick={onAdd}>
          Agregar
        </Button>
      </div>
    </div>
  );
}