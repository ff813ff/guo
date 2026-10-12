const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, 'models');
const outputFile = path.join(__dirname, 'data.js');

let modelsData = [];

if (fs.existsSync(modelsDir)) {
  const dirs = fs.readdirSync(modelsDir).filter(f => {
    return fs.statSync(path.join(modelsDir, f)).isDirectory() && !f.startsWith('.');
  });
  
  dirs.forEach(dir => {
    const modelPath = path.join(modelsDir, dir);
    const files = fs.readdirSync(modelPath).filter(f => !f.startsWith('.'));
    
    // 自动分类：视频优先，图片其次
    const videos = files.filter(f => /\.(mp4|mov|webm)$/i.test(f));
    const images = files.filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f));
    const allFiles = [...videos, ...images];
    
    // 自动抓取封面，找 cover，没有就拿第一张图，再没有就拿第一个视频
    let cover = files.find(f => f.toLowerCase().includes('cover'));
    if (!cover && images.length > 0) cover = images[0];
    if (!cover && videos.length > 0) cover = videos[0];
    if (!cover) cover = '';

    modelsData.push({
      id: dir,
      name: dir,
      cover: cover ? `models/${dir}/${cover}` : '',
      files: allFiles.map(f => `models/${dir}/${f}`)
    });
  });
}

// 自动写入 data.js
fs.writeFileSync(outputFile, `const modelsData = ${JSON.stringify(modelsData, null, 2)};\n`);
console.log('✅ 扫描完成，已自动生成 data.js');