"use client";

import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import { X, ZoomIn } from "lucide-react";
import { useState } from "react";

interface ImageModalProps {
  src: string;
  alt: string;
  className?: string;
}

export function ImageModal({ src, alt, className = "" }: ImageModalProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <div
          className="inline-block cursor-pointer transition-all duration-300 ease-in-out p-1"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div
            className="relative"
            style={{
              transform: isHovered ? "scale(1.03)" : "scale(1)",
              transition: "transform 400ms ease-in-out",
            }}
          >
            <Image
              src={src}
              alt={alt}
              width={520}
              height={320}
              style={{
                maxWidth: "100%",
                height: "auto",
                objectFit: "contain",
                display: "block",
              }}
              className={`${className}`}
              priority
            />

            <div
              className={`absolute inset-0 bg-black/30 flex items-center justify-center transition-opacity duration-300 rounded-lg ${
                isHovered ? "opacity-100" : "opacity-0"
              }`}
            >
              <ZoomIn className="text-white w-10 h-10 opacity-80" />
            </div>
          </div>
        </div>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 z-50 animate-fadeIn" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 max-h-[85vh] max-w-[90vw] translate-x-[-50%] translate-y-[-50%] animate-scaleIn">
          <Dialog.Title className="sr-only">Podgląd obrazu: {alt}</Dialog.Title>

          <div className="relative overflow-hidden rounded-lg">
            <Image
              src={src}
              alt={alt}
              width={1200}
              height={800}
              className="object-contain max-h-[85vh] max-w-[90vw] rounded-lg"
              priority
            />
            <Dialog.Close className="absolute top-2 right-2 rounded-full p-2 bg-black/50 hover:bg-black/80 transition-colors">
              <X className="h-6 w-6 text-white" />
              <span className="sr-only">Zamknij</span>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: translate(-50%, -48%) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 150ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        .animate-scaleIn {
          animation: scaleIn 150ms cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </Dialog.Root>
  );
}
