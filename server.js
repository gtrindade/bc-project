var http = require( "http" );
 
var server = http.createServer(
  function( request, response ){
    fs.readFile('index.html',function (err, data){
        res.writeHead(200, {'Content-Type': 'text/html','Content-Length':data.length});
        res.write(data);
        res.end();
    });
  }
);
 
server.listen( 8080 );
console.log( "Server is running on 8080" );
