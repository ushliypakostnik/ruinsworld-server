export const BUILDS_GENERATION = [
  [ 2, 4, 0 ],
  [ 2, 6, 2 ],
  [ 1, 4, 2 ],
];

export const STONES_GENERATION = [
  [ 2, 3, 0 ],
  [ 3, 4, 2 ],
  [ 2, 3, 2 ],
];

export const GREEN_GENERATION = [
  [ 4, 6, 10 ],
  [ 3, 3, 6, ],
  [ 1, 3, 4 ],
];

export const TRASHES_GENERATION = [
  [ 1, 2, 1 ],
  [ 2, 3, 2 ],
  [ 1, 2, 1 ],
];

export const DECOR1_GENERATION = 150;
export const DECOR2_GENERATION = 30;

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
    ground: 'sand',
  }
};

export const MAP = {
  '-1/-1': {
    name: {
      ru: 'Командный пункт Выживших',
      en: 'Survivor Command Post',
    },
    ground: 'soil4',
  },
  '-1/0': {
    name: {
      ru: 'Бывший пригород',
      en: 'Former suburb',
    },
    ground: 'soil3',
  },
  '-1/1': {
    name: {
      ru: 'Лес',
      en: 'Former suburb',
    },
    ground: 'grass',
  },
  '0/-1': {
    name: {
      ru: 'Бывший пригород',
      en: 'Former suburb',
    },
    ground: 'soil2',
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
    ground: 'soil1',
  },
  '1/-1': {
    name: {
      ru: 'Пустырь',
      en: 'Former suburb',
    },
    ground: 'sand',
  },
  '1/0': {
    name: {
      ru: 'Бывший пригород',
      en: 'Former suburb',
    },
    ground: 'soil3',
  },
  '1/1': {
    name: {
      ru: 'Командный пункт Рептилов',
      en: 'Reptilian command post',
    },
    ground: 'soil4',
  },
};
