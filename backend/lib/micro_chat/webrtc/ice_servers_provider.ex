defmodule MicroChat.WebRTC.IceServersProviderBehaviour do
  @moduledoc false
  @callback get_ice_servers() :: [map()]
end

defmodule MicroChat.WebRTC.IceServersProvider do
  @behaviour MicroChat.WebRTC.IceServersProviderBehaviour
  @provider Application.compile_env!(:micro_chat, MicroChat.WebRTC)[:ice_servers_provider]

  def get_ice_servers(), do: @provider.get_ice_servers()
end
