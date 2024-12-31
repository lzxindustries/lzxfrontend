import React, {useRef, useEffect, useState} from 'react';

interface ImageCroppedByTransparencyProps {
  src: string;
  alt?: string;
}

const ImageCroppedByTransparency: React.FC<ImageCroppedByTransparencyProps> = ({
  src,
  alt = 'Cropped Image',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [croppedSrc, setCroppedSrc] = useState<string>('');

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.crossOrigin = 'Anonymous'; // Handle cross-origin if necessary
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const {data, width, height} = ctx.getImageData(
        0,
        0,
        canvas.width,
        canvas.height,
      );

      let top = height,
        left = width,
        right = 0,
        bottom = 0;

      for (let i = 3; i < data.length; i += 4) {
        const alpha = data[i];
        if (alpha !== 0) {
          const x = (i / 4) % width;
          const y = Math.floor(i / 4 / width);
          if (x < left) left = x;
          if (x > right) right = x;
          if (y < top) top = y;
          if (y > bottom) bottom = y;
        }
      }

      const croppedWidth = right - left + 1;
      const croppedHeight = bottom - top + 1;

      if (croppedWidth > 0 && croppedHeight > 0) {
        const croppedData = ctx.getImageData(
          left,
          top,
          croppedWidth,
          croppedHeight,
        );
        const croppedCanvas = document.createElement('canvas');
        const croppedCtx = croppedCanvas.getContext('2d');
        if (croppedCtx) {
          croppedCanvas.width = croppedWidth;
          croppedCanvas.height = croppedHeight;
          croppedCtx.putImageData(croppedData, 0, 0);
          setCroppedSrc(croppedCanvas.toDataURL());
        }
      }
    };

    img.onerror = () => {
      console.error('Failed to load the image.');
      setCroppedSrc(src); // Fallback to original image on error
    };
  }, [src]);

  return (
    <div className="w-full h-full">
      <canvas ref={canvasRef} style={{display: 'none'}} />
      {croppedSrc && (
        <img
          src={croppedSrc}
          alt={alt}
          className="w-full h-full object-contain"
        />
      )}
    </div>
  );
};

export default ImageCroppedByTransparency;
