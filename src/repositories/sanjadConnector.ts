import BaseAPI from './BaseAPI'
import type { AxiosResponse } from 'axios'
import type { PermissionType } from './permission'

export type SanjadClassType = {
  id: number | null;
  sanjad_class_id: number | null;
  name: string | null;
  academic_level_name: string | null;
  academic_field_name: string | null;
  is_deleted_at_source: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export type SchoolFeatureSettingsType = Record<string, unknown>

export enum SchoolFeatureKey {
  Skyroom = 'skyroom',
  FtpPanel = 'ftp_panel'
}

export enum SchoolTypeEnum {
  School = 'school',
  Institute = 'institute'
}

export type SchoolFeatureType = {
  id: number | null
  school_id: number | null
  school?: SchoolType | null
  feature_key: SchoolFeatureKey | null
  is_enabled: boolean
  settings: SchoolFeatureSettingsType | null
  expires_at: string | null
  created_at: string | null
  updated_at: string | null
}

export type SchoolType = {
  id: number | null
  slug: string | null
  name: string | null
  address: string | null
  website: string | null
  logo: string | null
  type: SchoolTypeEnum | null
  account_url: string | null
  features: SchoolFeatureType[]
  created_at: string | null
  updated_at: string | null
  deleted_at: string | null
}

export type AcademicFieldType = {
  id: number | null;
  school_id: number | null;
  name: string | null;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
  school?: SchoolType;
};

export type AcademicLevelType = {
  id: number | null;
  school_id: number | null;
  field_id: number | null;
  name: string | null;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
  academic_field?: AcademicFieldType;
};

export type SchoolClassType = {
  id: number | null;
  school_id: number | null;
  academic_level_id: number | null;
  name: string | null;
  academic_level?: AcademicLevelType;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
};

export type SanjadClassSyncResponse = {
  message: string;
  source_count: number;
  created_count: number;
  updated_count: number;
  restored_count: number;
  deleted_count: number;
}

export type SanjadClassPermissionPayload = {
  action: 'read';
  season: string;
  lesson?: string | null;
  grade?: string | null;
}

export type SanjadClassPermissionsResponse = {
  class: SanjadClassType;
  permissions: PermissionType[];
}

export default class SanjadConnectorAPI extends BaseAPI<SanjadClassType> {
  constructor () {
    super('/sanjad')
    this.defaultObject = {
      id: null,
      sanjad_class_id: null,
      name: null,
      academic_level_name: null,
      academic_field_name: null,
      is_deleted_at_source: false,
      created_at: null,
      updated_at: null
    }
    this.endpoints = {
      ...this.endpoints,
      getClasses: `${this.baseEndpoint}/classes`,
      databaseClasses: `${this.baseEndpoint}/classes/database`,
      syncClasses: `${this.baseEndpoint}/classes/sync`,
      classPermissions: (classId: number) => `${this.baseEndpoint}/classes/${classId}/permissions`
    }
  }

  async getClasses (): Promise<SchoolClassType[]> {
    const response: AxiosResponse<SchoolClassType[]> = await this.getAxiosInstanceWithToken()
      .get(this.endpoints.getClasses)

    return response.data
  }

  async syncClasses (): Promise<SanjadClassSyncResponse> {
    const response = await this.getAxiosInstanceWithToken()
      .post<SanjadClassSyncResponse>(this.endpoints.syncClasses)

    return response.data
  }

  async getClassPermissions (classId: number): Promise<SanjadClassPermissionsResponse> {
    const response = await this.getAxiosInstanceWithToken()
      .get<SanjadClassPermissionsResponse>(this.endpoints.classPermissions(classId))

    return response.data
  }

  async grantClassPermission (
    classId: number,
    payload: SanjadClassPermissionPayload
  ): Promise<{ message: string, permission: PermissionType }> {
    const response = await this.getAxiosInstanceWithToken()
      .post(this.endpoints.classPermissions(classId), payload)

    return response.data
  }

  async revokeClassPermission (
    classId: number,
    payload: SanjadClassPermissionPayload
  ): Promise<{ message: string, permission: string }> {
    const response = await this.getAxiosInstanceWithToken()
      .delete(this.endpoints.classPermissions(classId), { data: payload })

    return response.data
  }
}
