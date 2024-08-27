// Utils
import Helper from '../../utils/helper';

export const BUILDS_GENERATION = [
  [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
  [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
  [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
  [ 0, 0, 0, 2, 3, 3, 3, 2, 0, 0, 0 ],
  [ 0, 0, 0, 3, 6, 6, 6, 3, 0, 0, 0 ],
  [ 0, 0, 0, 3, 6, 12, 6, 3, 0, 0, 0 ],
  [ 0, 0, 0, 3, 6, 6, 6, 3, 0, 0, 0 ],
  [ 0, 0, 0, 2, 3, 3, 3, 2, 0, 0, 0 ],
  [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
  [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
  [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
];

/*
export const HOUSES_GENERATION = [
  [ 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2 ],
  [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ],
  [ 1, 1, 2, 2, 2, 2, 2, 2, 2, 1, 1 ],
  [ 1, 1, 2, 2, 3, 3, 3, 2, 2, 1, 1 ],
  [ 1, 1, 2, 3, 4, 4, 4, 3, 2, 1, 1 ],
  [ 2, 1, 2, 3, 4, 5, 4, 2, 1, 1, 2 ],
  [ 1, 1, 2, 3, 4, 4, 4, 3, 2, 1, 1 ],
  [ 1, 1, 2, 2, 3, 3, 3, 2, 2, 1, 1 ],
  [ 1, 1, 2, 2, 2, 2, 2, 2, 2, 1, 1 ],
  [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ],
  [ 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2 ],
];
*/

export const STONES_GENERATION = [
  [ 7, 9, 9, 11, 9, 9, 7, 5, 5, 7, 7 ],
  [ 9, 7, 7, 7, 5, 9, 7, 5, 5, 5, 7 ],
  [ 9, 5, 7, 7, 3, 5, 5, 5, 3, 5, 7 ],
  [ 9, 7, 7, 5, 3, 5, 7, 3, 3, 5, 7 ],
  [ 9, 7, 5, 3, 5, 7, 7, 5, 5, 5, 7 ],
  [ 9, 9, 7, 5, 7, 9, 7, 5, 7, 7, 9 ],
  [ 9, 9, 9, 9, 9, 7, 5, 3, 3, 5, 9 ],
  [ 9, 11, 11, 11, 9, 9, 9, 7, 5, 5, 9 ],
  [ 9, 11, 11, 11, 9, 9, 7, 7, 7, 7, 9 ],
  [ 9, 11, 11, 11, 9, 9, 9, 7, 7, 7, 9 ],
  [ 9, 9, 9, 9, 9, 9, 7, 9, 7, 7, 7 ],
];

export const GREEN_GENERATION = [
  [ 12, 9, 12, 16, 12, 12, 9, 6, 6, 9, 12 ],
  [ 12, 9, 9, 9, 6, 12, 12, 16, 20, 24, 16 ],
  [ 9, 6, 9, 9, 6, 6, 9, 12, 16, 24, 20 ],
  [ 12, 9, 9, 6, 9, 6, 9, 9, 12, 20, 16 ],
  [ 12, 9, 6, 9, 6, 9, 9, 9, 12, 16, 16 ],
  [ 9, 12, 9, 6, 9, 9, 9, 9, 12, 16, 12 ],
  [ 9, 6, 6, 6, 6, 9, 6, 9, 6, 9, 12 ],
  [ 9, 3, 3, 3, 6, 9, 12, 9, 6, 6, 12 ],
  [ 9, 6, 3, 9, 6, 9, 9, 9, 9, 9, 12 ],
  [ 9, 9, 6, 6, 6, 6, 6, 9, 9, 9, 12 ],
  [ 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9 ],
];

const getRandomGround = (x: number, y: number): string => {
  let string;
  const groundNumber = Helper.randomInteger(1, 4);

  if (x < -1 && y > 1) string = 'soil';
  else if (x > 1 && y < -1) string = 'grass';
  else if ((x < -1 && y < -1) || (x > 1 && y > 1)) string = 'sand';
  else {
    const groundType = Helper.randomInteger(1, 3);
    switch (groundType) {
      case 1:
        string = 'soil';
        break;
      case 2:
        string = 'grass';
        break;
      case 3:
      default:
        string = 'sand';
        break;
    }
  }

  return string + groundNumber;
};

export const defaultLocation = (x: number, y: number) => {
  let name;
  if (x < -1 && y > 1) {
    name = {
      ru: 'Постапокалиптическая возвышенность',
      en: 'Post-apocalyptic elevation',
    }
  } else if (x > 1 && y < -1) {
    name = {
      ru: 'Постапокалиптические болота',
      en: 'Post-apocalyptic swamps',
    };
  } else {
    name = {
      ru: 'Постапокалиптическая пустыня',
      en: 'Post-apocalyptic desert',
    };
  }

  return {
    name,
    ground: getRandomGround(x, y),
  }
};

// Внимание!!! Y/X !!!
export const MAP = {
  '-3/-3': {
    name: {
      ru: 'Командный пункт Выживших',
      en: 'Survivor Command Post',
    },
    ground: 'sand1',
  },
  '-3/-2': {
    name: {
      ru: 'Постапокалиптическая пустыня',
      en: 'Post-apocalyptic desert',
    },
    ground: 'sand1',
  },
  '-3/-1': {
    name: {
      ru: 'Постапокалиптическая пустыня',
      en: 'Post-apocalyptic desert',
    },
    ground: 'sand1',
  },
  '-3/0': {
    name: {
      ru: 'Постапокалиптическая пустыня',
      en: 'Post-apocalyptic desert',
    },
    ground: 'soil1',
  },
  '-3/1': {
    name: {
      ru: 'Постапокалиптическая пустыня',
      en: 'Post-apocalyptic desert',
    },
    ground: 'soil1',
  },
  '-3/2': {
    name: {
      ru: 'Постапокалиптическая пустыня',
      en: 'Post-apocalyptic desert',
    },
    ground: 'soil1',
  },
  '-3/3': {
    name: {
      ru: 'Постапокалиптическая пустыня',
      en: 'Post-apocalyptic desert',
    },
    ground: 'soil2',
  },
  '-2/-3': {
    name: {
      ru: 'Постапокалиптическая пустыня',
      en: 'Post-apocalyptic desert',
    },
    ground: 'sand1',
  },
  '-2/-2': {
    name: {
      ru: 'Постапокалиптическая пустыня',
      en: 'Post-apocalyptic desert',
    },
    ground: 'sand1',
  },
  '-2/-1': {
    name: {
      ru: 'Постапокалиптическая пустыня',
      en: 'Post-apocalyptic desert',
    },
    ground: 'sand1',
  },
  '-2/0': {
    name: {
      ru: 'Постапокалиптическая пустыня',
      en: 'Post-apocalyptic desert',
    },
    ground: 'soil1',
  },
  '-2/1': {
    name: {
      ru: 'Постапокалиптическая пустыня',
      en: 'Post-apocalyptic desert',
    },
    ground: 'soil1',
  },
  '-2/2': {
    name: {
      ru: 'Постапокалиптическая пустыня',
      en: 'Post-apocalyptic desert',
    },
    ground: 'soil2',
  },
  '-2/3': {
    name: {
      ru: 'Постапокалиптическая пустыня',
      en: 'Post-apocalyptic desert',
    },
    ground: 'soil2',
  },
  '-1/-3': {
    name: {
      ru: 'Постапокалиптическая пустыня',
      en: 'Post-apocalyptic desert',
    },
    ground: 'sand2',
  },
  '-1/-2': {
    name: {
      ru: 'Постапокалиптическая пустыня',
      en: 'Post-apocalyptic desert',
    },
    ground: 'sand2',
  },
  '-1/-1': {
    name: {
      ru: 'Бывший пригород',
      en: 'Former suburb',
    },
    ground: 'grass1',
  },
  '-1/0': {
    name: {
      ru: 'Бывший пригород',
      en: 'Former suburb',
    },
    ground: 'grass1',
  },
  '-1/1': {
    name: {
      ru: 'Бывший пригород',
      en: 'Former suburb',
    },
    ground: 'grass2',
  },
  '-1/2': {
    name: {
      ru: 'Постапокалиптическая пустыня',
      en: 'Post-apocalyptic desert',
    },
    ground: 'soil2',
  },
  '-1/3': {
    name: {
      ru: 'Постапокалиптическая пустыня',
      en: 'Post-apocalyptic desert',
    },
    ground: 'soil2',
  },
  '0/-3': {
    name: {
      ru: 'Постапокалиптическая пустыня',
      en: 'Post-apocalyptic desert',
    },
    ground: 'sand2',
  },
  '0/-2': {
    name: {
      ru: 'Постапокалиптическая пустыня',
      en: 'Post-apocalyptic desert',
    },
    ground: 'sand2',
  },
  '0/-1': {
    name: {
      ru: 'Бывший пригород',
      en: 'Former suburb',
    },
    ground: 'grass4',
  },
  '0/0': {
    name: {
      ru: 'Руины города',
      en: 'Ruins of the city',
    },
    ground: 'asphalt',
  },
  '0/1': {
    name: {
      ru: 'Бывший пригород',
      en: 'Former suburb',
    },
    ground: 'grass2',
  },
  '0/2': {
    name: {
      ru: 'Постапокалиптическая пустыня',
      en: 'Post-apocalyptic desert',
    },
    ground: 'soil3',
  },
  '0/3': {
    name: {
      ru: 'Постапокалиптическая пустыня',
      en: 'Post-apocalyptic desert',
    },
    ground: 'soil3',
  },
  '1/-3': {
    name: {
      ru: 'Постапокалиптическая пустыня',
      en: 'Post-apocalyptic desert',
    },
    ground: 'sand3',
  },
  '1/-2': {
    name: {
      ru: 'Постапокалиптическая пустыня',
      en: 'Post-apocalyptic desert',
    },
    ground: 'sand3',
  },
  '1/-1': {
    name: {
      ru: 'Бывший пригород',
      en: 'Former suburb',
    },
    ground: 'grass4',
  },
  '1/0': {
    name: {
      ru: 'Бывший пригород',
      en: 'Former suburb',
    },
    ground: 'grass3',
  },
  '1/1': {
    name: {
      ru: 'Бывший пригород',
      en: 'Former suburb',
    },
    ground: 'grass3',
  },
  '1/2': {
    name: {
      ru: 'Постапокалиптическая пустыня',
      en: 'Post-apocalyptic desert',
    },
    ground: 'sand3',
  },
  '1/3': {
    name: {
      ru: 'Постапокалиптическая пустыня',
      en: 'Post-apocalyptic desert',
    },
    ground: 'sand3',
  },
  '2/-3': {
    name: {
      ru: 'Постапокалиптическая пустыня',
      en: 'Post-apocalyptic desert',
    },
    ground: 'sand3',
  },
  '2/-2': {
    name: {
      ru: 'Постапокалиптическая пустыня',
      en: 'Post-apocalyptic desert',
    },
    ground: 'sand3',
  },
  '2/-1': {
    name: {
      ru: 'Постапокалиптическая пустыня',
      en: 'Post-apocalyptic desert',
    },
    ground: 'sand4',
  },
  '2/0': {
    name: {
      ru: 'Постапокалиптическая пустыня',
      en: 'Post-apocalyptic desert',
    },
    ground: 'sand4',
  },
  '2/1': {
    name: {
      ru: 'Постапокалиптическая пустыня',
      en: 'Post-apocalyptic desert',
    },
    ground: 'soil4',
  },
  '2/2': {
    name: {
      ru: 'Постапокалиптическая пустыня',
      en: 'Post-apocalyptic desert',
    },
    ground: 'soil4',
  },
  '2/3': {
    name: {
      ru: 'Постапокалиптическая пустыня',
      en: 'Post-apocalyptic desert',
    },
    ground: 'soil3',
  },
  '3/-3': {
    name: {
      ru: 'Постапокалиптическая пустыня',
      en: 'Post-apocalyptic desert',
    },
    ground: 'sand3',
  },
  '3/-2': {
    name: {
      ru: 'Постапокалиптическая пустыня',
      en: 'Post-apocalyptic desert',
    },
    ground: 'sand4',
  },
  '3/-1': {
    name: {
      ru: 'Постапокалиптическая пустыня',
      en: 'Post-apocalyptic desert',
    },
    ground: 'sand4',
  },
  '3/0': {
    name: {
      ru: 'Постапокалиптическая пустыня',
      en: 'Post-apocalyptic desert',
    },
    ground: 'sand4',
  },
  '3/1': {
    name: {
      ru: 'Постапокалиптическая пустыня',
      en: 'Post-apocalyptic desert',
    },
    ground: 'soil4',
  },
  '3/2': {
    name: {
      ru: 'Постапокалиптическая пустыня',
      en: 'Post-apocalyptic desert',
    },
    ground: 'soil4',
  },
  '3/3': {
    name: {
      ru: 'Командный пункт Рептилов',
      en: 'Reptilian command post',
    },
    ground: 'soil4',
  },
};
