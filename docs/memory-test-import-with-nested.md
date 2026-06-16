# 带嵌套导入的中间文件 (MEM22)

<!-- MEM-INTERMEDIATE-IMPORT: 此文件本身被 AGENTS.md 导入，同时它又导入了另一个文件 -->

## 中间文件验证

- [MEM22-INTERMEDIATE] 此文件通过 `@docs/memory-test-import-with-nested.md` 被 AGENTS.md 导入
- 此文件内部又通过 `@docs/fragments/nested-fragment.md` 导入了嵌套文件

@docs/fragments/nested-fragment.md

## 中间文件自有内容

- 测试嵌套导入链：AGENTS.md → 本文件 → nested-fragment.md
- 验证标记：`[INTERMEDIATE-IMPORT-SUCCESS]`
