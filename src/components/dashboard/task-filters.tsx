'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Priority } from '@/lib/types';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export function TaskFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleFilterChange = (value: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    if (value === 'all') {
      current.delete('priority');
    } else {
      current.set('priority', value);
    }
    const search = current.toString();
    const query = search ? `?${search}` : '';
    router.push(`${pathname}${query}`);
  };

  return (
    <div className="flex items-center gap-2">
      <Select
        defaultValue={searchParams.get('priority') || 'all'}
        onValueChange={handleFilterChange}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Priorities</SelectItem>
          <SelectItem value="high">High</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="low">Low</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
