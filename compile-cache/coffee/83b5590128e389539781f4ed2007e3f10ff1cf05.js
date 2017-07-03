(function() {
  var CompositeDisposable, MinimapBookmarksBinding, requirePackages;

  CompositeDisposable = require('atom').CompositeDisposable;

  requirePackages = require('atom-utils').requirePackages;

  MinimapBookmarksBinding = null;

  module.exports = {
    active: false,
    isActive: function() {
      return this.active;
    },
    bindings: {},
    activate: function(state) {},
    consumeMinimapServiceV1: function(minimap1) {
      this.minimap = minimap1;
      return this.minimap.registerPlugin('bookmarks', this);
    },
    deactivate: function() {
      var ref;
      if ((ref = this.minimap) != null) {
        ref.unregisterPlugin('bookmarks');
      }
      return this.minimap = null;
    },
    activatePlugin: function() {
      if (this.active) {
        return;
      }
      return requirePackages('bookmarks').then((function(_this) {
        return function(arg) {
          var bookmarks;
          bookmarks = arg[0];
          _this.subscriptions = new CompositeDisposable;
          _this.active = true;
          return _this.minimapsSubscription = _this.minimap.observeMinimaps(function(minimap) {
            var binding, subscription;
            if (MinimapBookmarksBinding == null) {
              MinimapBookmarksBinding = require('./minimap-bookmarks-binding');
            }
            binding = new MinimapBookmarksBinding(minimap, bookmarks);
            _this.bindings[minimap.id] = binding;
            return _this.subscriptions.add(subscription = minimap.onDidDestroy(function() {
              binding.destroy();
              _this.subscriptions.remove(subscription);
              subscription.dispose();
              return delete _this.bindings[minimap.id];
            }));
          });
        };
      })(this));
    },
    deactivatePlugin: function() {
      var binding, id, ref;
      if (!this.active) {
        return;
      }
      ref = this.bindings;
      for (id in ref) {
        binding = ref[id];
        binding.destroy();
      }
      this.bindings = {};
      this.active = false;
      this.minimapsSubscription.dispose();
      return this.subscriptions.dispose();
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvdG95b2tpLy5hdG9tL3BhY2thZ2VzL21pbmltYXAtYm9va21hcmtzL2xpYi9taW5pbWFwLWJvb2ttYXJrcy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFDLHNCQUF1QixPQUFBLENBQVEsTUFBUjs7RUFDdkIsa0JBQW1CLE9BQUEsQ0FBUSxZQUFSOztFQUVwQix1QkFBQSxHQUEwQjs7RUFFMUIsTUFBTSxDQUFDLE9BQVAsR0FDRTtJQUFBLE1BQUEsRUFBUSxLQUFSO0lBRUEsUUFBQSxFQUFVLFNBQUE7YUFBRyxJQUFDLENBQUE7SUFBSixDQUZWO0lBSUEsUUFBQSxFQUFVLEVBSlY7SUFNQSxRQUFBLEVBQVUsU0FBQyxLQUFELEdBQUEsQ0FOVjtJQVFBLHVCQUFBLEVBQXlCLFNBQUMsUUFBRDtNQUFDLElBQUMsQ0FBQSxVQUFEO2FBQ3hCLElBQUMsQ0FBQSxPQUFPLENBQUMsY0FBVCxDQUF3QixXQUF4QixFQUFxQyxJQUFyQztJQUR1QixDQVJ6QjtJQVdBLFVBQUEsRUFBWSxTQUFBO0FBQ1YsVUFBQTs7V0FBUSxDQUFFLGdCQUFWLENBQTJCLFdBQTNCOzthQUNBLElBQUMsQ0FBQSxPQUFELEdBQVc7SUFGRCxDQVhaO0lBZUEsY0FBQSxFQUFnQixTQUFBO01BQ2QsSUFBVSxJQUFDLENBQUEsTUFBWDtBQUFBLGVBQUE7O2FBRUEsZUFBQSxDQUFnQixXQUFoQixDQUE0QixDQUFDLElBQTdCLENBQWtDLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxHQUFEO0FBQ2hDLGNBQUE7VUFEa0MsWUFBRDtVQUNqQyxLQUFDLENBQUEsYUFBRCxHQUFpQixJQUFJO1VBQ3JCLEtBQUMsQ0FBQSxNQUFELEdBQVU7aUJBRVYsS0FBQyxDQUFBLG9CQUFELEdBQXdCLEtBQUMsQ0FBQSxPQUFPLENBQUMsZUFBVCxDQUF5QixTQUFDLE9BQUQ7QUFDL0MsZ0JBQUE7O2NBQUEsMEJBQTJCLE9BQUEsQ0FBUSw2QkFBUjs7WUFDM0IsT0FBQSxHQUFjLElBQUEsdUJBQUEsQ0FBd0IsT0FBeEIsRUFBaUMsU0FBakM7WUFDZCxLQUFDLENBQUEsUUFBUyxDQUFBLE9BQU8sQ0FBQyxFQUFSLENBQVYsR0FBd0I7bUJBRXhCLEtBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixZQUFBLEdBQWUsT0FBTyxDQUFDLFlBQVIsQ0FBcUIsU0FBQTtjQUNyRCxPQUFPLENBQUMsT0FBUixDQUFBO2NBQ0EsS0FBQyxDQUFBLGFBQWEsQ0FBQyxNQUFmLENBQXNCLFlBQXRCO2NBQ0EsWUFBWSxDQUFDLE9BQWIsQ0FBQTtxQkFDQSxPQUFPLEtBQUMsQ0FBQSxRQUFTLENBQUEsT0FBTyxDQUFDLEVBQVI7WUFKb0MsQ0FBckIsQ0FBbEM7VUFMK0MsQ0FBekI7UUFKUTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbEM7SUFIYyxDQWZoQjtJQWlDQSxnQkFBQSxFQUFrQixTQUFBO0FBQ2hCLFVBQUE7TUFBQSxJQUFBLENBQWMsSUFBQyxDQUFBLE1BQWY7QUFBQSxlQUFBOztBQUVBO0FBQUEsV0FBQSxTQUFBOztRQUFBLE9BQU8sQ0FBQyxPQUFSLENBQUE7QUFBQTtNQUNBLElBQUMsQ0FBQSxRQUFELEdBQVk7TUFDWixJQUFDLENBQUEsTUFBRCxHQUFVO01BQ1YsSUFBQyxDQUFBLG9CQUFvQixDQUFDLE9BQXRCLENBQUE7YUFDQSxJQUFDLENBQUEsYUFBYSxDQUFDLE9BQWYsQ0FBQTtJQVBnQixDQWpDbEI7O0FBTkYiLCJzb3VyY2VzQ29udGVudCI6WyJ7Q29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xue3JlcXVpcmVQYWNrYWdlc30gPSByZXF1aXJlICdhdG9tLXV0aWxzJ1xuXG5NaW5pbWFwQm9va21hcmtzQmluZGluZyA9IG51bGxcblxubW9kdWxlLmV4cG9ydHMgPVxuICBhY3RpdmU6IGZhbHNlXG5cbiAgaXNBY3RpdmU6IC0+IEBhY3RpdmVcblxuICBiaW5kaW5nczoge31cblxuICBhY3RpdmF0ZTogKHN0YXRlKSAtPlxuXG4gIGNvbnN1bWVNaW5pbWFwU2VydmljZVYxOiAoQG1pbmltYXApIC0+XG4gICAgQG1pbmltYXAucmVnaXN0ZXJQbHVnaW4gJ2Jvb2ttYXJrcycsIHRoaXNcblxuICBkZWFjdGl2YXRlOiAtPlxuICAgIEBtaW5pbWFwPy51bnJlZ2lzdGVyUGx1Z2luICdib29rbWFya3MnXG4gICAgQG1pbmltYXAgPSBudWxsXG5cbiAgYWN0aXZhdGVQbHVnaW46IC0+XG4gICAgcmV0dXJuIGlmIEBhY3RpdmVcblxuICAgIHJlcXVpcmVQYWNrYWdlcygnYm9va21hcmtzJykudGhlbiAoW2Jvb2ttYXJrc10pID0+XG4gICAgICBAc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgICBAYWN0aXZlID0gdHJ1ZVxuXG4gICAgICBAbWluaW1hcHNTdWJzY3JpcHRpb24gPSBAbWluaW1hcC5vYnNlcnZlTWluaW1hcHMgKG1pbmltYXApID0+XG4gICAgICAgIE1pbmltYXBCb29rbWFya3NCaW5kaW5nID89IHJlcXVpcmUgJy4vbWluaW1hcC1ib29rbWFya3MtYmluZGluZydcbiAgICAgICAgYmluZGluZyA9IG5ldyBNaW5pbWFwQm9va21hcmtzQmluZGluZyhtaW5pbWFwLCBib29rbWFya3MpXG4gICAgICAgIEBiaW5kaW5nc1ttaW5pbWFwLmlkXSA9IGJpbmRpbmdcblxuICAgICAgICBAc3Vic2NyaXB0aW9ucy5hZGQgc3Vic2NyaXB0aW9uID0gbWluaW1hcC5vbkRpZERlc3Ryb3kgPT5cbiAgICAgICAgICBiaW5kaW5nLmRlc3Ryb3koKVxuICAgICAgICAgIEBzdWJzY3JpcHRpb25zLnJlbW92ZShzdWJzY3JpcHRpb24pXG4gICAgICAgICAgc3Vic2NyaXB0aW9uLmRpc3Bvc2UoKVxuICAgICAgICAgIGRlbGV0ZSBAYmluZGluZ3NbbWluaW1hcC5pZF1cblxuICBkZWFjdGl2YXRlUGx1Z2luOiAtPlxuICAgIHJldHVybiB1bmxlc3MgQGFjdGl2ZVxuXG4gICAgYmluZGluZy5kZXN0cm95KCkgZm9yIGlkLGJpbmRpbmcgb2YgQGJpbmRpbmdzXG4gICAgQGJpbmRpbmdzID0ge31cbiAgICBAYWN0aXZlID0gZmFsc2VcbiAgICBAbWluaW1hcHNTdWJzY3JpcHRpb24uZGlzcG9zZSgpXG4gICAgQHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4iXX0=
