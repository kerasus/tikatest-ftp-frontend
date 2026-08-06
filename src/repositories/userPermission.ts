import BaseAPI from './BaseAPI'
import type { PermissionActionType, PermissionType } from 'src/repositories/permission'

export type UserPermissionPayload = {
  action: PermissionActionType;
  season: string;
  lesson?: string | null;
  grade?: string | null;
}

export type UserPermissionUserType = {
  id: number;
  firstname: string | null;
  lastname: string | null;
  username: string;
}

export type UserPermissionsResponse = {
  user: UserPermissionUserType;
  permissions: PermissionType[];
}

export default class UserPermissionAPI extends BaseAPI<PermissionType> {
  constructor (userId: number) {
    super(`/users/${userId}/permissions`)
    this.defaultObject = {
      id: 0,
      name: '',
      guard_name: '',
      created_at: null,
      updated_at: null
    }
  }

  async getAll (): Promise<UserPermissionsResponse> {
    const response = await this.getAxiosInstanceWithToken().get(this.endpoints.base)
    return response.data
  }

  async grant (payload: UserPermissionPayload): Promise<any> {
    const response = await this.getAxiosInstanceWithToken().post(this.endpoints.base, payload)
    return response.data
  }

  async revoke (payload: UserPermissionPayload): Promise<any> {
    const response = await this.getAxiosInstanceWithToken().delete(this.endpoints.base, {
      data: payload
    })
    return response.data
  }
}
