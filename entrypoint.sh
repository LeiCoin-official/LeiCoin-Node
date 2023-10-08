#!/bin/ash
sleep 1

cd /home/container

echo "Starting...1"

# Clone the GitHub repo to /home/container/tmp with the "docker" branch
git clone --single-branch --branch docker https://github.com/LeiCraft/LeiCoin-Node.git /home/container/gittmp

# Check the exit code of the git clone command
clone_exit_code=$?

# Check if the clone was successful
if [ $clone_exit_code -eq 0 ]; then
    echo "GitHub repository cloned successfully."

    # Copy specific folders manually
    if [ -d "/home/container/gittmp/nginx" ]; then
        cp -r "/home/container/gittmp/nginx" "/home/container/"
        echo "Copied nginx to /home/container/"
    else
        echo "nginx not found in the repository."
    fi

    if [ -d "/home/container/gittmp/php-fpm" ]; then
        cp -r "/home/container/gittmp/php-fpm" "/home/container/"
        echo "Copied php-fpm to /home/container/"
    else
        echo "php-fpm not found in the repository."
    fi

    # Create the "webroot" directory if it doesn't exist
    if [ ! -d "/home/container/webroot" ]; then
        mkdir "/home/container/webroot"
        echo "Created /home/container/webroot"
    fi

    # Create the "logs" directory if it doesn't exist
    if [ ! -d "/home/container/logs" ]; then
        mkdir "/home/container/logs"
        echo "Created /home/container/logs"
    fi

else
    echo "Failed to clone the GitHub repository."
fi

# Remove temporary directories
rm -rf /home/container/gittmp
rm -rf /home/container/tmp/*

# Check if the --internal-port option is in STARTUP
internal_port=""

echo "$STARTUP"

# Check if STARTUP is set and begins with "start"
if [ -n "$STARTUP" ] && [[ "$STARTUP" == "start"* ]]; then
    # Extract the arguments from the STARTUP environment variable
    args=($STARTUP)

    # Loop through the arguments and look for --internal-port
    for i in "${!args[@]}"; do
        if [[ "${args[i]}" == "--internal-port" ]]; then
            # Get the port value after --internal-port
            internal_port="${args[$((i + 1))]}"
            break
        fi
    done
fi

# If --internal-port is not found in STARTUP, check regular shell arguments
if [ -z "$internal_port" ]; then
    for arg in "$@"; do
        if [ "$arg" == "--internal-port" ]; then
            # Get the port value after --internal-port
            internal_port="${arg[$((i + 1))]}"
            break
        fi
    done
fi

# Update the Nginx configuration if internal_port is set
if [ -n "$internal_port" ]; then
    sed -i "s/listen 80;/listen $internal_port;/g" /home/container/nginx/conf.d/default.conf
    echo "Updated Nginx config to listen on port $internal_port."
fi

# Start PHP-FPM and Nginx
echo "⟳ Starting PHP-FPM..."
/usr/sbin/php-fpm8 --fpm-config /home/container/php-fpm/php-fpm.conf --daemonize

echo "⟳ Starting Nginx..."
echo "✓ Successfully started"
/usr/sbin/nginx -c /home/container/nginx/nginx.conf -p /home/container/
