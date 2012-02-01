(function(exports){
    var console = require('console'),
    cp = require('child_process');
    
    var worker = cp.fork(__dirname + '/worker.js');

    worker.on('message', function(m) {
      console.log('message from worker:', m);
    });

    

    var postURL;
    exports.register = function () {
        postURL = this.config.get('mail2http.url');
    };


    exports.hook_queue = function(next, connection) {
        var lines = connection.transaction.data_lines;
        if (lines.length === 0) {
            return next(DENY);
        }
        next();
        worker.send({
            mail: lines.join(''),
            postURL : postURL
        });
    };
})(exports);

