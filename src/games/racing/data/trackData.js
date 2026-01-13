export const TRACK_DATA = {
  name: '基础赛道',
  width: 20,
  
  segments: [
    { type: 'straight', length: 50, position: [0, 0, 0] },
    { type: 'curve', radius: 30, angle: 90, direction: 'left', position: [0, 0, -50] },
    { type: 'straight', length: 40, position: [-30, 0, -80] },
    { type: 'curve', radius: 25, angle: 90, direction: 'left', position: [-30, 0, -120] },
    { type: 'straight', length: 50, position: [-55, 0, -95] },
    { type: 'curve', radius: 30, angle: 90, direction: 'left', position: [-105, 0, -95] },
    { type: 'straight', length: 40, position: [-75, 0, -65] },
    { type: 'curve', radius: 25, angle: 90, direction: 'left', position: [-75, 0, -25] },
  ],
  
  checkpoints: [
    { position: [0, 0.5, -25], index: 0 },
    { position: [-15, 0.5, -65], index: 1 },
    { position: [-55, 0.5, -107], index: 2 },
    { position: [-90, 0.5, -80], index: 3 },
    { position: [-75, 0.5, -45], index: 4 },
    { position: [-30, 0.5, -10], index: 5 },
  ],
  
  startPosition: [0, 1, 5],
  startRotation: [0, Math.PI, 0],
};
