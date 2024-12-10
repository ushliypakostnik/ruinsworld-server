// Utils
import Helper from '../../utils/helper';

export const BUILDS_GENERATION = [
  [ 0, 1, 1, 0, 0 ],
  [ 1, 3, 6, 3, 0 ],
  [ 2, 6, 12, 6, 2 ],
  [ 1, 3, 6, 3, 1 ],
  [ 0, 1, 2, 1, 0 ],
];

export const STONES_GENERATION = [
  [ 7, 5, 5, 3, 3 ],
  [ 3, 5, 3, 2, 5 ],
  [ 5, 9, 2, 3, 5 ],
  [ 9, 11, 9, 5, 7 ],
  [ 6, 9, 9, 7, 5 ],
];

export const GREEN_GENERATION = [
  [ 6, 9, 9, 12, 12 ],
  [ 9, 9, 12, 16, 12 ],
  [ 6, 6, 6, 12, 12 ],
  [ 6, 3, 6, 9, 9 ],
  [ 6, 6, 6, 9, 6 ],
];

export const TRASHES_GENERATION = [
  [ 1, 2, 2, 2, 1 ],
  [ 2, 3, 5, 3, 2 ],
  [ 2, 5, 4, 5, 2 ],
  [ 2, 3, 5, 3, 2 ],
  [ 1, 2, 2, 2, 1 ],
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
    ground: 'sand2',
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
  '-1/-2': {
    name: {
      ru: 'Постапокалиптическая пустыня',
      en: 'Post-apocalyptic desert',
    },
    ground: 'sand2',
  },
  '-1/-1': {
    name: {
      ru: 'Командный пункт Выживших',
      en: 'Survivor Command Post',
    },
    ground: 'sand1',
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
    ground: 'grass1',
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
  '1/-2': {
    name: {
      ru: 'Постапокалиптическая пустыня',
      en: 'Post-apocalyptic desert',
    },
    ground: 'soil3',
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
      ru: 'Командный пункт Рептилов',
      en: 'Reptilian command post',
    },
    ground: 'soil4',
  },
  '1/2': {
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
    ground: 'grass3',
  },
};
