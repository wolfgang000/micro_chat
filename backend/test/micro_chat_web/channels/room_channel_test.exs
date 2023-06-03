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
end
