ExUnit.start()
# Ecto.Adapters.SQL.Sandbox.mode(MicroChat.Repo, :manual)
Mox.defmock(MicroChat.WebRTC.IceServersProviderMock,
  for: MicroChat.WebRTC.IceServersProviderBehaviour
)

Mox.defmock(MicroChat.API.TwilioAPIClientMock,
  for: MicroChat.API.TwilioAPIClientBehaviour
)
