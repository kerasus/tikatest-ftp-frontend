import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: 'classes',
    name: 'Panel.Classes',
    meta: {
      pageCategory: 'کلاس‌ها'
    },
    component: () => import('src/layouts/BareLayout.vue'),
    children: [
      {
        path: 'sanjad',
        name: 'Panel.Classes.Sanjad',
        meta: {
          breadCrumbs: [
            {
              label: 'کلاس‌های سنجاد'
            }
          ]
        },
        component: () => import('src/pages/panel/classes/sanjad.vue')
      }
    ]
  }
]

export default routes
