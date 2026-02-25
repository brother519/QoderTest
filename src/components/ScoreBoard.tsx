import React from 'react'

interface ScoreBoardProps {
  score: number
  lines: number
  level: number
}

export function ScoreBoard({ score, lines, level }: ScoreBoardProps) {
  return (
    <div className="bg-card/50 backdrop-blur-sm rounded-lg p-4 border border-border space-y-4">
      <div>
        <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-1">分数</h3>
        <p className="text-2xl font-bold text-primary neon-text">{score.toLocaleString()}</p>
      </div>
      <div>
        <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-1">消除行数</h3>
        <p className="text-xl font-semibold text-accent">{lines}</p>
      </div>
      <div>
        <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-1">等级</h3>
        <p className="text-xl font-semibold text-foreground">{level}</p>
      </div>
    </div>
  )
}
