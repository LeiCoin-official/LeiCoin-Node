#!/bin/bash
sleep 1

HOSTS_FILE="/etc/hosts"

# Function to add an entry to the hosts file
add_host() {
    local hostname="$1"
    local ip="$2"
    echo "$ip $hostname" >> "$HOSTS_FILE"
}

# Function to remove an entry from the hosts file
remove_host() {
    local hostname="$1"
    sed -i "/\s$hostname$/d" "$HOSTS_FILE"
}

cd /home/container

# Replace Startup Variables
MODIFIED_STARTUP=`eval echo $(echo ${STARTUP} | sed -e 's/{{/${/g' -e 's/}}/}/g')`
echo ":/home/container$ ${MODIFIED_STARTUP}"

# Run the Server
${MODIFIED_STARTUP}