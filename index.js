var redis = require('redis');
var request = require('request');


// Initializing redis client
//
var rclient = redis.createClient();
rclient.select(13);

var restify = require('restify');

function readyClient(req, res, next){
    var queue = req.params.queue.replace('/', '_');
    var cb = req.header('roboq-callback');
    
    if(cb.substring(0, 6) !== 'http://'){
        res.status(400);
        res.end("CB NOT HTTP");
        return;
    }
    
    res.status(200);
    res.end("DONE "+queue+);

    process.nextTick(function(){
        rclient.BRPOP(queue, function(err, reply){
            if(err){ 
                // TODO:  Do something error-ish
            }

            if(reply){
                request.({ method: 'POST', uri: cb, body: reply}, function(err, resp, body){
                    //TODO: Something about handling errors

                });
            }else { /* Do something about faulty answers  */ }
        }); 
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
server.get('/:queue', readyClient);
server.put('/:queue', push);

console.log("About to listen on port 4568");
server.listen(4568);
console.log("Should now be listening");
