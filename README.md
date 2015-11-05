zm-watcher
=========

Library provides possibility to watch for new files in [ZoneMinder|http://www.zoneminder.com/] events directory (per camera).
The purposes of this library to trigger new ZM event in real time.
[For example you can mirror files to another local directory or even to box.com cloud service.|http://blog.solvek.com/2015/11/zoneminder-mirror.html]

The library was tested with node.js 5 but it should work starting from node.js 0.12.x

## Installation

    npm installe zm-watcher
    
## Usage

    var zmwather = require("zmwatcher");
    
    var watcher = zmwatcher.watch("/path/to/events", "HomeCamera", "CorridorCamera", function(path){
        // Here we have path in form "HomeCamera/15/11/05/.../....jpg" - if a new image is placed
    });
       
    ...
    
    // Unwatch when not needed anymore
    watcher.unwatch();
    