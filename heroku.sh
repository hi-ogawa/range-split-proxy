#!/bin/bash

HEROKU_APP_NAME='range-split-proxy'
HEROKU_IMAGE_NAME="registry.heroku.com/${HEROKU_APP_NAME}/web"

LOCAL_IMAGE_NAME='range-split-proxy_prod'
LOCAL_BUILD_CMD='docker-compose build prod'

case $1 in
  dev)
    docker-compose up -d dev
    docker-compose exec dev bash
  ;;
  dev-stop)
    docker-compose stop
  ;;
  setup)
    heroku apps:create "${HEROKU_APP_NAME}"
    heroku container:login
  ;;
  cleanup)
    heroku apps:destroy "${HEROKU_APP_NAME}"
  ;;
  deploy)
    eval "${LOCAL_BUILD_CMD}" && \
    docker tag "${LOCAL_IMAGE_NAME}" "${HEROKU_IMAGE_NAME}" && \
    docker push "${HEROKU_IMAGE_NAME}" && \
    heroku container:release --app="${HEROKU_APP_NAME}" web
  ;;
  url)
    heroku apps:info --app="${HEROKU_APP_NAME}" -s 2>/dev/null | grep web_url | cut -d '=' -f 2
  ;;
esac
