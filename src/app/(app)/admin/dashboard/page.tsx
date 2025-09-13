
// This page component now receives props from the layout
import { AdminDashboardClient, FilterValue } from '../admin-dashboard-client';

export default function AdminDashboardPage({ filter }: { filter?: FilterValue }) {
  return <AdminDashboardClient filter={filter} />;
}
