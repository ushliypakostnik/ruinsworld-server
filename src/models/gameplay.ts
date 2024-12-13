export enum Races {
    // Players
    human = 'human',
    reptiloid = 'reptiloid',
  
    // NPC
    // bidens = 'bidens',
    mutant = 'mutant',
    orc = 'orc',
    zombie = 'zombie',
    soldier = 'soldier',
    cyborg = 'cyborg',
  }

  export enum Things {
    // Simple
    grenades = 'grenades',
    vodka = 'vodka',
    stew = 'stew',

    // Rare
    go = 'go'
  }

  export enum ThingsSimple {
    grenades = 'grenades',
    vodka = 'vodka',
    stew = 'stew',
  }

  export enum ThingsRare {
    go = 'go'
  }

  export const RacesConfigAPI = {
    [Races.human]: {
      kick: 1,
      attack: 1,
      regeneration: 1,
      intelligence: 1,
      armor: 1.2,
      exp: 0,
      toxic: 0,
      speed: 1,
    },
    [Races.reptiloid]: {
      kick: 1,
      attack: 1,
      regeneration: 1,
      intelligence: 1,
      armor: 1.2,
      exp: 0,
      toxic: 0,
      speed: 1,
    },
    [Races.mutant]: {
      kick: 2.2,
      attack: 1.6,
      regeneration: 2.4,
      intelligence: 2,
      armor: 3.4,
      exp: 40,
      toxic: 20,
      speed: 0.65,
    },
    [Races.orc]: {
      kick: 2.4,
      attack: 2,
      regeneration: 2.2,
      intelligence: 1.8,
      armor: 2.8,
      exp: 30,
      toxic: 6,
      speed: 0.6,
    },
    [Races.zombie]: {
      kick: 1,
      attack: 2.5,
      regeneration: 6,
      intelligence: 1.4,
      armor: 1,
      exp: 10,
      toxic: 4,
      speed: 0.5,
    },
    [Races.soldier]: {
      kick: 2.5,
      attack: 2.7,
      regeneration: 3,
      intelligence: 2.2,
      armor: 2,
      toxic: 2,
      exp: 20,
      speed: 0.5,
    },
  }

  export const RacesConfig = {
    [Races.human]: {
      name: Races.human,
      enemy: [Races.reptiloid, /* Races.bidens, */ Races.mutant, Races.orc, Races.zombie, Races.soldier],
      playerEnemy: [Races.reptiloid],
      important: [Races.reptiloid],

      ...RacesConfigAPI[`${[Races.human]}`],

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
      kickTime: 1,
      attackTime: 2.4,
    },
    [Races.reptiloid]: {
      name: Races.reptiloid,
      enemy: [Races.reptiloid, /* Races.bidens, */ Races.mutant, Races.orc, Races.zombie, Races.cyborg],
      playerEnemy: [Races.reptiloid],
      important: [Races.human],

      ...RacesConfigAPI[`${[Races.reptiloid]}`],

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
      kickTime: 1,
      attackTime: 2.4,
    },
    /*
    [Races.bidens]: {
      name: Races.bidens,
      enemy: [Races.human, Races.reptiloid, Races.mutant, Races.orc, Races.soldier, Races.cyborg],
      playerEnemy: [Races.reptiloid, Races.human],
      important: [Races.human, Races.reptiloid, Races.mutant, Races.orc],

      ...RacesConfigAPI[`${[Races.bidens]}`],

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
      kickTime: 0.3,
      attackTime: 2.4,
    }, */
    [Races.mutant]: {
      name: Races.mutant,
      enemy: [Races.human, Races.reptiloid, /* Races.bidens, */ Races.orc, Races.cyborg, Races.soldier],
      playerEnemy: [Races.reptiloid, Races.human],
      important: [Races.human, Races.reptiloid, Races.orc],

      ...RacesConfigAPI[`${[Races.mutant]}`],

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
      kickTime: 0.35,
      attackTime: 2.7,
    },
    [Races.orc]: {
      name: Races.orc,
      enemy: [Races.human, Races.reptiloid, /* Races.bidens, */ Races.mutant, Races.soldier, Races.cyborg],
      playerEnemy: [Races.reptiloid, Races.human],
      important: [Races.human, Races.reptiloid, Races.mutant],

      ...RacesConfigAPI[`${[Races.orc]}`],

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
      kickTime: 0.55,
      attackTime: 2.15,
    },
    [Races.zombie]: {
      name: Races.zombie,
      enemy: [Races.human, Races.reptiloid, Races.soldier, Races.cyborg],
      playerEnemy: [Races.reptiloid, Races.human],
      important: [Races.human, Races.reptiloid],

      ...RacesConfigAPI[`${[Races.zombie]}`],

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
      kickTime: 0.5,
      attackTime: 2.4,
    },
    [Races.soldier]: {
      name: Races.soldier,
      enemy: [Races.human, /* Races.bidens, */ Races.zombie, Races.cyborg, Races.orc, Races.mutant],
      playerEnemy: [Races.human],
      important: [Races.human, Races.cyborg],

      ...RacesConfigAPI[`${[Races.soldier]}`],

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
      kickTime: 0.7,
      attackTime: 2.15,
    },
    [Races.cyborg]: {
      name: Races.cyborg,
      enemy: [Races.reptiloid, /* Races.bidens, */ Races.zombie, Races.soldier, Races.orc, Races.mutant],
      playerEnemy: [Races.reptiloid],
      important: [Races.reptiloid, Races.soldier],

      ...RacesConfigAPI[`${[Races.soldier]}`],

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
      kickTime: 0.7,
      attackTime: 2.15,
    },
  };

  export const ThingsConfig = {
    [Things.grenades]: {
      pick: 30, // Содержит единиц
      start: 50,
      max: 150,
      exp: 3,
    },
    [Things.vodka]: {
      health: 25,
      exp: 5,
      exp2: -20, // onUse
      toxic: -50,
      food: -5,
      water: -10,
      max: 5,
    },
    [Things.stew]: {
      health: 50,
      exp: 5,
      exp2: -20, // onUse
      toxic: -15,
      food: 33,
      water: -5,
      max: 5,
    },
    [Things.go]: {
      exp: 750,
    },
  };

  export enum Lifecycle {
    born = 'born',
    idle = 'idle',
    attention = 'attention',
    attack = 'attack',
    dead = 'dead',
  }

  export enum Picks {
    dead = 'dead',
    thing = 'thing',
  }

  export enum Damages {
    kick = 'kick',
    light = 'light',
    shot = 'shot',
  }

  export enum Moves {
    right = 'right',
    left = 'left',
    top = 'top',
    bottom = 'bottom',
  }

  export enum Animations {
    // Stand
    stand = 'stand',
    standforward = 'standforward',
    standback = 'standback',
    standleft = 'standleft',
    standright = 'standright',

    run = 'run',
    back = 'back',
  
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