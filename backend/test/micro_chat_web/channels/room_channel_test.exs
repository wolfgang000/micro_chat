defmodule MicroChatWeb.RoomChannelTest do
  use MicroChatWeb.ChannelCase
  alias MicroChat.RoomStore

  describe "join" do
    test "join a room and create RoomStore record" do
      room_topic = "room:" <> (Ecto.UUID.bingenerate() |> Ecto.UUID.cast!())
      assert {:error, :not_found} = RoomStore.get_room(room_topic)

      assert {:ok, _, socket} =
               MicroChatWeb.UserSocket
               |> socket("user_id", %{
                 username: "test_user",
                 user_id: Ecto.UUID.bingenerate() |> Ecto.UUID.cast!()
               })
               |> subscribe_and_join(MicroChatWeb.RoomChannel, room_topic)

      # todo: Fix this race condition
      assert {:ok, _} = RoomStore.get_room(room_topic)
    end
  end

  describe "events" do
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
end
