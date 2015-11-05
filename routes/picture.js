var express = require('express');
var Flickr = require('node-flickr');
var request = require('request');
var fs = require('fs');
var del = require('del');

var router = express.Router();
var keys = { api_key: process.env.FLICKR_KEY };
var flickr = new Flickr(keys);

router.get('/:noun', function (req, res, next) {

  search(req.params.noun, { tag_mode: 'all' }, function (response) {
    var photos = response.photos;
    var length = Number(photos.total) > 100 ? 100 : Number(photos.total);
    var selectedIndex = getRandomInt(1, length);
    var photo = photos.photo[selectedIndex];

    flickr.get('photos.getInfo', { photo_id: photo.id }, function (err, photoInfo) {
      var url = `https://farm${photo.farm}.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}.jpg`;
      var filename = '/tmp/' + photo.id + '.jpg';

      request.head(url, function (err, response, body) {
        request(url).pipe(fs.createWriteStream(filename)).on('close', function () {
          res.sendFile(filename);
          del(filename);
        });

      });
    });
  });
});

function search(tags, query, cb) {
  query = query || {};
  var defaults = {
    tags,
    safe_search: 1,
    tag_mode: 'any',
    per_page: 500,
  };
  var apiQuery = Object.assign(defaults, query);


  flickr.get('photos.search', apiQuery, function (err, response) {
    if (err) return console.error(err);

    var photos = response.photos;
    var length = Number(photos.total) > 100 ? 100 : Number(photos.total);
    if (length === 0) {
      if (apiQuery.tag_mode === 'all') {
        return search(apiQuery.tags, {}, cb);
      }
      return search('kitten', {}, cb);
    }

    cb(response);
  });
}
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

module.exports = router;
