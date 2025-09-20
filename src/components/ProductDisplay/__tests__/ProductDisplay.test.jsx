import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '../test/test-utils'
import ProductDisplay from '../components/ProductDisplay/ProductDisplay'
import { createMockProduct } from '../test/test-utils'

// 模拟store
const mockGetProductById = vi.fn()
const mockAddToCart = vi.fn()
const mockGetCartItemCount = vi.fn()

vi.mock('../store/productStore.js', () => ({
  useProductStore: () => ({
    getProductById: mockGetProductById
  })
}))

vi.mock('../store/cartStore.js', () => ({
  useCartStore: () => ({
    addToCart: mockAddToCart,
    getCartItemCount: mockGetCartItemCount
  })
}))

describe('ProductDisplay Component', () => {
  const mockProduct = createMockProduct({
    id: 'test-product-1',
    name: '测试商品',
    price: 199.99,
    description: '这是一个测试商品的详细描述',
    images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
    stock: 5,
    rating: 4.2,
    tags: ['热销', '推荐'],
    category: '电子产品'
  })

  beforeEach(() => {
    // 重置所有mock
    vi.clearAllMocks()
    mockGetProductById.mockReturnValue(mockProduct)
    mockGetCartItemCount.mockReturnValue(0)
  })

  it('应该正确渲染商品信息', () => {
    render(<ProductDisplay productId="test-product-1" />)
    
    // 检查商品名称
    expect(screen.getByText('测试商品')).toBeInTheDocument()
    
    // 检查商品描述  
    expect(screen.getByText('这是一个测试商品的详细描述')).toBeInTheDocument()
    
    // 检查价格
    expect(screen.getByText(/¥199.99/)).toBeInTheDocument()
    
    // 检查库存信息
    expect(screen.getByText(/库存: 5 件/)).toBeInTheDocument()
    
    // 检查分类
    expect(screen.getByText('电子产品')).toBeInTheDocument()
  })

  it('应该显示商品标签', () => {
    render(<ProductDisplay productId="test-product-1" />)
    
    expect(screen.getByText('热销')).toBeInTheDocument()
    expect(screen.getByText('推荐')).toBeInTheDocument()
  })

  it('应该显示正确的评分', () => {
    render(<ProductDisplay productId="test-product-1" />)
    
    expect(screen.getByText('4.2 分')).toBeInTheDocument()
  })

  it('当库存为0时应该禁用加入购物车按钮', () => {
    const outOfStockProduct = createMockProduct({
      ...mockProduct,
      stock: 0
    })
    mockGetProductById.mockReturnValue(outOfStockProduct)
    
    render(<ProductDisplay productId="test-product-1" />)
    
    const addToCartButton = screen.getByRole('button', { name: /暂时缺货/ })
    expect(addToCartButton).toBeDisabled()
  })

  it('应该能够调整商品数量', () => {
    render(<ProductDisplay productId="test-product-1" />)
    
    const decreaseButton = screen.getByRole('button', { name: '-' })
    const increaseButton = screen.getByRole('button', { name: '+' })
    const quantityDisplay = screen.getByDisplayValue('1')
    
    expect(quantityDisplay).toBeInTheDocument()
    
    // 点击增加按钮
    fireEvent.click(increaseButton)
    expect(screen.getByDisplayValue('2')).toBeInTheDocument()
    
    // 点击减少按钮
    fireEvent.click(decreaseButton)
    expect(screen.getByDisplayValue('1')).toBeInTheDocument()
  })

  it('不应该允许数量低于1', () => {
    render(<ProductDisplay productId="test-product-1" />)
    
    const decreaseButton = screen.getByRole('button', { name: '-' })
    
    // 数量为1时点击减少按钮
    fireEvent.click(decreaseButton)
    
    // 数量应该仍然是1
    expect(screen.getByDisplayValue('1')).toBeInTheDocument()
  })

  it('不应该允许数量超过库存', () => {
    render(<ProductDisplay productId="test-product-1" />)
    
    const increaseButton = screen.getByRole('button', { name: '+' })
    
    // 连续点击增加按钮超过库存数量
    for (let i = 0; i < 10; i++) {
      fireEvent.click(increaseButton)
    }
    
    // 数量不应该超过库存(5)
    expect(screen.getByDisplayValue('5')).toBeInTheDocument()
  })

  it('点击加入购物车应该调用正确的函数', () => {
    render(<ProductDisplay productId="test-product-1" />)
    
    const addToCartButton = screen.getByRole('button', { name: /加入购物车/ })
    fireEvent.click(addToCartButton)
    
    expect(mockAddToCart).toHaveBeenCalledWith(
      mockProduct,
      1, // 默认数量
      null // 没有选择变体
    )
  })

  it('商品不存在时应该显示未找到消息', () => {
    mockGetProductById.mockReturnValue(null)
    
    render(<ProductDisplay productId="non-existent-product" />)
    
    expect(screen.getByText('商品未找到')).toBeInTheDocument()
  })

  it('应该正确显示商品图片', () => {
    render(<ProductDisplay productId="test-product-1" />)
    
    const mainImage = screen.getByAltText('测试商品')
    expect(mainImage).toBeInTheDocument()
    expect(mainImage).toHaveAttribute('src', 'https://example.com/image1.jpg')
  })

  it('应该显示缩略图当有多张图片时', () => {
    render(<ProductDisplay productId="test-product-1" />)
    
    // 应该有缩略图按钮
    const thumbnails = screen.getAllByRole('button')
    const imageThumbnails = thumbnails.filter(button => 
      button.querySelector('img') && 
      button.querySelector('img').alt.includes('测试商品')
    )
    
    expect(imageThumbnails.length).toBeGreaterThan(1)
  })

  it('点击缩略图应该切换主图片', () => {
    render(<ProductDisplay productId="test-product-1" />)
    
    const mainImage = screen.getByAltText('测试商品')
    expect(mainImage).toHaveAttribute('src', 'https://example.com/image1.jpg')
    
    // 找到第二张缩略图并点击
    const thumbnails = screen.getAllByRole('button')
    const secondThumbnail = thumbnails.find(button => {
      const img = button.querySelector('img')
      return img && img.alt === '测试商品 2'
    })
    
    if (secondThumbnail) {
      fireEvent.click(secondThumbnail)
      expect(mainImage).toHaveAttribute('src', 'https://example.com/image2.jpg')
    }
  })
})