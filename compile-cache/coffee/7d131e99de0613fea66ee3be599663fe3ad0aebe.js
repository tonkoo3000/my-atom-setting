(function() {
  var $, CompositeDisposable, CoveringView, View, _, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  CompositeDisposable = require('atom').CompositeDisposable;

  ref = require('space-pen'), View = ref.View, $ = ref.$;

  _ = require('underscore-plus');

  CoveringView = (function(superClass) {
    extend(CoveringView, superClass);

    function CoveringView() {
      return CoveringView.__super__.constructor.apply(this, arguments);
    }

    CoveringView.prototype.initialize = function(editor) {
      this.editor = editor;
      this.coverSubs = new CompositeDisposable;
      this.overlay = this.editor.decorateMarker(this.cover(), {
        type: 'overlay',
        item: this,
        position: 'tail'
      });
      return this.coverSubs.add(this.editor.onDidDestroy((function(_this) {
        return function() {
          return _this.cleanup();
        };
      })(this)));
    };

    CoveringView.prototype.attached = function() {
      var view;
      view = atom.views.getView(this.editor);
      this.parent().css({
        right: view.getVerticalScrollbarWidth()
      });
      this.css({
        'margin-top': -this.editor.getLineHeightInPixels()
      });
      return this.height(this.editor.getLineHeightInPixels());
    };

    CoveringView.prototype.cleanup = function() {
      var ref1;
      this.coverSubs.dispose();
      if ((ref1 = this.overlay) != null) {
        ref1.destroy();
      }
      return this.overlay = null;
    };

    CoveringView.prototype.cover = function() {
      return null;
    };

    CoveringView.prototype.conflict = function() {
      return null;
    };

    CoveringView.prototype.isDirty = function() {
      return false;
    };

    CoveringView.prototype.detectDirty = function() {
      return null;
    };

    CoveringView.prototype.decorate = function() {
      return null;
    };

    CoveringView.prototype.getModel = function() {
      return null;
    };

    CoveringView.prototype.buffer = function() {
      return this.editor.getBuffer();
    };

    CoveringView.prototype.includesCursor = function(cursor) {
      return false;
    };

    CoveringView.prototype.deleteMarker = function(marker) {
      this.buffer()["delete"](marker.getBufferRange());
      return marker.destroy();
    };

    CoveringView.prototype.scrollTo = function(positionOrNull) {
      if (positionOrNull != null) {
        return this.editor.setCursorBufferPosition(positionOrNull);
      }
    };

    CoveringView.prototype.prependKeystroke = function(eventName, element) {
      var bindings, e, i, len, original, results;
      bindings = atom.keymaps.findKeyBindings({
        command: eventName
      });
      results = [];
      for (i = 0, len = bindings.length; i < len; i++) {
        e = bindings[i];
        original = element.text();
        results.push(element.text(_.humanizeKeystroke(e.keystrokes) + (" " + original)));
      }
      return results;
    };

    return CoveringView;

  })(View);

  module.exports = {
    CoveringView: CoveringView
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvdG95b2tpLy5hdG9tL3BhY2thZ2VzL21lcmdlLWNvbmZsaWN0cy9saWIvdmlldy9jb3ZlcmluZy12aWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsa0RBQUE7SUFBQTs7O0VBQUMsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSOztFQUN4QixNQUFZLE9BQUEsQ0FBUSxXQUFSLENBQVosRUFBQyxlQUFELEVBQU87O0VBQ1AsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUjs7RUFHRTs7Ozs7OzsyQkFFSixVQUFBLEdBQVksU0FBQyxNQUFEO01BQUMsSUFBQyxDQUFBLFNBQUQ7TUFDWCxJQUFDLENBQUEsU0FBRCxHQUFhLElBQUk7TUFDakIsSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFDLENBQUEsTUFBTSxDQUFDLGNBQVIsQ0FBdUIsSUFBQyxDQUFBLEtBQUQsQ0FBQSxDQUF2QixFQUNUO1FBQUEsSUFBQSxFQUFNLFNBQU47UUFDQSxJQUFBLEVBQU0sSUFETjtRQUVBLFFBQUEsRUFBVSxNQUZWO09BRFM7YUFLWCxJQUFDLENBQUEsU0FBUyxDQUFDLEdBQVgsQ0FBZSxJQUFDLENBQUEsTUFBTSxDQUFDLFlBQVIsQ0FBcUIsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUFHLEtBQUMsQ0FBQSxPQUFELENBQUE7UUFBSDtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBckIsQ0FBZjtJQVBVOzsyQkFTWixRQUFBLEdBQVUsU0FBQTtBQUNSLFVBQUE7TUFBQSxJQUFBLEdBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLENBQW1CLElBQUMsQ0FBQSxNQUFwQjtNQUNQLElBQUMsQ0FBQSxNQUFELENBQUEsQ0FBUyxDQUFDLEdBQVYsQ0FBYztRQUFBLEtBQUEsRUFBTyxJQUFJLENBQUMseUJBQUwsQ0FBQSxDQUFQO09BQWQ7TUFFQSxJQUFDLENBQUEsR0FBRCxDQUFLO1FBQUEsWUFBQSxFQUFjLENBQUMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxxQkFBUixDQUFBLENBQWY7T0FBTDthQUNBLElBQUMsQ0FBQSxNQUFELENBQVEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxxQkFBUixDQUFBLENBQVI7SUFMUTs7MkJBT1YsT0FBQSxHQUFTLFNBQUE7QUFDUCxVQUFBO01BQUEsSUFBQyxDQUFBLFNBQVMsQ0FBQyxPQUFYLENBQUE7O1lBRVEsQ0FBRSxPQUFWLENBQUE7O2FBQ0EsSUFBQyxDQUFBLE9BQUQsR0FBVztJQUpKOzsyQkFPVCxLQUFBLEdBQU8sU0FBQTthQUFHO0lBQUg7OzJCQUdQLFFBQUEsR0FBVSxTQUFBO2FBQUc7SUFBSDs7MkJBRVYsT0FBQSxHQUFTLFNBQUE7YUFBRztJQUFIOzsyQkFHVCxXQUFBLEdBQWEsU0FBQTthQUFHO0lBQUg7OzJCQUdiLFFBQUEsR0FBVSxTQUFBO2FBQUc7SUFBSDs7MkJBRVYsUUFBQSxHQUFVLFNBQUE7YUFBRztJQUFIOzsyQkFFVixNQUFBLEdBQVEsU0FBQTthQUFHLElBQUMsQ0FBQSxNQUFNLENBQUMsU0FBUixDQUFBO0lBQUg7OzJCQUVSLGNBQUEsR0FBZ0IsU0FBQyxNQUFEO2FBQVk7SUFBWjs7MkJBRWhCLFlBQUEsR0FBYyxTQUFDLE1BQUQ7TUFDWixJQUFDLENBQUEsTUFBRCxDQUFBLENBQVMsRUFBQyxNQUFELEVBQVQsQ0FBaUIsTUFBTSxDQUFDLGNBQVAsQ0FBQSxDQUFqQjthQUNBLE1BQU0sQ0FBQyxPQUFQLENBQUE7SUFGWTs7MkJBSWQsUUFBQSxHQUFVLFNBQUMsY0FBRDtNQUNSLElBQWtELHNCQUFsRDtlQUFBLElBQUMsQ0FBQSxNQUFNLENBQUMsdUJBQVIsQ0FBZ0MsY0FBaEMsRUFBQTs7SUFEUTs7MkJBR1YsZ0JBQUEsR0FBa0IsU0FBQyxTQUFELEVBQVksT0FBWjtBQUNoQixVQUFBO01BQUEsUUFBQSxHQUFXLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBYixDQUE2QjtRQUFBLE9BQUEsRUFBUyxTQUFUO09BQTdCO0FBRVg7V0FBQSwwQ0FBQTs7UUFDRSxRQUFBLEdBQVcsT0FBTyxDQUFDLElBQVIsQ0FBQTtxQkFDWCxPQUFPLENBQUMsSUFBUixDQUFhLENBQUMsQ0FBQyxpQkFBRixDQUFvQixDQUFDLENBQUMsVUFBdEIsQ0FBQSxHQUFvQyxDQUFBLEdBQUEsR0FBSSxRQUFKLENBQWpEO0FBRkY7O0lBSGdCOzs7O0tBbkRPOztFQTBEM0IsTUFBTSxDQUFDLE9BQVAsR0FDRTtJQUFBLFlBQUEsRUFBYyxZQUFkOztBQWhFRiIsInNvdXJjZXNDb250ZW50IjpbIntDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG57VmlldywgJH0gPSByZXF1aXJlICdzcGFjZS1wZW4nXG5fID0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xuXG5cbmNsYXNzIENvdmVyaW5nVmlldyBleHRlbmRzIFZpZXdcblxuICBpbml0aWFsaXplOiAoQGVkaXRvcikgLT5cbiAgICBAY292ZXJTdWJzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBAb3ZlcmxheSA9IEBlZGl0b3IuZGVjb3JhdGVNYXJrZXIgQGNvdmVyKCksXG4gICAgICB0eXBlOiAnb3ZlcmxheScsXG4gICAgICBpdGVtOiB0aGlzLFxuICAgICAgcG9zaXRpb246ICd0YWlsJ1xuXG4gICAgQGNvdmVyU3Vicy5hZGQgQGVkaXRvci5vbkRpZERlc3Ryb3kgPT4gQGNsZWFudXAoKVxuXG4gIGF0dGFjaGVkOiAtPlxuICAgIHZpZXcgPSBhdG9tLnZpZXdzLmdldFZpZXcoQGVkaXRvcilcbiAgICBAcGFyZW50KCkuY3NzIHJpZ2h0OiB2aWV3LmdldFZlcnRpY2FsU2Nyb2xsYmFyV2lkdGgoKVxuXG4gICAgQGNzcyAnbWFyZ2luLXRvcCc6IC1AZWRpdG9yLmdldExpbmVIZWlnaHRJblBpeGVscygpXG4gICAgQGhlaWdodCBAZWRpdG9yLmdldExpbmVIZWlnaHRJblBpeGVscygpXG5cbiAgY2xlYW51cDogLT5cbiAgICBAY292ZXJTdWJzLmRpc3Bvc2UoKVxuXG4gICAgQG92ZXJsYXk/LmRlc3Ryb3koKVxuICAgIEBvdmVybGF5ID0gbnVsbFxuXG4gICMgT3ZlcnJpZGUgdG8gc3BlY2lmeSB0aGUgbWFya2VyIG9mIHRoZSBmaXJzdCBsaW5lIHRoYXQgc2hvdWxkIGJlIGNvdmVyZWQuXG4gIGNvdmVyOiAtPiBudWxsXG5cbiAgIyBPdmVycmlkZSB0byByZXR1cm4gdGhlIENvbmZsaWN0IHRoYXQgdGhpcyB2aWV3IGlzIHJlc3BvbnNpYmxlIGZvci5cbiAgY29uZmxpY3Q6IC0+IG51bGxcblxuICBpc0RpcnR5OiAtPiBmYWxzZVxuXG4gICMgT3ZlcnJpZGUgdG8gZGV0ZXJtaW5lIGlmIHRoZSBjb250ZW50IG9mIHRoaXMgU2lkZSBoYXMgYmVlbiBtb2RpZmllZC5cbiAgZGV0ZWN0RGlydHk6IC0+IG51bGxcblxuICAjIE92ZXJyaWRlIHRvIGFwcGx5IGEgZGVjb3JhdGlvbiB0byBhIG1hcmtlciBhcyBhcHByb3ByaWF0ZS5cbiAgZGVjb3JhdGU6IC0+IG51bGxcblxuICBnZXRNb2RlbDogLT4gbnVsbFxuXG4gIGJ1ZmZlcjogLT4gQGVkaXRvci5nZXRCdWZmZXIoKVxuXG4gIGluY2x1ZGVzQ3Vyc29yOiAoY3Vyc29yKSAtPiBmYWxzZVxuXG4gIGRlbGV0ZU1hcmtlcjogKG1hcmtlcikgLT5cbiAgICBAYnVmZmVyKCkuZGVsZXRlIG1hcmtlci5nZXRCdWZmZXJSYW5nZSgpXG4gICAgbWFya2VyLmRlc3Ryb3koKVxuXG4gIHNjcm9sbFRvOiAocG9zaXRpb25Pck51bGwpIC0+XG4gICAgQGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbiBwb3NpdGlvbk9yTnVsbCBpZiBwb3NpdGlvbk9yTnVsbD9cblxuICBwcmVwZW5kS2V5c3Ryb2tlOiAoZXZlbnROYW1lLCBlbGVtZW50KSAtPlxuICAgIGJpbmRpbmdzID0gYXRvbS5rZXltYXBzLmZpbmRLZXlCaW5kaW5ncyBjb21tYW5kOiBldmVudE5hbWVcblxuICAgIGZvciBlIGluIGJpbmRpbmdzXG4gICAgICBvcmlnaW5hbCA9IGVsZW1lbnQudGV4dCgpXG4gICAgICBlbGVtZW50LnRleHQoXy5odW1hbml6ZUtleXN0cm9rZShlLmtleXN0cm9rZXMpICsgXCIgI3tvcmlnaW5hbH1cIilcblxubW9kdWxlLmV4cG9ydHMgPVxuICBDb3ZlcmluZ1ZpZXc6IENvdmVyaW5nVmlld1xuIl19
