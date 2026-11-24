'use client';

import { useEffect, useState } from 'react';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';
import { useDebounce } from '@/hooks/use-debounce';
import { LoaderIcon, SearchIcon } from 'lucide-react';

export const Search = ({
  onSearch,
  isLoading,
  placeholder = 'Cari...',
  ...props
}: Omit<React.ComponentProps<typeof InputGroup>, 'onChange'> & {
  onSearch: (value: string) => void;
  isLoading?: boolean;
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
        <SearchIcon />
      </InputGroupAddon>

      {isLoading || isDebouncing ? (
        <InputGroupAddon align="inline-end">
          <LoaderIcon className="animate-spin text-primary" />
        </InputGroupAddon>
      ) : null}
    </InputGroup>
  );
};
