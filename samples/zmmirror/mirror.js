// Mirrors zone minder monitors to other location

var path = require("path");
var fs = require('fs');
var os = require("os");
var util = require("util");
var events = require('events');

var zmwatcher = require("../..");

var configs = {
  SolvekServer:[
      {
          basePath: "/media/data/zoneminder/events",
          subPaths: ["Home"],
          destinationPath: "/home/sergi/box.com/Cameras"
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

const FILTER_FILES = false;
const MIN_FILE_SIZE = 60000;

var config = configs[os.hostname()];

console.log(`Your hostname is ${os.hostname()}, current config ${util.inspect(config)}`);

var queue = [];
var isBusy = false;

var eventEmitter = new events.EventEmitter();

const processQueueEvent = "processQueue";

function makeDirs(dirsPath){
    var parts = [];
    var part;
    while(!fs.existsSync(dirsPath)){
        part = path.basename(dirsPath);
        dirsPath = path.dirname(dirsPath);
        parts.push(part);
    }

    while(parts.length > 0){
        part = parts.pop();
        dirsPath = path.join(dirsPath, part);
        fs.mkdir(dirsPath);
    }
}

function fileCopy(from, to, callback){
    makeDirs(path.dirname(to));

    console.log("Opening file for reading");
    var rr = fs.createReadStream(from, { flags: 'r+'});
    console.log("Opening file for writing");
    var ww = fs.createWriteStream(to);

    rr.on("end", ()=> {
        console.log("End of file achieved");
        rr.close();
        ww.close();
        callback();
    });

    rr.on("readable", () => {
        var chunk;
        while (null !== (chunk = rr.read())) {
            console.log(`got ${chunk.length} bytes of data`);
            ww.write(chunk);
        }
    });

    rr.on("error", callback);
}

// File copying testing
//var file = "/media/data/big_storage/Temp/Gippenreiter2.fb2";
//var file2 = file+".c2";
//var file3 = file+".c3";
//
//if (fs.existsSync(file2)){
//    fs.unlinkSync(file2);
//}
//
//if (fs.existsSync(file3)){
//    fs.unlinkSync(file3);
//}
//
//fileCopy(file, file2, () =>{});
//
//fileCopy(file2, file3, (err) =>{
//    if (err){
//        console.log(`Error while copying: ${err}`);
//    }
//    else{
//        console.log("Cuccessfully copied");
//    }
//});

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
    var task = queue.pop(); // Prefer to upload the most recent files first but this leads to corrupted images
    //var task = queue.shift();

    var stat = fs.statSync(task.src); // If the top file is still in progress
    if (stat.size < MIN_FILE_SIZE && queue.length>0){
        var task2 = task;
        task = queue.pop();
        queue.push(task2);
    }

    console.log(`Copying from ${task.src} to ${task.dst}`);
    fileCopy(task.src, task.dst, (err) => {
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

for (var item of config) {
    for (var monitor of item.subPaths) {
        zmwatcher.watch(item.basePath, monitor, (filePath) => {
            //console.log(`Created file ${filePath}`);

            var baseName = path.basename(filePath);
            if (!FILTER_FILES || baseName.endsWith("capture.jpg")) {
                var task = {
                    src: path.join(item.basePath, filePath),
                    dst: path.join(item.destinationPath, filePath)
                };
                queue.push(task);
                eventEmitter.emit(processQueueEvent);
            }
        });
    }
}

console.log("Watchers activated");