sam
===

--> simple asset manager for node. Features:

* supports css / js 
* either separate files (for development)
* concatenated and cached (for production)
* optional CDN host configuration
* uglification for the best in javascript munging
* adds mtime stamp to bust any caches whenever the file changes

usage
----

* sam.js( file_list, options) 

or

* sam.css( file_list, options) 

options: 

* cache: name of cache file or falsy for off
* pub: path to the public directory
* host: asset host or falsey for off
* uglify: minify javascript

If cache is off then either method will return a string containing several html script or link elements
otherwise it will concatenate the files together and cache them.


Example Usage 
------
 
<pre>
var sam = require("sam")

sam.js([
  '/js/chess/board.js', 
  '/js/chess/pieces.js', 
  '/js/client/actions.js', 
  '/js/client/analysis.js'
], {
  cache: "chess.cache.js" ,
  pub: "public",
  host: "http://assets.64sq.com",
  uglify: true
})
</pre>


Install
-------

<pre>
sudo npm install sam
</pre>