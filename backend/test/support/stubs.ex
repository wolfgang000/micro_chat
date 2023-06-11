defmodule MicroChat.API.TwilioAPIClientStub do
  @moduledoc false
  @behaviour MicroChat.API.TwilioAPIClientBehaviour

  def get_ice_servers_and_credentials(),
    do:
      {:ok,
       %{
         "account_sid" => "account123",
         "date_created" => "Sat, 10 Jun 2023 22:49:57 +0000",
         "date_updated" => "Sat, 10 Jun 2023 22:49:57 +0000",
         "ice_servers" => [
           %{
             "url" => "stun:example.twilio.com:3478",
             "urls" => "stun:example.twilio.com:3478"
           },
           %{
             "credential" => "aaaaaaaaaaaaaaa",
             "url" => "turn:example.twilio.com:3478?transport=udp",
             "urls" => "turn:example.twilio.com:3478?transport=udp",
             "username" => "bbbbbbbbbbbbbb"
           },
           %{
             "credential" => "cccccccccccdddddddddd",
             "url" => "turn:example.twilio.com:3478?transport=tcp",
             "urls" => "turn:example.twilio.com:3478?transport=tcp",
             "username" => "xxxxxxxxxxxxyyyyyyyyyyyyy"
           }
         ],
         "password" => "password123",
         "ttl" => "86400",
         "username" => "username123"
       }}
end
