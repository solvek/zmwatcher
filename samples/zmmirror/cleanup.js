function getDateNumber(year, month, day){
    date = year;
    if (arguments.length > 1){
        date = new Date(year, month, day);
    }

    return date.getTime() / (24*60*60*1000);
}

var directories = ["/media/data/big_storage/Temp/dst"];
// Cleanup all content older then 3 days
var deleteOlderThen = getDateNumber(new Date())-3;
var simulateDeletion = false;

var fs = require("fs");
var path = require("path");

function deleteItem(subPath){
    var stat = fs.statSync(subPath);
    if (stat.isDirectory()){
        for(var item of fs.readdirSync(subPath)){
            deleteItem(path.join(subPath, item));
        }
        fs.rmdirSync(subPath);
        console.log(`Removed directory ${subPath}`);
    }
    else {
        fs.unlinkSync(subPath);
        console.log(`Removed file ${subPath}`);
    }
}

function checkItem(subPath, date){
    if (date < deleteOlderThen){
        if (simulateDeletion){
            console.log(`Item ${subPath} deleted (simulation only)`);
        }
        else {
            deleteItem(subPath);
        }
        return true;
    }

    return false;
}

function getDaysInMonth(year, month){
    return new Date(year, month+1, 0)
        .getDate();
}

var year, month, day, yearPath, monthPath, dayPath;

for(var dir of directories){
    for(var yearDir of fs.readdirSync(dir)){
        year = 2000+parseInt(yearDir);
        yearPath = path.join(dir, yearDir);
        if (checkItem(yearPath, getDateNumber(year, 11, 31))) continue;

        for(var monthDir of fs.readdirSync(yearPath)){
            month = parseInt(monthDir)-1;
            monthPath = path.join(yearPath, monthDir);
            if (checkItem(monthPath, getDateNumber(year, month, getDaysInMonth(year, month)))) continue;

            for(var dayDir of fs.readdirSync(monthPath)){
                day = parseInt(dayDir);
                dayPath = path.join(monthPath, dayDir);
                checkItem(dayPath, getDateNumber(year, month, day));
            }
        }
    }
}
