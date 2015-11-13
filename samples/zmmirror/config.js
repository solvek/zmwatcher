var deleteOlderThen = new Date();
deleteOlderThen.setDate(deleteOlderThen.getDate() - 3);

var config = {
    filterFiles: false,
    minFileSize: 60000,
    paths: [
        {
            basePath: "/media/data/big_storage/Temp",
            subPaths: ["src"],
            destinationPath: "/media/data/big_storage/Temp/dst"
        }],

    deleteDirs: ["/media/data/big_storage/Temp/dst"],
    deleteOlderThen: deleteOlderThen,
    simulateDeletion: true
};


module.exports = config;


