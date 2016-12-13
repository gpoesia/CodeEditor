/*
 * CodeEditor.
 */

var React = require("react");
var ReactDOM = require("react-dom");
var Draft = require("draft-js");

var Editor = Draft.Editor;
var EditorState = Draft.EditorState;
var ContentState = Draft.ContentState;
var Modifier = Draft.Modifier;
var CompositeDecorator = Draft.CompositeDecorator;

function createSpanWithStyle(style) {
  return React.createClass({
    render: function() {
      return <span style={style}>{this.props.children}</span>;
    }
  });
}

function indentationLevelAt(content, key, offset) {
  var level = 0;

  content.getBlockMap().forEach(function(block, blockKey) {
    var text = block.getText();

    for (var i = 0; i < text.length; i++) {
      if (blockKey !== key || i < offset) {
        if (text[i] === "{") {
          level++;
        } else if (text[i] === "}") {
          level--;
        }
      }
    }

    return blockKey !== key;
  });

  return level;
}

function shiftSelectionRight(selection) {
  return selection.set("anchorOffset", selection.getAnchorOffset() + 1)
                  .set("focusOffset", selection.getFocusOffset() + 1);
}

function getCode(content) {
  var code = "";
  content.getBlockMap().forEach(function(block) {
    code += block.getText() + "\n";
  });
  return code;
}

var CodeEditor = React.createClass({
  componentWillMount: function() {
    if (this.props.parameters.style === undefined) {
      this.props.parameters.style = {
        border: "1px solid black",
        fontFamily: "monospace",
        height: "20em",
        width: "50%",
        fontSize: "2em",
      };
    }
  },

  getInitialState: function() {
    // Given a regex, returns a corresponding 'strategy' for CompositeDecorator:
    // a function that calls its callback for all matches of the regex in
    // a block's content.
    function strategyForRegEx(regex) {
      // Ensure the 'global' flag is set.
      if (regex instanceof RegExp) {
        regex = regex.source;
      }
      regex = new RegExp(regex, "g");

      return function(contentBlock, callback) {
        var text = contentBlock.getText();
        var matchArr = null;
        while ((matchArr = regex.exec(text)) !== null) {
          var start = matchArr.index;
          callback(start, start + matchArr[0].length);
        }
      };
    }

    var strategies = [];

    if (this.props.parameters.highlightingRules) {
      for (var i = 0; i < this.props.parameters.highlightingRules.length; i++) {
        var rule = this.props.parameters.highlightingRules[i];
        strategies.push({
          strategy: strategyForRegEx(rule.regex),
          component: createSpanWithStyle(rule.style),
        });
      }
    }

    return {
      state: EditorState.createWithContent(
                 ContentState.createFromText(
                   this.props.parameters.initialCode || ""),
                 new CompositeDecorator(strategies)),
    };
  },

  onChange: function(newState) {
    this.setState({state: newState});
    console.log("onChange");

    if (this.props.parameters.onChange) {
      console.log("Calling onChange");
      this.props.parameters.onChange(getCode(newState.getCurrentContent()));
    }
  },

  _insertLineAfter: function(content, selection, line) {
    var key = selection.getFocusKey();
    content = Modifier.splitBlock(content, selection);

    var newBlockKey = content.getKeyAfter(key);
    var newBlockSelection = new Draft.SelectionState({
      anchorKey: newBlockKey,
      anchorOffset: 0,
      focusKey: newBlockKey,
      focusOffset: 0,
      isBackward: false,
      hasFocus: true
    });

    return Modifier.insertText(content, newBlockSelection, line);
  },

  // Handles the return (Enter) key if autoindent is enabled.
  _handleReturn: function(e) {
    if (this.props.parameters.autoIndent) {
      var state = this.state.state;
      var selection = state.getSelection();

      var indentationLevel = indentationLevelAt(state.getCurrentContent(),
                                                selection.getFocusKey(),
                                                selection.getFocusOffset());

      if (state.getCurrentContent().getBlockForKey(selection.getFocusKey())
               .getText().substr(selection.getFocusOffset())
               .trim().startsWith("}")) {
        indentationLevel--;
      }

      state = EditorState.push(
          state,
          this._insertLineAfter(state.getCurrentContent(),
            selection,
            this._generateIndentation(indentationLevel)),
          "inserted-text"
          );

      this.setState({state: state});

      return "handled";
    } else {
      return "not-handled";
    }
  },

  _handleBeforeInput: function(input) {
    if (input === "{") {
      if (this.props.parameters.autoCloseBlocks) {
        var state = this.state.state;
        var content = state.getCurrentContent();
        var selection = state.getSelection();
        var focusKey = selection.getFocusKey();
        var focusOffset = selection.getFocusOffset();
        var block = content.getBlockForKey(focusKey);
        var blockText = block.getText();
        var currentIndentationLevel =
          indentationLevelAt(content, focusKey, focusOffset);

        var selectionAtEndOfFocusBlock =
          selection.set("anchorKey", focusKey)
                   .set("anchorOffset", blockText.length)
                   .set("focusOffset", blockText.length);

        content = this._insertLineAfter(
            content, selectionAtEndOfFocusBlock,
            this._generateIndentation(currentIndentationLevel) + "}");

        content = Modifier.insertText(
            content,
            selection,
            "{");

        content = this._insertLineAfter(
            content,
            shiftSelectionRight(selection),
            this._generateIndentation(currentIndentationLevel + 1));

        this.setState({
          state: EditorState.push(state, content, "inserted-text")
        });

        return "handled";
      }
    }
    return "not-handled";
  },

  // Generates a string with spaces to indent at the given level.
  _generateIndentation: function(level) {
    var indentSize = this.props.parameters.indentSize || 2;
    return " ".repeat(indentSize * level);
  },

  // Focuses the editor, if it has already been rendered.
  focus: function() {
    if (this.refs.editor) {
      this.refs.editor.focus();
    }
  },

  render: function() {
    console.log("why");
    return <div style={this.props.parameters.style} onClick={this.focus}>
             <Editor editorState={this.state.state}
                     onChange={this.onChange}
                     handleReturn={this._handleReturn}
                     handleBeforeInput={this._handleBeforeInput}
                     ref="editor"
                     />
           </div>;
  },
});

CodeEditor.render = function(element, props) {
  ReactDOM.render(<CodeEditor parameters={props}/>, element);
};

module.exports = CodeEditor;
