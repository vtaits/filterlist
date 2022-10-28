import faker from 'faker';

import type {
  User,
} from '../types';

export const usersGenerator = (count: number): User[] => {
  const res: User[] = [];

  for (let i: number = 0; i < count; ++i) {
    res.push({
      id: i + 1,
      name: faker.name.findName(),
      email: faker.internet.email(),
      city: faker.address.city(),
    });
  }

  return res;
};
