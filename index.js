const express = require("express");
const app = express();
const process = require("process");


let serverPort = process.env.PORT || 5000;


app.use(express.static(__dirname + "/public"));


app.set("port", serverPort);

/* Start the server on port 3000 */
app.listen(serverPort, function() {
  console.log(`Your app is ready at port ${serverPort}`);
});
