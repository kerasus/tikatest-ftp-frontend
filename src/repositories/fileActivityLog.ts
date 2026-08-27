import BaseAPI from './BaseAPI'
import type { UserType } from './user'

export type FileActivityActionType =
  | 'upload'
  | 'delete'
  | 'rename'
  | 'move'
  | 'browse'
  | 'clear_cache'

export type FileActivityStatusType =
  | 'success'
  | 'failed'
  | 'pending'

export const fileActivityActionOptions: Array<{
  label: string;
  value: FileActivityActionType;
}> = [
  { label: 'آپلود فایل', value: 'upload' },
  { label: 'حذف فایل', value: 'delete' },
  { label: 'تغییر نام فایل', value: 'rename' },
  { label: 'انتقال فایل', value: 'move' },
  { label: 'مشاهده فایل‌ها', value: 'browse' },
  { label: 'پاک‌سازی کش', value: 'clear_cache' }
]

export const fileActivityStatusOptions: Array<{
  label: string;
  value: FileActivityStatusType;
}> = [
  { label: 'موفق', value: 'success' },
  { label: 'ناموفق', value: 'failed' },
  { label: 'در انتظار', value: 'pending' }
]

export function getFileActivityActionLabel (action: string | null): string {
  if (!action) {
    return '-'
  }

  const targetAction = fileActivityActionOptions.find(
    (item) => item.value === action
  )

  return targetAction?.label ?? action
}

export function getFileActivityStatusLabel (status: string | null): string {
  if (!status) {
    return '-'
  }

  const targetStatus = fileActivityStatusOptions.find(
    (item) => item.value === status
  )

  return targetStatus?.label ?? status
}

export type FileActivityMetaType = Record<string, unknown>

export type FileActivityLogType = {
  id: number | null;
  user_id: number | null;

  action: FileActivityActionType | null;
  status: FileActivityStatusType | null;

  path: string | null;
  source_path: string | null;
  destination_path: string | null;

  file_name: string | null;
  file_size: number | null;
  upload_id: string | null;

  error_message: string | null;
  meta: FileActivityMetaType | null;

  ip_address: string | null;
  user_agent: string | null;

  created_at: string | null;
  updated_at: string | null;

  user?: UserType | null;
}

export type FileActivityLogFilterType = {
  page?: number;
  per_page?: number;

  action?: FileActivityActionType;
  status?: FileActivityStatusType;
  user_id?: number;

  path?: string;
  source_path?: string;
  destination_path?: string;
  file_name?: string;
  upload_id?: string;
  ip_address?: string;
  error_message?: string;

  user_firstname?: string;
  user_lastname?: string;
  user_username?: string;
  user_email?: string;

  created_at?: string;
  created_at_from?: string;
  created_at_to?: string;

  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
}

export default class FileActivityLogAPI extends BaseAPI<FileActivityLogType> {
  constructor () {
    super('/file-activity-logs')

    this.defaultObject = {
      id: null,
      user_id: null,

      action: null,
      status: null,

      path: null,
      source_path: null,
      destination_path: null,

      file_name: null,
      file_size: null,
      upload_id: null,

      error_message: null,
      meta: null,

      ip_address: null,
      user_agent: null,

      created_at: null,
      updated_at: null,

      user: null
    }
  }
}
