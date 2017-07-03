(function() {
  var $, CompositeDisposable, Conflict, ConflictedEditor, Emitter, NavigationView, ResolverView, SideView, _, ref;

  $ = require('space-pen').$;

  _ = require('underscore-plus');

  ref = require('atom'), Emitter = ref.Emitter, CompositeDisposable = ref.CompositeDisposable;

  Conflict = require('./conflict').Conflict;

  SideView = require('./view/side-view').SideView;

  NavigationView = require('./view/navigation-view').NavigationView;

  ResolverView = require('./view/resolver-view').ResolverView;

  ConflictedEditor = (function() {
    function ConflictedEditor(state, pkg, editor) {
      this.state = state;
      this.pkg = pkg;
      this.editor = editor;
      this.subs = new CompositeDisposable;
      this.coveringViews = [];
      this.conflicts = [];
    }

    ConflictedEditor.prototype.mark = function() {
      var c, cv, i, j, len, len1, ref1, ref2;
      this.conflicts = Conflict.all(this.state, this.editor);
      this.coveringViews = [];
      ref1 = this.conflicts;
      for (i = 0, len = ref1.length; i < len; i++) {
        c = ref1[i];
        this.coveringViews.push(new SideView(c.ours, this.editor));
        if (c.base != null) {
          this.coveringViews.push(new SideView(c.base, this.editor));
        }
        this.coveringViews.push(new NavigationView(c.navigator, this.editor));
        this.coveringViews.push(new SideView(c.theirs, this.editor));
        this.subs.add(c.onDidResolveConflict((function(_this) {
          return function() {
            var resolvedCount, unresolved, v;
            unresolved = (function() {
              var j, len1, ref2, results;
              ref2 = this.coveringViews;
              results = [];
              for (j = 0, len1 = ref2.length; j < len1; j++) {
                v = ref2[j];
                if (!v.conflict().isResolved()) {
                  results.push(v);
                }
              }
              return results;
            }).call(_this);
            resolvedCount = _this.conflicts.length - Math.floor(unresolved.length / 3);
            return _this.pkg.didResolveConflict({
              file: _this.editor.getPath(),
              total: _this.conflicts.length,
              resolved: resolvedCount,
              source: _this
            });
          };
        })(this)));
      }
      if (this.conflicts.length > 0) {
        atom.views.getView(this.editor).classList.add('conflicted');
        ref2 = this.coveringViews;
        for (j = 0, len1 = ref2.length; j < len1; j++) {
          cv = ref2[j];
          cv.decorate();
        }
        this.installEvents();
        return this.focusConflict(this.conflicts[0]);
      } else {
        this.pkg.didResolveConflict({
          file: this.editor.getPath(),
          total: 1,
          resolved: 1,
          source: this
        });
        return this.conflictsResolved();
      }
    };

    ConflictedEditor.prototype.installEvents = function() {
      this.subs.add(this.editor.onDidStopChanging((function(_this) {
        return function() {
          return _this.detectDirty();
        };
      })(this)));
      this.subs.add(this.editor.onDidDestroy((function(_this) {
        return function() {
          return _this.cleanup();
        };
      })(this)));
      this.subs.add(atom.commands.add('atom-text-editor', {
        'merge-conflicts:accept-current': (function(_this) {
          return function() {
            return _this.acceptCurrent();
          };
        })(this),
        'merge-conflicts:accept-ours': (function(_this) {
          return function() {
            return _this.acceptOurs();
          };
        })(this),
        'merge-conflicts:accept-theirs': (function(_this) {
          return function() {
            return _this.acceptTheirs();
          };
        })(this),
        'merge-conflicts:ours-then-theirs': (function(_this) {
          return function() {
            return _this.acceptOursThenTheirs();
          };
        })(this),
        'merge-conflicts:theirs-then-ours': (function(_this) {
          return function() {
            return _this.acceptTheirsThenOurs();
          };
        })(this),
        'merge-conflicts:next-unresolved': (function(_this) {
          return function() {
            return _this.nextUnresolved();
          };
        })(this),
        'merge-conflicts:previous-unresolved': (function(_this) {
          return function() {
            return _this.previousUnresolved();
          };
        })(this),
        'merge-conflicts:revert-current': (function(_this) {
          return function() {
            return _this.revertCurrent();
          };
        })(this)
      }));
      this.subs.add(this.pkg.onDidResolveConflict((function(_this) {
        return function(arg) {
          var file, resolved, total;
          total = arg.total, resolved = arg.resolved, file = arg.file;
          if (file === _this.editor.getPath() && total === resolved) {
            return _this.conflictsResolved();
          }
        };
      })(this)));
      this.subs.add(this.pkg.onDidCompleteConflictResolution((function(_this) {
        return function() {
          return _this.cleanup();
        };
      })(this)));
      return this.subs.add(this.pkg.onDidQuitConflictResolution((function(_this) {
        return function() {
          return _this.cleanup();
        };
      })(this)));
    };

    ConflictedEditor.prototype.cleanup = function() {
      var c, i, j, k, len, len1, len2, m, ref1, ref2, ref3, v;
      if (this.editor != null) {
        atom.views.getView(this.editor).classList.remove('conflicted');
      }
      ref1 = this.conflicts;
      for (i = 0, len = ref1.length; i < len; i++) {
        c = ref1[i];
        ref2 = c.markers();
        for (j = 0, len1 = ref2.length; j < len1; j++) {
          m = ref2[j];
          m.destroy();
        }
      }
      ref3 = this.coveringViews;
      for (k = 0, len2 = ref3.length; k < len2; k++) {
        v = ref3[k];
        v.remove();
      }
      return this.subs.dispose();
    };

    ConflictedEditor.prototype.conflictsResolved = function() {
      return atom.workspace.addTopPanel({
        item: new ResolverView(this.editor, this.state, this.pkg)
      });
    };

    ConflictedEditor.prototype.detectDirty = function() {
      var c, i, j, k, len, len1, len2, potentials, ref1, ref2, ref3, results, v;
      potentials = [];
      ref1 = this.editor.getCursors();
      for (i = 0, len = ref1.length; i < len; i++) {
        c = ref1[i];
        ref2 = this.coveringViews;
        for (j = 0, len1 = ref2.length; j < len1; j++) {
          v = ref2[j];
          if (v.includesCursor(c)) {
            potentials.push(v);
          }
        }
      }
      ref3 = _.uniq(potentials);
      results = [];
      for (k = 0, len2 = ref3.length; k < len2; k++) {
        v = ref3[k];
        results.push(v.detectDirty());
      }
      return results;
    };

    ConflictedEditor.prototype.acceptCurrent = function() {
      var duplicates, i, len, seen, side, sides;
      if (this.editor !== atom.workspace.getActiveTextEditor()) {
        return;
      }
      sides = this.active();
      duplicates = [];
      seen = {};
      for (i = 0, len = sides.length; i < len; i++) {
        side = sides[i];
        if (side.conflict in seen) {
          duplicates.push(side);
          duplicates.push(seen[side.conflict]);
        }
        seen[side.conflict] = side;
      }
      sides = _.difference(sides, duplicates);
      return this.editor.transact(function() {
        var j, len1, results;
        results = [];
        for (j = 0, len1 = sides.length; j < len1; j++) {
          side = sides[j];
          results.push(side.resolve());
        }
        return results;
      });
    };

    ConflictedEditor.prototype.acceptOurs = function() {
      if (this.editor !== atom.workspace.getActiveTextEditor()) {
        return;
      }
      return this.editor.transact((function(_this) {
        return function() {
          var i, len, ref1, results, side;
          ref1 = _this.active();
          results = [];
          for (i = 0, len = ref1.length; i < len; i++) {
            side = ref1[i];
            results.push(side.conflict.ours.resolve());
          }
          return results;
        };
      })(this));
    };

    ConflictedEditor.prototype.acceptTheirs = function() {
      if (this.editor !== atom.workspace.getActiveTextEditor()) {
        return;
      }
      return this.editor.transact((function(_this) {
        return function() {
          var i, len, ref1, results, side;
          ref1 = _this.active();
          results = [];
          for (i = 0, len = ref1.length; i < len; i++) {
            side = ref1[i];
            results.push(side.conflict.theirs.resolve());
          }
          return results;
        };
      })(this));
    };

    ConflictedEditor.prototype.acceptOursThenTheirs = function() {
      if (this.editor !== atom.workspace.getActiveTextEditor()) {
        return;
      }
      return this.editor.transact((function(_this) {
        return function() {
          var i, len, ref1, results, side;
          ref1 = _this.active();
          results = [];
          for (i = 0, len = ref1.length; i < len; i++) {
            side = ref1[i];
            results.push(_this.combineSides(side.conflict.ours, side.conflict.theirs));
          }
          return results;
        };
      })(this));
    };

    ConflictedEditor.prototype.acceptTheirsThenOurs = function() {
      if (this.editor !== atom.workspace.getActiveTextEditor()) {
        return;
      }
      return this.editor.transact((function(_this) {
        return function() {
          var i, len, ref1, results, side;
          ref1 = _this.active();
          results = [];
          for (i = 0, len = ref1.length; i < len; i++) {
            side = ref1[i];
            results.push(_this.combineSides(side.conflict.theirs, side.conflict.ours));
          }
          return results;
        };
      })(this));
    };

    ConflictedEditor.prototype.nextUnresolved = function() {
      var c, final, firstAfter, i, lastCursor, len, n, orderedCursors, p, pos, ref1, target;
      if (this.editor !== atom.workspace.getActiveTextEditor()) {
        return;
      }
      final = _.last(this.active());
      if (final != null) {
        n = final.conflict.navigator.nextUnresolved();
        if (n != null) {
          return this.focusConflict(n);
        }
      } else {
        orderedCursors = _.sortBy(this.editor.getCursors(), function(c) {
          return c.getBufferPosition().row;
        });
        lastCursor = _.last(orderedCursors);
        if (lastCursor == null) {
          return;
        }
        pos = lastCursor.getBufferPosition();
        firstAfter = null;
        ref1 = this.conflicts;
        for (i = 0, len = ref1.length; i < len; i++) {
          c = ref1[i];
          p = c.ours.marker.getBufferRange().start;
          if (p.isGreaterThanOrEqual(pos) && (firstAfter == null)) {
            firstAfter = c;
          }
        }
        if (firstAfter == null) {
          return;
        }
        if (firstAfter.isResolved()) {
          target = firstAfter.navigator.nextUnresolved();
        } else {
          target = firstAfter;
        }
        if (target == null) {
          return;
        }
        return this.focusConflict(target);
      }
    };

    ConflictedEditor.prototype.previousUnresolved = function() {
      var c, firstCursor, i, initial, lastBefore, len, orderedCursors, p, pos, ref1, target;
      if (this.editor !== atom.workspace.getActiveTextEditor()) {
        return;
      }
      initial = _.first(this.active());
      if (initial != null) {
        p = initial.conflict.navigator.previousUnresolved();
        if (p != null) {
          return this.focusConflict(p);
        }
      } else {
        orderedCursors = _.sortBy(this.editor.getCursors(), function(c) {
          return c.getBufferPosition().row;
        });
        firstCursor = _.first(orderedCursors);
        if (firstCursor == null) {
          return;
        }
        pos = firstCursor.getBufferPosition();
        lastBefore = null;
        ref1 = this.conflicts;
        for (i = 0, len = ref1.length; i < len; i++) {
          c = ref1[i];
          p = c.ours.marker.getBufferRange().start;
          if (p.isLessThanOrEqual(pos)) {
            lastBefore = c;
          }
        }
        if (lastBefore == null) {
          return;
        }
        if (lastBefore.isResolved()) {
          target = lastBefore.navigator.previousUnresolved();
        } else {
          target = lastBefore;
        }
        if (target == null) {
          return;
        }
        return this.focusConflict(target);
      }
    };

    ConflictedEditor.prototype.revertCurrent = function() {
      var i, len, ref1, results, side, view;
      if (this.editor !== atom.workspace.getActiveTextEditor()) {
        return;
      }
      ref1 = this.active();
      results = [];
      for (i = 0, len = ref1.length; i < len; i++) {
        side = ref1[i];
        results.push((function() {
          var j, len1, ref2, results1;
          ref2 = this.coveringViews;
          results1 = [];
          for (j = 0, len1 = ref2.length; j < len1; j++) {
            view = ref2[j];
            if (view.conflict() === side.conflict) {
              if (view.isDirty()) {
                results1.push(view.revert());
              } else {
                results1.push(void 0);
              }
            }
          }
          return results1;
        }).call(this));
      }
      return results;
    };

    ConflictedEditor.prototype.active = function() {
      var c, i, j, len, len1, matching, p, positions, ref1;
      positions = (function() {
        var i, len, ref1, results;
        ref1 = this.editor.getCursors();
        results = [];
        for (i = 0, len = ref1.length; i < len; i++) {
          c = ref1[i];
          results.push(c.getBufferPosition());
        }
        return results;
      }).call(this);
      matching = [];
      ref1 = this.conflicts;
      for (i = 0, len = ref1.length; i < len; i++) {
        c = ref1[i];
        for (j = 0, len1 = positions.length; j < len1; j++) {
          p = positions[j];
          if (c.ours.marker.getBufferRange().containsPoint(p)) {
            matching.push(c.ours);
          }
          if (c.theirs.marker.getBufferRange().containsPoint(p)) {
            matching.push(c.theirs);
          }
        }
      }
      return matching;
    };

    ConflictedEditor.prototype.combineSides = function(first, second) {
      var e, insertPoint, text;
      text = this.editor.getTextInBufferRange(second.marker.getBufferRange());
      e = first.marker.getBufferRange().end;
      insertPoint = this.editor.setTextInBufferRange([e, e], text).end;
      first.marker.setHeadBufferPosition(insertPoint);
      first.followingMarker.setTailBufferPosition(insertPoint);
      return first.resolve();
    };

    ConflictedEditor.prototype.focusConflict = function(conflict) {
      var st;
      st = conflict.ours.marker.getBufferRange().start;
      this.editor.scrollToBufferPosition(st, {
        center: true
      });
      return this.editor.setCursorBufferPosition(st, {
        autoscroll: false
      });
    };

    return ConflictedEditor;

  })();

  module.exports = {
    ConflictedEditor: ConflictedEditor
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvdG95b2tpLy5hdG9tL3BhY2thZ2VzL21lcmdlLWNvbmZsaWN0cy9saWIvY29uZmxpY3RlZC1lZGl0b3IuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQyxJQUFLLE9BQUEsQ0FBUSxXQUFSOztFQUNOLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVI7O0VBQ0osTUFBaUMsT0FBQSxDQUFRLE1BQVIsQ0FBakMsRUFBQyxxQkFBRCxFQUFVOztFQUVULFdBQVksT0FBQSxDQUFRLFlBQVI7O0VBRVosV0FBWSxPQUFBLENBQVEsa0JBQVI7O0VBQ1osaUJBQWtCLE9BQUEsQ0FBUSx3QkFBUjs7RUFDbEIsZUFBZ0IsT0FBQSxDQUFRLHNCQUFSOztFQUlYO0lBU1MsMEJBQUMsS0FBRCxFQUFTLEdBQVQsRUFBZSxNQUFmO01BQUMsSUFBQyxDQUFBLFFBQUQ7TUFBUSxJQUFDLENBQUEsTUFBRDtNQUFNLElBQUMsQ0FBQSxTQUFEO01BQzFCLElBQUMsQ0FBQSxJQUFELEdBQVEsSUFBSTtNQUNaLElBQUMsQ0FBQSxhQUFELEdBQWlCO01BQ2pCLElBQUMsQ0FBQSxTQUFELEdBQWE7SUFIRjs7K0JBWWIsSUFBQSxHQUFNLFNBQUE7QUFDSixVQUFBO01BQUEsSUFBQyxDQUFBLFNBQUQsR0FBYSxRQUFRLENBQUMsR0FBVCxDQUFhLElBQUMsQ0FBQSxLQUFkLEVBQXFCLElBQUMsQ0FBQSxNQUF0QjtNQUViLElBQUMsQ0FBQSxhQUFELEdBQWlCO0FBQ2pCO0FBQUEsV0FBQSxzQ0FBQTs7UUFDRSxJQUFDLENBQUEsYUFBYSxDQUFDLElBQWYsQ0FBd0IsSUFBQSxRQUFBLENBQVMsQ0FBQyxDQUFDLElBQVgsRUFBaUIsSUFBQyxDQUFBLE1BQWxCLENBQXhCO1FBQ0EsSUFBcUQsY0FBckQ7VUFBQSxJQUFDLENBQUEsYUFBYSxDQUFDLElBQWYsQ0FBd0IsSUFBQSxRQUFBLENBQVMsQ0FB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aXJlICdzcGFjZS1wZW4nXG5fID0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xue0VtaXR0ZXIsIENvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcblxue0NvbmZsaWN0fSA9IHJlcXVpcmUgJy4vY29uZmxpY3QnXG5cbntTaWRlVmlld30gPSByZXF1aXJlICcuL3ZpZXcvc2lkZS12aWV3J1xue05hdmlnYXRpb25WaWV3fSA9IHJlcXVpcmUgJy4vdmlldy9uYXZpZ2F0aW9uLXZpZXcnXG57UmVzb2x2ZXJWaWV3fSA9IHJlcXVpcmUgJy4vdmlldy9yZXNvbHZlci12aWV3J1xuXG4jIFB1YmxpYzogTWVkaWF0ZSBjb25mbGljdC1yZWxhdGVkIGRlY29yYXRpb25zIGFuZCBldmVudHMgb24gYmVoYWxmIG9mIGEgc3BlY2lmaWMgVGV4dEVkaXRvci5cbiNcbmNsYXNzIENvbmZsaWN0ZWRFZGl0b3JcblxuICAjIFB1YmxpYzogSW5zdGFudGlhdGUgYSBuZXcgQ29uZmxpY3RlZEVkaXRvciB0byBtYW5hZ2UgdGhlIGRlY29yYXRpb25zIGFuZCBldmVudHMgb2YgYSBzcGVjaWZpY1xuICAjIFRleHRFZGl0b3IuXG4gICNcbiAgIyBzdGF0ZSBbTWVyZ2VTdGF0ZV0gLSBNZXJnZS13aWRlIGNvbmZsaWN0IHN0YXRlLlxuICAjIHBrZyBbRW1pdHRlcl0gLSBUaGUgcGFja2FnZSBvYmplY3QgY29udGFpbmluZyBldmVudCBkaXNwYXRjaCBhbmQgc3Vic2NyaXB0aW9uIG1ldGhvZHMuXG4gICMgZWRpdG9yIFtUZXh0RWRpdG9yXSAtIEFuIGVkaXRvciBjb250YWluaW5nIHRleHQgdGhhdCwgcHJlc3VtYWJseSwgaW5jbHVkZXMgY29uZmxpY3QgbWFya2Vycy5cbiAgI1xuICBjb25zdHJ1Y3RvcjogKEBzdGF0ZSwgQHBrZywgQGVkaXRvcikgLT5cbiAgICBAc3VicyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgQGNvdmVyaW5nVmlld3MgPSBbXVxuICAgIEBjb25mbGljdHMgPSBbXVxuXG4gICMgUHVibGljOiBMb2NhdGUgQ29uZmxpY3RzIHdpdGhpbiB0aGlzIHNwZWNpZmljIFRleHRFZGl0b3IuXG4gICNcbiAgIyBJbnN0YWxsIGEgcGFpciBvZiBTaWRlVmlld3MgYW5kIGEgTmF2aWdhdGlvblZpZXcgZm9yIGVhY2ggQ29uZmxpY3QgZGlzY292ZXJlZCB3aXRoaW4gdGhlXG4gICMgZWRpdG9yJ3MgdGV4dC4gU3Vic2NyaWJlIHRvIHBhY2thZ2UgZXZlbnRzIHJlbGF0ZWQgdG8gcmVsZXZhbnQgQ29uZmxpY3RzIGFuZCBicm9hZGNhc3RcbiAgIyBwZXItZWRpdG9yIHByb2dyZXNzIGV2ZW50cyBhcyB0aGV5IGFyZSByZXNvbHZlZC4gSW5zdGFsbCBBdG9tIGNvbW1hbmRzIHJlbGF0ZWQgdG8gY29uZmxpY3RcbiAgIyBuYXZpZ2F0aW9uIGFuZCByZXNvbHV0aW9uLlxuICAjXG4gIG1hcms6IC0+XG4gICAgQGNvbmZsaWN0cyA9IENvbmZsaWN0LmFsbChAc3RhdGUsIEBlZGl0b3IpXG5cbiAgICBAY292ZXJpbmdWaWV3cyA9IFtdXG4gICAgZm9yIGMgaW4gQGNvbmZsaWN0c1xuICAgICAgQGNvdmVyaW5nVmlld3MucHVzaCBuZXcgU2lkZVZpZXcoYy5vdXJzLCBAZWRpdG9yKVxuICAgICAgQGNvdmVyaW5nVmlld3MucHVzaCBuZXcgU2lkZVZpZXcoYy5iYXNlLCBAZWRpdG9yKSBpZiBjLmJhc2U/XG4gICAgICBAY292ZXJpbmdWaWV3cy5wdXNoIG5ldyBOYXZpZ2F0aW9uVmlldyhjLm5hdmlnYXRvciwgQGVkaXRvcilcbiAgICAgIEBjb3ZlcmluZ1ZpZXdzLnB1c2ggbmV3IFNpZGVWaWV3KGMudGhlaXJzLCBAZWRpdG9yKVxuXG4gICAgICBAc3Vicy5hZGQgYy5vbkRpZFJlc29sdmVDb25mbGljdCA9PlxuICAgICAgICB1bnJlc29sdmVkID0gKHYgZm9yIHYgaW4gQGNvdmVyaW5nVmlld3Mgd2hlbiBub3Qgdi5jb25mbGljdCgpLmlzUmVzb2x2ZWQoKSlcbiAgICAgICAgcmVzb2x2ZWRDb3VudCA9IEBjb25mbGljdHMubGVuZ3RoIC0gTWF0aC5mbG9vcih1bnJlc29sdmVkLmxlbmd0aCAvIDMpXG4gICAgICAgIEBwa2cuZGlkUmVzb2x2ZUNvbmZsaWN0XG4gICAgICAgICAgZmlsZTogQGVkaXRvci5nZXRQYXRoKCksXG4gICAgICAgICAgdG90YWw6IEBjb25mbGljdHMubGVuZ3RoLCByZXNvbHZlZDogcmVzb2x2ZWRDb3VudCxcbiAgICAgICAgICBzb3VyY2U6IHRoaXNcblxuICAgIGlmIEBjb25mbGljdHMubGVuZ3RoID4gMFxuICAgICAgYXRvbS52aWV3cy5nZXRWaWV3KEBlZGl0b3IpLmNsYXNzTGlzdC5hZGQgJ2NvbmZsaWN0ZWQnXG5cbiAgICAgIGN2LmRlY29yYXRlKCkgZm9yIGN2IGluIEBjb3ZlcmluZ1ZpZXdzXG4gICAgICBAaW5zdGFsbEV2ZW50cygpXG4gICAgICBAZm9jdXNDb25mbGljdCBAY29uZmxpY3RzWzBdXG4gICAgZWxzZVxuICAgICAgQHBrZy5kaWRSZXNvbHZlQ29uZmxpY3RcbiAgICAgICAgZmlsZTogQGVkaXRvci5nZXRQYXRoKCksXG4gICAgICAgIHRvdGFsOiAxLCByZXNvbHZlZDogMSxcbiAgICAgICAgc291cmNlOiB0aGlzXG4gICAgICBAY29uZmxpY3RzUmVzb2x2ZWQoKVxuXG4gICMgUHJpdmF0ZTogSW5zdGFsbCBBdG9tIGNvbW1hbmRzIHJlbGF0ZWQgdG8gQ29uZmxpY3QgcmVzb2x1dGlvbiBhbmQgbmF2aWdhdGlvbiBvbiB0aGUgVGV4dEVkaXRvci5cbiAgI1xuICAjIExpc3RlbiBmb3IgcGFja2FnZS1nbG9iYWwgZXZlbnRzIHRoYXQgcmVsYXRlIHRvIHRoZSBsb2NhbCBDb25mbGljdHMgYW5kIGRpc3BhdGNoIHRoZW1cbiAgIyBhcHByb3ByaWF0ZWx5LlxuICAjXG4gIGluc3RhbGxFdmVudHM6IC0+XG4gICAgQHN1YnMuYWRkIEBlZGl0b3Iub25EaWRTdG9wQ2hhbmdpbmcgPT4gQGRldGVjdERpcnR5KClcbiAgICBAc3Vicy5hZGQgQGVkaXRvci5vbkRpZERlc3Ryb3kgPT4gQGNsZWFudXAoKVxuXG4gICAgQHN1YnMuYWRkIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXRleHQtZWRpdG9yJyxcbiAgICAgICdtZXJnZS1jb25mbGljdHM6YWNjZXB0LWN1cnJlbnQnOiA9PiBAYWNjZXB0Q3VycmVudCgpLFxuICAgICAgJ21lcmdlLWNvbmZsaWN0czphY2NlcHQtb3Vycyc6ID0+IEBhY2NlcHRPdXJzKCksXG4gICAgICAnbWVyZ2UtY29uZmxpY3RzOmFjY2VwdC10aGVpcnMnOiA9PiBAYWNjZXB0VGhlaXJzKCksXG4gICAgICAnbWVyZ2UtY29uZmxpY3RzOm91cnMtdGhlbi10aGVpcnMnOiA9PiBAYWNjZXB0T3Vyc1RoZW5UaGVpcnMoKSxcbiAgICAgICdtZXJnZS1jb25mbGljdHM6dGhlaXJzLXRoZW4tb3Vycyc6ID0+IEBhY2NlcHRUaGVpcnNUaGVuT3VycygpLFxuICAgICAgJ21lcmdlLWNvbmZsaWN0czpuZXh0LXVucmVzb2x2ZWQnOiA9PiBAbmV4dFVucmVzb2x2ZWQoKSxcbiAgICAgICdtZXJnZS1jb25mbGljdHM6cHJldmlvdXMtdW5yZXNvbHZlZCc6ID0+IEBwcmV2aW91c1VucmVzb2x2ZWQoKSxcbiAgICAgICdtZXJnZS1jb25mbGljdHM6cmV2ZXJ0LWN1cnJlbnQnOiA9PiBAcmV2ZXJ0Q3VycmVudCgpXG5cbiAgICBAc3Vicy5hZGQgQHBrZy5vbkRpZFJlc29sdmVDb25mbGljdCAoe3RvdGFsLCByZXNvbHZlZCwgZmlsZX0pID0+XG4gICAgICBpZiBmaWxlIGlzIEBlZGl0b3IuZ2V0UGF0aCgpIGFuZCB0b3RhbCBpcyByZXNvbHZlZFxuICAgICAgICBAY29uZmxpY3RzUmVzb2x2ZWQoKVxuXG4gICAgQHN1YnMuYWRkIEBwa2cub25EaWRDb21wbGV0ZUNvbmZsaWN0UmVzb2x1dGlvbiA9PiBAY2xlYW51cCgpXG4gICAgQHN1YnMuYWRkIEBwa2cub25EaWRRdWl0Q29uZmxpY3RSZXNvbHV0aW9uID0+IEBjbGVhbnVwKClcblxuICAjIFByaXZhdGU6IFVuZG8gYW55IGNoYW5nZXMgZG9uZSB0byB0aGUgdW5kZXJseWluZyBUZXh0RWRpdG9yLlxuICAjXG4gIGNsZWFudXA6IC0+XG4gICAgYXRvbS52aWV3cy5nZXRWaWV3KEBlZGl0b3IpLmNsYXNzTGlzdC5yZW1vdmUgJ2NvbmZsaWN0ZWQnIGlmIEBlZGl0b3I/XG5cbiAgICBmb3IgYyBpbiBAY29uZmxpY3RzXG4gICAgICBtLmRlc3Ryb3koKSBmb3IgbSBpbiBjLm1hcmtlcnMoKVxuXG4gICAgdi5yZW1vdmUoKSBmb3IgdiBpbiBAY292ZXJpbmdWaWV3c1xuXG4gICAgQHN1YnMuZGlzcG9zZSgpXG5cbiAgIyBQcml2YXRlOiBFdmVudCBoYW5kbGVyIGludm9rZWQgd2hlbiBhbGwgY29uZmxpY3RzIGluIHRoaXMgZmlsZSBoYXZlIGJlZW4gcmVzb2x2ZWQuXG4gICNcbiAgY29uZmxpY3RzUmVzb2x2ZWQ6IC0+XG4gICAgYXRvbS53b3Jrc3BhY2UuYWRkVG9wUGFuZWwgaXRlbTogbmV3IFJlc29sdmVyVmlldyhAZWRpdG9yLCBAc3RhdGUsIEBwa2cpXG5cbiAgZGV0ZWN0RGlydHk6IC0+XG4gICAgIyBPbmx5IGRldGVjdCBkaXJ0eSByZWdpb25zIHdpdGhpbiBDb3ZlcmluZ1ZpZXdzIHRoYXQgaGF2ZSBhIGN1cnNvciB3aXRoaW4gdGhlbS5cbiAgICBwb3RlbnRpYWxzID0gW11cbiAgICBmb3IgYyBpbiBAZWRpdG9yLmdldEN1cnNvcnMoKVxuICAgICAgZm9yIHYgaW4gQGNvdmVyaW5nVmlld3NcbiAgICAgICAgcG90ZW50aWFscy5wdXNoKHYpIGlmIHYuaW5jbHVkZXNDdXJzb3IoYylcblxuICAgIHYuZGV0ZWN0RGlydHkoKSBmb3IgdiBpbiBfLnVuaXEocG90ZW50aWFscylcblxuICAjIFByaXZhdGU6IENvbW1hbmQgdGhhdCBhY2NlcHRzIGVhY2ggc2lkZSBvZiBhIGNvbmZsaWN0IHRoYXQgY29udGFpbnMgYSBjdXJzb3IuXG4gICNcbiAgIyBDb25mbGljdHMgd2l0aCBjdXJzb3JzIGluIGJvdGggc2lkZXMgd2lsbCBiZSBpZ25vcmVkLlxuICAjXG4gIGFjY2VwdEN1cnJlbnQ6IC0+XG4gICAgcmV0dXJuIHVubGVzcyBAZWRpdG9yIGlzIGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuXG4gICAgc2lkZXMgPSBAYWN0aXZlKClcblxuICAgICMgRG8gbm90aGluZyBpZiB5b3UgaGF2ZSBjdXJzb3JzIGluICpib3RoKiBzaWRlcyBvZiBhIHNpbmdsZSBjb25mbGljdC5cbiAgICBkdXBsaWNhdGVzID0gW11cbiAgICBzZWVuID0ge31cbiAgICBmb3Igc2lkZSBpbiBzaWRlc1xuICAgICAgaWYgc2lkZS5jb25mbGljdCBvZiBzZWVuXG4gICAgICAgIGR1cGxpY2F0ZXMucHVzaCBzaWRlXG4gICAgICAgIGR1cGxpY2F0ZXMucHVzaCBzZWVuW3NpZGUuY29uZmxpY3RdXG4gICAgICBzZWVuW3NpZGUuY29uZmxpY3RdID0gc2lkZVxuICAgIHNpZGVzID0gXy5kaWZmZXJlbmNlIHNpZGVzLCBkdXBsaWNhdGVzXG5cbiAgICBAZWRpdG9yLnRyYW5zYWN0IC0+XG4gICAgICBzaWRlLnJlc29sdmUoKSBmb3Igc2lkZSBpbiBzaWRlc1xuXG4gICMgUHJpdmF0ZTogQ29tbWFuZCB0aGF0IGFjY2VwdHMgdGhlIFwib3Vyc1wiIHNpZGUgb2YgdGhlIGFjdGl2ZSBjb25mbGljdC5cbiAgI1xuICBhY2NlcHRPdXJzOiAtPlxuICAgIHJldHVybiB1bmxlc3MgQGVkaXRvciBpcyBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICBAZWRpdG9yLnRyYW5zYWN0ID0+XG4gICAgICBzaWRlLmNvbmZsaWN0Lm91cnMucmVzb2x2ZSgpIGZvciBzaWRlIGluIEBhY3RpdmUoKVxuXG4gICMgUHJpdmF0ZTogQ29tbWFuZCB0aGF0IGFjY2VwdHMgdGhlIFwidGhlaXJzXCIgc2lkZSBvZiB0aGUgYWN0aXZlIGNvbmZsaWN0LlxuICAjXG4gIGFjY2VwdFRoZWlyczogLT5cbiAgICByZXR1cm4gdW5sZXNzIEBlZGl0b3IgaXMgYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgQGVkaXRvci50cmFuc2FjdCA9PlxuICAgICAgc2lkZS5jb25mbGljdC50aGVpcnMucmVzb2x2ZSgpIGZvciBzaWRlIGluIEBhY3RpdmUoKVxuXG4gICMgUHJpdmF0ZTogQ29tbWFuZCB0aGF0IHVzZXMgYSBjb21wb3NpdGUgcmVzb2x1dGlvbiBvZiB0aGUgXCJvdXJzXCIgc2lkZSBmb2xsb3dlZCBieSB0aGUgXCJ0aGVpcnNcIlxuICAjIHNpZGUgb2YgdGhlIGFjdGl2ZSBjb25mbGljdC5cbiAgI1xuICBhY2NlcHRPdXJzVGhlblRoZWlyczogLT5cbiAgICByZXR1cm4gdW5sZXNzIEBlZGl0b3IgaXMgYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgQGVkaXRvci50cmFuc2FjdCA9PlxuICAgICAgZm9yIHNpZGUgaW4gQGFjdGl2ZSgpXG4gICAgICAgIEBjb21iaW5lU2lkZXMgc2lkZS5jb25mbGljdC5vdXJzLCBzaWRlLmNvbmZsaWN0LnRoZWlyc1xuXG4gICMgUHJpdmF0ZTogQ29tbWFuZCB0aGF0IHVzZXMgYSBjb21wb3NpdGUgcmVzb2x1dGlvbiBvZiB0aGUgXCJ0aGVpcnNcIiBzaWRlIGZvbGxvd2VkIGJ5IHRoZSBcIm91cnNcIlxuICAjIHNpZGUgb2YgdGhlIGFjdGl2ZSBjb25mbGljdC5cbiAgI1xuICBhY2NlcHRUaGVpcnNUaGVuT3VyczogLT5cbiAgICByZXR1cm4gdW5sZXNzIEBlZGl0b3IgaXMgYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgQGVkaXRvci50cmFuc2FjdCA9PlxuICAgICAgZm9yIHNpZGUgaW4gQGFjdGl2ZSgpXG4gICAgICAgIEBjb21iaW5lU2lkZXMgc2lkZS5jb25mbGljdC50aGVpcnMsIHNpZGUuY29uZmxpY3Qub3Vyc1xuXG4gICMgUHJpdmF0ZTogQ29tbWFuZCB0aGF0IG5hdmlnYXRlcyB0byB0aGUgbmV4dCB1bnJlc29sdmVkIGNvbmZsaWN0IGluIHRoZSBlZGl0b3IuXG4gICNcbiAgIyBJZiB0aGUgY3Vyc29yIGlzIG9uIG9yIGFmdGVyIHRoZSBmaW5hbCB1bnJlc29sdmVkIGNvbmZsaWN0IGluIHRoZSBlZGl0b3IsIG5vdGhpbmcgaGFwcGVucy5cbiAgI1xuICBuZXh0VW5yZXNvbHZlZDogLT5cbiAgICByZXR1cm4gdW5sZXNzIEBlZGl0b3IgaXMgYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgZmluYWwgPSBfLmxhc3QgQGFjdGl2ZSgpXG4gICAgaWYgZmluYWw/XG4gICAgICBuID0gZmluYWwuY29uZmxpY3QubmF2aWdhdG9yLm5leHRVbnJlc29sdmVkKClcbiAgICAgIEBmb2N1c0NvbmZsaWN0KG4pIGlmIG4/XG4gICAgZWxzZVxuICAgICAgb3JkZXJlZEN1cnNvcnMgPSBfLnNvcnRCeSBAZWRpdG9yLmdldEN1cnNvcnMoKSwgKGMpIC0+XG4gICAgICAgIGMuZ2V0QnVmZmVyUG9zaXRpb24oKS5yb3dcbiAgICAgIGxhc3RDdXJzb3IgPSBfLmxhc3Qgb3JkZXJlZEN1cnNvcnNcbiAgICAgIHJldHVybiB1bmxlc3MgbGFzdEN1cnNvcj9cblxuICAgICAgcG9zID0gbGFzdEN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gICAgICBmaXJzdEFmdGVyID0gbnVsbFxuICAgICAgZm9yIGMgaW4gQGNvbmZsaWN0c1xuICAgICAgICBwID0gYy5vdXJzLm1hcmtlci5nZXRCdWZmZXJSYW5nZSgpLnN0YXJ0XG4gICAgICAgIGlmIHAuaXNHcmVhdGVyVGhhbk9yRXF1YWwocG9zKSBhbmQgbm90IGZpcnN0QWZ0ZXI/XG4gICAgICAgICAgZmlyc3RBZnRlciA9IGNcbiAgICAgIHJldHVybiB1bmxlc3MgZmlyc3RBZnRlcj9cblxuICAgICAgaWYgZmlyc3RBZnRlci5pc1Jlc29sdmVkKClcbiAgICAgICAgdGFyZ2V0ID0gZmlyc3RBZnRlci5uYXZpZ2F0b3IubmV4dFVucmVzb2x2ZWQoKVxuICAgICAgZWxzZVxuICAgICAgICB0YXJnZXQgPSBmaXJzdEFmdGVyXG4gICAgICByZXR1cm4gdW5sZXNzIHRhcmdldD9cblxuICAgICAgQGZvY3VzQ29uZmxpY3QgdGFyZ2V0XG5cbiAgIyBQcml2YXRlOiBDb21tYW5kIHRoYXQgbmF2aWdhdGVzIHRvIHRoZSBwcmV2aW91cyB1bnJlc29sdmVkIGNvbmZsaWN0IGluIHRoZSBlZGl0b3IuXG4gICNcbiAgIyBJZiB0aGUgY3Vyc29yIGlzIG9uIG9yIGJlZm9yZSB0aGUgZmlyc3QgdW5yZXNvbHZlZCBjb25mbGljdCBpbiB0aGUgZWRpdG9yLCBub3RoaW5nIGhhcHBlbnMuXG4gICNcbiAgcHJldmlvdXNVbnJlc29sdmVkOiAtPlxuICAgIHJldHVybiB1bmxlc3MgQGVkaXRvciBpcyBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICBpbml0aWFsID0gXy5maXJzdCBAYWN0aXZlKClcbiAgICBpZiBpbml0aWFsP1xuICAgICAgcCA9IGluaXRpYWwuY29uZmxpY3QubmF2aWdhdG9yLnByZXZpb3VzVW5yZXNvbHZlZCgpXG4gICAgICBAZm9jdXNDb25mbGljdChwKSBpZiBwP1xuICAgIGVsc2VcbiAgICAgIG9yZGVyZWRDdXJzb3JzID0gXy5zb3J0QnkgQGVkaXRvci5nZXRDdXJzb3JzKCksIChjKSAtPlxuICAgICAgICBjLmdldEJ1ZmZlclBvc2l0aW9uKCkucm93XG4gICAgICBmaXJzdEN1cnNvciA9IF8uZmlyc3Qgb3JkZXJlZEN1cnNvcnNcbiAgICAgIHJldHVybiB1bmxlc3MgZmlyc3RDdXJzb3I/XG5cbiAgICAgIHBvcyA9IGZpcnN0Q3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcbiAgICAgIGxhc3RCZWZvcmUgPSBudWxsXG4gICAgICBmb3IgYyBpbiBAY29uZmxpY3RzXG4gICAgICAgIHAgPSBjLm91cnMubWFya2VyLmdldEJ1ZmZlclJhbmdlKCkuc3RhcnRcbiAgICAgICAgaWYgcC5pc0xlc3NUaGFuT3JFcXVhbCBwb3NcbiAgICAgICAgICBsYXN0QmVmb3JlID0gY1xuICAgICAgcmV0dXJuIHVubGVzcyBsYXN0QmVmb3JlP1xuXG4gICAgICBpZiBsYXN0QmVmb3JlLmlzUmVzb2x2ZWQoKVxuICAgICAgICB0YXJnZXQgPSBsYXN0QmVmb3JlLm5hdmlnYXRvci5wcmV2aW91c1VucmVzb2x2ZWQoKVxuICAgICAgZWxzZVxuICAgICAgICB0YXJnZXQgPSBsYXN0QmVmb3JlXG4gICAgICByZXR1cm4gdW5sZXNzIHRhcmdldD9cblxuICAgICAgQGZvY3VzQ29uZmxpY3QgdGFyZ2V0XG5cbiAgIyBQcml2YXRlOiBSZXZlcnQgbWFudWFsIGVkaXRzIHRvIHRoZSBjdXJyZW50IHNpZGUgb2YgdGhlIGFjdGl2ZSBjb25mbGljdC5cbiAgI1xuICByZXZlcnRDdXJyZW50OiAtPlxuICAgIHJldHVybiB1bmxlc3MgQGVkaXRvciBpcyBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICBmb3Igc2lkZSBpbiBAYWN0aXZlKClcbiAgICAgIGZvciB2aWV3IGluIEBjb3ZlcmluZ1ZpZXdzIHdoZW4gdmlldy5jb25mbGljdCgpIGlzIHNpZGUuY29uZmxpY3RcbiAgICAgICAgdmlldy5yZXZlcnQoKSBpZiB2aWV3LmlzRGlydHkoKVxuXG4gICMgUHJpdmF0ZTogQ29sbGVjdCBhIGxpc3Qgb2YgZWFjaCBTaWRlIG9mIGFueSBDb25mbGljdCB3aXRoaW4gdGhlIGVkaXRvciB0aGF0IGNvbnRhaW5zIGEgY3Vyc29yLlxuICAjXG4gICMgUmV0dXJucyBbQXJyYXk8U2lkZT5dXG4gICNcbiAgYWN0aXZlOiAtPlxuICAgIHBvc2l0aW9ucyA9IChjLmdldEJ1ZmZlclBvc2l0aW9uKCkgZm9yIGMgaW4gQGVkaXRvci5nZXRDdXJzb3JzKCkpXG4gICAgbWF0Y2hpbmcgPSBbXVxuICAgIGZvciBjIGluIEBjb25mbGljdHNcbiAgICAgIGZvciBwIGluIHBvc2l0aW9uc1xuICAgICAgICBpZiBjLm91cnMubWFya2VyLmdldEJ1ZmZlclJhbmdlKCkuY29udGFpbnNQb2ludCBwXG4gICAgICAgICAgbWF0Y2hpbmcucHVzaCBjLm91cnNcbiAgICAgICAgaWYgYy50aGVpcnMubWFya2VyLmdldEJ1ZmZlclJhbmdlKCkuY29udGFpbnNQb2ludCBwXG4gICAgICAgICAgbWF0Y2hpbmcucHVzaCBjLnRoZWlyc1xuICAgIG1hdGNoaW5nXG5cbiAgIyBQcml2YXRlOiBSZXNvbHZlIGEgY29uZmxpY3QgYnkgY29tYmluaW5nIGl0cyB0d28gU2lkZXMgaW4gYSBzcGVjaWZpYyBvcmRlci5cbiAgI1xuICAjIGZpcnN0IFtTaWRlXSBUaGUgU2lkZSB0aGF0IHNob3VsZCBvY2N1ciBmaXJzdCBpbiB0aGUgcmVzb2x2ZWQgdGV4dC5cbiAgIyBzZWNvbmQgW1NpZGVdIFRoZSBTaWRlIGJlbG9uZ2luZyB0byB0aGUgc2FtZSBDb25mbGljdCB0aGF0IHNob3VsZCBvY2N1ciBzZWNvbmQgaW4gdGhlIHJlc29sdmVkXG4gICMgICB0ZXh0LlxuICAjXG4gIGNvbWJpbmVTaWRlczogKGZpcnN0LCBzZWNvbmQpIC0+XG4gICAgdGV4dCA9IEBlZGl0b3IuZ2V0VGV4dEluQnVmZmVyUmFuZ2Ugc2Vjb25kLm1hcmtlci5nZXRCdWZmZXJSYW5nZSgpXG4gICAgZSA9IGZpcnN0Lm1hcmtlci5nZXRCdWZmZXJSYW5nZSgpLmVuZFxuICAgIGluc2VydFBvaW50ID0gQGVkaXRvci5zZXRUZXh0SW5CdWZmZXJSYW5nZShbZSwgZV0sIHRleHQpLmVuZFxuICAgIGZpcnN0Lm1hcmtlci5zZXRIZWFkQnVmZmVyUG9zaXRpb24gaW5zZXJ0UG9pbnRcbiAgICBmaXJzdC5mb2xsb3dpbmdNYXJrZXIuc2V0VGFpbEJ1ZmZlclBvc2l0aW9uIGluc2VydFBvaW50XG4gICAgZmlyc3QucmVzb2x2ZSgpXG5cbiAgIyBQcml2YXRlOiBTY3JvbGwgdGhlIGVkaXRvciBhbmQgcGxhY2UgdGhlIGN1cnNvciBhdCB0aGUgYmVnaW5uaW5nIG9mIGEgbWFya2VkIGNvbmZsaWN0LlxuICAjXG4gICMgY29uZmxpY3QgW0NvbmZsaWN0XSBBbnkgY29uZmxpY3Qgd2l0aGluIHRoZSBjdXJyZW50IGVkaXRvci5cbiAgI1xuICBmb2N1c0NvbmZsaWN0OiAoY29uZmxpY3QpIC0+XG4gICAgc3QgPSBjb25mbGljdC5vdXJzLm1hcmtlci5nZXRCdWZmZXJSYW5nZSgpLnN0YXJ0XG4gICAgQGVkaXRvci5zY3JvbGxUb0J1ZmZlclBvc2l0aW9uIHN0LCBjZW50ZXI6IHRydWVcbiAgICBAZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uIHN0LCBhdXRvc2Nyb2xsOiBmYWxzZVxuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIENvbmZsaWN0ZWRFZGl0b3I6IENvbmZsaWN0ZWRFZGl0b3JcbiJdfQ==
