const gulp = require('gulp');
const through = require('through2');
const path = require('path');


const VERSION = "1.0.19.1";

function getJsCode(filePath, vinylFile){
    return vinylFile.contents;
}

function base64Encode(getCode){
    return through.obj(function (vinylFile, encoding, callback) {
        // 1. clone new vinyl file for manipulation
        // (See https://github.com/wearefractal/vinyl for vinyl attributes and functions)
        var transformedFile = vinylFile.clone();
        let filePath = path.parse(transformedFile.path);
        // 2. set new contents
        // * contents can only be a Buffer, Stream, or null
        // * This allows us to modify the vinyl file in memory and prevents the need to write back to the file system.
        //transformedFile.contents = Buffer.from(`"${filename}": "${vinylFile.contents.toString('base64')}",`);

        const code = encodeURIComponent(vinylFile.contents);
        transformedFile.contents = Buffer.from(`window.paletools = window.paletools || {};\nwindow.paletools['paletools-${VERSION}'] = "${code}";`);
        // 3. pass along transformed file for use in next `pipe()`
        callback(null, transformedFile);
      });
}

gulp.task('deploy', function () {
    return gulp.src(['./dist/*.js'])
            .pipe(base64Encode(getJsCode))
            .pipe(gulp.dest(`d:\\code\\eallegretta.github.io\\fifa\\paletools-v${VERSION}\\`));
});