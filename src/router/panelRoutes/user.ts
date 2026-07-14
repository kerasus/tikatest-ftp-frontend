import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: 'users',
    name: 'Panel.User',
    meta: {
      pageCategory: 'کاربران'
    },
    component: () => import('src/layouts/BareLayout.vue'),
    children: [
      {
        path: '',
        name: 'Panel.User.List',
        meta: {
          breadCrumbs: [
            {
              label: 'لیست'
            }
          ]
        },
        component: () => import('src/pages/panel/user/list.vue')
      },
      {
        path: 'create',
        name: 'Panel.User.Create',
        meta: {
          breadCrumbs: [
            {
              label: 'جدید'
            }
          ]
        },
        component: () => import('src/pages/panel/user/create.vue')
      },
      {
        path: ':id',
        name: 'Panel.User.Show',
        meta: {
          breadCrumbs: [
            {
              label: 'مشاهده'
            }
          ]
        },
        component: () => import('src/pages/panel/user/show.vue')
      },
      {
        path: ':id/edit',
        name: 'Panel.User.Edit',
        meta: {
          breadCrumbs: [
            {
              label: 'ویرایش'
            }
          ]
        },
        component: () => import('src/pages/panel/user/edit.vue')
      }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
