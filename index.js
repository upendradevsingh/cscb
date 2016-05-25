/**
 * Created by upendra on 27/04/16.
 */

var fs = require("fs-extra");
var path = require('path');
var css = path.resolve(__dirname, '../public/live/css');
var crypto = require('crypto');
var jsonfile = require('jsonfile')

function done(err, results) {
    if(err){
        console.log(err);
        return;
    }
}

var results = {};

var walk = function(config) {
    var dir = config.src;
    fs.readdir(dir, function(err, list) {
        if (err) { return done(err); }
        var pending = list.length;
        if (!pending) { return done(null, results); }
        list.forEach(function(file) {
            fs.stat(dir + '/' + file, function(err, stat) {
                if (stat && stat.isDirectory())     {
                    walk(dir + '/' + file, function(err, res) {
                        if (!--pending){ done(null, results); }
                    });
                } else {
                    var fname = dir + "/" + file;
                // put your hash generation here
                generateHash(fname, function (e, hash) {
                    if (e) done(e);
                    file = file.split('.');
                    results[file[0]] = hash;
                    try {
                        fs.copySync(fname, dir + '/' + hash + '.' + file[1]);
                    } catch (err) {
                        console.error(err)
                    }
                    if (!--pending) {
                        jsonfile.writeFile(config.dest, results, {spaces: 2}, function(err) {
                            console.error(err);
                        });
                    }
                });
                }
            });
        });
    });
};

function generateHash (filename, callback) {
    var algorithm = 'sha1';
    var hash = crypto.createHash(algorithm);
    var fileStream = fs.ReadStream(filename);

    fileStream.on('data', function(data) {
        hash.update(data);
    });
    fileStream.on('end', function() {
        var digest = hash.update(crypto.randomBytes(256)).digest('hex');
        callback(null, digest);
    });
}

module.exports = walk;

