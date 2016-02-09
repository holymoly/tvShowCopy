var fs = require('fs');
var path = require('path');

var sourceDirectory = '';
var destinationDirectory = '';
var extensions = [];
var tvshows = [];

// Seperate on spaces (\s) and dots (.)
var tvShowSeparators = /[\s.]+/;
var regexSeasonEpisode = /(S\d{1,2})(E\d{1,2})/;

// print process.argv
process.argv.forEach(function (arg, index, array) {
  // -s source directory
  // -d destination directory
  // -e extensions point seperated

  if (arg === '-s'){
    isArgValid( array[index + 1], function(result){
      if ( result ){
        sourceDirectory = array[index + 1];
      } else {
        missingValue(arg);
      }
    });
  }

  if (arg === '-d'){
    isArgValid( array[index + 1], function(result){
      if ( result ){
        destinationDirectory = array[index + 1];
      } else {
        missingValue(arg);
      }
    });
  }

  if (arg === '-e'){
    isArgValid( array[index + 1], function(result){
      if ( result ){
        extensions = array[index + 1].split('.');
        if (extensions[0] === ''){
          extensions.shift();
        }
      } else {
        missingValue(arg);
      }
    });
  }

  if (arg === '-h'){
    console.log('');
    console.log('-s source directory');
    console.log('-d destination directory');
    console.log('-e extensions point seperated');
    console.log('');
    console.log('i.e. "tvcopy -s /downloads/ -d /tvshows -e .mkv.avi.mpg"');
    console.log('');
    return;
  }
});

//console.log("-s " + sourceDirectory);
//console.log("-d " + destinationDirectory);
//console.log("-e " + extensions);

isPathValid(sourceDirectory);
isPathValid(destinationDirectory);

// Get all tvshows in the destination
fs.readdir(destinationDirectory, function(err, data) {
  if (err) {
    console.log('Error: ' + err);
    process.exit(1);
  }
  tvshows = data;

  // Get download folders
  fs.readdir(sourceDirectory, function(err, downloadFolders) {
    if (err) {
      console.log('Error: ' + err);
      process.exit(1);
    }
    // Loop through download folders
    downloadFolders.forEach(function(folder){
      isFolderForTvShows(folder,function(source,destinationTvshow){
        //console.log( source + ' -> ' + destinationTvshow);
        //console.log( 'Checking Source for file extensions');

        // Check every single file of source if it is containing file with extension
        // from extensions array
        fs.readdir(path.join(sourceDirectory, source), function(err, data) {
            console.log(data);
          if(data !== undefined){
            data.forEach(function(file){
              extensions.forEach(function(extension){
                if (path.extname(file).indexOf(extension) > -1) {
                  var sourceFile = path.join(sourceDirectory, source, file);
                  //Check if source is a valid file
                  fs.stat(sourceFile, function(err, stats){
                    if (stats.isFile()){
                      var results = source.match(regexSeasonEpisode);
                      //Check if destination folder exists
                      fs.stat(path.join(destinationDirectory ,destinationTvshow, results[1]), function(err, stats){

                        if (stats !== undefined){
                          copy();
                        } else {
                          fs.mkdir(path.join(destinationDirectory ,destinationTvshow, results[1]), function(err){
                            if(err){
                              console.log(err);
                            }
                            copy();
                          });
                        }

                        function copy(){
                          var finalDirectory = path.join(destinationDirectory ,destinationTvshow, results[1], file);
                          console.log('Source: ' + sourceFile);
                          console.log('Destination: ' + finalDirectory);
                          // Do the Copy
                          var from= fs.createReadStream(sourceFile);
                          var to = fs.createWriteStream(finalDirectory);



                          from.on('end', function() {
                            console.log('Finished copying:' + file);

                            fs.unlink(sourceFile, function(excep){
                              if(excep){
                                console.log('Exception: ' + excep);
                              } else {
                                console.log('Deleted: ' + sourceFile);
                              }
                            });
                          });

                          from.on('error', function(err) {
                            console.log(err);
                          });

                          to.on('error', function(err) {
                            console.log(err);
                          });

                          from.pipe(to);
                        }
                      });
                    }
                  });
                }
              });
            });
          }
        });
      });
    });
  });
});


//*****************************************
function missingValue(arg){
  console.log('Missing value for ' + arg)
  process.exit(1);
}

// Check if arg is defined and  contains '-'
function isArgValid (item,cb){
  if (item !== undefined && item.indexOf('-') !== 0){
    cb(true);
  }else{
    cb(false);
  }
};

// check if path exit and is a Directory
function isPathValid(path){
  fs.stat(path, function(err, stats){
    if (err){
      console.log('Error in path ' + '"' + path + '"');
      process.exit(1);
    }
    if (stats.isFile()){
      console.log("Error in path " + '"' + path + '"' + ". Should be a directory not a File.");
      process.exit(1);
    }
  });
};

// Check if there is a existing tvshow for the folder
function isFolderForTvShows(folder,cb){
  tvshows.forEach(function(tvshow){
    //Seperate words of tv show
    var tokens = tvshow.split(tvShowSeparators);
    var isTvShowInFolder = true;

    // Check if tokens are in folder
    tokens.forEach(function(word){
      //If one word is not in folder name
      if(folder.toUpperCase().indexOf(word.toUpperCase()) === -1){
        isTvShowInFolder = false;
      }
    });
    if (isTvShowInFolder)
      //console.log(tvshow + ' / ' + folder + ' -> ' + isTvShowInFolder);
      cb(folder,tvshow);
  });
};

