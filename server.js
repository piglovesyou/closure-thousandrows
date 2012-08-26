var url = require('url');
var fs = require('fs');
var path = require('path');
var querystring = require('querystring');
var crypto = require('crypto');


require('http').createServer(function (req, res) {
  var u = url.parse(req.url);
  var p = u.pathname.replace(/^\//, '');

  if (fs.existsSync(p)) {
    res.writeHead(200, {'Content-Type': getMimeType(p)});
    res.end(fs.readFileSync(p));
  } else if (p == 'rows') {
    var records =  createDummyRecords(querystring.parse(u.query));
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(records));
  } else {
    res.writeHead(404);
    res.end(demoLink);
  }

}).listen(3000);


var demoLink = '<p>NOT FOUND<br />VISIT <a href="/piglovesyou/goog/demos/thousandrows.html">/piglovesyou/goog/demos/thousandrows.html</a></p> ';
function getMimeType (p) {
  switch (path.extname(p)) {
    case '.html': return 'text/html';
    case '.js': return 'text/javascript';
    case '.css': return 'text/css';
  }
}
function isNum (v) { return typeof v == 'number' }
function toHashDigest (str) { return crypto.createHmac('sha1', 'so tired').update(str.toString()).digest('hex'); };

function createRandomTotal () {
  return 10000 - (Math.floor(Math.random() * 10) - 5);
}
function createDummyRecords (q) {
  var offset = isNum(+q.offset) ? +q.offset : 0;
  var count =  isNum(+q.count)  ? +q.count : 10;
  var rows = [];
  for (var i=offset;i<offset+count;i++) rows.push(createDummyRecord(i));
  return {
    total: createRandomTotal(),
    rows: rows
  };
}
function createDummyRecord (index) {
  return {
    index: index,
    id: toHashDigest(index),
    title: '==title' + index + '==',
    body: '...body...body...body...'
  };
};
