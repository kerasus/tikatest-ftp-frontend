import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: 'files',
    name: 'Panel.File',
    meta: {
      pageCategory: 'فایل'
    },
    component: () => import('src/layouts/BareLayout.vue'),
    children: [
      {
        path: 'browse',
        name: 'Panel.File.Browse',
        meta: {
          breadCrumbs: [
            {
              label: 'مشاهده'
            }
          ]
        },
        component: () => import('src/pages/panel/file/browse.vue')
      },
      {
        path: 'upload',
        name: 'Panel.File.Upload',
        meta: {
          breadCrumbs: [
            {
              label: 'آپلود'
            }
          ]
        },
        component: () => import('src/pages/panel/file/upload.vue')
      }
    ]
  }
]

export default routes
