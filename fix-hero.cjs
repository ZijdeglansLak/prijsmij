const Jimp = require('jimp');

async function main() {
  const img = await Jimp.read('/home/runner/workspace/artifacts/marketplace/public/images/hero-bg.png');
  console.log('Size:', img.bitmap.width, 'x', img.bitmap.height);
  
  const w = img.bitmap.width;
  const h = img.bitmap.height;
  
  // Find orange/yellow price tag regions
  const orange = [];
  for (let y = 0; y < h; y += 2) {
    for (let x = 0; x < w; x += 2) {
      const idx = (y * w + x) * 4;
      const r = img.bitmap.data[idx];
      const g = img.bitmap.data[idx+1];
      const b = img.bitmap.data[idx+2];
      const a = img.bitmap.data[idx+3];
      if (a > 100 && r > 180 && r > g + 30 && b < 120) {
        orange.push({x, y, r, g, b});
      }
    }
  }
  console.log('Orange pixels found:', orange.length);
  if (orange.length > 0) {
    const xs = orange.map(p => p.x);
    const ys = orange.map(p => p.y);
    console.log('X:', Math.min(...xs), '-', Math.max(...xs));
    console.log('Y:', Math.min(...ys), '-', Math.max(...ys));
    // Cluster by 80px grid
    const grid = {};
    for (const p of orange) {
      const k = `${Math.floor(p.x/80)},${Math.floor(p.y/80)}`;
      if (!grid[k]) grid[k] = { count: 0, xs: [], ys: [] };
      grid[k].count++;
      grid[k].xs.push(p.x);
      grid[k].ys.push(p.y);
    }
    const entries = Object.entries(grid).filter(([,v]) => v.count > 10).sort((a,b) => b[1].count - a[1].count);
    console.log('\nClusters (>10 px):');
    for (const [k, v] of entries.slice(0,15)) {
      const mx = Math.round(v.xs.reduce((a,b)=>a+b,0)/v.xs.length);
      const my = Math.round(v.ys.reduce((a,b)=>a+b,0)/v.ys.length);
      console.log(`  grid(${k}) center=(${mx},${my}) count=${v.count}`);
    }
  }
}
main().catch(console.error);
