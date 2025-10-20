
'use client';

import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import Image from "next/image";

interface ImagePreviewDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  imageUrl: string | null;
  altText: string;
}

export default function ImagePreviewDialog({ isOpen, onOpenChange, imageUrl, altText }: ImagePreviewDialogProps) {
  if (!imageUrl) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-full p-2 bg-transparent border-none shadow-none">
        <div className="relative w-full" style={{ paddingTop: '56.25%' /* 16:9 aspect ratio */ }}>
          <Image
            src={imageUrl}
            alt={altText}
            fill
            className="object-contain"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
