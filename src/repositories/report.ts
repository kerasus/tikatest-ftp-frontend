import BaseAPI from './BaseAPI'

export type ReportType = {
};

export default class ReportAPI extends BaseAPI<ReportType> {
  constructor () {
    super('/reports')
    this.defaultObject = {}
    this.endpoints = {
      ...this.endpoints,
      pendingTransfersCount: {
        my: () => `${this.baseEndpoint}/pending-transfers-count/my/count`,
        all: () => `${this.baseEndpoint}/pending-transfers-count/all/count`
      },
      lockedInventoriesCount: () => `${this.baseEndpoint}/locked-inventories/count`
    }
  }

  async getPendingTransfersCountMy (): Promise<number> {
    const response = await this.getAxiosInstanceWithToken()
      .get(this.endpoints.pendingTransfersCount.my())

    return response.data
  }

  async getPendingTransfersCountAll (): Promise<number> {
    const response = await this.getAxiosInstanceWithToken()
      .get(this.endpoints.pendingTransfersCount.all())

    return response.data
  }

  async getLockedInventoriesCount (): Promise<number> {
    const response = await this.getAxiosInstanceWithToken()
      .get(this.endpoints.lockedInventoriesCount())

    return response.data
  }
}
