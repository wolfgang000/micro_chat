defmodule MicroChat.WebRTC.IceServersProviderTwilio do
  @behaviour MicroChat.WebRTC.IceServersProviderBehaviour
  alias MicroChat.Store.TwilioIceServersStore

  def get_ice_servers() do
    TwilioIceServersStore.get_ice_servers()
  end
end
