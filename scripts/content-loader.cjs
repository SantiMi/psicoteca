const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const loaded = new Map();
function loadContent(relativePath) {
  const filename = path.resolve(root, relativePath);
  if (!filename.startsWith(path.join(root, 'data') + path.sep) || !filename.endsWith('.ts')) throw new Error('Only data TypeScript modules are allowed');
  if (loaded.has(filename)) return loaded.get(filename).exports;
  const module = {exports: {}};
  loaded.set(filename, module);
  const output = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020}}).outputText;
  const localRequire = name => {
    if (!name.startsWith('@/data/')) throw new Error('Unexpected content dependency');
    return loadContent(name.slice(2) + '.ts');
  };
  new Function('require', 'module', 'exports', output)(localRequire, module, module.exports);
  return module.exports;
}
module.exports = {loadContent};
