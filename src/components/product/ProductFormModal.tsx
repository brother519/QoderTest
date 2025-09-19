import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Upload,
  Button,
  Space,
  Tag,
  Row,
  Col,
  Switch,
  Divider,
  message,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  UploadOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import { Product } from '../../types';
import { useAppDispatch, useAppSelector } from '../../store';
import { createProduct, updateProduct } from '../../store/slices/productsSlice';
import { closeModal, addNotification } from '../../store/slices/uiSlice';
import { PRODUCT_STATUS_OPTIONS } from '../../constants';

const { Option } = Select;
const { TextArea } = Input;

interface ProductFormModalProps {
  visible?: boolean;
  product?: Product | null;
  onCancel?: () => void;
  onSuccess?: (product: Product) => void;
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({
  visible,
  product,
  onCancel,
  onSuccess,
}) => {
  const dispatch = useAppDispatch();
  const { modals } = useAppSelector((state) => state.ui);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [inputTag, setInputTag] = useState('');
  const [specifications, setSpecifications] = useState<Array<{ key: string; value: string }>>([]);

  const isVisible = visible !== undefined ? visible : modals.productForm;
  const isEditing = !!product;

  // 初始化表单数据
  useEffect(() => {
    if (isVisible && product) {
      form.setFieldsValue({
        name: product.name,
        description: product.description,
        price: product.price,
        originalPrice: product.originalPrice,
        category: product.category,
        status: product.status,
        stock: product.stock,
        sku: product.sku,
      });
      
      setTags(product.tags || []);
      setFileList(
        product.images?.map((url, index) => ({
          uid: `-${index}`,
          name: `image-${index}`,
          status: 'done' as const,
          url,
        })) || []
      );
      
      const specs = Object.entries(product.specifications || {}).map(([key, value]) => ({
        key,
        value: String(value),
      }));
      setSpecifications(specs);
    } else if (isVisible && !product) {
      // 新建商品时重置表单
      form.resetFields();
      setTags([]);
      setFileList([]);
      setSpecifications([]);
    }
  }, [isVisible, product, form]);

  // 处理图片上传
  const handleUploadChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  // 添加标签
  const handleAddTag = () => {
    if (inputTag && !tags.includes(inputTag)) {
      setTags([...tags, inputTag]);
      setInputTag('');
    }
  };

  // 删除标签
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // 添加规格
  const handleAddSpecification = () => {
    setSpecifications([...specifications, { key: '', value: '' }]);
  };

  // 更新规格
  const handleSpecificationChange = (index: number, field: 'key' | 'value', value: string) => {
    const newSpecs = [...specifications];
    newSpecs[index][field] = value;
    setSpecifications(newSpecs);
  };

  // 删除规格
  const handleRemoveSpecification = (index: number) => {
    setSpecifications(specifications.filter((_, i) => i !== index));
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // 处理图片URL
      const images = fileList
        .filter(file => file.status === 'done')
        .map(file => file.url || file.response?.url)
        .filter(Boolean);

      // 处理规格数据
      const specs = specifications.reduce((acc, spec) => {
        if (spec.key && spec.value) {
          acc[spec.key] = spec.value;
        }
        return acc;
      }, {} as Record<string, any>);

      const productData = {
        ...values,
        tags,
        images,
        specifications: specs,
        sortOrder: product?.sortOrder || 0,
      };

      let result;
      if (isEditing && product) {
        result = await dispatch(updateProduct({
          id: product.id,
          data: productData,
        })).unwrap();
      } else {
        result = await dispatch(createProduct(productData)).unwrap();
      }

      dispatch(addNotification({
        type: 'success',
        message: `商品${isEditing ? '更新' : '创建'}成功`,
      }));

      onSuccess?.(result);
      handleClose();
    } catch (error: any) {
      dispatch(addNotification({
        type: 'error',
        message: error.message || `商品${isEditing ? '更新' : '创建'}失败`,
      }));
    } finally {
      setLoading(false);
    }
  };

  // 关闭模态框
  const handleClose = () => {
    if (onCancel) {
      onCancel();
    } else {
      dispatch(closeModal('productForm'));
    }
  };

  return (
    <Modal
      title={isEditing ? '编辑商品' : '新增商品'}
      open={isVisible}
      onCancel={handleClose}
      width={800}
      footer={[
        <Button key="cancel" onClick={handleClose}>
          取消
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          icon={<SaveOutlined />}
          onClick={handleSubmit}
        >
          {isEditing ? '更新' : '创建'}
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          status: 'active',
          stock: 0,
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="商品名称"
              name="name"
              rules={[{ required: true, message: '请输入商品名称' }]}
            >
              <Input placeholder="请输入商品名称" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="SKU"
              name="sku"
              rules={[{ required: true, message: '请输入SKU' }]}
            >
              <Input placeholder="请输入SKU" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="商品描述"
          name="description"
          rules={[{ required: true, message: '请输入商品描述' }]}
        >
          <TextArea rows={3} placeholder="请输入商品描述" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label="销售价格"
              name="price"
              rules={[{ required: true, message: '请输入销售价格' }]}
            >
              <InputNumber
                min={0}
                precision={2}
                style={{ width: '100%' }}
                placeholder="0.00"
                addonBefore="¥"
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="原价" name="originalPrice">
              <InputNumber
                min={0}
                precision={2}
                style={{ width: '100%' }}
                placeholder="0.00"
                addonBefore="¥"
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="库存数量"
              name="stock"
              rules={[{ required: true, message: '请输入库存数量' }]}
            >
              <InputNumber
                min={0}
                style={{ width: '100%' }}
                placeholder="0"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="商品分类"
              name="category"
              rules={[{ required: true, message: '请选择商品分类' }]}
            >
              <Select placeholder="请选择商品分类">
                <Option value="电子产品">电子产品</Option>
                <Option value="服装">服装</Option>
                <Option value="家居用品">家居用品</Option>
                <Option value="食品">食品</Option>
                <Option value="图书">图书</Option>
                <Option value="运动用品">运动用品</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="商品状态"
              name="status"
              rules={[{ required: true, message: '请选择商品状态' }]}
            >
              <Select placeholder="请选择商品状态">
                {PRODUCT_STATUS_OPTIONS.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="商品标签">
          <div>
            <div style={{ marginBottom: 8 }}>
              {tags.map(tag => (
                <Tag
                  key={tag}
                  closable
                  onClose={() => handleRemoveTag(tag)}
                  style={{ marginBottom: 4 }}
                >
                  {tag}
                </Tag>
              ))}
            </div>
            <Space.Compact style={{ width: '100%' }}>
              <Input
                value={inputTag}
                onChange={e => setInputTag(e.target.value)}
                placeholder="输入标签"
                onPressEnter={handleAddTag}
              />
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddTag}>
                添加
              </Button>
            </Space.Compact>
          </div>
        </Form.Item>

        <Form.Item label="商品图片">
          <Upload
            listType="picture-card"
            fileList={fileList}
            onChange={handleUploadChange}
            beforeUpload={() => false} // 阻止自动上传
            maxCount={9}
          >
            {fileList.length >= 9 ? null : (
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>上传图片</div>
              </div>
            )}
          </Upload>
        </Form.Item>

        <Divider>商品规格</Divider>

        <Form.Item label="规格参数">
          <div>
            {specifications.map((spec, index) => (
              <Row key={index} gutter={8} style={{ marginBottom: 8 }}>
                <Col span={10}>
                  <Input
                    placeholder="规格名称"
                    value={spec.key}
                    onChange={e => handleSpecificationChange(index, 'key', e.target.value)}
                  />
                </Col>
                <Col span={10}>
                  <Input
                    placeholder="规格值"
                    value={spec.value}
                    onChange={e => handleSpecificationChange(index, 'value', e.target.value)}
                  />
                </Col>
                <Col span={4}>
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveSpecification(index)}
                  />
                </Col>
              </Row>
            ))}
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={handleAddSpecification}
              style={{ width: '100%' }}
            >
              添加规格
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ProductFormModal;