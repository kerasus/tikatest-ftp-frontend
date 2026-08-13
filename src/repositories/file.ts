import BaseAPI from './BaseAPI'

export type DirectoryType = {
  name: string;
  path: string;
  type: 'directory';
}

export type FileType = {
  name: string;
  path: string;
  timestamp: string;
  size: number;
  type: 'file';
}

export type FileTreeType = {
  current_path: string;
  directories: DirectoryType[];
  files: FileType[];
}

export type MoveFileResponse = {
  ok: boolean;
  old_path: string;
  new_path: string;
}

type OptionsType = Record<string, Record<string, string[]>>

export default class FileAPI extends BaseAPI<FileTreeType> {
  constructor () {
    super('/files')

    this.defaultObject = {
      current_path: '',
      directories: [],
      files: []
    }

    this.endpoints = {
      ...this.endpoints,
      browse: () => `${this.baseEndpoint}/browse`,
      options: () => `${this.baseEndpoint}/options`,
      upload: () => `${this.baseEndpoint}/upload`,
      cancel: () => `${this.baseEndpoint}/cancel`,
      rename: () => `${this.baseEndpoint}/rename`,
      move: () => `${this.baseEndpoint}/move`,
      clearBrowseCache: () => `${this.baseEndpoint}/cache/browse/clear`,
      clearOptionsCache: () => `${this.baseEndpoint}/cache/options/clear`
    }
  }

  async browse (path: string | null): Promise<FileTreeType> {
    const response = await this.getAxiosInstanceWithToken()
      .get(this.endpoints.browse(), { params: { path } })

    return response.data
  }

  async getOptions (): Promise<OptionsType> {
    const response = await this.getAxiosInstanceWithToken()
      .get<OptionsType>(this.endpoints.options())

    return response.data
  }

  async uploadChunk (
    formData: FormData,
    signal?: AbortSignal
  ): Promise<any> {
    const response = await this.getAxiosInstanceWithToken()
      .post(this.endpoints.upload(), formData, { signal })

    return response.data
  }

  async cancel (uploadId: string): Promise<any> {
    const response = await this.getAxiosInstanceWithToken()
      .post(this.endpoints.cancel(), { upload_id: uploadId })
    return response.data
  }

  async rename (oldPath: string, newName: string): Promise<{
    ok: boolean,
    new_path: string
  }> {
    const response = await this.getAxiosInstanceWithToken()
      .patch(this.endpoints.rename(), { old_path: oldPath, new_name: newName })
    return response.data
  }

  async move (
    oldPath: string,
    destinationPath: string
  ): Promise<MoveFileResponse> {
    const response = await this.getAxiosInstanceWithToken()
      .post<MoveFileResponse>(this.endpoints.move(), {
        old_path: oldPath,
        destination_path: destinationPath
      })

    return response.data
  }

  async deleteFile (path: string): Promise<{ ok: boolean }> {
    const response = await this.getAxiosInstanceWithToken()
      .delete(this.baseEndpoint, { data: { path } })
    return response.data
  }

  async clearBrowseCache (path: string | null): Promise<{
    ok: boolean,
    path: string,
    cache_key: string
  }> {
    const response = await this.getAxiosInstanceWithToken()
      .post(this.endpoints.clearBrowseCache(), { path })

    return response.data
  }

  async clearOptionsCache (): Promise<{
    ok: boolean,
    cache_key: string
  }> {
    const response = await this.getAxiosInstanceWithToken()
      .post(this.endpoints.clearOptionsCache())

    return response.data
  }

}
