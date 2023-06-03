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
         |> assign(:username, username)
         |> assign(:user_id, Ecto.UUID.bingenerate() |> Ecto.UUID.cast!())}

      _ ->
        :error
    end
  end

  @impl true
  def id(%{assigns: %{user_id: user_id}} = _socket), do: "user_id:#{user_id}"
end
