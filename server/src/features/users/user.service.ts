import Boom from '@hapi/boom';
import { isUuid } from '../../utils/isUuid';
import { User } from './user.types';
import { findAllUsersRepository, findUserByIdRepository } from './user.repository';

export const getUsersService = async (role?: string): Promise<User[]> => {
  return findAllUsersRepository(role);
};

export const getUserByIdService = async (id: string): Promise<User> => {
  const user = isUuid(id) ? await findUserByIdRepository(id) : undefined;

  if (!user) {
    throw Boom.notFound('User not found');
  }

  return user;
};
