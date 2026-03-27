#!/bin/sh
set -e

# Fix ownership of the logs directory and its contents (bind mount may create as root)
if [ -d /app/src/logs ]; then
  chown -R appuser:nodejs /app/src/logs
fi

# Drop privileges and exec the CMD
exec su-exec appuser "$@"
