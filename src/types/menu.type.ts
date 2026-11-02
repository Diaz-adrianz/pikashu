import type { RemixiconComponentType } from '@remixicon/react';
import { HTMLAttributeAnchorTarget } from 'react';

export type Menu = {
  path: string;
  label: string;
  Icon?: RemixiconComponentType;
  IconActive?: RemixiconComponentType;
  target?: HTMLAttributeAnchorTarget;
};
