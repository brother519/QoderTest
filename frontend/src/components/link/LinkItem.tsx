import { useState } from 'react';
import { Link } from '../../types';
import { useDeleteLink } from '../../hooks/useLinks';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { QRCodeDisplay } from './QRCodeDisplay';

interface LinkItemProps {
  link: Link;
}

export function LinkItem({ link }: LinkItemProps) {
  const [showQR, setShowQR] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const deleteLink = useDeleteLink();

  const handleDelete = () => {
    deleteLink.mutate(link.id, {
      onSuccess: () => setShowDeleteConfirm(false),
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(link.short_url);
  };

  const isExpired = link.expires_at && new Date(link.expires_at) < new Date();

  return (
    <div className={`card ${!link.is_active || isExpired ? 'opacity-60' : ''}`}>
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <a
              href={link.short_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg font-medium text-primary-600 hover:text-primary-700 truncate"
            >
              {link.short_url}
            </a>
            <button
              onClick={copyToClipboard}
              className="text-gray-400 hover:text-gray-600"
              title="Copy to clipboard"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
          
          {link.title && (
            <p className="text-sm font-medium text-gray-900 mt-1">{link.title}</p>
          )}
          
          <p className="text-sm text-gray-500 truncate mt-1">
            {link.original_url}
          </p>

          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
            <span className="flex items-center">
              <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {link.click_count} clicks
            </span>
            <span>
              Created {new Date(link.created_at).toLocaleDateString()}
            </span>
            {link.expires_at && (
              <span className={isExpired ? 'text-red-500' : ''}>
                {isExpired ? 'Expired' : `Expires ${new Date(link.expires_at).toLocaleDateString()}`}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2 ml-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowQR(true)}
          >
            QR
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* QR Code Modal */}
      <Modal
        isOpen={showQR}
        onClose={() => setShowQR(false)}
        title="QR Code"
      >
        <QRCodeDisplay linkId={link.id} shortCode={link.short_code} />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Link"
      >
        <p className="text-gray-600 mb-4">
          Are you sure you want to delete this link? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-2">
          <Button
            variant="secondary"
            onClick={() => setShowDeleteConfirm(false)}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            isLoading={deleteLink.isPending}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
