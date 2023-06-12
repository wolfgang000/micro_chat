defmodule MicroChatWeb.RoomChannel do
  use MicroChatWeb, :channel
  alias MicroChatWeb.Presence
  alias MicroChat.WebRTC.IceServersProvider

  @impl true
  def join("room:" <> _room_id, _payload, socket) do
    send(self(), :after_join)

    {:ok, %{user_id: socket.assigns.user_id}, socket}
  end

  @impl true
  def handle_info(:after_join, socket) do
    {:ok, _} =
      Presence.track(socket, socket.assigns.user_id, %{
        is_in_call: false,
        is_typing: false,
        username: socket.assigns.username
      })

    push(socket, "presence_state", Presence.list(socket))
    {:noreply, socket}
  end

  @impl true
  def handle_in("get_ice_servers", _payload, socket) do
    ice_servers = IceServersProvider.get_ice_servers()

    {:reply, {:ok, ice_servers}, socket}
  end

  @impl true
  def handle_in("message.create", %{"body" => body} = _payload, socket) do
    broadcast(socket, "message.created", %{
      "username" => socket.assigns.username,
      "user_id" => socket.assigns.user_id,
      "body" => body,
      "created_at" => DateTime.utc_now() |> DateTime.to_iso8601()
    })

    {:noreply, socket}
  end

  @impl true
  def handle_in("user:typing", %{"typing" => typing}, socket) do
    %{metas: [meta | _]} = Presence.get_by_key(socket, socket.assigns.user_id)
    {:ok, _} = Presence.update(socket, socket.assigns.user_id, %{meta | is_typing: typing})

    {:reply, :ok, socket}
  end

  @impl true
  def handle_in("start_call", _payload, socket) do
    %{metas: [meta | _]} = Presence.get_by_key(socket, socket.assigns.user_id)

    {:ok, _} =
      Presence.update(
        socket,
        socket.assigns.user_id,
        meta |> Map.put(:is_in_call, true)
      )

    broadcast(socket, "a_call_was_started", %{
      "username" => socket.assigns.username
    })

    {:reply, :ok, socket}
  end

  @impl true
  def handle_in(
        "leave_call",
        _payload,
        socket
      ) do
    %{metas: [meta | _]} = Presence.get_by_key(socket, socket.assigns.user_id)

    {:ok, _} =
      Presence.update(
        socket,
        socket.assigns.user_id,
        meta |> Map.put(:is_in_call, false)
      )

    broadcast(socket, "a_user_has_left_the_call", %{
      "username" => socket.assigns.username
    })

    {:reply, :ok, socket}
  end
end
