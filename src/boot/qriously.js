import { boot } from 'quasar/wrappers'

import VueQriously from 'vue-qriously'

// export default async ({ Vue }) => {
//   Vue.use(VueQriously)
// }

export default boot(({ app }) => {
  // Set i18n instance on app
  app.use(VueQriously)
})

export { VueQriously }