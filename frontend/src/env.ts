const websocket_base_url = import.meta.env.VITE_WEBSOCKET_BASE_URL

if (!websocket_base_url) {
  throw new Error('Environment variable WEBSOCKET_BASE_URL is missing.')
}

const env = {
  websocket_base_url: websocket_base_url
}

export default env
