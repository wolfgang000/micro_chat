defmodule MicroChatWeb.Presence do
  use Phoenix.Presence,
    otp_app: :micro_chat,
    pubsub_server: MicroChat.PubSub

  alias MicroChat.RoomStore

  def init(_opts) do
    # user-land state
    {:ok, %{}}
  end

  def handle_metas(topic, %{joins: joins, leaves: leaves}, presences, state) do
    Enum.each(joins, fn {user_id, _} ->
      IO.inspect({topic, user_id}, label: :handle_metas)
      RoomStore.add_user(topic, user_id)
    end)

    Enum.each(leaves, fn {user_id, _} ->
      RoomStore.remove_user(topic, user_id)
    end)

    {:ok, state}
  end
end
