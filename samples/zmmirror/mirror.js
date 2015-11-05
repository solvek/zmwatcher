// Mirrors zone minder monitors to other location

var path = require("path");
var fs = require('fs-extra');
var os = require("os");
var util = require("util");

var zmwatcher = require("../..");

var configs = {
  SolvekServer:[
      {
          basePath: "/media/data/zoneminder/events",
          subPaths: ["Home"],
          destinationPath: "/home/Sergi/box.com/Cameras"
      }
  ],
  SolvekPC: [
      {
          basePath: "/media/data/big_storage/Temp",
          subPaths: ["src"],
          destinationPath: "/media/data/big_storage/Temp/dst"
      }
  ]
};

var config = configs[os.hostname()];

console.log(`Your hostname is ${os.hostname()}, current config ${util.inspect(config)}`);

var queue = [];
var isBusy = false;

function processQueue() {
    if (queue.length == 0) {
        isBusy = false;
        return;
    }

    if (isBusy) return;

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
        processQueue();
    });
}

for (var item of config) {
    for (var monitor of item.subPaths) {
        zmwatcher.watch(item.basePath, monitor, (filePath) => {
            console.log(`Created file ${filePath}`);
            var task = {
                src: path.join(item.basePath, filePath),
                dst: path.join(item.destinationPath, filePath)
            };
            queue.push(task);
            processQueue();
        });
    }
}

console.log("Watchers activated");