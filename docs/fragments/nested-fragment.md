# 嵌套导入文件 - 多级导入测试 (MEM22)

<!-- MEM-NESTED-IMPORT-MARKER: 此文件通过嵌套 @pathToImport 被间接导入 -->

## 嵌套导入验证

- [MEM22-NESTED-IMPORTED] 此文件被 `docs/memory-test-import-with-nested.md` 通过 `@docs/fragments/nested-fragment.md` 导入
- 验证标记：`[NESTED-IMPORT-SUCCESS]`

## 片段内容

- 数据库连接使用连接池管理，默认 pool size 为 10
- 缓存策略：热数据 TTL 5 分钟，冷数据 TTL 1 小时
