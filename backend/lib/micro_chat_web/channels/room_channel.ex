defmodule MicroChatWeb.RoomChannel do
  use MicroChatWeb, :channel
  alias MicroChatWeb.Presence
  alias MicroChat.RoomStore

  @impl true
  def join(topic = "room:" <> room_id, _payload, socket) do
    room =
      case RoomStore.get_room(topic) do
        {:ok, room} ->
          room

        {:error, :not_found} ->
          RoomStore.add_room(topic, %{users: %{}})
      end

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
  def handle_in("user:typing", %{"typing" => typing}, socket) do
    %{metas: [meta | _]} = Presence.get_by_key(socket, socket.assigns.user_id)
    {:ok, _} = Presence.update(socket, socket.assigns.user_id, %{meta | id_typing: typing})

    {:reply, :ok, socket}
  end

  @impl true
  def handle_in("set.ice_candidates", %{"ice_candidates" => ice_candidates}, socket) do
    RoomStore.set_user_ice_candidates(socket.topic, socket.assigns.user_id, ice_candidates)

    {:reply, :ok, socket}
  end

  @impl true
  def handle_in("set.offer", %{"offer" => offer}, socket) do
    RoomStore.set_user_offer(socket.topic, socket.assigns.user_id, offer)

    {:reply, :ok, socket}
  end
end
