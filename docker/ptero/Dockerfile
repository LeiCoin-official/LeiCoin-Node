FROM debian:12-slim

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
# API Port
EXPOSE 12280/tcp

CMD ["/bin/bash", "/docker-entrypoint.sh"]
