# CodeEditor [![npm version](https://img.shields.io/npm/v/codeeditor.svg?style=flat)](https://www.npmjs.com/package/codeeditor)

A generic React component for building customized code editors, based on Draft.js.

# Demo

[This simple C++ editor demo](http://gpoesia.com/random/codeeditor/demo.html).
exercises all the capabilities of the component, which right now are:

* Automatic indentation inside blocks (delimited by { and }); you can set the indent size.
* Customizable syntax highlighting.
* Automatically closing a block and starting a new line when the user opens a block (i.e. inserting a '}' automatically).
* Passing a callback for when the code is changed.

# Usage

This is the entire code of the demo page:

```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>CodeEditor demo</title>
    <script type="text/javascript" src="bundle.js"></script>
    <style type="text/css">
      #editor {
        width: 100%;
        height: 100%;
      }
    </style>
    <script type="text/javascript">
      function loadEditor() {
        var editor = document.getElementById("editor");
        CodeEditor.render(editor, {
          style: {
           width: '50%',
           height: '20em',
           border: '1px solid black',
           fontFamily: 'monospace',
           fontSize: '2em',
          },
          autoIndent: true,
          autoCloseBlocks: true,
          highlightingRules: [
            // Some keywords
            {
              regex: 'return|do|while|for|if|else|template|struct|class|using|namespace',
              style: {fontWeight: 'bold'},
            },
            // Some types
            {
              regex: 'int|char|void|short|unsigned|long|size_t|clock_t',
              style: {fontWeight: 'bold', color: '#000088'},
            },
            // Pre-processor lines
            {
              regex: '^#.*$',
              style: {color: 'green'},
            },
            // Strings
            {
              regex: '"[^"]*"',
              style: {color: 'red'},
            }
          ],
          initialCode: ("#include <iostream>\n" +
                        "using namespace std;\n" +
                        "int main(){\n" +
                        "    cout << \"Hello, world!\" << endl;\n" +
                        "    return 0;\n" +
                        "}\n"),
          indentSize: 4,
          onChange: function(code) { console.log("Code:===\n" + code + "\n===\n"); },
        });
      }
    </script>
  </head>
  <h1>Code Editor demo - C++ code editor</h1>
  <body onload="loadEditor();">
    <div id="editor"></div>
  </body>
</html>
```

# Contributing

There are a number of other features that could be added without much effort:

* Line numbers
* Support for other indentation rules (like Python's)
* Generic block delimiters

If you would like to implement any of these (or any other suggestions, of course),
I'd be happy to review and merge your changes. Please create an issue stating
what you would like to add and we can discuss it there.

# License

MIT. Basically, do anything you want provided you keep the copyright notice.
