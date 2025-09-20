import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Button,
  Divider,
  Badge,
  Chip
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  ShoppingCart as ShoppingCartIcon
} from '@mui/icons-material';
import { useCartStore } from '../store/cartStore';
import { useProductStore } from '../store/productStore';

const ShoppingCart: React.FC = () => {
  const { 
    items, 
    isOpen, 
    setCartOpen, 
    updateQuantity, 
    removeFromCart, 
    getTotalItems,
    clearCart 
  } = useCartStore();
  const { getProductById } = useProductStore();

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY'
    }).format(price);
  };

  const calculateTotal = (): number => {
    return items.reduce((total, item) => {
      const product = getProductById(item.productId);
      if (!product) return total;
      
      const price = item.selectedVariant?.price || product.price;
      return total + (price * item.quantity);
    }, 0);
  };

  const handleClose = () => {
    setCartOpen(false);
  };

  const handleQuantityChange = (productId: string, quantity: number, variantId?: string) => {
    updateQuantity(productId, quantity, variantId);
  };

  const handleRemoveItem = (productId: string, variantId?: string) => {
    removeFromCart(productId, variantId);
  };

  return (
    <Drawer
      anchor="right"
      open={isOpen}
      onClose={handleClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 400 } }
      }}
    >
      <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* 标题栏 */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ShoppingCartIcon sx={{ mr: 1 }} />
            <Typography variant="h6" fontWeight={600}>
              购物车
            </Typography>
            <Badge badgeContent={getTotalItems()} color="primary" sx={{ ml: 1 }}>
              <Box />
            </Badge>
          </Box>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider />

        {/* 购物车内容 */}
        {items.length === 0 ? (
          <Box 
            sx={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'text.secondary'
            }}
          >
            <ShoppingCartIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
            <Typography variant="h6" gutterBottom>
              购物车为空
            </Typography>
            <Typography variant="body2">
              快去选购您喜欢的商品吧！
            </Typography>
          </Box>
        ) : (
          <>
            {/* 商品列表 */}
            <List sx={{ flex: 1, overflow: 'auto' }}>
              {items.map((item) => {
                const product = getProductById(item.productId);
                if (!product) return null;

                const price = item.selectedVariant?.price || product.price;
                const variantId = item.selectedVariant?.id;

                return (
                  <ListItem
                    key={`${item.productId}-${variantId || 'default'}`}
                    sx={{
                      flexDirection: 'column',
                      alignItems: 'stretch',
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      mb: 1,
                      p: 2
                    }}
                  >
                    {/* 商品信息 */}
                    <Box sx={{ display: 'flex', mb: 1 }}>
                      <Box
                        component="img"
                        src={product.images[0] || '/placeholder-image.jpg'}
                        alt={product.name}
                        sx={{
                          width: 60,
                          height: 60,
                          objectFit: 'cover',
                          borderRadius: 1,
                          mr: 2
                        }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                          {product.name}
                        </Typography>
                        {item.selectedVariant && (
                          <Chip
                            label={item.selectedVariant.name}
                            size="small"
                            variant="outlined"
                            sx={{ mb: 1 }}
                          />
                        )}
                        <Typography variant="body2" color="primary" fontWeight={600}>
                          {formatPrice(price)}
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveItem(item.productId, variantId)}
                        sx={{ alignSelf: 'flex-start' }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>

                    {/* 数量控制 */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton
                          size="small"
                          onClick={() => handleQuantityChange(item.productId, item.quantity - 1, variantId)}
                          disabled={item.quantity <= 1}
                        >
                          <RemoveIcon fontSize="small" />
                        </IconButton>
                        <Typography sx={{ mx: 2, minWidth: 20, textAlign: 'center' }}>
                          {item.quantity}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => handleQuantityChange(item.productId, item.quantity + 1, variantId)}
                        >
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      
                      <Typography variant="subtitle2" fontWeight={600}>
                        {formatPrice(price * item.quantity)}
                      </Typography>
                    </Box>
                  </ListItem>
                );
              })}
            </List>

            <Divider sx={{ my: 2 }} />

            {/* 总计和操作 */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                  总计
                </Typography>
                <Typography variant="h6" fontWeight={600} color="primary">
                  {formatPrice(calculateTotal())}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  onClick={clearCart}
                  sx={{ flex: 1, textTransform: 'none' }}
                >
                  清空购物车
                </Button>
                <Button
                  variant="contained"
                  sx={{ 
                    flex: 2, 
                    textTransform: 'none',
                    fontWeight: 600
                  }}
                >
                  去结算
                </Button>
              </Box>
            </Box>
          </>
        )}
      </Box>
    </Drawer>
  );
};

export default ShoppingCart;