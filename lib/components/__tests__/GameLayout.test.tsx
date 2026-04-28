/**
 * GameLayout 组件测试
 * 
 * 测试游戏页面通用布局组件
 */

import { render, screen } from '@testing-library/react';
import { GameLayout } from '../GameLayout';

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({ children, ...props }: any) => {
    return (
      <a href={props.href} {...props}>
        {children}
      </a>
    );
  };
});

describe('GameLayout', () => {
  const defaultProps = {
    title: 'Test Game',
    children: <div data-testid="child-content">Child Content</div>,
  };

  it('应该渲染标题', () => {
    render(<GameLayout {...defaultProps} />);
    
    // 标题应该在 sr-only 类中（屏幕阅读器可见）
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Test Game');
  });

  it('应该渲染子内容', () => {
    render(<GameLayout {...defaultProps} />);
    
    const childContent = screen.getByTestId('child-content');
    expect(childContent).toBeInTheDocument();
  });

  it('应该包含返回主页的链接', () => {
    render(<GameLayout {...defaultProps} />);
    
    const backLink = screen.getByText(/返回/i);
    expect(backLink).toBeInTheDocument();
    expect(backLink.closest('a')).toHaveAttribute('href', '/');
  });

  it('应该应用自定义 className', () => {
    const customClass = 'custom-background-class';
    render(<GameLayout {...defaultProps} className={customClass} />);
    
    const main = screen.getByRole('main');
    expect(main).toHaveClass(customClass);
  });

  it('默认应该有 min-h-screen 类', () => {
    render(<GameLayout {...defaultProps} />);
    
    const main = screen.getByRole('main');
    expect(main).toHaveClass('min-h-screen');
  });

  it('返回链接应该包含图标和文字', () => {
    render(<GameLayout {...defaultProps} />);
    
    const backLink = screen.getByText(/返回/i);
    expect(backLink).toBeInTheDocument();
    
    // 检查是否有 SVG 图标
    const svg = backLink.parentElement?.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });
});
