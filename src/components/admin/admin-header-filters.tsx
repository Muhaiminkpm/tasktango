
'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { FilterValue } from '@/app/(app)/admin/admin-dashboard-client';

type AdminHeaderFiltersProps = {
    filter: FilterValue;
    onFilterChange: (value: FilterValue) => void;
};

export function AdminHeaderFilters({ filter, onFilterChange }: AdminHeaderFiltersProps) {
  return (
    <div className="flex items-center gap-2">
      <Select
        value={filter}
        onValueChange={(value: FilterValue) => onFilterChange(value)}
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
