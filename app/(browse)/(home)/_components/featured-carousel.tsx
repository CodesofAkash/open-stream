"use client";

import { useState, useEffect, useCallback } from "react";
import { SafeImage } from "@/components/safe-image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface FeaturedStream {
  username: string;
  title: string;
  thumbnail: string;
  category: string;
  viewerCount: number;
  isLive: boolean;
}

interface FeaturedCarouselProps {
  streams: FeaturedStream[];
}

export const FeaturedCarousel = ({ streams }: FeaturedCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const nextSlide = useCallback(() => {
    if (isTransitioning || streams.length === 0) return;

    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % streams.length);

    setTimeout(() => setIsTransitioning(false), 500);
  }, [isTransitioning, streams.length]);

  const prevSlide = useCallback(() => {
    if (isTransitioning || streams.length === 0) return;

    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev - 1 + streams.length) % streams.length);

    setTimeout(() => setIsTransitioning(false), 500);
  }, [isTransitioning, streams.length]);

  const goToSlide = (index: number) => {
    if (isTransitioning || index === currentIndex) return;

    setIsTransitioning(true);
    setCurrentIndex(index);

    setTimeout(() => setIsTransitioning(false), 500);
  };

  useEffect(() => {
    if (streams.length === 0) return;

    const timer = setInterval(() => {
      nextSlide();
    }, 7000);

    return () => clearInterval(timer);
  }, [nextSlide, streams.length]);

  if (streams.length === 0) {
    return null;
  }

  const current = streams[currentIndex];

  return (
    <div className="relative h-[400px] w-full bg-background mb-8 overflow-hidden rounded-xl">
      <Link href={`/${current.username}`}>
        <div className="relative h-full w-full">
          {/* Sliding Image Container */}
          <div className="relative h-full w-full overflow-hidden">
            <div
              className="flex h-full transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {streams.map((stream, index) => (
                <div key={index} className="min-w-full h-full relative">
                  <SafeImage
                    src={stream.thumbnail}
                    alt={stream.title}
                    fill
                    className="object-cover"
                    preload={index === 0}
                    sizes="100vw"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/30 to-transparent" />

          {/* Content */}
          <div className="absolute bottom-0 left-0 p-8 max-w-2xl">
            {/* Compact LIVE Badge */}
            {current.isLive && (
              <div className="mb-3">
                <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded uppercase">
                  Live
                </span>
              </div>
            )}

            <h2 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
              {current.title}
            </h2>

            <div className="flex items-center gap-3 text-white/90">
              <p className="font-semibold">{current.username}</p>
              <span>•</span>
              <p>{current.category}</p>
              {current.isLive && current.viewerCount > 0 && (
                <>
                  <span>•</span>
                  <p>{current.viewerCount.toLocaleString()} viewers</p>
                </>
              )}
            </div>
          </div>
        </div>
      </Link>

      {/* Navigation Arrows */}
      {streams.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white h-12 w-12 rounded-full"
            onClick={(e) => {
              e.preventDefault();
              prevSlide();
            }}
            disabled={isTransitioning}
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white h-12 w-12 rounded-full"
            onClick={(e) => {
              e.preventDefault();
              nextSlide();
            }}
            disabled={isTransitioning}
          >
            <ChevronRight className="h-8 w-8" />
          </Button>
        </>
      )}

      {/* Dots */}
      {streams.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {streams.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.preventDefault();
                goToSlide(index);
              }}
              disabled={isTransitioning}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex ? "w-8 bg-white" : "w-2 bg-white/50 hover:bg-white/75"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const FeaturedCarouselSkeleton = () => {
  return (
    <div className="relative h-[400px] w-full bg-muted mb-8 rounded-xl overflow-hidden">
      <Skeleton className="h-full w-full" />
    </div>
  );
};