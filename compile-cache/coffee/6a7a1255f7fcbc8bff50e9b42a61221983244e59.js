(function() {
  var $, CompositeDisposable;

  $ = require('jquery');

  CompositeDisposable = require('atom').CompositeDisposable;

  module.exports = {
    subscriptions: null,
    activate: function(state) {
      this.subscriptions = new CompositeDisposable;
      return this.subscriptions.add(atom.commands.add('atom-workspace', {
        'maximize-panes:maximize': (function(_this) {
          return function() {
            return _this.maximize();
          };
        })(this)
      }));
    },
    maximize: function() {
      return $('html').toggleClass('maximize-pane-on');
    },
    deactivate: function() {
      return this.subscriptions.dispose();
    },
    serialize: function() {}
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvdG95b2tpLy5hdG9tL3BhY2thZ2VzL21heGltaXplLXBhbmVzL2xpYi9tYXhpbWl6ZS1wYW5lcy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsUUFBUjs7RUFDSCxzQkFBdUIsT0FBQSxDQUFRLE1BQVI7O0VBRXhCLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7SUFBQSxhQUFBLEVBQWUsSUFBZjtJQUVBLFFBQUEsRUFBVSxTQUFDLEtBQUQ7TUFDUixJQUFDLENBQUEsYUFBRCxHQUFpQixJQUFJO2FBQ3JCLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsZ0JBQWxCLEVBQW9DO1FBQUEseUJBQUEsRUFBMkIsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTttQkFBRyxLQUFDLENBQUEsUUFBRCxDQUFBO1VBQUg7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTNCO09BQXBDLENBQW5CO0lBRlEsQ0FGVjtJQU1BLFFBQUEsRUFBVSxTQUFBO2FBQ1IsQ0FBQSxDQUFFLE1BQUYsQ0FBUyxDQUFDLFdBQVYsQ0FBc0Isa0JBQXRCO0lBRFEsQ0FOVjtJQVNBLFVBQUEsRUFBWSxTQUFBO2FBQ1YsSUFBQyxDQUFBLGFBQWEsQ0FBQyxPQUFmLENBQUE7SUFEVSxDQVRaO0lBWUEsU0FBQSxFQUFXLFNBQUEsR0FBQSxDQVpYOztBQUpGIiwic291cmNlc0NvbnRlbnQiOlsiJCA9IHJlcXVpcmUgJ2pxdWVyeSdcbntDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgc3Vic2NyaXB0aW9uczogbnVsbFxuXG4gIGFjdGl2YXRlOiAoc3RhdGUpIC0+XG4gICAgQHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLCAnbWF4aW1pemUtcGFuZXM6bWF4aW1pemUnOiA9PiBAbWF4aW1pemUoKVxuXG4gIG1heGltaXplOiAtPlxuICAgICQoJ2h0bWwnKS50b2dnbGVDbGFzcygnbWF4aW1pemUtcGFuZS1vbicpXG5cbiAgZGVhY3RpdmF0ZTogLT5cbiAgICBAc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcblxuICBzZXJpYWxpemU6IC0+XG4iXX0=
