import axios from 'axios'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { boot } from 'quasar/wrappers'
import { useUser } from 'src/stores/user'
import type { AxiosInstance } from 'axios'
import { useAppConfig } from 'src/stores/appConfig'

interface TokenData {
  accessToken: string | null;
  refreshToken: string | null;
}

export interface ResponseErrorDetail {
  loc: string;
  type: string;
}

export interface ValidationError {
  [key: string]: string[]; // Each key maps to an array of error messages
}

export interface ErrorResponse {
  message: string;
  errors: ValidationError;
}

const apiServer = process.env.FRONTEND_API_BASE || '/api'
export const ServerMessagesPrefix = 'dynamicI18nMessages'
export const tokenDataKeyInLocalstorage = 'tokenData'

function getAxiosInstanceManager (apiServer: string) {
  // const envStore = useEnvStore()
  // const frontendApiBase: string = envStore.frontendApiBase
  const frontendApiBase: string = apiServer
  const getMainTokenAddress: string = `${frontendApiBase}/login`
  const getRefreshTokenAddress: string = `${frontendApiBase}/refresh-token`

  const token = ref<TokenData>({
    accessToken: null,
    refreshToken: null
  })

  const credentials = ref<{
    username: string | null;
    password: string | null;
    captcha: string | null;
  }>({
    username: null,
    password: null,
    captcha: null
  })

  function saveTokenData (tokenData: TokenData): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(tokenDataKeyInLocalstorage, JSON.stringify(tokenData))
  }

  function getTokenData (): TokenData {
    if (typeof window === 'undefined') return { accessToken: null, refreshToken: null }
    const data = localStorage.getItem(tokenDataKeyInLocalstorage)
    return data ? JSON.parse(data) : { accessToken: null, refreshToken: null }
  }

  function setCredentials (username: string, password: string, captcha: string): void {
    credentials.value.username = username
    credentials.value.password = password
    credentials.value.captcha = captcha
  }

  async function getToken (): Promise<string | null> {
    token.value = getTokenData()
    if (!token.value.accessToken) {
      try {
        await obtainMainToken()
      } catch (error) {
        console.error('Failed to obtain token:', error)
        throw new Error('Failed to obtain token')
      }
    }
    return token.value.accessToken
  }

  async function obtainMainToken (): Promise<void> {
    if (!credentials.value.username || !credentials.value.password || !credentials.value.captcha) {
      throw new Error('Credentials or captcha are not set')
    }

    try {
      const response = await axios.post(getMainTokenAddress, {
        username: credentials.value.username,
        password: credentials.value.password
      })

      const newToken: TokenData = {
        accessToken: response.data.token,
        refreshToken: response.data.refreshToken
      }
      const user = response.data.user

      token.value = newToken
      saveTokenData(newToken)
      setAuthenticatedUserData(user)
    } catch (error) {
      console.error('Error obtaining main token:', error)
      throw new Error('Failed to obtain main token')
    }
  }

  async function refreshToken (): Promise<void> {
    if (!token.value.refreshToken) {
      throw new Error('No refresh token available')
    }

    try {
      const response = await axios.put(getRefreshTokenAddress, {
        refreshToken: token.value.refreshToken
      })

      const newToken: TokenData = {
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken
      }

      token.value = newToken
      saveTokenData(newToken)
      // setAuthenticatedUserData()
    } catch (error) {
      console.error('Error refreshing token:', error)
      throw new Error('Failed to refresh token')
    }
  }

  function clearToken (): void {
    token.value.accessToken = null
    token.value.refreshToken = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem(tokenDataKeyInLocalstorage)
    }
  }

  function setAuthenticatedUserData (userData: any) {
    const userManager = useUser()
    userManager.setUser(userData)
  }

  function logout (): void {
    clearToken()
    credentials.value.username = null
    credentials.value.password = null
    credentials.value.captcha = null
    const userManager = useUser()
    userManager.logout()
  }

  function goToLoginPage (): void {
    const router = useRouter()
    const appConfigManager = useAppConfig()
    appConfigManager.setCurrentRouteToRedirectAfterLogin()
    const userManager = useUser()
    userManager.logout()
    router.push({ name: 'Auth.Login' })
  }

  function notifyError (message: string) {
    const customEvent = new CustomEvent('axios-interceptors-response-error', {
      detail: { message }
    })
    window.dispatchEvent(customEvent)
  }

  const axiosInstance: AxiosInstance = axios.create({
    baseURL: frontendApiBase
  })

  const axiosInstanceWithoutToken: AxiosInstance = axios.create({
    baseURL: frontendApiBase
  })

  axiosInstance.interceptors.request.use(
    async (config) => {
      try {
        const accessToken = await getToken()
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`
        }
        return config
      } catch {
        const newError = {
          response: {
            status: 401,
            data: {
              message: 'Failed to set Authorization header',
              errors: {
                auth: [
                  'مشکلی در تنظیم مجوز رخ داده است.'
                ]
              }
            }
          }
        }
        return Promise.reject(newError)
      }
    },
    (error) => {
      console.error('Request error:', error)
      return Promise.reject(error)
    }
  )

  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      let originalRequest = error.config

      // Handle 401 Unauthorized errors (token refresh logic)
      if (error.response && error.response.status === 401 && !originalRequest?._retry) {
        if (originalRequest) {
          originalRequest._retry = true
        } else {
          originalRequest = {
            _retry: true
          }
        }

        try {
          await refreshToken()
          return axiosInstance(originalRequest)
        } catch (refreshError) {
          console.error('Error refreshing token:', refreshError)
          goToLoginPage()
          return Promise.reject(refreshError)
        }
      } else if (error.response && error.response.status === 401) {
        console.error('Error refreshing token')
        goToLoginPage()
      }

      // Handle other errors
      if (error.response) {
        const { status, data } = error.response

        if (!data.success) {
          const errorMessage = data.message
          const validationErrors = Object.entries((data as ErrorResponse).errors).flatMap(([_, messages]) => {
            return messages // Only include the error messages, not the field names
          })
          notifyError(
            (errorMessage ? errorMessage + '<br/>' : '') +
            validationErrors.join('<br/>')
          ) // Join all error messages with a semicolon
        }

        // // Handle 422 Unprocessable Entity (validation errors)
        // if ((status === 422 || status === 400) && (data as ErrorResponse).errors) {
        //   const validationErrors = Object.entries((data as ErrorResponse).errors).flatMap(([_, messages]) => {
        //     return messages // Only include the error messages, not the field names
        //   })
        //   notifyError(validationErrors.join('<br/>')) // Join all error messages with a semicolon
        // }
        // else if (typeof data === 'string') {
        //   notifyError(data)
        // }
        // // Handle other structured errors (e.g., detail array)
        // else if (Array.isArray(data) && data.length > 0) {
        //   notifyError(
        //     data.join(', ')
        //   )
        // }
        // // Handle generic HTTP status errors
        // else {
        //   notifyError(`error.${status}`)
        // }
      }
      // Handle cases where there is no response (network error, etc.)
      else {
        notifyError('unknownError')
      }

      return Promise.reject(error)
    }
  )

  return {
    logout,
    getToken,
    setCredentials,
    obtainMainToken,
    clearToken,
    getTokenData,
    axiosInstance,
    axiosInstanceWithoutToken
  }
}

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside the
// "export default () => {}" function below (which runs individually
// for each client)
const axiosInstanceManager = getAxiosInstanceManager(apiServer)
const appApi = axiosInstanceManager.axiosInstance
export default boot(({ app }) => {
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API

  app.config.globalProperties.$axios = appApi
})

export { axiosInstanceManager, appApi }
