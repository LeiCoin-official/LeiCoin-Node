FROM debian:12-slim

RUN apt-get update && apt-get install -y curl ca-certificates openssl tar bash git

RUN mkdir /data
WORKDIR /data

COPY ./build/bin/leicoin-node-linux-x64-baseline /usr/local/bin/leicoin-node

# LeiCoin Net Port
EXPOSE 12200/tcp
# API Port
EXPOSE 12280/tcp

CMD [ "/usr/local/bin/leicoin-node", "run" ]
