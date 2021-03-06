var redisClient = require('redis-connection')();
var uniki       = require('uniki');
/**
 * add - adds an entry into the List for a given url
 * @param {String} url - the url for the hit
 * @param {Object} hit - the hit we just received
 * @param {Function} callback - call this once redis responds
 */
module.exports.add = function add (hit, callback) {
  // console.log(hit);
  var url   = hit.url.replace('https://github.com', ''); // don't waste RAM!
  var now   = Date.now();
  var agent = uniki(hit['user-agent'],7);
  if(hit['accept-language'] && hit['accept-language'].indexOf(',') > -1){
    hit.lang = hit['accept-language'].split(',')[0];
  } else {
    hit.lang = '';
  }
  // console.log('agent',agent);
  redisClient.hset('agents', agent, hit['user-agent']);
  var entry = now + ' ' + agent + ' ' +hit.lang + ' ' + hit.ip
  redisClient.rpush(url, entry,  function (err, data) {
    callback(err, data)
  });
}

/**
 * count - counts the number of hits for a given url
 * @param {String} url - the url for the hit
 * @param {Function} callback - call this once redis responds
 */
module.exports.count = function count (url, callback) {
  console.log(url);
  url = url.replace('https://github.com', ''); // don't waste space in Redis
  redisClient.llen(url, function(err, data){
    callback(err, data);
  });
}


module.exports.redisClient = redisClient;
