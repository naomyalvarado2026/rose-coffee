import { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, QrCode } from 'lucide-react';
import { toast } from 'sonner';

interface ProductQRGeneratorProps {
  productId: string;
  productName: string;
}

export default function ProductQRGenerator({ productId, productName }: ProductQRGeneratorProps) {
  const qrRef = useRef<HTMLDivElement>(null);
  const arUrl = `${window.location.origin}/ar?product=${productId}`;

  const handleDownloadSVG = () => {
    try {
      const svgElement = qrRef.current?.querySelector('svg');
      if (!svgElement) throw new Error('No se encontró el elemento SVG del QR');

      const svgString = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);

      const downloadLink = document.createElement('a');
      downloadLink.href = svgUrl;
      downloadLink.download = `QR_${productName.replace(/\s+/g, '_')}_AR.svg`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(svgUrl);

      toast.success('Código QR vectorial (SVG) descargado con éxito.');
    } catch (err) {
      console.error('Error downloading SVG:', err);
      toast.error('No se pudo descargar el QR.');
    }
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col items-center text-center space-y-3.5 shadow-2xs">
      <div className="flex items-center gap-1.5 text-xs font-bold text-[#021a54] uppercase tracking-wider">
        <QrCode className="w-4 h-4 text-coffee" />
        <span>Código QR de Mesa AR</span>
      </div>

      <div ref={qrRef} className="bg-white p-3.5 rounded-xl border border-slate-150 inline-block shadow-3xs">
        <QRCodeSVG
          value={arUrl}
          size={140}
          bgColor="#FFFFFF"
          fgColor="#021a54"
          level="H"
          includeMargin={false}
        />
      </div>

      <div className="space-y-2 w-full">
        <p className="text-[10px] text-gray-500 font-medium leading-relaxed max-w-[200px] mx-auto">
          Imprime este código en tu menú físico para que los clientes escaneen y vean el modelo 3D.
        </p>

        <button
          type="button"
          onClick={handleDownloadSVG}
          className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-coffee hover:bg-coffee-dark text-white rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          Descargar SVG (Vectores)
        </button>
      </div>
    </div>
  );
}
