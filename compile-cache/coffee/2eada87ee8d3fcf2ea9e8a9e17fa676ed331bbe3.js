(function() {
  var CompositeDisposable, MinimapPigmentsBinding;

  CompositeDisposable = require('event-kit').CompositeDisposable;

  MinimapPigmentsBinding = require('./minimap-pigments-binding');

  module.exports = {
    active: false,
    isActive: function() {
      return this.active;
    },
    activate: function(state) {
      this.bindingsById = {};
      this.subscriptionsById = {};
      return this.subscriptions = new CompositeDisposable;
    },
    consumeMinimapServiceV1: function(minimap1) {
      this.minimap = minimap1;
      return this.minimap.registerPlugin('pigments', this);
    },
    consumePigmentsServiceV1: function(pigments) {
      this.pigments = pigments;
      this.subscriptions.add(this.pigments.getProject().onDidDestroy((function(_this) {
        return function() {
          return _this.pigments = null;
        };
      })(this)));
      if ((this.minimap != null) && this.active) {
        return this.initializeBindings();
      }
    },
    deactivate: function() {
      this.subscriptions.dispose();
      this.editorsSubscription.dispose();
      this.minimap.unregisterPlugin('pigments');
      this.minimap = null;
      return this.pigments = null;
    },
    activatePlugin: function() {
      if (this.active) {
        return;
      }
      this.active = true;
      if (this.pigments != null) {
        return this.initializeBindings();
      }
    },
    initializeBindings: function() {
      return this.editorsSubscription = this.pigments.observeColorBuffers((function(_this) {
        return function(colorBuffer) {
          var binding, editor, minimap;
          editor = colorBuffer.editor;
          minimap = _this.minimap.minimapForEditor(editor);
          binding = new MinimapPigmentsBinding({
            editor: editor,
            minimap: minimap,
            colorBuffer: colorBuffer
          });
          _this.bindingsById[editor.id] = binding;
          return _this.subscriptionsById[editor.id] = editor.onDidDestroy(function() {
            var ref;
            if ((ref = _this.subscriptionsById[editor.id]) != null) {
              ref.dispose();
            }
            binding.destroy();
            delete _this.subscriptionsById[editor.id];
            return delete _this.bindingsById[editor.id];
          });
        };
      })(this));
    },
    bindingForEditor: function(editor) {
      if (this.bindingsById[editor.id] != null) {
        return this.bindingsById[editor.id];
      }
    },
    deactivatePlugin: function() {
      var binding, id, ref, ref1;
      if (!this.active) {
        return;
      }
      ref = this.bindingsById;
      for (id in ref) {
        binding = ref[id];
        binding.destroy();
      }
      this.active = false;
      return (ref1 = this.editorsSubscription) != null ? ref1.dispose() : void 0;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvdG95b2tpLy5hdG9tL3BhY2thZ2VzL21pbmltYXAtcGlnbWVudHMvbGliL21pbmltYXAtcGlnbWVudHMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQyxzQkFBdUIsT0FBQSxDQUFRLFdBQVI7O0VBQ3hCLHNCQUFBLEdBQXlCLE9BQUEsQ0FBUSw0QkFBUjs7RUFFekIsTUFBTSxDQUFDLE9BQVAsR0FDRTtJQUFBLE1BQUEsRUFBUSxLQUFSO0lBRUEsUUFBQSxFQUFVLFNBQUE7YUFBRyxJQUFDLENBQUE7SUFBSixDQUZWO0lBSUEsUUFBQSxFQUFVLFNBQUMsS0FBRDtNQUNSLElBQUMsQ0FBQSxZQUFELEdBQWdCO01BQ2hCLElBQUMsQ0FBQSxpQkFBRCxHQUFxQjthQUNyQixJQUFDLENBQUEsYUFBRCxHQUFpQixJQUFJO0lBSGIsQ0FKVjtJQVNBLHVCQUFBLEVBQXlCLFNBQUMsUUFBRDtNQUFDLElBQUMsQ0FBQSxVQUFEO2FBQ3hCLElBQUMsQ0FBQSxPQUFPLENBQUMsY0FBVCxDQUF3QixVQUF4QixFQUFvQyxJQUFwQztJQUR1QixDQVR6QjtJQVlBLHdCQUFBLEVBQTBCLFNBQUMsUUFBRDtNQUFDLElBQUMsQ0FBQSxXQUFEO01BQ3pCLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFDLENBQUEsUUFBUSxDQUFDLFVBQVYsQ0FBQSxDQUFzQixDQUFDLFlBQXZCLENBQW9DLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtpQkFBRyxLQUFDLENBQUEsUUFBRCxHQUFZO1FBQWY7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXBDLENBQW5CO01BRUEsSUFBeUIsc0JBQUEsSUFBYyxJQUFDLENBQUEsTUFBeEM7ZUFBQSxJQUFDLENBQUEsa0JBQUQsQ0FBQSxFQUFBOztJQUh3QixDQVoxQjtJQWlCQSxVQUFBLEVBQVksU0FBQTtNQUNWLElBQUMsQ0FBQSxhQUFhLENBQUMsT0FBZixDQUFBO01BQ0EsSUFBQyxDQUFBLG1CQUFtQixDQUFDLE9BQXJCLENBQUE7TUFDQSxJQUFDLENBQUEsT0FBTyxDQUFDLGdCQUFULENBQTBCLFVBQTFCO01BQ0EsSUFBQyxDQUFBLE9BQUQsR0FBVzthQUNYLElBQUMsQ0FBQSxRQUFELEdBQVk7SUFMRixDQWpCWjtJQXdCQSxjQUFBLEVBQWdCLFNBQUE7TUFDZCxJQUFVLElBQUMsQ0FBQSxNQUFYO0FBQUEsZUFBQTs7TUFFQSxJQUFDLENBQUEsTUFBRCxHQUFVO01BRVYsSUFBeUIscUJBQXpCO2VBQUEsSUFBQyxDQUFBLGtCQUFELENBQUEsRUFBQTs7SUFMYyxDQXhCaEI7SUErQkEsa0JBQUEsRUFBb0IsU0FBQTthQUNsQixJQUFDLENBQUEsbUJBQUQsR0FBdUIsSUFBQyxDQUFBLFFBQVEsQ0FBQyxtQkFBVixDQUE4QixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsV0FBRDtBQUNuRCxjQUFBO1VBQUEsTUFBQSxHQUFTLFdBQVcsQ0FBQztVQUNyQixPQUFBLEdBQVUsS0FBQyxDQUFBLE9BQU8sQ0FBQyxnQkFBVCxDQUEwQixNQUExQjtVQUVWLE9BQUEsR0FBYyxJQUFBLHNCQUFBLENBQXVCO1lBQUMsUUFBQSxNQUFEO1lBQVMsU0FBQSxPQUFUO1lBQWtCLGFBQUEsV0FBbEI7V0FBdkI7VUFDZCxLQUFDLENBQUEsWUFBYSxDQUFBLE1BQU0sQ0FBQyxFQUFQLENBQWQsR0FBMkI7aUJBRTNCLEtBQUMsQ0FBQSxpQkFBa0IsQ0FBQSxNQUFNLENBQUMsRUFBUCxDQUFuQixHQUFnQyxNQUFNLENBQUMsWUFBUCxDQUFvQixTQUFBO0FBQ2xELGdCQUFBOztpQkFBNkIsQ0FBRSxPQUEvQixDQUFBOztZQUNBLE9BQU8sQ0FBQyxPQUFSLENBQUE7WUFDQSxPQUFPLEtBQUMsQ0FBQSxpQkFBa0IsQ0FBQSxNQUFNLENBQUMsRUFBUDttQkFDMUIsT0FBTyxLQUFDLENBQUEsWUFBYSxDQUFBLE1BQU0sQ0FBQyxFQUFQO1VBSjZCLENBQXBCO1FBUG1CO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE5QjtJQURMLENBL0JwQjtJQTZDQSxnQkFBQSxFQUFrQixTQUFDLE1BQUQ7TUFDaEIsSUFBbUMsb0NBQW5DO0FBQUEsZUFBTyxJQUFDLENBQUEsWUFBYSxDQUFBLE1BQU0sQ0FBQyxFQUFQLEVBQXJCOztJQURnQixDQTdDbEI7SUFnREEsZ0JBQUEsRUFBa0IsU0FBQTtBQUNoQixVQUFBO01BQUEsSUFBQSxDQUFjLElBQUMsQ0FBQSxNQUFmO0FBQUEsZUFBQTs7QUFFQTtBQUFBLFdBQUEsU0FBQTs7UUFBQSxPQUFPLENBQUMsT0FBUixDQUFBO0FBQUE7TUFFQSxJQUFDLENBQUEsTUFBRCxHQUFVOzZEQUNVLENBQUUsT0FBdEIsQ0FBQTtJQU5nQixDQWhEbEI7O0FBSkYiLCJzb3VyY2VzQ29udGVudCI6WyJ7Q29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdldmVudC1raXQnXG5NaW5pbWFwUGlnbWVudHNCaW5kaW5nID0gcmVxdWlyZSAnLi9taW5pbWFwLXBpZ21lbnRzLWJpbmRpbmcnXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgYWN0aXZlOiBmYWxzZVxuXG4gIGlzQWN0aXZlOiAtPiBAYWN0aXZlXG5cbiAgYWN0aXZhdGU6IChzdGF0ZSkgLT5cbiAgICBAYmluZGluZ3NCeUlkID0ge31cbiAgICBAc3Vic2NyaXB0aW9uc0J5SWQgPSB7fVxuICAgIEBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcblxuICBjb25zdW1lTWluaW1hcFNlcnZpY2VWMTogKEBtaW5pbWFwKSAtPlxuICAgIEBtaW5pbWFwLnJlZ2lzdGVyUGx1Z2luICdwaWdtZW50cycsIHRoaXNcblxuICBjb25zdW1lUGlnbWVudHNTZXJ2aWNlVjE6IChAcGlnbWVudHMpIC0+XG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIEBwaWdtZW50cy5nZXRQcm9qZWN0KCkub25EaWREZXN0cm95ID0+IEBwaWdtZW50cyA9IG51bGxcblxuICAgIEBpbml0aWFsaXplQmluZGluZ3MoKSBpZiBAbWluaW1hcD8gYW5kIEBhY3RpdmVcblxuICBkZWFjdGl2YXRlOiAtPlxuICAgIEBzdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgIEBlZGl0b3JzU3Vic2NyaXB0aW9uLmRpc3Bvc2UoKVxuICAgIEBtaW5pbWFwLnVucmVnaXN0ZXJQbHVnaW4gJ3BpZ21lbnRzJ1xuICAgIEBtaW5pbWFwID0gbnVsbFxuICAgIEBwaWdtZW50cyA9IG51bGxcblxuICBhY3RpdmF0ZVBsdWdpbjogLT5cbiAgICByZXR1cm4gaWYgQGFjdGl2ZVxuXG4gICAgQGFjdGl2ZSA9IHRydWVcblxuICAgIEBpbml0aWFsaXplQmluZGluZ3MoKSBpZiBAcGlnbWVudHM/XG5cbiAgaW5pdGlhbGl6ZUJpbmRpbmdzOiAtPlxuICAgIEBlZGl0b3JzU3Vic2NyaXB0aW9uID0gQHBpZ21lbnRzLm9ic2VydmVDb2xvckJ1ZmZlcnMgKGNvbG9yQnVmZmVyKSA9PlxuICAgICAgZWRpdG9yID0gY29sb3JCdWZmZXIuZWRpdG9yXG4gICAgICBtaW5pbWFwID0gQG1pbmltYXAubWluaW1hcEZvckVkaXRvcihlZGl0b3IpXG5cbiAgICAgIGJpbmRpbmcgPSBuZXcgTWluaW1hcFBpZ21lbnRzQmluZGluZyh7ZWRpdG9yLCBtaW5pbWFwLCBjb2xvckJ1ZmZlcn0pXG4gICAgICBAYmluZGluZ3NCeUlkW2VkaXRvci5pZF0gPSBiaW5kaW5nXG5cbiAgICAgIEBzdWJzY3JpcHRpb25zQnlJZFtlZGl0b3IuaWRdID0gZWRpdG9yLm9uRGlkRGVzdHJveSA9PlxuICAgICAgICBAc3Vic2NyaXB0aW9uc0J5SWRbZWRpdG9yLmlkXT8uZGlzcG9zZSgpXG4gICAgICAgIGJpbmRpbmcuZGVzdHJveSgpXG4gICAgICAgIGRlbGV0ZSBAc3Vic2NyaXB0aW9uc0J5SWRbZWRpdG9yLmlkXVxuICAgICAgICBkZWxldGUgQGJpbmRpbmdzQnlJZFtlZGl0b3IuaWRdXG5cbiAgYmluZGluZ0ZvckVkaXRvcjogKGVkaXRvcikgLT5cbiAgICByZXR1cm4gQGJpbmRpbmdzQnlJZFtlZGl0b3IuaWRdIGlmIEBiaW5kaW5nc0J5SWRbZWRpdG9yLmlkXT9cblxuICBkZWFjdGl2YXRlUGx1Z2luOiAtPlxuICAgIHJldHVybiB1bmxlc3MgQGFjdGl2ZVxuXG4gICAgYmluZGluZy5kZXN0cm95KCkgZm9yIGlkLGJpbmRpbmcgb2YgQGJpbmRpbmdzQnlJZFxuXG4gICAgQGFjdGl2ZSA9IGZhbHNlXG4gICAgQGVkaXRvcnNTdWJzY3JpcHRpb24/LmRpc3Bvc2UoKVxuIl19
