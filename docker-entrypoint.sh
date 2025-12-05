#!/bin/sh

# Start nginx in background
nginx

# Start the Node.js server
cd /app/server
node index.js
