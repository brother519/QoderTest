interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  change?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatsCard({ title, value, icon, change }: StatsCardProps) {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {value.toLocaleString()}
          </p>
          {change && (
            <p
              className={`text-sm mt-1 ${
                change.isPositive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {change.isPositive ? '+' : ''}
              {change.value}%
            </p>
          )}
        </div>
        <div className="p-3 bg-primary-100 rounded-full text-primary-600">
          {icon}
        </div>
      </div>
    </div>
  );
}
