#!/bin/bash
sleep 1

cd /home/container

echo "Starting..."

if [ -n "$STARTUP" ] && [[ "$STARTUP" == "start"* ]]; then
    # Use parameter expansion to extract all content after "start"
    args_after_start="${STARTUP#start }"

    # Replace placeholders in args_after_start using eval and sed
    MODIFIED_STARTUP=`eval echo $(echo ${args_after_start} | sed -e 's/{{/${/g' -e 's/}}/}/g')`

    args=$MODIFIED_STARTUP
else
    args="$@"
fi

run_experimental=false
branch_to_clone="main"

if [[ "$args" == *"--experimental"* ]]; then
    echo "Experimental mode is active!"
    run_experimental=true
    branch_to_clone="addfork"
fi

# Clone the GitHub repo to /home/container/tmp with the "docker" branch
git clone --single-branch --branch $branch_to_clone https://github.com/LeiCraft/LeiCoin-Node.git /home/container/gittmp

# Check the exit code of the git clone command
clone_exit_code=$?

# Check if the clone was successful
if [ $clone_exit_code -eq 0 ]; then
    # Copy all files to /home/container while excluding .git, .github, and files listed in .gitignore
    rsync -avq --delete --exclude='gittmp' --exclude='.git*' --exclude='docker' --exclude-from=/home/container/gittmp/.gitignore /home/container/gittmp/ /home/container/

    echo "GitHub repository cloned and files copied successfully."
else
    echo "Failed to clone the GitHub repository."
fi


# Start the Script
if [[ "$run_experimental" == "true" ]]; then

    
    
    node ./build/index.js $args
else
    node index.js $args
fi
