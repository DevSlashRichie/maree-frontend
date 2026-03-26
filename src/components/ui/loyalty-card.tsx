import cn from "classnames";
import { Apple, Croissant, QrCode, Wallet } from "lucide-react";
import { useState } from "react";
// @ts-expect-error - bad imports for some reason.
import { QRCode } from "react-qr-code";
import { Modal } from "./modal";

interface LoyaltyCardProps {
  user: {
    firstName: string;
    loyaltyId: string;
  };
  stamps: {
    total: number;
    collected: number;
  };
  rewardsAvailable: number;
  isLoading?: boolean;
}

export function LoyaltyCard({
  user,
  stamps,
  rewardsAvailable,
  isLoading = false,
}: LoyaltyCardProps) {
  const [isQRExpanded, setIsQRExpanded] = useState(false);
  const stamps_ = Array.from({ length: stamps.total }, (_, i) => ({ id: i }));
  const isComplete = stamps.collected >= stamps.total;

  if (isLoading) {
    return (
      <div className="w-full aspect-[1.58/1] rounded-2xl overflow-hidden shadow-2xl bg-primary animate-pulse" />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col rounded-2xl overflow-hidden shadow-2xl bg-charcoal">
        <div className="relative p-6 pb-4 pattern-grid-lg">
          <div className="absolute top-4 right-4 w-32 h-32 bg-secondary opacity-10 rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-4 w-24 h-24 bg-accent opacity-20 rounded-full blur-xl" />

          <div className="relative flex justify-between items-start">
            <div>
              <h2 className="font-display text-3xl text-white tracking-widest">
                MARÉE
              </h2>
            </div>
            <span className="bg-white/10 backdrop-blur-sm text-white px-2 py-0.5 rounded text-[10px] uppercase tracking-wider border border-white/20">
              {isComplete
                ? `Premio Disponible (${rewardsAvailable})`
                : "Premium Member"}
            </span>
          </div>
        </div>

        <div className="px-6 py-4">
          <div className="grid grid-cols-3 gap-3 justify-center items-center">
            {stamps_.map((stamp, index) => (
              <div
                key={stamp.id}
                className="w-full flex justify-center items-center"
              >
                <div
                  className={cn(
                    "flex items-center justify-center border rounded-full w-[60px] h-[60px]",
                    {
                      "text-white/20": index + 1 > stamps.collected,
                      "text-white": index + 1 <= stamps.collected,
                    },
                  )}
                >
                  <Croissant />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-end p-6 border-t border-white/10">
          <div className="flex flex-col gap-1">
            <p className="text-white/50 text-xs uppercase tracking-wider">
              Titular
            </p>
            <p className="text-white font-display text-lg tracking-wide">
              {user.firstName}
            </p>
            <p className="text-white/50 text-xs font-mono">
              Teléfono: {user.loyaltyId}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsQRExpanded(true)}
            className="bg-white p-2 rounded-lg cursor-pointer hover:scale-105 transition-transform"
          >
            <QrCode className="w-8 h-8 text-primary" />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          className="w-full bg-black text-white rounded-xl py-3 px-4 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all active:scale-95 group border border-transparent dark:border-gray-200 cursor-pointer"
        >
          <Apple className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="font-medium tracking-wide text-sm">
            Agregar a Apple Wallet
          </span>
        </button>

        <button
          type="button"
          className="w-full bg-[#4285F4] text-white rounded-xl py-3 px-4 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all active:scale-95 group border border-transparent cursor-pointer"
        >
          <Wallet className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="font-medium tracking-wide text-sm">
            Agregar a Google Wallet
          </span>
        </button>
      </div>

      <Modal
        isOpen={isQRExpanded}
        onClose={() => setIsQRExpanded(false)}
        title="Código de Fidelidad"
        description="Muéstralo al pagar"
      >
        <div className="flex flex-col items-center">
          <div className="bg-white p-4 rounded-xl border border-gray-200 dark:border-gray-600 mb-4">
            <QRCode size={180} value={user.loyaltyId} />
          </div>
          <p className="font-display text-lg text-primary">{user.firstName}</p>
          <p className="text-sm text-gray-500 font-mono">
            Teléfono: {user.loyaltyId}
          </p>
        </div>
      </Modal>
    </div>
  );
}
