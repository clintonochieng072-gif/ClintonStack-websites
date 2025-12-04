// src/components/public/Gallery.tsx
"use client";
import { useState } from "react";
import Image from "next/image";

interface GalleryProps {
  data: any;
}

export default function Gallery({ data }: GalleryProps) {
  const photos = data?.images || data?.photos || [];

  if (!photos || photos.length === 0) {
    return null; // Don't render if no photos
  }

  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const handleImageClick = (imageSrc: string) => {
    setLightboxImage(imageSrc);
  };

  const closeLightbox = () => {
    setLightboxImage(null);
  };

  return (
    <>
      <section id="gallery" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Portfolio
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A showcase of our recent projects and achievements
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {photos.map((src: string, index: number) => (
              <div
                key={index}
                className="group cursor-pointer overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-shadow relative"
                onClick={() => handleImageClick(src)}
              >
                <Image
                  src={src}
                  alt={`Gallery image ${index + 1}`}
                  width={400}
                  height={300}
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-2xl">🔍</span>
                    </div>
                    <p className="text-sm">View Full Size</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={closeLightbox}
        >
          <div className="relative max-w-4xl max-h-full p-4">
            <Image
              src={lightboxImage}
              alt="Full size"
              width={800}
              height={600}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              className="absolute top-2 right-2 text-white text-2xl bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-75"
              onClick={closeLightbox}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
}
