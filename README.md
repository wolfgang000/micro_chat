<p align=center>
<img src="https://github.com/wolfgang000/micro_chat/assets/4041136/196d0fbe-41be-4dd7-a74b-4d88c2d82b19"/>  
</p>
<p align=center>
  A simple messaging/video chat app that does not save/track or monitor your messages.
  
  Thus if you were not present in the chat room when your friends were chatting about the last John Wick movie, tough luck, those messages are gone.
</p>

[![Backend CI badge](https://github.com/wolfgang000/micro_chat/actions/workflows/backend-ci.yml/badge.svg?branch=main)](https://github.com/wolfgang000/micro_chat/actions/workflows/backend-ci.yml?query=branch%3Amain)
[![Frontend CI badge](https://github.com/wolfgang000/micro_chat/actions/workflows/frontend-ci.yml/badge.svg?branch=main)](https://github.com/wolfgang000/micro_chat/actions/workflows/frontend-ci.yml?query=branch%3Amain)
[![E2E CI badge](https://github.com/wolfgang000/micro_chat/actions/workflows/e2e-ci.yml/badge.svg?branch=main)](https://github.com/wolfgang000/micro_chat/actions/workflows/e2e-ci.yml?query=branch%3Amain)

# Get started

```
docker compose up
```

Frontend: http://localhost:5173

Backend: http://localhost:4000

## Tests

[Backend](backend/README.md#tests)

[Frontend + E2E](frontend/README.md#run-end-to-end-tests-with-playwright)

# Deployment

## Setup server

```
# Install dokku
# wget -NP . https://dokku.com/bootstrap.sh
# sudo DOKKU_TAG=v0.32.4 bash bootstrap.sh
# dokku plugin:install https://github.com/dokku/dokku-letsencrypt.git

dokku apps:create micro-chat-back
dokku builder:set micro-chat-back build-dir backend
dokku config:set micro-chat-back \
  # Set the variables from backend/.env.example.prod

dokku apps:create micro-chat-front
dokku builder:set micro-chat-front build-dir frontend
dokku config:set micro-chat-front \
  # Set the variables from frontend/.env.example.prod

# Setup domain
dokku domains:set micro-chat-front micro-chat.example.com
dokku domains:set micro-chat-back micro-chat-back.example.com

# Setup SSL certificate
# Remember to open the 443 port
dokku letsencrypt:set micro-chat-front email test@mail.com
dokku letsencrypt:enable micro-chat-front
dokku letsencrypt:set micro-chat-back email test@mail.com
dokku letsencrypt:enable micro-chat-back
dokku letsencrypt:cron-job --add
```

## Deploy and push changes

```
git remote add server-backend dokku@example.com:micro-chat-back
git remote add server-frontend dokku@example.com:micro-chat-front

git push server-backend
git push server-frontend
```

# Production debugging

## Enter to the container

```
dokku enter micro-chat-back web /bin/sh
```

## Open a remote elixir console

```
dokku enter micro-chat-back web bin/micro_chat remote
```

## Show logs

```
dokku logs micro-chat-back
```

---

### Todo

- [ ] Add password protection
- [ ] Add captcha
- [ ] Add credo + format validation
- [ ] Add tests Coverage
- [ ] Add logger(front + back)
- [ ] Add 404 page
- [ ] Add room name
- [ ] Add validations to username(front + back)
- [ ] Add logo to login view
- [ ] Handle connections error on WebRTC
- [ ] Add username to video elements
