const scrollCreateLib = require('./scroll_create');
const express = require('express');
const path = require('path');

const app = express();
const router = express.Router();


function runServer() {
  router.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, '/index.html'));
  });
  router.get('/getscroll', async function(req, res) {
    // send the scroll zip folder to client as download
    const username = req.query.username;
    const zipBuffer = await scrollCreateLib.createScroll(username);
    const fileName = username + '_scroll.zip';
    const fileType = 'application/zip';
    res.writeHead(200, {
      'Content-Type': fileType,
      'Content-Disposition': `attachment; filename="${fileName}"`
    });
    res.end(zipBuffer);
  });
  app.use('/', router);
  app.use(express.static(__dirname + '/public'));

  let server = app.listen(3000, function() {
    console.log("App server is running on port 3000");
    console.log("to end press Ctrl + C");
  });
}


runServer();

