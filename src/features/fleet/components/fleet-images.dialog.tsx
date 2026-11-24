'use client';

import Image from 'next/image';
import { useRef } from 'react';
import { toast } from 'sonner';
import { GetFleetResponse } from '@/app/api/fleets/[id]/route';
import { DialogState } from '@/hooks/use-dialog';
import { useApi } from '@/hooks/use-api';
import { useAction } from '@/hooks/use-action';
import { useConfirm } from '@/components/shared/confirm';
import { LoadingOverlay } from '@/components/shared/loading';
import { NotFoundData } from '@/components/shared/not-found';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { ImgPlaceholder } from '@/assets/images';
import { StarIcon, TrashIcon, UploadIcon } from 'lucide-react';
import {
  deleteFleetImageAction,
  setMainFleetImageAction,
  uploadFleetImageAction,
} from '../actions';

type FleetImagesDialogPayload = { id: string };

function FleetImagesDialog({
  open,
  onOpenChange,
  payload,
  onSuccess,
}: DialogState<FleetImagesDialogPayload> & { onSuccess?: () => void }) {
  const confirm = useConfirm(),
    inputRef = useRef<HTMLInputElement>(null);

  const { item: data, isLoading, refresh } = useApi<GetFleetResponse>(
    `/api/fleets/${payload?.id}`,
    {
      enabled: !!payload?.id && open,
      cache: 'fresh',
      onError: (e) => toast.error(e.message),
    }
  );

  const done = () => {
    refresh();
    onSuccess?.();
  };

  const upload = useAction(uploadFleetImageAction, {
    successMessage: 'Gambar berhasil diunggah',
    onError: (m) => toast.error(m),
    onSuccess: () => {
      if (inputRef.current) inputRef.current.value = '';
      done();
    },
  });

  const remove = useAction(deleteFleetImageAction, {
    successMessage: 'Gambar berhasil dihapus',
    onError: (m) => toast.error(m),
    onSuccess: done,
  });

  const setMain = useAction(setMainFleetImageAction, {
    successMessage: 'Gambar utama diperbarui',
    onError: (m) => toast.error(m),
    onSuccess: done,
  });

  const onUpload = (file?: File) => {
    if (!file || !data) return;
    const form = new FormData();
    form.set('file', file);
    upload.run(data.id, form);
  };

  const onDelete = async (imageId: string) => {
    const ok = await confirm({
      title: 'Hapus gambar ini?',
      description: 'File gambar akan dihapus permanen.',
      confirmVariant: 'destructive',
    });
    if (ok) remove.run(imageId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        {(isLoading || upload.isLoading) && <LoadingOverlay />}

        <DialogHeader>
          <DialogTitle>Gambar Armada</DialogTitle>
          <DialogDescription>
            JPEG, PNG, atau WebP. Maksimal 5 MB per gambar.
          </DialogDescription>
        </DialogHeader>

        {!data && !isLoading ? (
          <NotFoundData data="Armada" />
        ) : (
          <>
            <Input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={upload.isLoading}
              onChange={(e) => onUpload(e.target.files?.[0])}
            />

            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {data?.images.length === 0 && (
                <div className="col-span-full">
                  <Image
                    src={ImgPlaceholder}
                    alt="Belum ada gambar"
                    className="mx-auto w-40 rounded-xl"
                  />
                </div>
              )}

              {data?.images.map((image) => (
                <div
                  key={image.id}
                  className="relative aspect-video overflow-hidden rounded-xl border bg-muted"
                >
                  <Image
                    src={`/api/uploads/${image.path}`}
                    alt=""
                    fill
                    unoptimized
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover"
                  />

                  <Badge className="absolute start-2 top-2" variant="secondary">
                    {image.isMain ? 'Utama' : 'Gambar'}
                  </Badge>

                  <div className="absolute end-2 bottom-2 flex gap-1">
                    {!image.isMain && (
                      <Button
                        size="icon-sm"
                        variant="secondary"
                        disabled={setMain.isLoading}
                        onClick={() => setMain.run(image.id)}
                      >
                        {setMain.isLoading ? (
                          <Spinner data-icon="inline-start" />
                        ) : (
                          <StarIcon data-icon="inline-start" />
                        )}
                      </Button>
                    )}
                    <Button
                      size="icon-sm"
                      variant="destructive"
                      disabled={remove.isLoading}
                      onClick={() => onDelete(image.id)}
                    >
                      {remove.isLoading ? (
                        <Spinner data-icon="inline-start" />
                      ) : (
                        <TrashIcon data-icon="inline-start" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <DialogFooter>
          <Button
            variant="secondary"
            onClick={() => inputRef.current?.click()}
            disabled={!data || upload.isLoading}
          >
            <UploadIcon data-icon="inline-start" />
            {upload.isLoading && <Spinner data-icon="inline-start" />}
            Unggah
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { FleetImagesDialog };
export type { FleetImagesDialogPayload };
