defmodule MicroChatWeb.UserSocket do
  use Phoenix.Socket

  channel("room:*", MicroChatWeb.RoomChannel)

  def connect(
        %{
          "username" => username
        },
        socket,
        _connect_info
      ) do
    {:ok,
     socket
     |> assign(:username, username)}
  end

  @impl true
  def id(_socket), do: nil
end
