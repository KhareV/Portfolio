// Star positions: `count` points uniformly inside a sphere, stored as complete
// XYZ triples (length === count * 3). The previous code allocated 2,200 floats
// — 733⅓ points — which produced a NaN bounding sphere.
export function starPositions(count, radius = 1.1, rand = Math.random) {
  const out = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    // rejection sampling inside the unit sphere
    let x, y, z, d;
    do {
      x = rand() * 2 - 1;
      y = rand() * 2 - 1;
      z = rand() * 2 - 1;
      d = x * x + y * y + z * z;
    } while (d > 1 || d === 0);
    out[i * 3] = x * radius;
    out[i * 3 + 1] = y * radius;
    out[i * 3 + 2] = z * radius;
  }
  return out;
}
