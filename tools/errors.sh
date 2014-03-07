#!/bin/sh

gjslint -r ../src
fixjsstyle ../desk.js ../src/Workspace.js ../src/Apps.js ../src/App.js ../src/Network.js ../src/Storage.js
