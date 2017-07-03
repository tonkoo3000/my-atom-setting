(function() {
  var CompositeDisposable, ResolverView, View, handleErr,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  CompositeDisposable = require('atom').CompositeDisposable;

  View = require('space-pen').View;

  handleErr = require('./error-view').handleErr;

  ResolverView = (function(superClass) {
    extend(ResolverView, superClass);

    function ResolverView() {
      return ResolverView.__super__.constructor.apply(this, arguments);
    }

    ResolverView.content = function(editor, state, pkg) {
      var resolveText;
      resolveText = state.context.resolveText;
      return this.div({
        "class": 'overlay from-top resolver'
      }, (function(_this) {
        return function() {
          _this.div({
            "class": 'block text-highlight'
          }, "We're done here");
          _this.div({
            "class": 'block'
          }, function() {
            _this.div({
              "class": 'block text-info'
            }, function() {
              return _this.text("You've dealt with all of the conflicts in this file.");
            });
            return _this.div({
              "class": 'block text-info'
            }, function() {
              _this.span({
                outlet: 'actionText'
              }, "Save and " + resolveText);
              return _this.text(' this file?');
            });
          });
          _this.div({
            "class": 'pull-left'
          }, function() {
            return _this.button({
              "class": 'btn btn-primary',
              click: 'dismiss'
            }, 'Maybe Later');
          });
          return _this.div({
            "class": 'pull-right'
          }, function() {
            return _this.button({
              "class": 'btn btn-primary',
              click: 'resolve'
            }, resolveText);
          });
        };
      })(this));
    };

    ResolverView.prototype.initialize = function(editor1, state1, pkg1) {
      this.editor = editor1;
      this.state = state1;
      this.pkg = pkg1;
      this.subs = new CompositeDisposable();
      this.refresh();
      this.subs.add(this.editor.onDidSave((function(_this) {
        return function() {
          return _this.refresh();
        };
      })(this)));
      return this.subs.add(atom.commands.add(this.element, 'merge-conflicts:quit', (function(_this) {
        return function() {
          return _this.dismiss();
        };
      })(this)));
    };

    ResolverView.prototype.detached = function() {
      return this.subs.dispose();
    };

    ResolverView.prototype.getModel = function() {
      return null;
    };

    ResolverView.prototype.relativePath = function() {
      return this.state.relativize(this.editor.getURI());
    };

    ResolverView.prototype.refresh = function() {
      return this.state.context.isResolvedFile(this.relativePath()).then((function(_this) {
        return function(resolved) {
          var modified, needsResolve, needsSaved, resolveText;
          modified = _this.editor.isModified();
          needsSaved = modified;
          needsResolve = modified || !resolved;
          if (!(needsSaved || needsResolve)) {
            _this.hide('fast', function() {
              return _this.remove();
            });
            _this.pkg.didResolveFile({
              file: _this.editor.getURI()
            });
            return;
          }
          resolveText = _this.state.context.resolveText;
          if (needsSaved) {
            return _this.actionText.text("Save and " + (resolveText.toLowerCase()));
          } else if (needsResolve) {
            return _this.actionText.text(resolveText);
          }
        };
      })(this))["catch"](handleErr);
    };

    ResolverView.prototype.resolve = function() {
      return Promise.resolve(this.editor.save()).then((function(_this) {
        return function() {
          return _this.state.context.resolveFile(_this.relativePath()).then(function() {
            return _this.refresh();
          })["catch"](handleErr);
        };
      })(this));
    };

    ResolverView.prototype.dismiss = function() {
      return this.hide('fast', (function(_this) {
        return function() {
          return _this.remove();
        };
      })(this));
    };

    return ResolverView;

  })(View);

  module.exports = {
    ResolverView: ResolverView
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvdG95b2tpLy5hdG9tL3BhY2thZ2VzL21lcmdlLWNvbmZsaWN0cy9saWIvdmlldy9yZXNvbHZlci12aWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsa0RBQUE7SUFBQTs7O0VBQUMsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSOztFQUN2QixPQUFRLE9BQUEsQ0FBUSxXQUFSOztFQUVSLFlBQWEsT0FBQSxDQUFRLGNBQVI7O0VBRVI7Ozs7Ozs7SUFFSixZQUFDLENBQUEsT0FBRCxHQUFVLFNBQUMsTUFBRCxFQUFTLEtBQVQsRUFBZ0IsR0FBaEI7QUFDUixVQUFBO01BQUEsV0FBQSxHQUFjLEtBQUssQ0FBQyxPQUFPLENBQUM7YUFDNUIsSUFBQyxDQUFBLEdBQUQsQ0FBSztRQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sMkJBQVA7T0FBTCxFQUF5QyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7VUFDdkMsS0FBQyxDQUFBLEdBQUQsQ0FBSztZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sc0JBQVA7V0FBTCxFQUFvQyxpQkFBcEM7VUFDQSxLQUFDLENBQUEsR0FBRCxDQUFLO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxPQUFQO1dBQUwsRUFBcUIsU0FBQTtZQUNuQixLQUFDLENBQUEsR0FBRCxDQUFLO2NBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxpQkFBUDthQUFMLEVBQStCLFNBQUE7cUJBQzdCLEtBQUMsQ0FBQSxJQUFELENBQU0sc0RBQU47WUFENkIsQ0FBL0I7bUJBRUEsS0FBQyxDQUFBLEdBQUQsQ0FBSztjQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8saUJBQVA7YUFBTCxFQUErQixTQUFBO2NBQzdCLEtBQUMsQ0FBQSxJQUFELENBQU07Z0JBQUEsTUFBQSxFQUFRLFlBQVI7ZUFBTixFQUE0QixXQUFBLEdBQVksV0FBeEM7cUJBQ0EsS0FBQyxDQUFBLElBQUQsQ0FB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S0FBQyxDQUFBLFVBQVUsQ0FBQyxJQUFaLENBQWlCLFdBQWpCLEVBREc7O1FBZEQ7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBRE4sQ0FpQkEsRUFBQyxLQUFELEVBakJBLENBaUJPLFNBakJQO0lBRE87OzJCQW9CVCxPQUFBLEdBQVMsU0FBQTthQUVQLE9BQU8sQ0FBQyxPQUFSLENBQWdCLElBQUMsQ0FBQSxNQUFNLENBQUMsSUFBUixDQUFBLENBQWhCLENBQStCLENBQUMsSUFBaEMsQ0FBcUMsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUNuQyxLQUFDLENBQUEsS0FBSyxDQUFDLE9BQU8sQ0FBQyxXQUFmLENBQTJCLEtBQUMsQ0FBQSxZQUFELENBQUEsQ0FBM0IsQ0FDQSxDQUFDLElBREQsQ0FDTSxTQUFBO21CQUNKLEtBQUMsQ0FBQSxPQUFELENBQUE7VUFESSxDQUROLENBR0EsRUFBQyxLQUFELEVBSEEsQ0FHTyxTQUhQO1FBRG1DO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFyQztJQUZPOzsyQkFRVCxPQUFBLEdBQVMsU0FBQTthQUNQLElBQUMsQ0FBQSxJQUFELENBQU0sTUFBTixFQUFjLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtpQkFBRyxLQUFDLENBQUEsTUFBRCxDQUFBO1FBQUg7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWQ7SUFETzs7OztLQTVEZ0I7O0VBK0QzQixNQUFNLENBQUMsT0FBUCxHQUNFO0lBQUEsWUFBQSxFQUFjLFlBQWQ7O0FBckVGIiwic291cmNlc0NvbnRlbnQiOlsie0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcbntWaWV3fSA9IHJlcXVpcmUgJ3NwYWNlLXBlbidcblxue2hhbmRsZUVycn0gPSByZXF1aXJlICcuL2Vycm9yLXZpZXcnXG5cbmNsYXNzIFJlc29sdmVyVmlldyBleHRlbmRzIFZpZXdcblxuICBAY29udGVudDogKGVkaXRvciwgc3RhdGUsIHBrZykgLT5cbiAgICByZXNvbHZlVGV4dCA9IHN0YXRlLmNvbnRleHQucmVzb2x2ZVRleHRcbiAgICBAZGl2IGNsYXNzOiAnb3ZlcmxheSBmcm9tLXRvcCByZXNvbHZlcicsID0+XG4gICAgICBAZGl2IGNsYXNzOiAnYmxvY2sgdGV4dC1oaWdobGlnaHQnLCBcIldlJ3JlIGRvbmUgaGVyZVwiXG4gICAgICBAZGl2IGNsYXNzOiAnYmxvY2snLCA9PlxuICAgICAgICBAZGl2IGNsYXNzOiAnYmxvY2sgdGV4dC1pbmZvJywgPT5cbiAgICAgICAgICBAdGV4dCBcIllvdSd2ZSBkZWFsdCB3aXRoIGFsbCBvZiB0aGUgY29uZmxpY3RzIGluIHRoaXMgZmlsZS5cIlxuICAgICAgICBAZGl2IGNsYXNzOiAnYmxvY2sgdGV4dC1pbmZvJywgPT5cbiAgICAgICAgICBAc3BhbiBvdXRsZXQ6ICdhY3Rpb25UZXh0JywgXCJTYXZlIGFuZCAje3Jlc29sdmVUZXh0fVwiXG4gICAgICAgICAgQHRleHQgJyB0aGlzIGZpbGU/J1xuICAgICAgQGRpdiBjbGFzczogJ3B1bGwtbGVmdCcsID0+XG4gICAgICAgIEBidXR0b24gY2xhc3M6ICdidG4gYnRuLXByaW1hcnknLCBjbGljazogJ2Rpc21pc3MnLCAnTWF5YmUgTGF0ZXInXG4gICAgICBAZGl2IGNsYXNzOiAncHVsbC1yaWdodCcsID0+XG4gICAgICAgIEBidXR0b24gY2xhc3M6ICdidG4gYnRuLXByaW1hcnknLCBjbGljazogJ3Jlc29sdmUnLCByZXNvbHZlVGV4dFxuXG4gIGluaXRpYWxpemU6IChAZWRpdG9yLCBAc3RhdGUsIEBwa2cpIC0+XG4gICAgQHN1YnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG5cbiAgICBAcmVmcmVzaCgpXG4gICAgQHN1YnMuYWRkIEBlZGl0b3Iub25EaWRTYXZlID0+IEByZWZyZXNoKClcblxuICAgIEBzdWJzLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCBAZWxlbWVudCwgJ21lcmdlLWNvbmZsaWN0czpxdWl0JywgPT4gQGRpc21pc3MoKVxuXG4gIGRldGFjaGVkOiAtPiBAc3Vicy5kaXNwb3NlKClcblxuICBnZXRNb2RlbDogLT4gbnVsbFxuXG4gIHJlbGF0aXZlUGF0aDogLT5cbiAgICBAc3RhdGUucmVsYXRpdml6ZSBAZWRpdG9yLmdldFVSSSgpXG5cbiAgcmVmcmVzaDogLT5cbiAgICBAc3RhdGUuY29udGV4dC5pc1Jlc29sdmVkRmlsZSBAcmVsYXRpdmVQYXRoKClcbiAgICAudGhlbiAocmVzb2x2ZWQpID0+XG4gICAgICBtb2RpZmllZCA9IEBlZGl0b3IuaXNNb2RpZmllZCgpXG5cbiAgICAgIG5lZWRzU2F2ZWQgPSBtb2RpZmllZFxuICAgICAgbmVlZHNSZXNvbHZlID0gbW9kaWZpZWQgb3Igbm90IHJlc29sdmVkXG5cbiAgICAgIHVubGVzcyBuZWVkc1NhdmVkIG9yIG5lZWRzUmVzb2x2ZVxuICAgICAgICBAaGlkZSAnZmFzdCcsID0+IEByZW1vdmUoKVxuICAgICAgICBAcGtnLmRpZFJlc29sdmVGaWxlIGZpbGU6IEBlZGl0b3IuZ2V0VVJJKClcbiAgICAgICAgcmV0dXJuXG5cbiAgICAgIHJlc29sdmVUZXh0ID0gQHN0YXRlLmNvbnRleHQucmVzb2x2ZVRleHRcbiAgICAgIGlmIG5lZWRzU2F2ZWRcbiAgICAgICAgQGFjdGlvblRleHQudGV4dCBcIlNhdmUgYW5kICN7cmVzb2x2ZVRleHQudG9Mb3dlckNhc2UoKX1cIlxuICAgICAgZWxzZSBpZiBuZWVkc1Jlc29sdmVcbiAgICAgICAgQGFjdGlvblRleHQudGV4dCByZXNvbHZlVGV4dFxuICAgIC5jYXRjaCBoYW5kbGVFcnJcblxuICByZXNvbHZlOiAtPlxuICAgICMgU3Vwb3J0IGFzeW5jIHNhdmUgaW1wbGVtZW50YXRpb25zLlxuICAgIFByb21pc2UucmVzb2x2ZShAZWRpdG9yLnNhdmUoKSkudGhlbiA9PlxuICAgICAgQHN0YXRlLmNvbnRleHQucmVzb2x2ZUZpbGUgQHJlbGF0aXZlUGF0aCgpXG4gICAgICAudGhlbiA9PlxuICAgICAgICBAcmVmcmVzaCgpXG4gICAgICAuY2F0Y2ggaGFuZGxlRXJyXG5cbiAgZGlzbWlzczogLT5cbiAgICBAaGlkZSAnZmFzdCcsID0+IEByZW1vdmUoKVxuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIFJlc29sdmVyVmlldzogUmVzb2x2ZXJWaWV3XG4iXX0=
