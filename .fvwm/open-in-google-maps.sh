#!/bin/bash
address="$(xclip -o -selection clipboard)"
chromium-browser https://www.google.com/maps/search/"$address"
