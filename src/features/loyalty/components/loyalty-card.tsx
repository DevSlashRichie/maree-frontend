import cn from "classnames";
import { Loader2, QrCode } from "lucide-react";
import { useState } from "react";
// @ts-expect-error - bad imports for some reason.
import { QRCode } from "react-qr-code";
import { Modal } from "@/components/ui/modal";
import { useGetV1Loyalty, useGetV1LoyaltyGoogleWallet } from "@/lib/api";
import { useAuthStore } from "@/hooks/use-auth-store";

export function LoyaltyCard() {
  const [isQRExpanded, setIsQRExpanded] = useState(false);

  const { actor } = useAuthStore();
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
    filled: i < (current % 6) + 1,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col rounded-2xl overflow-hidden shadow-2xl bg-charcoal">
        <div className="relative p-6 pb-4 pattern-grid-lg">
          <div className="absolute top-4 right-4 w-32 h-32 bg-secondary opacity-10 rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-4 w-24 h-24 bg-accent opacity-20 rounded-full blur-xl" />
          <div className="relative flex justify-between items-start">
            <h2 className="font-display text-3xl text-white tracking-widest uppercase">
              MARÉE
            </h2>
          </div>
        </div>

        <div className="px-6 py-4">
          <div className="grid grid-cols-3 gap-3 justify-center items-center">
            {stamps_.map((stamp) => (
              <div
                key={stamp.id}
                className="w-full flex justify-center items-center"
              >
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
                    <path d="m90.426 21.926c0.058594-0.10547 0.10156-0.21484 0.13281-0.32812 0.007812-0.03125 0.015625-0.066406 0.023437-0.097656 0.019531-0.089844 0.03125-0.17578 0.035157-0.26562 0-0.035156 0.003906-0.066406 0.003906-0.10156-0.003906-0.11719-0.015625-0.23437-0.046875-0.34766v-0.003906c-0.03125-0.11719-0.082031-0.22656-0.13672-0.33203-0.007812-0.011719-0.007812-0.023438-0.015625-0.035157-0.011719-0.015624-0.023437-0.03125-0.035156-0.046874-0.050781-0.078126-0.10547-0.15234-0.16797-0.21875-0.023438-0.023438-0.042969-0.050782-0.066406-0.070313-0.085938-0.082031-0.17578-0.15625-0.28125-0.21484l-0.003906-0.003906c-11.855-6.8555-25.637-10.48-39.863-10.48-14.223 0-28.008 3.625-39.863 10.48h-0.003906l-0.003907 0.003906c-0.13281 0.078125-0.24609 0.17578-0.34766 0.28516-0.019531 0.019531-0.035156 0.035156-0.054687 0.058593-0.09375 0.10938-0.16797 0.23438-0.22266 0.36328-0.011718 0.023438-0.019531 0.046876-0.027343 0.070313-0.050781 0.14062-0.089844 0.28125-0.10156 0.42969-0.011718 0.15234 0.007813 0.30469 0.042969 0.45313 0.003906 0.015624 0 0.03125 0.003906 0.042968 0.003907 0.007813 0.007813 0.015625 0.011719 0.023438 0.035156 0.11719 0.078125 0.23047 0.14062 0.33984l39.105 67.93 0.003906 0.003906c0.007812 0.015625 0.023438 0.027344 0.035156 0.042969 0.070313 0.10938 0.14453 0.20703 0.23438 0.29297 0.03125 0.027343 0.066407 0.046875 0.097657 0.074219 0.078124 0.0625 0.16016 0.125 0.25 0.17187 0.042968 0.023438 0.089843 0.039063 0.13672 0.054688 0.089844 0.035156 0.17578 0.066406 0.26953 0.082031 0.023437 0.003907 0.042968 0.015625 0.066406 0.019531 0.074218 0.011719 0.14844 0.015626 0.21875 0.015626h0.007812c0.12891 0 0.26172-0.019532 0.39062-0.050782 0.12891-0.035156 0.25-0.085937 0.36719-0.15234 0.10547-0.0625 0.19922-0.13672 0.28516-0.21875 0.023437-0.023437 0.042969-0.046874 0.0625-0.070312 0.066406-0.070312 0.12109-0.14453 0.17188-0.22656 0.011719-0.015626 0.027344-0.027344 0.035156-0.046876l39.105-67.914v-0.003906c0-0.003906 0.003906-0.007813 0.003906-0.007813zm-40.426-9.5078c11.805 0 23.285 2.5977 33.531 7.5352-3.9453 0.41016-7.793 1.2539-11.496 2.5312-1.6562-1.8711-3.9336-3.1055-6.4141-3.4414-1.4375-0.1875-2.8555-0.089844-4.2188 0.28516-0.61719 0.17188-1.2539-0.089844-1.5859-0.65625-1.8828-3.1758-5.3477-5.1523-9.043-5.1523-3.7461 0-7.125 1.9258-9.0312 5.1484-0.33984 0.57422-0.96875 0.82812-1.5977 0.65625-1.3594-0.375-2.7773-0.47266-4.2227-0.28516-2.6523 0.35938-5.1016 1.7852-6.7734 3.8867-4.0508-1.5273-8.2891-2.5312-12.668-2.9883 10.242-4.9375 21.723-7.5273 33.523-7.5273zm-6.3672 55.621 2.6289 11.527-32.691-56.797c5.4297 0.28125 10.652 1.4219 15.559 3.4102 7.8906 3.1953 14.586 8.5195 18.969 15.043-1.7812 2.9336-3.1406 6.0312-4.0391 9.2266-1.6289 5.7617-1.7734 11.676-0.42578 17.582zm6.2773-29.531c-4.3516-6.0469-10.555-11.051-17.793-14.348 1.1406-1.1289 2.6211-1.8906 4.2031-2.1016 1.0352-0.13281 2.0469-0.066406 3.0156 0.20312 1.9609 0.53906 3.9766-0.27734 5.0234-2.0391 1.3555-2.293 3.7539-3.6602 6.418-3.6602 2.668 0 5.0703 1.3672 6.4219 3.6562 1.0195 1.7383 3.082 2.5781 5.0195 2.043 0.96484-0.26953 1.9805-0.33594 3.0039-0.20312 1.3555 0.18359 2.625 0.75781 3.6758 1.6211-7.7305 3.2812-14.352 8.4531-18.984 14.828zm0.70703 46.473-4.0195-17.617c-1.2305-5.4062-1.0977-10.816 0.39062-16.082 0.90234-3.2188 2.3164-6.3359 4.1953-9.2617 4.6758-7.2734 12.086-13.07 20.859-16.324 4.582-1.6914 9.4102-2.6719 14.391-2.9297z" />
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
            <p
              className="text-white font-display text-lg tracking-wide"
              data-testid="user-name"
            >
              {data.data.firstName}
            </p>
            <p
              className="text-white/50 text-xs font-mono"
              data-testid="user-phone"
            >
              Id: {data.data.phone ?? actor?.email ?? actor?.id}
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
        <button type="button" className="w-full active:scale-95 transition-all">
          <img
            src="/apple-wallet-button.svg"
            alt="Apple Wallet"
            className="h-12 w-full object-contain"
          />
        </button>

        <div className="w-full h-12 relative">
          <button
            type="button"
            disabled={isGeneratingGoogle}
            onClick={handleGoogleWalletClick}
            className={cn(
              "w-full h-full cursor-pointer transition-all active:scale-95 flex items-center justify-center",
              { "bg-[#1e1e1e] rounded-[8px]": isGeneratingGoogle },
            )}
          >
            {isGeneratingGoogle ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-white/70" />
                <span className="text-white/70 text-xs font-medium">
                  Cargando...
                </span>
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
      </div>

      <Modal
        isOpen={isQRExpanded}
        onClose={() => setIsQRExpanded(false)}
        title="Código de Fidelidad"
        description="Muéstralo en caja para acumular puntos"
      >
        <div className="flex flex-col items-center py-4">
          <div className="bg-white p-4 rounded-2xl shadow-xl mb-4">
            <QRCode size={200} value={actor?.id ?? data.data.phone ?? "?"} />
          </div>

          <p className="font-display text-xl text-primary">
            {data.data.firstName}
          </p>
        </div>
      </Modal>
    </div>
  );
}
