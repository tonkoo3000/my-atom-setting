(function() {
  var $, GitLog, GitRevisionView, GitTimeMachineView, GitTimeplot, NOT_GIT_ERRORS, View, _, moment, path, ref, str,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  ref = require("atom-space-pen-views"), $ = ref.$, View = ref.View;

  path = require('path');

  _ = require('underscore-plus');

  str = require('bumble-strings');

  moment = require('moment');

  GitLog = require('git-log-utils');

  GitTimeplot = require('./git-timeplot');

  GitRevisionView = require('./git-revision-view');

  NOT_GIT_ERRORS = ['File not a git repository', 'is outside repository', "Not a git repository"];

  module.exports = GitTimeMachineView = (function() {
    function GitTimeMachineView(serializedState, options) {
      if (options == null) {
        options = {};
      }
      this._onEditorResize = bind(this._onEditorResize, this);
      if (!this.$element) {
        this.$element = $("<div class='git-time-machine'>");
      }
      if (options.editor != null) {
        this.setEditor(options.editor);
        this.render();
      }
      this._bindWindowEvents();
    }

    GitTimeMachineView.prototype.setEditor = function(editor) {
      var file, ref1;
      if (editor === this.editor) {
        return;
      }
      file = editor != null ? editor.getPath() : void 0;
      if (!((file != null) && !str.startsWith(path.basename(file), GitRevisionView.FILE_PREFIX))) {
        return;
      }
      ref1 = [editor, file], this.editor = ref1[0], this.file = ref1[1];
      return this.render();
    };

    GitTimeMachineView.prototype.render = function() {
      var commits;
      commits = this.gitCommitHistory();
      if (!((this.file != null) && (commits != null))) {
        this._renderPlaceholder();
      } else {
        this.$element.text("");
        this._renderCloseHandle();
        this._renderStats(commits);
        this._renderTimeline(commits);
      }
      return this.$element;
    };

    GitTimeMachineView.prototype.serialize = function() {
      return null;
    };

    GitTimeMachineView.prototype.destroy = function() {
      this._unbindWindowEvents();
      return this.$element.remove();
    };

    GitTimeMachineView.prototype.hide = function() {
      var ref1;
      return (ref1 = this.timeplot) != null ? ref1.hide() : void 0;
    };

    GitTimeMachineView.prototype.show = function() {
      var ref1;
      return (ref1 = this.timeplot) != null ? ref1.show() : void 0;
    };

    GitTimeMachineView.prototype.getElement = function() {
      return this.$element.get(0);
    };

    GitTimeMachineView.prototype.gitCommitHistory = function(file) {
      var commits, e;
      if (file == null) {
        file = this.file;
      }
      if (file == null) {
        return null;
      }
      try {
        commits = GitLog.getCommitHistory(file);
      } catch (error) {
        e = error;
        if (e.message != null) {
          if (str.weaklyHas(e.message, NOT_GIT_ERRORS)) {
            console.warn(file + " not in a git repository");
            return null;
          }
        }
        atom.notifications.addError(String(e));
        console.error(e);
        return null;
      }
      return commits;
    };

    GitTimeMachineView.prototype._bindWindowEvents = function() {
      return $(window).on('resize', this._onEditorResize);
    };

    GitTimeMachineView.prototype._unbindWindowEvents = function() {
      return $(window).off('resize', this._onEditorResize);
    };

    GitTimeMachineView.prototype._renderPlaceholder = function() {
      this.$element.html("<div class='placeholder'>Select a file in the git repo to see timeline</div>");
    };

    GitTimeMachineView.prototype._renderCloseHandle = function() {
      var $closeHandle;
      $closeHandle = $("<div class='close-handle'>X</div>");
      this.$element.append($closeHandle);
      return $closeHandle.on('mousedown', function(e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        e.stopPropagation();
        return atom.commands.dispatch(atom.views.getView(atom.workspace), "git-time-machine:toggle");
      });
    };

    GitTimeMachineView.prototype._renderTimeline = function(commits) {
      this.timeplot || (this.timeplot = new GitTimeplot(this.$element));
      this.timeplot.render(this.editor, commits);
    };

    GitTimeMachineView.prototype._renderStats = function(commits) {
      var authorCount, byAuthor, content, durationInMs, timeSpan;
      content = "";
      if (commits.length > 0) {
        byAuthor = _.indexBy(commits, 'authorName');
        authorCount = _.keys(byAuthor).length;
        durationInMs = moment.unix(commits[commits.length - 1].authorDate).diff(moment.unix(commits[0].authorDate));
        timeSpan = moment.duration(durationInMs).humanize();
        content = "<span class='total-commits'>" + commits.length + "</span> commits by " + authorCount + " authors spanning " + timeSpan;
      }
      this.$element.append("<div class='stats'>\n  " + content + "\n</div>");
    };

    GitTimeMachineView.prototype._onEditorResize = function() {
      return this.render();
    };

    return GitTimeMachineView;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvdG95b2tpLy5hdG9tL3BhY2thZ2VzL2dpdC10aW1lLW1hY2hpbmUvbGliL2dpdC10aW1lLW1hY2hpbmUtdmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLDRHQUFBO0lBQUE7O0VBQUEsTUFBWSxPQUFBLENBQVEsc0JBQVIsQ0FBWixFQUFDLFNBQUQsRUFBSTs7RUFDSixJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBQ1AsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUjs7RUFDSixHQUFBLEdBQU0sT0FBQSxDQUFRLGdCQUFSOztFQUNOLE1BQUEsR0FBUyxPQUFBLENBQVEsUUFBUjs7RUFFVCxNQUFBLEdBQVMsT0FBQSxDQUFRLGVBQVI7O0VBQ1QsV0FBQSxHQUFjLE9BQUEsQ0FBUSxnQkFBUjs7RUFDZCxlQUFBLEdBQWtCLE9BQUEsQ0FBUSxxQkFBUjs7RUFFbEIsY0FBQSxHQUFpQixDQUFDLDJCQUFELEVBQThCLHVCQUE5QixFQUF1RCxzQkFBdkQ7O0VBRWpCLE1BQU0sQ0FBQyxPQUFQLEdBQ007SUFDUyw0QkFBQyxlQUFELEVBQWtCLE9BQWxCOztRQUFrQixVQUFROzs7TUFDckMsSUFBQSxDQUF1RCxJQUFDLENBQUEsUUFBeEQ7UUFBQSxJQUFDLENBQUEsUUFBRCxHQUFZLENBQUEsQ0FBRSxnQ0FBRixFQUFaOztNQUNBLElBQUcsc0JBQUg7UUFDRSxJQUFDLENBQUEsU0FBRCxDQUFXLE9BQU8sQ0FBQyxNQUFuQjtRQUNBLElBQUMsQ0FBQSxNQUFELENBQUEsRUFGRjs7TUFJQSxJQUFDLENBQUEsaUJBQUQsQ0FBQTtJQU5XOztpQ0FTYixTQUFBLEdBQVcsU0FBQyxNQUFEO0FBQ1QsVUFBQTtNQUFBLElBQWMsTUFBQSxLQUFVLElBQUMsQ0FBQSxNQUF6QjtBQUFBLGVBQUE7O01BQ0EsSUFBQSxvQkFBTyxNQUFNLENBQUUsT0FBUixDQUFBO01BQ1AsSUFB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QUFBO0lBRGU7Ozs7O0FBckluQiIsInNvdXJjZXNDb250ZW50IjpbInskLCBWaWV3fSA9IHJlcXVpcmUgXCJhdG9tLXNwYWNlLXBlbi12aWV3c1wiXG5wYXRoID0gcmVxdWlyZSgncGF0aCcpXG5fID0gcmVxdWlyZSgndW5kZXJzY29yZS1wbHVzJylcbnN0ciA9IHJlcXVpcmUoJ2J1bWJsZS1zdHJpbmdzJylcbm1vbWVudCA9IHJlcXVpcmUoJ21vbWVudCcpXG5cbkdpdExvZyA9IHJlcXVpcmUgJ2dpdC1sb2ctdXRpbHMnXG5HaXRUaW1lcGxvdCA9IHJlcXVpcmUgJy4vZ2l0LXRpbWVwbG90J1xuR2l0UmV2aXNpb25WaWV3ID0gcmVxdWlyZSAnLi9naXQtcmV2aXNpb24tdmlldydcblxuTk9UX0dJVF9FUlJPUlMgPSBbJ0ZpbGUgbm90IGEgZ2l0IHJlcG9zaXRvcnknLCAnaXMgb3V0c2lkZSByZXBvc2l0b3J5JywgXCJOb3QgYSBnaXQgcmVwb3NpdG9yeVwiXVxuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBHaXRUaW1lTWFjaGluZVZpZXdcbiAgY29uc3RydWN0b3I6IChzZXJpYWxpemVkU3RhdGUsIG9wdGlvbnM9e30pIC0+XG4gICAgQCRlbGVtZW50ID0gJChcIjxkaXYgY2xhc3M9J2dpdC10aW1lLW1hY2hpbmUnPlwiKSB1bmxlc3MgQCRlbGVtZW50XG4gICAgaWYgb3B0aW9ucy5lZGl0b3I/XG4gICAgICBAc2V0RWRpdG9yKG9wdGlvbnMuZWRpdG9yKVxuICAgICAgQHJlbmRlcigpXG4gICAgICBcbiAgICBAX2JpbmRXaW5kb3dFdmVudHMoKVxuXG5cbiAgc2V0RWRpdG9yOiAoZWRpdG9yKSAtPlxuICAgIHJldHVybiB1bmxlc3MgZWRpdG9yICE9IEBlZGl0b3JcbiAgICBmaWxlID0gZWRpdG9yPy5nZXRQYXRoKClcbiAgICByZXR1cm4gdW5sZXNzIGZpbGU/ICYmICFzdHIuc3RhcnRzV2l0aChwYXRoLmJhc2VuYW1lKGZpbGUpLCBHaXRSZXZpc2lvblZpZXcuRklMRV9QUkVGSVgpXG4gICAgW0BlZGl0b3IsIEBmaWxlXSA9IFtlZGl0b3IsIGZpbGVdXG4gICAgQHJlbmRlcigpXG5cblxuICByZW5kZXI6ICgpIC0+XG4gICAgY29tbWl0cyA9IEBnaXRDb21taXRIaXN0b3J5KClcbiAgICB1bmxlc3MgQGZpbGU/ICYmIGNvbW1pdHM/XG4gICAgICBAX3JlbmRlclBsYWNlaG9sZGVyKClcbiAgICBlbHNlXG4gICAgICBAJGVsZW1lbnQudGV4dChcIlwiKVxuICAgICAgQF9yZW5kZXJDbG9zZUhhbmRsZSgpXG4gICAgICBAX3JlbmRlclN0YXRzKGNvbW1pdHMpXG4gICAgICBAX3JlbmRlclRpbWVsaW5lKGNvbW1pdHMpXG5cbiAgICByZXR1cm4gQCRlbGVtZW50XG5cblxuICAjIFJldHVybnMgYW4gb2JqZWN0IHRoYXQgY2FuIGJlIHJldHJpZXZlZCB3aGVuIHBhY2thZ2UgaXMgYWN0aXZhdGVkXG4gIHNlcmlhbGl6ZTogLT5cbiAgICByZXR1cm4gbnVsbFxuXG5cbiAgIyBUZWFyIGRvd24gYW55IHN0YXRlIGFuZCBkZXRhY2hcbiAgZGVzdHJveTogLT5cbiAgICBAX3VuYmluZFdpbmRvd0V2ZW50cygpXG4gICAgQCRlbGVtZW50LnJlbW92ZSgpXG4gICAgXG4gICAgXG4gIGhpZGU6IC0+XG4gICAgQHRpbWVwbG90Py5oaWRlKCkgICAjIHNvIGl0IGtub3dzIHRvIGhpZGUgdGhlIHBvcHVwXG5cblxuICBzaG93OiAtPlxuICAgIEB0aW1lcGxvdD8uc2hvdygpXG5cblxuICBnZXRFbGVtZW50OiAtPlxuICAgIHJldHVybiBAJGVsZW1lbnQuZ2V0KDApXG5cblxuICBnaXRDb21taXRIaXN0b3J5OiAoZmlsZT1AZmlsZSktPlxuICAgIHJldHVybiBudWxsIHVubGVzcyBmaWxlP1xuICAgIHRyeVxuICAgICAgY29tbWl0cyA9IEdpdExvZy5nZXRDb21taXRIaXN0b3J5IGZpbGVcbiAgICBjYXRjaCBlXG4gICAgICBpZiBlLm1lc3NhZ2U/XG4gICAgICAgIGlmIHN0ci53ZWFrbHlIYXMoZS5tZXNzYWdlLCBOT1RfR0lUX0VSUk9SUylcbiAgICAgICAgICBjb25zb2xlLndhcm4gXCIje2ZpbGV9IG5vdCBpbiBhIGdpdCByZXBvc2l0b3J5XCJcbiAgICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgXG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IgU3RyaW5nIGVcbiAgICAgIGNvbnNvbGUuZXJyb3IgZVxuICAgICAgcmV0dXJuIG51bGxcblxuICAgIHJldHVybiBjb21taXRzO1xuXG5cblxuXG4gIF9iaW5kV2luZG93RXZlbnRzOiAoKSAtPlxuICAgICQod2luZG93KS5vbiAncmVzaXplJywgQF9vbkVkaXRvclJlc2l6ZSBcbiAgICBcbiAgICBcbiAgX3VuYmluZFdpbmRvd0V2ZW50czogKCkgLT5cbiAgICAkKHdpbmRvdykub2ZmICdyZXNpemUnLCBAX29uRWRpdG9yUmVzaXplXG5cblxuICBfcmVuZGVyUGxhY2Vob2xkZXI6ICgpIC0+XG4gICAgQCRlbGVtZW50Lmh0bWwoXCI8ZGl2IGNsYXNzPSdwbGFjZWhvbGRlcic+U2VsZWN0IGEgZmlsZSBpbiB0aGUgZ2l0IHJlcG8gdG8gc2VlIHRpbWVsaW5lPC9kaXY+XCIpXG4gICAgcmV0dXJuXG5cblxuICBfcmVuZGVyQ2xvc2VIYW5kbGU6ICgpIC0+XG4gICAgJGNsb3NlSGFuZGxlID0gJChcIjxkaXYgY2xhc3M9J2Nsb3NlLWhhbmRsZSc+WDwvZGl2PlwiKVxuICAgIEAkZWxlbWVudC5hcHBlbmQgJGNsb3NlSGFuZGxlXG4gICAgJGNsb3NlSGFuZGxlLm9uICdtb3VzZWRvd24nLCAoZSktPlxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpXG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICAjIHdoeSBub3Q/IGluc3RlYWQgb2YgYWRkaW5nIGNhbGxiYWNrLCBvdXIgb3duIGV2ZW50Li4uXG4gICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSksIFwiZ2l0LXRpbWUtbWFjaGluZTp0b2dnbGVcIilcblxuXG5cbiAgX3JlbmRlclRpbWVsaW5lOiAoY29tbWl0cykgLT5cbiAgICBAdGltZXBsb3QgfHw9IG5ldyBHaXRUaW1lcGxvdChAJGVsZW1lbnQpXG4gICAgQHRpbWVwbG90LnJlbmRlcihAZWRpdG9yLCBjb21taXRzKVxuICAgIHJldHVyblxuXG5cbiAgX3JlbmRlclN0YXRzOiAoY29tbWl0cykgLT5cbiAgICBjb250ZW50ID0gXCJcIlxuICAgIGlmIGNvbW1pdHMubGVuZ3RoID4gMFxuICAgICAgYnlBdXRob3IgPSBfLmluZGV4QnkgY29tbWl0cywgJ2F1dGhvck5hbWUnXG4gICAgICBhdXRob3JDb3VudCA9IF8ua2V5cyhieUF1dGhvcikubGVuZ3RoXG4gICAgICBkdXJhdGlvbkluTXMgPSBtb21lbnQudW5peChjb21taXRzW2NvbW1pdHMubGVuZ3RoIC0gMV0uYXV0aG9yRGF0ZSkuZGlmZihtb21lbnQudW5peChjb21taXRzWzBdLmF1dGhvckRhdGUpKVxuICAgICAgdGltZVNwYW4gPSBtb21lbnQuZHVyYXRpb24oZHVyYXRpb25Jbk1zKS5odW1hbml6ZSgpXG4gICAgICBjb250ZW50ID0gXCI8c3BhbiBjbGFzcz0ndG90YWwtY29tbWl0cyc+I3tjb21taXRzLmxlbmd0aH08L3NwYW4+IGNvbW1pdHMgYnkgI3thdXRob3JDb3VudH0gYXV0aG9ycyBzcGFubmluZyAje3RpbWVTcGFufVwiXG4gICAgQCRlbGVtZW50LmFwcGVuZCBcIlwiXCJcbiAgICAgIDxkaXYgY2xhc3M9J3N0YXRzJz5cbiAgICAgICAgI3tjb250ZW50fVxuICAgICAgPC9kaXY+XG4gICAgXCJcIlwiXG4gICAgcmV0dXJuXG5cblxuICBfb25FZGl0b3JSZXNpemU6ID0+XG4gICAgQHJlbmRlcigpXG4gICAgIl19
