(function() {
  var $, CompositeDisposable, ConflictedEditor, MergeConflictsView, MergeState, ResolverView, View, _, handleErr, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('space-pen'), $ = ref.$, View = ref.View;

  CompositeDisposable = require('atom').CompositeDisposable;

  _ = require('underscore-plus');

  MergeState = require('../merge-state').MergeState;

  ConflictedEditor = require('../conflicted-editor').ConflictedEditor;

  ResolverView = require('./resolver-view').ResolverView;

  handleErr = require('./error-view').handleErr;

  MergeConflictsView = (function(superClass) {
    extend(MergeConflictsView, superClass);

    function MergeConflictsView() {
      return MergeConflictsView.__super__.constructor.apply(this, arguments);
    }

    MergeConflictsView.instance = null;

    MergeConflictsView.contextApis = [];

    MergeConflictsView.content = function(state, pkg) {
      return this.div({
        "class": 'merge-conflicts tool-panel panel-bottom padded clearfix'
      }, (function(_this) {
        return function() {
          _this.div({
            "class": 'panel-heading'
          }, function() {
            _this.text('Conflicts');
            _this.span({
              "class": 'pull-right icon icon-fold',
              click: 'minimize'
            }, 'Hide');
            return _this.span({
              "class": 'pull-right icon icon-unfold',
              click: 'restore'
            }, 'Show');
          });
          return _this.div({
            outlet: 'body'
          }, function() {
            _this.div({
              "class": 'conflict-list'
            }, function() {
              return _this.ul({
                "class": 'block list-group',
                outlet: 'pathList'
              }, function() {
                var i, len, message, p, ref1, ref2, results;
                ref1 = state.conflicts;
                results = [];
                for (i = 0, len = ref1.length; i < len; i++) {
                  ref2 = ref1[i], p = ref2.path, message = ref2.message;
                  results.push(_this.li({
                    click: 'navigate',
                    "data-path": p,
                    "class": 'list-item navigate'
                  }, function() {
                    _this.span({
                      "class": 'inline-block icon icon-diff-modified status-modified path'
                    }, p);
                    return _this.div({
                      "class": 'pull-right'
                    }, function() {
                      _this.button({
                        click: 'resolveFile',
                        "class": 'btn btn-xs btn-success inline-block-tight stage-ready',
                        style: 'display: none'
                      }, state.context.resolveText);
                      _this.span({
                        "class": 'inline-block text-subtle'
                      }, message);
                      _this.progress({
                        "class": 'inline-block',
                        max: 100,
                        value: 0
                      });
                      return _this.span({
                        "class": 'inline-block icon icon-dash staged'
                      });
                    });
                  }));
                }
                return results;
              });
            });
            return _this.div({
              "class": 'footer block pull-right'
            }, function() {
              return _this.button({
                "class": 'btn btn-sm',
                click: 'quit'
              }, 'Quit');
            });
          });
        };
      })(this));
    };

    MergeConflictsView.prototype.initialize = function(state1, pkg1) {
      this.state = state1;
      this.pkg = pkg1;
      this.subs = new CompositeDisposable;
      this.subs.add(this.pkg.onDidResolveConflict((function(_this) {
        return function(event) {
          var found, i, len, li, listElement, p, progress, ref1;
          p = _this.state.relativize(event.file);
          found = false;
          ref1 = _this.pathList.children();
          for (i = 0, len = ref1.length; i < len; i++) {
            listElement = ref1[i];
            li = $(listElement);
            if (li.data('path') === p) {
              found = true;
              progress = li.find('progress')[0];
              progress.max = event.total;
              progress.value = event.resolved;
              if (event.total === event.resolved) {
                li.find('.stage-ready').show();
              }
            }
          }
          if (!found) {
            return console.error("Unrecognized conflict path: " + p);
          }
        };
      })(this)));
      this.subs.add(this.pkg.onDidResolveFile((function(_this) {
        return function() {
          return _this.refresh();
        };
      })(this)));
      return this.subs.add(atom.commands.add(this.element, {
        'merge-conflicts:entire-file-ours': this.sideResolver('ours'),
        'merge-conflicts:entire-file-theirs': this.sideResolver('theirs')
      }));
    };

    MergeConflictsView.prototype.navigate = function(event, element) {
      var fullPath, repoPath;
      repoPath = element.find(".path").text();
      fullPath = this.state.join(repoPath);
      return atom.workspace.open(fullPath);
    };

    MergeConflictsView.prototype.minimize = function() {
      this.addClass('minimized');
      return this.body.hide('fast');
    };

    MergeConflictsView.prototype.restore = function() {
      this.removeClass('minimized');
      return this.body.show('fast');
    };

    MergeConflictsView.prototype.quit = function() {
      this.pkg.didQuitConflictResolution();
      this.finish();
      return this.state.context.quit(this.state.isRebase);
    };

    MergeConflictsView.prototype.refresh = function() {
      return this.state.reread()["catch"](handleErr).then((function(_this) {
        return function() {
          var i, icon, item, len, p, ref1;
          ref1 = _this.pathList.find('li');
          for (i = 0, len = ref1.length; i < len; i++) {
            item = ref1[i];
            p = $(item).data('path');
            icon = $(item).find('.staged');
            icon.removeClass('icon-dash icon-check text-success');
            if (_.contains(_this.state.conflictPaths(), p)) {
              icon.addClass('icon-dash');
            } else {
              icon.addClass('icon-check text-success');
              _this.pathList.find("li[data-path='" + p + "'] .stage-ready").hide();
            }
          }
          if (!_this.state.isEmpty()) {
            return;
          }
          _this.pkg.didCompleteConflictResolution();
          _this.finish();
          return _this.state.context.complete(_this.state.isRebase);
        };
      })(this));
    };

    MergeConflictsView.prototype.finish = function() {
      this.subs.dispose();
      return this.hide('fast', (function(_this) {
        return function() {
          MergeConflictsView.instance = null;
          return _this.remove();
        };
      })(this));
    };

    MergeConflictsView.prototype.sideResolver = function(side) {
      return (function(_this) {
        return function(event) {
          var p;
          p = $(event.target).closest('li').data('path');
          return _this.state.context.checkoutSide(side, p).then(function() {
            var full;
            full = _this.state.join(p);
            _this.pkg.didResolveConflict({
              file: full,
              total: 1,
              resolved: 1
            });
            return atom.workspace.open(p);
          })["catch"](function(err) {
            return handleErr(err);
          });
        };
      })(this);
    };

    MergeConflictsView.prototype.resolveFile = function(event, element) {
      var e, filePath, i, len, ref1, repoPath;
      repoPath = element.closest('li').data('path');
      filePath = this.state.join(repoPath);
      ref1 = atom.workspace.getTextEditors();
      for (i = 0, len = ref1.length; i < len; i++) {
        e = ref1[i];
        if (e.getPath() === filePath) {
          e.save();
        }
      }
      return this.state.context.resolveFile(repoPath).then((function(_this) {
        return function() {
          return _this.pkg.didResolveFile({
            file: filePath
          });
        };
      })(this))["catch"](function(err) {
        return handleErr(err);
      });
    };

    MergeConflictsView.registerContextApi = function(contextApi) {
      return this.contextApis.push(contextApi);
    };

    MergeConflictsView.showForContext = function(context, pkg) {
      if (this.instance) {
        this.instance.finish();
      }
      return MergeState.read(context).then((function(_this) {
        return function(state) {
          if (state.isEmpty()) {
            return;
          }
          return _this.openForState(state, pkg);
        };
      })(this))["catch"](handleErr);
    };

    MergeConflictsView.hideForContext = function(context) {
      if (!this.instance) {
        return;
      }
      if (this.instance.state.context !== context) {
        return;
      }
      return this.instance.finish();
    };

    MergeConflictsView.detect = function(pkg) {
      if (this.instance != null) {
        return;
      }
      return Promise.all(this.contextApis.map((function(_this) {
        return function(contextApi) {
          return contextApi.getContext();
        };
      })(this))).then((function(_this) {
        return function(contexts) {
          return Promise.all(_.filter(contexts, Boolean).sort(function(context1, context2) {
            return context2.priority - context1.priority;
          }).map(function(context) {
            return MergeState.read(context);
          }));
        };
      })(this)).then((function(_this) {
        return function(states) {
          var state;
          state = states.find(function(state) {
            return !state.isEmpty();
          });
          if (state == null) {
            atom.notifications.addInfo("Nothing to Merge", {
              detail: "No conflicts here!",
              dismissable: true
            });
            return;
          }
          return _this.openForState(state, pkg);
        };
      })(this))["catch"](handleErr);
    };

    MergeConflictsView.openForState = function(state, pkg) {
      var view;
      view = new MergeConflictsView(state, pkg);
      this.instance = view;
      atom.workspace.addBottomPanel({
        item: view
      });
      return this.instance.subs.add(atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          return _this.markConflictsIn(state, editor, pkg);
        };
      })(this)));
    };

    MergeConflictsView.markConflictsIn = function(state, editor, pkg) {
      var e, fullPath, repoPath;
      if (state.isEmpty()) {
        return;
      }
      fullPath = editor.getPath();
      repoPath = state.relativize(fullPath);
      if (repoPath == null) {
        return;
      }
      if (!_.contains(state.conflictPaths(), repoPath)) {
        return;
      }
      e = new ConflictedEditor(state, pkg, editor);
      return e.mark();
    };

    return MergeConflictsView;

  })(View);

  module.exports = {
    MergeConflictsView: MergeConflictsView
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvdG95b2tpLy5hdG9tL3BhY2thZ2VzL21lcmdlLWNvbmZsaWN0cy9saWIvdmlldy9tZXJnZS1jb25mbGljdHMtdmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLCtHQUFBO0lBQUE7OztFQUFBLE1BQVksT0FBQSxDQUFRLFdBQVIsQ0FBWixFQUFDLFNBQUQsRUFBSTs7RUFDSCxzQkFBdUIsT0FBQSxDQUFRLE1BQVI7O0VBQ3hCLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVI7O0VBRUgsYUFBYyxPQUFBLENBQVEsZ0JBQVI7O0VBQ2QsbUJBQW9CLE9BQUEsQ0FBUSxzQkFBUjs7RUFFcEIsZUFBZ0IsT0FBQSxDQUFRLGlCQUFSOztFQUNoQixZQUFhLE9BQUEsQ0FBUSxjQUFSOztFQUVSOzs7Ozs7O0lBRUosa0JBQUMsQ0FBQSxRQUFELEdBQVc7O0lBQ1gsa0JBQUMsQ0FBQSxXQUFELEdBQWM7O0lBRWQsa0JBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQyxLQUFELEVBQVEsR0FBUjthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7UUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLHlEQUFQO09BQUwsRUFBdUUsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO1VBQ3JFLEtBQUMsQ0FBQSxHQUFELENBQUs7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLGVBQVA7V0FBTCxFQUE2QixTQUFBO1lBQzNCLEtBQUMsQ0FBQSxJQUFELENBQU0sV0FBTjtZQUNBLEtBQUMsQ0FBQSxJQUFELENBQU07Y0FBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLDJCQUFQO2NBQW9DLEtBQUEsRUFBTyxVQUEzQzthQUFOLEVBQTZELE1BQTdEO21CQUNBLEtBQUMsQ0FBQSxJQUFELENBQU07Y0FBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLDZCQUFQO2NBQXNDLEtBQUEsRUFBTyxTQUE3QzthQUFOLEVBQThELE1BQTlE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QUE7TUFDWCxRQUFBLEdBQVcsS0FBSyxDQUFDLFVBQU4sQ0FBaUIsUUFBakI7TUFDWCxJQUFjLGdCQUFkO0FBQUEsZUFBQTs7TUFFQSxJQUFBLENBQWMsQ0FBQyxDQUFDLFFBQUYsQ0FBVyxLQUFLLENBQUMsYUFBTixDQUFBLENBQVgsRUFBa0MsUUFBbEMsQ0FBZDtBQUFBLGVBQUE7O01BRUEsQ0FBQSxHQUFRLElBQUEsZ0JBQUEsQ0FBaUIsS0FBakIsRUFBd0IsR0FBeEIsRUFBNkIsTUFBN0I7YUFDUixDQUFDLENBQUMsSUFBRixDQUFBO0lBVmdCOzs7O0tBbEthOztFQStLakMsTUFBTSxDQUFDLE9BQVAsR0FDRTtJQUFBLGtCQUFBLEVBQW9CLGtCQUFwQjs7QUExTEYiLCJzb3VyY2VzQ29udGVudCI6WyJ7JCwgVmlld30gPSByZXF1aXJlICdzcGFjZS1wZW4nXG57Q29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xuXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcblxue01lcmdlU3RhdGV9ID0gcmVxdWlyZSAnLi4vbWVyZ2Utc3RhdGUnXG57Q29uZmxpY3RlZEVkaXRvcn0gPSByZXF1aXJlICcuLi9jb25mbGljdGVkLWVkaXRvcidcblxue1Jlc29sdmVyVmlld30gPSByZXF1aXJlICcuL3Jlc29sdmVyLXZpZXcnXG57aGFuZGxlRXJyfSA9IHJlcXVpcmUgJy4vZXJyb3ItdmlldydcblxuY2xhc3MgTWVyZ2VDb25mbGljdHNWaWV3IGV4dGVuZHMgVmlld1xuXG4gIEBpbnN0YW5jZTogbnVsbFxuICBAY29udGV4dEFwaXM6IFtdXG5cbiAgQGNvbnRlbnQ6IChzdGF0ZSwgcGtnKSAtPlxuICAgIEBkaXYgY2xhc3M6ICdtZXJnZS1jb25mbGljdHMgdG9vbC1wYW5lbCBwYW5lbC1ib3R0b20gcGFkZGVkIGNsZWFyZml4JywgPT5cbiAgICAgIEBkaXYgY2xhc3M6ICdwYW5lbC1oZWFkaW5nJywgPT5cbiAgICAgICAgQHRleHQgJ0NvbmZsaWN0cydcbiAgICAgICAgQHNwYW4gY2xhc3M6ICdwdWxsLXJpZ2h0IGljb24gaWNvbi1mb2xkJywgY2xpY2s6ICdtaW5pbWl6ZScsICdIaWRlJ1xuICAgICAgICBAc3BhbiBjbGFzczogJ3B1bGwtcmlnaHQgaWNvbiBpY29uLXVuZm9sZCcsIGNsaWNrOiAncmVzdG9yZScsICdTaG93J1xuICAgICAgQGRpdiBvdXRsZXQ6ICdib2R5JywgPT5cbiAgICAgICAgQGRpdiBjbGFzczogJ2NvbmZsaWN0LWxpc3QnLCA9PlxuICAgICAgICAgIEB1bCBjbGFzczogJ2Jsb2NrIGxpc3QtZ3JvdXAnLCBvdXRsZXQ6ICdwYXRoTGlzdCcsID0+XG4gICAgICAgICAgICBmb3Ige3BhdGg6IHAsIG1lc3NhZ2V9IGluIHN0YXRlLmNvbmZsaWN0c1xuICAgICAgICAgICAgICBAbGkgY2xpY2s6ICduYXZpZ2F0ZScsIFwiZGF0YS1wYXRoXCI6IHAsIGNsYXNzOiAnbGlzdC1pdGVtIG5hdmlnYXRlJywgPT5cbiAgICAgICAgICAgICAgICBAc3BhbiBjbGFzczogJ2lubGluZS1ibG9jayBpY29uIGljb24tZGlmZi1tb2RpZmllZCBzdGF0dXMtbW9kaWZpZWQgcGF0aCcsIHBcbiAgICAgICAgICAgICAgICBAZGl2IGNsYXNzOiAncHVsbC1yaWdodCcsID0+XG4gICAgICAgICAgICAgICAgICBAYnV0dG9uIGNsaWNrOiAncmVzb2x2ZUZpbGUnLCBjbGFzczogJ2J0biBidG4teHMgYnRuLXN1Y2Nlc3MgaW5saW5lLWJsb2NrLXRpZ2h0IHN0YWdlLXJlYWR5Jywgc3R5bGU6ICdkaXNwbGF5OiBub25lJywgc3RhdGUuY29udGV4dC5yZXNvbHZlVGV4dFxuICAgICAgICAgICAgICAgICAgQHNwYW4gY2xhc3M6ICdpbmxpbmUtYmxvY2sgdGV4dC1zdWJ0bGUnLCBtZXNzYWdlXG4gICAgICAgICAgICAgICAgICBAcHJvZ3Jlc3MgY2xhc3M6ICdpbmxpbmUtYmxvY2snLCBtYXg6IDEwMCwgdmFsdWU6IDBcbiAgICAgICAgICAgICAgICAgIEBzcGFuIGNsYXNzOiAnaW5saW5lLWJsb2NrIGljb24gaWNvbi1kYXNoIHN0YWdlZCdcbiAgICAgICAgQGRpdiBjbGFzczogJ2Zvb3RlciBibG9jayBwdWxsLXJpZ2h0JywgPT5cbiAgICAgICAgICBAYnV0dG9uIGNsYXNzOiAnYnRuIGJ0bi1zbScsIGNsaWNrOiAncXVpdCcsICdRdWl0J1xuXG4gIGluaXRpYWxpemU6IChAc3RhdGUsIEBwa2cpIC0+XG4gICAgQHN1YnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuXG4gICAgQHN1YnMuYWRkIEBwa2cub25EaWRSZXNvbHZlQ29uZmxpY3QgKGV2ZW50KSA9PlxuICAgICAgcCA9IEBzdGF0ZS5yZWxhdGl2aXplIGV2ZW50LmZpbGVcbiAgICAgIGZvdW5kID0gZmFsc2VcbiAgICAgIGZvciBsaXN0RWxlbWVudCBpbiBAcGF0aExpc3QuY2hpbGRyZW4oKVxuICAgICAgICBsaSA9ICQobGlzdEVsZW1lbnQpXG4gICAgICAgIGlmIGxpLmRhdGEoJ3BhdGgnKSBpcyBwXG4gICAgICAgICAgZm91bmQgPSB0cnVlXG5cbiAgICAgICAgICBwcm9ncmVzcyA9IGxpLmZpbmQoJ3Byb2dyZXNzJylbMF1cbiAgICAgICAgICBwcm9ncmVzcy5tYXggPSBldmVudC50b3RhbFxuICAgICAgICAgIHByb2dyZXNzLnZhbHVlID0gZXZlbnQucmVzb2x2ZWRcblxuICAgICAgICAgIGxpLmZpbmQoJy5zdGFnZS1yZWFkeScpLnNob3coKSBpZiBldmVudC50b3RhbCBpcyBldmVudC5yZXNvbHZlZFxuXG4gICAgICB1bmxlc3MgZm91bmRcbiAgICAgICAgY29uc29sZS5lcnJvciBcIlVucmVjb2duaXplZCBjb25mbGljdCBwYXRoOiAje3B9XCJcblxuICAgIEBzdWJzLmFkZCBAcGtnLm9uRGlkUmVzb2x2ZUZpbGUgPT4gQHJlZnJlc2goKVxuXG4gICAgQHN1YnMuYWRkIGF0b20uY29tbWFuZHMuYWRkIEBlbGVtZW50LFxuICAgICAgJ21lcmdlLWNvbmZsaWN0czplbnRpcmUtZmlsZS1vdXJzJzogQHNpZGVSZXNvbHZlcignb3VycycpLFxuICAgICAgJ21lcmdlLWNvbmZsaWN0czplbnRpcmUtZmlsZS10aGVpcnMnOiBAc2lkZVJlc29sdmVyKCd0aGVpcnMnKVxuXG4gIG5hdmlnYXRlOiAoZXZlbnQsIGVsZW1lbnQpIC0+XG4gICAgcmVwb1BhdGggPSBlbGVtZW50LmZpbmQoXCIucGF0aFwiKS50ZXh0KClcbiAgICBmdWxsUGF0aCA9IEBzdGF0ZS5qb2luIHJlcG9QYXRoXG4gICAgYXRvbS53b3Jrc3BhY2Uub3BlbihmdWxsUGF0aClcblxuICBtaW5pbWl6ZTogLT5cbiAgICBAYWRkQ2xhc3MgJ21pbmltaXplZCdcbiAgICBAYm9keS5oaWRlICdmYXN0J1xuXG4gIHJlc3RvcmU6IC0+XG4gICAgQHJlbW92ZUNsYXNzICdtaW5pbWl6ZWQnXG4gICAgQGJvZHkuc2hvdyAnZmFzdCdcblxuICBxdWl0OiAtPlxuICAgIEBwa2cuZGlkUXVpdENvbmZsaWN0UmVzb2x1dGlvbigpXG4gICAgQGZpbmlzaCgpXG4gICAgQHN0YXRlLmNvbnRleHQucXVpdChAc3RhdGUuaXNSZWJhc2UpXG5cbiAgcmVmcmVzaDogLT5cbiAgICBAc3RhdGUucmVyZWFkKCkuY2F0Y2goaGFuZGxlRXJyKS50aGVuID0+XG4gICAgICAjIEFueSBmaWxlcyB0aGF0IHdlcmUgcHJlc2VudCwgYnV0IGFyZW4ndCB0aGVyZSBhbnkgbW9yZSwgaGF2ZSBiZWVuIHJlc29sdmVkLlxuICAgICAgZm9yIGl0ZW0gaW4gQHBhdGhMaXN0LmZpbmQoJ2xpJylcbiAgICAgICAgcCA9ICQoaXRlbSkuZGF0YSgncGF0aCcpXG4gICAgICAgIGljb24gPSAkKGl0ZW0pLmZpbmQoJy5zdGFnZWQnKVxuICAgICAgICBpY29uLnJlbW92ZUNsYXNzICdpY29uLWRhc2ggaWNvbi1jaGVjayB0ZXh0LXN1Y2Nlc3MnXG4gICAgICAgIGlmIF8uY29udGFpbnMgQHN0YXRlLmNvbmZsaWN0UGF0aHMoKSwgcFxuICAgICAgICAgIGljb24uYWRkQ2xhc3MgJ2ljb24tZGFzaCdcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGljb24uYWRkQ2xhc3MgJ2ljb24tY2hlY2sgdGV4dC1zdWNjZXNzJ1xuICAgICAgICAgIEBwYXRoTGlzdC5maW5kKFwibGlbZGF0YS1wYXRoPScje3B9J10gLnN0YWdlLXJlYWR5XCIpLmhpZGUoKVxuXG4gICAgICByZXR1cm4gdW5sZXNzIEBzdGF0ZS5pc0VtcHR5KClcbiAgICAgIEBwa2cuZGlkQ29tcGxldGVDb25mbGljdFJlc29sdXRpb24oKVxuICAgICAgQGZpbmlzaCgpXG4gICAgICBAc3RhdGUuY29udGV4dC5jb21wbGV0ZShAc3RhdGUuaXNSZWJhc2UpXG5cbiAgZmluaXNoOiAtPlxuICAgIEBzdWJzLmRpc3Bvc2UoKVxuICAgIEBoaWRlICdmYXN0JywgPT5cbiAgICAgIE1lcmdlQ29uZmxpY3RzVmlldy5pbnN0YW5jZSA9IG51bGxcbiAgICAgIEByZW1vdmUoKVxuXG4gIHNpZGVSZXNvbHZlcjogKHNpZGUpIC0+XG4gICAgKGV2ZW50KSA9PlxuICAgICAgcCA9ICQoZXZlbnQudGFyZ2V0KS5jbG9zZXN0KCdsaScpLmRhdGEoJ3BhdGgnKVxuICAgICAgQHN0YXRlLmNvbnRleHQuY2hlY2tvdXRTaWRlKHNpZGUsIHApXG4gICAgICAudGhlbiA9PlxuICAgICAgICBmdWxsID0gQHN0YXRlLmpvaW4gcFxuICAgICAgICBAcGtnLmRpZFJlc29sdmVDb25mbGljdCBmaWxlOiBmdWxsLCB0b3RhbDogMSwgcmVzb2x2ZWQ6IDFcbiAgICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbiBwXG4gICAgICAuY2F0Y2ggKGVycikgLT5cbiAgICAgICAgaGFuZGxlRXJyKGVycilcblxuICByZXNvbHZlRmlsZTogKGV2ZW50LCBlbGVtZW50KSAtPlxuICAgIHJlcG9QYXRoID0gZWxlbWVudC5jbG9zZXN0KCdsaScpLmRhdGEoJ3BhdGgnKVxuICAgIGZpbGVQYXRoID0gQHN0YXRlLmpvaW4gcmVwb1BhdGhcblxuICAgIGZvciBlIGluIGF0b20ud29ya3NwYWNlLmdldFRleHRFZGl0b3JzKClcbiAgICAgIGUuc2F2ZSgpIGlmIGUuZ2V0UGF0aCgpIGlzIGZpbGVQYXRoXG5cbiAgICBAc3RhdGUuY29udGV4dC5yZXNvbHZlRmlsZShyZXBvUGF0aClcbiAgICAudGhlbiA9PlxuICAgICAgQHBrZy5kaWRSZXNvbHZlRmlsZSBmaWxlOiBmaWxlUGF0aFxuICAgIC5jYXRjaCAoZXJyKSAtPlxuICAgICAgaGFuZGxlRXJyKGVycilcblxuICBAcmVnaXN0ZXJDb250ZXh0QXBpOiAoY29udGV4dEFwaSkgLT5cbiAgICBAY29udGV4dEFwaXMucHVzaChjb250ZXh0QXBpKVxuXG4gIEBzaG93Rm9yQ29udGV4dDogKGNvbnRleHQsIHBrZykgLT5cbiAgICBpZiBAaW5zdGFuY2VcbiAgICAgIEBpbnN0YW5jZS5maW5pc2goKVxuICAgIE1lcmdlU3RhdGUucmVhZChjb250ZXh0KS50aGVuIChzdGF0ZSkgPT5cbiAgICAgIHJldHVybiBpZiBzdGF0ZS5pc0VtcHR5KClcbiAgICAgIEBvcGVuRm9yU3RhdGUoc3RhdGUsIHBrZylcbiAgICAuY2F0Y2ggaGFuZGxlRXJyXG5cbiAgQGhpZGVGb3JDb250ZXh0OiAoY29udGV4dCkgLT5cbiAgICByZXR1cm4gdW5sZXNzIEBpbnN0YW5jZVxuICAgIHJldHVybiB1bmxlc3MgQGluc3RhbmNlLnN0YXRlLmNvbnRleHQgPT0gY29udGV4dFxuICAgIEBpbnN0YW5jZS5maW5pc2goKVxuXG4gIEBkZXRlY3Q6IChwa2cpIC0+XG4gICAgcmV0dXJuIGlmIEBpbnN0YW5jZT9cblxuICAgIFByb21pc2UuYWxsKEBjb250ZXh0QXBpcy5tYXAgKGNvbnRleHRBcGkpID0+IGNvbnRleHRBcGkuZ2V0Q29udGV4dCgpKVxuICAgIC50aGVuIChjb250ZXh0cykgPT5cbiAgICAgICMgZmlsdGVyIG91dCBudWxscyBhbmQgdGFrZSB0aGUgaGlnaGVzdCBwcmlvcml0eSBjb250ZXh0LlxuICAgICAgUHJvbWlzZS5hbGwoXG4gICAgICAgIF8uZmlsdGVyKGNvbnRleHRzLCBCb29sZWFuKVxuICAgICAgICAuc29ydCAoY29udGV4dDEsIGNvbnRleHQyKSA9PiBjb250ZXh0Mi5wcmlvcml0eSAtIGNvbnRleHQxLnByaW9yaXR5XG4gICAgICAgIC5tYXAgKGNvbnRleHQpID0+IE1lcmdlU3RhdGUucmVhZCBjb250ZXh0XG4gICAgICApXG4gICAgLnRoZW4gKHN0YXRlcykgPT5cbiAgICAgIHN0YXRlID0gc3RhdGVzLmZpbmQgKHN0YXRlKSAtPiBub3Qgc3RhdGUuaXNFbXB0eSgpXG4gICAgICB1bmxlc3Mgc3RhdGU/XG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvIFwiTm90aGluZyB0byBNZXJnZVwiLFxuICAgICAgICAgIGRldGFpbDogXCJObyBjb25mbGljdHMgaGVyZSFcIixcbiAgICAgICAgICBkaXNtaXNzYWJsZTogdHJ1ZVxuICAgICAgICByZXR1cm5cbiAgICAgIEBvcGVuRm9yU3RhdGUoc3RhdGUsIHBrZylcbiAgICAuY2F0Y2ggaGFuZGxlRXJyXG5cbiAgQG9wZW5Gb3JTdGF0ZTogKHN0YXRlLCBwa2cpIC0+XG4gICAgdmlldyA9IG5ldyBNZXJnZUNvbmZsaWN0c1ZpZXcoc3RhdGUsIHBrZylcbiAgICBAaW5zdGFuY2UgPSB2aWV3XG4gICAgYXRvbS53b3Jrc3BhY2UuYWRkQm90dG9tUGFuZWwgaXRlbTogdmlld1xuXG4gICAgQGluc3RhbmNlLnN1YnMuYWRkIGF0b20ud29ya3NwYWNlLm9ic2VydmVUZXh0RWRpdG9ycyAoZWRpdG9yKSA9PlxuICAgICAgQG1hcmtDb25mbGljdHNJbiBzdGF0ZSwgZWRpdG9yLCBwa2dcblxuICBAbWFya0NvbmZsaWN0c0luOiAoc3RhdGUsIGVkaXRvciwgcGtnKSAtPlxuICAgIHJldHVybiBpZiBzdGF0ZS5pc0VtcHR5KClcblxuICAgIGZ1bGxQYXRoID0gZWRpdG9yLmdldFBhdGgoKVxuICAgIHJlcG9QYXRoID0gc3RhdGUucmVsYXRpdml6ZSBmdWxsUGF0aFxuICAgIHJldHVybiB1bmxlc3MgcmVwb1BhdGg/XG5cbiAgICByZXR1cm4gdW5sZXNzIF8uY29udGFpbnMgc3RhdGUuY29uZmxpY3RQYXRocygpLCByZXBvUGF0aFxuXG4gICAgZSA9IG5ldyBDb25mbGljdGVkRWRpdG9yKHN0YXRlLCBwa2csIGVkaXRvcilcbiAgICBlLm1hcmsoKVxuXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgTWVyZ2VDb25mbGljdHNWaWV3OiBNZXJnZUNvbmZsaWN0c1ZpZXdcbiJdfQ==
