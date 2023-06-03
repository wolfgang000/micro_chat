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
# sudo DOKKU_TAG=v0.30.6 bash bootstrap.sh
# dokku plugin:install https://gitlab.com/notpushkin/dokku-monorepo
# dokku plugin:install https://github.com/dokku/dokku-letsencrypt.git

dokku apps:create micro-chat-back
dokku config:set micro-chat-back \
  # Set the variables from backend/.env.example.prod

dokku apps:create micro-chat-front
dokku config:set micro-chat-front \
  # Set the variables from frontend/.env.example.prod

# Setup SSL certificate
# Remember to open the 443 port
dokku letsencrypt:set micro-chat-front email test@mail.com
dokku letsencrypt:enable micro-chat-front
dokku letsencrypt:set micro-chat-back email test@mail.com
dokku letsencrypt:enable micro-chat-back
dokku letsencrypt:cron-job --add

# Setup domain
dokku domains:set micro-chat-front micro-chat.example.com
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
- [ ] Add video call with webrtc
- [ ] Add captcha
- [ ] Add credo + format validation
- [ ] Add user present tracking
- [ ] Add user present tracking(on typing)
- [ ] Add message insertion transition
- [ ] Add frontend logger
- [ ] Add 404 page
- [ ] Add share url on create room
- [ ] Add room name
- [ ] Add validations to username
