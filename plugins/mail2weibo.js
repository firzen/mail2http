(function(exports){
    var console = require('console');

    exports.hook_rcpt = function (next, connection, params) {
        if(this.config.get('rcpt_to_list','list').indexOf(params[0].user) === -1 ){
            return next(DENY);
        }
        next(OK);
    };

    exports.hook_queue = function(next, connection) {
        var lines = connection.transaction.data_lines;
        if (lines.length === 0) {
            return next(DENY);
        }
        next(OK);
    };
})(exports);

