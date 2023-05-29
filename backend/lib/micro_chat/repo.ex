defmodule MicroChat.Repo do
  use Ecto.Repo,
    otp_app: :micro_chat,
    adapter: Ecto.Adapters.Postgres
end
