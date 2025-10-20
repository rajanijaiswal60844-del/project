
'use client';

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import { Button } from "../ui/button";
import { Download, X } from "lucide-react";

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
        // Attempt to get file extension from data URL if possible
        const extensionMatch = imageUrl.match(/data:image\/([a-zA-Z]+);/);
        const extension = extensionMatch ? extensionMatch[1] : 'png';
        link.download = `${fileName || 'download'}.${extension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-full p-2 h-screen sm:h-auto">
        <DialogHeader className="sr-only">
            <DialogTitle>{altText}</DialogTitle>
        </DialogHeader>
        <div className="relative flex-1 w-full h-full">
          <Image
            src={imageUrl}
            alt={altText}
            fill
            className="object-contain"
          />
        </div>
         <DialogFooter className="sm:justify-end gap-2 p-2 absolute sm:relative bottom-4 right-4 sm:bottom-auto sm:right-auto bg-background/80 sm:bg-transparent rounded-lg">
             <Button variant="outline" onClick={() => onOpenChange(false)}>
                <X className="mr-2 h-4 w-4" />
                Close
            </Button>
            <Button onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
