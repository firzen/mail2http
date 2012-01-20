var cluster = require('cluster');
var http = require('http');
var numCPUs = require('os').cpus().length;
var console = require('console');

var numReqs = 0;

if (cluster.isMaster) {
  // Fork workers.
  for (var i = 0; i < numCPUs; i++) {
    var worker = cluster.fork();
    worker.on('message', function(msg) {
      if (msg.cmd && msg.cmd === 'notifyRequest') {
        numReqs++;
      }
    });
  }

  setInterval(function() {
    console.log("numReqs =", numReqs);
  }, 5000);

  cluster.on('death', function(worker) {
    console.log('worker ' + worker.pid + ' died. restart...');
    cluster.fork();//重启woker进程. 但如果Master进程被杀死,worker进程都会被相继杀死.
  });

} else {
    http.Server(function(req, res) {
      res.writeHead(200);
      res.end(" hello world\n");
      // Send message to master process
      process.send({ cmd: 'notifyRequest' });
    }).listen(8000);  
}