import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiKeyService } from '../services/api';
import { Key, Plus, Copy, Trash2, AlertCircle } from 'lucide-react';
import type { CreateApiKeyRequest } from '../types';

export default function ApiKeysPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [error, setError] = useState('');

  const { data: apiKeys, isLoading } = useQuery({
    queryKey: ['api-keys'],
    queryFn: apiKeyService.list,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateApiKeyRequest) => apiKeyService.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      setCreatedKey(data.key ?? null);
      setNewKeyName('');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to create API key');
    },
  });

  const revokeMutation = useMutation({
    mutationFn: apiKeyService.revoke,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!newKeyName.trim()) {
      setError('Name is required');
      return;
    }

    createMutation.mutate({ name: newKeyName.trim() });
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
  };

  const handleRevoke = (id: string) => {
    if (confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      revokeMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">API Keys</h1>
          <p className="text-gray-600">Manage your API keys for programmatic access</p>
        </div>
        <button
          onClick={() => {
            setShowCreate(true);
            setCreatedKey(null);
            setError('');
          }}
          className="flex items-center bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Key
        </button>
      </div>

      {/* Created Key Alert */}
      {createdKey && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-green-800">API Key Created</h3>
              <p className="mt-1 text-sm text-green-700">
                Copy this key now. You won't be able to see it again!
              </p>
              <div className="mt-2 flex items-center gap-2">
                <code className="flex-1 p-2 bg-white rounded border border-green-200 text-sm font-mono text-green-800 break-all">
                  {createdKey}
                </code>
                <button
                  onClick={() => handleCopy(createdKey)}
                  className="p-2 text-green-600 hover:text-green-700"
                  title="Copy"
                >
                  <Copy className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Form */}
      {showCreate && !createdKey && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New API Key</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label htmlFor="keyName" className="block text-sm font-medium text-gray-700">
                Key Name
              </label>
              <input
                id="keyName"
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="e.g., Production API Key"
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50"
              >
                {createMutation.isPending ? 'Creating...' : 'Create Key'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* API Keys List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : !apiKeys || apiKeys.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No API keys yet. Create one to get started.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Key
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rate Limit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Used
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {apiKeys.map((key) => (
                <tr key={key.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Key className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">{key.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <code className="text-sm text-gray-600 font-mono">{key.keyPrefix}...</code>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {key.rateLimit}/hour
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {key.lastUsedAt 
                      ? new Date(key.lastUsedAt).toLocaleDateString()
                      : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(key.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => handleRevoke(key.id)}
                      disabled={revokeMutation.isPending}
                      className="text-red-600 hover:text-red-700"
                      title="Revoke"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* API Usage Guide */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">API Usage</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-700">Authentication</h3>
            <p className="mt-1 text-sm text-gray-600">
              Include your API key in the Authorization header:
            </p>
            <pre className="mt-2 p-3 bg-gray-50 rounded-lg text-sm font-mono overflow-x-auto">
              Authorization: Bearer sk_your_api_key
            </pre>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700">Create Short URL</h3>
            <pre className="mt-2 p-3 bg-gray-50 rounded-lg text-sm font-mono overflow-x-auto">
{`curl -X POST /v1/urls \\
  -H "Authorization: Bearer sk_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{"longUrl": "https://example.com"}'`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
