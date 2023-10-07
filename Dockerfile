# Use the official PHP 8.1 Apache image as the base image
FROM php:8.1-apache

RUN apt-get update && apt-get install -y git
#RUN apt-get install apt-utils -y
#RUN apt-get install sudo -y

# Set the working directory to /home/container
WORKDIR /home/container

RUN git clone https://github.com/LeiCraft/LeiCoin-Node.git /home/gitrepo
RUN git config --global --add safe.directory /home/gitrepo

# Copy the Apache configuration file to the home directory

# Disable the default virtual host
RUN a2dissite 000-default

# Expose a placeholder port (you can use any unused port)
EXPOSE 12200

RUN sed -i "s/Listen 80/Listen 12200/" /etc/apache2/ports.conf


RUN echo 'Docker!' | passwd --stdin root 

# Define an entry point script to start Apache with the configured port and config
Copy start-apache.sh /start-apache.sh
CMD ["/bin/bash", "/start-apache.sh"]
