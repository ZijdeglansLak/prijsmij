const Jimp = require('jimp');

async function main() {
  const img = await Jimp.read('/home/runner/workspace/artifacts/marketplace/public/images/hero-bg.png');
  const w = img.bitmap.width;
  const h = img.bitmap.height;
  
  // Look for price tag sticker colors: bright yellow/amber (high R+G, low B)
  // and also look for the white/near-white text ON those tags
  // Use ImageMagick to examine specific pixel regions
  
  // Find yellow sticker regions: R>200, G>180, B<100
  const yellow = [];
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const idx = (y * w + x) * 4;
      const r = img.bitmap.data[idx];
      const g = img.bitmap.data[idx+1];
      const b = img.bitmap.data[idx+2];
      const a = img.bitmap.data[idx+3];
      if (a > 180 && r > 200 && g > 170 && b < 100) {
        yellow.push({x, y, r, g, b});
      }
    }
  }
  console.log('Yellow sticker pixels:', yellow.length);
  
  // Also look for lighter yellow (price tag labels can be light colored)
  const lightYellow = [];
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const idx = (y * w + x) * 4;
      const r = img.bitmap.data[idx];
      const g = img.bitmap.data[idx+1];
      const b = img.bitmap.data[idx+2];
      const a = img.bitmap.data[idx+3];
      // Light/bright color that could be a label
      if (a > 200 && r > 220 && g > 200 && b > 100 && b < 180 && Math.abs(r-g) < 40) {
        lightYellow.push({x, y, r, g, b});
      }
    }
  }
  console.log('Light yellow pixels:', lightYellow.length);
  
  // Sample some pixel colors at key positions from the screenshot
  const checkPoints = [
    {x: 560, y: 50, label: 'upper-center top'},
    {x: 580, y: 100, label: 'upper-center mid'},
    {x: 600, y: 150, label: 'upper-center lower'},
    {x: 900, y: 50, label: 'upper-right top'},
    {x: 950, y: 100, label: 'upper-right mid'},
    {x: 1000, y: 200, label: 'upper-right lower'},
    {x: 1100, y: 400, label: 'right mid'},
    {x: 1200, y: 500, label: 'lower-right'},
    {x: 1100, y: 600, label: 'lower-right 2'},
  ];
  console.log('\nSampled pixels:');
  for (const p of checkPoints) {
    const idx = (p.y * w + p.x) * 4;
    const r = img.bitmap.data[idx];
    const g = img.bitmap.data[idx+1];
    const b = img.bitmap.data[idx+2];
    const a = img.bitmap.data[idx+3];
    console.log(`  ${p.label} (${p.x},${p.y}): rgb(${r},${g},${b}) a=${a}`);
  }
  
  if (yellow.length > 0) {
    const grid = {};
    for (const p of yellow) {
      const k = `${Math.floor(p.x/50)},${Math.floor(p.y/50)}`;
      if (!grid[k]) grid[k] = { count: 0, xs: [], ys: [], r:p.r, g:p.g, b:p.b };
      grid[k].count++;
      grid[k].xs.push(p.x);
      grid[k].ys.push(p.y);
    }
    const entries = Object.entries(grid).filter(([,v]) => v.count > 50).sort((a,b) => b[1].count - a[1].count);
    console.log('\nYellow clusters (>50px):');
    for (const [k, v] of entries.slice(0,20)) {
      const mx = Math.round(v.xs.reduce((a,b)=>a+b,0)/v.xs.length);
      const my = Math.round(v.ys.reduce((a,b)=>a+b,0)/v.ys.length);
      console.log(`  grid(${k}) center=(${mx},${my}) count=${v.count} rgb(${v.r},${v.g},${v.b})`);
    }
  }
}
main().catch(console.error);
