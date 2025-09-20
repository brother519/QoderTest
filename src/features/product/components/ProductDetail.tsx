import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Typography,
  Button,
  Card,
  CardMedia,
  Chip,
  Rating,
  TextField,
  IconButton,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  ShoppingCart as ShoppingCartIcon,
  Favorite as FavoriteIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import { useProductStore } from '../store/productStore';
import { useCartStore } from '../store/cartStore';
import { ProductVariant } from '@/shared/types';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProductById } = useProductStore();
  const { addToCart, getCartItemCount } = useCartStore();

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const product = id ? getProductById(id) : null;

  useEffect(() => {
    if (product?.variants && product.variants.length > 0) {
      setSelectedVariant(product.variants[0]);
    }
  }, [product]);

  if (!product) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" py={4}>
        <CircularProgress sx={{ mb: 2 }} />
        <Typography>加载商品信息...</Typography>
      </Box>
    );
  }

  const currentPrice = selectedVariant?.price || product.price;
  const currentStock = selectedVariant?.stock || product.stock;
  const cartItemCount = getCartItemCount(product.id, selectedVariant || undefined);

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY'
    }).format(price);
  };

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedVariant || undefined);
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= currentStock) {
      setQuantity(newQuantity);
    }
  };

  return (
    <Box>
      {/* 返回按钮 */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/products')}
        sx={{ mb: 3 }}
      >
        返回商品列表
      </Button>

      <Grid container spacing={4}>
        {/* 左侧图片区域 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardMedia
              component="img"
              height="400"
              image={product.images[selectedImageIndex] || '/placeholder-image.jpg'}
              alt={product.name}
              sx={{ objectFit: 'cover' }}
            />
          </Card>

          {/* 缩略图 */}
          {product.images.length > 1 && (
            <Box sx={{ display: 'flex', gap: 1, mt: 2, overflowX: 'auto' }}>
              {product.images.map((image, index) => (
                <Card
                  key={index}
                  sx={{
                    minWidth: 80,
                    cursor: 'pointer',
                    border: selectedImageIndex === index ? 2 : 0,
                    borderColor: 'primary.main'
                  }}
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <CardMedia
                    component="img"
                    height="80"
                    image={image}
                    alt={`${product.name} ${index + 1}`}
                    sx={{ objectFit: 'cover' }}
                  />
                </Card>
              ))}
            </Box>
          )}
        </Grid>

        {/* 右侧商品信息 */}
        <Grid item xs={12} md={6}>
          <Box>
            {/* 商品标题和评分 */}
            <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
              {product.name}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Rating value={product.rating} precision={0.1} readOnly />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                {product.rating} 分
              </Typography>
            </Box>

            {/* 标签 */}
            <Box sx={{ mb: 3 }}>
              {product.tags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  color="primary"
                  variant="outlined"
                  size="small"
                  sx={{ mr: 1, mb: 1 }}
                />
              ))}
            </Box>

            {/* 价格 */}
            <Typography variant="h4" color="primary" fontWeight={700} gutterBottom>
              {formatPrice(currentPrice)}
            </Typography>

            {/* 商品描述 */}
            <Typography variant="body1" color="text.secondary" paragraph>
              {product.description}
            </Typography>

            <Divider sx={{ my: 3 }} />

            {/* 规格选择 */}
            {product.variants && product.variants.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  选择规格
                </Typography>
                <Grid container spacing={2}>
                  {product.variants.map((variant) => (
                    <Grid item key={variant.id}>
                      <Card
                        sx={{
                          p: 2,
                          cursor: 'pointer',
                          border: selectedVariant?.id === variant.id ? 2 : 1,
                          borderColor: selectedVariant?.id === variant.id ? 'primary.main' : 'divider',
                          '&:hover': {
                            borderColor: 'primary.main'
                          }
                        }}
                        onClick={() => setSelectedVariant(variant)}
                      >
                        <Typography variant="subtitle2" fontWeight={600}>
                          {variant.name}
                        </Typography>
                        <Typography variant="body2" color="primary" fontWeight={600}>
                          {formatPrice(variant.price)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          库存: {variant.stock}
                        </Typography>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {/* 数量选择 */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                数量
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconButton 
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  <RemoveIcon />
                </IconButton>
                <TextField
                  value={quantity}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 1;
                    if (value >= 1 && value <= currentStock) {
                      setQuantity(value);
                    }
                  }}
                  sx={{ width: 80 }}
                  inputProps={{ style: { textAlign: 'center' } }}
                />
                <IconButton 
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= currentStock}
                >
                  <AddIcon />
                </IconButton>
                <Typography variant="body2" color="text.secondary">
                  库存: {currentStock} 件
                </Typography>
              </Box>
            </Box>

            {/* 操作按钮 */}
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<ShoppingCartIcon />}
                onClick={handleAddToCart}
                disabled={currentStock === 0}
                sx={{ 
                  flex: 1,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  py: 1.5
                }}
              >
                {currentStock === 0 ? '暂时缺货' : '加入购物车'}
                {cartItemCount > 0 && (
                  <Chip
                    label={cartItemCount}
                    size="small"
                    color="secondary"
                    sx={{ ml: 1 }}
                  />
                )}
              </Button>
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<FavoriteIcon />}
                sx={{ flex: 1, textTransform: 'none' }}
              >
                收藏
              </Button>
              <Button
                variant="outlined"
                startIcon={<ShareIcon />}
                sx={{ flex: 1, textTransform: 'none' }}
              >
                分享
              </Button>
            </Box>

            {/* 商品信息 */}
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                商品信息
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    分类: {product.category}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    商品ID: {product.id}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    库存: {currentStock} 件
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    评分: {product.rating}/5.0
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProductDetail;