// TEMPLATE FILE — part of admin-template v1.0
const path = require('path')
const modulesConfig = require('../config/modules.config')

function loadRoutes(app) {
  // Auth routes always loaded (not a module)
  try {
    const authRoutes = require('../modules/auth/auth.routes')
    app.use('/api/auth', authRoutes)
    console.log('✓ Loaded routes: auth')
  } catch (e) {
    console.warn('⚠ Could not load auth routes:', e.message)
  }

  // Load module routes from modules.config.js
  for (const mod of modulesConfig) {
    try {
      const routePath = path.join(__dirname, `../modules/${mod.key}/${mod.key}.routes.js`)
      const router = require(routePath)
      app.use(`/api/${mod.key}`, router)
      console.log(`✓ Loaded routes: ${mod.key}`)
    } catch (e) {
      // Silently skip if route file doesn't exist yet
    }
  }

  // Analytics routes (separate from module system)
  try {
    const analyticsRoutes = require('../modules/analytics/analytics.routes')
    app.use('/api/analytics', analyticsRoutes)
    console.log('✓ Loaded routes: analytics')
  } catch (e) {
    // skip
  }
}

module.exports = loadRoutes
