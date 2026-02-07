import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const AppCardSkeleton: React.FC = () => {
    return (
        <Card className="overflow-hidden border border-white/5 shadow-xl bg-card/40 backdrop-blur-xl">
            <CardHeader className="p-0">
                {/* Image skeleton */}
                <Skeleton className="w-full h-48 rounded-t-lg" />
            </CardHeader>
            <CardContent className="p-4 space-y-3">
                {/* Icon and title */}
                <div className="flex items-center gap-3">
                    <Skeleton className="w-12 h-12 rounded-xl" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                    </div>
                </div>
                {/* Description */}
                <div className="space-y-2">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-5/6" />
                </div>
                {/* Button */}
                <Skeleton className="h-10 w-full rounded-xl" />
            </CardContent>
        </Card>
    );
};

export const AppGallerySkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {Array.from({ length: count }).map((_, index) => (
                <AppCardSkeleton key={index} />
            ))}
        </div>
    );
};

export const BlogCardSkeleton: React.FC = () => {
    return (
        <Card className="overflow-hidden border border-white/5 shadow-xl bg-card/40 backdrop-blur-xl h-full flex flex-col">
            <CardContent className="p-6 flex-1 flex flex-col space-y-4">
                {/* Date and categories */}
                <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                </div>
                {/* Title */}
                <div className="space-y-2">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-4/5" />
                </div>
                {/* Description */}
                <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
                {/* Read more button */}
                <Skeleton className="h-10 w-32 rounded-xl" />
            </CardContent>
        </Card>
    );
};

export const BlogGallerySkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {Array.from({ length: count }).map((_, index) => (
                <BlogCardSkeleton key={index} />
            ))}
        </div>
    );
};

export const AppDetailSkeleton: React.FC = () => {
    return (
        <div className="space-y-4 md:space-y-6">

            {/* Back Button & Share */}
            <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-32 rounded-xl" />
                <Skeleton className="h-8 w-24 rounded-xl" />
            </div>

            {/* App Details Card Skeleton */}
            <Card className="relative overflow-hidden border border-white/10 glassmorphism rounded-[32px]">
                {/* Cover Photo */}
                <Skeleton className="w-full h-40 md:h-[250px] lg:h-[300px]" />

                <div className="p-6 md:p-8 -mt-10 md:-mt-12 relative">
                    <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
                        {/* App Icon */}
                        <Skeleton className="w-20 h-20 md:w-28 md:h-28 rounded-[22%] border-4 border-card shrink-0 z-10" />

                        {/* Title & Status */}
                        <div className="flex-1 space-y-2 mb-1">
                            <Skeleton className="h-4 w-20 rounded-full" />
                            <Skeleton className="h-8 md:h-10 w-3/4" />
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                            <Skeleton className="h-12 md:h-14 w-full sm:w-32 rounded-2xl" />
                            <Skeleton className="h-12 md:h-14 w-full sm:w-40 rounded-2xl" />
                        </div>
                    </div>
                </div>
            </Card>

            {/* About Section */}
            <Card className="border-none glassmorphism rounded-[32px] p-6 md:p-8 space-y-4">
                <Skeleton className="h-6 w-40" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                </div>
            </Card>
        </div>
    );
};

export const BlogDetailSkeleton: React.FC = () => {
    return (
        <article className="max-w-4xl mx-auto space-y-8 md:space-y-10">
            {/* Header Details */}
            <div className="space-y-6">
                <Skeleton className="h-8 w-32 rounded-full" />
                <div className="flex gap-2">
                    <Skeleton className="h-5 w-20 rounded-full" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                </div>
                <Skeleton className="h-12 md:h-20 w-full" />
                <Skeleton className="h-12 md:h-20 w-4/5" />

                <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-white/5">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-32" />
                </div>
            </div>

            {/* Featured image */}
            <Skeleton className="w-full aspect-video md:aspect-[21/7] rounded-[2rem] md:rounded-[2.5rem]" />

            {/* Content */}
            <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] md:rounded-[3rem] p-6 sm:p-10 md:p-14 space-y-6">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                    </div>
                ))}
            </div>
        </article>
    );
};
