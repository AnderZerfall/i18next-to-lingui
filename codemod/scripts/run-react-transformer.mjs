import { createInterface } from 'node:readline';
import { spawn } from 'node:child_process';

const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((res) => rl.question(q, res));

const translationsPath = await ask('Translations JSON path: ');
const sourcePath = await ask('Source file/dir: ');
rl.close();

const args = [
  'jscodeshift',
  '-t',
  './src/transformers/react-transformer.ts',
  sourcePath,
  '--extensions=ts,tsx',
  '--parser=tsx',
  `--translationsPath=${translationsPath}`,
];

const p = spawn('npx', args, { stdio: 'inherit' });
p.on('exit', (code) => process.exit(code ?? 1));
