defmodule MicroChat.WebRTC.IceServersProviderGoogle do
  @behaviour MicroChat.WebRTC.IceServersProviderBehaviour

  @servers %{
    "iceServers" => [
      %{
        "urls" => ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"]
      }
    ],
    "iceCandidatePoolSize" => 10
  }

  def get_ice_servers(), do: @servers
end
