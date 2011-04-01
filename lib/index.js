var fs = require("fs")

function mtime(path) {
  return (fs.statSync(path).mtime).getTime() / 1000;
}

exports.uglify = function(x) {
  // console.log(x)
  var jsp = require("./uglify/parse-js");
  var pro = require("./uglify/process");

  var orig_code = x;
  var ast = jsp.parse(orig_code); // parse code and get the initial AST
  ast = pro.ast_mangle(ast); // get a new AST with mangled names
  ast = pro.ast_squeeze(ast); // get an AST with compression optimizations
  var final_code = pro.gen_code(ast); // compressed code here
  return final_code
}

// sam.js([
//   '/js/chess/board.js', 
//   '/js/chess/pieces.js', 
//   '/js/client/actions.js', 
//   '/js/client/analysis.js'
// ], {
//   cache: "chess.cache.js" ,
//   pub: "public",
//   host: "http://assets.64sq.com",
//   uglify: true
// })

var fs = require("fs"),
    path = require("path"),
    glob = require("glob").globSync

function SAM() {
  if(this.constructor != SAM) return new SAM()
  this.sources = []
  this.type = null
  this._root = ""
  this._host = ""
  this._uglify = false
}

fn = SAM.prototype

fn.add = function() {
  var files = []
  
  for(var i=0; i < arguments.length; i++) {    
    var x = glob(join(this._root, arguments[i]))
    // console.log(arguments[i], x, files)
    files = files.concat(x)
  }
  
  for(var i=0; i<files.length;i++) {
    var file = files[i]

    if(!fs.statSync(file).isFile()) continue
    if(!type(file)) continue
    this.add_single(file)
  }
  
  return this
}

function ext(file) {
  return path.extname(file)
}

function type(file) {
  return types[ext(file)]
}

function base(file) {
  var x = file.split(".")
  x.pop()
  return x.join(".")
}

function dir(file) {
  return path.dirname(file)
}

var types = {
  '.k': '.js',
  '.js': '.js',
  '.css': '.css',
  '.coffee': '.js',
  '.styl': '.css',
  '.less': '.css'
}

var compilers = {
  '.js': function(text) {
    return text
  },
  '.css': function(text) {
    return text
  },
  '.k': function(text) {    
    return text
  },
  '.coffee': function(text) {
    return text
  },
  '.styl': function(text) {
    return text
  },
  '.less': function(text) {
    return text
  }
}

fn.add_single = function(src) {
  if(this.type && this.type != type(src)) throw "not allowed to mix css and js"
  this.type = type(src)
  
  // console.log(src.slice(this._root.length))
  this.sources.push({
    root: this._root,
    filename: src.slice(this._root.length)
  })
  return this
}

fn.cache = function(cache) {
  if(!cache) delete this._cache
  else this._cache = cache
  return this
}


fn.host = function(host) {
  this._host = host || ""
  return this
}

fn.uglify = function(uglify) {
  this._uglify = uglify
  return this
}

fn.root = function(root) {
  this._root = root || ""
  return this
}


fn.toHTML = function() {
  var html = ""

  var html_fn = this.type == ".css" ? link : script
  
  if(this._cache) {
    var m = 0
    for(var i=0; i< this.sources.length; i++) m += mtime(join(this.sources[i].root, this.sources[i].filename))
    return html_fn(this._host + this._cache + "?" + m)
  } else {
    for(var i=0; i< this.sources.length; i++)   {
      var m = mtime(join(this.sources[i].root, this.sources[i].filename))
      html += html_fn(this._host +  base(this.sources[i].filename) + this.type + "?" + m) + "\n"
    }
  } 
  return html
}

fn.write = function(dirname) {
  if(!fs.statSync(dirname).isDirectory()) dirname + "is not a directory"  
  
  if(this._uglify && !this.type == '.js') throw "cannot uglify css"
  
  if(this._cache) {
    var cache = []
    for(var i=0; i< this.sources.length; i++) {
      var file = this.sources[i]
      var text = fs.readFileSync(join(file.root, file.filename))
      var out = compilers[ext(file.filename)](text)
      cache.push(out)
    }
    out = cache.join(";\n")
    if(this._uglify) out = uglify(out)
    fs.writeFileSync(dirname + "/" + this._cache, out)
  } else {
    for(var i=0; i< this.sources.length; i++)   {
      var file = this.sources[i]
      var text = fs.readFileSync(join(file.root, file.filename))
      var out = compilers[ext(file.filename)](text)
      if(this._uglify) out = uglify(out)
      fs.writeFileSync(join(dirname, file.filename), out)
    }
  }
  return this
}

function script(src) { 
  return "<script src='" + src + "' type='text/javascript'></script>" 
}

function link(href) { 
  return "<link rel=stylesheet href='" + href + "' type='text/css' charset='utf-8' />" 
}


function join() {
  var args = []
  for(var i =0; i< arguments.length; i++) 
    args.push(arguments[i])
  
  return args.join("/").replace(/\/\/+/g, "/").replace(/\/$/, "").replace(/^\//,"")
}

module.exports = SAM
