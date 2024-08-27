export enum Races {
    // Players
    human = 'human',
    reptiloid = 'reptiloid',
  
    // NPC
    bidens = 'bidens',
    mutant = 'mutant',
    orc = 'orc',
    zombie = 'zombie',
    soldier = 'soldier',
    cyborg = 'cyborg',
  }

  export const RacesConfig = {
    [Races.human]: {
      name: Races.human,
      enemy: [Races.reptiloid, Races.bidens, Races.mutant, Races.orc, Races.zombie, Races.soldier],
      playerEnemy: [Races.reptiloid],
      important: [Races.reptiloid],
      box: { x: 0.6, y: 1.8, z: 0.75 },
      animations: {
        jump: 0,
        kick: 0,
        hit: 0,
        cry: 0,
        attack: 0,
        dead: 0,
      },
      jump: 40,

      speed: 1,
      kick: 1,
      attack: 1,
      regeneration: 1,
      intelligence: 1,
      armor: 1.2,

      kickTime: 1,
      attackTime: 2.4,
    },
    [Races.reptiloid]: {
      name: Races.reptiloid,
      enemy: [Races.reptiloid, Races.bidens, Races.mutant, Races.orc, Races.zombie, Races.cyborg],
      playerEnemy: [Races.reptiloid],
      important: [Races.human],
      box: { x: 0.6, y: 1.8, z: 0.75 },
      animations: {
        jump: 0,
        kick: 0,
        hit: 0,
        cry: 0,
        attack: 0,
        dead: 0,
      },
      jump: 40,
      speed: 1,
      kick: 1,
      attack: 1,
      regeneration: 1,
      intelligence: 1,
      armor: 1.2,

      kickTime: 1,
      attackTime: 2.4,
    },
    [Races.bidens]: {
      name: Races.bidens,
      enemy: [Races.human, Races.reptiloid, Races.mutant, Races.orc, Races.soldier, Races.cyborg],
      playerEnemy: [Races.reptiloid, Races.human],
      important: [Races.human, Races.reptiloid, Races.mutant, Races.orc],
      box: { x: 4.5, y: 9.7, z: 3 },
      animations: {
        jump: 3.200000047683716,
        kick: 3.4000000953674316,
        hit: 2.0333333015441895,
        cry: 5.433333396911621,
        attack: 4.666666507720947,
        dead: 3.6666667461395264,
      },
      jump: 30,
      speed: 0.7,
      kick: 2.5,
      attack: 2,
      regeneration: 1,
      intelligence: 1.25,
      armor: 2.8,

      kickTime: 0.3,
      attackTime: 2.4,
    },
    [Races.mutant]: {
      name: Races.mutant,
      enemy: [Races.human, Races.reptiloid, Races.bidens, Races.orc, Races.cyborg, Races.soldier],
      playerEnemy: [Races.reptiloid, Races.human],
      important: [Races.human, Races.reptiloid, Races.orc],
      box: { x: 4, y: 5, z: 2.5 },
      animations: {
        jump: 4.133333206176758,
        kick: 3.4000000953674316,
        hit: 2.0333333015441895,
        cry: 2.8333332538604736,
        attack: 2.700000047683716,
        dead: 4.633333206176758,
      },
      jump: 25,
      speed: 0.65,
      kick: 2,
      attack: 1.6,
      regeneration: 1.5,
      intelligence: 1.7,
      armor: 2.7,

      kickTime: 0.35,
      attackTime: 2.7,
    },
    [Races.orc]: {
      name: Races.orc,
      enemy: [Races.human, Races.reptiloid, Races.bidens, Races.mutant, Races.soldier, Races.cyborg],
      playerEnemy: [Races.reptiloid, Races.human],
      important: [Races.human, Races.reptiloid, Races.mutant],
      box: { x: 2, y: 3.6, z: 1.5 },
      animations: {
        jump: 2.700000047683716,
        kick: 2.5333333015441895,
        hit: 1.2000000476837158,
        cry: 2.8333332538604736,
        attack: 2.6666667461395264,
        dead: 3.6666667461395264,
      },
      jump: 20,
      speed: 0.6,
      kick: 1.9,
      attack: 1.8,
      regeneration: 4,
      intelligence: 1.6,
      armor: 2.6,

      kickTime: 0.55,
      attackTime: 2.15,
    },
    [Races.zombie]: {
      name: Races.zombie,
      enemy: [Races.human, Races.reptiloid, Races.soldier, Races.cyborg],
      playerEnemy: [Races.reptiloid, Races.human],
      important: [Races.human, Races.reptiloid],
      box: { x: 0.6, y: 1.9, z: 0.75 },
      animations: {
        jump: 3.200000047683716,
        kick: 3.4000000953674316,
        hit: 2.0333333015441895,
        cry: 2.8333332538604736,
        attack: 2.6666667461395264,
        dead: 4.9666666984558105,
      },
      jump: 15,
      speed: 0.55,
      kick: 1,
      attack: 2.5,
      regeneration: 7,
      intelligence: 1.25,
      armor: 1,

      kickTime: 0.5,
      attackTime: 2.4,
    },
    [Races.soldier]: {
      name: Races.soldier,
      enemy: [Races.human, Races.bidens, Races.zombie, Races.cyborg, Races.orc, Races.mutant],
      playerEnemy: [Races.human],
      important: [Races.human, Races.cyborg],
      box: { x: 0.6, y: 1.8, z: 0.75 },
      animations: {
        jump: 1.7000000476837158,
        kick: 2,
        hit: 0.800000011920929,
        cry: 4.333333492279053,
        attack: 0.23333333432674408,
        dead: 4.366666793823242,
      },
      jump: 15,
      speed: 0.6,
      kick: 2.5,
      attack: 2.3,
      regeneration: 4,
      intelligence: 1.5,
      armor: 2.4,

      kickTime: 0.7,
      attackTime: 2.15,
    },
    [Races.cyborg]: {
      name: Races.cyborg,
      enemy: [Races.reptiloid, Races.bidens, Races.zombie, Races.soldier, Races.orc, Races.mutant],
      playerEnemy: [Races.reptiloid],
      important: [Races.reptiloid, Races.soldier],
      box: { x: 1.2, y: 2.8, z: 1.1 },
      animations: {
        jump: 1.9333332777023315,
        kick: 1.7000000476837158,
        hit: 1.600000023841858,
        cry: 4.333333492279053,
        attack: 0.23333333432674408,
        dead: 3.6666667461395264,
      },
      jump: 20,
      speed: 0.55,
      kick: 2.2,
      attack: 2.5,
      regeneration: 3,
      intelligence: 1.8,
      armor: 2.3,

      kickTime: 0.4,
      attackTime: 2.15,
    },
  };

  export enum Lifecycle {
    born = 'born',
    idle = 'idle',
    attention = 'attention',
    attack = 'attack',
    dead = 'dead',
  }

  export enum Pick {
    dead = 'dead',
    thing = 'thing',
  }

  export enum Animations {
    // Stand
    stand = 'stand',
    standforward = 'standforward',
    standback = 'standback',
    standleft = 'standleft',
    standright = 'standright',
    run = 'run',
  
    // Hide
    hide = 'hide',
    hideback = 'hideback',
    hideleft = 'hideleft',
    hideright = 'hideright',
    hideforward = 'hideforward',
  
    // Fire
    firestand = 'firestand',
    firestandforward = 'firestandforward',
    firehide = 'firehide',
    firehideforward = 'firehideforward',
  
    // Others
    hit = 'hit',
    jump = 'jump',
    dead = 'dead',
  
    // NPC
    idle = 'idle',
    walking = 'walking',
    kick = 'kick',
    cry = 'cry',
    attack = 'attack',
  }

  export enum Actions {
    jump = 'jump',
    walk = 'walk',
    kick = 'walk',
    back = 'back',
  }