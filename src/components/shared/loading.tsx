import { LogoIcon } from '@/assets/images';
import { cn } from 'cn';
import Image from 'next/image';
import { ComponentProps } from 'react';

export const LoadingOverlay = ({
  text = 'Memuat',
  className,
  ...props
}: ComponentProps<'div'> & {
  text?: string;
}) => {
  return (
    <div
      className={cn(
        'absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-background/30 p-4 backdrop-blur-sm',
        className
      )}
      {...props}
    >
      <Image src={LogoIcon} alt="" className="w-10 animate-bounce" />
      <h6>
        {text}
        <span className="inline-flex">
          <span className="animate-blink-cursor">.</span>
          <span className="animate-blink-cursor [animation-delay:0.2s]">.</span>
          <span className="animate-blink-cursor [animation-delay:0.4s]">.</span>
        </span>
      </h6>
    </div>
  );
};
