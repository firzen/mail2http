(function(exports) {
    var console = require('console'), cp = require('child_process');
    var worker = cp.fork(__dirname + '/weibo_worker.js');

    //自动重启死亡worker子进程
    worker.on('exit', function() {
        console.log('mail2weibo worker is about to exit, refork the worker.');
        process.nextTick(function() {
            worker = cp.fork(__dirname + '/weibo_worker.js');
        });
    });

    //Master退出时杀死所有worker进程
    process.on('SIGTERM', function() {
        console.log('worker ' + worker.pid + ' killed');
        worker.kill();
        console.log('Master killed');
        process.exit(0);
    });

    process.on('uncaughtException', function(err) {
        console.error('Caught exception: ', err);
    });

    var to;
    exports.hook_rcpt = function(next, connection, params) {
        to = params[0].user
        if(this.config.get('rcpt_to_list', 'list').indexOf(to) === -1) {
            return next(DENY);
        }
        next();
    };

    exports.hook_queue = function(next, connection) {
        var lines = connection.transaction.data_lines;
        if(lines.length === 0) {
            return next(DENY);
        }
        next(OK);
        worker.send({
            mail : lines.join(''),
            to : to
        });
    };
})(exports);