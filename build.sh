#!/bin/bash

jsx --version &> /dev/null
if [ $? -ne 0 ]
then
    echo "jsx not found! Installing react-tools..."
    npm install -g react-tools
fi

echo "Building release directory..."
jsx src/ release/

browserify -o bundle.js -s CodeEditor release/CodeEditor.js
