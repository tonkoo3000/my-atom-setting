(function() {
  var CompositeDisposable, MinimapBookmarksBinding;

  CompositeDisposable = require('atom').CompositeDisposable;

  module.exports = MinimapBookmarksBinding = (function() {
    function MinimapBookmarksBinding(minimap, bookmarks) {
      this.minimap = minimap;
      this.bookmarks = bookmarks;
      this.subscriptions = new CompositeDisposable;
      this.editor = this.minimap.getTextEditor();
      this.decorationsByMarkerId = {};
      this.decorationSubscriptionsByMarkerId = {};
      requestAnimationFrame((function(_this) {
        return function() {
          var id, markerLayer, ref;
          id = (ref = _this.bookmarks.serialize()[_this.editor.id]) != null ? ref.markerLayerId : void 0;
          markerLayer = _this.editor.getMarkerLayer(id);
          if (markerLayer != null) {
            _this.subscriptions.add(markerLayer.onDidCreateMarker(function(marker) {
              return _this.handleMarker(marker);
            }));
            return markerLayer.findMarkers().forEach(function(marker) {
              return _this.handleMarker(marker);
            });
          }
        };
      })(this));
    }

    MinimapBookmarksBinding.prototype.handleMarker = function(marker) {
      var decoration, id;
      id = marker.id;
      decoration = this.minimap.decorateMarker(marker, {
        type: 'line',
        "class": 'bookmark',
        plugin: 'bookmarks'
      });
      this.decorationsByMarkerId[id] = decoration;
      return this.decorationSubscriptionsByMarkerId[id] = decoration.onDidDestroy((function(_this) {
        return function() {
          _this.decorationSubscriptionsByMarkerId[id].dispose();
          delete _this.decorationsByMarkerId[id];
          return delete _this.decorationSubscriptionsByMarkerId[id];
        };
      })(this));
    };

    MinimapBookmarksBinding.prototype.destroy = function() {
      var decoration, id, ref;
      ref = this.decorationsByMarkerId;
      for (id in ref) {
        decoration = ref[id];
        this.decorationSubscriptionsByMarkerId[id].dispose();
        decoration.destroy();
        delete this.decorationsByMarkerId[id];
        delete this.decorationSubscriptionsByMarkerId[id];
      }
      return this.subscriptions.dispose();
    };

    return MinimapBookmarksBinding;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvdG95b2tpLy5hdG9tL3BhY2thZ2VzL21pbmltYXAtYm9va21hcmtzL2xpYi9taW5pbWFwLWJvb2ttYXJrcy1iaW5kaW5nLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUMsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSOztFQUV4QixNQUFNLENBQUMsT0FBUCxHQUNNO0lBQ1MsaUNBQUMsT0FBRCxFQUFXLFNBQVg7TUFBQyxJQUFDLENBQUEsVUFBRDtNQUFVLElBQUMsQ0FBQSxZQUFEO01BQ3RCLElBQUMsQ0FBQSxhQUFELEdBQWlCLElBQUk7TUFDckIsSUFBQyxDQUFBLE1BQUQsR0FBVSxJQUFDLENBQUEsT0FBTyxDQUFDLGFBQVQsQ0FBQTtNQUNWLElBQUMsQ0FBQSxxQkFBRCxHQUF5QjtNQUN6QixJQUFDLENBQUEsaUNBQUQsR0FBcUM7TUFJckMscUJBQUEsQ0FBc0IsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO0FBUXBCLGNBQUE7VUFBQSxFQUFBLHFFQUF1QyxDQUFFO1VBQ3pDLFdBQUEsR0FBYyxLQUFDLENBQUEsTUFBTSxDQUFDLGNBQVIsQ0FBdUIsRUFBdkI7VUFFZCxJQUFHLG1CQUFIO1lBQ0UsS0FBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLFdBQVcsQ0FBQyxpQkFBWixDQUE4QixTQUFDLE1BQUQ7cUJBQy9DLEtBQUMsQ0FBQSxZQUFELENBQWMsTUFBZDtZQUQrQyxDQUE5QixDQUFuQjttQkFHQSxXQUFXLENBQUMsV0FBWixDQUFBLENBQXlCLENBQUMsT0FBMUIsQ0FBa0MsU0FBQyxNQUFEO3FCQUFZLEtBQUMsQ0FBQSxZQUFELENBQWMsTUFBZDtZQUFaLENBQWxDLEVBSkY7O1FBWG9CO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF0QjtJQVJXOztzQ0F5QmIsWUFBQSxHQUFjLFNBQUMsTUFBRDtBQUNaLFVBQUE7TUFBQyxLQUFNO01BQ1AsVUFBQSxHQUFhLElBQUMsQ0FBQSxPQUFPLENBQUMsY0FBVCxDQUF3QixNQUF4QixFQUFnQztRQUFBLElBQUEsRUFBTSxNQUFOO1FBQWMsQ0FBQSxLQUFBLENBQUEsRUFBTyxVQUFyQjtRQUFpQyxNQUFBLEVBQVEsV0FBekM7T0FBaEM7TUFDYixJQUFDLENBQUEscUJBQXNCLENBQUEsRUFBQSxDQUF2QixHQUE2QjthQUM3QixJQUFDLENBQUEsaUNBQWtDLENBQUEsRUFBQSxDQUFuQyxHQUF5QyxVQUFVLENBQUMsWUFBWCxDQUF3QixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7VUFDL0QsS0FBQyxDQUFBLGlDQUFrQyxDQUFBLEVBQUEsQ0FBRyxDQUFDLE9BQXZDLENBQUE7VUFFQSxPQUFPLEtBQUMsQ0FBQSxxQkFBc0IsQ0FBQSxFQUFBO2lCQUM5QixPQUFPLEtBQUMsQ0FBQSxpQ0FBa0MsQ0FBQSxFQUFBO1FBSnFCO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF4QjtJQUo3Qjs7c0NBVWQsT0FBQSxHQUFTLFNBQUE7QUFDUCxVQUFBO0FBQUE7QUFBQSxXQUFBLFNBQUE7O1FBQ0UsSUFBQyxDQUFBLGlDQUFrQyxDQUFBLEVBQUEsQ0FBRyxDQUFDLE9BQXZDLENBQUE7UUFDQSxVQUFVLENBQUMsT0FBWCxDQUFBO1FBRUEsT0FBTyxJQUFDLENBQUEscUJBQXNCLENBQUEsRUFBQTtRQUM5QixPQUFPLElBQUMsQ0FBQSxpQ0FBa0MsQ0FBQSxFQUFBO0FBTDVDO2FBT0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxPQUFmLENBQUE7SUFSTzs7Ozs7QUF2Q1giLCJzb3VyY2VzQ29udGVudCI6WyJ7Q29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBNaW5pbWFwQm9va21hcmtzQmluZGluZ1xuICBjb25zdHJ1Y3RvcjogKEBtaW5pbWFwLCBAYm9va21hcmtzKSAtPlxuICAgIEBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBAZWRpdG9yID0gQG1pbmltYXAuZ2V0VGV4dEVkaXRvcigpXG4gICAgQGRlY29yYXRpb25zQnlNYXJrZXJJZCA9IHt9XG4gICAgQGRlY29yYXRpb25TdWJzY3JpcHRpb25zQnlNYXJrZXJJZCA9IHt9XG5cbiAgICAjIFdlIG5lZWQgdG8gd2FpdCB1bnRpbCB0aGUgYm9va21hcmtzIHBhY2thZ2UgaGFkIGNyZWF0ZWQgaXRzIG1hcmtlclxuICAgICMgbGF5ZXIgYmVmb3JlIHJldHJpZXZpbmcgaXRzIGlkIGZyb20gdGhlIHN0YXRlLlxuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSA9PlxuICAgICAgIyBBbHNvLCB0YXJnZXRpbmcgcHJpdmF0ZSBwcm9wZXJ0aWVzIG9uIGF0b20ucGFja2FnZXMgaXMgdmVyeSBicml0dGxlLlxuICAgICAgIyBETyBOT1QgRE8gVEhBVCFcbiAgICAgICNcbiAgICAgICMgSWYgd2UgcmVhbGx5IGhhdmUgdG8gZ2V0IHRoZSBtYXJrZXIgbGF5ZXIgaWQgZnJvbSB0aGVcbiAgICAgICMgc3RhdGUgKHdoaWNoIGNhbiBhbHJlYWR5IGJyZWFrIGVhc2lseSkgaXQncyBiZXR0ZXIgdG8gZ2V0IGl0IGZyb20gdGhlXG4gICAgICAjIHBhY2thZ2UgYHNlcmlhbGl6ZWAgbWV0aG9kIHNpbmNlIGl0J3MgYW4gQVBJIHRoYXQgaXMgcHVibGljIGFuZCBpc1xuICAgICAgIyB1bmxpa2VseSB0byBjaGFuZ2UgaW4gYSBuZWFyIGZ1dHVyZS5cbiAgICAgIGlkID0gQGJvb2ttYXJrcy5zZXJpYWxpemUoKVtAZWRpdG9yLmlkXT8ubWFya2VyTGF5ZXJJZFxuICAgICAgbWFya2VyTGF5ZXIgPSBAZWRpdG9yLmdldE1hcmtlckxheWVyKGlkKVxuXG4gICAgICBpZiBtYXJrZXJMYXllcj9cbiAgICAgICAgQHN1YnNjcmlwdGlvbnMuYWRkIG1hcmtlckxheWVyLm9uRGlkQ3JlYXRlTWFya2VyIChtYXJrZXIpID0+XG4gICAgICAgICAgQGhhbmRsZU1hcmtlcihtYXJrZXIpXG5cbiAgICAgICAgbWFya2VyTGF5ZXIuZmluZE1hcmtlcnMoKS5mb3JFYWNoIChtYXJrZXIpID0+IEBoYW5kbGVNYXJrZXIobWFya2VyKVxuXG4gIGhhbmRsZU1hcmtlcjogKG1hcmtlcikgLT5cbiAgICB7aWR9ID0gbWFya2VyXG4gICAgZGVjb3JhdGlvbiA9IEBtaW5pbWFwLmRlY29yYXRlTWFya2VyKG1hcmtlciwgdHlwZTogJ2xpbmUnLCBjbGFzczogJ2Jvb2ttYXJrJywgcGx1Z2luOiAnYm9va21hcmtzJylcbiAgICBAZGVjb3JhdGlvbnNCeU1hcmtlcklkW2lkXSA9IGRlY29yYXRpb25cbiAgICBAZGVjb3JhdGlvblN1YnNjcmlwdGlvbnNCeU1hcmtlcklkW2lkXSA9IGRlY29yYXRpb24ub25EaWREZXN0cm95ID0+XG4gICAgICBAZGVjb3JhdGlvblN1YnNjcmlwdGlvbnNCeU1hcmtlcklkW2lkXS5kaXNwb3NlKClcblxuICAgICAgZGVsZXRlIEBkZWNvcmF0aW9uc0J5TWFya2VySWRbaWRdXG4gICAgICBkZWxldGUgQGRlY29yYXRpb25TdWJzY3JpcHRpb25zQnlNYXJrZXJJZFtpZF1cblxuICBkZXN0cm95OiAtPlxuICAgIGZvciBpZCxkZWNvcmF0aW9uIG9mIEBkZWNvcmF0aW9uc0J5TWFya2VySWRcbiAgICAgIEBkZWNvcmF0aW9uU3Vic2NyaXB0aW9uc0J5TWFya2VySWRbaWRdLmRpc3Bvc2UoKVxuICAgICAgZGVjb3JhdGlvbi5kZXN0cm95KClcblxuICAgICAgZGVsZXRlIEBkZWNvcmF0aW9uc0J5TWFya2VySWRbaWRdXG4gICAgICBkZWxldGUgQGRlY29yYXRpb25TdWJzY3JpcHRpb25zQnlNYXJrZXJJZFtpZF1cblxuICAgIEBzdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuIl19
