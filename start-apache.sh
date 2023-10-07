#!/bin/bash

cd /home/container

echo "Cloning From Github"

if [-d "/home/container/.git"]; then
    git pull
else
    git clone https://github.com/LeiCraft/LeiCoin-Node.git /home/container
fi

echo "Server starting..."

# Function to start Apache server
start_apache() {
    # Use the provided port or prompt for one if empty
    # Symlink the Apache configuration file from the home directory
    ln -s /home/container/.apache/site-config.conf /etc/apache2/sites-available/leicoin-node.conf
    # Enable the site configuration
    a2ensite leicoin-node

    echo "Server Stardet"

    # Start the Apache server in the background
    apache2-foreground
}

# Function to stop Apache server
stop_apache() {
    # Stop the Apache server
    apachectl stop
}

# Trap SIGINT to prevent termination with Ctrl+C
#trap 'echo "Use 'exit' to quit."' INT

# Initialize variables to hold silent mode and remaining arguments
SILENT_MODE=false
REMAINING_ARGS=()

# Loop through command-line arguments
for arg in "$@"; do
    if [ "$arg" == "--silent-start" ]; then
        SILENT_MODE=true
    else
        REMAINING_ARGS+=("$arg")
    fi
done

# Prompt the user for action (start or exit)
while true; do

    if [ "$SILENT_MODE" == "true" ]; then
        ACTION="start"
        break
    else
        read -p "Enter 'start' to start Apache, or 'exit' to quit: " ACTION    
    fi
    echo "${STARTUP}"
    if [ -z "$STARTUP"]; then
        ACTION="start"
    fi


    if [ "$ACTION" == "start" ]; then
        start_apache
        break
    elif [ "$ACTION" == "exit" ]; then
        exit 0
    else
        echo "Invalid action. Use 'start' or 'exit'."
    fi
    # Prompt for additional commands after starting Apache
    #while [ "$ACTION" == "start" ]; do
        #read -p "Enter a command (or 'stop' to stop Apache): " COMMAND

        #if [ "$COMMAND" == "stop" ]; then
            #stop_apache
            #exit 0
        #else
            #echo "Executing command: $COMMAND"
            #eval $COMMAND
        #fi
    #done
done

