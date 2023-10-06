#!/bin/ash

server_name="$1"

cert_dir="/home/container/cert"

if [ ! -f "$cert_dir/fullchain.pem" ] || [ ! -f "$cert_dir/privkey.pem" ] || [ ! -d "$cert_dir" ]; then
    mkdir -p "$cert_dir"

    echo "ℹ️ Generating SSL certificate for $server_name..."
    certbot certonly --standalone -d "$server_name" --cert-path "$cert_dir/fullchain.pem" --key-path "$cert_dir/privkey.pem" --config-dir "$cert_dir" --work-dir /home/container/logs --logs-dir /home/container/logs --register-unsafely-without-email --non-interactive --agree-tos

    echo "⟳ Restarting Nginx to apply SSL certificate..."
    /usr/sbin/nginx -s reload
fi

# Define the file to store the last run timestamp
timestamp_file="$cert_dir/last_run_timestamp.txt"

# Define the cron expression for running once a month
cron_expression="0 0 1 * *"

# Get the current timestamp
current_timestamp=$(date +%s)

# Initialize the last run timestamp if it doesn't exist
if [ ! -f "$timestamp_file" ]; then
    echo "0" > "$timestamp_file"
fi

# Read the last run timestamp from the file
last_run_timestamp=$(cat "$timestamp_file")

# Calculate the time elapsed since the last run
time_elapsed=$((current_timestamp - last_run_timestamp))

# Check if it's been at least a month since the last run
if [ "$time_elapsed" -ge 2592000 ]; then
    # Execute Certbot to renew certificates
    certbot renew

    # Update the last run timestamp in the file
    echo "$current_timestamp" > "$timestamp_file"
else
    echo "Certificates were renewed within the last month. Skipping."
fi


rm -rf /home/container/tmp/*

echo "⟳ Starting PHP-FPM..."
/usr/sbin/php-fpm8 --fpm-config /home/container/php-fpm/php-fpm.conf --daemonize

echo "⟳ Starting Nginx..."
echo "✓ Successfully started"
/usr/sbin/nginx -c /home/container/nginx/nginx.conf -p /home/container/
