export const Level1 = {
  name: '第一关 - 新手训练',
  difficulty: 1,
  targetScore: 500,
  
  waves: [
    {
      time: 0,
      type: 'small',
      count: 3,
      spawnDelay: 500
    },
    {
      time: 3000,
      type: 'small',
      count: 5,
      spawnDelay: 400
    },
    {
      time: 6000,
      type: 'small',
      count: 4,
      spawnDelay: 300
    },
    {
      time: 9000,
      type: 'medium',
      count: 2,
      spawnDelay: 800
    },
    {
      time: 12000,
      type: 'small',
      count: 6,
      spawnDelay: 300
    },
    {
      time: 15000,
      type: 'medium',
      count: 3,
      spawnDelay: 600
    },
    {
      time: 18000,
      type: 'small',
      count: 5,
      spawnDelay: 200
    },
    {
      time: 20000,
      type: 'large',
      count: 1,
      spawnDelay: 0
    }
  ]
};
