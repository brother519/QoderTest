import { LinkMatchGame } from '@/components/games/LinkMatchGame'
import { LinkMatchProvider } from '@/store/link-match-store'

/** 连连看游戏页面 */
export default function LinkMatchGamePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            连连看
          </h1>
          <p className="text-slate-400 mt-2">找到相同图案，连线消除所有方块</p>
        </header>

        <LinkMatchProvider>
          <LinkMatchGame />
        </LinkMatchProvider>
      </div>
    </div>
  )
}
