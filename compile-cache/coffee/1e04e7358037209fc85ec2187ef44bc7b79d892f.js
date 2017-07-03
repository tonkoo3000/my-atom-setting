(function() {
  var $, BufferedProcess, CompositeDisposable, GitRevisionView, SplitDiff, _, fs, path, ref;

  _ = require('underscore-plus');

  path = require('path');

  fs = require('fs');

  ref = require("atom"), CompositeDisposable = ref.CompositeDisposable, BufferedProcess = ref.BufferedProcess;

  $ = require("atom-space-pen-views").$;

  SplitDiff = require('split-diff');

  module.exports = GitRevisionView = (function() {
    function GitRevisionView() {}

    GitRevisionView.FILE_PREFIX = "TimeMachine - ";


    /*
      This code and technique was originally from git-history package,
      see https://github.com/jakesankey/git-history/blob/master/lib/git-history-view.coffee
    
      Changes to permit click and drag in the time plot to travel in time:
      - don't write revision to disk for faster access and to give the user feedback when git'ing
        a rev to show is slow
      - reuse tabs more - don't open a new tab for every rev of the same file
    
      Changes to permit scrolling to same lines in view in the editor the history is for
    
      thank you, @jakesankey!
     */

    GitRevisionView.showRevision = function(editor, revHash, options) {
      var exit, file, fileContents, stdout;
      if (options == null) {
        options = {};
      }
      options = _.defaults(options, {
        diff: false
      });
      SplitDiff.disable(false);
      file = editor.getPath();
      fileContents = "";
      stdout = (function(_this) {
        return function(output) {
          return fileContents += output;
        };
      })(this);
      exit = (function(_this) {
        return function(code) {
          if (code === 0) {
            return _this._showRevision(file, editor, revHash, fileContents, options);
          } else {
            return atom.notifications.addError("Could not retrieve revision for " + (path.basename(file)) + " (" + code + ")");
          }
        };
      })(this);
      return this._loadRevision(file, revHash, stdout, exit);
    };

    GitRevisionView._loadRevision = function(file, hash, stdout, exit) {
      var showArgs;
      showArgs = ["show", hash + ":./" + (path.basename(file))];
      return new BufferedProcess({
        command: "git",
        args: showArgs,
        options: {
          cwd: path.dirname(file)
        },
        stdout: stdout,
        exit: exit
      });
    };

    GitRevisionView._getInitialLineNumber = function(editor) {
      var editorEle, lineNumber;
      editorEle = atom.views.getView(editor);
      lineNumber = 0;
      if ((editor != null) && editor !== '') {
        lineNumber = editorEle.getLastVisibleScreenRow();
        return lineNumber - 5;
      }
    };

    GitRevisionView._showRevision = function(file, editor, revHash, fileContents, options) {
      var outputDir, outputFilePath, ref1, tempContent;
      if (options == null) {
        options = {};
      }
      outputDir = (atom.getConfigDirPath()) + "/git-time-machine";
      if (!fs.existsSync(outputDir)) {
        fs.mkdir(outputDir);
      }
      outputFilePath = outputDir + "/" + this.FILE_PREFIX + (path.basename(file));
      if (options.diff) {
        outputFilePath += ".diff";
      }
      tempContent = "Loading..." + ((ref1 = editor.buffer) != null ? ref1.lineEndingForRow(0) : void 0);
      return fs.writeFile(outputFilePath, tempContent, (function(_this) {
        return function(error) {
          var promise;
          if (!error) {
            promise = atom.workspace.open(file, {
              split: "left",
              activatePane: false,
              activateItem: true,
              searchAllPanes: false
            });
            return promise.then(function(editor) {
              promise = atom.workspace.open(outputFilePath, {
                split: "right",
                activatePane: false,
                activateItem: true,
                searchAllPanes: false
              });
              return promise.then(function(newTextEditor) {
                return _this._updateNewTextEditor(newTextEditor, editor, revHash, fileContents);
              });
            });
          }
        };
      })(this));
    };

    GitRevisionView._updateNewTextEditor = function(newTextEditor, editor, revHash, fileContents) {
      return _.delay((function(_this) {
        return function() {
          var lineEnding, ref1;
          lineEnding = ((ref1 = editor.buffer) != null ? ref1.lineEndingForRow(0) : void 0) || "\n";
          fileContents = fileContents.replace(/(\r\n|\n)/g, lineEnding);
          newTextEditor.buffer.setPreferredLineEnding(lineEnding);
          newTextEditor.setText(fileContents);
          newTextEditor.buffer.cachedDiskContents = fileContents;
          _this._splitDiff(editor, newTextEditor);
          _this._syncScroll(editor, newTextEditor);
          return _this._affixTabTitle(newTextEditor, revHash);
        };
      })(this), 300);
    };

    GitRevisionView._affixTabTitle = function(newTextEditor, revHash) {
      var $el, $tabTitle, titleText;
      $el = $(atom.views.getView(newTextEditor));
      $tabTitle = $el.parents('atom-pane').find('li.tab.active .title');
      titleText = $tabTitle.text();
      if (titleText.indexOf('@') >= 0) {
        titleText = titleText.replace(/\@.*/, "@" + revHash);
      } else {
        titleText += " @" + revHash;
      }
      return $tabTitle.text(titleText);
    };

    GitRevisionView._splitDiff = function(editor, newTextEditor) {
      var editors;
      editors = {
        editor1: newTextEditor,
        editor2: editor
      };
      SplitDiff._setConfig('rightEditorColor', 'green');
      SplitDiff._setConfig('leftEditorColor', 'red');
      SplitDiff._setConfig('diffWords', true);
      SplitDiff._setConfig('ignoreWhitespace', true);
      SplitDiff._setConfig('scrollSyncType', 'Vertical + Horizontal');
      SplitDiff.editorSubscriptions = new CompositeDisposable();
      SplitDiff.editorSubscriptions.add(editors.editor1.onDidStopChanging((function(_this) {
        return function() {
          if (editors != null) {
            return SplitDiff.updateDiff(editors);
          }
        };
      })(this)));
      SplitDiff.editorSubscriptions.add(editors.editor2.onDidStopChanging((function(_this) {
        return function() {
          if (editors != null) {
            return SplitDiff.updateDiff(editors);
          }
        };
      })(this)));
      SplitDiff.editorSubscriptions.add(editors.editor1.onDidDestroy((function(_this) {
        return function() {
          editors = null;
          return SplitDiff.disable(false);
        };
      })(this)));
      SplitDiff.editorSubscriptions.add(editors.editor2.onDidDestroy((function(_this) {
        return function() {
          editors = null;
          return SplitDiff.disable(false);
        };
      })(this)));
      SplitDiff.diffPanes();
      return SplitDiff.updateDiff(editors);
    };

    GitRevisionView._syncScroll = function(editor, newTextEditor) {
      return _.delay((function(_this) {
        return function() {
          if (newTextEditor.isDestroyed()) {
            return;
          }
          return newTextEditor.scrollToBufferPosition({
            row: _this._getInitialLineNumber(editor),
            column: 0
          });
        };
      })(this), 50);
    };

    return GitRevisionView;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvdG95b2tpLy5hdG9tL3BhY2thZ2VzL2dpdC10aW1lLW1hY2hpbmUvbGliL2dpdC1yZXZpc2lvbi12aWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUjs7RUFDSixJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBQ1AsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSOztFQUVMLE1BQXlDLE9BQUEsQ0FBUSxNQUFSLENBQXpDLEVBQUMsNkNBQUQsRUFBc0I7O0VBQ3JCLElBQUssT0FBQSxDQUFRLHNCQUFSOztFQUVOLFNBQUEsR0FBWSxPQUFBLENBQVEsWUFBUjs7RUFHWixNQUFNLENBQUMsT0FBUCxHQUNNOzs7SUFFSixlQUFDLENBQUEsV0FBRCxHQUFlOzs7QUFDZjs7Ozs7Ozs7Ozs7Ozs7SUFjQSxlQUFDLENBQUEsWUFBRCxHQUFlLFNBQUMsTUFBRCxFQUFTLE9BQVQsRUFBa0IsT0FBbEI7QUFDYixVQUFBOztRQUQrQixVQUFROztNQUN2QyxPQUFBLEdBQVUsQ0FBQyxDQUFDLFFBQUYsQ0FBVyxPQUFYLEVBQ1I7UUFBQSxJQUFBLEVBQU0sS0FBTjtPQURRO01BR1YsU0FBUyxDQUFDLE9BQVYsQ0FBa0IsS0FBbEI7TUFFQSxJQUFBLEdBQU8sTUFBTSxDQUFDLE9BQVAsQ0FBQTtNQUVQLFlBQUEsR0FBZTtNQUNmLE1BQUEsR0FBUyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsTUFBRDtpQkFDTCxZQUFBLElBQWdCO1FBRFg7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBO01BRVQsSUFBQSxHQUFPLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxJQUFEO1VBQ0wsSUFBRyxJQUFBLEtBQVEsQ0FBWDttQkFDRSxLQUFDLENBQUEsYUFBRCxDQUFlLElBQWYsRUFBcUIsTUFBckIsRUFBNkIsT0FBN0IsRUFBc0MsWUFB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QUFBLENBQUEsQ0FBQSxJQUFBLENBQWxDLENBQWxDO01BRUEsU0FBUyxDQUFDLG1CQUFtQixDQUFDLEdBQTlCLENBQWtDLE9BQU8sQ0FBQyxPQUFPLENBQUMsWUFBaEIsQ0FBNkIsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO1VBQzdELE9BQUEsR0FBVTtpQkFDVixTQUFTLENBQUMsT0FBVixDQUFrQixLQUFsQjtRQUY2RDtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBN0IsQ0FBbEM7TUFHQSxTQUFTLENBQUMsbUJBQW1CLENBQUMsR0FBOUIsQ0FBa0MsT0FBTyxDQUFDLE9BQU8sQ0FBQyxZQUFoQixDQUE2QixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7VUFDN0QsT0FBQSxHQUFVO2lCQUNWLFNBQVMsQ0FBQyxPQUFWLENBQWtCLEtBQWxCO1FBRjZEO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE3QixDQUFsQztNQUlBLFNBQVMsQ0FBQyxTQUFWLENBQUE7YUFDQSxTQUFTLENBQUMsVUFBVixDQUFxQixPQUFyQjtJQXhCVzs7SUE0QmIsZUFBQyxDQUFBLFdBQUQsR0FBYyxTQUFDLE1BQUQsRUFBUyxhQUFUO2FBR1osQ0FBQyxDQUFDLEtBQUYsQ0FBUSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7VUFDTixJQUFVLGFBQWEsQ0FBQyxXQUFkLENBQUEsQ0FBVjtBQUFBLG1CQUFBOztpQkFDQSxhQUFhLENBQUMsc0JBQWQsQ0FBcUM7WUFBQyxHQUFBLEVBQUssS0FBQyxDQUFBLHFCQUFELENBQXVCLE1BQXZCLENBQU47WUFBc0MsTUFBQSxFQUFRLENBQTlDO1dBQXJDO1FBRk07TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVIsRUFHRSxFQUhGO0lBSFk7Ozs7O0FBbEtoQiIsInNvdXJjZXNDb250ZW50IjpbIl8gPSByZXF1aXJlICd1bmRlcnNjb3JlLXBsdXMnXG5wYXRoID0gcmVxdWlyZSAncGF0aCdcbmZzID0gcmVxdWlyZSAnZnMnXG5cbntDb21wb3NpdGVEaXNwb3NhYmxlLCBCdWZmZXJlZFByb2Nlc3N9ID0gcmVxdWlyZSBcImF0b21cIlxueyR9ID0gcmVxdWlyZSBcImF0b20tc3BhY2UtcGVuLXZpZXdzXCJcblxuU3BsaXREaWZmID0gcmVxdWlyZSAnc3BsaXQtZGlmZidcblxuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBHaXRSZXZpc2lvblZpZXdcblxuICBARklMRV9QUkVGSVggPSBcIlRpbWVNYWNoaW5lIC0gXCJcbiAgIyMjXG4gICAgVGhpcyBjb2RlIGFuZCB0ZWNobmlxdWUgd2FzIG9yaWdpbmFsbHkgZnJvbSBnaXQtaGlzdG9yeSBwYWNrYWdlLFxuICAgIHNlZSBodHRwczovL2dpdGh1Yi5jb20vamFrZXNhbmtleS9naXQtaGlzdG9yeS9ibG9iL21hc3Rlci9saWIvZ2l0LWhpc3Rvcnktdmlldy5jb2ZmZWVcblxuICAgIENoYW5nZXMgdG8gcGVybWl0IGNsaWNrIGFuZCBkcmFnIGluIHRoZSB0aW1lIHBsb3QgdG8gdHJhdmVsIGluIHRpbWU6XG4gICAgLSBkb24ndCB3cml0ZSByZXZpc2lvbiB0byBkaXNrIGZvciBmYXN0ZXIgYWNjZXNzIGFuZCB0byBnaXZlIHRoZSB1c2VyIGZlZWRiYWNrIHdoZW4gZ2l0J2luZ1xuICAgICAgYSByZXYgdG8gc2hvdyBpcyBzbG93XG4gICAgLSByZXVzZSB0YWJzIG1vcmUgLSBkb24ndCBvcGVuIGEgbmV3IHRhYiBmb3IgZXZlcnkgcmV2IG9mIHRoZSBzYW1lIGZpbGVcblxuICAgIENoYW5nZXMgdG8gcGVybWl0IHNjcm9sbGluZyB0byBzYW1lIGxpbmVzIGluIHZpZXcgaW4gdGhlIGVkaXRvciB0aGUgaGlzdG9yeSBpcyBmb3JcblxuICAgIHRoYW5rIHlvdSwgQGpha2VzYW5rZXkhXG5cbiAgIyMjXG4gIEBzaG93UmV2aXNpb246IChlZGl0b3IsIHJldkhhc2gsIG9wdGlvbnM9e30pIC0+XG4gICAgb3B0aW9ucyA9IF8uZGVmYXVsdHMgb3B0aW9ucyxcbiAgICAgIGRpZmY6IGZhbHNlXG5cbiAgICBTcGxpdERpZmYuZGlzYWJsZShmYWxzZSlcblxuICAgIGZpbGUgPSBlZGl0b3IuZ2V0UGF0aCgpXG5cbiAgICBmaWxlQ29udGVudHMgPSBcIlwiXG4gICAgc3Rkb3V0ID0gKG91dHB1dCkgPT5cbiAgICAgICAgZmlsZUNvbnRlbnRzICs9IG91dHB1dFxuICAgIGV4aXQgPSAoY29kZSkgPT5cbiAgICAgIGlmIGNvZGUgaXMgMFxuICAgICAgICBAX3Nob3dSZXZpc2lvbihmaWxlLCBlZGl0b3IsIHJldkhhc2gsIGZpbGVDb250ZW50cywgb3B0aW9ucylcbiAgICAgIGVsc2VcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yIFwiQ291bGQgbm90IHJldHJpZXZlIHJldmlzaW9uIGZvciAje3BhdGguYmFzZW5hbWUoZmlsZSl9ICgje2NvZGV9KVwiXG5cbiAgICBAX2xvYWRSZXZpc2lvbiBmaWxlLCByZXZIYXNoLCBzdGRvdXQsIGV4aXRcblxuXG4gIEBfbG9hZFJldmlzaW9uOiAoZmlsZSwgaGFzaCwgc3Rkb3V0LCBleGl0KSAtPlxuICAgIHNob3dBcmdzID0gW1xuICAgICAgXCJzaG93XCIsXG4gICAgICBcIiN7aGFzaH06Li8je3BhdGguYmFzZW5hbWUoZmlsZSl9XCJcbiAgICBdXG4gICAgIyBjb25zb2xlLmxvZyBcImNhbGxpbmcgZ2l0XCJcbiAgICBuZXcgQnVmZmVyZWRQcm9jZXNzIHtcbiAgICAgIGNvbW1hbmQ6IFwiZ2l0XCIsXG4gICAgICBhcmdzOiBzaG93QXJncyxcbiAgICAgIG9wdGlvbnM6IHsgY3dkOnBhdGguZGlybmFtZShmaWxlKSB9LFxuICAgICAgc3Rkb3V0LFxuICAgICAgZXhpdFxuICAgIH1cblxuXG4gIEBfZ2V0SW5pdGlhbExpbmVOdW1iZXI6IChlZGl0b3IpIC0+XG4gICAgZWRpdG9yRWxlID0gYXRvbS52aWV3cy5nZXRWaWV3IGVkaXRvclxuICAgIGxpbmVOdW1iZXIgPSAwXG4gICAgaWYgZWRpdG9yPyAmJiBlZGl0b3IgIT0gJydcbiAgICAgIGxpbmVOdW1iZXIgPSBlZGl0b3JFbGUuZ2V0TGFzdFZpc2libGVTY3JlZW5Sb3coKVxuICAgICAgIyBjb25zb2xlLmxvZyBcIl9nZXRJbml0aWFsTGluZU51bWJlclwiLCBsaW5lTnVtYmVyXG5cbiAgICAgICMgVE9ETzogd2h5IC01PyAgdGhpcyBpcyB3aGF0IGl0IHRvb2sgdG8gYWN0dWFsbHkgc3luYyB0aGUgbGFzdCBsaW5lIG51bWJlclxuICAgICAgIyAgICBiZXR3ZWVuIHR3byBlZGl0b3JzXG4gICAgICByZXR1cm4gbGluZU51bWJlciAtIDVcblxuXG4gIEBfc2hvd1JldmlzaW9uOiAoZmlsZSwgZWRpdG9yLCByZXZIYXNoLCBmaWxlQ29udGVudHMsIG9wdGlvbnM9e30pIC0+XG4gICAgb3V0cHV0RGlyID0gXCIje2F0b20uZ2V0Q29uZmlnRGlyUGF0aCgpfS9naXQtdGltZS1tYWNoaW5lXCJcbiAgICBmcy5ta2RpciBvdXRwdXREaXIgaWYgbm90IGZzLmV4aXN0c1N5bmMgb3V0cHV0RGlyXG4gICAgb3V0cHV0RmlsZVBhdGggPSBcIiN7b3V0cHV0RGlyfS8je0BGSUxFX1BSRUZJWH0je3BhdGguYmFzZW5hbWUoZmlsZSl9XCJcbiAgICBvdXRwdXRGaWxlUGF0aCArPSBcIi5kaWZmXCIgaWYgb3B0aW9ucy5kaWZmXG4gICAgdGVtcENvbnRlbnQgPSBcIkxvYWRpbmcuLi5cIiArIGVkaXRvci5idWZmZXI/LmxpbmVFbmRpbmdGb3JSb3coMClcbiAgICBmcy53cml0ZUZpbGUgb3V0cHV0RmlsZVBhdGgsIHRlbXBDb250ZW50LCAoZXJyb3IpID0+XG4gICAgICBpZiBub3QgZXJyb3JcbiAgICAgICAgIyBlZGl0b3IgKGN1cnJlbnQgcmV2KSBtYXkgaGF2ZSBiZWVuIGRlc3Ryb3llZCwgd29ya3NwYWNlLm9wZW4gd2lsbCBmaW5kIG9yXG4gICAgICAgICMgcmVvcGVuIGl0XG4gICAgICAgIHByb21pc2UgPSBhdG9tLndvcmtzcGFjZS5vcGVuIGZpbGUsXG4gICAgICAgICAgc3BsaXQ6IFwibGVmdFwiXG4gICAgICAgICAgYWN0aXZhdGVQYW5lOiBmYWxzZVxuICAgICAgICAgIGFjdGl2YXRlSXRlbTogdHJ1ZVxuICAgICAgICAgIHNlYXJjaEFsbFBhbmVzOiBmYWxzZVxuICAgICAgICBwcm9taXNlLnRoZW4gKGVkaXRvcikgPT5cbiAgICAgICAgICBwcm9taXNlID0gYXRvbS53b3Jrc3BhY2Uub3BlbiBvdXRwdXRGaWxlUGF0aCxcbiAgICAgICAgICAgIHNwbGl0OiBcInJpZ2h0XCJcbiAgICAgICAgICAgIGFjdGl2YXRlUGFuZTogZmFsc2VcbiAgICAgICAgICAgIGFjdGl2YXRlSXRlbTogdHJ1ZVxuICAgICAgICAgICAgc2VhcmNoQWxsUGFuZXM6IGZhbHNlXG4gICAgICAgICAgcHJvbWlzZS50aGVuIChuZXdUZXh0RWRpdG9yKSA9PlxuICAgICAgICAgICAgQF91cGRhdGVOZXdUZXh0RWRpdG9yKG5ld1RleHRFZGl0b3IsIGVkaXRvciwgcmV2SGFzaCwgZmlsZUNvbnRlbnRzKVxuXG5cblxuXG4gIEBfdXBkYXRlTmV3VGV4dEVkaXRvcjogKG5ld1RleHRFZGl0b3IsIGVkaXRvciwgcmV2SGFzaCwgZmlsZUNvbnRlbnRzKSAtPlxuICAgICMgc2xpZ2h0IGRlbGF5IHNvIHRoZSB1c2VyIGdldHMgZmVlZGJhY2sgb24gdGhlaXIgYWN0aW9uXG4gICAgXy5kZWxheSA9PlxuICAgICAgbGluZUVuZGluZyA9IGVkaXRvci5idWZmZXI/LmxpbmVFbmRpbmdGb3JSb3coMCkgfHwgXCJcXG5cIlxuICAgICAgZmlsZUNvbnRlbnRzID0gZmlsZUNvbnRlbnRzLnJlcGxhY2UoLyhcXHJcXG58XFxuKS9nLCBsaW5lRW5kaW5nKVxuICAgICAgbmV3VGV4dEVkaXRvci5idWZmZXIuc2V0UHJlZmVycmVkTGluZUVuZGluZyhsaW5lRW5kaW5nKVxuICAgICAgbmV3VGV4dEVkaXRvci5zZXRUZXh0KGZpbGVDb250ZW50cylcblxuICAgICAgIyBIQUNLIEFMRVJUOiB0aGlzIGlzIHByb25lIHRvIGV2ZW50dWFsbHkgZmFpbC4gRG9uJ3Qgc2hvdyB1c2VyIGNoYW5nZVxuICAgICAgIyAgXCJ3b3VsZCB5b3UgbGlrZSB0byBzYXZlXCIgbWVzc2FnZSBiZXR3ZWVuIGNoYW5nZXMgdG8gcmV2IGJlaW5nIHZpZXdlZFxuICAgICAgbmV3VGV4dEVkaXRvci5idWZmZXIuY2FjaGVkRGlza0NvbnRlbnRzID0gZmlsZUNvbnRlbnRzXG5cbiAgICAgIEBfc3BsaXREaWZmKGVkaXRvciwgbmV3VGV4dEVkaXRvcilcbiAgICAgIEBfc3luY1Njcm9sbChlZGl0b3IsIG5ld1RleHRFZGl0b3IpXG4gICAgICBAX2FmZml4VGFiVGl0bGUgbmV3VGV4dEVkaXRvciwgcmV2SGFzaFxuICAgICwgMzAwXG5cblxuICBAX2FmZml4VGFiVGl0bGU6IChuZXdUZXh0RWRpdG9yLCByZXZIYXNoKSAtPlxuICAgICMgc3BlYWtpbmcgb2YgaGFja3MgdGhpcyBpcyBhbHNvIGhhY2tpc2gsIHRoZXJlIGhhcyB0byBiZSBhIGJldHRlciB3YXkgdG8gY2hhbmdlIHRvXG4gICAgIyB0YWIgdGl0bGUgYW5kIHVubGlua2luZyBpdCBmcm9tIHRoZSBmaWxlIG5hbWVcbiAgICAkZWwgPSAkKGF0b20udmlld3MuZ2V0VmlldyhuZXdUZXh0RWRpdG9yKSlcbiAgICAkdGFiVGl0bGUgPSAkZWwucGFyZW50cygnYXRvbS1wYW5lJykuZmluZCgnbGkudGFiLmFjdGl2ZSAudGl0bGUnKVxuICAgIHRpdGxlVGV4dCA9ICR0YWJUaXRsZS50ZXh0KClcbiAgICBpZiB0aXRsZVRleHQuaW5kZXhPZignQCcpID49IDBcbiAgICAgIHRpdGxlVGV4dCA9IHRpdGxlVGV4dC5yZXBsYWNlKC9cXEAuKi8sIFwiQCN7cmV2SGFzaH1cIilcbiAgICBlbHNlXG4gICAgICB0aXRsZVRleHQgKz0gXCIgQCN7cmV2SGFzaH1cIlxuXG4gICAgJHRhYlRpdGxlLnRleHQodGl0bGVUZXh0KVxuXG5cbiAgQF9zcGxpdERpZmY6IChlZGl0b3IsIG5ld1RleHRFZGl0b3IpIC0+XG4gICAgZWRpdG9ycyA9XG4gICAgICBlZGl0b3IxOiBuZXdUZXh0RWRpdG9yICAgICMgdGhlIG9sZGVyIHJldmlzaW9uXG4gICAgICBlZGl0b3IyOiBlZGl0b3IgICAgICAgICAgICMgY3VycmVudCByZXZcblxuICAgIFNwbGl0RGlmZi5fc2V0Q29uZmlnICdyaWdodEVkaXRvckNvbG9yJywgJ2dyZWVuJ1xuICAgIFNwbGl0RGlmZi5fc2V0Q29uZmlnICdsZWZ0RWRpdG9yQ29sb3InLCAncmVkJ1xuICAgIFNwbGl0RGlmZi5fc2V0Q29uZmlnICdkaWZmV29yZHMnLCB0cnVlXG4gICAgU3BsaXREaWZmLl9zZXRDb25maWcgJ2lnbm9yZVdoaXRlc3BhY2UnLCB0cnVlXG4gICAgU3BsaXREaWZmLl9zZXRDb25maWcgJ3Njcm9sbFN5bmNUeXBlJywgJ1ZlcnRpY2FsICsgSG9yaXpvbnRhbCdcbiAgICBcbiAgICBTcGxpdERpZmYuZWRpdG9yU3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcbiAgICBTcGxpdERpZmYuZWRpdG9yU3Vic2NyaXB0aW9ucy5hZGQgZWRpdG9ycy5lZGl0b3IxLm9uRGlkU3RvcENoYW5naW5nID0+XG4gICAgICBTcGxpdERpZmYudXBkYXRlRGlmZihlZGl0b3JzKSBpZiBlZGl0b3JzP1xuICAgIFNwbGl0RGlmZi5lZGl0b3JTdWJzY3JpcHRpb25zLmFkZCBlZGl0b3JzLmVkaXRvcjIub25EaWRTdG9wQ2hhbmdpbmcgPT5cbiAgICAgIFNwbGl0RGlmZi51cGRhdGVEaWZmKGVkaXRvcnMpIGlmIGVkaXRvcnM/XG4gICAgU3BsaXREaWZmLmVkaXRvclN1YnNjcmlwdGlvbnMuYWRkIGVkaXRvcnMuZWRpdG9yMS5vbkRpZERlc3Ryb3kgPT5cbiAgICAgIGVkaXRvcnMgPSBudWxsO1xuICAgICAgU3BsaXREaWZmLmRpc2FibGUoZmFsc2UpXG4gICAgU3BsaXREaWZmLmVkaXRvclN1YnNjcmlwdGlvbnMuYWRkIGVkaXRvcnMuZWRpdG9yMi5vbkRpZERlc3Ryb3kgPT5cbiAgICAgIGVkaXRvcnMgPSBudWxsO1xuICAgICAgU3BsaXREaWZmLmRpc2FibGUoZmFsc2UpXG5cbiAgICBTcGxpdERpZmYuZGlmZlBhbmVzKClcbiAgICBTcGxpdERpZmYudXBkYXRlRGlmZiBlZGl0b3JzXG5cblxuICAjIHN5bmMgc2Nyb2xsIHRvIGVkaXRvciB0aGF0IHdlIGFyZSBzaG93IHJldmlzaW9uIGZvclxuICBAX3N5bmNTY3JvbGw6IChlZGl0b3IsIG5ld1RleHRFZGl0b3IpIC0+XG4gICAgIyB3aXRob3V0IHRoZSBkZWxheSwgdGhlIHNjcm9sbCBwb3NpdGlvbiB3aWxsIGZsdWN0dWF0ZSBzbGlnaHRseSBiZXdlZW5cbiAgICAjIGNhbGxzIHRvIGVkaXRvciBzZXRUZXh0XG4gICAgXy5kZWxheSA9PlxuICAgICAgcmV0dXJuIGlmIG5ld1RleHRFZGl0b3IuaXNEZXN0cm95ZWQoKVxuICAgICAgbmV3VGV4dEVkaXRvci5zY3JvbGxUb0J1ZmZlclBvc2l0aW9uKHtyb3c6IEBfZ2V0SW5pdGlhbExpbmVOdW1iZXIoZWRpdG9yKSwgY29sdW1uOiAwfSlcbiAgICAsIDUwXG4iXX0=
