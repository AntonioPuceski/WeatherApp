const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const output = ts.transpileModule(fs.readFileSync('utils/units.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText;
const context = { exports: {} };
vm.runInNewContext(output, context);
const { temperature, windSpeed } = context.exports;
assert.equal(temperature(0, 'imperial'), 32);
assert.equal(temperature(-40, 'imperial'), -40);
assert.equal(temperature(24, 'imperial'), 75);
assert.equal(temperature(24, 'metric'), 24);
assert.equal(windSpeed(3.5, 'imperial'), 7.8);
assert.equal(windSpeed(3.5, 'metric'), 3.5);
assert.equal(windSpeed(0, 'imperial'), 0);
console.log('Seven unit conversion regression checks passed.');
