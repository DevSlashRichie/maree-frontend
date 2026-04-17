import { useState } from "react";
import { Utensils, ShoppingBag, ArrowRight, MapPin } from "lucide-react";

export default function OrderTypeSelector() {
  const [orderType, setOrderType] = useState<"mesa" | "recoger">("mesa");
  
  // This could later come from a prop or a global state
  const branchName = "Sucursal Querétaro";

  return (
    <div className="w-full max-w-md mx-auto bg-card-light rounded-[2.5rem] shadow-xl p-6 sm:p-10 flex flex-col items-center relative">
      
      {/* Branch Location Badge */}
      <div className="flex items-center gap-1.5 bg-secondary/50 px-4 py-1.5 rounded-full mb-6 border border-primary/5">
        <MapPin className="w-3.5 h-3.5 text-accent" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal/70">
          {branchName}
        </span>
      </div>

      <h2 className="font-display text-2xl sm:text-3xl text-text-main text-center mb-8 leading-tight">
        ¿Cómo recibirás tu pedido?
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mb-10">
        {/* Dine-in Option */}
        <button
          onClick={() => setOrderType("mesa")}
          className={`relative p-5 sm:p-6 rounded-3xl border-2 transition-all duration-300 flex flex-col items-center gap-3 ${
            orderType === "mesa"
              ? "border-accent bg-pink-powder/40 shadow-sm"
              : "border-transparent bg-background-light hover:bg-secondary/50"
          }`}
        >
          {orderType === "mesa" && (
            <div className="absolute top-3 right-3">
              <div className="rounded-full border border-accent p-0.5">
                <div className="w-2 h-2 bg-accent rounded-full" />
              </div>
            </div>
          )}
          <div className="bg-secondary p-4 rounded-2xl">
            <Utensils className="w-6 h-6 text-primary" />
          </div>
          <div className="text-center">
            <p className="font-bold text-text-main text-lg">Para Mesa</p>
            <p className="text-xs text-charcoal/60">Servicio a tu mesa</p>
          </div>
        </button>

        {/* Pickup Option */}
        <button
          onClick={() => setOrderType("recoger")}
          className={`relative p-5 sm:p-6 rounded-3xl border-2 transition-all duration-300 flex flex-col items-center gap-3 ${
            orderType === "recoger"
              ? "border-accent bg-pink-powder/40 shadow-sm"
              : "border-transparent bg-background-light hover:bg-secondary/50"
          }`}
        >
          {orderType === "recoger" && (
            <div className="absolute top-3 right-3">
              <div className="rounded-full border border-accent p-0.5">
                <div className="w-2 h-2 bg-accent rounded-full" />
              </div>
            </div>
          )}
          <div className="bg-secondary p-4 rounded-2xl">
            <ShoppingBag className="w-6 h-6 text-primary" />
          </div>
          <div className="text-center">
            <p className="font-bold text-text-main text-lg">Para Recoger</p>
            <p className="text-xs text-charcoal/60">Listo en 15-20 min</p>
          </div>
        </button>
      </div>

      {/* Action Button */}
      <button className="w-full bg-primary text-white py-4.5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-charcoal transition-colors shadow-lg active:scale-[0.98]">
        <span className="tracking-wide uppercase text-sm">Ordenar ahora</span>
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}