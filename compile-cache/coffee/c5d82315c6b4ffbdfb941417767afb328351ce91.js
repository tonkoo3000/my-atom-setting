(function() {
  var CompositeDisposable, GitTimeMachine, GitTimeMachineView;

  GitTimeMachineView = require('./git-time-machine-view');

  CompositeDisposable = require('atom').CompositeDisposable;

  module.exports = GitTimeMachine = {
    gitTimeMachineView: null,
    timelinePanel: null,
    subscriptions: null,
    activate: function(state) {
      this.gitTimeMachineView = new GitTimeMachineView(state.gitTimeMachineViewState);
      this.timelinePanel = atom.workspace.addBottomPanel({
        item: this.gitTimeMachineView.getElement(),
        visible: false
      });
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(atom.commands.add('atom-workspace', {
        'git-time-machine:toggle': (function(_this) {
          return function() {
            return _this.toggle();
          };
        })(this)
      }));
      return atom.workspace.onDidChangeActivePaneItem((function(_this) {
        return function(editor) {
          return _this._onDidChangeActivePaneItem();
        };
      })(this));
    },
    deactivate: function() {
      this.timelinePanel.destroy();
      this.subscriptions.dispose();
      return this.gitTimeMachineView.destroy();
    },
    serialize: function() {
      return {
        gitTimeMachineViewState: this.gitTimeMachineView.serialize()
      };
    },
    toggle: function() {
      if (this.timelinePanel.isVisible()) {
        this.gitTimeMachineView.hide();
        return this.timelinePanel.hide();
      } else {
        this.timelinePanel.show();
        this.gitTimeMachineView.show();
        return this.gitTimeMachineView.setEditor(atom.workspace.getActiveTextEditor());
      }
    },
    _onDidChangeActivePaneItem: function(editor) {
      editor = atom.workspace.getActiveTextEditor();
      if (this.timelinePanel.isVisible()) {
        this.gitTimeMachineView.setEditor(editor);
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvdG95b2tpLy5hdG9tL3BhY2thZ2VzL2dpdC10aW1lLW1hY2hpbmUvbGliL2dpdC10aW1lLW1hY2hpbmUuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxrQkFBQSxHQUFxQixPQUFBLENBQVEseUJBQVI7O0VBQ3BCLHNCQUF1QixPQUFBLENBQVEsTUFBUjs7RUFFeEIsTUFBTSxDQUFDLE9BQVAsR0FBaUIsY0FBQSxHQUNmO0lBQUEsa0JBQUEsRUFBb0IsSUFBcEI7SUFDQSxhQUFBLEVBQWUsSUFEZjtJQUVBLGFBQUEsRUFBZSxJQUZmO0lBSUEsUUFBQSxFQUFVLFNBQUMsS0FBRDtNQUNSLElBQUMsQ0FBQSxrQkFBRCxHQUEwQixJQUFBLGtCQUFBLENBQW1CLEtBQUssQ0FBQyx1QkFBekI7TUFDMUIsSUFBQyxDQUFBLGFBQUQsR0FBaUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxjQUFmLENBQThCO1FBQUEsSUFBQSxFQUFNLElBQUMsQ0FBQSxrQkFBa0IsQ0FBQyxVQUFwQixDQUFBLENBQU47UUFBd0MsT0FBQSxFQUFTLEtBQWpEO09BQTlCO01BR2pCLElBQUMsQ0FBQSxhQUFELEdBQWlCLElBQUk7TUFHckIsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixnQkFBbEIsRUFBb0M7UUFBQSx5QkFBQSxFQUEyQixDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO21CQUFHLEtBQUMsQ0FBQSxNQUFELENBQUE7VUFBSDtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBM0I7T0FBcEMsQ0FBbkI7YUFDQSxJQUFJLENBQUMsU0FBUyxDQUFDLHlCQUFmLENBQXlDLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxNQUFEO2lCQUFZLEtBQUMsQ0FBQSwwQkFBRCxDQUFBO1FBQVo7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXpDO0lBVFEsQ0FKVjtJQWdCQSxVQUFBLEVBQVksU0FBQTtNQUNWLElBQUMsQ0FBQSxhQUFhLENBQUMsT0FBZixDQUFBO01BQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxPQUFmLENBQUE7YUFDQSxJQUFDLENBQUEsa0JBQWtCLENBQUMsT0FBcEIsQ0FBQTtJQUhVLENBaEJaO0lBc0JBLFNBQUEsRUFBVyxTQUFBO2FBQ1Q7UUFBQSx1QkFBQSxFQUF5QixJQUFDLENBQUEsa0JBQWtCLENBQUMsU0FBcEIsQ0FBQSxDQUF6Qjs7SUFEUyxDQXRCWDtJQTBCQSxNQUFBLEVBQVEsU0FBQTtNQUVOLElBQUcsSUFBQyxDQUFBLGFBQWEsQ0FBQyxTQUFmLENBQUEsQ0FBSDtRQUNFLElBQUMsQ0FBQSxrQkFBa0IsQ0FBQyxJQUFwQixDQUFBO2VBQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxJQUFmLENBQUEsRUFGRjtPQUFBLE1BQUE7UUFJRSxJQUFDLENBQUEsYUFBYSxDQUFDLElBQWYsQ0FBQTtRQUNBLElBQUMsQ0FBQSxrQkFBa0IsQ0FBQyxJQUFwQixDQUFBO2VBQ0EsSUFBQyxDQUFBLGtCQUFrQixDQUFDLFNBQXBCLENBQThCLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQWYsQ0FBQSxDQUE5QixFQU5GOztJQUZNLENBMUJSO0lBcUNBLDBCQUFBLEVBQTRCLFNBQUMsTUFBRDtNQUMxQixNQUFBLEdBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBZixDQUFBO01BQ1QsSUFBRyxJQUFDLENBQUEsYUFBYSxDQUFDLFNBQWYsQ0FBQSxDQUFIO1FBQ0UsSUFBQyxDQUFBLGtCQUFrQixDQUFDLFNBQXBCLENBQThCLE1BQTlCLEVBREY7O0lBRjBCLENBckM1Qjs7QUFKRiIsInNvdXJjZXNDb250ZW50IjpbIkdpdFRpbWVNYWNoaW5lVmlldyA9IHJlcXVpcmUgJy4vZ2l0LXRpbWUtbWFjaGluZS12aWV3J1xue0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcblxubW9kdWxlLmV4cG9ydHMgPSBHaXRUaW1lTWFjaGluZSA9XG4gIGdpdFRpbWVNYWNoaW5lVmlldzogbnVsbFxuICB0aW1lbGluZVBhbmVsOiBudWxsXG4gIHN1YnNjcmlwdGlvbnM6IG51bGxcblxuICBhY3RpdmF0ZTogKHN0YXRlKSAtPlxuICAgIEBnaXRUaW1lTWFjaGluZVZpZXcgPSBuZXcgR2l0VGltZU1hY2hpbmVWaWV3IHN0YXRlLmdpdFRpbWVNYWNoaW5lVmlld1N0YXRlXG4gICAgQHRpbWVsaW5lUGFuZWwgPSBhdG9tLndvcmtzcGFjZS5hZGRCb3R0b21QYW5lbChpdGVtOiBAZ2l0VGltZU1hY2hpbmVWaWV3LmdldEVsZW1lbnQoKSwgdmlzaWJsZTogZmFsc2UpXG5cbiAgICAjIEV2ZW50cyBzdWJzY3JpYmVkIHRvIGluIGF0b20ncyBzeXN0ZW0gY2FuIGJlIGVhc2lseSBjbGVhbmVkIHVwIHdpdGggYSBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgQHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuXG4gICAgIyBSZWdpc3RlciBjb21tYW5kIHRoYXQgdG9nZ2xlcyB0aGlzIHZpZXdcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJywgJ2dpdC10aW1lLW1hY2hpbmU6dG9nZ2xlJzogPT4gQHRvZ2dsZSgpXG4gICAgYXRvbS53b3Jrc3BhY2Uub25EaWRDaGFuZ2VBY3RpdmVQYW5lSXRlbSAoZWRpdG9yKSA9PiBAX29uRGlkQ2hhbmdlQWN0aXZlUGFuZUl0ZW0oKVxuXG5cbiAgZGVhY3RpdmF0ZTogLT5cbiAgICBAdGltZWxpbmVQYW5lbC5kZXN0cm95KClcbiAgICBAc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICBAZ2l0VGltZU1hY2hpbmVWaWV3LmRlc3Ryb3koKVxuXG5cbiAgc2VyaWFsaXplOiAtPlxuICAgIGdpdFRpbWVNYWNoaW5lVmlld1N0YXRlOiBAZ2l0VGltZU1hY2hpbmVWaWV3LnNlcmlhbGl6ZSgpXG5cblxuICB0b2dnbGU6IC0+XG4gICAgIyBjb25zb2xlLmxvZyAnR2l0VGltZU1hY2hpbmUgd2FzIG9wZW5lZCEnXG4gICAgaWYgQHRpbWVsaW5lUGFuZWwuaXNWaXNpYmxlKClcbiAgICAgIEBnaXRUaW1lTWFjaGluZVZpZXcuaGlkZSgpXG4gICAgICBAdGltZWxpbmVQYW5lbC5oaWRlKClcbiAgICBlbHNlXG4gICAgICBAdGltZWxpbmVQYW5lbC5zaG93KClcbiAgICAgIEBnaXRUaW1lTWFjaGluZVZpZXcuc2hvdygpXG4gICAgICBAZ2l0VGltZU1hY2hpbmVWaWV3LnNldEVkaXRvciBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcblxuXG4gIF9vbkRpZENoYW5nZUFjdGl2ZVBhbmVJdGVtOiAoZWRpdG9yKSAtPlxuICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgIGlmIEB0aW1lbGluZVBhbmVsLmlzVmlzaWJsZSgpXG4gICAgICBAZ2l0VGltZU1hY2hpbmVWaWV3LnNldEVkaXRvcihlZGl0b3IpXG4gICAgcmV0dXJuXG4iXX0=
