export function lerp(start, end, factor) {
  return start + (end - start) * factor;
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function degToRad(degrees) {
  return degrees * (Math.PI / 180);
}

export function radToDeg(radians) {
  return radians * (180 / Math.PI);
}

export function getForwardVector(rotation) {
  return [
    Math.sin(rotation[1]),
    0,
    Math.cos(rotation[1])
  ];
}

export function getRightVector(rotation) {
  return [
    Math.cos(rotation[1]),
    0,
    -Math.sin(rotation[1])
  ];
}
