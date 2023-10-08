#!/bin/bash
sleep 1

cd /home/container

echo "Starting..."

# Clone the GitHub repo to /home/container/tmp with the "docker" branch
# Clone the GitHub repo to /home/container/tmp with the "docker" branch
git clone --single-branch --branch main https://github.com/LeiCraft/LeiCoin-Node.git /home/container/gittmp

# Check the exit code of the git clone command
clone_exit_code=$?

# Check if the clone was successful
if [ $clone_exit_code -eq 0 ]; then
    # Copy all files to /home/container while excluding .git, .github, and files listed in .gitignore
    rsync -avq --exclude='.git*' --exclude=Dockerfile --exclude=docker-entrypoint.sh --filter=':- .gitignore' /home/container/gittmp/ /home/container/

    echo "GitHub repository cloned and files copied successfully."
else
    echo "Failed to clone the GitHub repository."
fi

# Remove temporary directories
rm -rf /home/container/gittmp

# Extract the value of --internal-port from STARTUP if it exists
internal_port=""

if [ -n "$STARTUP" ] && [[ "$STARTUP" == "start"* ]]; then
    # Use parameter expansion to extract the value after --internal-port
    raw_internal_port="${STARTUP#*--internal-port }"
    # Replace placeholders in raw_internal_port using eval and sed
    MODIFIED_STARTUP=$(eval echo $(echo ${raw_internal_port} | sed -e 's/{{/${/g' -e 's/}}/}/g'))
    # Use parameter expansion again to extract the modified value
    internal_port="${MODIFIED_STARTUP#*--internal-port }"
fi

# If --internal-port is not found in STARTUP, check regular shell arguments
if [ -z "$internal_port" ]; then
    for arg in "$@"; do
        if [ "$arg" == "--internal-port" ]; then
            # Get the port value after --internal-port
            internal_port="$1"
            break
        fi
    done
fi

# Update the Nginx configuration if internal_port is set
if [ -n "$internal_port" ]; then
    sed -i "s/\"port\": [0-9]\+,\"port\": $internal_port,/" /home/container/config/config.json

    echo "Updated config to listen on port $internal_port."
fi


node index.js
