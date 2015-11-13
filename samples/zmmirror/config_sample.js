var path = require("path");

var deleteOlderThen = new Date();
deleteOlderThen.setDate(deleteOlderThen.getDate() - 3);

var config = {
    filterFiles: true,
    copyTimeout: 500,
    paths: [
        {
            basePath: "/media/data/zoneminder/events",
            subPaths: ["Home"],
            destinationPath: "/home/sergi/box.com/Cameras"
        }],

    deleteDirs: [],
    deleteOlderThen: deleteOlderThen,
    simulateDeletion: false
};

for(var p of config.paths){
    for(var camera of p.subPaths){
        config.deleteDirs.push(path.join(p.destinationPath, camera));
    }
}

module.exports = config;


