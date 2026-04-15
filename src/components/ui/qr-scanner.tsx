import { type IDetectedBarcode, Scanner } from "@yudiel/react-qr-scanner";

interface QRScannerProps {
  onScan: (decodedText: string) => void;
  onError?: (error: unknown) => void;
}

export function QRScanner({ onScan, onError }: QRScannerProps) {
  const handleScan = (detectedCodes: IDetectedBarcode[]) => {
    if (detectedCodes.length > 0) {
      const firstCode = detectedCodes[0];
      if (firstCode.rawValue) {
        onScan(firstCode.rawValue);
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto overflow-hidden rounded-xl border border-gray-100 shadow-sm bg-black">
      <Scanner
        onScan={handleScan}
        onError={(error) => {
          console.error("QR Scanner Error:", error);
          onError?.(error);
        }}
        allowMultiple={false}
        scanDelay={200}
        formats={["qr_code"]}
      />
    </div>
  );
}
