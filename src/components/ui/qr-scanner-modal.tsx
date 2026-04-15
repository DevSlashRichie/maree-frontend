import { Modal } from "@/components/ui/modal";
import { QRScanner } from "@/components/ui/qr-scanner";
import { useNavigate } from "@tanstack/react-router";
import toast from "react-hot-toast";

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QRScannerModal({ isOpen, onClose }: QRScannerModalProps) {
  const navigate = useNavigate();

  const handleScan = (id: string) => {
    if (id) {
      toast.success("Usuario identificado");
      onClose();
      navigate({
        to: "/admin/users/$id",
        params: { id },
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Escanear QR de Usuario"
      description="Coloca el código QR frente a la cámara para identificar al usuario."
      maxWidth="md"
    >
      <div className="mt-4">{isOpen && <QRScanner onScan={handleScan} />}</div>
      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-xl text-text-main/60 hover:text-text-main hover:bg-gray-50 transition-colors font-medium text-sm"
        >
          Cancelar
        </button>
      </div>
    </Modal>
  );
}
