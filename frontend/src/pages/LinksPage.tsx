import { LinkCreator } from '../components/link/LinkCreator';
import { LinkList } from '../components/link/LinkList';

export function LinksPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Links</h1>
      <LinkCreator />
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">All Links</h2>
        <LinkList />
      </div>
    </div>
  );
}
