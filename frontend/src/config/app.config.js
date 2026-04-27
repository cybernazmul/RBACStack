// TEMPLATE FILE — part of admin-template v1.0
export const appConfig = {
  /** Display name shown in sidebar header and browser tab. Change per project. */
  appName: import.meta.env.VITE_APP_NAME || 'Admin Dashboard',

  /** Path to logo file in /public. Change per project. */
  appLogo: '/logo.svg',

  /** Semantic version of this app instance. */
  appVersion: '1.0.0',

  theme: {
    /** Primary accent hex color. Change per project to match client branding. */
    primaryColor: '#3b82f6',

    /** Default theme on first load. true = dark, false = light. */
    darkMode: false,
  },

  pagination: {
    /** Rows per page in all data tables. */
    defaultPageSize: 10,
  },

  api: {
    /** Backend API base URL. Reads from VITE_API_URL env var. */
    baseUrl: import.meta.env.VITE_API_URL || '',

    /** Axios request timeout in milliseconds. */
    timeout: 10000,
  },
}
