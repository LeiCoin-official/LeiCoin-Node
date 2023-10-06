#!/bin/ash

server_name="$1"

cert_dir="/home/container/cert"

if [ ! -f "$cert_dir/fullchain.pem" ] && [ ! -f "$cert_dir/privkey.pem" ] && [ ! -d "$cert_dir" ]; then
    mkdir -p "$cert_dir"

    echo "ℹ️ Generating SSL certificate for $server_name..."
    certbot --nginx -d "$server_name" --cert-path "$cert_dir/fullchain.pem" --key-path "$cert_dir/privkey.pem" --work-dir /home/container/tmp --logs-dir /home/container/tmp

    echo "⟳ Restarting Nginx to apply SSL certificate..."
    /usr/sbin/nginx -s reload
fi

rm -rf /home/container/tmp/*

echo "⟳ Starting PHP-FPM..."
/usr/sbin/php-fpm8 --fpm-config /home/container/php-fpm/php-fpm.conf --daemonize

echo "⟳ Starting Nginx..."
echo "✓ Successfully started"
/usr/sbin/nginx -c /home/container/nginx/nginx.conf -p /home/container/
