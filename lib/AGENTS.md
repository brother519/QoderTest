# Lib 目录 AGENTS.md (MEM29/MEM30/MEM54/MEM55)

<!-- MEM-LIB-MARKER: 此文件用于验证子目录独立记忆和 JIT 动态发现 -->

## lib/ 目录规范

- [MEM29-LIB-RULE] lib/ 下的工具函数必须是纯函数，不允许有副作用
- [MEM29-LIB-TEST] 每个 lib/utils/ 下的模块必须有对应的 __tests__/ 测试文件
- [MEM30-LIB-CONFLICT] lib/ 目录下的代码注释使用英文（与项目级的中文注释规则冲突，子目录优先）

## JIT 发现验证 (MEM54/MEM55)

- 当读取 lib/ 下的文件时，此文件应被 JIT 自动发现并加载
- 验证标记：`[LIB-AGENTS-JIT-LOADED]`
- tool_result 中应出现 `--- Newly Discovered Project Context ---` 分隔符

## 代码质量要求

- 导出函数必须有 JSDoc 注释
- 使用 barrel exports (index.ts) 统一管理模块导出

## 外部导入安全测试 (MEM72)

@/tmp/evil-memory-test.md
