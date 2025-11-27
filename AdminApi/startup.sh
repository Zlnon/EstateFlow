#!/bin/bash

# 1. Point Root to /public (We already did this, but good to ensure)
sed -i "s|/home/site/wwwroot|/home/site/wwwroot/public|g" /etc/nginx/sites-available/default

# 2. Add Rewrite Rule (Critical for /api/login to work)
# This tells Nginx: "If file not found, pass to index.php"
sed -i 's|index index.php index.html index.htm;|index index.php index.html index.htm;\n\tlocation / {\n\t\ttry_files $uri $uri/ /index.php?$query_string;\n\t}|g' /etc/nginx/sites-available/default

# 3. Restart Nginx
service nginx reload