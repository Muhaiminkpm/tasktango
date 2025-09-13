
'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usePathname, useRouter } from 'next/navigation';
import type { FilterValue } from '@/app/(app)/admin/admin-dashboard-client';

type AdminHeaderFiltersProps = {
    initialFilter: FilterValue;
};

export function AdminHeaderFilters({ initialFilter }: AdminHeaderFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleFilterChange = (value: string) => {
    const params = new URLSearchParams(window.location.search);
    if (value === 'today') {
      // "today" is the default, so we can remove the param
      params.delete('filter');
    } else {
      params.set('filter', value);
    }
    const queryString = params.toString();
    router.push(`${pathname}${queryString ? `?${queryString}` : ''}`);
  };

  return (
    <div className="flex items-center gap-2">
      <Select
        value={initialFilter}
        onValueChange={handleFilterChange}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by date" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Tasks</SelectItem>
          <SelectItem value="today">Today's tasks</SelectItem>
          <SelectItem value="yesterday">Yesterday</SelectItem>
          <SelectItem value="week">This Week</SelectItem>
          <SelectItem value="month">This Month</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
