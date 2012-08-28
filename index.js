var redis = require('redis');
var rclient = redis.createClient();

// Initializing redis client
//
rclient.select(13);

var restify = require('restify');

function pop(req, res, next){
    var key = req.params.queue.replace('/', '_');
    rclient.BRPOP(key, function(err, reply){
        if(err){ res.status(500); res.end(err); }

        if(reply){
            res.status(200);
            res.end(reply);
        }else{
            //Do something timeout ish
            setTimeout(function(){ pop(req, res, next); }, 100);
        }
    });
}        

function push(req, res, next){
    var key = req.params.queue.replace('/', '_');
    var data = '';

    req.on('data', function(c){ data += c; });
    req.on('end', function(){
        rclient.LPUSH(key, data, function(err, result){
            res.status(200);
            res.end('Successfully pushed your data');
        });
    });
}

var server = restify.createServer();
server.get('/:queue', pop);
server.put('/:queue', push);

console.log("About to listen on port 8080");
server.listen(8080);
console.log("Should now be listening");
