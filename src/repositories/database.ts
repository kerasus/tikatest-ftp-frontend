import BaseAPI from './BaseAPI'
import type { AxiosResponse } from 'axios'

export type DatabaseType = {
  id: number | null;
};

export default class DatabaseAPI extends BaseAPI<DatabaseType> {
  constructor () {
    super('/database')
    this.defaultObject = {
      id: null
    }
    this.endpoints = {
      ...this.endpoints,
      backup: `${this.baseEndpoint}/backup`
    }
  }

  async backup (): Promise<void> {
    try {
      const response: AxiosResponse<void> = await this.getAxiosInstanceWithToken()
        .post(this.endpoints.backup)
      return response.data
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message)
      } else {
        throw new Error('An unknown error occurred on updateBalance')
      }
    }
  }
}
