import BaseAPI from './BaseAPI'

export type PermissionType = {
  id: number;
  name: string;
  guard_name: string;
  created_at: string | null;
  updated_at: string | null;
}

export type PermissionActionType = 'read' | 'write' | 'delete'

export default class PermissionAPI extends BaseAPI<PermissionType> {
  constructor () {
    super('/permissions')
    this.defaultObject = {
      id: 0,
      name: '',
      guard_name: '',
      created_at: '',
      updated_at: ''
    }
  }
}
