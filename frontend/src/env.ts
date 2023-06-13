const websocket_base_url = import.meta.env.VITE_WEBSOCKET_BASE_URL
const feature_flag_videocall = import.meta.env.VITE_FEATURE_FLAG_VIDEOCALL

if (!websocket_base_url) {
  throw new Error('Environment variable WEBSOCKET_BASE_URL is missing.')
}

const env = {
  websocket_base_url: websocket_base_url,
  feature_flag_videocall: feature_flag_videocall || false
}

export default env
