export const BUILDS_GENERATION = [
  [ 4, 6, 1 ],
  [ 6, 12, 6 ],
  [ 1, 6, 4 ],
];

export const STONES_GENERATION = [
  [ 3, 4, 1 ],
  [ 4, 5, 4 ],
  [ 3, 4, 3 ],
];

export const GREEN_GENERATION = [
  [ 9, 12, 16 ],
  [ 6, 6, 12, ],
  [ 3, 6, 9 ],
];

export const TRASHES_GENERATION = [
  [ 3, 5, 3 ],
  [ 5, 7, 5 ],
  [ 3, 5, 3 ],
];

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
