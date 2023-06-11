import Config

# Configure your database
#
# The MIX_TEST_PARTITION environment variable can be used
# to provide built-in test partitioning in CI environment.
# Run `mix help test` for more information.
# config :micro_chat, MicroChat.Repo,
#   username: "postgres",
#   password: "postgres",
#   hostname: "localhost",
#   database: "micro_chat_test#{System.get_env("MIX_TEST_PARTITION")}",
#   pool: Ecto.Adapters.SQL.Sandbox,
#   pool_size: 10

# We don't run a server during test. If one is required,
# you can enable the server option below.
config :micro_chat, MicroChatWeb.Endpoint,
  http: [ip: {127, 0, 0, 1}, port: 4002],
  secret_key_base: "NCc8Di115vY8FBCR3fOnTOqxdUS0IZQ91KdkdlyUJXhFvI7sbNIugjv5Dwsim15I",
  server: false

# Print only warnings and errors during test
config :logger, level: :warning

# Initialize plugs at runtime for faster test compilation
config :phoenix, :plug_init_mode, :runtime

config :micro_chat, MicroChat.API, twilio_api_client: MicroChat.API.TwilioAPIClientMock

config :micro_chat, MicroChat.WebRTC,
  ice_servers_provider: MicroChat.WebRTC.IceServersProviderMock

config :micro_chat, :children, []
