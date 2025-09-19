To generate an html file for running hello.c run the following:

emcc hello.c -o hello.html

This constructs a rather bloated html file that calls hello.js (also created by emcc),
which in turn calls a binary hello.wasm file (also created by emcc).

To open the hello.html page, you need to run a local server, e.g.,
open a terminal and run

python -m http.server 8010

Then open a browser (preferably in private mode to avoid cache) and go to the adderss:

localhost:8010