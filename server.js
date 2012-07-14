var url = require('url');
var fs = require('fs');
var querystring = require('querystring');
var crypto = require('crypto');


require('http').createServer(function (req, res) {
  var u = url.parse(req.url);
  var p = u.pathname.replace(/^\//, '');

  if (fs.existsSync(p)) {
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
function isNum (v) { return typeof v == 'number' }
function toHashDigest (str) { return crypto.createHmac('sha1', 'so tired').update(str.toString()).digest('hex'); };
function createDummyRecords (q) {
  var offset = isNum(+q.offset) ? +q.offset : 0;
  var count =  isNum(+q.count)  ? +q.count : 10;
  var docs = [];
  for (var i=offset;i<offset+count;i++) docs.push(createDummyRecord(i));
  return docs;
}
function createDummyRecord (index) {
  return {
    index: index,
    id: toHashDigest(index),
    title: '==title' + index + '==',
    body: '...body...body...body...'
  };
};
