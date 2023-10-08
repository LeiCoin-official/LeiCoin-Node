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
for arg in "$@"; do
    if [ "$arg" == "--internal-port" ]; then
        # Get the port value after --internal-port
        internal_port="$1"
        break
    fi
done

node index.js
