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
    {:ok, _} =
      Presence.track(socket, socket.assigns.user_id, %{
        is_in_call: false,
        id_typing: false,
        username: socket.assigns.username
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
    %{metas: [meta | _]} = Presence.get_by_key(socket, socket.assigns.user_id)
    {:ok, _} = Presence.update(socket, socket.assigns.user_id, %{meta | id_typing: typing})

    {:reply, :ok, socket}
  end

  @impl true
  def handle_in("set.ice_candidates", %{"candidates" => candidates}, socket) do
    IO.inspect(candidates)
    {:reply, :ok, socket}
  end


  @impl true
  def handle_in("set.offer", %{"offer" => offer}, socket) do
    IO.inspect(offer)
    {:reply, :ok, socket}
  end


end
