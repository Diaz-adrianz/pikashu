'use client';

import { ComponentProps } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

export const TooltipWrap = ({
  text,
  children,
  ...props
}: ComponentProps<typeof TooltipTrigger> & {
  text: string;
}) => {
  return (
    <Tooltip>
      <TooltipTrigger {...props}>{children}</TooltipTrigger>
      <TooltipContent>
        <small>{text}</small>
      </TooltipContent>
    </Tooltip>
  );
};
