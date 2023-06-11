defmodule MicroChat.API.TwilioAPIClientBehaviour do
  @callback get_ice_servers_and_credentials() :: {:ok, map()} | {:error, HTTPoison.Error.t()}
end

defmodule MicroChat.API.TwilioAPIClient do
  @behaviour MicroChat.API.TwilioAPIClientBehaviour
  @base_uri "https://api.twilio.com"

  defp account_sid, do: Application.fetch_env!(:twilio, :account_sid)
  defp auth_token, do: Application.fetch_env!(:twilio, :auth_token)
  defp basic_auth_token, do: Base.encode64("#{account_sid()}:#{auth_token()}")

  defp headers() do
    [{"Authorization", "Basic #{basic_auth_token()}"}]
  end

  def get_ice_servers_and_credentials() do
    HTTPoison.post(
      "#{@base_uri}/2010-04-01/Accounts/#{account_sid()}/Tokens.json",
      "",
      headers()
    )
    |> case do
      {:ok, %HTTPoison.Response{status_code: 201, body: resp}} ->
        {:ok, Jason.decode!(resp)}

      error ->
        {:error, error}
    end
  end
end
