import { UserRolesType } from 'src/repositories/user'
import { tokenDataKeyInLocalstorage } from 'src/boot/axios'

export default function hasOneOfThisRoles (roleNames: UserRolesType[]) {
  return ({ sharedStore }) => {
    const loginRouteName = 'Auth.Login'
    const tokenDataRaw = localStorage.getItem(tokenDataKeyInLocalstorage)
    if (!tokenDataRaw) {
      return { name: loginRouteName }
    }

    const userManager = sharedStore.useUser()
    let hasOneOfRoles = false
    roleNames.forEach((role) => {
      const capitalizedRole = role.charAt(0).toUpperCase() + role.slice(1)

      if (userManager['is' + capitalizedRole]) {
        hasOneOfRoles = true
      }
    })

    if (!hasOneOfRoles) {
      return { name: loginRouteName }
    }

    // Continue to the route if token is found or already on login page
    return null
  }
}
