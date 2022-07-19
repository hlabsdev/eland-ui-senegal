#!/bin/bash

# Substitute env vars
envsubst '${API_URL} ${WORKFLOW_URL} ${KEYCLOAK_URL} ${FAS_API}' < /etc/nginx/conf.d/nginx.conf.template > /etc/nginx/conf.d/default.conf

# Start server
nginx -g 'daemon off;'
