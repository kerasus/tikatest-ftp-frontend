import { defineStore } from 'pinia'
import { useRouter } from 'vue-router'
import { reactive, computed } from 'vue'
import { type UserType } from 'src/repositories/user'

const userKey = 'user-data'

export const useUser = defineStore('user', () => {
  const router = useRouter()

  const isClient = typeof window !== 'undefined'
  const state = reactive<{
    refresh: string | null;
    token: string | null;
    user: UserType | null;
  }>({
    token: null,
    refresh: null,
    user: null
  })

  // persist user with localStorage
  if (isClient) {
    loadUserDataFromLocalstorage()
  }

  // Getters
  const token = computed(() => state.token)
  const refreshTokenValue = computed(() => state.refresh)
  const me = computed(() => state.user ?? null)

  const isAdmin = computed(() => hasRole(state.user, 'admin'))
  const isTeacher = computed(() => hasRole(state.user, 'teacher'))
  const isSupport = computed(() => hasRole(state.user, 'support'))


  function hasRole (user: UserType | null, role: string): boolean {
    if (!user) {
      return false
    }

    return user.roles_list.includes(role)
  }

  // Mutations
  async function logout () {
    if (isClient) {
      sessionStorage.clear()
      localStorage.clear()
    }

    state.token = null
    state.refresh = null
    state.user = null

    await router.push({ name: 'Auth.Login' })
  }

  function setUser (data: UserType | null) {
    state.user = data
    if (isClient) {
      localStorage.setItem(userKey, JSON.stringify(data))
    }
  }

  function loadUserDataFromLocalstorage () {
    const data = localStorage.getItem(userKey)
    if (typeof data === 'string') {
      setUser(JSON.parse(data))
    }
  }

  return {
    state,

    // Getters
    me,
    token,
    hasRole,
    isAdmin,
    isTeacher,
    isSupport,
    refreshTokenValue,

    // Mutations
    logout,
    setUser,

    // Actions
    loadUserDataFromLocalstorage
  }
})
