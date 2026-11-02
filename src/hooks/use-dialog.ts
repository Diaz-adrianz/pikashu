import { useCallback, useState } from 'react';

export type DialogState<T = undefined> = {
  payload: T | undefined;
  open: boolean;
  onOpenChange: (next: boolean) => void;
  show: (payload: T) => void;
  hide: () => void;
};

export const useDialogState = <T = undefined>(): DialogState<T> => {
  const [open, setOpen] = useState(false);
  const [payload, setPayload] = useState<T | undefined>(undefined);

  const show = useCallback((data?: T) => {
    setPayload(data);
    setOpen(true);
  }, []);

  const hide = useCallback(() => {
    setOpen(false);
  }, []);

  const onOpenChange = useCallback((next: boolean) => {
    setOpen(next);
    if (!next) setPayload(undefined);
  }, []);

  return { open, onOpenChange, payload, show, hide };
};
