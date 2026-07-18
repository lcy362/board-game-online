// 极速桌游馆 · 构建脚本
// 只把「公开页面 + 资源」拷贝到 dist/，开发/规划目录（speed101/、design/、docs/、release/、scripts/ 等）不进入生产。
import { cpSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const dist = join(root, 'dist');

// 仅这些进入生产构建
const PUBLIC = [
  'index.html',
  'assets',
  'games',
  'robots.txt',
  'sitemap.xml',
];

if (existsSync(dist)) rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

for (const item of PUBLIC) {
  const src = join(root, item);
  if (!existsSync(src)) {
    console.warn('跳过（不存在）:', item);
    continue;
  }
  cpSync(src, join(dist, item), { recursive: true });
  console.log('✓ 已拷贝:', item);
}

console.log('构建完成 → dist/  （开发目录已排除，不会进生产）');
