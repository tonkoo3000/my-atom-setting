(function() {
  var CompositeDisposable, MinimapPigmentsBinding,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  CompositeDisposable = require('atom').CompositeDisposable;

  module.exports = MinimapPigmentsBinding = (function() {
    function MinimapPigmentsBinding(arg) {
      this.editor = arg.editor, this.minimap = arg.minimap, this.colorBuffer = arg.colorBuffer;
      this.displayedMarkers = [];
      this.decorationsByMarkerId = {};
      this.subscriptionsByMarkerId = {};
      this.subscriptions = new CompositeDisposable;
      this.colorBuffer.initialize().then((function(_this) {
        return function() {
          return _this.updateMarkers();
        };
      })(this));
      if (this.colorBuffer.editor.onDidTokenize != null) {
        this.subscriptions.add(this.colorBuffer.editor.onDidTokenize((function(_this) {
          return function() {
            return _this.updateMarkers();
          };
        })(this)));
      } else {
        this.subscriptions.add(this.colorBuffer.editor.displayBuffer.onDidTokenize((function(_this) {
          return function() {
            return _this.updateMarkers();
          };
        })(this)));
      }
      this.subscriptions.add(this.colorBuffer.onDidUpdateColorMarkers((function(_this) {
        return function() {
          return _this.updateMarkers();
        };
      })(this)));
      this.decorations = [];
    }

    MinimapPigmentsBinding.prototype.updateMarkers = function() {
      var decoration, i, j, len, len1, m, markers, ref, ref1, ref2;
      markers = this.colorBuffer.findValidColorMarkers();
      ref = this.displayedMarkers;
      for (i = 0, len = ref.length; i < len; i++) {
        m = ref[i];
        if (indexOf.call(markers, m) < 0) {
          if ((ref1 = this.decorationsByMarkerId[m.id]) != null) {
            ref1.destroy();
          }
        }
      }
      for (j = 0, len1 = markers.length; j < len1; j++) {
        m = markers[j];
        if (!(((ref2 = m.color) != null ? ref2.isValid() : void 0) && indexOf.call(this.displayedMarkers, m) < 0)) {
          continue;
        }
        decoration = this.minimap.decorateMarker(m.marker, {
          type: 'highlight',
          color: m.color.toCSS(),
          plugin: 'pigments'
        });
        this.decorationsByMarkerId[m.id] = decoration;
        this.subscriptionsByMarkerId[m.id] = decoration.onDidDestroy((function(_this) {
          return function() {
            var ref3;
            if ((ref3 = _this.subscriptionsByMarkerId[m.id]) != null) {
              ref3.dispose();
            }
            delete _this.subscriptionsByMarkerId[m.id];
            return delete _this.decorationsByMarkerId[m.id];
          };
        })(this));
      }
      return this.displayedMarkers = markers;
    };

    MinimapPigmentsBinding.prototype.destroy = function() {
      this.destroyDecorations();
      return this.subscriptions.dispose();
    };

    MinimapPigmentsBinding.prototype.destroyDecorations = function() {
      var decoration, id, ref, ref1, sub;
      ref = this.subscriptionsByMarkerId;
      for (id in ref) {
        sub = ref[id];
        if (sub != null) {
          sub.dispose();
        }
      }
      ref1 = this.decorationsByMarkerId;
      for (id in ref1) {
        decoration = ref1[id];
        if (decoration != null) {
          decoration.destroy();
        }
      }
      this.decorationsByMarkerId = {};
      return this.subscriptionsByMarkerId = {};
    };

    return MinimapPigmentsBinding;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvdG95b2tpLy5hdG9tL3BhY2thZ2VzL21pbmltYXAtcGlnbWVudHMvbGliL21pbmltYXAtcGlnbWVudHMtYmluZGluZy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLDJDQUFBO0lBQUE7O0VBQUMsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSOztFQUV4QixNQUFNLENBQUMsT0FBUCxHQUNNO0lBQ1MsZ0NBQUMsR0FBRDtNQUFFLElBQUMsQ0FBQSxhQUFBLFFBQVEsSUFBQyxDQUFBLGNBQUEsU0FBUyxJQUFDLENBQUEsa0JBQUE7TUFDakMsSUFBQyxDQUFBLGdCQUFELEdBQW9CO01BQ3BCLElBQUMsQ0FBQSxxQkFBRCxHQUF5QjtNQUN6QixJQUFDLENBQUEsdUJBQUQsR0FBMkI7TUFFM0IsSUFBQyxDQUFBLGFBQUQsR0FBaUIsSUFBSTtNQUVyQixJQUFDLENBQUEsV0FBVyxDQUFDLFVBQWIsQ0FBQSxDQUF5QixDQUFDLElBQTFCLENBQStCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtpQkFBRyxLQUFDLENBQUEsYUFBRCxDQUFBO1FBQUg7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQS9CO01BRUEsSUFBRyw2Q0FBSDtRQUNFLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFDLENBQUEsV0FBVyxDQUFDLE1BQU0sQ0FBQyxhQUFwQixDQUFrQyxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO21CQUNuRCxLQUFDLENBQUEsYUFBRCxDQUFBO1VBRG1EO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFsQyxDQUFuQixFQURGO09BQUEsTUFBQTtRQUlFLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFDLENBQUEsV0FBVyxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsYUFBbEMsQ0FBZ0QsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTttQkFDakUsS0FBQyxDQUFBLGFBQUQsQ0FBQTtVQURpRTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBaEQsQ0FBbkIsRUFKRjs7TUFPQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBQyxDQUFBLFdBQVcsQ0FBQyx1QkFBYixDQUFxQyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQ3RELEtBQUMsQ0FBQSxhQUFELENBQUE7UUFEc0Q7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXJDLENBQW5CO01BR0EsSUFBQyxDQUFBLFdBQUQsR0FBZTtJQW5CSjs7cUNBcUJiLGFBQUEsR0FBZSxTQUFBO0FBQ2IsVUFBQTtNQUFBLE9BQUEsR0FBVSxJQUFDLENBQUEsV0FBVyxDQUFDLHFCQUFiLENBQUE7QUFFVjtBQUFBLFdBQUEscUNBQUE7O1lBQWdDLGFBQVMsT0FBVCxFQUFBLENBQUE7O2dCQUNGLENBQUUsT0FBOUIsQ0FBQTs7O0FBREY7QUFHQSxXQUFBLDJDQUFBOzs4Q0FBNkIsQ0FBRSxPQUFULENBQUEsV0FBQSxJQUF1QixhQUFTLElBQUMsQ0FBQSxnQkFBVixFQUFBLENBQUE7OztRQUMzQyxVQUFBLEdBQWEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxjQUFULENBQXdCLENBQUMsQ0FBQyxNQUExQixFQUFrQztVQUFBLElBQUEsRUFBTSxXQUFOO1VBQW1CLEtBQUEsRUFBTyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQVIsQ0FBQSxDQUExQjtVQUEyQyxNQUFBLEVBQVEsVUFBbkQ7U0FBbEM7UUFFYixJQUFDLENBQUEscUJBQXNCLENBQUEsQ0FBQyxDQUFDLEVBQUYsQ0FBdkIsR0FBK0I7UUFDL0IsSUFBQyxDQUFBLHVCQUF3QixDQUFBLENBQUMsQ0FBQyxFQUFGLENBQXpCLEdBQWlDLFVBQVUsQ0FBQyxZQUFYLENBQXdCLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7QUFDdkQsZ0JBQUE7O2tCQUE4QixDQUFFLE9BQWhDLENBQUE7O1lBQ0EsT0FBTyxLQUFDLENBQUEsdUJBQXdCLENBQUEsQ0FBQyxDQUFDLEVBQUY7bUJBQ2hDLE9BQU8sS0FBQyxDQUFBLHFCQUFzQixDQUFBLENBQUMsQ0FBQyxFQUFGO1VBSHlCO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF4QjtBQUpuQzthQVNBLElBQUMsQ0FBQSxnQkFBRCxHQUFvQjtJQWZQOztxQ0FpQmYsT0FBQSxHQUFTLFNBQUE7TUFDUCxJQUFDLENBQUEsa0JBQUQsQ0FBQTthQUNBLElBQUMsQ0FBQSxhQUFhLENBQUMsT0FBZixDQUFBO0lBRk87O3FDQUlULGtCQUFBLEdBQW9CLFNBQUE7QUFDbEIsVUFBQTtBQUFBO0FBQUEsV0FBQSxTQUFBOzs7VUFBQSxHQUFHLENBQUUsT0FBTCxDQUFBOztBQUFBO0FBQ0E7QUFBQSxXQUFBLFVBQUE7OztVQUFBLFVBQVUsQ0FBRSxPQUFaLENBQUE7O0FBQUE7TUFFQSxJQUFDLENBQUEscUJBQUQsR0FBeUI7YUFDekIsSUFBQyxDQUFBLHVCQUFELEdBQTJCO0lBTFQ7Ozs7O0FBOUN0QiIsInNvdXJjZXNDb250ZW50IjpbIntDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIE1pbmltYXBQaWdtZW50c0JpbmRpbmdcbiAgY29uc3RydWN0b3I6ICh7QGVkaXRvciwgQG1pbmltYXAsIEBjb2xvckJ1ZmZlcn0pIC0+XG4gICAgQGRpc3BsYXllZE1hcmtlcnMgPSBbXVxuICAgIEBkZWNvcmF0aW9uc0J5TWFya2VySWQgPSB7fVxuICAgIEBzdWJzY3JpcHRpb25zQnlNYXJrZXJJZCA9IHt9XG5cbiAgICBAc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG5cbiAgICBAY29sb3JCdWZmZXIuaW5pdGlhbGl6ZSgpLnRoZW4gPT4gQHVwZGF0ZU1hcmtlcnMoKVxuXG4gICAgaWYgQGNvbG9yQnVmZmVyLmVkaXRvci5vbkRpZFRva2VuaXplP1xuICAgICAgQHN1YnNjcmlwdGlvbnMuYWRkIEBjb2xvckJ1ZmZlci5lZGl0b3Iub25EaWRUb2tlbml6ZSA9PlxuICAgICAgICBAdXBkYXRlTWFya2VycygpXG4gICAgZWxzZVxuICAgICAgQHN1YnNjcmlwdGlvbnMuYWRkIEBjb2xvckJ1ZmZlci5lZGl0b3IuZGlzcGxheUJ1ZmZlci5vbkRpZFRva2VuaXplID0+XG4gICAgICAgIEB1cGRhdGVNYXJrZXJzKClcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAY29sb3JCdWZmZXIub25EaWRVcGRhdGVDb2xvck1hcmtlcnMgPT5cbiAgICAgIEB1cGRhdGVNYXJrZXJzKClcblxuICAgIEBkZWNvcmF0aW9ucyA9IFtdXG5cbiAgdXBkYXRlTWFya2VyczogLT5cbiAgICBtYXJrZXJzID0gQGNvbG9yQnVmZmVyLmZpbmRWYWxpZENvbG9yTWFya2VycygpXG5cbiAgICBmb3IgbSBpbiBAZGlzcGxheWVkTWFya2VycyB3aGVuIG0gbm90IGluIG1hcmtlcnNcbiAgICAgIEBkZWNvcmF0aW9uc0J5TWFya2VySWRbbS5pZF0/LmRlc3Ryb3koKVxuXG4gICAgZm9yIG0gaW4gbWFya2VycyB3aGVuIG0uY29sb3I/LmlzVmFsaWQoKSBhbmQgbSBub3QgaW4gQGRpc3BsYXllZE1hcmtlcnNcbiAgICAgIGRlY29yYXRpb24gPSBAbWluaW1hcC5kZWNvcmF0ZU1hcmtlcihtLm1hcmtlciwgdHlwZTogJ2hpZ2hsaWdodCcsIGNvbG9yOiBtLmNvbG9yLnRvQ1NTKCksIHBsdWdpbjogJ3BpZ21lbnRzJylcblxuICAgICAgQGRlY29yYXRpb25zQnlNYXJrZXJJZFttLmlkXSA9IGRlY29yYXRpb25cbiAgICAgIEBzdWJzY3JpcHRpb25zQnlNYXJrZXJJZFttLmlkXSA9IGRlY29yYXRpb24ub25EaWREZXN0cm95ID0+XG4gICAgICAgIEBzdWJzY3JpcHRpb25zQnlNYXJrZXJJZFttLmlkXT8uZGlzcG9zZSgpXG4gICAgICAgIGRlbGV0ZSBAc3Vic2NyaXB0aW9uc0J5TWFya2VySWRbbS5pZF1cbiAgICAgICAgZGVsZXRlIEBkZWNvcmF0aW9uc0J5TWFya2VySWRbbS5pZF1cblxuICAgIEBkaXNwbGF5ZWRNYXJrZXJzID0gbWFya2Vyc1xuXG4gIGRlc3Ryb3k6IC0+XG4gICAgQGRlc3Ryb3lEZWNvcmF0aW9ucygpXG4gICAgQHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG5cbiAgZGVzdHJveURlY29yYXRpb25zOiAtPlxuICAgIHN1Yj8uZGlzcG9zZSgpIGZvciBpZCxzdWIgb2YgQHN1YnNjcmlwdGlvbnNCeU1hcmtlcklkXG4gICAgZGVjb3JhdGlvbj8uZGVzdHJveSgpIGZvciBpZCxkZWNvcmF0aW9uIG9mIEBkZWNvcmF0aW9uc0J5TWFya2VySWRcblxuICAgIEBkZWNvcmF0aW9uc0J5TWFya2VySWQgPSB7fVxuICAgIEBzdWJzY3JpcHRpb25zQnlNYXJrZXJJZCA9IHt9XG4iXX0=
