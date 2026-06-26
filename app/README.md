# 服装批发进销存系统（前端）

基于 [docs/prd.md](../docs/prd.md) 实现的一期 MVP 前端，后端暂未实现，全部使用内存 mock 数据。

## 技术选型

- **React 18 + TypeScript**：组件化、类型安全
- **TailwindCSS**：原子化样式
- **React Router**：路由与受保护页面
- **Vite**：开发与构建
- **Vitest + Testing Library**：单元测试
- **Playwright**：端到端（E2E）测试
- **pnpm**：包管理

## 设计原则（SOLID）

- **单一职责**：`types`（契约）、`data`（种子）、`services`（业务规则）、`components/ui`（通用组件）、`pages`（页面）各司其职。
- **依赖倒置**：页面依赖 `services` 抽象而非具体数据源；接入真实后端时只需替换 service 层。
- **开闭原则**：泛型 `Table`、导航 `navConfig`、权限矩阵 `permissions` 通过配置扩展，无需改动组件本体。
- 全量中文注释，组件按职责拆分，保持简洁。

## 目录结构

```
src/
  types/        领域模型类型（单一数据契约）
  data/         初始 mock 种子数据
  services/     领域服务（库存/入库/出库/采购/盘点/对账/预警…）
  auth/         登录上下文与 RBAC 权限矩阵
  hooks/        通用 Hooks
  components/
    ui/         通用组件（Button/Table/Modal/Field/Badge/Layout）
    layout/     布局（Sidebar/Topbar/AppLayout/导航配置）
  pages/        业务页面
tests/unit/     单元测试
e2e/            E2E 测试与辅助
scripts/        验收报告生成脚本
```

## 快速开始

```bash
pnpm install
pnpm dev          # 启动开发服务器 http://localhost:5173
```

登录页提供 4 个演示账号一键登录（密码任意）：老板/管理员、仓管、采购、财务。

## 测试

### 单元测试（Vitest）

```bash
pnpm test            # 运行全部单元测试
pnpm test:coverage   # 生成覆盖率报告（coverage/）
```

覆盖核心业务规则：库存留痕、禁止超卖、采购入库回写进度与对账、盘点差异调整、权限矩阵等。

### E2E 测试（Playwright）

```bash
pnpm e2e          # 自动 build + preview，运行 E2E，并生成验收报告
pnpm e2e:report   # 打开 Playwright 官方 HTML 报告
```

E2E 完成后产物位于 `e2e-report/`：

- `验收报告.html`：**自定义验收报告**，按场景展示操作流程说明与对应截图（截图已内联，可独立打开）。
- `html/index.html`：Playwright 官方测试报告。
- `screenshots/`：各操作步骤截图。

## 已实现模块

登录与权限、首页待办、商品管理、库存查询与流水、库存预警、入库单、出库单、采购单、盘点、供应商、供应商对账。
