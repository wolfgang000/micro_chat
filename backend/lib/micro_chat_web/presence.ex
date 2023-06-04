defmodule MicroChatWeb.Presence do
  use Phoenix.Presence,
    otp_app: :micro_chat,
    pubsub_server: MicroChat.PubSub
end
