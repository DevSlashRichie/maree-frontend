import { useState } from "react";
import { Utensils, ShoppingBag, Minus, Plus, ChevronDown, ArrowRight } from "lucide-react";

export default function OrderTypeSelector() {
  const [orderType, setOrderType] = useState<"mesa" | "recoger">("mesa");
  const [tableNumber, setTableNumber] = useState(4);

  return (
    <div className="w-full max-w-lg mx-auto bg-card-light rounded-3xl shadow-xl p-8 flex flex-col items-center">
      <h2 className="font-display text-2xl text-text-main mb-8">
        ¿Cómo recibirás tu pedido?
      </h2>

      <div className="grid grid-cols-2 gap-4 w-full mb-8">
        {/* Opción Para Mesa */}
        <button
          onClick={() => setOrderType("mesa")}
          className={`relative p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${
            orderType === "mesa"
              ? "border-accent bg-pink-powder/30"
              : "border-transparent bg-background-light"
          }`}
        >
          {orderType === "mesa" && (
            <div className="absolute top-2 right-2 text-accent">
              <div className="rounded-full border border-accent p-0.5">
                <div className="w-2 h-2 bg-accent rounded-full" />
              </div>
            </div>
          )}
          <div className="bg-secondary p-3 rounded-full">
            <Utensils className="w-6 h-6 text-primary" />
          </div>
          <div className="text-center">
            <p className="font-bold text-text-main">Para Mesa</p>
            <p className="text-xs text-charcoal/60">Servicio a tu mesa</p>
          </div>
        </button>

        {/* Opción Para Recoger */}
        <button
          onClick={() => setOrderType("recoger")}
          className={`relative p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${
            orderType === "recoger"
              ? "border-accent bg-pink-powder/30"
              : "border-transparent bg-background-light"
          }`}
        >
          <div className="bg-secondary p-3 rounded-full">
            <ShoppingBag className="w-6 h-6 text-primary" />
          </div>
          <div className="text-center">
            <p className="font-bold text-text-main">Para Recoger</p>
            <p className="text-xs text-charcoal/60">Listo en 15-20 min</p>
          </div>
        </button>
      </div>

      {/* Selector de Número de Mesa */}
      {orderType === "mesa" && (
        <div className="w-full flex flex-col items-center gap-3 mb-10">
          <p className="text-[10px] uppercase tracking-widest text-charcoal/70 font-bold">
            Número de Mesa
          </p>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setTableNumber(Math.max(1, tableNumber - 1))}
              className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50"
            >
              <Minus className="w-4 h-4" />
            </button>
            
            <div className="flex items-center border border-accent rounded-sm px-4 py-1 gap-2 min-w-[60px] justify-center">
              <span className="text-xl font-medium">{tableNumber}</span>
              <div className="flex flex-col text-[8px] text-gray-400">
                <ChevronDown className="w-3 h-3 rotate-180" />
                <ChevronDown className="w-3 h-3" />
              </div>
            </div>

            <button 
              onClick={() => setTableNumber(tableNumber + 1)}
              className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Botón de Acción */}
      <button className="w-full bg-primary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
        ORDENAR AHORA
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}