#!/bin/bash

DAV_PATH=home/sergi/box.com/Cameras

# Delete all old files
find $DAV_PATH -mtime +4 -type f -delete

# Delete all empty directories
find $DAV_PATH -empty -type d -delete