var path = require("path");
var fs = require("fs");
var util = require("util");

function Watcher(eventsPath, monitors, callback){
    var roots = [];
    this.roots = roots;

    var node;
    for (var monitor of monitors){
        console.log(`Adding monitor ${monitor} for path ${eventsPath}`);
        node = createNode(path.join(eventsPath, monitor), {
            eventsPath: eventsPath,
            monitor: monitor,
            callback: callback
        });
        roots.push(node);
    }
}

Watcher.prototype.unwatch = function(){
    for(var root of this.roots){
        unwatchNode(root);
    }
}

function findLastSubdir(dir){
    var subdirs = fs.readdirSync(dir);
    var result = null;
    var stat;
    for(var name of subdirs){
        stat = fs.statSync(path.join(dir, name));
        if (stat.isDirectory() && (result == null || result < name)){
            result = name;
        }
    }

    return result;
}

function watchNode(node, childName){
    console.log(`Setuping node for path ${node.path}`);

    if (childName === undefined){
        childName = findLastSubdir(node.path);
    }

    if (node.child){
        console.log(`Unwatching path ${node.child.path}`);
        unwatchNode(node.child);
    }

    if (childName){
        var child = createNode(
            path.join(node.path, childName),
            node.extra);
        node.child = child;
    }
    else {
        node.child = null;
    }

    if (!node.fswatcher){
        node.fswatcher = fs.watch(node.path, (event, name) => {
            console.log(`event is: ${event}`);
            if (event == "rename"){
                var subdir = path.join(node.path, name);
                var stat = fs.statSync(subdir);
                if (stat.isDirectory()){
                    watchNode(node, name);
                }
                else{
                    var relativePath = path.relative(node.extra.eventsPath, subdir);
                    node.extra.callback(relativePath);
                }
            }
        });
    }
}

function unwatchNode(node){
    var current = node;
    while(current){
        current.fswatcher.close();
        current = current.child;
    }
}

function createNode(path, extra){
    var node = {
        path: path,
        child: null,
        fswatcher: null,
        extra:extra
    };
    watchNode(node);
    return node;
}

/*
 Watches for one or more cameras changes
 parameters:
 eventsPath - the path to events directory
 cam1, cam2, cam3... - names of monitors to watch
 callback(filePath) - callback for a new file. filePath - relative path to file, the first segment will be the monitor name
 */
function watch(eventsPath){
    var monitors = Array.prototype.slice.call(arguments, 1, -1);

    console.log(`Arguremnts for watch: eventsPath = ${eventsPath}, monitors=${util.inspect(monitors)}`);

    var callback = arguments[arguments.length-1];
    return new Watcher(eventsPath, monitors, callback);
}

module.exports = {
    watch: watch
}