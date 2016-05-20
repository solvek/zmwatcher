var path = require("path");

var deleteOlderThen = new Date();
deleteOlderThen.setDate(deleteOlderThen.getDate() - 3); // We are cleaning content older then 3 days

var config = {
    filterFiles: true, // Whether upload only files ending with "...capture.jpg"
    copyTimeout: 500, // Timeout before enqueuing file for upload. Without this timeout files can be uploaded before the are fully outputted by zm
    paths: [
        {
            basePath: "/media/data/zoneminder/events", // Base directory of ZM events
            subPaths: ["Home", "Corridor"], // List of cameras to watch (can be either camera numbers "1", "2" etc or camera's name
            destinationPath: "/home/sergi/box.com/Cameras" // The path where to mirror (this path is mounted for my box.com account)
        }],

    deleteDirs: [], // Paths to cleanup
    deleteOlderThen: deleteOlderThen, // Maximum day to clean
    simulateDeletion: false // If true then just nothing will be cleaned
};

for(var p of config.paths){
    for(var camera of p.subPaths){
        config.deleteDirs.push(path.join(p.destinationPath, camera));
    }
}

module.exports = config;


