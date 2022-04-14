#!/bin/bash

args="--port $port --dport $dport --destination $destination"

if [ "$protocol" = "tcp" ]; then
  while true
  do
    node tcp.js $args
  done
elif [ "$protocol" = "udp" ]; then
  while true
  do
    node udp.js $args
  done
else
  echo "Invalid protocol $protocol"
fi