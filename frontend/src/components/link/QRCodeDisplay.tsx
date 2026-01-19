import { useState } from 'react';
import { useQRCode } from '../../hooks/useLinks';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Button } from '../common/Button';

interface QRCodeDisplayProps {
  linkId: number;
  shortCode: string;
}

export function QRCodeDisplay({ linkId, shortCode }: QRCodeDisplayProps) {
  const [size, setSize] = useState<'small' | 'medium' | 'large'>('medium');
  const { data: qrDataUrl, isLoading, error } = useQRCode(linkId, size);

  const downloadQR = () => {
    if (!qrDataUrl) return;

    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `${shortCode}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4 text-red-600">
        Failed to load QR code
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="mb-4">
        <select
          value={size}
          onChange={(e) => setSize(e.target.value as 'small' | 'medium' | 'large')}
          className="input max-w-xs mx-auto"
        >
          <option value="small">Small (150x150)</option>
          <option value="medium">Medium (300x300)</option>
          <option value="large">Large (600x600)</option>
        </select>
      </div>

      {qrDataUrl && (
        <>
          <div className="flex justify-center mb-4">
            <img
              src={qrDataUrl}
              alt={`QR Code for ${shortCode}`}
              className="border rounded-lg"
            />
          </div>
          <Button onClick={downloadQR}>
            Download QR Code
          </Button>
        </>
      )}
    </div>
  );
}
