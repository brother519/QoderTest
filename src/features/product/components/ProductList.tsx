import React from 'react';
import { 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Button, 
  Chip,
  Box,
  Rating,
  CircularProgress,
  Alert
} from '@mui/material';
import { ShoppingCart as ShoppingCartIcon } from '@mui/icons-material';
import { useProductStore } from '../store/productStore';
import { useCartStore } from '../store/cartStore';

const ProductList: React.FC = () => {
  const { products, loading, error } = useProductStore();
  const { addToCart } = useCartStore();

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY'
    }).format(price);
  };

  const handleAddToCart = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      addToCart(product, 1);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (products.length === 0) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        暂无商品数据
      </Alert>
    );
  }

  return (
    <Grid container spacing={3}>
      {products.map((product) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
          <Card 
            sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4,
              }
            }}
          >
            <CardMedia
              component="img"
              height="200"
              image={product.images[0] || '/placeholder-image.jpg'}
              alt={product.name}
              sx={{ objectFit: 'cover' }}
            />
            
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              {/* 商品名称 */}
              <Typography 
                gutterBottom 
                variant="h6" 
                component="h2"
                sx={{ 
                  fontWeight: 600,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  mb: 1
                }}
              >
                {product.name}
              </Typography>

              {/* 商品描述 */}
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ 
                  mb: 2,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  flexGrow: 1
                }}
              >
                {product.description}
              </Typography>

              {/* 评分 */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Rating 
                  value={product.rating} 
                  precision={0.1} 
                  size="small" 
                  readOnly 
                />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  ({product.rating})
                </Typography>
              </Box>

              {/* 标签 */}
              <Box sx={{ mb: 2 }}>
                {product.tags.slice(0, 3).map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ mr: 0.5, mb: 0.5 }}
                  />
                ))}
              </Box>

              {/* 价格和操作区域 */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography 
                    variant="h6" 
                    color="primary" 
                    sx={{ fontWeight: 700 }}
                  >
                    {formatPrice(product.price)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    库存: {product.stock}
                  </Typography>
                </Box>
                
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<ShoppingCartIcon />}
                  onClick={() => handleAddToCart(product.id)}
                  disabled={product.stock === 0}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 500
                  }}
                >
                  {product.stock === 0 ? '缺货' : '加入购物车'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default ProductList;