import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { 
  Container, 
  Grid, 
  AppBar, 
  Toolbar, 
  Typography, 
  TextField, 
  InputAdornment,
  IconButton,
  Badge,
  Box
} from '@mui/material';
import { 
  Search as SearchIcon, 
  ShoppingCart as ShoppingCartIcon,
  FilterList as FilterIcon 
} from '@mui/icons-material';
import { useProductStore } from '../store/productStore';
import { useCartStore } from '../store/cartStore';
import ProductList from '../components/ProductList';
import ProductDetail from '../components/ProductDetail';
import ShoppingCart from '../components/ShoppingCart';

const ProductHomePage: React.FC = () => {
  const { products, loadProducts, searchProducts } = useProductStore();
  const { getTotalItems, toggleCart } = useCartStore();

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleSearch = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      const target = event.target as HTMLInputElement;
      searchProducts(target.value);
    }
  };

  return (
    <Box>
      {/* 顶部导航栏 */}
      <AppBar position="sticky" color="primary">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            统一业务平台 - 产品中心
          </Typography>
          
          {/* 搜索框 */}
          <TextField
            placeholder="搜索商品..."
            variant="outlined"
            size="small"
            onKeyPress={handleSearch}
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              borderRadius: 1,
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.23)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'white',
                },
              },
              '& .MuiInputBase-input::placeholder': {
                color: 'rgba(255, 255, 255, 0.7)',
                opacity: 1,
              },
              mr: 2,
              minWidth: 300
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                </InputAdornment>
              ),
            }}
          />

          {/* 工具栏按钮 */}
          <IconButton color="inherit" sx={{ mr: 1 }}>
            <FilterIcon />
          </IconButton>
          
          <IconButton color="inherit" onClick={toggleCart}>
            <Badge badgeContent={getTotalItems()} color="secondary">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* 主要内容区域 */}
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Routes>
          <Route path="/" element={<ProductList />} />
          <Route path="/:id" element={<ProductDetail />} />
        </Routes>
      </Container>

      {/* 购物车侧边栏 */}
      <ShoppingCart />
    </Box>
  );
};

export default ProductHomePage;