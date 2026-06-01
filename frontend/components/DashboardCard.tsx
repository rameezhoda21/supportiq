import { LucideIcon } from 'lucide-react';

export default function DashboardCard({
  title,
  value,
  caption,
  icon: Icon,
  tone = 'blue',
}: {
  title: string;
  value: string | number;
  caption?: string;
  icon: LucideIcon;
  tone?: 'blue' | 'emerald' | 'amber';
}) {
  const tones = {
    blue: 'bg-blue-50 text-blue-700 ring-blue-100',
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    amber: 'bg-amber-50 text-amber-700 ring-amber-100',
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-3xl font-semibold tracking-normal text-gray-950">{value}</p>
        </div>
        <div className={`rounded-lg p-2 ring-1 ${tones[tone]}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      </div>
      {caption && <p className="mt-4 text-sm text-gray-500">{caption}</p>}
    </div>
  );
}
