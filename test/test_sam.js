var SAM = require("../lib"),
    should = require("should")

exports.css = function() {
  var s = SAM().add("test/files/*.css")
  s.sources.length.should.eql(2)
}

exports.test_throws = function() {
  should.throws(function() {
    SAM().add("test/files/*.css", "test/files/*.js")
  })
}

exports.html_no_cache = function() {
  var s = SAM().add("test/files/*.css")
  s.toHTML().match(/link/g).length.should.eql(2)
}

exports.html_cache = function() {
  var s = SAM().cache("test/files/all.css").add("test/files/*.css")
  s.toHTML().match(/link/g).length.should.eql(1)
  s.write("test/files")
}

exports.html_cache_asset_host = function() {
  var s = SAM().add("test/files/*.css").host("http://126.011.10.1")
  s.toHTML().match(/126\.011\.10\.1/g).length.should.eql(2)
}
