'use client';

import { useEffect, useState } from 'react';
import { RiLoaderLine, RiSearchLine } from '@remixicon/react';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';
import { useDebounce } from '@/hooks/use-debounce';

export const SearchBarClient = ({
  onSearch,
  isLoading,
  totalItems,
  placeholder = 'Cari...',
  ...props
}: Omit<React.ComponentProps<typeof InputGroup>, 'onChange'> & {
  onSearch: (value: string) => void;
  isLoading?: boolean;
  totalItems?: number;
  placeholder?: string;
}) => {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);

  useEffect(() => {
    onSearch(debouncedSearch);
  }, [debouncedSearch]);

  const isDebouncing = search !== debouncedSearch;

  return (
    <InputGroup {...props}>
      <InputGroupInput
        placeholder={placeholder}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <InputGroupAddon>
        <RiSearchLine />
      </InputGroupAddon>

      {isLoading || isDebouncing ? (
        <InputGroupAddon align="inline-end">
          <RiLoaderLine className="animate-spin text-primary" />
        </InputGroupAddon>
      ) : !!totalItems ? (
        <InputGroupAddon align="inline-end">
          {totalItems ?? 0} hasil
        </InputGroupAddon>
      ) : null}
    </InputGroup>
  );
};
