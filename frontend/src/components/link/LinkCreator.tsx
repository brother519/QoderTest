import { useState, FormEvent } from 'react';
import { useCreateLink } from '../../hooks/useLinks';
import { Button } from '../common/Button';
import { Input } from '../common/Input';

interface LinkCreatorProps {
  onSuccess?: () => void;
}

export function LinkCreator({ onSuccess }: LinkCreatorProps) {
  const [url, setUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [title, setTitle] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [error, setError] = useState('');

  const createLink = useCreateLink();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!url) {
      setError('Please enter a URL');
      return;
    }

    try {
      await createLink.mutateAsync({
        original_url: url,
        custom_code: customCode || undefined,
        title: title || undefined,
        expires_at: expiresAt || undefined,
      });

      // Reset form
      setUrl('');
      setCustomCode('');
      setTitle('');
      setExpiresAt('');
      onSuccess?.();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Failed to create link');
    }
  };

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4">Create Short Link</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Long URL"
          type="url"
          placeholder="https://example.com/very/long/url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          error={error}
        />

        <div className="flex items-center">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            {showAdvanced ? 'Hide' : 'Show'} advanced options
          </button>
        </div>

        {showAdvanced && (
          <div className="space-y-4 pt-2 border-t">
            <Input
              label="Custom Short Code (optional)"
              placeholder="my-link"
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value)}
              helperText="3-10 characters, letters, numbers, and hyphens only"
            />
            <Input
              label="Title (optional)"
              placeholder="My awesome link"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Input
              label="Expiration Date (optional)"
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
            />
          </div>
        )}

        <Button
          type="submit"
          isLoading={createLink.isPending}
          className="w-full"
        >
          Shorten URL
        </Button>
      </form>

      {createLink.isSuccess && createLink.data && (
        <div className="mt-4 p-4 bg-green-50 rounded-md">
          <p className="text-sm text-green-800 font-medium">Link created!</p>
          <div className="mt-2 flex items-center space-x-2">
            <input
              type="text"
              readOnly
              value={createLink.data.short_url}
              className="flex-1 input bg-white"
            />
            <Button
              variant="secondary"
              onClick={() => navigator.clipboard.writeText(createLink.data.short_url)}
            >
              Copy
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
