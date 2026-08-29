'use client';

import { useState, useEffect } from 'react';

interface TransparentLogoProps {
  src: string;
  alt?: string;
  className?: string;
  threshold?: number; // 0-255 threshold for white background removal
}

export default function TransparentLogo({
  src,
  alt = 'AskCET Emblem',
  className = '',
  threshold = 225,
}: TransparentLogoProps) {
  const [transparentDataUrl, setTransparentDataUrl] = useState<string | null>(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // If the pixel is white or near-white, make it transparent with smooth alpha feathering
        const brightness = (r + g + b) / 3;
        if (brightness >= threshold) {
          // Smooth alpha transition for anti-aliasing edges
          const alpha = Math.max(0, (255 - brightness) / (255 - threshold));
          data[i + 3] = Math.floor(alpha * 255);
        }
      }

      ctx.putImageData(imgData, 0, 0);
      setTransparentDataUrl(canvas.toDataURL('image/png'));
    };
  }, [src, threshold]);

  if (!transparentDataUrl) {
    return (
      <img
        src={src}
        alt={alt}
        className={`${className} mix-blend-multiply dark:mix-blend-lighten`}
      />
    );
  }

  return (
    <img
      src={transparentDataUrl}
      alt={alt}
      className={className}
    />
  );
}
