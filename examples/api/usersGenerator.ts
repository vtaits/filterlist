import { faker } from "@faker-js/faker";

import type { User } from "../types";

export const usersGenerator = (count: number): User[] => {
	const res: User[] = [];

	for (let i = 0; i < count; ++i) {
		res.push({
			id: i + 1,
			name: faker.person.fullName(),
			email: faker.internet.email(),
			city: faker.location.city(),
		});
	}

	return res;
};
