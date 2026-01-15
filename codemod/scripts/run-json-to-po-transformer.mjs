import { createInterface } from 'node:readline';
import { spawn } from 'node:child_process';

const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((res) => rl.question(q, res));

const sourcePath = await ask('Source JSON translations path: ');
const targetPath = await ask('Target PO file/dir: ');
rl.close();

const args = [
  'tsx',
  './src/transformers/translation-transformer.ts',
  `--source=${sourcePath}`,
  `--target=${targetPath}`,
];

const p = spawn('npx', args, { stdio: 'inherit' });
p.on('exit', (code) => process.exit(code ?? 1));
