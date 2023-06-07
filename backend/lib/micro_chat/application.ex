defmodule MicroChat.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      # Start the Telemetry supervisor
      MicroChatWeb.Telemetry,
      # Start the Ecto repository
      # MicroChat.Repo,
      # Start the PubSub system
      {Phoenix.PubSub, name: MicroChat.PubSub},
      MicroChatWeb.Presence,
      # Start the Endpoint (http/https)
      MicroChatWeb.Endpoint,
      {MicroChat.RoomStore, []}
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: MicroChat.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  @impl true
  def config_change(changed, _new, removed) do
    MicroChatWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
