#!/bin/sh

# Compress JS
java -jar compiler.jar --js ../src/* --js ../desk.js --js ../libs/bootstrap-dropdown.js --js ../libs/jquery.ui.touch-punch.min.js --js_output_file ../script.js

# Compress CSS
#if [ -e combined.css ]; then rm combined.css; fi
#cat ../*.css > style.css
yui-compressor ../common.css -o ../common.min.css
yui-compressor ../desk.css -o ../desk.min.css