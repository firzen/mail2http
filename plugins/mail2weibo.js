(function(exports){
    var console = require('console'),
        cp = require('child_process');
    
    var worker = cp.fork(__dirname + '/weibo_worker.js');

    worker.on('exit', function () {
        console.log('worker is about to exit, refork the work.');
        worker = cp.fork(__dirname + '/weibo_worker.js');
    });

    var to ;
    exports.hook_rcpt = function (next, connection, params) {
        to = params[0].user
        if(this.config.get('rcpt_to_list','list').indexOf(to) === -1 ){
            return next(DENY);
        }
        
        next();
    };

    exports.hook_queue = function(next, connection) {
        var lines = connection.transaction.data_lines;
        if (lines.length === 0) {
            return next(DENY);
        }
        next(OK);

        worker.send({
            mail: lines.join(''),
            to: to
        });
    };
})(exports);

