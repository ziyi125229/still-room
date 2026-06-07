#!/usr/bin/env node
// 把 index.html + img/*.jpg 打包成一个可离线双击打开、可分享的单文件 HTML。
// 用法：node build-offline.js   → 输出到 ~/Desktop/still-room-offline.html
const fs = require('fs'), path = require('path'), os = require('os');
const root = __dirname;

let h = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

const ids = ['forest', 'sakura', 'cafe', 'sea', 'rain', 'fire'];
const photos = {};
ids.forEach(id => {
  const f = path.join(root, 'img', id + '.jpg');
  photos[id] = 'data:image/jpeg;base64,' + fs.readFileSync(f).toString('base64');
});

// 1) 主脚本前注入内嵌图片字典
const inject = '<script>window.__PHOTOS=' + JSON.stringify(photos) + ';</script>\n';
h = h.replace('<script>', inject + '<script>');

// 2) 让照片背景优先用内嵌图（找不到再回退到 img/ 路径）
const target = "|| 'img/'+sc.id+'.jpg'";
if (!h.includes(target)) {
  console.error('⚠️  没找到照片引用字符串，照片可能不会内嵌——检查 index.html 是否改过该行');
}
h = h.replace(target, "|| ((window.__PHOTOS&&window.__PHOTOS[sc.id])||'img/'+sc.id+'.jpg')");

const out = path.join(os.homedir(), 'Desktop', 'still-room-offline.html');
fs.writeFileSync(out, h);
console.log('✓ 已生成单文件:', out, '(' + (fs.statSync(out).size / 1048576).toFixed(2) + ' MB)');
