(function() {
  var CompositeDisposable, DiffView, Directory, File, FooterView, LoadingView, SplitDiff, SyncScroll, configSchema, path, ref;

  ref = require('atom'), CompositeDisposable = ref.CompositeDisposable, Directory = ref.Directory, File = ref.File;

  DiffView = require('./diff-view');

  LoadingView = require('./ui/loading-view');

  FooterView = require('./ui/footer-view');

  SyncScroll = require('./sync-scroll');

  configSchema = require('./config-schema');

  path = require('path');

  module.exports = SplitDiff = {
    diffView: null,
    config: configSchema,
    subscriptions: null,
    editorSubscriptions: null,
    isEnabled: false,
    wasEditor1Created: false,
    wasEditor2Created: false,
    hasGitRepo: false,
    process: null,
    activate: function(state) {
      this.subscriptions = new CompositeDisposable();
      return this.subscriptions.add(atom.commands.add('atom-workspace, .tree-view .selected, .tab.texteditor', {
        'split-diff:enable': (function(_this) {
          return function(e) {
            _this.diffPanes(e);
            return e.stopPropagation();
          };
        })(this),
        'split-diff:next-diff': (function(_this) {
          return function() {
            if (_this.isEnabled) {
              return _this.nextDiff();
            } else {
              return _this.diffPanes();
            }
          };
        })(this),
        'split-diff:prev-diff': (function(_this) {
          return function() {
            if (_this.isEnabled) {
              return _this.prevDiff();
            } else {
              return _this.diffPanes();
            }
          };
        })(this),
        'split-diff:copy-to-right': (function(_this) {
          return function() {
            if (_this.isEnabled) {
              return _this.copyToRight();
            }
          };
        })(this),
        'split-diff:copy-to-left': (function(_this) {
          return function() {
            if (_this.isEnabled) {
              return _this.copyToLeft();
            }
          };
        })(this),
        'split-diff:disable': (function(_this) {
          return function() {
            return _this.disable();
          };
        })(this),
        'split-diff:ignore-whitespace': (function(_this) {
          return function() {
            return _this.toggleIgnoreWhitespace();
          };
        })(this),
        'split-diff:toggle': (function(_this) {
          return function() {
            return _this.toggle();
          };
        })(this)
      }));
    },
    deactivate: function() {
      this.disable();
      return this.subscriptions.dispose();
    },
    toggle: function() {
      if (this.isEnabled) {
        return this.disable();
      } else {
        return this.diffPanes();
      }
    },
    disable: function() {
      this.isEnabled = false;
      if (this.editorSubscriptions != null) {
        this.editorSubscriptions.dispose();
        this.editorSubscriptions = null;
      }
      if (this.diffView != null) {
        if (this.wasEditor1Created) {
          this.diffView.cleanUpEditor(1);
        }
        if (this.wasEditor2Created) {
          this.diffView.cleanUpEditor(2);
        }
        this.diffView.destroy();
        this.diffView = null;
      }
      if (this.footerView != null) {
        this.footerView.destroy();
        this.footerView = null;
      }
      if (this.loadingView != null) {
        this.loadingView.destroy();
        this.loadingView = null;
      }
      if (this.syncScroll != null) {
        this.syncScroll.dispose();
        this.syncScroll = null;
      }
      this.wasEditor1Created = false;
      this.wasEditor2Created = false;
      return this.hasGitRepo = false;
    },
    toggleIgnoreWhitespace: function() {
      var isWhitespaceIgnored, ref1;
      isWhitespaceIgnored = this._getConfig('ignoreWhitespace');
      this._setConfig('ignoreWhitespace', !isWhitespaceIgnored);
      return (ref1 = this.footerView) != null ? ref1.setIgnoreWhitespace(!isWhitespaceIgnored) : void 0;
    },
    nextDiff: function() {
      var ref1, selectedIndex;
      if (this.diffView != null) {
        selectedIndex = this.diffView.nextDiff();
        return (ref1 = this.footerView) != null ? ref1.showSelectionCount(selectedIndex + 1) : void 0;
      }
    },
    prevDiff: function() {
      var ref1, selectedIndex;
      if (this.diffView != null) {
        selectedIndex = this.diffView.prevDiff();
        return (ref1 = this.footerView) != null ? ref1.showSelectionCount(selectedIndex + 1) : void 0;
      }
    },
    copyToRight: function() {
      var ref1;
      if (this.diffView != null) {
        this.diffView.copyToRight();
        return (ref1 = this.footerView) != null ? ref1.hideSelectionCount() : void 0;
      }
    },
    copyToLeft: function() {
      var ref1;
      if (this.diffView != null) {
        this.diffView.copyToLeft();
        return (ref1 = this.footerView) != null ? ref1.hideSelectionCount() : void 0;
      }
    },
    diffPanes: function(event) {
      var editorsPromise, filePath;
      this.disable();
      this.editorSubscriptions = new CompositeDisposable();
      if (event != null ? event.currentTarget.classList.contains('tab') : void 0) {
        filePath = event.currentTarget.path;
        editorsPromise = this._getEditorsForDiffWithActive(filePath);
      } else if ((event != null ? event.currentTarget.classList.contains('list-item') : void 0) && (event != null ? event.currentTarget.classList.contains('file') : void 0)) {
        filePath = event.currentTarget.getPath();
        editorsPromise = this._getEditorsForDiffWithActive(filePath);
      } else {
        editorsPromise = this._getEditorsForQuickDiff();
      }
      return editorsPromise.then((function(editors) {
        if (editors === null) {
          return;
        }
        this._setupVisibleEditors(editors.editor1, editors.editor2);
        this.diffView = new DiffView(editors);
        this.editorSubscriptions.add(editors.editor1.onDidStopChanging((function(_this) {
          return function() {
            return _this.updateDiff(editors);
          };
        })(this)));
        this.editorSubscriptions.add(editors.editor2.onDidStopChanging((function(_this) {
          return function() {
            return _this.updateDiff(editors);
          };
        })(this)));
        this.editorSubscriptions.add(editors.editor1.onDidDestroy((function(_this) {
          return function() {
            return _this.disable();
          };
        })(this)));
        this.editorSubscriptions.add(editors.editor2.onDidDestroy((function(_this) {
          return function() {
            return _this.disable();
          };
        })(this)));
        this.editorSubscriptions.add(atom.config.onDidChange('split-diff', (function(_this) {
          return function() {
            return _this.updateDiff(editors);
          };
        })(this)));
        if (this.footerView == null) {
          this.footerView = new FooterView(this._getConfig('ignoreWhitespace'));
          this.footerView.createPanel();
        }
        this.footerView.show();
        if (!this.hasGitRepo) {
          this.updateDiff(editors);
        }
        this.editorSubscriptions.add(atom.menu.add([
          {
            'label': 'Packages',
            'submenu': [
              {
                'label': 'Split Diff',
                'submenu': [
                  {
                    'label': 'Ignore Whitespace',
                    'command': 'split-diff:ignore-whitespace'
                  }, {
                    'label': 'Move to Next Diff',
                    'command': 'split-diff:next-diff'
                  }, {
                    'label': 'Move to Previous Diff',
                    'command': 'split-diff:prev-diff'
                  }, {
                    'label': 'Copy to Right',
                    'command': 'split-diff:copy-to-right'
                  }, {
                    'label': 'Copy to Left',
                    'command': 'split-diff:copy-to-left'
                  }
                ]
              }
            ]
          }
        ]));
        return this.editorSubscriptions.add(atom.contextMenu.add({
          'atom-text-editor': [
            {
              'label': 'Split Diff',
              'submenu': [
                {
                  'label': 'Ignore Whitespace',
                  'command': 'split-diff:ignore-whitespace'
                }, {
                  'label': 'Move to Next Diff',
                  'command': 'split-diff:next-diff'
                }, {
                  'label': 'Move to Previous Diff',
                  'command': 'split-diff:prev-diff'
                }, {
                  'label': 'Copy to Right',
                  'command': 'split-diff:copy-to-right'
                }, {
                  'label': 'Copy to Left',
                  'command': 'split-diff:copy-to-left'
                }
              ]
            }
          ]
        }));
      }).bind(this));
    },
    updateDiff: function(editors) {
      var BufferedNodeProcess, args, command, editorPaths, exit, isWhitespaceIgnored, stderr, stdout, theOutput;
      this.isEnabled = true;
      if (this.process != null) {
        this.process.kill();
        this.process = null;
      }
      isWhitespaceIgnored = this._getConfig('ignoreWhitespace');
      editorPaths = this._createTempFiles(editors);
      if (this.loadingView == null) {
        this.loadingView = new LoadingView();
        this.loadingView.createModal();
      }
      this.loadingView.show();
      BufferedNodeProcess = require('atom').BufferedNodeProcess;
      command = path.resolve(__dirname, "./compute-diff.js");
      args = [editorPaths.editor1Path, editorPaths.editor2Path, isWhitespaceIgnored];
      theOutput = '';
      stdout = (function(_this) {
        return function(output) {
          var computedDiff, ref1;
          theOutput = output;
          computedDiff = JSON.parse(output);
          _this.process.kill();
          _this.process = null;
          if ((ref1 = _this.loadingView) != null) {
            ref1.hide();
          }
          return _this._resumeUpdateDiff(editors, computedDiff);
        };
      })(this);
      stderr = (function(_this) {
        return function(err) {
          return theOutput = err;
        };
      })(this);
      exit = (function(_this) {
        return function(code) {
          var ref1;
          if ((ref1 = _this.loadingView) != null) {
            ref1.hide();
          }
          if (code !== 0) {
            console.log('BufferedNodeProcess code was ' + code);
            return console.log(theOutput);
          }
        };
      })(this);
      return this.process = new BufferedNodeProcess({
        command: command,
        args: args,
        stdout: stdout,
        stderr: stderr,
        exit: exit
      });
    },
    _resumeUpdateDiff: function(editors, computedDiff) {
      var leftHighlightType, ref1, rightHighlightType, scrollSyncType;
      this.diffView.clearDiff();
      if (this.syncScroll != null) {
        this.syncScroll.dispose();
        this.syncScroll = null;
      }
      leftHighlightType = 'added';
      rightHighlightType = 'removed';
      if (this._getConfig('leftEditorColor') === 'red') {
        leftHighlightType = 'removed';
      }
      if (this._getConfig('rightEditorColor') === 'green') {
        rightHighlightType = 'added';
      }
      this.diffView.displayDiff(computedDiff, leftHighlightType, rightHighlightType, this._getConfig('diffWords'), this._getConfig('ignoreWhitespace'));
      if ((ref1 = this.footerView) != null) {
        ref1.setNumDifferences(this.diffView.getNumDifferences());
      }
      scrollSyncType = this._getConfig('scrollSyncType');
      if (scrollSyncType === 'Vertical + Horizontal') {
        this.syncScroll = new SyncScroll(editors.editor1, editors.editor2, true);
        return this.syncScroll.syncPositions();
      } else if (scrollSyncType === 'Vertical') {
        this.syncScroll = new SyncScroll(editors.editor1, editors.editor2, false);
        return this.syncScroll.syncPositions();
      }
    },
    _getEditorsForQuickDiff: function() {
      var activeItem, editor1, editor2, j, len, p, panes, rightPaneIndex;
      editor1 = null;
      editor2 = null;
      panes = atom.workspace.getPanes();
      for (j = 0, len = panes.length; j < len; j++) {
        p = panes[j];
        activeItem = p.getActiveItem();
        if (atom.workspace.isTextEditor(activeItem)) {
          if (editor1 === null) {
            editor1 = activeItem;
          } else if (editor2 === null) {
            editor2 = activeItem;
            break;
          }
        }
      }
      if (editor1 === null) {
        editor1 = atom.workspace.buildTextEditor();
        this.wasEditor1Created = true;
        panes[0].addItem(editor1);
        panes[0].activateItem(editor1);
      }
      if (editor2 === null) {
        editor2 = atom.workspace.buildTextEditor();
        this.wasEditor2Created = true;
        editor2.setGrammar(editor1.getGrammar());
        rightPaneIndex = panes.indexOf(atom.workspace.paneForItem(editor1)) + 1;
        if (panes[rightPaneIndex]) {
          panes[rightPaneIndex].addItem(editor2);
          panes[rightPaneIndex].activateItem(editor2);
        } else {
          atom.workspace.paneForItem(editor1).splitRight({
            items: [editor2]
          });
        }
      }
      return Promise.resolve({
        editor1: editor1,
        editor2: editor2
      });
    },
    _getEditorsForDiffWithActive: function(filePath) {
      var activeEditor, editor1, editor2Promise, noActiveEditorMsg, panes, rightPane, rightPaneIndex;
      activeEditor = atom.workspace.getActiveTextEditor();
      if (activeEditor != null) {
        editor1 = activeEditor;
        this.wasEditor2Created = true;
        panes = atom.workspace.getPanes();
        rightPaneIndex = panes.indexOf(atom.workspace.paneForItem(editor1)) + 1;
        rightPane = panes[rightPaneIndex] || atom.workspace.paneForItem(editor1).splitRight();
        if (editor1.getPath() === filePath) {
          filePath = null;
        }
        editor2Promise = atom.workspace.openURIInPane(filePath, rightPane);
        return editor2Promise.then(function(editor2) {
          return {
            editor1: editor1,
            editor2: editor2
          };
        });
      } else {
        noActiveEditorMsg = 'No active file found! (Try focusing a text editor)';
        atom.notifications.addWarning('Split Diff', {
          detail: noActiveEditorMsg,
          dismissable: false,
          icon: 'diff'
        });
        return Promise.resolve(null);
      }
      return Promise.resolve(null);
    },
    _setupVisibleEditors: function(editor1, editor2) {
      var BufferExtender, buffer1LineEnding, buffer2LineEnding, lineEndingMsg, shouldNotify, softWrapMsg;
      BufferExtender = require('./buffer-extender');
      buffer1LineEnding = (new BufferExtender(editor1.getBuffer())).getLineEnding();
      if (this.wasEditor2Created) {
        atom.views.getView(editor1).focus();
        if (buffer1LineEnding === '\n' || buffer1LineEnding === '\r\n') {
          this.editorSubscriptions.add(editor2.onWillInsertText(function() {
            return editor2.getBuffer().setPreferredLineEnding(buffer1LineEnding);
          }));
        }
      }
      this._setupGitRepo(editor1, editor2);
      editor1.unfoldAll();
      editor2.unfoldAll();
      shouldNotify = !this._getConfig('muteNotifications');
      softWrapMsg = 'Warning: Soft wrap enabled! (Line diffs may not align)';
      if (editor1.isSoftWrapped() && shouldNotify) {
        atom.notifications.addWarning('Split Diff', {
          detail: softWrapMsg,
          dismissable: false,
          icon: 'diff'
        });
      } else if (editor2.isSoftWrapped() && shouldNotify) {
        atom.notifications.addWarning('Split Diff', {
          detail: softWrapMsg,
          dismissable: false,
          icon: 'diff'
        });
      }
      buffer2LineEnding = (new BufferExtender(editor2.getBuffer())).getLineEnding();
      if (buffer2LineEnding !== '' && (buffer1LineEnding !== buffer2LineEnding) && editor1.getLineCount() !== 1 && editor2.getLineCount() !== 1 && shouldNotify) {
        lineEndingMsg = 'Warning: Line endings differ!';
        return atom.notifications.addWarning('Split Diff', {
          detail: lineEndingMsg,
          dismissable: false,
          icon: 'diff'
        });
      }
    },
    _setupGitRepo: function(editor1, editor2) {
      var directory, editor1Path, gitHeadText, i, j, len, projectRepo, ref1, relativeEditor1Path, results;
      editor1Path = editor1.getPath();
      if ((editor1Path != null) && (editor2.getLineCount() === 1 && editor2.lineTextForBufferRow(0) === '')) {
        ref1 = atom.project.getDirectories();
        results = [];
        for (i = j = 0, len = ref1.length; j < len; i = ++j) {
          directory = ref1[i];
          if (editor1Path === directory.getPath() || directory.contains(editor1Path)) {
            projectRepo = atom.project.getRepositories()[i];
            if ((projectRepo != null) && (projectRepo.repo != null)) {
              relativeEditor1Path = projectRepo.relativize(editor1Path);
              gitHeadText = projectRepo.repo.getHeadBlob(relativeEditor1Path);
              if (gitHeadText != null) {
                editor2.selectAll();
                editor2.insertText(gitHeadText);
                this.hasGitRepo = true;
                break;
              } else {
                results.push(void 0);
              }
            } else {
              results.push(void 0);
            }
          } else {
            results.push(void 0);
          }
        }
        return results;
      }
    },
    _createTempFiles: function(editors) {
      var editor1Path, editor1TempFile, editor2Path, editor2TempFile, editorPaths, tempFolderPath;
      editor1Path = '';
      editor2Path = '';
      tempFolderPath = atom.getConfigDirPath() + '/split-diff';
      editor1Path = tempFolderPath + '/split-diff 1';
      editor1TempFile = new File(editor1Path);
      editor1TempFile.writeSync(editors.editor1.getText());
      editor2Path = tempFolderPath + '/split-diff 2';
      editor2TempFile = new File(editor2Path);
      editor2TempFile.writeSync(editors.editor2.getText());
      editorPaths = {
        editor1Path: editor1Path,
        editor2Path: editor2Path
      };
      return editorPaths;
    },
    _getConfig: function(config) {
      return atom.config.get("split-diff." + config);
    },
    _setConfig: function(config, value) {
      return atom.config.set("split-diff." + config, value);
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvdG95b2tpLy5hdG9tL3BhY2thZ2VzL2dpdC10aW1lLW1hY2hpbmUvbm9kZV9tb2R1bGVzL3NwbGl0LWRpZmYvbGliL3NwbGl0LWRpZmYuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxNQUF5QyxPQUFBLENBQVEsTUFBUixDQUF6QyxFQUFDLDZDQUFELEVBQXNCLHlCQUF0QixFQUFpQzs7RUFDakMsUUFBQSxHQUFXLE9BQUEsQ0FBUSxhQUFSOztFQUNYLFdBQUEsR0FBYyxPQUFBLENBQVEsbUJBQVI7O0VBQ2QsVUFBQSxHQUFhLE9BQUEsQ0FBUSxrQkFBUjs7RUFDYixVQUFBLEdBQWEsT0FBQSxDQUFRLGVBQVI7O0VBQ2IsWUFBQSxHQUFlLE9BQUEsQ0FBUSxpQkFBUjs7RUFDZixJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBRVAsTUFBTSxDQUFDLE9BQVAsR0FBaUIsU0FBQSxHQUNmO0lBQUEsUUFBQSxFQUFVLElBQVY7SUFDQSxNQUFBLEVBQVEsWUFEUjtJQUVBLGFBQUEsRUFBZSxJQUZmO0lBR0EsbUJBQUEsRUFBcUIsSUFIckI7SUFJQSxTQUFBLEVBQVcsS0FKWDtJQUtBLGlCQUFBLEVBQW1CLEtBTG5CO0lBTUEsaUJBQUEsRUFBbUIsS0FObkI7SUFPQSxVQUFBLEVBQVksS0FQWjtJQVFBLE9BQUEsRUFBUyxJQVJUO0lBVUEsUUFBQSxFQUFVLFNBQUMsS0FBRDtNQUNSLElBQUMsQ0FBQSxhQUFELEdBQXFCLElBQUEsbUJBQUEsQ0FBQTthQUVyQixJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLHVEQUFsQixFQUNqQjtRQUFBLG1CQUFBLEVBQXFCLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUMsQ0FBRDtZQUNuQixLQUFDLENBQUEsU0FBRCxDQUFXLENBQVg7bUJBQ0EsQ0FBQyxD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SUFtWEEsZ0JBQUEsRUFBa0IsU0FBQyxPQUFEO0FBQ2hCLFVBQUE7TUFBQSxXQUFBLEdBQWM7TUFDZCxXQUFBLEdBQWM7TUFDZCxjQUFBLEdBQWlCLElBQUksQ0FBQyxnQkFBTCxDQUFBLENBQUEsR0FBMEI7TUFFM0MsV0FBQSxHQUFjLGNBQUEsR0FBaUI7TUFDL0IsZUFBQSxHQUFzQixJQUFBLElBQUEsQ0FBSyxXQUFMO01BQ3RCLGVBQWUsQ0FBQyxTQUFoQixDQUEwQixPQUFPLENBQUMsT0FBTyxDQUFDLE9BQWhCLENBQUEsQ0FBMUI7TUFFQSxXQUFBLEdBQWMsY0FBQSxHQUFpQjtNQUMvQixlQUFBLEdBQXNCLElBQUEsSUFBQSxDQUFLLFdBQUw7TUFDdEIsZUFBZSxDQUFDLFNBQWhCLENBQTBCLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBaEIsQ0FBQSxDQUExQjtNQUVBLFdBQUEsR0FDRTtRQUFBLFdBQUEsRUFBYSxXQUFiO1FBQ0EsV0FBQSxFQUFhLFdBRGI7O0FBR0YsYUFBTztJQWpCUyxDQW5YbEI7SUF1WUEsVUFBQSxFQUFZLFNBQUMsTUFBRDthQUNWLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixhQUFBLEdBQWMsTUFBOUI7SUFEVSxDQXZZWjtJQTBZQSxVQUFBLEVBQVksU0FBQyxNQUFELEVBQVMsS0FBVDthQUNWLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixhQUFBLEdBQWMsTUFBOUIsRUFBd0MsS0FBeEM7SUFEVSxDQTFZWjs7QUFURiIsInNvdXJjZXNDb250ZW50IjpbIntDb21wb3NpdGVEaXNwb3NhYmxlLCBEaXJlY3RvcnksIEZpbGV9ID0gcmVxdWlyZSAnYXRvbSdcbkRpZmZWaWV3ID0gcmVxdWlyZSAnLi9kaWZmLXZpZXcnXG5Mb2FkaW5nVmlldyA9IHJlcXVpcmUgJy4vdWkvbG9hZGluZy12aWV3J1xuRm9vdGVyVmlldyA9IHJlcXVpcmUgJy4vdWkvZm9vdGVyLXZpZXcnXG5TeW5jU2Nyb2xsID0gcmVxdWlyZSAnLi9zeW5jLXNjcm9sbCdcbmNvbmZpZ1NjaGVtYSA9IHJlcXVpcmUgJy4vY29uZmlnLXNjaGVtYSdcbnBhdGggPSByZXF1aXJlICdwYXRoJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNwbGl0RGlmZiA9XG4gIGRpZmZWaWV3OiBudWxsXG4gIGNvbmZpZzogY29uZmlnU2NoZW1hXG4gIHN1YnNjcmlwdGlvbnM6IG51bGxcbiAgZWRpdG9yU3Vic2NyaXB0aW9uczogbnVsbFxuICBpc0VuYWJsZWQ6IGZhbHNlXG4gIHdhc0VkaXRvcjFDcmVhdGVkOiBmYWxzZVxuICB3YXNFZGl0b3IyQ3JlYXRlZDogZmFsc2VcbiAgaGFzR2l0UmVwbzogZmFsc2VcbiAgcHJvY2VzczogbnVsbFxuXG4gIGFjdGl2YXRlOiAoc3RhdGUpIC0+XG4gICAgQHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlLCAudHJlZS12aWV3IC5zZWxlY3RlZCwgLnRhYi50ZXh0ZWRpdG9yJyxcbiAgICAgICdzcGxpdC1kaWZmOmVuYWJsZSc6IChlKSA9PlxuICAgICAgICBAZGlmZlBhbmVzKGUpXG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICdzcGxpdC1kaWZmOm5leHQtZGlmZic6ID0+XG4gICAgICAgIGlmIEBpc0VuYWJsZWRcbiAgICAgICAgICBAbmV4dERpZmYoKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgQGRpZmZQYW5lcygpXG4gICAgICAnc3BsaXQtZGlmZjpwcmV2LWRpZmYnOiA9PlxuICAgICAgICBpZiBAaXNFbmFibGVkXG4gICAgICAgICAgQHByZXZEaWZmKClcbiAgICAgICAgZWxzZVxuICAgICAgICAgIEBkaWZmUGFuZXMoKVxuICAgICAgJ3NwbGl0LWRpZmY6Y29weS10by1yaWdodCc6ID0+XG4gICAgICAgIGlmIEBpc0VuYWJsZWRcbiAgICAgICAgICBAY29weVRvUmlnaHQoKVxuICAgICAgJ3NwbGl0LWRpZmY6Y29weS10by1sZWZ0JzogPT5cbiAgICAgICAgaWYgQGlzRW5hYmxlZFxuICAgICAgICAgIEBjb3B5VG9MZWZ0KClcbiAgICAgICdzcGxpdC1kaWZmOmRpc2FibGUnOiA9PiBAZGlzYWJsZSgpXG4gICAgICAnc3BsaXQtZGlmZjppZ25vcmUtd2hpdGVzcGFjZSc6ID0+IEB0b2dnbGVJZ25vcmVXaGl0ZXNwYWNlKClcbiAgICAgICdzcGxpdC1kaWZmOnRvZ2dsZSc6ID0+IEB0b2dnbGUoKVxuXG4gIGRlYWN0aXZhdGU6IC0+XG4gICAgQGRpc2FibGUoKVxuICAgIEBzdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuXG4gICMgY2FsbGVkIGJ5IFwidG9nZ2xlXCIgY29tbWFuZFxuICAjIHRvZ2dsZXMgc3BsaXQgZGlmZlxuICB0b2dnbGU6ICgpIC0+XG4gICAgaWYgQGlzRW5hYmxlZFxuICAgICAgQGRpc2FibGUoKVxuICAgIGVsc2VcbiAgICAgIEBkaWZmUGFuZXMoKVxuXG4gICMgY2FsbGVkIGJ5IFwiRGlzYWJsZVwiIGNvbW1hbmRcbiAgIyByZW1vdmVzIGRpZmYgYW5kIHN5bmMgc2Nyb2xsLCBkaXNwb3NlcyBvZiBzdWJzY3JpcHRpb25zXG4gIGRpc2FibGU6ICgpIC0+XG4gICAgQGlzRW5hYmxlZCA9IGZhbHNlXG5cbiAgICAjIHJlbW92ZSBsaXN0ZW5lcnNcbiAgICBpZiBAZWRpdG9yU3Vic2NyaXB0aW9ucz9cbiAgICAgIEBlZGl0b3JTdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgICAgQGVkaXRvclN1YnNjcmlwdGlvbnMgPSBudWxsXG5cbiAgICBpZiBAZGlmZlZpZXc/XG4gICAgICBpZiBAd2FzRWRpdG9yMUNyZWF0ZWRcbiAgICAgICAgQGRpZmZWaWV3LmNsZWFuVXBFZGl0b3IoMSlcbiAgICAgIGlmIEB3YXNFZGl0b3IyQ3JlYXRlZFxuICAgICAgICBAZGlmZlZpZXcuY2xlYW5VcEVkaXRvcigyKVxuICAgICAgQGRpZmZWaWV3LmRlc3Ryb3koKVxuICAgICAgQGRpZmZWaWV3ID0gbnVsbFxuXG4gICAgIyByZW1vdmUgdmlld3NcbiAgICBpZiBAZm9vdGVyVmlldz9cbiAgICAgIEBmb290ZXJWaWV3LmRlc3Ryb3koKVxuICAgICAgQGZvb3RlclZpZXcgPSBudWxsXG4gICAgaWYgQGxvYWRpbmdWaWV3P1xuICAgICAgQGxvYWRpbmdWaWV3LmRlc3Ryb3koKVxuICAgICAgQGxvYWRpbmdWaWV3ID0gbnVsbFxuXG4gICAgaWYgQHN5bmNTY3JvbGw/XG4gICAgICBAc3luY1Njcm9sbC5kaXNwb3NlKClcbiAgICAgIEBzeW5jU2Nyb2xsID0gbnVsbFxuXG4gICAgIyByZXNldCBhbGwgdmFyaWFibGVzXG4gICAgQHdhc0VkaXRvcjFDcmVhdGVkID0gZmFsc2VcbiAgICBAd2FzRWRpdG9yMkNyZWF0ZWQgPSBmYWxzZVxuICAgIEBoYXNHaXRSZXBvID0gZmFsc2VcblxuICAjIGNhbGxlZCBieSBcInRvZ2dsZSBpZ25vcmUgd2hpdGVzcGFjZVwiIGNvbW1hbmRcbiAgIyB0b2dnbGVzIGlnbm9yaW5nIHdoaXRlc3BhY2UgYW5kIHJlZnJlc2hlcyB0aGUgZGlmZlxuICB0b2dnbGVJZ25vcmVXaGl0ZXNwYWNlOiAtPlxuICAgIGlzV2hpdGVzcGFjZUlnbm9yZWQgPSBAX2dldENvbmZpZygnaWdub3JlV2hpdGVzcGFjZScpXG4gICAgQF9zZXRDb25maWcoJ2lnbm9yZVdoaXRlc3BhY2UnLCAhaXNXaGl0ZXNwYWNlSWdub3JlZClcbiAgICBAZm9vdGVyVmlldz8uc2V0SWdub3JlV2hpdGVzcGFjZSghaXNXaGl0ZXNwYWNlSWdub3JlZClcblxuICAjIGNhbGxlZCBieSBcIk1vdmUgdG8gbmV4dCBkaWZmXCIgY29tbWFuZFxuICBuZXh0RGlmZjogLT5cbiAgICBpZiBAZGlmZlZpZXc/XG4gICAgICBzZWxlY3RlZEluZGV4ID0gQGRpZmZWaWV3Lm5leHREaWZmKClcbiAgICAgIEBmb290ZXJWaWV3Py5zaG93U2VsZWN0aW9uQ291bnQoIHNlbGVjdGVkSW5kZXggKyAxIClcblxuICAjIGNhbGxlZCBieSBcIk1vdmUgdG8gcHJldmlvdXMgZGlmZlwiIGNvbW1hbmRcbiAgcHJldkRpZmY6IC0+XG4gICAgaWYgQGRpZmZWaWV3P1xuICAgICAgc2VsZWN0ZWRJbmRleCA9IEBkaWZmVmlldy5wcmV2RGlmZigpXG4gICAgICBAZm9vdGVyVmlldz8uc2hvd1NlbGVjdGlvbkNvdW50KCBzZWxlY3RlZEluZGV4ICsgMSApXG5cbiAgIyBjYWxsZWQgYnkgXCJDb3B5IHRvIHJpZ2h0XCIgY29tbWFuZFxuICBjb3B5VG9SaWdodDogLT5cbiAgICBpZiBAZGlmZlZpZXc/XG4gICAgICBAZGlmZlZpZXcuY29weVRvUmlnaHQoKVxuICAgICAgQGZvb3RlclZpZXc/LmhpZGVTZWxlY3Rpb25Db3VudCgpXG5cbiAgIyBjYWxsZWQgYnkgXCJDb3B5IHRvIGxlZnRcIiBjb21tYW5kXG4gIGNvcHlUb0xlZnQ6IC0+XG4gICAgaWYgQGRpZmZWaWV3P1xuICAgICAgQGRpZmZWaWV3LmNvcHlUb0xlZnQoKVxuICAgICAgQGZvb3RlclZpZXc/LmhpZGVTZWxlY3Rpb25Db3VudCgpXG5cbiAgIyBjYWxsZWQgYnkgdGhlIGNvbW1hbmRzIGVuYWJsZS90b2dnbGUgdG8gZG8gaW5pdGlhbCBkaWZmXG4gICMgc2V0cyB1cCBzdWJzY3JpcHRpb25zIGZvciBhdXRvIGRpZmYgYW5kIGRpc2FibGluZyB3aGVuIGEgcGFuZSBpcyBkZXN0cm95ZWRcbiAgIyBldmVudCBpcyBhbiBvcHRpb25hbCBhcmd1bWVudCBvZiBhIGZpbGUgcGF0aCB0byBkaWZmIHdpdGggY3VycmVudFxuICBkaWZmUGFuZXM6IChldmVudCkgLT5cbiAgICAjIGluIGNhc2UgZW5hYmxlIHdhcyBjYWxsZWQgYWdhaW5cbiAgICBAZGlzYWJsZSgpXG5cbiAgICBAZWRpdG9yU3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcblxuICAgIGlmIGV2ZW50Py5jdXJyZW50VGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucygndGFiJylcbiAgICAgIGZpbGVQYXRoID0gZXZlbnQuY3VycmVudFRhcmdldC5wYXRoXG4gICAgICBlZGl0b3JzUHJvbWlzZSA9IEBfZ2V0RWRpdG9yc0ZvckRpZmZXaXRoQWN0aXZlKGZpbGVQYXRoKVxuICAgIGVsc2UgaWYgZXZlbnQ/LmN1cnJlbnRUYXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKCdsaXN0LWl0ZW0nKSAmJiBldmVudD8uY3VycmVudFRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoJ2ZpbGUnKVxuICAgICAgZmlsZVBhdGggPSBldmVudC5jdXJyZW50VGFyZ2V0LmdldFBhdGgoKVxuICAgICAgZWRpdG9yc1Byb21pc2UgPSBAX2dldEVkaXRvcnNGb3JEaWZmV2l0aEFjdGl2ZShmaWxlUGF0aClcbiAgICBlbHNlXG4gICAgICBlZGl0b3JzUHJvbWlzZSA9IEBfZ2V0RWRpdG9yc0ZvclF1aWNrRGlmZigpXG5cbiAgICBlZGl0b3JzUHJvbWlzZS50aGVuICgoZWRpdG9ycykgLT5cbiAgICAgIGlmIGVkaXRvcnMgPT0gbnVsbFxuICAgICAgICByZXR1cm5cbiAgICAgIEBfc2V0dXBWaXNpYmxlRWRpdG9ycyhlZGl0b3JzLmVkaXRvcjEsIGVkaXRvcnMuZWRpdG9yMilcbiAgICAgIEBkaWZmVmlldyA9IG5ldyBEaWZmVmlldyhlZGl0b3JzKVxuXG4gICAgICAjIGFkZCBsaXN0ZW5lcnNcbiAgICAgIEBlZGl0b3JTdWJzY3JpcHRpb25zLmFkZCBlZGl0b3JzLmVkaXRvcjEub25EaWRTdG9wQ2hhbmdpbmcgPT5cbiAgICAgICAgQHVwZGF0ZURpZmYoZWRpdG9ycylcbiAgICAgIEBlZGl0b3JTdWJzY3JpcHRpb25zLmFkZCBlZGl0b3JzLmVkaXRvcjIub25EaWRTdG9wQ2hhbmdpbmcgPT5cbiAgICAgICAgQHVwZGF0ZURpZmYoZWRpdG9ycylcbiAgICAgIEBlZGl0b3JTdWJzY3JpcHRpb25zLmFkZCBlZGl0b3JzLmVkaXRvcjEub25EaWREZXN0cm95ID0+XG4gICAgICAgIEBkaXNhYmxlKClcbiAgICAgIEBlZGl0b3JTdWJzY3JpcHRpb25zLmFkZCBlZGl0b3JzLmVkaXRvcjIub25EaWREZXN0cm95ID0+XG4gICAgICAgIEBkaXNhYmxlKClcbiAgICAgIEBlZGl0b3JTdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSAnc3BsaXQtZGlmZicsICgpID0+XG4gICAgICAgIEB1cGRhdGVEaWZmKGVkaXRvcnMpXG5cbiAgICAgICMgYWRkIHRoZSBib3R0b20gVUkgcGFuZWxcbiAgICAgIGlmICFAZm9vdGVyVmlldz9cbiAgICAgICAgQGZvb3RlclZpZXcgPSBuZXcgRm9vdGVyVmlldyhAX2dldENvbmZpZygnaWdub3JlV2hpdGVzcGFjZScpKVxuICAgICAgICBAZm9vdGVyVmlldy5jcmVhdGVQYW5lbCgpXG4gICAgICBAZm9vdGVyVmlldy5zaG93KClcblxuICAgICAgIyB1cGRhdGUgZGlmZiBpZiB0aGVyZSBpcyBubyBnaXQgcmVwbyAobm8gb25jaGFuZ2UgZmlyZWQpXG4gICAgICBpZiAhQGhhc0dpdFJlcG9cbiAgICAgICAgQHVwZGF0ZURpZmYoZWRpdG9ycylcblxuICAgICAgIyBhZGQgYXBwbGljYXRpb24gbWVudSBpdGVtc1xuICAgICAgQGVkaXRvclN1YnNjcmlwdGlvbnMuYWRkIGF0b20ubWVudS5hZGQgW1xuICAgICAgICB7XG4gICAgICAgICAgJ2xhYmVsJzogJ1BhY2thZ2VzJ1xuICAgICAgICAgICdzdWJtZW51JzogW1xuICAgICAgICAgICAgJ2xhYmVsJzogJ1NwbGl0IERpZmYnXG4gICAgICAgICAgICAnc3VibWVudSc6IFtcbiAgICAgICAgICAgICAgeyAnbGFiZWwnOiAnSWdub3JlIFdoaXRlc3BhY2UnLCAnY29tbWFuZCc6ICdzcGxpdC1kaWZmOmlnbm9yZS13aGl0ZXNwYWNlJyB9XG4gICAgICAgICAgICAgIHsgJ2xhYmVsJzogJ01vdmUgdG8gTmV4dCBEaWZmJywgJ2NvbW1hbmQnOiAnc3BsaXQtZGlmZjpuZXh0LWRpZmYnIH1cbiAgICAgICAgICAgICAgeyAnbGFiZWwnOiAnTW92ZSB0byBQcmV2aW91cyBEaWZmJywgJ2NvbW1hbmQnOiAnc3BsaXQtZGlmZjpwcmV2LWRpZmYnIH1cbiAgICAgICAgICAgICAgeyAnbGFiZWwnOiAnQ29weSB0byBSaWdodCcsICdjb21tYW5kJzogJ3NwbGl0LWRpZmY6Y29weS10by1yaWdodCd9XG4gICAgICAgICAgICAgIHsgJ2xhYmVsJzogJ0NvcHkgdG8gTGVmdCcsICdjb21tYW5kJzogJ3NwbGl0LWRpZmY6Y29weS10by1sZWZ0J31cbiAgICAgICAgICAgIF1cbiAgICAgICAgICBdXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICAgIEBlZGl0b3JTdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbnRleHRNZW51LmFkZCB7XG4gICAgICAgICdhdG9tLXRleHQtZWRpdG9yJzogW3tcbiAgICAgICAgICAnbGFiZWwnOiAnU3BsaXQgRGlmZicsXG4gICAgICAgICAgJ3N1Ym1lbnUnOiBbXG4gICAgICAgICAgICB7ICdsYWJlbCc6ICdJZ25vcmUgV2hpdGVzcGFjZScsICdjb21tYW5kJzogJ3NwbGl0LWRpZmY6aWdub3JlLXdoaXRlc3BhY2UnIH1cbiAgICAgICAgICAgIHsgJ2xhYmVsJzogJ01vdmUgdG8gTmV4dCBEaWZmJywgJ2NvbW1hbmQnOiAnc3BsaXQtZGlmZjpuZXh0LWRpZmYnIH1cbiAgICAgICAgICAgIHsgJ2xhYmVsJzogJ01vdmUgdG8gUHJldmlvdXMgRGlmZicsICdjb21tYW5kJzogJ3NwbGl0LWRpZmY6cHJldi1kaWZmJyB9XG4gICAgICAgICAgICB7ICdsYWJlbCc6ICdDb3B5IHRvIFJpZ2h0JywgJ2NvbW1hbmQnOiAnc3BsaXQtZGlmZjpjb3B5LXRvLXJpZ2h0J31cbiAgICAgICAgICAgIHsgJ2xhYmVsJzogJ0NvcHkgdG8gTGVmdCcsICdjb21tYW5kJzogJ3NwbGl0LWRpZmY6Y29weS10by1sZWZ0J31cbiAgICAgICAgICBdXG4gICAgICAgIH1dXG4gICAgICB9XG4gICAgICApLmJpbmQodGhpcykgIyBtYWtlIHN1cmUgdGhlIHNjb3BlIGlzIGNvcnJlY3RcblxuICAjIGNhbGxlZCBieSBib3RoIGRpZmZQYW5lcyBhbmQgdGhlIGVkaXRvciBzdWJzY3JpcHRpb24gdG8gdXBkYXRlIHRoZSBkaWZmXG4gIHVwZGF0ZURpZmY6IChlZGl0b3JzKSAtPlxuICAgIEBpc0VuYWJsZWQgPSB0cnVlXG5cbiAgICAjIGlmIHRoZXJlIGlzIGEgZGlmZiBiZWluZyBjb21wdXRlZCBpbiB0aGUgYmFja2dyb3VuZCwgY2FuY2VsIGl0XG4gICAgaWYgQHByb2Nlc3M/XG4gICAgICBAcHJvY2Vzcy5raWxsKClcbiAgICAgIEBwcm9jZXNzID0gbnVsbFxuXG4gICAgaXNXaGl0ZXNwYWNlSWdub3JlZCA9IEBfZ2V0Q29uZmlnKCdpZ25vcmVXaGl0ZXNwYWNlJylcbiAgICBlZGl0b3JQYXRocyA9IEBfY3JlYXRlVGVtcEZpbGVzKGVkaXRvcnMpXG5cbiAgICAjIGNyZWF0ZSB0aGUgbG9hZGluZyB2aWV3IGlmIGl0IGRvZXNuJ3QgZXhpc3QgeWV0XG4gICAgaWYgIUBsb2FkaW5nVmlldz9cbiAgICAgIEBsb2FkaW5nVmlldyA9IG5ldyBMb2FkaW5nVmlldygpXG4gICAgICBAbG9hZGluZ1ZpZXcuY3JlYXRlTW9kYWwoKVxuICAgIEBsb2FkaW5nVmlldy5zaG93KClcblxuICAgICMgLS0tIGtpY2sgb2ZmIGJhY2tncm91bmQgcHJvY2VzcyB0byBjb21wdXRlIGRpZmYgLS0tXG4gICAge0J1ZmZlcmVkTm9kZVByb2Nlc3N9ID0gcmVxdWlyZSAnYXRvbSdcbiAgICBjb21tYW5kID0gcGF0aC5yZXNvbHZlIF9fZGlybmFtZSwgXCIuL2NvbXB1dGUtZGlmZi5qc1wiXG4gICAgYXJncyA9IFtlZGl0b3JQYXRocy5lZGl0b3IxUGF0aCwgZWRpdG9yUGF0aHMuZWRpdG9yMlBhdGgsIGlzV2hpdGVzcGFjZUlnbm9yZWRdXG4gICAgdGhlT3V0cHV0ID0gJydcbiAgICBzdGRvdXQgPSAob3V0cHV0KSA9PlxuICAgICAgdGhlT3V0cHV0ID0gb3V0cHV0XG4gICAgICBjb21wdXRlZERpZmYgPSBKU09OLnBhcnNlKG91dHB1dClcbiAgICAgIEBwcm9jZXNzLmtpbGwoKVxuICAgICAgQHByb2Nlc3MgPSBudWxsXG4gICAgICBAbG9hZGluZ1ZpZXc/LmhpZGUoKVxuICAgICAgQF9yZXN1bWVVcGRhdGVEaWZmKGVkaXRvcnMsIGNvbXB1dGVkRGlmZilcbiAgICBzdGRlcnIgPSAoZXJyKSA9PlxuICAgICAgdGhlT3V0cHV0ID0gZXJyXG4gICAgZXhpdCA9IChjb2RlKSA9PlxuICAgICAgQGxvYWRpbmdWaWV3Py5oaWRlKClcblxuICAgICAgaWYgY29kZSAhPSAwXG4gICAgICAgIGNvbnNvbGUubG9nKCdCdWZmZXJlZE5vZGVQcm9jZXNzIGNvZGUgd2FzICcgKyBjb2RlKVxuICAgICAgICBjb25zb2xlLmxvZyh0aGVPdXRwdXQpXG4gICAgQHByb2Nlc3MgPSBuZXcgQnVmZmVyZWROb2RlUHJvY2Vzcyh7Y29tbWFuZCwgYXJncywgc3Rkb3V0LCBzdGRlcnIsIGV4aXR9KVxuICAgICMgLS0tIGtpY2sgb2ZmIGJhY2tncm91bmQgcHJvY2VzcyB0byBjb21wdXRlIGRpZmYgLS0tXG5cbiAgIyByZXN1bWVzIGFmdGVyIHRoZSBjb21wdXRlIGRpZmYgcHJvY2VzcyByZXR1cm5zXG4gIF9yZXN1bWVVcGRhdGVEaWZmOiAoZWRpdG9ycywgY29tcHV0ZWREaWZmKSAtPlxuICAgIEBkaWZmVmlldy5jbGVhckRpZmYoKVxuICAgIGlmIEBzeW5jU2Nyb2xsP1xuICAgICAgQHN5bmNTY3JvbGwuZGlzcG9zZSgpXG4gICAgICBAc3luY1Njcm9sbCA9IG51bGxcblxuICAgIGxlZnRIaWdobGlnaHRUeXBlID0gJ2FkZGVkJ1xuICAgIHJpZ2h0SGlnaGxpZ2h0VHlwZSA9ICdyZW1vdmVkJ1xuICAgIGlmIEBfZ2V0Q29uZmlnKCdsZWZ0RWRpdG9yQ29sb3InKSA9PSAncmVkJ1xuICAgICAgbGVmdEhpZ2hsaWdodFR5cGUgPSAncmVtb3ZlZCdcbiAgICBpZiBAX2dldENvbmZpZygncmlnaHRFZGl0b3JDb2xvcicpID09ICdncmVlbidcbiAgICAgIHJpZ2h0SGlnaGxpZ2h0VHlwZSA9ICdhZGRlZCdcbiAgICBAZGlmZlZpZXcuZGlzcGxheURpZmYoY29tcHV0ZWREaWZmLCBsZWZ0SGlnaGxpZ2h0VHlwZSwgcmlnaHRIaWdobGlnaHRUeXBlLCBAX2dldENvbmZpZygnZGlmZldvcmRzJyksIEBfZ2V0Q29uZmlnKCdpZ25vcmVXaGl0ZXNwYWNlJykpXG5cbiAgICBAZm9vdGVyVmlldz8uc2V0TnVtRGlmZmVyZW5jZXMoQGRpZmZWaWV3LmdldE51bURpZmZlcmVuY2VzKCkpXG5cbiAgICBzY3JvbGxTeW5jVHlwZSA9IEBfZ2V0Q29uZmlnKCdzY3JvbGxTeW5jVHlwZScpXG4gICAgaWYgc2Nyb2xsU3luY1R5cGUgPT0gJ1ZlcnRpY2FsICsgSG9yaXpvbnRhbCdcbiAgICAgIEBzeW5jU2Nyb2xsID0gbmV3IFN5bmNTY3JvbGwoZWRpdG9ycy5lZGl0b3IxLCBlZGl0b3JzLmVkaXRvcjIsIHRydWUpXG4gICAgICBAc3luY1Njcm9sbC5zeW5jUG9zaXRpb25zKClcbiAgICBlbHNlIGlmIHNjcm9sbFN5bmNUeXBlID09ICdWZXJ0aWNhbCdcbiAgICAgIEBzeW5jU2Nyb2xsID0gbmV3IFN5bmNTY3JvbGwoZWRpdG9ycy5lZGl0b3IxLCBlZGl0b3JzLmVkaXRvcjIsIGZhbHNlKVxuICAgICAgQHN5bmNTY3JvbGwuc3luY1Bvc2l0aW9ucygpXG5cbiAgIyBHZXRzIHRoZSBmaXJzdCB0d28gdmlzaWJsZSBlZGl0b3JzIGZvdW5kIG9yIGNyZWF0ZXMgdGhlbSBhcyBuZWVkZWQuXG4gICMgUmV0dXJucyBhIFByb21pc2Ugd2hpY2ggeWllbGRzIGEgdmFsdWUgb2Yge2VkaXRvcjE6IFRleHRFZGl0b3IsIGVkaXRvcjI6IFRleHRFZGl0b3J9XG4gIF9nZXRFZGl0b3JzRm9yUXVpY2tEaWZmOiAoKSAtPlxuICAgIGVkaXRvcjEgPSBudWxsXG4gICAgZWRpdG9yMiA9IG51bGxcblxuICAgICMgdHJ5IHRvIGZpbmQgdGhlIGZpcnN0IHR3byBlZGl0b3JzXG4gICAgcGFuZXMgPSBhdG9tLndvcmtzcGFjZS5nZXRQYW5lcygpXG4gICAgZm9yIHAgaW4gcGFuZXNcbiAgICAgIGFjdGl2ZUl0ZW0gPSBwLmdldEFjdGl2ZUl0ZW0oKVxuICAgICAgaWYgYXRvbS53b3Jrc3BhY2UuaXNUZXh0RWRpdG9yKGFjdGl2ZUl0ZW0pXG4gICAgICAgIGlmIGVkaXRvcjEgPT0gbnVsbFxuICAgICAgICAgIGVkaXRvcjEgPSBhY3RpdmVJdGVtXG4gICAgICAgIGVsc2UgaWYgZWRpdG9yMiA9PSBudWxsXG4gICAgICAgICAgZWRpdG9yMiA9IGFjdGl2ZUl0ZW1cbiAgICAgICAgICBicmVha1xuXG4gICAgIyBhdXRvIG9wZW4gZWRpdG9yIHBhbmVzIHNvIHdlIGhhdmUgdHdvIHRvIGRpZmYgd2l0aFxuICAgIGlmIGVkaXRvcjEgPT0gbnVsbFxuICAgICAgZWRpdG9yMSA9IGF0b20ud29ya3NwYWNlLmJ1aWxkVGV4dEVkaXRvcigpXG4gICAgICBAd2FzRWRpdG9yMUNyZWF0ZWQgPSB0cnVlXG4gICAgICAjIGFkZCBmaXJzdCBlZGl0b3IgdG8gdGhlIGZpcnN0IHBhbmVcbiAgICAgIHBhbmVzWzBdLmFkZEl0ZW0oZWRpdG9yMSlcbiAgICAgIHBhbmVzWzBdLmFjdGl2YXRlSXRlbShlZGl0b3IxKVxuICAgIGlmIGVkaXRvcjIgPT0gbnVsbFxuICAgICAgZWRpdG9yMiA9IGF0b20ud29ya3NwYWNlLmJ1aWxkVGV4dEVkaXRvcigpXG4gICAgICBAd2FzRWRpdG9yMkNyZWF0ZWQgPSB0cnVlXG4gICAgICBlZGl0b3IyLnNldEdyYW1tYXIoZWRpdG9yMS5nZXRHcmFtbWFyKCkpXG4gICAgICByaWdodFBhbmVJbmRleCA9IHBhbmVzLmluZGV4T2YoYXRvbS53b3Jrc3BhY2UucGFuZUZvckl0ZW0oZWRpdG9yMSkpICsgMVxuICAgICAgaWYgcGFuZXNbcmlnaHRQYW5lSW5kZXhdXG4gICAgICAgICMgYWRkIHNlY29uZCBlZGl0b3IgdG8gZXhpc3RpbmcgcGFuZSB0byB0aGUgcmlnaHQgb2YgZmlyc3QgZWRpdG9yXG4gICAgICAgIHBhbmVzW3JpZ2h0UGFuZUluZGV4XS5hZGRJdGVtKGVkaXRvcjIpXG4gICAgICAgIHBhbmVzW3JpZ2h0UGFuZUluZGV4XS5hY3RpdmF0ZUl0ZW0oZWRpdG9yMilcbiAgICAgIGVsc2VcbiAgICAgICAgIyBubyBleGlzdGluZyBwYW5lIHNvIHNwbGl0IHJpZ2h0XG4gICAgICAgIGF0b20ud29ya3NwYWNlLnBhbmVGb3JJdGVtKGVkaXRvcjEpLnNwbGl0UmlnaHQoe2l0ZW1zOiBbZWRpdG9yMl19KVxuXG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh7ZWRpdG9yMTogZWRpdG9yMSwgZWRpdG9yMjogZWRpdG9yMn0pXG5cbiAgIyBHZXRzIHRoZSBhY3RpdmUgZWRpdG9yIGFuZCBvcGVucyB0aGUgc3BlY2lmaWVkIGZpbGUgdG8gdGhlIHJpZ2h0IG9mIGl0XG4gICMgUmV0dXJucyBhIFByb21pc2Ugd2hpY2ggeWllbGRzIGEgdmFsdWUgb2Yge2VkaXRvcjE6IFRleHRFZGl0b3IsIGVkaXRvcjI6IFRleHRFZGl0b3J9XG4gIF9nZXRFZGl0b3JzRm9yRGlmZldpdGhBY3RpdmU6IChmaWxlUGF0aCkgLT5cbiAgICBhY3RpdmVFZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICBpZiBhY3RpdmVFZGl0b3I/XG4gICAgICBlZGl0b3IxID0gYWN0aXZlRWRpdG9yXG4gICAgICBAd2FzRWRpdG9yMkNyZWF0ZWQgPSB0cnVlXG4gICAgICBwYW5lcyA9IGF0b20ud29ya3NwYWNlLmdldFBhbmVzKClcbiAgICAgICMgZ2V0IGluZGV4IG9mIHBhbmUgZm9sbG93aW5nIGFjdGl2ZSBlZGl0b3IgcGFuZVxuICAgICAgcmlnaHRQYW5lSW5kZXggPSBwYW5lcy5pbmRleE9mKGF0b20ud29ya3NwYWNlLnBhbmVGb3JJdGVtKGVkaXRvcjEpKSArIDFcbiAgICAgICMgcGFuZSBpcyBjcmVhdGVkIGlmIHRoZXJlIGlzIG5vdCBvbmUgdG8gdGhlIHJpZ2h0IG9mIHRoZSBhY3RpdmUgZWRpdG9yXG4gICAgICByaWdodFBhbmUgPSBwYW5lc1tyaWdodFBhbmVJbmRleF0gfHwgYXRvbS53b3Jrc3BhY2UucGFuZUZvckl0ZW0oZWRpdG9yMSkuc3BsaXRSaWdodCgpXG4gICAgICBpZiBlZGl0b3IxLmdldFBhdGgoKSA9PSBmaWxlUGF0aFxuICAgICAgICAjIGlmIGRpZmZpbmcgd2l0aCBpdHNlbGYsIHNldCBmaWxlUGF0aCB0byBudWxsIHNvIGFuIGVtcHR5IGVkaXRvciBpc1xuICAgICAgICAjIG9wZW5lZCwgd2hpY2ggd2lsbCBjYXVzZSBhIGdpdCBkaWZmXG4gICAgICAgIGZpbGVQYXRoID0gbnVsbFxuICAgICAgZWRpdG9yMlByb21pc2UgPSBhdG9tLndvcmtzcGFjZS5vcGVuVVJJSW5QYW5lKGZpbGVQYXRoLCByaWdodFBhbmUpXG5cbiAgICAgIHJldHVybiBlZGl0b3IyUHJvbWlzZS50aGVuIChlZGl0b3IyKSAtPlxuICAgICAgICByZXR1cm4ge2VkaXRvcjE6IGVkaXRvcjEsIGVkaXRvcjI6IGVkaXRvcjJ9XG4gICAgZWxzZVxuICAgICAgbm9BY3RpdmVFZGl0b3JNc2cgPSAnTm8gYWN0aXZlIGZpbGUgZm91bmQhIChUcnkgZm9jdXNpbmcgYSB0ZXh0IGVkaXRvciknXG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZygnU3BsaXQgRGlmZicsIHtkZXRhaWw6IG5vQWN0aXZlRWRpdG9yTXNnLCBkaXNtaXNzYWJsZTogZmFsc2UsIGljb246ICdkaWZmJ30pXG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG51bGwpXG5cbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG51bGwpXG5cbiAgX3NldHVwVmlzaWJsZUVkaXRvcnM6IChlZGl0b3IxLCBlZGl0b3IyKSAtPlxuICAgIEJ1ZmZlckV4dGVuZGVyID0gcmVxdWlyZSAnLi9idWZmZXItZXh0ZW5kZXInXG4gICAgYnVmZmVyMUxpbmVFbmRpbmcgPSAobmV3IEJ1ZmZlckV4dGVuZGVyKGVkaXRvcjEuZ2V0QnVmZmVyKCkpKS5nZXRMaW5lRW5kaW5nKClcblxuICAgIGlmIEB3YXNFZGl0b3IyQ3JlYXRlZFxuICAgICAgIyB3YW50IHRvIHNjcm9sbCBhIG5ld2x5IGNyZWF0ZWQgZWRpdG9yIHRvIHRoZSBmaXJzdCBlZGl0b3IncyBwb3NpdGlvblxuICAgICAgYXRvbS52aWV3cy5nZXRWaWV3KGVkaXRvcjEpLmZvY3VzKClcbiAgICAgICMgc2V0IHRoZSBwcmVmZXJyZWQgbGluZSBlbmRpbmcgYmVmb3JlIGluc2VydGluZyB0ZXh0ICMzOVxuICAgICAgaWYgYnVmZmVyMUxpbmVFbmRpbmcgPT0gJ1xcbicgfHwgYnVmZmVyMUxpbmVFbmRpbmcgPT0gJ1xcclxcbidcbiAgICAgICAgQGVkaXRvclN1YnNjcmlwdGlvbnMuYWRkIGVkaXRvcjIub25XaWxsSW5zZXJ0VGV4dCAoKSAtPlxuICAgICAgICAgIGVkaXRvcjIuZ2V0QnVmZmVyKCkuc2V0UHJlZmVycmVkTGluZUVuZGluZyhidWZmZXIxTGluZUVuZGluZylcblxuICAgIEBfc2V0dXBHaXRSZXBvKGVkaXRvcjEsIGVkaXRvcjIpXG5cbiAgICAjIHVuZm9sZCBhbGwgbGluZXMgc28gZGlmZnMgcHJvcGVybHkgYWxpZ25cbiAgICBlZGl0b3IxLnVuZm9sZEFsbCgpXG4gICAgZWRpdG9yMi51bmZvbGRBbGwoKVxuXG4gICAgc2hvdWxkTm90aWZ5ID0gIUBfZ2V0Q29uZmlnKCdtdXRlTm90aWZpY2F0aW9ucycpXG4gICAgc29mdFdyYXBNc2cgPSAnV2FybmluZzogU29mdCB3cmFwIGVuYWJsZWQhIChMaW5lIGRpZmZzIG1heSBub3QgYWxpZ24pJ1xuICAgIGlmIGVkaXRvcjEuaXNTb2Z0V3JhcHBlZCgpICYmIHNob3VsZE5vdGlmeVxuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcoJ1NwbGl0IERpZmYnLCB7ZGV0YWlsOiBzb2Z0V3JhcE1zZywgZGlzbWlzc2FibGU6IGZhbHNlLCBpY29uOiAnZGlmZid9KVxuICAgIGVsc2UgaWYgZWRpdG9yMi5pc1NvZnRXcmFwcGVkKCkgJiYgc2hvdWxkTm90aWZ5XG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZygnU3BsaXQgRGlmZicsIHtkZXRhaWw6IHNvZnRXcmFwTXNnLCBkaXNtaXNzYWJsZTogZmFsc2UsIGljb246ICdkaWZmJ30pXG5cbiAgICBidWZmZXIyTGluZUVuZGluZyA9IChuZXcgQnVmZmVyRXh0ZW5kZXIoZWRpdG9yMi5nZXRCdWZmZXIoKSkpLmdldExpbmVFbmRpbmcoKVxuICAgIGlmIGJ1ZmZlcjJMaW5lRW5kaW5nICE9ICcnICYmIChidWZmZXIxTGluZUVuZGluZyAhPSBidWZmZXIyTGluZUVuZGluZykgJiYgZWRpdG9yMS5nZXRMaW5lQ291bnQoKSAhPSAxICYmIGVkaXRvcjIuZ2V0TGluZUNvdW50KCkgIT0gMSAmJiBzaG91bGROb3RpZnlcbiAgICAgICMgcG9wIHdhcm5pbmcgaWYgdGhlIGxpbmUgZW5kaW5ncyBkaWZmZXIgYW5kIHdlIGhhdmVuJ3QgZG9uZSBhbnl0aGluZyBhYm91dCBpdFxuICAgICAgbGluZUVuZGluZ01zZyA9ICdXYXJuaW5nOiBMaW5lIGVuZGluZ3MgZGlmZmVyISdcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKCdTcGxpdCBEaWZmJywge2RldGFpbDogbGluZUVuZGluZ01zZywgZGlzbWlzc2FibGU6IGZhbHNlLCBpY29uOiAnZGlmZid9KVxuXG4gIF9zZXR1cEdpdFJlcG86IChlZGl0b3IxLCBlZGl0b3IyKSAtPlxuICAgIGVkaXRvcjFQYXRoID0gZWRpdG9yMS5nZXRQYXRoKClcbiAgICAjIG9ubHkgc2hvdyBnaXQgY2hhbmdlcyBpZiB0aGUgcmlnaHQgZWRpdG9yIGlzIGVtcHR5XG4gICAgaWYgZWRpdG9yMVBhdGg/ICYmIChlZGl0b3IyLmdldExpbmVDb3VudCgpID09IDEgJiYgZWRpdG9yMi5saW5lVGV4dEZvckJ1ZmZlclJvdygwKSA9PSAnJylcbiAgICAgIGZvciBkaXJlY3RvcnksIGkgaW4gYXRvbS5wcm9qZWN0LmdldERpcmVjdG9yaWVzKClcbiAgICAgICAgaWYgZWRpdG9yMVBhdGggaXMgZGlyZWN0b3J5LmdldFBhdGgoKSBvciBkaXJlY3RvcnkuY29udGFpbnMoZWRpdG9yMVBhdGgpXG4gICAgICAgICAgcHJvamVjdFJlcG8gPSBhdG9tLnByb2plY3QuZ2V0UmVwb3NpdG9yaWVzKClbaV1cbiAgICAgICAgICBpZiBwcm9qZWN0UmVwbz8gJiYgcHJvamVjdFJlcG8ucmVwbz9cbiAgICAgICAgICAgIHJlbGF0aXZlRWRpdG9yMVBhdGggPSBwcm9qZWN0UmVwby5yZWxhdGl2aXplKGVkaXRvcjFQYXRoKVxuICAgICAgICAgICAgZ2l0SGVhZFRleHQgPSBwcm9qZWN0UmVwby5yZXBvLmdldEhlYWRCbG9iKHJlbGF0aXZlRWRpdG9yMVBhdGgpXG4gICAgICAgICAgICBpZiBnaXRIZWFkVGV4dD9cbiAgICAgICAgICAgICAgZWRpdG9yMi5zZWxlY3RBbGwoKVxuICAgICAgICAgICAgICBlZGl0b3IyLmluc2VydFRleHQoZ2l0SGVhZFRleHQpXG4gICAgICAgICAgICAgIEBoYXNHaXRSZXBvID0gdHJ1ZVxuICAgICAgICAgICAgICBicmVha1xuXG4gICMgY3JlYXRlcyB0ZW1wIGZpbGVzIHNvIHRoZSBjb21wdXRlIGRpZmYgcHJvY2VzcyBjYW4gZ2V0IHRoZSB0ZXh0IGVhc2lseVxuICBfY3JlYXRlVGVtcEZpbGVzOiAoZWRpdG9ycykgLT5cbiAgICBlZGl0b3IxUGF0aCA9ICcnXG4gICAgZWRpdG9yMlBhdGggPSAnJ1xuICAgIHRlbXBGb2xkZXJQYXRoID0gYXRvbS5nZXRDb25maWdEaXJQYXRoKCkgKyAnL3NwbGl0LWRpZmYnXG5cbiAgICBlZGl0b3IxUGF0aCA9IHRlbXBGb2xkZXJQYXRoICsgJy9zcGxpdC1kaWZmIDEnXG4gICAgZWRpdG9yMVRlbXBGaWxlID0gbmV3IEZpbGUoZWRpdG9yMVBhdGgpXG4gICAgZWRpdG9yMVRlbXBGaWxlLndyaXRlU3luYyhlZGl0b3JzLmVkaXRvcjEuZ2V0VGV4dCgpKVxuXG4gICAgZWRpdG9yMlBhdGggPSB0ZW1wRm9sZGVyUGF0aCArICcvc3BsaXQtZGlmZiAyJ1xuICAgIGVkaXRvcjJUZW1wRmlsZSA9IG5ldyBGaWxlKGVkaXRvcjJQYXRoKVxuICAgIGVkaXRvcjJUZW1wRmlsZS53cml0ZVN5bmMoZWRpdG9ycy5lZGl0b3IyLmdldFRleHQoKSlcblxuICAgIGVkaXRvclBhdGhzID1cbiAgICAgIGVkaXRvcjFQYXRoOiBlZGl0b3IxUGF0aFxuICAgICAgZWRpdG9yMlBhdGg6IGVkaXRvcjJQYXRoXG5cbiAgICByZXR1cm4gZWRpdG9yUGF0aHNcblxuXG4gIF9nZXRDb25maWc6IChjb25maWcpIC0+XG4gICAgYXRvbS5jb25maWcuZ2V0KFwic3BsaXQtZGlmZi4je2NvbmZpZ31cIilcblxuICBfc2V0Q29uZmlnOiAoY29uZmlnLCB2YWx1ZSkgLT5cbiAgICBhdG9tLmNvbmZpZy5zZXQoXCJzcGxpdC1kaWZmLiN7Y29uZmlnfVwiLCB2YWx1ZSlcbiJdfQ==
