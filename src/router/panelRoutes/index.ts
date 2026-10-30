import userRoutes from './user'
import type { RouteRecordRaw } from 'vue-router'
import fileRoutes from './file'
import fileActivityLogRoutes from './fileActivityLog'
import sanjadClassRoutes from './sanjadClass'
import Authenticated from 'src/router/middleware/Authenticated'
import hasOneOfThisRoles from 'src/router/middleware/hasOneOfThisRoles'

export const index: RouteRecordRaw[] = [
  {
    path: '',
    meta: {
      middleware: [Authenticated],
      layoutConfig: {
        // layoutHeader: false,
        // layoutLeftDrawer: false,
        // layoutRightDrawer: false,
        // layoutFooter: false
      }
    },
    component: () => import('src/layouts/BareLayout.vue'),
    children: [
      {
        path: 'dashboard',
        name: 'Panel.Dashboard',
        meta: {
          pageCategory: 'داشبورد',
          middleware: [
            hasOneOfThisRoles(['admin'])
          ]
        },
        component: () => import('src/pages/panel/dashboard.vue')
      },

      ...userRoutes,
      ...fileRoutes,
      ...fileActivityLogRoutes,
      ...sanjadClassRoutes
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]
