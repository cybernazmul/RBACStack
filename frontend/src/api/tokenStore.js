// Holds the in-memory access token — no imports, no circular dependency
let _token = null
export const getAccessToken = () => _token
export const setAccessToken = (t) => { _token = t }
export const clearAccessToken = () => { _token = null }
