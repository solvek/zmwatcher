// Mirrors zone minder monitors to other location

var path = require("path");
var fs = require('fs-extra');
var util = require("util");
var events = require('events');
var config = require("./config.js");

var zmwatcher = require("../..");

var queue = [];
var isBusy = false;

var eventEmitter = new events.EventEmitter();

const processQueueEvent = "processQueue";

eventEmitter.on(processQueueEvent, function(){
    if (queue.length == 0) {
        console.log("Queue is empty. Idle.");
        isBusy = false;
        return;
    }

    if (isBusy){
        console.log("Processor is busy exiting");
        return;
    }

    isBusy = true;

    var task = queue.pop();

    console.log(`Copying from ${task.src} to ${task.dst}`);
    fs.copy(task.src, task.dst, (err) => {
        if (err){
            console.error(err);
        }
        else {
            console.log(`File ${task.src} is copied`);
        }
        isBusy = false;
        eventEmitter.emit(processQueueEvent);
    });
});

console.log("Watchers setup...");

for (var item of config.paths) {
    for (var monitor of item.subPaths) {
        zmwatcher.watch(item.basePath, monitor, (filePath) => {
            //console.log(`Created file ${filePath}`);

            var baseName = path.basename(filePath);
            if (!config.filterFiles || baseName.endsWith("capture.jpg")) {
                setTimeout(function(){
                    var task = {
                        src: path.join(item.basePath, filePath),
                        dst: path.join(item.destinationPath, filePath)
                    };
                    queue.push(task);
                    eventEmitter.emit(processQueueEvent);
                }, config.copyTimeout);
            }
        });
    }
}

console.log("Watchers activated");