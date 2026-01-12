import { Link as RouterLink } from 'react-router-dom';
import { Link } from '../../types';

interface TopLinksProps {
  links: Link[];
}

export function TopLinks({ links }: TopLinksProps) {
  if (!links || links.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No links yet
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {links.slice(0, 5).map((link, index) => (
        <div
          key={link.id}
          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
        >
          <div className="flex items-center space-x-3 min-w-0">
            <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-primary-100 text-primary-600 rounded-full text-sm font-medium">
              {index + 1}
            </span>
            <div className="min-w-0">
              <RouterLink
                to={`/links/${link.id}`}
                className="text-sm font-medium text-gray-900 hover:text-primary-600 truncate block"
              >
                {link.title || link.short_code}
              </RouterLink>
              <p className="text-xs text-gray-500 truncate">
                {link.short_url}
              </p>
            </div>
          </div>
          <div className="flex-shrink-0 text-right">
            <p className="text-lg font-semibold text-gray-900">
              {link.click_count.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">clicks</p>
          </div>
        </div>
      ))}
    </div>
  );
}
