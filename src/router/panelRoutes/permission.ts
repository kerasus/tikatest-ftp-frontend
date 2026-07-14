import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: 'permissions',
    name: 'Panel.Permission',
    meta: {
      pageCategory: 'تجهیزات'
    },
    component: () => import('src/layouts/BareLayout.vue'),
    children: [
      {
        path: '',
        name: 'Panel.Permission.List',
        meta: {
          breadCrumbs: [
            {
              label: 'لیست'
            }
          ]
        },
        component: () => import('src/pages/panel/permission/list.vue')
      },
      {
        path: 'create',
        name: 'Panel.Permission.Create',
        meta: {
          breadCrumbs: [
            {
              label: 'جدید'
            }
          ]
        },
        component: () => import('src/pages/panel/permission/create.vue')
      },
      {
        path: ':id',
        name: 'Panel.Permission.Show',
        meta: {
          breadCrumbs: [
            {
              label: 'مشاهده'
            }
          ]
        },
        component: () => import('src/pages/panel/permission/show.vue')
      },
      {
        path: ':id/edit',
        name: 'Panel.Permission.Edit',
        meta: {
          breadCrumbs: [
            {
              label: 'ویرایش'
            }
          ]
        },
        component: () => import('src/pages/panel/permission/edit.vue')
      }
    ]
  }
]

export default routes
