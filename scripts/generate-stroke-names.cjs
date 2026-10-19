// Usage: node scripts/generate-stroke-names.cjs <unpacked cnchar-order/package> <unpacked hanzi-writer-data/package>
// Pinned sources: cnchar-order 3.2.6 (MIT), hanzi-writer-data 2.0.1.
const fs = require('node:fs');
const path = require('node:path');
const { dict } = require(path.resolve(process.argv[2], 'cnchar.order.min.js'));
const sources = ['src/data/level-character-seeds.ts', 'src/apps/grade-1c/curriculum.ts'];
const characters = new Set(sources.flatMap(file => [...fs.readFileSync(file, 'utf8').matchAll(/hanzi: "([^"]+)"/g)].flatMap(match => [...match[1]].filter(char => /\p{Script=Han}/u.test(char)))));
const codes = {a:'hzzp',b:'sz',c:'hz',d:'d',o:'hxg',j:'h',l:'n',r:'hzg',f:'s',g:'sg',k:'d',s:'p',n:'pz',x:'szz',w:'hzzzg',z:'szzg',i:'t',t:'wg',y:'xg',v:'hzw',e:'hp',p:'hzt',q:'hzzz',h:'st',m:'pd',u:'swg'};
// cnchar groups several shapes under one code. Resolve the variants for our
// characters explicitly, rather than teaching the alternative name randomly.
const horizontalHooks = {
  '亮':[6], '爱':[5], '家':[2], '雪':[2], '蜜':[2], '学':[4], '觉':[4], '写':[1],
  '穿':[2], '宝':[2], '字':[2], '停':[8], '空':[2], '院':[4], '雷':[2], '旁':[5],
  '它':[2], '安':[2], '饭':[1], '饱':[1],
};
const output = {};
for (const char of [...characters].sort()) {
  if (!dict.orders[char]) throw Error(`Missing names: ${char}`);
  const order = [...dict.orders[char]].map(code => codes[code]);
  const drawing = JSON.parse(fs.readFileSync(path.join(process.argv[3], `${char}.json`)));
  if (order.length !== drawing.strokes.length || order.includes(undefined)) throw Error(`Stroke mismatch: ${char}`);
  for (const index of horizontalHooks[char] ?? []) {
    if (order[index] !== 'hp') throw Error(`Hook index changed: ${char} ${index}`);
    order[index] = 'hg';
  }
  if ('四西'.includes(char)) order[dict.orders[char].indexOf('b')] = 'sw';
  if (char !== '飞' && dict.orders[char].includes('o')) order[dict.orders[char].indexOf('o')] = 'hzwg';
  // 心 component has a reclining hook; 阝 has a horizontal-left falling curved hook.
  if ('心想念蜜'.includes(char)) order[dict.orders[char].indexOf('y')] = 'wog';
  if ('阳啊那都院'.includes(char)) order[dict.orders[char].indexOf('w')] = 'hpwg';
  output[char] = order;
}
fs.writeFileSync('src/data/character-strokes.json', '{\n' + Object.entries(output).map(([char, ids]) => '  ' + JSON.stringify(char) + ': ' + JSON.stringify(ids)).join(',\n') + '\n}\n');
console.log(`Verified stroke counts for ${characters.size} characters.`);
