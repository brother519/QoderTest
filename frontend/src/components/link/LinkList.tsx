import { useState } from 'react';
import { useLinks } from '../../hooks/useLinks';
import { LinkItem } from './LinkItem';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Button } from '../common/Button';

export function LinkList() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useLinks(page);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        Failed to load links. Please try again.
      </div>
    );
  }

  if (!data || data.items.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No links yet. Create your first short link above!
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-4">
        {data.items.map((link) => (
          <LinkItem key={link.id} link={link} />
        ))}
      </div>

      {/* Pagination */}
      {data.total_pages > 1 && (
        <div className="flex justify-center items-center space-x-4 mt-6">
          <Button
            variant="secondary"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {page} of {data.total_pages}
          </span>
          <Button
            variant="secondary"
            onClick={() => setPage(page + 1)}
            disabled={page === data.total_pages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
