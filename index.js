/**
 * Created by upendra on 27/04/16.
 */

var fs = require("fs-extra");
var path = require('path');
var css = path.resolve(__dirname, '../public/live/css');
var crypto = require('crypto');
var jsonfile = require('jsonfile')

function exec(err, results) {
    if(err){
        console.log(err);
        return;
    }
}

var results = {};

var walk = function(config) {
    var dir = config.src; // Source directory
    var done = config.cb || exec; // callback

    var list = fs.readdirSync(dir); // File list in the source directory
    var pending = list.length;

    if (!pending) {
     return done(null, results); 
    }

    list.forEach(function(file) {
        var fname = dir + "/" + file;
        var stat = fs.statSync(fname);

        if (stat && stat.isDirectory()){
            walk(fname, function(err, res) {
                if (!--pending){ done(null, results); }
            });
        } else {
            generateHash(fname, function (e, hash) {
                if (e){
                    done(e)
                }
                file = file.split('.');
                results[file[0]] = hash;
                try {
                    fs.copySync(fname, dir + '/' + hash + '.' + file[1]);
                } catch (err) {
                    console.error(err)
                }
                if (!--pending) {
                    jsonfile.writeFileSync(config.dest, results, {spaces: 2});
                }
            });
        }
        
    });
    
};

/**
 * Generate hash of a file content
 */


function generateHash (filename, callback) {
    var algorithm = 'sha1';
    var hash = crypto.createHash(algorithm);
    var fileStream = fs.ReadStream(filename);

    fileStream.on('data', function(data) {
        hash.update(data);
    });
    fileStream.on('end', function() {
        var digest = hash.digest('hex');
        callback(null, digest);
    });
}

module.exports = walk;

