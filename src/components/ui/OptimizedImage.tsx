import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { ImageIcon } from 'lucide-react';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    alt: string;
    className?: string;
    aspectRatio?: 'square' | 'video' | 'portrait' | 'auto';
    fallbackClassName?: string;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
    src,
    alt,
    className,
    aspectRatio = 'auto',
    fallbackClassName,
    ...props
}) => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);

    const aspectRatioClasses = {
        square: 'aspect-square',
        video: 'aspect-video',
        portrait: 'aspect-[3/4]',
        auto: '',
    };

    return (
        <div className={cn("relative overflow-hidden bg-muted/20", aspectRatioClasses[aspectRatio], className)}>
            <AnimatePresence mode='popLayout'>
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0 z-10"
                    >
                        <Skeleton className="w-full h-full" />
                    </motion.div>
                )}
            </AnimatePresence>

            {!error ? (
                <motion.img
                    src={src}
                    alt={alt}
                    loading="lazy"
                    onLoad={() => setIsLoading(false)}
                    onError={() => {
                        setIsLoading(false);
                        setError(true);
                    }}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{
                        opacity: isLoading ? 0 : 1,
                        scale: isLoading ? 1.05 : 1
                    }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className={cn(
                        "w-full h-full object-cover transition-transform duration-700",
                        isLoading ? "blur-sm" : "blur-0"
                    )}
                    {...(props as any)}
                />
            ) : (
                <div className={cn("w-full h-full flex items-center justify-center bg-muted text-muted-foreground", fallbackClassName)}>
                    <ImageIcon className="w-1/4 h-1/4 opacity-20" />
                </div>
            )}
        </div>
    );
};

export default OptimizedImage;
