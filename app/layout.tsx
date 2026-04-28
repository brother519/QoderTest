/**
 * Next.js App Router 根布局组件
 *
 * 作为所有页面的最外层包裹，负责设置 HTML 文档结构和引入全局样式。
 *
 * @module app/layout
 */

import type { Metadata } from 'next'
import './globals.css'

/** 页面元数据配置 */
export const metadata: Metadata = {
  title: 'Qoder Test',
  description: 'Qoder Test Project',
}

/**
 * 根布局组件
 *
 * @param {{ children: React.ReactNode }} props - 子路由页面内容
 * @returns {JSX.Element} 完整的 HTML 文档结构
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
