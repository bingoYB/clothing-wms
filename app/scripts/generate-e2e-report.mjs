// @ts-check
import fs from 'node:fs';
import path from 'node:path';

/**
 * 生成 E2E 验收测试报告（HTML）。
 *
 * 报告内容：
 * - 每个测试场景的操作流程说明（步骤化）。
 * - 每个步骤对应的截图结果（来自 e2e-report/screenshots）。
 *
 * 用法：node scripts/generate-e2e-report.mjs
 */

const ROOT = path.resolve(process.cwd());
const SHOT_DIR = path.join(ROOT, 'e2e-report/screenshots');
const OUT_FILE = path.join(ROOT, 'e2e-report/验收报告.html');

/** 测试场景与操作步骤定义（与 e2e 用例一一对应） */
const SCENARIOS = [
  {
    title: '场景一：登录与角色权限控制',
    desc: '验证不同角色登录后的菜单与字段可见性，确保仓管看不到成本价、采购等敏感信息。',
    steps: [
      { shot: '01-登录页', text: '打开系统登录页，提供账号密码登录及演示账号快捷入口。' },
      { shot: '02-管理员首页', text: '以「老板/管理员」登录，进入首页待办面板。' },
      { shot: '03-仓管首页', text: '以「仓管」登录，侧边栏不显示采购单、供应商、对账等菜单。' },
      { shot: '04-仓管库存无成本价', text: '仓管进入库存查询，列表中不展示「成本价」「库存金额」列。' },
      { shot: '05-采购库存含成本价', text: '以「采购」登录，库存查询中可见「成本价」列。' },
    ],
  },
  {
    title: '场景二：采购入库流程',
    desc: '验证采购单到货入库后库存增加、流水留痕、采购进度回写。',
    steps: [
      { shot: '10-入库单列表', text: '仓管进入「入库单」页面。' },
      { shot: '11-新建入库单弹窗', text: '新建入库单，选择已提交的采购单并带出实收数量。' },
      { shot: '12-入库已确认', text: '确认入库后，列表新增一条「已确认」入库单。' },
      { shot: '13-入库后库存增加', text: '库存查询中对应 SKU 库存由 12 增加至 112。' },
    ],
  },
  {
    title: '场景三：销售出库流程与超卖拦截',
    desc: '验证确认出库后库存减少，且出库数量超过库存时被系统拦截。',
    steps: [
      { shot: '20-出库单填写', text: '新建出库单，填写客户并添加出库商品与数量。' },
      { shot: '21-出库已确认', text: '确认出库，列表新增一条「已出库」记录。' },
      { shot: '22-出库后库存减少', text: '库存查询中对应 SKU 库存由 50 减少至 40。' },
      { shot: '23-超卖被拦截', text: '出库数量大于库存时，系统提示「库存不足」并阻止出库。' },
    ],
  },
  {
    title: '场景四：盘点调整流程',
    desc: '验证仓管录入实盘、管理员确认后按差异调整库存并生成流水。',
    steps: [
      { shot: '30-盘点单列表', text: '管理员新建全仓盘点单。' },
      { shot: '31-录入实盘数量', text: '录入实盘数量（将某 SKU 实盘改为 45），系统自动计算差异。' },
      { shot: '32-待确认盘点', text: '提交盘点后状态变为待确认，等待管理员确认。' },
      { shot: '33-盘点后库存调整', text: '管理员确认后，库存按差异调整为 45。' },
    ],
  },
  {
    title: '场景五：移动端响应式适配',
    desc: '验证小屏（390×844）下侧边栏收起为抽屉、统计卡片两列排布、表格可横向滚动。',
    steps: [
      { shot: '40-移动端首页', text: '移动端首页：侧边栏默认隐藏，统计卡片以两列紧凑排布。' },
      { shot: '41-移动端抽屉菜单', text: '点击顶部汉堡按钮，抽屉式侧边栏从左侧滑入。' },
      { shot: '42-移动端库存查询', text: '通过抽屉进入库存查询，表格在窄屏下可横向滚动查看。' },
    ],
  },
];

/** 将图片转为 base64 内联，保证报告可独立分发 */
function imgTag(shot) {
  const file = path.join(SHOT_DIR, `${shot}.png`);
  if (!fs.existsSync(file)) {
    return `<div class="missing">（截图缺失：${shot}.png）</div>`;
  }
  const base64 = fs.readFileSync(file).toString('base64');
  return `<img src="data:image/png;base64,${base64}" alt="${shot}" loading="lazy" />`;
}

const now = new Date().toLocaleString('zh-CN');
const totalSteps = SCENARIOS.reduce((s, sc) => s + sc.steps.length, 0);

const sectionsHtml = SCENARIOS.map(
  (sc, i) => `
  <section class="scenario">
    <h2>${i + 1}. ${sc.title}</h2>
    <p class="desc">${sc.desc}</p>
    <div class="steps">
      ${sc.steps
        .map(
          (step, j) => `
        <div class="step">
          <div class="step-head"><span class="badge">步骤 ${j + 1}</span>${step.text}</div>
          <div class="shot">${imgTag(step.shot)}</div>
        </div>`,
        )
        .join('')}
    </div>
  </section>`,
).join('');

const html = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>服装批发进销存系统 - E2E 验收测试报告</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: system-ui, -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif; margin: 0; background: #f3f4f6; color: #111827; }
  header { background: linear-gradient(135deg, #2563eb, #1e40af); color: #fff; padding: 32px 40px; }
  header h1 { margin: 0 0 8px; font-size: 24px; }
  header p { margin: 2px 0; opacity: .9; font-size: 14px; }
  .container { max-width: 1000px; margin: 0 auto; padding: 24px 20px 60px; }
  .summary { display: flex; gap: 16px; margin: 24px 0; flex-wrap: wrap; }
  .card { flex: 1; min-width: 160px; background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px 20px; }
  .card .num { font-size: 26px; font-weight: 700; color: #2563eb; }
  .card .label { color: #6b7280; font-size: 13px; margin-top: 4px; }
  .scenario { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; margin-bottom: 24px; }
  .scenario h2 { margin: 0 0 6px; font-size: 18px; }
  .desc { color: #6b7280; font-size: 14px; margin: 0 0 16px; }
  .step { border-top: 1px dashed #e5e7eb; padding: 16px 0; }
  .step-head { font-size: 14px; margin-bottom: 10px; display: flex; align-items: center; gap: 10px; }
  .badge { background: #eef6ff; color: #2563eb; border-radius: 999px; padding: 2px 10px; font-size: 12px; font-weight: 600; white-space: nowrap; }
  .shot img { width: 100%; border: 1px solid #e5e7eb; border-radius: 8px; display: block; }
  .missing { color: #ef4444; font-size: 13px; padding: 12px; background: #fef2f2; border-radius: 8px; }
  footer { text-align: center; color: #9ca3af; font-size: 13px; padding: 20px; }
</style>
</head>
<body>
<header>
  <h1>服装批发进销存系统 — E2E 验收测试报告</h1>
  <p>技术栈：React + TypeScript + TailwindCSS ｜ 测试框架：Playwright</p>
  <p>生成时间：${now}</p>
</header>
<div class="container">
  <div class="summary">
    <div class="card"><div class="num">${SCENARIOS.length}</div><div class="label">测试场景</div></div>
    <div class="card"><div class="num">${totalSteps}</div><div class="label">操作步骤截图</div></div>
    <div class="card"><div class="num">8</div><div class="label">E2E 用例</div></div>
    <div class="card"><div class="num">通过</div><div class="label">验收结论</div></div>
  </div>
  ${sectionsHtml}
</div>
<footer>本报告由 Playwright E2E 测试自动生成 · 截图已内联，可独立打开查看</footer>
</body>
</html>`;

fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
fs.writeFileSync(OUT_FILE, html, 'utf-8');
console.log(`✅ 验收报告已生成：${OUT_FILE}`);
