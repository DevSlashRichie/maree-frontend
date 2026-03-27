import { Apple, Wallet } from "lucide-react";
import { useState } from "react";
// @ts-expect-error - bad imports for some reason.
import { QRCode } from "react-qr-code";
import { Modal } from "./modal";
import { useGetV1Loyalty } from "@/lib/api";





export function LoyaltyCard() {
  const [isQRExpanded, setIsQRExpanded] = useState(false);
  
  const {data, isLoading} = useGetV1Loyalty();
  
  if (isLoading) {
    return <div>Cargando</div>;
  }

  if (!data || data.status !== 200) {
    return <div>{data?.data.message}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="relative w-full aspect-[1.58/1] rounded-2xl overflow-hidden shadow-2xl transform transition hover:scale-[1.01] duration-500 group">
        <div className="absolute inset-0 bg-charcoal dark:bg-black pattern-grid-lg text-gray-800" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-secondary opacity-10 rounded-full blur-2xl -mr-10 -mt-10" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary opacity-20 rounded-full blur-xl -ml-5 -mb-5" />

        <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="font-display text-3xl text-white tracking-widest">
                MARÉE
              </h2>
            </div>
            <span className="bg-accent/20 backdrop-blur-sm text-gray-200 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider border border-accent/30 text-right">
              Premium Member
            </span>
          </div>

          <div className="flex justify-between items-end">
            <div className="flex flex-col gap-1">
              <p className="text-gray-400 text-xs uppercase tracking-wider">
                Titular
              </p>
              <p className="text-white font-display text-lg tracking-wide">
                {`${data.data.firstName} ${data.data.lastName}`}
              </p>
              <p className="text-gray-500 text-xs font-mono">
                Teléfono: {data.data.phone}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsQRExpanded(true)}
              className="bg-white p-1 rounded cursor-pointer hover:scale-105 transition-transform"
            >
              <QRCode size={60} value={data.data.phone} />
            </button>
          </div>
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
            <QRCode size={220} value={data.data.phone} />
          </div>
          <p className="font-display text-lg text-charcoal dark:text-white">
            {`${data.data.firstName} ${data.data.lastName}`}
          </p>
          <p className="text-sm text-gray-500 font-mono">
            Teléfono: {data.data.phone}
          </p>
        </div>
      </Modal>
    </div>
  );
}
