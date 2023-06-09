defmodule MicroChatWeb.RoomChannel do
  use MicroChatWeb, :channel
  alias MicroChatWeb.Presence
  alias MicroChat.WebRTC.IceServersProvider

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
  def handle_in("get_ice_servers", _payload, socket) do
    ice_servers = IceServersProvider.get_ice_servers()

    {:reply, {:ok, ice_servers}, socket}
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
    {:ok, _} =
      Presence.update(socket, socket.assigns.user_id, %{
        id_typing: typing,
        username: socket.assigns.username
      })

    %{metas: [meta | _]} = Presence.get_by_key(socket, socket.assigns.user_id)
    {:ok, _} = Presence.update(socket, socket.assigns.user_id, %{meta | id_typing: typing})

    {:reply, :ok, socket}
  end

  @impl true
  def handle_in("start_call", _payload, socket) do
    %{metas: [meta | _]} = Presence.get_by_key(socket, socket.assigns.user_id)
    {:ok, _} = Presence.update(socket, socket.assigns.user_id, %{meta | is_in_call: true})

    broadcast(socket, "a_call_was_started", %{
      "username" => socket.assigns.username
    })

    {:reply, :ok, socket}
  end

  @impl true
  def handle_in(
        "join_call",
        _payload,
        socket
      ) do
    %{metas: [meta | _]} = Presence.get_by_key(socket, socket.assigns.user_id)
    {:ok, _} = Presence.update(socket, socket.assigns.user_id, %{meta | is_in_call: true})

    {:reply, :ok, socket}
  end

  @impl true
  def handle_in(
        "leave_call",
        _payload,
        socket
      ) do
    %{metas: [meta | _]} = Presence.get_by_key(socket, socket.assigns.user_id)
    {:ok, _} = Presence.update(socket, socket.assigns.user_id, %{meta | is_in_call: false})

    {:reply, :ok, socket}
  end

  @impl true
  def handle_in(
        event = "answer:" <> _username,
        %{"answer" => answer},
        socket
      ) do
    broadcast_from(socket, event, %{
      username: socket.assigns.username,
      answer: answer
    })

    {:noreply, socket}
  end

  @impl true
  def handle_in(
        event = "offer:" <> _username,
        %{"offer" => offer},
        socket
      ) do
    broadcast_from(socket, event, %{
      username: socket.assigns.username,
      offer: offer
    })

    {:noreply, socket}
  end

  @impl true
  def handle_in(
        event = "ice_candidate:" <> _username,
        %{"ice_candidate" => ice_candidate},
        socket
      ) do
    broadcast_from(socket, event, %{
      username: socket.assigns.username,
      ice_candidate: ice_candidate
    })

    {:noreply, socket}
  end
end
