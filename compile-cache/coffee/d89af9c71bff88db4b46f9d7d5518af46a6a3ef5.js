(function() {
  var GitNotFoundErrorView, View,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  View = require('space-pen').View;

  GitNotFoundErrorView = (function(superClass) {
    extend(GitNotFoundErrorView, superClass);

    function GitNotFoundErrorView() {
      return GitNotFoundErrorView.__super__.constructor.apply(this, arguments);
    }

    GitNotFoundErrorView.content = function(err) {
      return this.div({
        "class": 'overlay from-top padded merge-conflict-error merge-conflicts-message'
      }, (function(_this) {
        return function() {
          return _this.div({
            "class": 'panel'
          }, function() {
            _this.div({
              "class": 'panel-heading no-path'
            }, function() {
              _this.code('git');
              return _this.text("can't be found in any of the default locations!");
            });
            _this.div({
              "class": 'panel-heading wrong-path'
            }, function() {
              _this.code('git');
              _this.text("can't be found at ");
              _this.code(atom.config.get('merge-conflicts.gitPath'));
              return _this.text('!');
            });
            return _this.div({
              "class": 'panel-body'
            }, function() {
              _this.div({
                "class": 'block'
              }, 'Please specify the correct path in the merge-conflicts package settings.');
              return _this.div({
                "class": 'block'
              }, function() {
                _this.button({
                  "class": 'btn btn-error inline-block-tight',
                  click: 'openSettings'
                }, 'Open Settings');
                return _this.button({
                  "class": 'btn inline-block-tight',
                  click: 'notRightNow'
                }, 'Not Right Now');
              });
            });
          });
        };
      })(this));
    };

    GitNotFoundErrorView.prototype.initialize = function(err) {
      if (atom.config.get('merge-conflicts.gitPath')) {
        this.find('.no-path').hide();
        return this.find('.wrong-path').show();
      } else {
        this.find('.no-path').show();
        return this.find('.wrong-path').hide();
      }
    };

    GitNotFoundErrorView.prototype.openSettings = function() {
      atom.workspace.open('atom://config/packages');
      return this.remove();
    };

    GitNotFoundErrorView.prototype.notRightNow = function() {
      return this.remove();
    };

    return GitNotFoundErrorView;

  })(View);

  module.exports = {
    handleErr: function(err) {
      if (err == null) {
        return false;
      }
      if (err.isGitError) {
        atom.workspace.addTopPanel({
          item: new GitNotFoundErrorView(err)
        });
      } else {
        atom.notifications.addError(err.message);
        console.error(err.message, err.trace);
      }
      return true;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvdG95b2tpLy5hdG9tL3BhY2thZ2VzL21lcmdlLWNvbmZsaWN0cy9saWIvdmlldy9lcnJvci12aWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsMEJBQUE7SUFBQTs7O0VBQUMsT0FBUSxPQUFBLENBQVEsV0FBUjs7RUFFSDs7Ozs7OztJQUVKLG9CQUFDLENBQUEsT0FBRCxHQUFVLFNBQUMsR0FBRDthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7UUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLHNFQUFQO09BQUwsRUFBb0YsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUNsRixLQUFDLENBQUEsR0FBRCxDQUFLO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxPQUFQO1dBQUwsRUFBcUIsU0FBQTtZQUNuQixLQUFDLENBQUEsR0FBRCxDQUFLO2NBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyx1QkFBUDthQUFMLEVBQXFDLFNBQUE7Y0FDbkMsS0FBQyxDQUFBLElBQUQsQ0FBTSxLQUFOO3FCQUNBLEtBQUMsQ0FBQSxJQUFELENBQU0saURBQU47WUFGbUMsQ0FBckM7WUFHQSxLQUFDLENBQUEsR0FBRCxDQUFLO2NBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTywwQkFBUDthQUFMLEVBQXdDLFNBQUE7Y0FDdEMsS0FBQyxDQUFBLElBQUQsQ0FBTSxLQUFOO2NBQ0EsS0FBQyxDQUFBLElBQUQsQ0FBTSxvQkFBTjtjQUNBLEtBQUMsQ0FBQSxJQUFELENBQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHlCQUFoQixDQUFOO3FCQUNBLEtBQUMsQ0FBQSxJQUFELENBQU0sR0FBTjtZQUpzQyxDQUF4QzttQkFLQSxLQUFDLENBQUEsR0FBRCxDQUFLO2NBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxZQUFQO2FBQUwsRUFBMEIsU0FBQTtjQUN4QixLQUFDLENBQUEsR0FBRCxDQUFLO2dCQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sT0FBUDtlQUFMLEVBQ0UsMEVBREY7cUJBRUEsS0FBQyxDQUFBLEdBQUQsQ0FBSztnQkFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLE9BQVA7ZUFBTCxFQUFxQixTQUFBO2dCQUNuQixLQUFDLENBQUEsTUFBRCxDQUFRO2tCQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sa0NBQVA7a0JBQTJDLEtBQUEsRUFBTyxjQUFsRDtpQkFBUixFQUEwRSxlQUExRTt1QkFDQSxLQUFDLENBQUEsTUFBRCxDQUFRO2tCQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sd0JBQVA7a0JBQWlDLEtBQUEsRUFBTyxhQUF4QztpQkFBUixFQUErRCxlQUEvRDtjQUZtQixDQUFyQjtZQUh3QixDQUExQjtVQVRtQixDQUFyQjtRQURrRjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBcEY7SUFEUTs7bUNBa0JWLFVBQUEsR0FBWSxTQUFDLEdBQUQ7TUFDVixJQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQix5QkFBaEIsQ0FBSDtRQUNFLElBQUMsQ0FBQSxJQUFELENBQU0sVUFBTixDQUFpQixDQUFDLElBQWxCLENBQUE7ZUFDQSxJQUFDLENBQUEsSUFBRCxDQUFNLGFBQU4sQ0FBb0IsQ0FBQyxJQUFyQixDQUFBLEVBRkY7T0FBQSxNQUFBO1FBSUUsSUFBQyxDQUFBLElBQUQsQ0FBTSxVQUFOLENBQWlCLENBQUMsSUFBbEIsQ0FBQTtlQUNBLElBQUMsQ0FBQSxJQUFELENBQU0sYUFBTixDQUFvQixDQUFDLElBQXJCLENBQUEsRUFMRjs7SUFEVTs7bUNBUVosWUFBQSxHQUFjLFNBQUE7TUFDWixJQUFJLENBQUMsU0FBUyxDQUFDLElBQWYsQ0FBb0Isd0JBQXBCO2FBQ0EsSUFBQyxDQUFBLE1BQUQsQ0FBQTtJQUZZOzttQ0FJZCxXQUFBLEdBQWEsU0FBQTthQUNYLElBQUMsQ0FBQSxNQUFELENBQUE7SUFEVzs7OztLQWhDb0I7O0VBbUNuQyxNQUFNLENBQUMsT0FBUCxHQUNFO0lBQUEsU0FBQSxFQUFXLFNBQUMsR0FBRDtNQUNULElBQW9CLFdBQXBCO0FBQUEsZUFBTyxNQUFQOztNQUVBLElBQUcsR0FBRyxDQUFDLFVBQVA7UUFDRSxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQWYsQ0FBMkI7VUFBQSxJQUFBLEVBQVUsSUFBQSxvQkFBQSxDQUFxQixHQUFyQixDQUFWO1NBQTNCLEVBREY7T0FBQSxNQUFBO1FBR0UsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFuQixDQUE0QixHQUFHLENBQUMsT0FBaEM7UUFDQSxPQUFPLENBQUMsS0FBUixDQUFjLEdBQUcsQ0FBQyxPQUFsQixFQUEyQixHQUFHLENBQUMsS0FBL0IsRUFKRjs7YUFLQTtJQVJTLENBQVg7O0FBdENGIiwic291cmNlc0NvbnRlbnQiOlsie1ZpZXd9ID0gcmVxdWlyZSAnc3BhY2UtcGVuJ1xuXG5jbGFzcyBHaXROb3RGb3VuZEVycm9yVmlldyBleHRlbmRzIFZpZXdcblxuICBAY29udGVudDogKGVycikgLT5cbiAgICBAZGl2IGNsYXNzOiAnb3ZlcmxheSBmcm9tLXRvcCBwYWRkZWQgbWVyZ2UtY29uZmxpY3QtZXJyb3IgbWVyZ2UtY29uZmxpY3RzLW1lc3NhZ2UnLCA9PlxuICAgICAgQGRpdiBjbGFzczogJ3BhbmVsJywgPT5cbiAgICAgICAgQGRpdiBjbGFzczogJ3BhbmVsLWhlYWRpbmcgbm8tcGF0aCcsID0+XG4gICAgICAgICAgQGNvZGUgJ2dpdCdcbiAgICAgICAgICBAdGV4dCBcImNhbid0IGJlIGZvdW5kIGluIGFueSBvZiB0aGUgZGVmYXVsdCBsb2NhdGlvbnMhXCJcbiAgICAgICAgQGRpdiBjbGFzczogJ3BhbmVsLWhlYWRpbmcgd3JvbmctcGF0aCcsID0+XG4gICAgICAgICAgQGNvZGUgJ2dpdCdcbiAgICAgICAgICBAdGV4dCBcImNhbid0IGJlIGZvdW5kIGF0IFwiXG4gICAgICAgICAgQGNvZGUgYXRvbS5jb25maWcuZ2V0ICdtZXJnZS1jb25mbGljdHMuZ2l0UGF0aCdcbiAgICAgICAgICBAdGV4dCAnISdcbiAgICAgICAgQGRpdiBjbGFzczogJ3BhbmVsLWJvZHknLCA9PlxuICAgICAgICAgIEBkaXYgY2xhc3M6ICdibG9jaycsXG4gICAgICAgICAgICAnUGxlYXNlIHNwZWNpZnkgdGhlIGNvcnJlY3QgcGF0aCBpbiB0aGUgbWVyZ2UtY29uZmxpY3RzIHBhY2thZ2Ugc2V0dGluZ3MuJ1xuICAgICAgICAgIEBkaXYgY2xhc3M6ICdibG9jaycsID0+XG4gICAgICAgICAgICBAYnV0dG9uIGNsYXNzOiAnYnRuIGJ0bi1lcnJvciBpbmxpbmUtYmxvY2stdGlnaHQnLCBjbGljazogJ29wZW5TZXR0aW5ncycsICdPcGVuIFNldHRpbmdzJ1xuICAgICAgICAgICAgQGJ1dHRvbiBjbGFzczogJ2J0biBpbmxpbmUtYmxvY2stdGlnaHQnLCBjbGljazogJ25vdFJpZ2h0Tm93JywgJ05vdCBSaWdodCBOb3cnXG5cbiAgaW5pdGlhbGl6ZTogKGVycikgLT5cbiAgICBpZiBhdG9tLmNvbmZpZy5nZXQgJ21lcmdlLWNvbmZsaWN0cy5naXRQYXRoJ1xuICAgICAgQGZpbmQoJy5uby1wYXRoJykuaGlkZSgpXG4gICAgICBAZmluZCgnLndyb25nLXBhdGgnKS5zaG93KClcbiAgICBlbHNlXG4gICAgICBAZmluZCgnLm5vLXBhdGgnKS5zaG93KClcbiAgICAgIEBmaW5kKCcud3JvbmctcGF0aCcpLmhpZGUoKVxuXG4gIG9wZW5TZXR0aW5nczogLT5cbiAgICBhdG9tLndvcmtzcGFjZS5vcGVuICdhdG9tOi8vY29uZmlnL3BhY2thZ2VzJ1xuICAgIEByZW1vdmUoKVxuXG4gIG5vdFJpZ2h0Tm93OiAtPlxuICAgIEByZW1vdmUoKVxuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIGhhbmRsZUVycjogKGVycikgLT5cbiAgICByZXR1cm4gZmFsc2UgdW5sZXNzIGVycj9cblxuICAgIGlmIGVyci5pc0dpdEVycm9yXG4gICAgICBhdG9tLndvcmtzcGFjZS5hZGRUb3BQYW5lbCBpdGVtOiBuZXcgR2l0Tm90Rm91bmRFcnJvclZpZXcoZXJyKVxuICAgIGVsc2VcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvciBlcnIubWVzc2FnZVxuICAgICAgY29uc29sZS5lcnJvciBlcnIubWVzc2FnZSwgZXJyLnRyYWNlXG4gICAgdHJ1ZVxuIl19
