import carsGenerator from './carsGenerator';

function delay(time) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
}

const cars = carsGenerator(50);

export async function loadCars(params) {
  const page = params.page || 1;
  const perPage = params.perPage || 10;

  const brand = (params.brand || '').toLowerCase();
  const owner = (params.owner || '').toLowerCase();

  const hideYellow = Boolean(params.hideYellow);
  const hideRed = Boolean(params.hideRed);
  const hideBlue = Boolean(params.hideBlue);

  const { sort } = params.sort;
  const desc = sort && sort[0] === '-';
  const sortParam = sort && (desc ? sort.substring(1, sort.length) : sort);

  const sortedCars = sort ?
    cars.sort((car1, car2) => {
      if (car1[sortParam] > car2[sortParam]) {
        return desc ? -1 : 1;
      }

      return desc ? 1 : -1;
    }) :
    cars;

  const filteredCars = sortedCars.filter((car) => {
    if (brand && !car.brand.toLowerCase().includes(brand)) {
      return false;
    }

    if (owner && !car.owner.toLowerCase().includes(owner)) {
      return false;
    }

    if (hideYellow && car.color === 'yellow') {
      return false;
    }

    if (hideBlue && car.color === 'blue') {
      return false;
    }

    if (hideRed && car.color === 'red') {
      return false;
    }

    return true;
  });

  const offset = (page - 1) * perPage;

  await delay(2000);

  return {
    cars: filteredCars.slice(offset, offset + perPage),
    count: filteredCars.length,
  };
}
