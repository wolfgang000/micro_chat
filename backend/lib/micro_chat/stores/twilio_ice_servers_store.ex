defmodule MicroChat.Store.TwilioIceServersStore do
  use GenServer
  require Logger

  @twilio_api_client Application.compile_env!(:micro_chat, MicroChat.API)[:twilio_api_client]
  @refresh_buffer 10 * 60

  def start_link(state) do
    GenServer.start_link(__MODULE__, state, name: __MODULE__)
  end

  @impl true
  def init(_state) do
    {:ok, state} = refresh_ice_servers_credentials()
    {:ok, state}
  end

  @impl true
  def handle_info(:refresh_ice_servers_credentials, current_state) do
    case refresh_ice_servers_credentials() do
      {:ok, new_state} ->
        {:noreply, new_state}

      {:error, error} ->
        Logger.error(
          "Unable to refresh twilio ice servers credentials with reason: #{inspect(error, pretty: true)}"
        )

        # Try again
        Process.send_after(self(), :refresh_ice_servers_credentials, 30 * 1000)

        {:noreply, current_state}
    end
  end

  defp refresh_ice_servers_credentials do
    case @twilio_api_client.get_ice_servers_and_credentials() do
      {:ok, %{"ttl" => ttl} = ice_servers} ->
        refresh_time = (String.to_integer(ttl) - @refresh_buffer) * 1000
        Process.send_after(self(), :refresh_ice_servers_credentials, refresh_time)

        {:ok, ice_servers}

      {:error, error} ->
        {:error, error}
    end
  end

  @impl true
  def handle_call(:get_ice_servers, _from, state) do
    {:reply, state, state}
  end

  def get_ice_servers do
    GenServer.call(__MODULE__, :get_ice_servers)
  end
end
