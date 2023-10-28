#!/bin/bash
sleep 1

cd /home/container

echo "Starting..."

# Clone the GitHub repo to /home/container/tmp with the "docker" branch
git clone --single-branch --branch main https://github.com/LeiCraft/LeiCoin-Node.git /home/container/gittmp

# Check the exit code of the git clone command
clone_exit_code=$?

# Check if the clone was successful
if [ $clone_exit_code -eq 0 ]; then
    # Copy .gitignore to .dockerignore and add "-" before each ignore rule
    cp /home/container/gittmp/.gitignore /home/container/gittmp/.dockerignore
    sed -i '/^\s*#/!s/^\(.*\)$/ - \1/' /home/container/gittmp/.dockerignore

    # Read .dockerignore and add exclusion rules to rsync command
    while IFS= read -r line; do
        if [[ ! $line =~ ^\s*# ]]; then
            echo "--exclude='$line'" >> /home/container/gittmp/exclusion_rules
        fi
    done < /home/container/gittmp/.dockerignore

    # Copy all files to /home/container while excluding .git, .github, and files listed in .dockerignore
    rsync -avq --delete --exclude='gittmp' --exclude='.git*' --exclude='docker' --exclude-from=/home/container/gittmp/exclusion_rules /home/container/gittmp/ /home/container/

    echo "GitHub repository cloned, files copied successfully, and .dockerignore created."
else
    echo "Failed to clone the GitHub repository."
fi

# Remove temporary directories and exclusion rules file
rm -rf /home/container/gittmp

# Extract the value of --internal-port from STARTUP if it exists

if [ -n "$STARTUP" ] && [[ "$STARTUP" == "start"* ]]; then
    # Use parameter expansion to extract all content after "start"
    args_after_start="${STARTUP#start }"

    # Replace placeholders in args_after_start using eval and sed
    MODIFIED_STARTUP=$(eval echo $(echo ${args_after_start} | sed -e 's/{{/${/g' -e 's/}}/}/g'))

    # Pass the modified arguments to node index.js
    node index.js $MODIFIED_STARTUP
else
    # If the STARTUP condition is not met, pass all command line arguments directly to node index.js
    node index.js "$@"

    tail -f /dev/null
fi
