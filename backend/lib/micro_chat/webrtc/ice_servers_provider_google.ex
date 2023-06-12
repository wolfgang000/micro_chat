defmodule MicroChat.WebRTC.IceServersProviderGoogle do
  @behaviour MicroChat.WebRTC.IceServersProviderBehaviour

  @servers [
    %{
      "urls" => ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"]
    }
  ]

  def get_ice_servers(), do: @servers
end
