(function() {
  var CompositeDisposable, CoveringView, SideView,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  CompositeDisposable = require('atom').CompositeDisposable;

  CoveringView = require('./covering-view').CoveringView;

  SideView = (function(superClass) {
    extend(SideView, superClass);

    function SideView() {
      return SideView.__super__.constructor.apply(this, arguments);
    }

    SideView.content = function(side, editor) {
      return this.div({
        "class": "side " + (side.klass()) + " " + side.position + " ui-site-" + (side.site())
      }, (function(_this) {
        return function() {
          return _this.div({
            "class": 'controls'
          }, function() {
            _this.label({
              "class": 'text-highlight'
            }, side.ref);
            _this.span({
              "class": 'text-subtle'
            }, "// " + (side.description()));
            return _this.span({
              "class": 'pull-right'
            }, function() {
              _this.button({
                "class": 'btn btn-xs inline-block-tight revert',
                click: 'revert',
                outlet: 'revertBtn'
              }, 'Revert');
              return _this.button({
                "class": 'btn btn-xs inline-block-tight',
                click: 'useMe',
                outlet: 'useMeBtn'
              }, 'Use Me');
            });
          });
        };
      })(this));
    };

    SideView.prototype.initialize = function(side1, editor) {
      this.side = side1;
      this.subs = new CompositeDisposable;
      this.decoration = null;
      SideView.__super__.initialize.call(this, editor);
      this.detectDirty();
      this.prependKeystroke(this.side.eventName(), this.useMeBtn);
      return this.prependKeystroke('merge-conflicts:revert-current', this.revertBtn);
    };

    SideView.prototype.attached = function() {
      SideView.__super__.attached.apply(this, arguments);
      this.decorate();
      return this.subs.add(this.side.conflict.onDidResolveConflict((function(_this) {
        return function() {
          _this.deleteMarker(_this.side.refBannerMarker);
          if (!_this.side.wasChosen()) {
            _this.deleteMarker(_this.side.marker);
          }
          _this.remove();
          return _this.cleanup();
        };
      })(this)));
    };

    SideView.prototype.cleanup = function() {
      SideView.__super__.cleanup.apply(this, arguments);
      return this.subs.dispose();
    };

    SideView.prototype.cover = function() {
      return this.side.refBannerMarker;
    };

    SideView.prototype.decorate = function() {
      var args, ref;
      if ((ref = this.decoration) != null) {
        ref.destroy();
      }
      if (this.side.conflict.isResolved() && !this.side.wasChosen()) {
        return;
      }
      args = {
        type: 'line',
        "class": this.side.lineClass()
      };
      return this.decoration = this.editor.decorateMarker(this.side.marker, args);
    };

    SideView.prototype.conflict = function() {
      return this.side.conflict;
    };

    SideView.prototype.isDirty = function() {
      return this.side.isDirty;
    };

    SideView.prototype.includesCursor = function(cursor) {
      var h, m, p, ref, t;
      m = this.side.marker;
      ref = [m.getHeadBufferPosition(), m.getTailBufferPosition()], h = ref[0], t = ref[1];
      p = cursor.getBufferPosition();
      return t.isLessThanOrEqual(p) && h.isGreaterThanOrEqual(p);
    };

    SideView.prototype.useMe = function() {
      this.editor.transact((function(_this) {
        return function() {
          return _this.side.resolve();
        };
      })(this));
      return this.decorate();
    };

    SideView.prototype.revert = function() {
      this.editor.setTextInBufferRange(this.side.marker.getBufferRange(), this.side.originalText);
      return this.decorate();
    };

    SideView.prototype.detectDirty = function() {
      var currentText;
      currentText = this.editor.getTextInBufferRange(this.side.marker.getBufferRange());
      this.side.isDirty = currentText !== this.side.originalText;
      this.decorate();
      this.removeClass('dirty');
      if (this.side.isDirty) {
        return this.addClass('dirty');
      }
    };

    SideView.prototype.toString = function() {
      return "{SideView of: " + this.side + "}";
    };

    return SideView;

  })(CoveringView);

  module.exports = {
    SideView: SideView
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvdG95b2tpLy5hdG9tL3BhY2thZ2VzL21lcmdlLWNvbmZsaWN0cy9saWIvdmlldy9zaWRlLXZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSwyQ0FBQTtJQUFBOzs7RUFBQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVI7O0VBQ3ZCLGVBQWdCLE9BQUEsQ0FBUSxpQkFBUjs7RUFFWDs7Ozs7OztJQUVKLFFBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQyxJQUFELEVBQU8sTUFBUDthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7UUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLE9BQUEsR0FBTyxDQUFDLElBQUksQ0FBQyxLQUFMLENBQUEsQ0FBRCxDQUFQLEdBQXFCLEdBQXJCLEdBQXdCLElBQUksQ0FBQyxRQUE3QixHQUFzQyxXQUF0QyxHQUFnRCxDQUFDLElBQUksQ0FBQyxJQUFMLENBQUEsQ0FBRCxDQUF2RDtPQUFMLEVBQTRFLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtpQkFDMUUsS0FBQyxDQUFBLEdBQUQsQ0FBSztZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sVUFBUDtXQUFMLEVBQXdCLFNBQUE7WUFDdEIsS0FBQyxDQUFBLEtBQUQsQ0FBTztjQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sZ0JBQVA7YUFBUCxFQUFnQyxJQUFJLENBQUMsR0FBckM7WUFDQSxLQUFDLENBQUEsSUFBRCxDQUFNO2NBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxhQUFQO2FBQU4sRUFBNEIsS0FBQSxHQUFLLENBQUMsSUFBSSxDQUFDLFdBQUwsQ0FBQSxDQUFELENBQWpDO21CQUNBLEtBQUMsQ0FBQSxJQUFELENBQU07Y0FBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLFlBQVA7YUFBTixFQUEyQixTQUFBO2NBQ3pCLEtBQUMsQ0FBQSxNQUFELENBQVE7Z0JBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxz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YWJsZX0gPSByZXF1aXJlICdhdG9tJ1xue0NvdmVyaW5nVmlld30gPSByZXF1aXJlICcuL2NvdmVyaW5nLXZpZXcnXG5cbmNsYXNzIFNpZGVWaWV3IGV4dGVuZHMgQ292ZXJpbmdWaWV3XG5cbiAgQGNvbnRlbnQ6IChzaWRlLCBlZGl0b3IpIC0+XG4gICAgQGRpdiBjbGFzczogXCJzaWRlICN7c2lkZS5rbGFzcygpfSAje3NpZGUucG9zaXRpb259IHVpLXNpdGUtI3tzaWRlLnNpdGUoKX1cIiwgPT5cbiAgICAgIEBkaXYgY2xhc3M6ICdjb250cm9scycsID0+XG4gICAgICAgIEBsYWJlbCBjbGFzczogJ3RleHQtaGlnaGxpZ2h0Jywgc2lkZS5yZWZcbiAgICAgICAgQHNwYW4gY2xhc3M6ICd0ZXh0LXN1YnRsZScsIFwiLy8gI3tzaWRlLmRlc2NyaXB0aW9uKCl9XCJcbiAgICAgICAgQHNwYW4gY2xhc3M6ICdwdWxsLXJpZ2h0JywgPT5cbiAgICAgICAgICBAYnV0dG9uIGNsYXNzOiAnYnRuIGJ0bi14cyBpbmxpbmUtYmxvY2stdGlnaHQgcmV2ZXJ0JywgY2xpY2s6ICdyZXZlcnQnLCBvdXRsZXQ6ICdyZXZlcnRCdG4nLCAnUmV2ZXJ0J1xuICAgICAgICAgIEBidXR0b24gY2xhc3M6ICdidG4gYnRuLXhzIGlubGluZS1ibG9jay10aWdodCcsIGNsaWNrOiAndXNlTWUnLCBvdXRsZXQ6ICd1c2VNZUJ0bicsICdVc2UgTWUnXG5cbiAgaW5pdGlhbGl6ZTogKEBzaWRlLCBlZGl0b3IpIC0+XG4gICAgQHN1YnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIEBkZWNvcmF0aW9uID0gbnVsbFxuXG4gICAgc3VwZXIgZWRpdG9yXG5cbiAgICBAZGV0ZWN0RGlydHkoKVxuICAgIEBwcmVwZW5kS2V5c3Ryb2tlIEBzaWRlLmV2ZW50TmFtZSgpLCBAdXNlTWVCdG5cbiAgICBAcHJlcGVuZEtleXN0cm9rZSAnbWVyZ2UtY29uZmxpY3RzOnJldmVydC1jdXJyZW50JywgQHJldmVydEJ0blxuXG4gIGF0dGFjaGVkOiAtPlxuICAgIHN1cGVyXG5cbiAgICBAZGVjb3JhdGUoKVxuICAgIEBzdWJzLmFkZCBAc2lkZS5jb25mbGljdC5vbkRpZFJlc29sdmVDb25mbGljdCA9PlxuICAgICAgQGRlbGV0ZU1hcmtlciBAc2lkZS5yZWZCYW5uZXJNYXJrZXJcbiAgICAgIEBkZWxldGVNYXJrZXIgQHNpZGUubWFya2VyIHVubGVzcyBAc2lkZS53YXNDaG9zZW4oKVxuICAgICAgQHJlbW92ZSgpXG4gICAgICBAY2xlYW51cCgpXG5cbiAgY2xlYW51cDogLT5cbiAgICBzdXBlclxuICAgIEBzdWJzLmRpc3Bvc2UoKVxuXG4gIGNvdmVyOiAtPiBAc2lkZS5yZWZCYW5uZXJNYXJrZXJcblxuICBkZWNvcmF0ZTogLT5cbiAgICBAZGVjb3JhdGlvbj8uZGVzdHJveSgpXG5cbiAgICByZXR1cm4gaWYgQHNpZGUuY29uZmxpY3QuaXNSZXNvbHZlZCgpICYmICFAc2lkZS53YXNDaG9zZW4oKVxuXG4gICAgYXJncyA9XG4gICAgICB0eXBlOiAnbGluZSdcbiAgICAgIGNsYXNzOiBAc2lkZS5saW5lQ2xhc3MoKVxuICAgIEBkZWNvcmF0aW9uID0gQGVkaXRvci5kZWNvcmF0ZU1hcmtlcihAc2lkZS5tYXJrZXIsIGFyZ3MpXG5cbiAgY29uZmxpY3Q6IC0+IEBzaWRlLmNvbmZsaWN0XG5cbiAgaXNEaXJ0eTogLT4gQHNpZGUuaXNEaXJ0eVxuXG4gIGluY2x1ZGVzQ3Vyc29yOiAoY3Vyc29yKSAtPlxuICAgIG0gPSBAc2lkZS5tYXJrZXJcbiAgICBbaCwgdF0gPSBbbS5nZXRIZWFkQnVmZmVyUG9zaXRpb24oKSwgbS5nZXRUYWlsQnVmZmVyUG9zaXRpb24oKV1cbiAgICBwID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcbiAgICB0LmlzTGVzc1RoYW5PckVxdWFsKHApIGFuZCBoLmlzR3JlYXRlclRoYW5PckVxdWFsKHApXG5cbiAgdXNlTWU6IC0+XG4gICAgQGVkaXRvci50cmFuc2FjdCA9PlxuICAgICAgQHNpZGUucmVzb2x2ZSgpXG4gICAgQGRlY29yYXRlKClcblxuICByZXZlcnQ6IC0+XG4gICAgQGVkaXRvci5zZXRUZXh0SW5CdWZmZXJSYW5nZSBAc2lkZS5tYXJrZXIuZ2V0QnVmZmVyUmFuZ2UoKSwgQHNpZGUub3JpZ2luYWxUZXh0XG4gICAgQGRlY29yYXRlKClcblxuICBkZXRlY3REaXJ0eTogLT5cbiAgICBjdXJyZW50VGV4dCA9IEBlZGl0b3IuZ2V0VGV4dEluQnVmZmVyUmFuZ2UgQHNpZGUubWFya2VyLmdldEJ1ZmZlclJhbmdlKClcbiAgICBAc2lkZS5pc0RpcnR5ID0gY3VycmVudFRleHQgaXNudCBAc2lkZS5vcmlnaW5hbFRleHRcblxuICAgIEBkZWNvcmF0ZSgpXG5cbiAgICBAcmVtb3ZlQ2xhc3MgJ2RpcnR5J1xuICAgIEBhZGRDbGFzcyAnZGlydHknIGlmIEBzaWRlLmlzRGlydHlcblxuICB0b1N0cmluZzogLT4gXCJ7U2lkZVZpZXcgb2Y6ICN7QHNpZGV9fVwiXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgU2lkZVZpZXc6IFNpZGVWaWV3XG4iXX0=
