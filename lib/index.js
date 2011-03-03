var fs = require("fs")

exports.script = function(src) { 
  return "<script src='" + src + "' type='text/javascript'></script>" 
}

exports.link = function(href) { 
  return "<link rel=stylesheet href='" + href + "' type='text/css' charset='utf-8' />" 
}

function mtime(path) {
  return (fs.statSync(path).mtime).getTime() / 1000;
}

exports.uglify = function(x) {
  // console.log(x)
  var jsp = require("./uglifyjs/parse-js");
  var pro = require("./uglifyjs/process");

  var orig_code = x;
  var ast = jsp.parse(orig_code); // parse code and get the initial AST
  ast = pro.ast_mangle(ast); // get a new AST with mangled names
  ast = pro.ast_squeeze(ast); // get an AST with compression optimizations
  var final_code = pro.gen_code(ast); // compressed code here
  return final_code
}

exports.js = function(files, o) {
  var host = o.host || ""
  if(o.cache) {
    var cache = []
    var m = 0
    for(var i=0; i< files.length; i++)   {
      // console.log(files[i])
      var js = fs.readFileSync(o.pub + files[i]).toString()
      m += mtime(o.pub + files[i].toString())  
      if(o.uglify) js = exports.uglify(js)
      cache.push( js)
    }
    var path = o.cache
    var js = cache.join(";\n")
    fs.writeFileSync( o.pub + "/" +  path, js)
    return exports.script(host + "/" + path + "?" + m)
  } else {
    var assets = []
    for(var i=0; i< files.length; i++)   {
      var m = mtime(o.pub + files[i].toString())
      assets.push( exports.script(host + files[i] + "?" + m) )
    }
    return assets.join("\n")
  }
}

exports.css = function(files, o) {
  var host = o.host || ""
  
  if(o.cache) {
    var cache = []
    var m = 0
    for(var i=0; i< files.length; i++)   {
      m += mtime(o.pub + files[i].toString())
      cache.push( fs.readFileSync(o.pub + files[i].toString()))
    }
    var path = o.cache
    var css = cache.join("\n")
    fs.writeFileSync( o.pub + "/" + path,  css )
    return exports.link(host + "/"  + path + "?" +m)
  } 
  else {
    var assets = []
    for(var i=0; i< files.length; i++) {
      var m = mtime(o.pub + files[i].toString())
      assets.push( exports.link(host + files[i] + "?" + m) )
    }

    return assets.join("\n")
  }
}