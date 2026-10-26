import { User } from './user.types';
import { usersMock } from './data.mock';

export const findAllUsersRepository = async (): Promise<User[]> => {
  return usersMock;
};

export const findUserByIdRepository = async (id: string): Promise<User | undefined> => {
  return usersMock.find((user) => user.id === id);
};