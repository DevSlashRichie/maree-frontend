import cn from "classnames";
import { Loader2, QrCode } from "lucide-react";
import { useState } from "react";
// @ts-expect-error - bad imports for some reason.
import { QRCode } from "react-qr-code";
import { Modal } from "@/components/ui/modal";
import { useGetV1Loyalty, useGetV1LoyaltyGoogleWallet } from "@/lib/api";

export function LoyaltyCard() {
  const [isQRExpanded, setIsQRExpanded] = useState(false);

  const { data, isLoading } = useGetV1Loyalty();

  const { mutate: fetchGoogleWallet, isValidating: isGeneratingGoogle } =
    useGetV1LoyaltyGoogleWallet();

  const TOTAL_STAMPS = 6;

  const handleGoogleWalletClick = async () => {
    try {
      const result = await fetchGoogleWallet();

      if (result?.status === 200 && result.data?.saveURL) {
        window.open(result.data.saveURL, "_blank");
      }
    } catch (error) {
      console.error("Error generating wallet link:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full aspect-[1.58/1] rounded-2xl overflow-hidden shadow-2xl bg-charcoal/50 animate-pulse flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white/20 animate-spin" />
      </div>
    );
  }

  if (!data || data.status !== 200) {
    return (
      <div className="text-white">
        Error: {data?.data?.message || "No data"}
      </div>
    );
  }

  const current = data.data.currentBalance ?? 0;

  const stamps_ = Array.from({ length: TOTAL_STAMPS }, (_, i) => ({
    id: i,
    filled: i < current,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col rounded-2xl overflow-hidden shadow-2xl bg-charcoal">
        <div className="relative p-6 pb-4 pattern-grid-lg">
          <div className="absolute top-4 right-4 w-32 h-32 bg-secondary opacity-10 rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-4 w-24 h-24 bg-accent opacity-20 rounded-full blur-xl" />

          <h2 className="font-display text-3xl text-white tracking-widest uppercase">
            MARÉE
          </h2>
        </div>

        <div className="px-6 py-4">
          <div className="grid grid-cols-3 gap-3">
            {stamps_.map((stamp) => (
              <div key={stamp.id} className="flex justify-center">
                <div
                  className={cn(
                    "flex items-center justify-center border rounded-full w-[60px] h-[60px]",
                    {
                      "border-white/10 text-white/10": !stamp.filled,
                      "border-white/40 text-white bg-white/5": stamp.filled,
                    },
                  )}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="-5.0 -10.0 110.0 135.0"
                    className="w-8 h-8"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="m90.426 21.926c0.058594-0.10547..." />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-end p-6 border-t border-white/10">
          <div className="flex flex-col gap-1">
            <p className="text-white/50 text-[10px] uppercase tracking-widest">
              Titular
            </p>
            <p className="text-white font-display text-lg tracking-wide">
              {data.data.firstName}
            </p>
            <p className="text-white/50 text-xs font-mono">
              Tel: {data.data.phone}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsQRExpanded(true)}
            className="bg-white p-2 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg"
          >
            <QrCode className="w-7 h-7 text-charcoal" />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 items-center w-full max-w-[210px] mx-auto">
        <button type="button" className="w-full active:scale-95">
          <img
            src="/apple-wallet-button.svg"
            alt="Apple Wallet"
            className="h-12 w-full object-contain"
          />
        </button>

        <button
          type="button"
          disabled={isGeneratingGoogle}
          onClick={handleGoogleWalletClick}
          className={cn(
            "w-full h-12 flex items-center justify-center transition-all active:scale-95",
            { "bg-[#1e1e1e] rounded-[8px]": isGeneratingGoogle },
          )}
        >
          {isGeneratingGoogle ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-white/70" />
              <span className="text-white/70 text-xs">Cargando...</span>
            </div>
          ) : (
            <img
              src="/google-wallet-button.svg"
              alt="Google Wallet"
              className="w-full h-full object-contain"
            />
          )}
        </button>
      </div>

      <Modal
        isOpen={isQRExpanded}
        onClose={() => setIsQRExpanded(false)}
        title="Código de Fidelidad"
        description="Muéstralo en caja para acumular puntos"
      >
        <div className="flex flex-col items-center py-4">
          <div className="bg-white p-4 rounded-2xl shadow-xl mb-4">
            <QRCode size={200} value={data.data.phone} />
          </div>

          <p className="font-display text-xl text-primary">
            {data.data.firstName}
          </p>
        </div>
      </Modal>
    </div>
  );
}