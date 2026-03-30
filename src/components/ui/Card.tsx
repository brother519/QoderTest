import type { ReactNode } from 'react'

interface CardProps {
  title?: string
  children: ReactNode
  className?: string
}

export function Card({ title, children, className = '' }: CardProps) {
  return (
    <div
      className={`
        bg-slate-800/80 border border-slate-700/50 rounded-xl
        shadow-lg backdrop-blur-sm
        ${className}
      `}
    >
      {title && (
        <div className="px-5 py-3 border-b border-slate-700/50">
          <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  )
}
