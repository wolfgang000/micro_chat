defmodule MicroChatWeb.RoomChannel do
  use MicroChatWeb, :channel
  alias MicroChatWeb.Presence

  @impl true
  def join("room:" <> _room_id, _payload, socket) do
    send(self(), :after_join)

    {:ok, socket}
  end


  @impl true
  def handle_info(:after_join, socket) do
    {:ok, _} = Presence.track(socket, socket.assigns.user_id, %{
      id_typing: false,
      username: socket.assigns.username,
    })

    push(socket, "presence_state", Presence.list(socket))
    {:noreply, socket}
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


  @impl true
  def handle_in("user:typing", %{"typing" => typing}, socket) do

    {:ok, _} = Presence.update(socket, socket.assigns.user_id, %{
      id_typing: typing,
      username: socket.assigns.username,
    })

    {:reply, :ok, socket}
  end

end
