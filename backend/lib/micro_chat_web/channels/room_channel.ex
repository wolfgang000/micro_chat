defmodule MicroChatWeb.RoomChannel do
  use MicroChatWeb, :channel

  @impl true
  def join("room:" <> _room_id, _payload, socket) do
    {:ok, socket}
  end

  @impl true
  def handle_in("client.new_message", %{"body" => body} = _payload, socket) do
    broadcast(socket, "server.new_message", %{
      "username" => socket.assigns.username,
      "body" => body,
      "created_at" => DateTime.utc_now() |> DateTime.to_iso8601()
    })

    {:noreply, socket}
  end
end
