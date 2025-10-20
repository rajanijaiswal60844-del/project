
'use client';

import {
  Dialog,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";
import Image from "next/image";
import { Button } from "../ui/button";
import { Download } from "lucide-react";

interface ImagePreviewDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  imageUrl: string | null;
  altText: string;
}

export default function ImagePreviewDialog({ isOpen, onOpenChange, imageUrl, altText }: ImagePreviewDialogProps) {
  if (!imageUrl) return null;

  const handleDownload = () => {
    if (imageUrl) {
        const link = document.createElement('a');
        link.href = imageUrl;
        // Use a generic name or derive from altText
        const fileName = altText.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        link.download = `${fileName}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-full p-2">
        <div className="relative w-full" style={{ paddingTop: '56.25%' /* 16:9 aspect ratio */ }}>
          <Image
            src={imageUrl}
            alt={altText}
            fill
            className="object-contain"
          />
        </div>
         <DialogFooter className="sm:justify-end gap-2 p-2">
            <Button onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
