defmodule MicroChatWeb.RoomChannelTest do
  use MicroChatWeb.ChannelCase

  setup do
    {:ok, _, socket} =
      MicroChatWeb.UserSocket
      |> socket("user_id", %{username: "test_user"})
      |> subscribe_and_join(MicroChatWeb.RoomChannel, "room:lobby")

    %{socket: socket}
  end

  test "send new message to room:lobby", %{socket: socket} do
    %{assigns: %{username: username}} = socket

    push(socket, "client.new_message", %{"msg" => "some text"})

    assert_broadcast("server.new_message", %{
      "msg" => "some text",
      "username" => ^username,
      "created_at" => _
    })
  end
end
