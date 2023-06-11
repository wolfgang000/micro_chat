defmodule MicroChatWeb.RoomChannelTest do
  use MicroChatWeb.ChannelCase

  setup do
    {:ok, _, socket} =
      MicroChatWeb.UserSocket
      |> socket("user_id", %{
        username: "test_user",
        user_id: Ecto.UUID.bingenerate() |> Ecto.UUID.cast!()
      })
      |> subscribe_and_join(MicroChatWeb.RoomChannel, "room:lobby")

    %{socket: socket}
  end

  test "send new message to room:lobby", %{socket: socket} do
    %{assigns: %{username: username}} = socket

    push(socket, "client.new_message", %{"body" => "some text"})

    assert_broadcast("server.new_message", %{
      "body" => "some text",
      "username" => ^username,
      "created_at" => _
    })
  end

  test "get ice_server(google)", %{socket: socket} do
    Mox.stub_with(
      MicroChat.WebRTC.IceServersProviderMock,
      MicroChat.WebRTC.IceServersProviderGoogle
    )

    ref = push(socket, "get_ice_servers", %{})

    assert_reply ref, :ok, %{
      "iceServers" => [
        %{"urls" => ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"]}
      ]
    }
  end

  test "get ice_server(twilo)", %{socket: socket} do
    Mox.stub_with(
      MicroChat.WebRTC.IceServersProviderMock,
      MicroChat.WebRTC.IceServersProviderTwilio
    )

    ref = push(socket, "get_ice_servers", %{})

    assert_reply ref, :ok, %{
      "ice_servers" => [
        %{"url" => "stun:example.twilio.com:3478", "urls" => "stun:example.twilio.com:3478"} | _
      ]
    }
  end
end
