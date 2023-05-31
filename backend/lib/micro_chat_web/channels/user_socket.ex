defmodule MicroChatWeb.UserSocket do
  use Phoenix.Socket

  channel("room:*", MicroChatWeb.RoomChannel)

  @impl true
  def connect(
        params,
        socket,
        _connect_info
      ) do
    case params do
      %{
        "username" => username
      } ->
        {:ok,
         socket
         |> assign(:username, username)}

      _ ->
        :error
    end
  end

  @impl true
  def id(_socket), do: nil
end
