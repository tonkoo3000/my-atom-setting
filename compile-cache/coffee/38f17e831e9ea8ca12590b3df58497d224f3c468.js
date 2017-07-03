(function() {
  var CompositeDisposable, File, NodeSassCompiler, SassAutocompileOptions, SassAutocompileView;

  CompositeDisposable = require('atom').CompositeDisposable;

  SassAutocompileOptions = require('./options');

  SassAutocompileView = require('./sass-autocompile-view');

  NodeSassCompiler = require('./compiler');

  File = require('./helper/file');

  module.exports = {
    config: {
      compileOnSave: {
        title: 'Compile on Save',
        description: 'This option en-/disables auto compiling on save',
        type: 'boolean',
        "default": true,
        order: 10
      },
      compileFiles: {
        title: 'Compile files ...',
        description: 'Choose which SASS files you want this package to compile',
        type: 'string',
        "enum": ['Only with first-line-comment', 'Every SASS file'],
        "default": 'Every SASS file',
        order: 11
      },
      compilePartials: {
        title: 'Compile Partials',
        description: 'Controls compilation of Partials (underscore as first character in filename) if there is no first-line-comment',
        type: 'boolean',
        "default": false,
        order: 12
      },
      checkOutputFileAlreadyExists: {
        title: 'Ask for overwriting already existent files',
        description: 'If target file already exists, sass-autocompile will ask you before overwriting',
        type: 'boolean',
        "default": false,
        order: 13
      },
      directlyJumpToError: {
        title: 'Directly jump to error',
        description: 'If enabled and you compile an erroneous SASS file, this file is opened and jumped to the problematic position.',
        type: 'boolean',
        "default": false,
        order: 14
      },
      showCompileSassItemInTreeViewContextMenu: {
        title: 'Show \'Compile SASS\' item in Tree View context menu',
        description: 'If enabled, Tree View context menu contains a \'Compile SASS\' item that allows you to compile that file via context menu',
        type: 'string',
        type: 'boolean',
        "default": true,
        order: 15
      },
      compileCompressed: {
        title: 'Compile with \'compressed\' output style',
        description: 'If enabled SASS files are compiled with \'compressed\' output style. Please define a corresponding output filename pattern or use inline parameter \'compressedFilenamePattern\'',
        type: 'boolean',
        "default": true,
        order: 30
      },
      compressedFilenamePattern: {
        title: 'Filename pattern for \'compressed\' compiled files',
        description: 'Define the replacement pattern for compiled filenames with \'compressed\' output style. Placeholders are: \'$1\' for basename of file and \'$2\' for original file extension.',
        type: 'string',
        "default": '$1.min.css',
        order: 31
      },
      compileCompact: {
        title: 'Compile with \'compact\' output style',
        description: 'If enabled SASS files are compiled with \'compact\' output style. Please define a corresponding output filename pattern or use inline parameter \'compactFilenamePattern\'',
        type: 'boolean',
        "default": false,
        order: 32
      },
      compactFilenamePattern: {
        title: 'Filename pattern for \'compact\' compiled files',
        description: 'Define the replacement pattern for compiled filenames with \'compact\' output style. Placeholders are: \'$1\' for basename of file and \'$2\' for original file extension.',
        type: 'string',
        "default": '$1.compact.css',
        order: 33
      },
      compileNested: {
        title: 'Compile with \'nested\' output style',
        description: 'If enabled SASS files are compiled with \'nested\' output style. Please define a corresponding output filename pattern or use inline parameter \'nestedFilenamePattern\'',
        type: 'boolean',
        "default": false,
        order: 34
      },
      nestedFilenamePattern: {
        title: 'Filename pattern for \'nested\' compiled files',
        description: 'Define the replacement pattern for compiled filenames with \'nested\' output style. Placeholders are: \'$1\' for basename of file and \'$2\' for original file extension.',
        type: 'string',
        "default": '$1.nested.css',
        order: 35
      },
      compileExpanded: {
        title: 'Compile with \'expanded\' output style',
        description: 'If enabled SASS files are compiled with \'expanded\' output style. Please define a corresponding output filename pattern or use inline parameter \'expandedFilenamePattern\'',
        type: 'boolean',
        "default": false,
        order: 36
      },
      expandedFilenamePattern: {
        title: 'Filename pattern for \'expanded\' compiled files',
        description: 'Define the replacement pattern for compiled filenames with \'expanded\' output style. Placeholders are: \'$1\' for basename of file and \'$2\' for original file extension.',
        type: 'string',
        "default": '$1.css',
        order: 37
      },
      indentType: {
        title: 'Indent type',
        description: 'Indent type for output CSS',
        type: 'string',
        "enum": ['Space', 'Tab'],
        "default": 'Space',
        order: 38
      },
      indentWidth: {
        title: 'Indent width',
        description: 'Indent width; number of spaces or tabs',
        type: 'integer',
        "enum": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        "default": 2,
        minimum: 0,
        maximum: 10,
        order: 39
      },
      linefeed: {
        title: 'Linefeed',
        description: 'Used to determine whether to use \'cr\', \'crlf\', \'lf\' or \'lfcr\' sequence for line break',
        type: 'string',
        "enum": ['cr', 'crlf', 'lf', 'lfcr'],
        "default": 'lf',
        order: 40
      },
      sourceMap: {
        title: 'Build source map',
        description: 'If enabled a source map is generated',
        type: 'boolean',
        "default": false,
        order: 41
      },
      sourceMapEmbed: {
        title: 'Embed source map',
        description: 'If enabled source map is embedded as a data URI',
        type: 'boolean',
        "default": false,
        order: 42
      },
      sourceMapContents: {
        title: 'Include contents in source map information',
        description: 'If enabled contents are included in source map information',
        type: 'boolean',
        "default": false,
        order: 43
      },
      sourceComments: {
        title: 'Include additional debugging information in the output CSS file',
        description: 'If enabled additional debugging information are added to the output file as CSS comments. If CSS is compressed this feature is disabled by SASS compiler',
        type: 'boolean',
        "default": false,
        order: 44
      },
      includePath: {
        title: 'Include paths',
        description: 'Paths to look for imported files (@import declarations); comma separated, each path surrounded by quotes',
        type: 'string',
        "default": '',
        order: 45
      },
      precision: {
        title: 'Precision',
        description: 'Used to determine how many digits after the decimal will be allowed. For instance, if you had a decimal number of 1.23456789 and a precision of 5, the result will be 1.23457 in the final CSS',
        type: 'integer',
        "default": 5,
        minimum: 0,
        order: 46
      },
      importer: {
        title: 'Filename to custom importer',
        description: 'Path to .js file containing custom importer',
        type: 'string',
        "default": '',
        order: 47
      },
      functions: {
        title: 'Filename to custom functions',
        description: 'Path to .js file containing custom functions',
        type: 'string',
        "default": '',
        order: 48
      },
      notifications: {
        title: 'Notification type',
        description: 'Select which types of notifications you wish to see',
        type: 'string',
        "enum": ['Panel', 'Notifications', 'Panel, Notifications'],
        "default": 'Panel',
        order: 60
      },
      autoHidePanel: {
        title: 'Automatically hide panel on ...',
        description: 'Select on which event the panel should automatically disappear',
        type: 'string',
        "enum": ['Never', 'Success', 'Error', 'Success, Error'],
        "default": 'Success',
        order: 61
      },
      autoHidePanelDelay: {
        title: 'Panel-auto-hide delay',
        description: 'Delay after which panel is automatically hidden',
        type: 'integer',
        "default": 3000,
        order: 62
      },
      autoHideNotifications: {
        title: 'Automatically hide notifications on ...',
        description: 'Select which types of notifications should automatically disappear',
        type: 'string',
        "enum": ['Never', 'Info, Success', 'Error', 'Info, Success, Error'],
        "default": 'Info, Success',
        order: 63
      },
      showStartCompilingNotification: {
        title: 'Show \'Start Compiling\' Notification',
        description: 'If enabled a \'Start Compiling\' notification is shown',
        type: 'boolean',
        "default": false,
        order: 64
      },
      showAdditionalCompilationInfo: {
        title: 'Show additional compilation info',
        description: 'If enabled additiona infos like duration or file size is presented',
        type: 'boolean',
        "default": true,
        order: 65
      },
      showNodeSassOutput: {
        title: 'Show node-sass output after compilation',
        description: 'If enabled detailed output of node-sass command is shown in a new tab so you can analyse output',
        type: 'boolean',
        "default": false,
        order: 66
      },
      showOldParametersWarning: {
        title: 'Show warning when using old paramters',
        description: 'If enabled any time you compile a SASS file und you use old inline paramters, an warning will be occur not to use them',
        type: 'boolean',
        "default": true,
        order: 66
      },
      nodeSassTimeout: {
        title: '\'node-sass\' execution timeout',
        description: 'Maximal execution time of \'node-sass\'',
        type: 'integer',
        "default": 10000,
        order: 80
      },
      nodeSassPath: {
        title: 'Path to \'node-sass\' command',
        description: 'Absolute path where \'node-sass\' executable is placed. Please read documentation before usage!',
        type: 'string',
        "default": '',
        order: 81
      }
    },
    sassAutocompileView: null,
    mainSubmenu: null,
    contextMenuItem: null,
    activate: function(state) {
      this.subscriptions = new CompositeDisposable;
      this.editorSubscriptions = new CompositeDisposable;
      this.sassAutocompileView = new SassAutocompileView(new SassAutocompileOptions(), state.sassAutocompileViewState);
      this.isProcessing = false;
      if (SassAutocompileOptions.get('enabled')) {
        SassAutocompileOptions.set('compileOnSave', SassAutocompileOptions.get('enabled'));
        SassAutocompileOptions.unset('enabled');
      }
      if (SassAutocompileOptions.get('outputStyle')) {
        SassAutocompileOptions.unset('outputStyle');
      }
      if (SassAutocompileOptions.get('macOsNodeSassPath')) {
        SassAutocompileOptions.set('nodeSassPath', SassAutocompileOptions.get('macOsNodeSassPath'));
        SassAutocompileOptions.unset('macOsNodeSassPath');
      }
      this.registerCommands();
      this.registerTextEditorSaveCallback();
      this.registerConfigObserver();
      return this.registerContextMenuItem();
    },
    deactivate: function() {
      this.subscriptions.dispose();
      this.editorSubscriptions.dispose();
      return this.sassAutocompileView.destroy();
    },
    serialize: function() {
      return {
        sassAutocompileViewState: this.sassAutocompileView.serialize()
      };
    },
    registerCommands: function() {
      return this.subscriptions.add(atom.commands.add('atom-workspace', {
        'sass-autocompile:compile-to-file': (function(_this) {
          return function(evt) {
            return _this.compileToFile(evt);
          };
        })(this),
        'sass-autocompile:compile-direct': (function(_this) {
          return function(evt) {
            return _this.compileDirect(evt);
          };
        })(this),
        'sass-autocompile:toggle-compile-on-save': (function(_this) {
          return function() {
            return _this.toggleCompileOnSave();
          };
        })(this),
        'sass-autocompile:toggle-output-style-nested': (function(_this) {
          return function() {
            return _this.toggleOutputStyle('Nested');
          };
        })(this),
        'sass-autocompile:toggle-output-style-compact': (function(_this) {
          return function() {
            return _this.toggleOutputStyle('Compact');
          };
        })(this),
        'sass-autocompile:toggle-output-style-expanded': (function(_this) {
          return function() {
            return _this.toggleOutputStyle('Expanded');
          };
        })(this),
        'sass-autocompile:toggle-output-style-compressed': (function(_this) {
          return function() {
            return _this.toggleOutputStyle('Compressed');
          };
        })(this),
        'sass-autocompile:compile-every-sass-file': (function(_this) {
          return function() {
            return _this.selectCompileFileType('every');
          };
        })(this),
        'sass-autocompile:compile-only-with-first-line-comment': (function(_this) {
          return function() {
            return _this.selectCompileFileType('first-line-comment');
          };
        })(this),
        'sass-autocompile:toggle-check-output-file-already-exists': (function(_this) {
          return function() {
            return _this.toggleCheckOutputFileAlreadyExists();
          };
        })(this),
        'sass-autocompile:toggle-directly-jump-to-error': (function(_this) {
          return function() {
            return _this.toggleDirectlyJumpToError();
          };
        })(this),
        'sass-autocompile:toggle-show-compile-sass-item-in-tree-view-context-menu': (function(_this) {
          return function() {
            return _this.toggleShowCompileSassItemInTreeViewContextMenu();
          };
        })(this),
        'sass-autocompile:close-message-panel': (function(_this) {
          return function(evt) {
            _this.closePanel();
            return evt.abortKeyBinding();
          };
        })(this)
      }));
    },
    compileToFile: function(evt) {
      var activeEditor, filename, isFileItem, target;
      filename = void 0;
      if (evt.target.nodeName.toLowerCase() === 'atom-text-editor' || evt.target.nodeName.toLowerCase() === 'input') {
        activeEditor = atom.workspace.getActiveTextEditor();
        if (activeEditor) {
          filename = activeEditor.getURI();
        }
      } else {
        target = evt.target;
        if (evt.target.nodeName.toLowerCase() === 'span') {
          target = evt.target.parentNode;
        }
        isFileItem = target.getAttribute('class').split(' ').indexOf('file') >= 0;
        if (isFileItem) {
          filename = target.firstElementChild.getAttribute('data-path');
        }
      }
      if (this.isSassFile(filename)) {
        return this.compile(NodeSassCompiler.MODE_FILE, filename, false);
      }
    },
    compileDirect: function(evt) {
      if (!atom.workspace.getActiveTextEditor()) {
        return;
      }
      return this.compile(NodeSassCompiler.MODE_DIRECT);
    },
    toggleCompileOnSave: function() {
      SassAutocompileOptions.set('compileOnSave', !SassAutocompileOptions.get('compileOnSave'));
      if (SassAutocompileOptions.get('compileOnSave')) {
        atom.notifications.addInfo('SASS-AutoCompile: Enabled compile on save');
      } else {
        atom.notifications.addWarning('SASS-AutoCompile: Disabled compile on save');
      }
      return this.updateMenuItems();
    },
    toggleOutputStyle: function(outputStyle) {
      switch (outputStyle.toLowerCase()) {
        case 'compressed':
          SassAutocompileOptions.set('compileCompressed', !SassAutocompileOptions.get('compileCompressed'));
          break;
        case 'compact':
          SassAutocompileOptions.set('compileCompact', !SassAutocompileOptions.get('compileCompact'));
          break;
        case 'nested':
          SassAutocompileOptions.set('compileNested', !SassAutocompileOptions.get('compileNested'));
          break;
        case 'expanded':
          SassAutocompileOptions.set('compileExpanded', !SassAutocompileOptions.get('compileExpanded'));
      }
      return this.updateMenuItems();
    },
    selectCompileFileType: function(type) {
      if (type === 'every') {
        SassAutocompileOptions.set('compileFiles', 'Every SASS file');
      } else if (type === 'first-line-comment') {
        SassAutocompileOptions.set('compileFiles', 'Only with first-line-comment');
      }
      return this.updateMenuItems();
    },
    toggleCheckOutputFileAlreadyExists: function() {
      SassAutocompileOptions.set('checkOutputFileAlreadyExists', !SassAutocompileOptions.get('checkOutputFileAlreadyExists'));
      return this.updateMenuItems();
    },
    toggleDirectlyJumpToError: function() {
      SassAutocompileOptions.set('directlyJumpToError', !SassAutocompileOptions.get('directlyJumpToError'));
      return this.updateMenuItems();
    },
    toggleShowCompileSassItemInTreeViewContextMenu: function() {
      SassAutocompileOptions.set('showCompileSassItemInTreeViewContextMenu', !SassAutocompileOptions.get('showCompileSassItemInTreeViewContextMenu'));
      return this.updateMenuItems();
    },
    compile: function(mode, filename, minifyOnSave) {
      var options;
      if (filename == null) {
        filename = null;
      }
      if (minifyOnSave == null) {
        minifyOnSave = false;
      }
      if (this.isProcessing) {
        return;
      }
      options = new SassAutocompileOptions();
      this.isProcessing = true;
      this.sassAutocompileView.updateOptions(options);
      this.sassAutocompileView.hidePanel(false, true);
      this.compiler = new NodeSassCompiler(options);
      this.compiler.onStart((function(_this) {
        return function(args) {
          return _this.sassAutocompileView.startCompilation(args);
        };
      })(this));
      this.compiler.onWarning((function(_this) {
        return function(args) {
          return _this.sassAutocompileView.warning(args);
        };
      })(this));
      this.compiler.onSuccess((function(_this) {
        return function(args) {
          return _this.sassAutocompileView.successfullCompilation(args);
        };
      })(this));
      this.compiler.onError((function(_this) {
        return function(args) {
          return _this.sassAutocompileView.erroneousCompilation(args);
        };
      })(this));
      this.compiler.onFinished((function(_this) {
        return function(args) {
          _this.sassAutocompileView.finished(args);
          _this.isProcessing = false;
          _this.compiler.destroy();
          return _this.compiler = null;
        };
      })(this));
      return this.compiler.compile(mode, filename, minifyOnSave);
    },
    registerTextEditorSaveCallback: function() {
      return this.editorSubscriptions.add(atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          return _this.subscriptions.add(editor.onDidSave(function() {
            if (!_this.isProcessing && editor && editor.getURI && _this.isSassFile(editor.getURI())) {
              return _this.compile(NodeSassCompiler.MODE_FILE, editor.getURI(), true);
            }
          }));
        };
      })(this)));
    },
    isSassFile: function(filename) {
      return File.hasFileExtension(filename, ['.scss', '.sass']);
    },
    registerConfigObserver: function() {
      this.subscriptions.add(atom.config.observe(SassAutocompileOptions.OPTIONS_PREFIX + 'compileOnSave', (function(_this) {
        return function(newValue) {
          return _this.updateMenuItems();
        };
      })(this)));
      this.subscriptions.add(atom.config.observe(SassAutocompileOptions.OPTIONS_PREFIX + 'compileFiles', (function(_this) {
        return function(newValue) {
          return _this.updateMenuItems();
        };
      })(this)));
      this.subscriptions.add(atom.config.observe(SassAutocompileOptions.OPTIONS_PREFIX + 'checkOutputFileAlreadyExists', (function(_this) {
        return function(newValue) {
          return _this.updateMenuItems();
        };
      })(this)));
      this.subscriptions.add(atom.config.observe(SassAutocompileOptions.OPTIONS_PREFIX + 'directlyJumpToError', (function(_this) {
        return function(newValue) {
          return _this.updateMenuItems();
        };
      })(this)));
      this.subscriptions.add(atom.config.observe(SassAutocompileOptions.OPTIONS_PREFIX + 'showCompileSassItemInTreeViewContextMenu', (function(_this) {
        return function(newValue) {
          return _this.updateMenuItems();
        };
      })(this)));
      this.subscriptions.add(atom.config.observe(SassAutocompileOptions.OPTIONS_PREFIX + 'compileCompressed', (function(_this) {
        return function(newValue) {
          return _this.updateMenuItems();
        };
      })(this)));
      this.subscriptions.add(atom.config.observe(SassAutocompileOptions.OPTIONS_PREFIX + 'compileCompact', (function(_this) {
        return function(newValue) {
          return _this.updateMenuItems();
        };
      })(this)));
      this.subscriptions.add(atom.config.observe(SassAutocompileOptions.OPTIONS_PREFIX + 'compileNested', (function(_this) {
        return function(newValue) {
          return _this.updateMenuItems();
        };
      })(this)));
      return this.subscriptions.add(atom.config.observe(SassAutocompileOptions.OPTIONS_PREFIX + 'compileExpanded', (function(_this) {
        return function(newValue) {
          return _this.updateMenuItems();
        };
      })(this)));
    },
    registerContextMenuItem: function() {
      var menuItem;
      menuItem = this.getContextMenuItem();
      return menuItem.shouldDisplay = (function(_this) {
        return function(evt) {
          var child, filename, isFileItem, showItemOption, target;
          showItemOption = SassAutocompileOptions.get('showCompileSassItemInTreeViewContextMenu');
          if (showItemOption) {
            target = evt.target;
            if (target.nodeName.toLowerCase() === 'span') {
              target = target.parentNode;
            }
            isFileItem = target.getAttribute('class').split(' ').indexOf('file') >= 0;
            if (isFileItem) {
              child = target.firstElementChild;
              filename = child.getAttribute('data-name');
              return _this.isSassFile(filename);
            }
          }
          return false;
        };
      })(this);
    },
    updateMenuItems: function() {
      var compileFileMenu, menu, outputStylesMenu;
      menu = this.getMainMenuSubmenu().submenu;
      if (!menu) {
        return;
      }
      menu[3].label = (SassAutocompileOptions.get('compileOnSave') ? '✔' : '✕') + '  Compile on Save';
      menu[4].label = (SassAutocompileOptions.get('checkOutputFileAlreadyExists') ? '✔' : '✕') + '  Check output file already exists';
      menu[5].label = (SassAutocompileOptions.get('directlyJumpToError') ? '✔' : '✕') + '  Directly jump to error';
      menu[6].label = (SassAutocompileOptions.get('showCompileSassItemInTreeViewContextMenu') ? '✔' : '✕') + '  Show \'Compile SASS\' item in tree view context menu';
      compileFileMenu = menu[8].submenu;
      if (compileFileMenu) {
        compileFileMenu[0].checked = SassAutocompileOptions.get('compileFiles') === 'Every SASS file';
        compileFileMenu[1].checked = SassAutocompileOptions.get('compileFiles') === 'Only with first-line-comment';
      }
      outputStylesMenu = menu[9].submenu;
      if (outputStylesMenu) {
        outputStylesMenu[0].label = (SassAutocompileOptions.get('compileCompressed') ? '✔' : '✕') + '  Compressed';
        outputStylesMenu[1].label = (SassAutocompileOptions.get('compileCompact') ? '✔' : '✕') + '  Compact';
        outputStylesMenu[2].label = (SassAutocompileOptions.get('compileNested') ? '✔' : '✕') + '  Nested';
        outputStylesMenu[3].label = (SassAutocompileOptions.get('compileExpanded') ? '✔' : '✕') + '  Expanded';
      }
      return atom.menu.update();
    },
    getMainMenuSubmenu: function() {
      var found, i, j, len, len1, menu, ref, ref1, submenu;
      if (this.mainSubmenu === null) {
        found = false;
        ref = atom.menu.template;
        for (i = 0, len = ref.length; i < len; i++) {
          menu = ref[i];
          if (menu.label === 'Packages' || menu.label === '&Packages') {
            found = true;
            ref1 = menu.submenu;
            for (j = 0, len1 = ref1.length; j < len1; j++) {
              submenu = ref1[j];
              if (submenu.label === 'SASS Autocompile') {
                this.mainSubmenu = submenu;
                break;
              }
            }
          }
          if (found) {
            break;
          }
        }
      }
      return this.mainSubmenu;
    },
    getContextMenuItem: function() {
      var found, i, item, items, j, len, len1, ref, ref1;
      if (this.contextMenuItem === null) {
        found = false;
        ref = atom.contextMenu.itemSets;
        for (i = 0, len = ref.length; i < len; i++) {
          items = ref[i];
          if (items.selector === '.tree-view') {
            ref1 = items.items;
            for (j = 0, len1 = ref1.length; j < len1; j++) {
              item = ref1[j];
              if (item.id === 'sass-autocompile-context-menu-compile') {
                found = true;
                this.contextMenuItem = item;
                break;
              }
            }
          }
          if (found) {
            break;
          }
        }
      }
      return this.contextMenuItem;
    },
    closePanel: function() {
      return this.sassAutocompileView.hidePanel();
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvdG95b2tpLy5hdG9tL3BhY2thZ2VzL3Nhc3MtYXV0b2NvbXBpbGUvbGliL3Nhc3MtYXV0b2NvbXBpbGUuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVI7O0VBRXhCLHNCQUFBLEdBQXlCLE9BQUEsQ0FBUSxXQUFSOztFQUN6QixtQkFBQSxHQUFzQixPQUFBLENBQVEseUJBQVI7O0VBQ3RCLGdCQUFBLEdBQW1CLE9BQUEsQ0FBUSxZQUFSOztFQUVuQixJQUFBLEdBQU8sT0FBQSxDQUFRLGVBQVI7O0VBR1AsTUFBTSxDQUFDLE9BQVAsR0FFSTtJQUFBLE1BQUEsRUFJSTtNQUFBLGFBQUEsRUFDSTtRQUFBLEtBQUEsRUFBTyxpQkFBUDtRQUNBLFdBQUEsRUFBYSxpREFEYjtRQUVBLElBQUEsRUFBTSxTQUZOO1FBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQUhUO1FBSUEsS0FBQSxFQUFPLEVBSlA7T0FESjtNQU9BLFlBQUEsRUFDSTtRQUFBLEtBQUEsRUFBTyxtQkFBUDtRQUNBLFdBQUEsRUFBYSwwREFEYjtRQUVBLElBQUEsRUFBTSxRQUZOO1FBR0EsQ0FBQSxJQUFBLENBQUEsRUFBTSxDQUFDLDhCQUFELEVBQWlDLGlCQUFqQyxDQUhOO1FBSUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxpQkFKVDtRQUtBLEtBQUEsRUFBTyxFQUxQO09BUko7TUFlQSxlQUFBLEVBQ0k7UUFBQSxLQUFBLEVBQU8sa0JBQVA7UUFDQSxXQUFBLEVBQWEsZ0hBRGI7UUFFQSxJQUFBLEVBQU0sU0FGTjtRQUdBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FIVDtRQUlBLEtBQUEsRUFBTyxFQUpQO09BaEJKO01Bc0JBLDRCQUFBLEVBQ0k7UUFBQSxLQUFBLEVBQU8sNENBQVA7UUFDQSxXQUFBLEVBQWEsaUZBRGI7UUFFQSxJQUFBLEVBQU0sU0FGTjtR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SEo7O0FBREosYUFESjs7VUFPQSxJQUFHLEtBQUg7QUFDSSxrQkFESjs7QUFSSixTQUZKOztBQVlBLGFBQU8sSUFBQyxDQUFBO0lBYlEsQ0E1aEJwQjtJQTRpQkEsVUFBQSxFQUFZLFNBQUE7YUFDUixJQUFDLENBQUEsbUJBQW1CLENBQUMsU0FBckIsQ0FBQTtJQURRLENBNWlCWjs7QUFYSiIsInNvdXJjZXNDb250ZW50IjpbIntDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUoJ2F0b20nKVxuXG5TYXNzQXV0b2NvbXBpbGVPcHRpb25zID0gcmVxdWlyZSgnLi9vcHRpb25zJylcblNhc3NBdXRvY29tcGlsZVZpZXcgPSByZXF1aXJlKCcuL3Nhc3MtYXV0b2NvbXBpbGUtdmlldycpXG5Ob2RlU2Fzc0NvbXBpbGVyID0gcmVxdWlyZSgnLi9jb21waWxlcicpXG5cbkZpbGUgPSByZXF1aXJlKCcuL2hlbHBlci9maWxlJylcblxuXG5tb2R1bGUuZXhwb3J0cyA9XG5cbiAgICBjb25maWc6XG5cbiAgICAgICAgIyBHZW5lcmFsIHNldHRpbmdzXG5cbiAgICAgICAgY29tcGlsZU9uU2F2ZTpcbiAgICAgICAgICAgIHRpdGxlOiAnQ29tcGlsZSBvbiBTYXZlJ1xuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdUaGlzIG9wdGlvbiBlbi0vZGlzYWJsZXMgYXV0byBjb21waWxpbmcgb24gc2F2ZSdcbiAgICAgICAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgICAgICAgb3JkZXI6IDEwXG5cbiAgICAgICAgY29tcGlsZUZpbGVzOlxuICAgICAgICAgICAgdGl0bGU6ICdDb21waWxlIGZpbGVzIC4uLidcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnQ2hvb3NlIHdoaWNoIFNBU1MgZmlsZXMgeW91IHdhbnQgdGhpcyBwYWNrYWdlIHRvIGNvbXBpbGUnXG4gICAgICAgICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgICAgICAgZW51bTogWydPbmx5IHdpdGggZmlyc3QtbGluZS1jb21tZW50JywgJ0V2ZXJ5IFNBU1MgZmlsZSddXG4gICAgICAgICAgICBkZWZhdWx0OiAnRXZlcnkgU0FTUyBmaWxlJ1xuICAgICAgICAgICAgb3JkZXI6IDExXG5cbiAgICAgICAgY29tcGlsZVBhcnRpYWxzOlxuICAgICAgICAgICAgdGl0bGU6ICdDb21waWxlIFBhcnRpYWxzJ1xuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdDb250cm9scyBjb21waWxhdGlvbiBvZiBQYXJ0aWFscyAodW5kZXJzY29yZSBhcyBmaXJzdCBjaGFyYWN0ZXIgaW4gZmlsZW5hbWUpIGlmIHRoZXJlIGlzIG5vIGZpcnN0LWxpbmUtY29tbWVudCdcbiAgICAgICAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgICAgICAgIG9yZGVyOiAxMlxuXG4gICAgICAgIGNoZWNrT3V0cHV0RmlsZUFscmVhZHlFeGlzdHM6XG4gICAgICAgICAgICB0aXRsZTogJ0FzayBmb3Igb3ZlcndyaXRpbmcgYWxyZWFkeSBleGlzdGVudCBmaWxlcydcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnSWYgdGFyZ2V0IGZpbGUgYWxyZWFkeSBleGlzdHMsIHNhc3MtYXV0b2NvbXBpbGUgd2lsbCBhc2sgeW91IGJlZm9yZSBvdmVyd3JpdGluZydcbiAgICAgICAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgICAgICAgIG9yZGVyOiAxM1xuXG4gICAgICAgIGRpcmVjdGx5SnVtcFRvRXJyb3I6XG4gICAgICAgICAgICB0aXRsZTogJ0RpcmVjdGx5IGp1bXAgdG8gZXJyb3InXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0lmIGVuYWJsZWQgYW5kIHlvdSBjb21waWxlIGFuIGVycm9uZW91cyBTQVNTIGZpbGUsIHRoaXMgZmlsZSBpcyBvcGVuZWQgYW5kIGp1bXBlZCB0byB0aGUgcHJvYmxlbWF0aWMgcG9zaXRpb24uJ1xuICAgICAgICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICAgICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgICAgICAgb3JkZXI6IDE0XG5cbiAgICAgICAgc2hvd0NvbXBpbGVTYXNzSXRlbUluVHJlZVZpZXdDb250ZXh0TWVudTpcbiAgICAgICAgICAgIHRpdGxlOiAnU2hvdyBcXCdDb21waWxlIFNBU1NcXCcgaXRlbSBpbiBUcmVlIFZpZXcgY29udGV4dCBtZW51J1xuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdJZiBlbmFibGVkLCBUcmVlIFZpZXcgY29udGV4dCBtZW51IGNvbnRhaW5zIGEgXFwnQ29tcGlsZSBTQVNTXFwnIGl0ZW0gdGhhdCBhbGxvd3MgeW91IHRvIGNvbXBpbGUgdGhhdCBmaWxlIHZpYSBjb250ZXh0IG1lbnUnXG4gICAgICAgICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICAgICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICAgICAgICBvcmRlcjogMTVcblxuXG4gICAgICAgICMgbm9kZS1zYXNzIG9wdGlvbnNcblxuICAgICAgICBjb21waWxlQ29tcHJlc3NlZDpcbiAgICAgICAgICAgIHRpdGxlOiAnQ29tcGlsZSB3aXRoIFxcJ2NvbXByZXNzZWRcXCcgb3V0cHV0IHN0eWxlJ1xuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdJZiBlbmFibGVkIFNBU1MgZmlsZXMgYXJlIGNvbXBpbGVkIHdpdGggXFwnY29tcHJlc3NlZFxcJyBvdXRwdXQgc3R5bGUuIFBsZWFzZSBkZWZpbmUgYSBjb3JyZXNwb25kaW5nIG91dHB1dCBmaWxlbmFtZSBwYXR0ZXJuIG9yIHVzZSBpbmxpbmUgcGFyYW1ldGVyIFxcJ2NvbXByZXNzZWRGaWxlbmFtZVBhdHRlcm5cXCcnXG4gICAgICAgICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgICAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgICAgICAgIG9yZGVyOiAzMFxuXG4gICAgICAgIGNvbXByZXNzZWRGaWxlbmFtZVBhdHRlcm46XG4gICAgICAgICAgICB0aXRsZTogJ0ZpbGVuYW1lIHBhdHRlcm4gZm9yIFxcJ2NvbXByZXNzZWRcXCcgY29tcGlsZWQgZmlsZXMnXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0RlZmluZSB0aGUgcmVwbGFjZW1lbnQgcGF0dGVybiBmb3IgY29tcGlsZWQgZmlsZW5hbWVzIHdpdGggXFwnY29tcHJlc3NlZFxcJyBvdXRwdXQgc3R5bGUuIFBsYWNlaG9sZGVycyBhcmU6IFxcJyQxXFwnIGZvciBiYXNlbmFtZSBvZiBmaWxlIGFuZCBcXCckMlxcJyBmb3Igb3JpZ2luYWwgZmlsZSBleHRlbnNpb24uJ1xuICAgICAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgICAgICAgIGRlZmF1bHQ6ICckMS5taW4uY3NzJ1xuICAgICAgICAgICAgb3JkZXI6IDMxXG5cbiAgICAgICAgY29tcGlsZUNvbXBhY3Q6XG4gICAgICAgICAgICB0aXRsZTogJ0NvbXBpbGUgd2l0aCBcXCdjb21wYWN0XFwnIG91dHB1dCBzdHlsZSdcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnSWYgZW5hYmxlZCBTQVNTIGZpbGVzIGFyZSBjb21waWxlZCB3aXRoIFxcJ2NvbXBhY3RcXCcgb3V0cHV0IHN0eWxlLiBQbGVhc2UgZGVmaW5lIGEgY29ycmVzcG9uZGluZyBvdXRwdXQgZmlsZW5hbWUgcGF0dGVybiBvciB1c2UgaW5saW5lIHBhcmFtZXRlciBcXCdjb21wYWN0RmlsZW5hbWVQYXR0ZXJuXFwnJ1xuICAgICAgICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICAgICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgICAgICAgb3JkZXI6IDMyXG5cbiAgICAgICAgY29tcGFjdEZpbGVuYW1lUGF0dGVybjpcbiAgICAgICAgICAgIHRpdGxlOiAnRmlsZW5hbWUgcGF0dGVybiBmb3IgXFwnY29tcGFjdFxcJyBjb21waWxlZCBmaWxlcydcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnRGVmaW5lIHRoZSByZXBsYWNlbWVudCBwYXR0ZXJuIGZvciBjb21waWxlZCBmaWxlbmFtZXMgd2l0aCBcXCdjb21wYWN0XFwnIG91dHB1dCBzdHlsZS4gUGxhY2Vob2xkZXJzIGFyZTogXFwnJDFcXCcgZm9yIGJhc2VuYW1lIG9mIGZpbGUgYW5kIFxcJyQyXFwnIGZvciBvcmlnaW5hbCBmaWxlIGV4dGVuc2lvbi4nXG4gICAgICAgICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgICAgICAgZGVmYXVsdDogJyQxLmNvbXBhY3QuY3NzJ1xuICAgICAgICAgICAgb3JkZXI6IDMzXG5cbiAgICAgICAgY29tcGlsZU5lc3RlZDpcbiAgICAgICAgICAgIHRpdGxlOiAnQ29tcGlsZSB3aXRoIFxcJ25lc3RlZFxcJyBvdXRwdXQgc3R5bGUnXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0lmIGVuYWJsZWQgU0FTUyBmaWxlcyBhcmUgY29tcGlsZWQgd2l0aCBcXCduZXN0ZWRcXCcgb3V0cHV0IHN0eWxlLiBQbGVhc2UgZGVmaW5lIGEgY29ycmVzcG9uZGluZyBvdXRwdXQgZmlsZW5hbWUgcGF0dGVybiBvciB1c2UgaW5saW5lIHBhcmFtZXRlciBcXCduZXN0ZWRGaWxlbmFtZVBhdHRlcm5cXCcnXG4gICAgICAgICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICAgICAgICBvcmRlcjogMzRcblxuICAgICAgICBuZXN0ZWRGaWxlbmFtZVBhdHRlcm46XG4gICAgICAgICAgICB0aXRsZTogJ0ZpbGVuYW1lIHBhdHRlcm4gZm9yIFxcJ25lc3RlZFxcJyBjb21waWxlZCBmaWxlcydcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnRGVmaW5lIHRoZSByZXBsYWNlbWVudCBwYXR0ZXJuIGZvciBjb21waWxlZCBmaWxlbmFtZXMgd2l0aCBcXCduZXN0ZWRcXCcgb3V0cHV0IHN0eWxlLiBQbGFjZWhvbGRlcnMgYXJlOiBcXCckMVxcJyBmb3IgYmFzZW5hbWUgb2YgZmlsZSBhbmQgXFwnJDJcXCcgZm9yIG9yaWdpbmFsIGZpbGUgZXh0ZW5zaW9uLidcbiAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICAgICAgICBkZWZhdWx0OiAnJDEubmVzdGVkLmNzcydcbiAgICAgICAgICAgIG9yZGVyOiAzNVxuXG4gICAgICAgIGNvbXBpbGVFeHBhbmRlZDpcbiAgICAgICAgICAgIHRpdGxlOiAnQ29tcGlsZSB3aXRoIFxcJ2V4cGFuZGVkXFwnIG91dHB1dCBzdHlsZSdcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnSWYgZW5hYmxlZCBTQVNTIGZpbGVzIGFyZSBjb21waWxlZCB3aXRoIFxcJ2V4cGFuZGVkXFwnIG91dHB1dCBzdHlsZS4gUGxlYXNlIGRlZmluZSBhIGNvcnJlc3BvbmRpbmcgb3V0cHV0IGZpbGVuYW1lIHBhdHRlcm4gb3IgdXNlIGlubGluZSBwYXJhbWV0ZXIgXFwnZXhwYW5kZWRGaWxlbmFtZVBhdHRlcm5cXCcnXG4gICAgICAgICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICAgICAgICBvcmRlcjogMzZcblxuICAgICAgICBleHBhbmRlZEZpbGVuYW1lUGF0dGVybjpcbiAgICAgICAgICAgIHRpdGxlOiAnRmlsZW5hbWUgcGF0dGVybiBmb3IgXFwnZXhwYW5kZWRcXCcgY29tcGlsZWQgZmlsZXMnXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0RlZmluZSB0aGUgcmVwbGFjZW1lbnQgcGF0dGVybiBmb3IgY29tcGlsZWQgZmlsZW5hbWVzIHdpdGggXFwnZXhwYW5kZWRcXCcgb3V0cHV0IHN0eWxlLiBQbGFjZWhvbGRlcnMgYXJlOiBcXCckMVxcJyBmb3IgYmFzZW5hbWUgb2YgZmlsZSBhbmQgXFwnJDJcXCcgZm9yIG9yaWdpbmFsIGZpbGUgZXh0ZW5zaW9uLidcbiAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICAgICAgICBkZWZhdWx0OiAnJDEuY3NzJ1xuICAgICAgICAgICAgb3JkZXI6IDM3XG5cbiAgICAgICAgaW5kZW50VHlwZTpcbiAgICAgICAgICAgIHRpdGxlOiAnSW5kZW50IHR5cGUnXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0luZGVudCB0eXBlIGZvciBvdXRwdXQgQ1NTJ1xuICAgICAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgICAgICAgIGVudW06IFsnU3BhY2UnLCAnVGFiJ11cbiAgICAgICAgICAgIGRlZmF1bHQ6ICdTcGFjZSdcbiAgICAgICAgICAgIG9yZGVyOiAzOFxuXG4gICAgICAgIGluZGVudFdpZHRoOlxuICAgICAgICAgICAgdGl0bGU6ICdJbmRlbnQgd2lkdGgnXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0luZGVudCB3aWR0aDsgbnVtYmVyIG9mIHNwYWNlcyBvciB0YWJzJ1xuICAgICAgICAgICAgdHlwZTogJ2ludGVnZXInXG4gICAgICAgICAgICBlbnVtOiBbMCwgMSwgMiwgMywgNCwgNSwgNiwgNywgOCwgOSwgMTBdXG4gICAgICAgICAgICBkZWZhdWx0OiAyXG4gICAgICAgICAgICBtaW5pbXVtOiAwXG4gICAgICAgICAgICBtYXhpbXVtOiAxMFxuICAgICAgICAgICAgb3JkZXI6IDM5XG5cbiAgICAgICAgbGluZWZlZWQ6XG4gICAgICAgICAgICB0aXRsZTogJ0xpbmVmZWVkJ1xuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdVc2VkIHRvIGRldGVybWluZSB3aGV0aGVyIHRvIHVzZSBcXCdjclxcJywgXFwnY3JsZlxcJywgXFwnbGZcXCcgb3IgXFwnbGZjclxcJyBzZXF1ZW5jZSBmb3IgbGluZSBicmVhaydcbiAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICAgICAgICBlbnVtOiBbJ2NyJywgJ2NybGYnLCAnbGYnLCAnbGZjciddXG4gICAgICAgICAgICBkZWZhdWx0OiAnbGYnXG4gICAgICAgICAgICBvcmRlcjogNDBcblxuICAgICAgICBzb3VyY2VNYXA6XG4gICAgICAgICAgICB0aXRsZTogJ0J1aWxkIHNvdXJjZSBtYXAnXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0lmIGVuYWJsZWQgYSBzb3VyY2UgbWFwIGlzIGdlbmVyYXRlZCdcbiAgICAgICAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgICAgICAgIG9yZGVyOiA0MVxuXG4gICAgICAgIHNvdXJjZU1hcEVtYmVkOlxuICAgICAgICAgICAgdGl0bGU6ICdFbWJlZCBzb3VyY2UgbWFwJ1xuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdJZiBlbmFibGVkIHNvdXJjZSBtYXAgaXMgZW1iZWRkZWQgYXMgYSBkYXRhIFVSSSdcbiAgICAgICAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgICAgICAgIG9yZGVyOiA0MlxuXG4gICAgICAgIHNvdXJjZU1hcENvbnRlbnRzOlxuICAgICAgICAgICAgdGl0bGU6ICdJbmNsdWRlIGNvbnRlbnRzIGluIHNvdXJjZSBtYXAgaW5mb3JtYXRpb24nXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0lmIGVuYWJsZWQgY29udGVudHMgYXJlIGluY2x1ZGVkIGluIHNvdXJjZSBtYXAgaW5mb3JtYXRpb24nXG4gICAgICAgICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICAgICAgICBvcmRlcjogNDNcblxuICAgICAgICBzb3VyY2VDb21tZW50czpcbiAgICAgICAgICAgIHRpdGxlOiAnSW5jbHVkZSBhZGRpdGlvbmFsIGRlYnVnZ2luZyBpbmZvcm1hdGlvbiBpbiB0aGUgb3V0cHV0IENTUyBmaWxlJ1xuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdJZiBlbmFibGVkIGFkZGl0aW9uYWwgZGVidWdnaW5nIGluZm9ybWF0aW9uIGFyZSBhZGRlZCB0byB0aGUgb3V0cHV0IGZpbGUgYXMgQ1NTIGNvbW1lbnRzLiBJZiBDU1MgaXMgY29tcHJlc3NlZCB0aGlzIGZlYXR1cmUgaXMgZGlzYWJsZWQgYnkgU0FTUyBjb21waWxlcidcbiAgICAgICAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgICAgICAgIG9yZGVyOiA0NFxuXG4gICAgICAgIGluY2x1ZGVQYXRoOlxuICAgICAgICAgICAgdGl0bGU6ICdJbmNsdWRlIHBhdGhzJ1xuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdQYXRocyB0byBsb29rIGZvciBpbXBvcnRlZCBmaWxlcyAoQGltcG9ydCBkZWNsYXJhdGlvbnMpOyBjb21tYSBzZXBhcmF0ZWQsIGVhY2ggcGF0aCBzdXJyb3VuZGVkIGJ5IHF1b3RlcydcbiAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICAgICAgICBkZWZhdWx0OiAnJ1xuICAgICAgICAgICAgb3JkZXI6IDQ1XG5cbiAgICAgICAgcHJlY2lzaW9uOlxuICAgICAgICAgICAgdGl0bGU6ICdQcmVjaXNpb24nXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1VzZWQgdG8gZGV0ZXJtaW5lIGhvdyBtYW55IGRpZ2l0cyBhZnRlciB0aGUgZGVjaW1hbCB3aWxsIGJlIGFsbG93ZWQuIEZvciBpbnN0YW5jZSwgaWYgeW91IGhhZCBhIGRlY2ltYWwgbnVtYmVyIG9mIDEuMjM0NTY3ODkgYW5kIGEgcHJlY2lzaW9uIG9mIDUsIHRoZSByZXN1bHQgd2lsbCBiZSAxLjIzNDU3IGluIHRoZSBmaW5hbCBDU1MnXG4gICAgICAgICAgICB0eXBlOiAnaW50ZWdlcidcbiAgICAgICAgICAgIGRlZmF1bHQ6IDVcbiAgICAgICAgICAgIG1pbmltdW06IDBcbiAgICAgICAgICAgIG9yZGVyOiA0NlxuXG4gICAgICAgIGltcG9ydGVyOlxuICAgICAgICAgICAgdGl0bGU6ICdGaWxlbmFtZSB0byBjdXN0b20gaW1wb3J0ZXInXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1BhdGggdG8gLmpzIGZpbGUgY29udGFpbmluZyBjdXN0b20gaW1wb3J0ZXInXG4gICAgICAgICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgICAgICAgZGVmYXVsdDogJydcbiAgICAgICAgICAgIG9yZGVyOiA0N1xuXG4gICAgICAgIGZ1bmN0aW9uczpcbiAgICAgICAgICAgIHRpdGxlOiAnRmlsZW5hbWUgdG8gY3VzdG9tIGZ1bmN0aW9ucydcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnUGF0aCB0byAuanMgZmlsZSBjb250YWluaW5nIGN1c3RvbSBmdW5jdGlvbnMnXG4gICAgICAgICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgICAgICAgZGVmYXVsdDogJydcbiAgICAgICAgICAgIG9yZGVyOiA0OFxuXG5cbiAgICAgICAgIyBOb3RpZmljYXRpb24gb3B0aW9uc1xuXG4gICAgICAgIG5vdGlmaWNhdGlvbnM6XG4gICAgICAgICAgICB0aXRsZTogJ05vdGlmaWNhdGlvbiB0eXBlJ1xuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdTZWxlY3Qgd2hpY2ggdHlwZXMgb2Ygbm90aWZpY2F0aW9ucyB5b3Ugd2lzaCB0byBzZWUnXG4gICAgICAgICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgICAgICAgZW51bTogWydQYW5lbCcsICdOb3RpZmljYXRpb25zJywgJ1BhbmVsLCBOb3RpZmljYXRpb25zJ11cbiAgICAgICAgICAgIGRlZmF1bHQ6ICdQYW5lbCdcbiAgICAgICAgICAgIG9yZGVyOiA2MFxuXG4gICAgICAgIGF1dG9IaWRlUGFuZWw6XG4gICAgICAgICAgICB0aXRsZTogJ0F1dG9tYXRpY2FsbHkgaGlkZSBwYW5lbCBvbiAuLi4nXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1NlbGVjdCBvbiB3aGljaCBldmVudCB0aGUgcGFuZWwgc2hvdWxkIGF1dG9tYXRpY2FsbHkgZGlzYXBwZWFyJ1xuICAgICAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgICAgICAgIGVudW06IFsnTmV2ZXInLCAnU3VjY2VzcycsICdFcnJvcicsICdTdWNjZXNzLCBFcnJvciddXG4gICAgICAgICAgICBkZWZhdWx0OiAnU3VjY2VzcydcbiAgICAgICAgICAgIG9yZGVyOiA2MVxuXG4gICAgICAgIGF1dG9IaWRlUGFuZWxEZWxheTpcbiAgICAgICAgICAgIHRpdGxlOiAnUGFuZWwtYXV0by1oaWRlIGRlbGF5J1xuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdEZWxheSBhZnRlciB3aGljaCBwYW5lbCBpcyBhdXRvbWF0aWNhbGx5IGhpZGRlbidcbiAgICAgICAgICAgIHR5cGU6ICdpbnRlZ2VyJ1xuICAgICAgICAgICAgZGVmYXVsdDogMzAwMFxuICAgICAgICAgICAgb3JkZXI6IDYyXG5cbiAgICAgICAgYXV0b0hpZGVOb3RpZmljYXRpb25zOlxuICAgICAgICAgICAgdGl0bGU6ICdBdXRvbWF0aWNhbGx5IGhpZGUgbm90aWZpY2F0aW9ucyBvbiAuLi4nXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1NlbGVjdCB3aGljaCB0eXBlcyBvZiBub3RpZmljYXRpb25zIHNob3VsZCBhdXRvbWF0aWNhbGx5IGRpc2FwcGVhcidcbiAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICAgICAgICBlbnVtOiBbJ05ldmVyJywgJ0luZm8sIFN1Y2Nlc3MnLCAnRXJyb3InLCAnSW5mbywgU3VjY2VzcywgRXJyb3InXVxuICAgICAgICAgICAgZGVmYXVsdDogJ0luZm8sIFN1Y2Nlc3MnXG4gICAgICAgICAgICBvcmRlcjogNjNcblxuICAgICAgICBzaG93U3RhcnRDb21waWxpbmdOb3RpZmljYXRpb246XG4gICAgICAgICAgICB0aXRsZTogJ1Nob3cgXFwnU3RhcnQgQ29tcGlsaW5nXFwnIE5vdGlmaWNhdGlvbidcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnSWYgZW5hYmxlZCBhIFxcJ1N0YXJ0IENvbXBpbGluZ1xcJyBub3RpZmljYXRpb24gaXMgc2hvd24nXG4gICAgICAgICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgICAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICAgICAgICBvcmRlcjogNjRcblxuICAgICAgICBzaG93QWRkaXRpb25hbENvbXBpbGF0aW9uSW5mbzpcbiAgICAgICAgICAgIHRpdGxlOiAnU2hvdyBhZGRpdGlvbmFsIGNvbXBpbGF0aW9uIGluZm8nXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0lmIGVuYWJsZWQgYWRkaXRpb25hIGluZm9zIGxpa2UgZHVyYXRpb24gb3IgZmlsZSBzaXplIGlzIHByZXNlbnRlZCdcbiAgICAgICAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgICAgICAgb3JkZXI6IDY1XG5cbiAgICAgICAgc2hvd05vZGVTYXNzT3V0cHV0OlxuICAgICAgICAgICAgdGl0bGU6ICdTaG93IG5vZGUtc2FzcyBvdXRwdXQgYWZ0ZXIgY29tcGlsYXRpb24nXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0lmIGVuYWJsZWQgZGV0YWlsZWQgb3V0cHV0IG9mIG5vZGUtc2FzcyBjb21tYW5kIGlzIHNob3duIGluIGEgbmV3IHRhYiBzbyB5b3UgY2FuIGFuYWx5c2Ugb3V0cHV0J1xuICAgICAgICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICAgICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgICAgICAgb3JkZXI6IDY2XG5cbiAgICAgICAgc2hvd09sZFBhcmFtZXRlcnNXYXJuaW5nOlxuICAgICAgICAgICAgdGl0bGU6ICdTaG93IHdhcm5pbmcgd2hlbiB1c2luZyBvbGQgcGFyYW10ZXJzJ1xuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdJZiBlbmFibGVkIGFueSB0aW1lIHlvdSBjb21waWxlIGEgU0FTUyBmaWxlIHVuZCB5b3UgdXNlIG9sZCBpbmxpbmUgcGFyYW10ZXJzLCBhbiB3YXJuaW5nIHdpbGwgYmUgb2NjdXIgbm90IHRvIHVzZSB0aGVtJ1xuICAgICAgICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICAgICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICAgICAgICBvcmRlcjogNjZcblxuXG4gICAgICAgICMgQWR2YW5jZWQgb3B0aW9uc1xuXG4gICAgICAgIG5vZGVTYXNzVGltZW91dDpcbiAgICAgICAgICAgIHRpdGxlOiAnXFwnbm9kZS1zYXNzXFwnIGV4ZWN1dGlvbiB0aW1lb3V0J1xuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdNYXhpbWFsIGV4ZWN1dGlvbiB0aW1lIG9mIFxcJ25vZGUtc2Fzc1xcJydcbiAgICAgICAgICAgIHR5cGU6ICdpbnRlZ2VyJ1xuICAgICAgICAgICAgZGVmYXVsdDogMTAwMDBcbiAgICAgICAgICAgIG9yZGVyOiA4MFxuXG4gICAgICAgIG5vZGVTYXNzUGF0aDpcbiAgICAgICAgICAgIHRpdGxlOiAnUGF0aCB0byBcXCdub2RlLXNhc3NcXCcgY29tbWFuZCdcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnQWJzb2x1dGUgcGF0aCB3aGVyZSBcXCdub2RlLXNhc3NcXCcgZXhlY3V0YWJsZSBpcyBwbGFjZWQuIFBsZWFzZSByZWFkIGRvY3VtZW50YXRpb24gYmVmb3JlIHVzYWdlISdcbiAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICAgICAgICBkZWZhdWx0OiAnJ1xuICAgICAgICAgICAgb3JkZXI6IDgxXG5cblxuICAgIHNhc3NBdXRvY29tcGlsZVZpZXc6IG51bGxcbiAgICBtYWluU3VibWVudTogbnVsbFxuICAgIGNvbnRleHRNZW51SXRlbTogbnVsbFxuXG5cbiAgICBhY3RpdmF0ZTogKHN0YXRlKSAtPlxuICAgICAgICBAc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgICAgIEBlZGl0b3JTdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcblxuICAgICAgICBAc2Fzc0F1dG9jb21waWxlVmlldyA9IG5ldyBTYXNzQXV0b2NvbXBpbGVWaWV3KG5ldyBTYXNzQXV0b2NvbXBpbGVPcHRpb25zKCksIHN0YXRlLnNhc3NBdXRvY29tcGlsZVZpZXdTdGF0ZSlcbiAgICAgICAgQGlzUHJvY2Vzc2luZyA9IGZhbHNlXG5cblxuICAgICAgICAjIERlcHJlY2F0ZWQgb3B0aW9uIC0tIFJlbW92ZSBpbiBsYXRlciB2ZXJzaW9uISEhXG4gICAgICAgIGlmIFNhc3NBdXRvY29tcGlsZU9wdGlvbnMuZ2V0KCdlbmFibGVkJylcbiAgICAgICAgICAgIFNhc3NBdXRvY29tcGlsZU9wdGlvbnMuc2V0KCdjb21waWxlT25TYXZlJywgU2Fzc0F1dG9jb21waWxlT3B0aW9ucy5nZXQoJ2VuYWJsZWQnKSlcbiAgICAgICAgICAgIFNhc3NBdXRvY29tcGlsZU9wdGlvbnMudW5zZXQoJ2VuYWJsZWQnKVxuICAgICAgICBpZiBTYXNzQXV0b2NvbXBpbGVPcHRpb25zLmdldCgnb3V0cHV0U3R5bGUnKVxuICAgICAgICAgICAgU2Fzc0F1dG9jb21waWxlT3B0aW9ucy51bnNldCgnb3V0cHV0U3R5bGUnKVxuICAgICAgICBpZiBTYXNzQXV0b2NvbXBpbGVPcHRpb25zLmdldCgnbWFjT3NOb2RlU2Fzc1BhdGgnKVxuICAgICAgICAgICAgU2Fzc0F1dG9jb21waWxlT3B0aW9ucy5zZXQoJ25vZGVTYXNzUGF0aCcsIFNhc3NBdXRvY29tcGlsZU9wdGlvbnMuZ2V0KCdtYWNPc05vZGVTYXNzUGF0aCcpKVxuICAgICAgICAgICAgU2Fzc0F1dG9jb21waWxlT3B0aW9ucy51bnNldCgnbWFjT3NOb2RlU2Fzc1BhdGgnKVxuXG5cbiAgICAgICAgQHJlZ2lzdGVyQ29tbWFuZHMoKVxuICAgICAgICBAcmVnaXN0ZXJUZXh0RWRpdG9yU2F2ZUNhbGxiYWNrKClcbiAgICAgICAgQHJlZ2lzdGVyQ29uZmlnT2JzZXJ2ZXIoKVxuICAgICAgICBAcmVnaXN0ZXJDb250ZXh0TWVudUl0ZW0oKVxuXG5cbiAgICBkZWFjdGl2YXRlOiAoKSAtPlxuICAgICAgICBAc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICAgICAgQGVkaXRvclN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgICAgIEBzYXNzQXV0b2NvbXBpbGVWaWV3LmRlc3Ryb3koKVxuXG5cbiAgICBzZXJpYWxpemU6ICgpIC0+XG4gICAgICAgIHNhc3NBdXRvY29tcGlsZVZpZXdTdGF0ZTogQHNhc3NBdXRvY29tcGlsZVZpZXcuc2VyaWFsaXplKClcblxuXG4gICAgcmVnaXN0ZXJDb21tYW5kczogKCkgLT5cbiAgICAgICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZScsXG4gICAgICAgICAgICAnc2Fzcy1hdXRvY29tcGlsZTpjb21waWxlLXRvLWZpbGUnOiAoZXZ0KSA9PlxuICAgICAgICAgICAgICAgIEBjb21waWxlVG9GaWxlKGV2dClcblxuICAgICAgICAgICAgJ3Nhc3MtYXV0b2NvbXBpbGU6Y29tcGlsZS1kaXJlY3QnOiAoZXZ0KSA9PlxuICAgICAgICAgICAgICAgIEBjb21waWxlRGlyZWN0KGV2dClcblxuICAgICAgICAgICAgJ3Nhc3MtYXV0b2NvbXBpbGU6dG9nZ2xlLWNvbXBpbGUtb24tc2F2ZSc6ID0+XG4gICAgICAgICAgICAgICAgQHRvZ2dsZUNvbXBpbGVPblNhdmUoKVxuXG4gICAgICAgICAgICAnc2Fzcy1hdXRvY29tcGlsZTp0b2dnbGUtb3V0cHV0LXN0eWxlLW5lc3RlZCc6ID0+XG4gICAgICAgICAgICAgICAgQHRvZ2dsZU91dHB1dFN0eWxlKCdOZXN0ZWQnKVxuXG4gICAgICAgICAgICAnc2Fzcy1hdXRvY29tcGlsZTp0b2dnbGUtb3V0cHV0LXN0eWxlLWNvbXBhY3QnOiA9PlxuICAgICAgICAgICAgICAgIEB0b2dnbGVPdXRwdXRTdHlsZSgnQ29tcGFjdCcpXG5cbiAgICAgICAgICAgICdzYXNzLWF1dG9jb21waWxlOnRvZ2dsZS1vdXRwdXQtc3R5bGUtZXhwYW5kZWQnOiA9PlxuICAgICAgICAgICAgICAgIEB0b2dnbGVPdXRwdXRTdHlsZSgnRXhwYW5kZWQnKVxuXG4gICAgICAgICAgICAnc2Fzcy1hdXRvY29tcGlsZTp0b2dnbGUtb3V0cHV0LXN0eWxlLWNvbXByZXNzZWQnOiA9PlxuICAgICAgICAgICAgICAgIEB0b2dnbGVPdXRwdXRTdHlsZSgnQ29tcHJlc3NlZCcpXG5cbiAgICAgICAgICAgICdzYXNzLWF1dG9jb21waWxlOmNvbXBpbGUtZXZlcnktc2Fzcy1maWxlJzogPT5cbiAgICAgICAgICAgICAgICBAc2VsZWN0Q29tcGlsZUZpbGVUeXBlKCdldmVyeScpXG5cbiAgICAgICAgICAgICdzYXNzLWF1dG9jb21waWxlOmNvbXBpbGUtb25seS13aXRoLWZpcnN0LWxpbmUtY29tbWVudCc6ID0+XG4gICAgICAgICAgICAgICAgQHNlbGVjdENvbXBpbGVGaWxlVHlwZSgnZmlyc3QtbGluZS1jb21tZW50JylcblxuICAgICAgICAgICAgJ3Nhc3MtYXV0b2NvbXBpbGU6dG9nZ2xlLWNoZWNrLW91dHB1dC1maWxlLWFscmVhZHktZXhpc3RzJzogPT5cbiAgICAgICAgICAgICAgICBAdG9nZ2xlQ2hlY2tPdXRwdXRGaWxlQWxyZWFkeUV4aXN0cygpXG5cbiAgICAgICAgICAgICdzYXNzLWF1dG9jb21waWxlOnRvZ2dsZS1kaXJlY3RseS1qdW1wLXRvLWVycm9yJzogPT5cbiAgICAgICAgICAgICAgICBAdG9nZ2xlRGlyZWN0bHlKdW1wVG9FcnJvcigpXG5cbiAgICAgICAgICAgICdzYXNzLWF1dG9jb21waWxlOnRvZ2dsZS1zaG93LWNvbXBpbGUtc2Fzcy1pdGVtLWluLXRyZWUtdmlldy1jb250ZXh0LW1lbnUnOiA9PlxuICAgICAgICAgICAgICAgIEB0b2dnbGVTaG93Q29tcGlsZVNhc3NJdGVtSW5UcmVlVmlld0NvbnRleHRNZW51KClcblxuICAgICAgICAgICAgJ3Nhc3MtYXV0b2NvbXBpbGU6Y2xvc2UtbWVzc2FnZS1wYW5lbCc6IChldnQpID0+XG4gICAgICAgICAgICAgICAgQGNsb3NlUGFuZWwoKVxuICAgICAgICAgICAgICAgIGV2dC5hYm9ydEtleUJpbmRpbmcoKVxuXG5cbiAgICBjb21waWxlVG9GaWxlOiAoZXZ0KSAtPlxuICAgICAgICBmaWxlbmFtZSA9IHVuZGVmaW5lZFxuICAgICAgICBpZiBldnQudGFyZ2V0Lm5vZGVOYW1lLnRvTG93ZXJDYXNlKCkgaXMgJ2F0b20tdGV4dC1lZGl0b3InIG9yIGV2dC50YXJnZXQubm9kZU5hbWUudG9Mb3dlckNhc2UoKSBpcyAnaW5wdXQnXG4gICAgICAgICAgICBhY3RpdmVFZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICAgICAgICAgIGlmIGFjdGl2ZUVkaXRvclxuICAgICAgICAgICAgICAgIGZpbGVuYW1lID0gYWN0aXZlRWRpdG9yLmdldFVSSSgpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRhcmdldCA9IGV2dC50YXJnZXRcbiAgICAgICAgICAgIGlmIGV2dC50YXJnZXQubm9kZU5hbWUudG9Mb3dlckNhc2UoKSBpcyAnc3BhbidcbiAgICAgICAgICAgICAgICB0YXJnZXQ9IGV2dC50YXJnZXQucGFyZW50Tm9kZVxuICAgICAgICAgICAgaXNGaWxlSXRlbSA9IHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2NsYXNzJykuc3BsaXQoJyAnKS5pbmRleE9mKCdmaWxlJykgPj0gMFxuICAgICAgICAgICAgaWYgaXNGaWxlSXRlbVxuICAgICAgICAgICAgICAgIGZpbGVuYW1lID0gdGFyZ2V0LmZpcnN0RWxlbWVudENoaWxkLmdldEF0dHJpYnV0ZSgnZGF0YS1wYXRoJylcblxuICAgICAgICBpZiBAaXNTYXNzRmlsZShmaWxlbmFtZSlcbiAgICAgICAgICAgIEBjb21waWxlKE5vZGVTYXNzQ29tcGlsZXIuTU9ERV9GSUxFLCBmaWxlbmFtZSwgZmFsc2UpXG5cblxuICAgIGNvbXBpbGVEaXJlY3Q6IChldnQpIC0+XG4gICAgICAgIHJldHVybiB1bmxlc3MgYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgICAgIEBjb21waWxlKE5vZGVTYXNzQ29tcGlsZXIuTU9ERV9ESVJFQ1QpXG5cblxuICAgIHRvZ2dsZUNvbXBpbGVPblNhdmU6ICgpIC0+XG4gICAgICAgIFNhc3NBdXRvY29tcGlsZU9wdGlvbnMuc2V0KCdjb21waWxlT25TYXZlJywgIVNhc3NBdXRvY29tcGlsZU9wdGlvbnMuZ2V0KCdjb21waWxlT25TYXZlJykpXG4gICAgICAgIGlmIFNhc3NBdXRvY29tcGlsZU9wdGlvbnMuZ2V0KCdjb21waWxlT25TYXZlJylcbiAgICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvICdTQVNTLUF1dG9Db21waWxlOiBFbmFibGVkIGNvbXBpbGUgb24gc2F2ZSdcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcgJ1NBU1MtQXV0b0NvbXBpbGU6IERpc2FibGVkIGNvbXBpbGUgb24gc2F2ZSdcbiAgICAgICAgQHVwZGF0ZU1lbnVJdGVtcygpXG5cblxuICAgIHRvZ2dsZU91dHB1dFN0eWxlOiAob3V0cHV0U3R5bGUpIC0+XG4gICAgICAgIHN3aXRjaCBvdXRwdXRTdHlsZS50b0xvd2VyQ2FzZSgpXG4gICAgICAgICAgICB3aGVuICdjb21wcmVzc2VkJyB0aGVuIFNhc3NBdXRvY29tcGlsZU9wdGlvbnMuc2V0KCdjb21waWxlQ29tcHJlc3NlZCcsICFTYXNzQXV0b2NvbXBpbGVPcHRpb25zLmdldCgnY29tcGlsZUNvbXByZXNzZWQnKSlcbiAgICAgICAgICAgIHdoZW4gJ2NvbXBhY3QnIHRoZW4gU2Fzc0F1dG9jb21waWxlT3B0aW9ucy5zZXQoJ2NvbXBpbGVDb21wYWN0JywgIVNhc3NBdXRvY29tcGlsZU9wdGlvbnMuZ2V0KCdjb21waWxlQ29tcGFjdCcpKVxuICAgICAgICAgICAgd2hlbiAnbmVzdGVkJyB0aGVuIFNhc3NBdXRvY29tcGlsZU9wdGlvbnMuc2V0KCdjb21waWxlTmVzdGVkJywgIVNhc3NBdXRvY29tcGlsZU9wdGlvbnMuZ2V0KCdjb21waWxlTmVzdGVkJykpXG4gICAgICAgICAgICB3aGVuICdleHBhbmRlZCcgdGhlbiBTYXNzQXV0b2NvbXBpbGVPcHRpb25zLnNldCgnY29tcGlsZUV4cGFuZGVkJywgIVNhc3NBdXRvY29tcGlsZU9wdGlvbnMuZ2V0KCdjb21waWxlRXhwYW5kZWQnKSlcbiAgICAgICAgQHVwZGF0ZU1lbnVJdGVtcygpXG5cblxuICAgIHNlbGVjdENvbXBpbGVGaWxlVHlwZTogKHR5cGUpIC0+XG4gICAgICAgIGlmIHR5cGUgaXMgJ2V2ZXJ5J1xuICAgICAgICAgICAgU2Fzc0F1dG9jb21waWxlT3B0aW9ucy5zZXQoJ2NvbXBpbGVGaWxlcycsICdFdmVyeSBTQVNTIGZpbGUnKVxuICAgICAgICBlbHNlIGlmIHR5cGUgaXMgJ2ZpcnN0LWxpbmUtY29tbWVudCdcbiAgICAgICAgICAgIFNhc3NBdXRvY29tcGlsZU9wdGlvbnMuc2V0KCdjb21waWxlRmlsZXMnLCAnT25seSB3aXRoIGZpcnN0LWxpbmUtY29tbWVudCcpXG5cbiAgICAgICAgQHVwZGF0ZU1lbnVJdGVtcygpXG5cblxuICAgIHRvZ2dsZUNoZWNrT3V0cHV0RmlsZUFscmVhZHlFeGlzdHM6ICgpIC0+XG4gICAgICAgIFNhc3NBdXRvY29tcGlsZU9wdGlvbnMuc2V0KCdjaGVja091dHB1dEZpbGVBbHJlYWR5RXhpc3RzJywgIVNhc3NBdXRvY29tcGlsZU9wdGlvbnMuZ2V0KCdjaGVja091dHB1dEZpbGVBbHJlYWR5RXhpc3RzJykpXG4gICAgICAgIEB1cGRhdGVNZW51SXRlbXMoKVxuXG5cbiAgICB0b2dnbGVEaXJlY3RseUp1bXBUb0Vycm9yOiAoKSAtPlxuICAgICAgICBTYXNzQXV0b2NvbXBpbGVPcHRpb25zLnNldCgnZGlyZWN0bHlKdW1wVG9FcnJvcicsICFTYXNzQXV0b2NvbXBpbGVPcHRpb25zLmdldCgnZGlyZWN0bHlKdW1wVG9FcnJvcicpKVxuICAgICAgICBAdXBkYXRlTWVudUl0ZW1zKClcblxuXG4gICAgdG9nZ2xlU2hvd0NvbXBpbGVTYXNzSXRlbUluVHJlZVZpZXdDb250ZXh0TWVudTogKCkgLT5cbiAgICAgICAgU2Fzc0F1dG9jb21waWxlT3B0aW9ucy5zZXQoJ3Nob3dDb21waWxlU2Fzc0l0ZW1JblRyZWVWaWV3Q29udGV4dE1lbnUnLCAhU2Fzc0F1dG9jb21waWxlT3B0aW9ucy5nZXQoJ3Nob3dDb21waWxlU2Fzc0l0ZW1JblRyZWVWaWV3Q29udGV4dE1lbnUnKSlcbiAgICAgICAgQHVwZGF0ZU1lbnVJdGVtcygpXG5cblxuICAgIGNvbXBpbGU6IChtb2RlLCBmaWxlbmFtZSA9IG51bGwsIG1pbmlmeU9uU2F2ZSA9IGZhbHNlKSAtPlxuICAgICAgICBpZiBAaXNQcm9jZXNzaW5nXG4gICAgICAgICAgICByZXR1cm5cblxuICAgICAgICBvcHRpb25zID0gbmV3IFNhc3NBdXRvY29tcGlsZU9wdGlvbnMoKVxuICAgICAgICBAaXNQcm9jZXNzaW5nID0gdHJ1ZVxuXG4gICAgICAgIEBzYXNzQXV0b2NvbXBpbGVWaWV3LnVwZGF0ZU9wdGlvbnMob3B0aW9ucylcbiAgICAgICAgQHNhc3NBdXRvY29tcGlsZVZpZXcuaGlkZVBhbmVsKGZhbHNlLCB0cnVlKVxuXG4gICAgICAgIEBjb21waWxlciA9IG5ldyBOb2RlU2Fzc0NvbXBpbGVyKG9wdGlvbnMpXG4gICAgICAgIEBjb21waWxlci5vblN0YXJ0IChhcmdzKSA9PlxuICAgICAgICAgICAgQHNhc3NBdXRvY29tcGlsZVZpZXcuc3RhcnRDb21waWxhdGlvbihhcmdzKVxuXG4gICAgICAgIEBjb21waWxlci5vbldhcm5pbmcgKGFyZ3MpID0+XG4gICAgICAgICAgICBAc2Fzc0F1dG9jb21waWxlVmlldy53YXJuaW5nKGFyZ3MpXG5cbiAgICAgICAgQGNvbXBpbGVyLm9uU3VjY2VzcyAoYXJncykgPT5cbiAgICAgICAgICAgIEBzYXNzQXV0b2NvbXBpbGVWaWV3LnN1Y2Nlc3NmdWxsQ29tcGlsYXRpb24oYXJncylcblxuICAgICAgICBAY29tcGlsZXIub25FcnJvciAoYXJncykgPT5cbiAgICAgICAgICAgIEBzYXNzQXV0b2NvbXBpbGVWaWV3LmVycm9uZW91c0NvbXBpbGF0aW9uKGFyZ3MpXG5cbiAgICAgICAgQGNvbXBpbGVyLm9uRmluaXNoZWQgKGFyZ3MpID0+XG4gICAgICAgICAgICBAc2Fzc0F1dG9jb21waWxlVmlldy5maW5pc2hlZChhcmdzKVxuICAgICAgICAgICAgQGlzUHJvY2Vzc2luZyA9IGZhbHNlXG4gICAgICAgICAgICBAY29tcGlsZXIuZGVzdHJveSgpXG4gICAgICAgICAgICBAY29tcGlsZXIgPSBudWxsXG5cbiAgICAgICAgQGNvbXBpbGVyLmNvbXBpbGUobW9kZSwgZmlsZW5hbWUsIG1pbmlmeU9uU2F2ZSlcblxuXG4gICAgcmVnaXN0ZXJUZXh0RWRpdG9yU2F2ZUNhbGxiYWNrOiAoKSAtPlxuICAgICAgICBAZWRpdG9yU3Vic2NyaXB0aW9ucy5hZGQgYXRvbS53b3Jrc3BhY2Uub2JzZXJ2ZVRleHRFZGl0b3JzIChlZGl0b3IpID0+XG4gICAgICAgICAgICBAc3Vic2NyaXB0aW9ucy5hZGQgZWRpdG9yLm9uRGlkU2F2ZSA9PlxuICAgICAgICAgICAgICAgIGlmICFAaXNQcm9jZXNzaW5nIGFuZCBlZGl0b3IgYW5kIGVkaXRvci5nZXRVUkkgYW5kIEBpc1Nhc3NGaWxlKGVkaXRvci5nZXRVUkkoKSlcbiAgICAgICAgICAgICAgICAgICBAY29tcGlsZShOb2RlU2Fzc0NvbXBpbGVyLk1PREVfRklMRSwgZWRpdG9yLmdldFVSSSgpLCB0cnVlKVxuXG5cbiAgICBpc1Nhc3NGaWxlOiAoZmlsZW5hbWUpIC0+XG4gICAgICAgIHJldHVybiBGaWxlLmhhc0ZpbGVFeHRlbnNpb24oZmlsZW5hbWUsIFsnLnNjc3MnLCAnLnNhc3MnXSlcblxuXG4gICAgcmVnaXN0ZXJDb25maWdPYnNlcnZlcjogKCkgLT5cbiAgICAgICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29uZmlnLm9ic2VydmUgU2Fzc0F1dG9jb21waWxlT3B0aW9ucy5PUFRJT05TX1BSRUZJWCArICdjb21waWxlT25TYXZlJywgKG5ld1ZhbHVlKSA9PlxuICAgICAgICAgICAgQHVwZGF0ZU1lbnVJdGVtcygpXG4gICAgICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbmZpZy5vYnNlcnZlIFNhc3NBdXRvY29tcGlsZU9wdGlvbnMuT1BUSU9OU19QUkVGSVggKyAnY29tcGlsZUZpbGVzJywgKG5ld1ZhbHVlKSA9PlxuICAgICAgICAgICAgQHVwZGF0ZU1lbnVJdGVtcygpXG4gICAgICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbmZpZy5vYnNlcnZlIFNhc3NBdXRvY29tcGlsZU9wdGlvbnMuT1BUSU9OU19QUkVGSVggKyAnY2hlY2tPdXRwdXRGaWxlQWxyZWFkeUV4aXN0cycsIChuZXdWYWx1ZSkgPT5cbiAgICAgICAgICAgIEB1cGRhdGVNZW51SXRlbXMoKVxuICAgICAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb25maWcub2JzZXJ2ZSBTYXNzQXV0b2NvbXBpbGVPcHRpb25zLk9QVElPTlNfUFJFRklYICsgJ2RpcmVjdGx5SnVtcFRvRXJyb3InLCAobmV3VmFsdWUpID0+XG4gICAgICAgICAgICBAdXBkYXRlTWVudUl0ZW1zKClcbiAgICAgICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29uZmlnLm9ic2VydmUgU2Fzc0F1dG9jb21waWxlT3B0aW9ucy5PUFRJT05TX1BSRUZJWCArICdzaG93Q29tcGlsZVNhc3NJdGVtSW5UcmVlVmlld0NvbnRleHRNZW51JywgKG5ld1ZhbHVlKSA9PlxuICAgICAgICAgICAgQHVwZGF0ZU1lbnVJdGVtcygpXG5cbiAgICAgICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29uZmlnLm9ic2VydmUgU2Fzc0F1dG9jb21waWxlT3B0aW9ucy5PUFRJT05TX1BSRUZJWCArICdjb21waWxlQ29tcHJlc3NlZCcsIChuZXdWYWx1ZSkgPT5cbiAgICAgICAgICAgIEB1cGRhdGVNZW51SXRlbXMoKVxuICAgICAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb25maWcub2JzZXJ2ZSBTYXNzQXV0b2NvbXBpbGVPcHRpb25zLk9QVElPTlNfUFJFRklYICsgJ2NvbXBpbGVDb21wYWN0JywgKG5ld1ZhbHVlKSA9PlxuICAgICAgICAgICAgQHVwZGF0ZU1lbnVJdGVtcygpXG4gICAgICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbmZpZy5vYnNlcnZlIFNhc3NBdXRvY29tcGlsZU9wdGlvbnMuT1BUSU9OU19QUkVGSVggKyAnY29tcGlsZU5lc3RlZCcsIChuZXdWYWx1ZSkgPT5cbiAgICAgICAgICAgIEB1cGRhdGVNZW51SXRlbXMoKVxuICAgICAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb25maWcub2JzZXJ2ZSBTYXNzQXV0b2NvbXBpbGVPcHRpb25zLk9QVElPTlNfUFJFRklYICsgJ2NvbXBpbGVFeHBhbmRlZCcsIChuZXdWYWx1ZSkgPT5cbiAgICAgICAgICAgIEB1cGRhdGVNZW51SXRlbXMoKVxuXG5cbiAgICByZWdpc3RlckNvbnRleHRNZW51SXRlbTogKCkgLT5cbiAgICAgICAgbWVudUl0ZW0gPSBAZ2V0Q29udGV4dE1lbnVJdGVtKClcbiAgICAgICAgbWVudUl0ZW0uc2hvdWxkRGlzcGxheSA9IChldnQpID0+XG4gICAgICAgICAgICBzaG93SXRlbU9wdGlvbiA9IFNhc3NBdXRvY29tcGlsZU9wdGlvbnMuZ2V0KCdzaG93Q29tcGlsZVNhc3NJdGVtSW5UcmVlVmlld0NvbnRleHRNZW51JylcbiAgICAgICAgICAgIGlmIHNob3dJdGVtT3B0aW9uXG4gICAgICAgICAgICAgICAgdGFyZ2V0ID0gZXZ0LnRhcmdldFxuICAgICAgICAgICAgICAgIGlmIHRhcmdldC5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpIGlzICdzcGFuJ1xuICAgICAgICAgICAgICAgICAgICB0YXJnZXQgPSB0YXJnZXQucGFyZW50Tm9kZVxuXG4gICAgICAgICAgICAgICAgaXNGaWxlSXRlbSA9IHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2NsYXNzJykuc3BsaXQoJyAnKS5pbmRleE9mKCdmaWxlJykgPj0gMFxuICAgICAgICAgICAgICAgIGlmIGlzRmlsZUl0ZW1cbiAgICAgICAgICAgICAgICAgICAgY2hpbGQgPSB0YXJnZXQuZmlyc3RFbGVtZW50Q2hpbGRcbiAgICAgICAgICAgICAgICAgICAgZmlsZW5hbWUgPSBjaGlsZC5nZXRBdHRyaWJ1dGUoJ2RhdGEtbmFtZScpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBAaXNTYXNzRmlsZShmaWxlbmFtZSlcblxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG5cblxuICAgIHVwZGF0ZU1lbnVJdGVtczogLT5cbiAgICAgICAgbWVudSA9IEBnZXRNYWluTWVudVN1Ym1lbnUoKS5zdWJtZW51XG4gICAgICAgIHJldHVybiB1bmxlc3MgbWVudVxuXG4gICAgICAgIG1lbnVbM10ubGFiZWwgPSAoaWYgU2Fzc0F1dG9jb21waWxlT3B0aW9ucy5nZXQoJ2NvbXBpbGVPblNhdmUnKSB0aGVuICfinJQnIGVsc2UgJ+KclScpICsgJyAgQ29tcGlsZSBvbiBTYXZlJ1xuICAgICAgICBtZW51WzRdLmxhYmVsID0gKGlmIFNhc3NBdXRvY29tcGlsZU9wdGlvbnMuZ2V0KCdjaGVja091dHB1dEZpbGVBbHJlYWR5RXhpc3RzJykgdGhlbiAn4pyUJyBlbHNlICfinJUnKSArICcgIENoZWNrIG91dHB1dCBmaWxlIGFscmVhZHkgZXhpc3RzJ1xuICAgICAgICBtZW51WzVdLmxhYmVsID0gKGlmIFNhc3NBdXRvY29tcGlsZU9wdGlvbnMuZ2V0KCdkaXJlY3RseUp1bXBUb0Vycm9yJykgdGhlbiAn4pyUJyBlbHNlICfinJUnKSArICcgIERpcmVjdGx5IGp1bXAgdG8gZXJyb3InXG4gICAgICAgIG1lbnVbNl0ubGFiZWwgPSAoaWYgU2Fzc0F1dG9jb21waWxlT3B0aW9ucy5nZXQoJ3Nob3dDb21waWxlU2Fzc0l0ZW1JblRyZWVWaWV3Q29udGV4dE1lbnUnKSB0aGVuICfinJQnIGVsc2UgJ+KclScpICsgJyAgU2hvdyBcXCdDb21waWxlIFNBU1NcXCcgaXRlbSBpbiB0cmVlIHZpZXcgY29udGV4dCBtZW51J1xuXG4gICAgICAgIGNvbXBpbGVGaWxlTWVudSA9IG1lbnVbOF0uc3VibWVudVxuICAgICAgICBpZiBjb21waWxlRmlsZU1lbnVcbiAgICAgICAgICAgIGNvbXBpbGVGaWxlTWVudVswXS5jaGVja2VkID0gU2Fzc0F1dG9jb21waWxlT3B0aW9ucy5nZXQoJ2NvbXBpbGVGaWxlcycpIGlzICdFdmVyeSBTQVNTIGZpbGUnXG4gICAgICAgICAgICBjb21waWxlRmlsZU1lbnVbMV0uY2hlY2tlZCA9IFNhc3NBdXRvY29tcGlsZU9wdGlvbnMuZ2V0KCdjb21waWxlRmlsZXMnKSBpcyAnT25seSB3aXRoIGZpcnN0LWxpbmUtY29tbWVudCdcblxuICAgICAgICBvdXRwdXRTdHlsZXNNZW51ID0gbWVudVs5XS5zdWJtZW51XG4gICAgICAgIGlmIG91dHB1dFN0eWxlc01lbnVcbiAgICAgICAgICAgIG91dHB1dFN0eWxlc01lbnVbMF0ubGFiZWwgPSAoaWYgU2Fzc0F1dG9jb21waWxlT3B0aW9ucy5nZXQoJ2NvbXBpbGVDb21wcmVzc2VkJykgdGhlbiAn4pyUJyBlbHNlICfinJUnKSArICcgIENvbXByZXNzZWQnXG4gICAgICAgICAgICBvdXRwdXRTdHlsZXNNZW51WzFdLmxhYmVsID0gKGlmIFNhc3NBdXRvY29tcGlsZU9wdGlvbnMuZ2V0KCdjb21waWxlQ29tcGFjdCcpIHRoZW4gJ+KclCcgZWxzZSAn4pyVJykgKyAnICBDb21wYWN0J1xuICAgICAgICAgICAgb3V0cHV0U3R5bGVzTWVudVsyXS5sYWJlbCA9IChpZiBTYXNzQXV0b2NvbXBpbGVPcHRpb25zLmdldCgnY29tcGlsZU5lc3RlZCcpIHRoZW4gJ+KclCcgZWxzZSAn4pyVJykgKyAnICBOZXN0ZWQnXG4gICAgICAgICAgICBvdXRwdXRTdHlsZXNNZW51WzNdLmxhYmVsID0gKGlmIFNhc3NBdXRvY29tcGlsZU9wdGlvbnMuZ2V0KCdjb21waWxlRXhwYW5kZWQnKSB0aGVuICfinJQnIGVsc2UgJ+KclScpICsgJyAgRXhwYW5kZWQnXG5cbiAgICAgICAgYXRvbS5tZW51LnVwZGF0ZSgpXG5cblxuICAgIGdldE1haW5NZW51U3VibWVudTogLT5cbiAgICAgICAgaWYgQG1haW5TdWJtZW51IGlzIG51bGxcbiAgICAgICAgICAgIGZvdW5kID0gZmFsc2VcbiAgICAgICAgICAgIGZvciBtZW51IGluIGF0b20ubWVudS50ZW1wbGF0ZVxuICAgICAgICAgICAgICAgIGlmIG1lbnUubGFiZWwgaXMgJ1BhY2thZ2VzJyB8fCBtZW51LmxhYmVsIGlzICcmUGFja2FnZXMnXG4gICAgICAgICAgICAgICAgICAgIGZvdW5kID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICBmb3Igc3VibWVudSBpbiBtZW51LnN1Ym1lbnVcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIHN1Ym1lbnUubGFiZWwgaXMgJ1NBU1MgQXV0b2NvbXBpbGUnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQG1haW5TdWJtZW51ID0gc3VibWVudVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgaWYgZm91bmRcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgcmV0dXJuIEBtYWluU3VibWVudVxuXG5cbiAgICBnZXRDb250ZXh0TWVudUl0ZW06IC0+XG4gICAgICAgIGlmIEBjb250ZXh0TWVudUl0ZW0gaXMgbnVsbFxuICAgICAgICAgICAgZm91bmQgPSBmYWxzZVxuICAgICAgICAgICAgZm9yIGl0ZW1zIGluIGF0b20uY29udGV4dE1lbnUuaXRlbVNldHNcbiAgICAgICAgICAgICAgICBpZiBpdGVtcy5zZWxlY3RvciBpcyAnLnRyZWUtdmlldydcbiAgICAgICAgICAgICAgICAgICAgZm9yIGl0ZW0gaW4gaXRlbXMuaXRlbXNcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIGl0ZW0uaWQgaXMgJ3Nhc3MtYXV0b2NvbXBpbGUtY29udGV4dC1tZW51LWNvbXBpbGUnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm91bmQgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQGNvbnRleHRNZW51SXRlbSA9IGl0ZW1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVha1xuXG4gICAgICAgICAgICAgICAgaWYgZm91bmRcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgcmV0dXJuIEBjb250ZXh0TWVudUl0ZW1cblxuXG4gICAgY2xvc2VQYW5lbDogKCkgLT5cbiAgICAgICAgQHNhc3NBdXRvY29tcGlsZVZpZXcuaGlkZVBhbmVsKClcbiJdfQ==
