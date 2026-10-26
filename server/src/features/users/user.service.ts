import Boom from '@hapi/boom';
import { User } from './user.types';
import { findAllUsersRepository, findUserByIdRepository } from './user.repository';

export const getUsersService = async (role?: string): Promise<User[]> => {
  const users = await findAllUsersRepository();
  return role ? users.filter((user) => user.role === role) : users;
};

export const getUserByIdService = async (id: string): Promise<User> => {
  const user = await findUserByIdRepository(id);

  if (!user) {
    throw Boom.notFound('User not found');
  }

  return user;
};