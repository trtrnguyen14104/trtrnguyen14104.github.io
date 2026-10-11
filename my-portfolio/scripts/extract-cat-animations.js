/**
 * extract-cat-animations.js
 *
 * Extracts individual cat animations from Cat_playing_animation_extended.json:
 * 1. Cat_sleeping_animation.json: frames 122 -> 212 (marker "Ngu gat")
 * 2. Cat_butterfly_animation.json: frames 300 -> 392 (marker "Duoi buom")
 */

const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const sourcePath = path.join(projectRoot, 'public', 'animations', 'Cat_playing_animation_extended.json');
const raw = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));

// Helper to slice keyframes within [startFrame, endFrame] and adjust timing
function sliceKeyframes(keyframes, startFrame, endFrame) {
  if (!Array.isArray(keyframes) || keyframes.length === 0) return keyframes;

  const inRange = [];
  const beforeKFs = keyframes.filter(k => k.t < startFrame);
  const activeKFs = keyframes.filter(k => k.t >= startFrame && k.t <= endFrame);

  let initialKF = null;
  if (beforeKFs.length > 0) {
    const lastBefore = beforeKFs[beforeKFs.length - 1];
    initialKF = JSON.parse(JSON.stringify(lastBefore));
    initialKF.t = startFrame;
  }

  const exactStart = keyframes.find(k => k.t === startFrame);
  if (exactStart) {
    initialKF = null;
  }

  if (initialKF) {
    inRange.push(initialKF);
  }
  activeKFs.forEach(k => inRange.push(JSON.parse(JSON.stringify(k))));

  // Shift all 't' timestamps so animation starts at 0
  inRange.forEach(k => {
    k.t = Math.max(0, k.t - startFrame);
  });

  return inRange;
}

function processProperty(prop, startFrame, endFrame) {
  if (!prop || typeof prop !== 'object') return prop;
  if (prop.a === 1 && Array.isArray(prop.k)) {
    prop.k = sliceKeyframes(prop.k, startFrame, endFrame);
  }
  return prop;
}

function sliceLottie(source, startFrame, endFrame, excludeLayers = []) {
  const result = JSON.parse(JSON.stringify(source));
  const duration = endFrame - startFrame;
  result.ip = 0;
  result.op = duration;
  delete result.markers;

  // Filter out unwanted layers for this specific animation
  result.layers = result.layers.filter(l => !excludeLayers.includes(l.nm));

  result.layers.forEach(l => {
    // Shift in/out points
    l.ip = Math.max(0, Math.min(duration, l.ip - startFrame));
    l.op = Math.max(0, Math.min(duration, l.op - startFrame));
    if (l.op === 0 && l.ip === 0) {
      l.op = duration;
    }

    // Process layer transform properties
    if (l.ks) {
      ['o', 'r', 'p', 'a', 's'].forEach(pName => {
        if (l.ks[pName]) {
          processProperty(l.ks[pName], startFrame, endFrame);
        }
      });
    }

    // Process shape properties recursively
    function walkShapes(items) {
      if (!Array.isArray(items)) return;
      items.forEach(it => {
        if (it.it) walkShapes(it.it);
        ['p', 's', 'r', 'o', 'w', 'd'].forEach(pName => {
          if (it[pName]) processProperty(it[pName], startFrame, endFrame);
        });
      });
    }
    if (l.shapes) walkShapes(l.shapes);
  });

  return result;
}

// 1. Sleeping cat: frames 122..212 (90 frames)
const sleepJson = sliceLottie(raw, 122, 212, [
  'ball',
  'Butterfly',
  'Lick',
  'Happy arc R',
  'Happy arc L',
]);

// 2. Butterfly chasing cat: frames 300..392 (92 frames)
const butterflyJson = sliceLottie(raw, 300, 392, [
  'ball',
  'Z 1',
  'Z 2',
  'Z 3',
  'Sleep arc R',
  'Sleep arc L',
  'Happy arc R',
  'Happy arc L',
  'Lick',
]);

const outDir = path.join(projectRoot, 'public', 'animations');
const sleepDest = path.join(outDir, 'Cat_sleeping_animation.json');
const butterflyDest = path.join(outDir, 'Cat_butterfly_animation.json');

fs.writeFileSync(sleepDest, JSON.stringify(sleepJson));
fs.writeFileSync(butterflyDest, JSON.stringify(butterflyJson));

console.log(`Successfully extracted:`);
console.log(`- ${sleepDest} (${sleepJson.layers.length} layers, ${sleepJson.op} frames)`);
console.log(`- ${butterflyDest} (${butterflyJson.layers.length} layers, ${butterflyJson.op} frames)`);

