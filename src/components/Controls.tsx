import React from 'react'

export function Controls() {
  return (
    <div className="bg-card/50 backdrop-blur-sm rounded-lg p-4 border border-border">
      <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">操作说明</h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">移动</span>
          <span className="font-mono text-foreground">← → ↓</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">旋转</span>
          <span className="font-mono text-foreground">↑</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">硬降</span>
          <span className="font-mono text-foreground">空格</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">暂停</span>
          <span className="font-mono text-foreground">P</span>
        </div>
      </div>
    </div>
  )
}
