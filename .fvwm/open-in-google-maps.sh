#!/bin/bash
address="$(xclip -o -selection clipboard)"
browser https://www.google.com/maps/search/"$address"
