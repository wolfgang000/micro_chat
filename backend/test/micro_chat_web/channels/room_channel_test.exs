defmodule MicroChatWeb.RoomChannelTest do
  use MicroChatWeb.ChannelCase
  import Mox
  setup :set_mox_from_context

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
    %{assigns: %{username: username, user_id: user_id}} = socket

    push(socket, "user:create_message", %{"body" => "some text"})

    assert_broadcast("message.created", %{
      "body" => "some text",
      "username" => ^username,
      "user_id" => ^user_id,
      "created_at" => _
    })
  end

  test "get ice_server(google)", %{socket: socket} do
    Mox.stub_with(
      MicroChat.WebRTC.IceServersProviderMock,
      MicroChat.WebRTC.IceServersProviderGoogle
    )

    ref = push(socket, "get_ice_servers", %{})

    assert_reply ref, :ok, [
      %{"urls" => ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"]}
    ]
  end

  test "get ice_server(twilo)", %{socket: socket} do
    Mox.stub_with(
      MicroChat.API.TwilioAPIClientMock,
      MicroChat.API.TwilioAPIClientStub
    )

    Mox.stub_with(
      MicroChat.WebRTC.IceServersProviderMock,
      MicroChat.WebRTC.IceServersProviderTwilio
    )

    start_supervised!(MicroChat.Store.TwilioIceServersStore)

    ref = push(socket, "get_ice_servers", %{})

    assert_reply ref, :ok, [
      %{"url" => "stun:example.twilio.com:3478", "urls" => "stun:example.twilio.com:3478"} | _
    ]
  end

  test "start_call", %{socket: socket} do
    %{assigns: %{username: username, user_id: user_id}} = socket

    Mox.stub_with(
      MicroChat.WebRTC.IceServersProviderMock,
      MicroChat.WebRTC.IceServersProviderGoogle
    )

    ref = push(socket, "user:start_call", %{})

    assert_broadcast("call:started", %{
      "username" => ^username,
      "user_id" => ^user_id
    })

    assert_reply ref, :ok, %{
      "ice_servers" => [_ | _]
    }
  end

  test "join_call", %{socket: socket} do
    %{assigns: %{username: username, user_id: user_id}} = socket

    Mox.stub_with(
      MicroChat.WebRTC.IceServersProviderMock,
      MicroChat.WebRTC.IceServersProviderGoogle
    )

    ref = push(socket, "user:join_call", %{})

    assert_broadcast("call:user_joined", %{
      "username" => ^username,
      "user_id" => ^user_id
    })

    assert_reply ref, :ok, %{
      "ice_servers" => [_ | _]
    }
  end

  test "leave_call", %{socket: socket} do
    %{assigns: %{username: username, user_id: user_id}} = socket

    Mox.stub_with(
      MicroChat.WebRTC.IceServersProviderMock,
      MicroChat.WebRTC.IceServersProviderGoogle
    )

    push(socket, "user:leave_call", %{})
    assert_broadcast("call:user_left", %{
      "username" => ^username,
      "user_id" => ^user_id
    })
  end
end
