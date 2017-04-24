var fs = require( "fs" );
var restify = require( "restify" );
var app = restify.createServer();
 
app.get('/', function( req, res ){
    fs.readFile('index.html',function (err, data){
        res.writeHead(200, {'Content-Type': 'text/html','Content-Length':data.length});
        res.write(data);
        res.end();
    });
  }
);
 
app.get(/\/public\/?.*/, restify.serveStatic({
    directory: __dirname
}));

app.listen( 8080 );
console.log( "Server is running on 8080" );
