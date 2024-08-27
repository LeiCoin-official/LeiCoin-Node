FROM node:18

RUN apt-get update && apt-get install -y git && apt-get install -y rsync

RUN adduser container --disabled-password

RUN chown -R container /home/container
RUN chmod -R 775 /home/container

USER container
ENV USER container
ENV HOME /home/container

WORKDIR /home/container

COPY ./docker-entrypoint.sh /docker-entrypoint.sh

EXPOSE 12200
EXPOSE 12280

CMD ["/bin/bash", "/docker-entrypoint.sh"]
