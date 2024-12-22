FROM debian:11-slim

RUN apt-get update && apt-get install -y curl ca-certificates openssl tar bash git rsync

RUN adduser --disabled-password --home /home/container container

RUN chown -R container /home/container
RUN chmod -R 775 /home/container

USER container
ENV USER container
ENV HOME /home/container

WORKDIR /home/container

COPY ./docker-entrypoint.sh /docker-entrypoint.sh

# LeiCoin Net Port
EXPOSE 12200/tcp
EXPOSE 12200/udp

# API Port
EXPOSE 12280/tcp
EXPOSE 12280/udp

CMD ["/bin/bash", "/docker-entrypoint.sh"]
