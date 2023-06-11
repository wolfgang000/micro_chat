# This file is responsible for configuring your application
# and its dependencies with the aid of the Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.

# General application configuration
import Config

# config :micro_chat,
#   ecto_repos: [MicroChat.Repo]

# Configures the endpoint
config :micro_chat, MicroChatWeb.Endpoint,
  url: [host: "localhost"],
  render_errors: [
    formats: [json: MicroChatWeb.ErrorJSON],
    layout: false
  ],
  pubsub_server: MicroChat.PubSub,
  live_view: [signing_salt: "QFHXW2T6"]

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# Use Jason for JSON parsing in Phoenix
config :phoenix, :json_library, Jason

config :micro_chat, MicroChat.API, twilio_api_client: MicroChat.API.TwilioAPIClient

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{config_env()}.exs"
