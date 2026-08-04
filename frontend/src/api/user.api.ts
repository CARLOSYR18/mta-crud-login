import { apiClient } from './client';
import { PublicUser } from './auth.api';

export type { PublicUser } from './auth.api';

export async function getMeRequest() {
  const { data } = await apiClient.get<PublicUser>('/users/me');
  return data;
}

export async function listUsersRequest() {
  const { data } = await apiClient.get<PublicUser[]>('/users');
  return data;
}

export async function getUserRequest(id: number) {
  const { data } = await apiClient.get<PublicUser>(`/users/${id}`);
  return data;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  password?: string;
}

export async function updateUserRequest(id: number, payload: UpdateUserPayload) {
  const { data } = await apiClient.put<PublicUser>(`/users/${id}`, payload);
  return data;
}

export async function deleteUserRequest(id: number) {
  await apiClient.delete(`/users/${id}`);
}
