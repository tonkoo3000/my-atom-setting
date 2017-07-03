(function() {
  var CompositeDisposable, CoveringView, NavigationView,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  CompositeDisposable = require('atom').CompositeDisposable;

  CoveringView = require('./covering-view').CoveringView;

  NavigationView = (function(superClass) {
    extend(NavigationView, superClass);

    function NavigationView() {
      return NavigationView.__super__.constructor.apply(this, arguments);
    }

    NavigationView.content = function(navigator, editor) {
      return this.div({
        "class": 'controls navigation'
      }, (function(_this) {
        return function() {
          _this.text(' ');
          return _this.span({
            "class": 'pull-right'
          }, function() {
            _this.button({
              "class": 'btn btn-xs',
              click: 'up',
              outlet: 'prevBtn'
            }, 'prev');
            return _this.button({
              "class": 'btn btn-xs',
              click: 'down',
              outlet: 'nextBtn'
            }, 'next');
          });
        };
      })(this));
    };

    NavigationView.prototype.initialize = function(navigator1, editor) {
      this.navigator = navigator1;
      this.subs = new CompositeDisposable;
      NavigationView.__super__.initialize.call(this, editor);
      this.prependKeystroke('merge-conflicts:previous-unresolved', this.prevBtn);
      this.prependKeystroke('merge-conflicts:next-unresolved', this.nextBtn);
      return this.subs.add(this.navigator.conflict.onDidResolveConflict((function(_this) {
        return function() {
          _this.deleteMarker(_this.cover());
          _this.remove();
          return _this.cleanup();
        };
      })(this)));
    };

    NavigationView.prototype.cleanup = function() {
      NavigationView.__super__.cleanup.apply(this, arguments);
      return this.subs.dispose();
    };

    NavigationView.prototype.cover = function() {
      return this.navigator.separatorMarker;
    };

    NavigationView.prototype.up = function() {
      var ref;
      return this.scrollTo((ref = this.navigator.previousUnresolved()) != null ? ref.scrollTarget() : void 0);
    };

    NavigationView.prototype.down = function() {
      var ref;
      return this.scrollTo((ref = this.navigator.nextUnresolved()) != null ? ref.scrollTarget() : void 0);
    };

    NavigationView.prototype.conflict = function() {
      return this.navigator.conflict;
    };

    NavigationView.prototype.toString = function() {
      return "{NavView of: " + (this.conflict()) + "}";
    };

    return NavigationView;

  })(CoveringView);

  module.exports = {
    NavigationView: NavigationView
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvdG95b2tpLy5hdG9tL3BhY2thZ2VzL21lcmdlLWNvbmZsaWN0cy9saWIvdmlldy9uYXZpZ2F0aW9uLXZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxpREFBQTtJQUFBOzs7RUFBQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVI7O0VBQ3ZCLGVBQWdCLE9BQUEsQ0FBUSxpQkFBUjs7RUFFWDs7Ozs7OztJQUVKLGNBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQyxTQUFELEVBQVksTUFBWjthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7UUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLHFCQUFQO09BQUwsRUFBbUMsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO1VBQ2pDLEtBQUMsQ0FBQSxJQUFELENBQU0sR0FBTjtpQkFDQSxLQUFDLENBQUEsSUFBRCxDQUFNO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxZQUFQO1dBQU4sRUFBMkIsU0FBQTtZQUN6QixLQUFDLENBQUEsTUFBRCxDQUFRO2NBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxZQUFQO2NBQXFCLEtBQUEsRUFBTyxJQUE1QjtjQUFrQyxNQUFBLEVBQVEsU0FBMUM7YUFBUixFQUE2RCxNQUE3RDttQkFDQSxLQUFDLENBQUEsTUFBRCxDQUFRO2NBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxZQUFQO2NBQXFCLEtBQUEsRUFBTyxNQUE1QjtjQUFvQyxNQUFBLEVBQVEsU0FBNUM7YUFBUixFQUErRCxNQUEvRDtVQUZ5QixDQUEzQjtRQUZpQztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbkM7SUFEUTs7NkJBT1YsVUFBQSxHQUFZLFNBQUMsVUFBRCxFQUFhLE1BQWI7TUFBQyxJQUFDLENBQUEsWUFBRDtNQUNYLElBQUMsQ0FBQSxJQUFELEdBQVEsSUFBSTtNQUVaLCtDQUFNLE1BQU47TUFFQSxJQUFDLENBQUEsZ0JBQUQsQ0FBa0IscUNBQWxCLEVBQXlELElBQUMsQ0FBQSxPQUExRDtNQUNBLElBQUMsQ0FBQSxnQkFBRCxDQUFrQixpQ0FBbEIsRUFBcUQsSUFBQyxDQUFBLE9BQXREO2FBRUEsSUFBQyxDQUFBLElBQUksQ0FBQyxHQUFOLENBQVUsSUFBQyxDQUFBLFNBQVMsQ0FBQyxRQUFRLENBQUMsb0JBQXBCLENBQXlDLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtVQUNqRCxLQUFDLENBQUEsWUFBRCxDQUFjLEtBQUMsQ0FBQSxLQUFELENBQUEsQ0FBZDtVQUNBLEtBQUMsQ0FBQSxNQUFELENBQUE7aUJBQ0EsS0FBQyxDQUFBLE9BQUQsQ0FBQTtRQUhpRDtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBekMsQ0FBVjtJQVJVOzs2QkFhWixPQUFBLEdBQVMsU0FBQTtNQUNQLDZDQUFBLFNBQUE7YUFDQSxJQUFDLENBQUEsSUFBSSxDQUFDLE9BQU4sQ0FBQTtJQUZPOzs2QkFJVCxLQUFBLEdBQU8sU0FBQTthQUFHLElBQUMsQ0FBQSxTQUFTLENBQUM7SUFBZDs7NkJBRVAsRUFBQSxHQUFJLFNBQUE7QUFBRyxVQUFBO2FBQUEsSUFBQyxDQUFBLFFBQUQsMERBQXlDLENBQUUsWUFBakMsQ0FBQSxVQUFWO0lBQUg7OzZCQUVKLElBQUEsR0FBTSxTQUFBO0FBQUcsVUFBQTthQUFBLElBQUMsQ0FBQSxRQUFELHNEQUFxQyxDQUFFLFlBQTdCLENBQUEsVUFBVjtJQUFIOzs2QkFFTixRQUFBLEdBQVUsU0FBQTthQUFHLElBQUMsQ0FBQSxTQUFTLENBQUM7SUFBZDs7NkJBRVYsUUFBQSxHQUFVLFNBQUE7YUFBRyxlQUFBLEdBQWUsQ0FBQyxJQUFDLENBQUEsUUFBRCxDQUFBLENBQUQsQ0FBZixHQUE0QjtJQUEvQjs7OztLQWxDaUI7O0VBb0M3QixNQUFNLENBQUMsT0FBUCxHQUNFO0lBQUEsY0FBQSxFQUFnQixjQUFoQjs7QUF4Q0YiLCJzb3VyY2VzQ29udGVudCI6WyJ7Q29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xue0NvdmVyaW5nVmlld30gPSByZXF1aXJlICcuL2NvdmVyaW5nLXZpZXcnXG5cbmNsYXNzIE5hdmlnYXRpb25WaWV3IGV4dGVuZHMgQ292ZXJpbmdWaWV3XG5cbiAgQGNvbnRlbnQ6IChuYXZpZ2F0b3IsIGVkaXRvcikgLT5cbiAgICBAZGl2IGNsYXNzOiAnY29udHJvbHMgbmF2aWdhdGlvbicsID0+XG4gICAgICBAdGV4dCAnICdcbiAgICAgIEBzcGFuIGNsYXNzOiAncHVsbC1yaWdodCcsID0+XG4gICAgICAgIEBidXR0b24gY2xhc3M6ICdidG4gYnRuLXhzJywgY2xpY2s6ICd1cCcsIG91dGxldDogJ3ByZXZCdG4nLCAncHJldidcbiAgICAgICAgQGJ1dHRvbiBjbGFzczogJ2J0biBidG4teHMnLCBjbGljazogJ2Rvd24nLCBvdXRsZXQ6ICduZXh0QnRuJywgJ25leHQnXG5cbiAgaW5pdGlhbGl6ZTogKEBuYXZpZ2F0b3IsIGVkaXRvcikgLT5cbiAgICBAc3VicyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG5cbiAgICBzdXBlciBlZGl0b3JcblxuICAgIEBwcmVwZW5kS2V5c3Ryb2tlICdtZXJnZS1jb25mbGljdHM6cHJldmlvdXMtdW5yZXNvbHZlZCcsIEBwcmV2QnRuXG4gICAgQHByZXBlbmRLZXlzdHJva2UgJ21lcmdlLWNvbmZsaWN0czpuZXh0LXVucmVzb2x2ZWQnLCBAbmV4dEJ0blxuXG4gICAgQHN1YnMuYWRkIEBuYXZpZ2F0b3IuY29uZmxpY3Qub25EaWRSZXNvbHZlQ29uZmxpY3QgPT5cbiAgICAgIEBkZWxldGVNYXJrZXIgQGNvdmVyKClcbiAgICAgIEByZW1vdmUoKVxuICAgICAgQGNsZWFudXAoKVxuXG4gIGNsZWFudXA6IC0+XG4gICAgc3VwZXJcbiAgICBAc3Vicy5kaXNwb3NlKClcblxuICBjb3ZlcjogLT4gQG5hdmlnYXRvci5zZXBhcmF0b3JNYXJrZXJcblxuICB1cDogLT4gQHNjcm9sbFRvIEBuYXZpZ2F0b3IucHJldmlvdXNVbnJlc29sdmVkKCk/LnNjcm9sbFRhcmdldCgpXG5cbiAgZG93bjogLT4gQHNjcm9sbFRvIEBuYXZpZ2F0b3IubmV4dFVucmVzb2x2ZWQoKT8uc2Nyb2xsVGFyZ2V0KClcblxuICBjb25mbGljdDogLT4gQG5hdmlnYXRvci5jb25mbGljdFxuXG4gIHRvU3RyaW5nOiAtPiBcIntOYXZWaWV3IG9mOiAje0Bjb25mbGljdCgpfX1cIlxuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIE5hdmlnYXRpb25WaWV3OiBOYXZpZ2F0aW9uVmlld1xuIl19
