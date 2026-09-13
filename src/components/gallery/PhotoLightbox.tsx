import { Dialog, DialogContent } from '@/components/ui/dialog';
import type { CrewPhoto } from '@/hooks/useGallery';

export function PhotoLightbox({ photo, onOpenChange }: { photo: CrewPhoto | null; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={photo !== null} onOpenChange={onOpenChange}>
      <DialogContent className="bg-transparent border-none shadow-none p-0 max-w-[92vw] [&>button]:text-ink [&>button]:bg-panel [&>button]:border [&>button]:border-line [&>button]:rounded-full [&>button]:opacity-100">
        {photo && (
          <div className="flex flex-col items-center">
            <img
              src={photo.image_url}
              alt={photo.title}
              className="block max-w-[92vw] max-h-[80vh] object-contain border border-line"
            />
            <div className="mt-3 text-center text-ink-dim text-[0.9rem]">
              {photo.title}
              {photo.subtitle && (
                <span className="block text-brand text-[0.75rem] font-bold tracking-wide mt-1">{photo.subtitle}</span>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
