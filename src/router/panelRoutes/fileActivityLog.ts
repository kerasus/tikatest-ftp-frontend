import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: 'file-activity-logs',
    name: 'Panel.FileActivityLog',
    meta: {
      pageCategory: 'لاگ فعالیت فایل‌ها'
    },
    component: () => import('src/layouts/BareLayout.vue'),
    children: [
      {
        path: '',
        name: 'Panel.FileActivityLog.List',
        meta: {
          breadCrumbs: [
            {
              label: 'لیست فعالیت‌ها'
            }
          ]
        },
        component: () => import('src/pages/panel/fileActivityLog/list.vue')
      }
    ]
  }
]

export default routes
