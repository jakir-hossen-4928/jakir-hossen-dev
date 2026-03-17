import { useState } from 'react';

interface ProgressiveImgProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  skeletonClassName?: string;
}

export function ProgressiveImg({
  src,
  alt,
  className = '',
  skeletonClassName = '',
  ...props
}: ProgressiveImgProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className="relative w-full h-full overflow-hidden flex items-center justify-center bg-muted/30">
      {!isLoaded && !hasError && (
        <div
          className={`absolute inset-0 bg-muted animate-pulse ${skeletonClassName}`}
        />
      )}
      <img
        src={src}
        alt={alt}
        decoding="async"
        className={`${className} transition-opacity duration-500 ease-in-out ${isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        onLoad={() => setIsLoaded(true)}
        onError={(e) => {
          setHasError(true);
          setIsLoaded(true);
          (e.target as HTMLImageElement).src = 'https://placehold.co/1440x3000/2a2a2a/ffffff?text=Image+Not+Found';
        }}
        {...props}
      />
    </div>
  );
}
