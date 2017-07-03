(function() {
  var CompositeDisposable, Emitter, GitOps, MergeConflictsView, pkgApi, pkgEmitter, ref;

  ref = require('atom'), CompositeDisposable = ref.CompositeDisposable, Emitter = ref.Emitter;

  MergeConflictsView = require('./view/merge-conflicts-view').MergeConflictsView;

  GitOps = require('./git').GitOps;

  pkgEmitter = null;

  pkgApi = null;

  module.exports = {
    activate: function(state) {
      this.subs = new CompositeDisposable;
      this.emitter = new Emitter;
      MergeConflictsView.registerContextApi(GitOps);
      pkgEmitter = {
        onDidResolveConflict: (function(_this) {
          return function(callback) {
            return _this.onDidResolveConflict(callback);
          };
        })(this),
        didResolveConflict: (function(_this) {
          return function(event) {
            return _this.emitter.emit('did-resolve-conflict', event);
          };
        })(this),
        onDidResolveFile: (function(_this) {
          return function(callback) {
            return _this.onDidResolveFile(callback);
          };
        })(this),
        didResolveFile: (function(_this) {
          return function(event) {
            return _this.emitter.emit('did-resolve-file', event);
          };
        })(this),
        onDidQuitConflictResolution: (function(_this) {
          return function(callback) {
            return _this.onDidQuitConflictResolution(callback);
          };
        })(this),
        didQuitConflictResolution: (function(_this) {
          return function() {
            return _this.emitter.emit('did-quit-conflict-resolution');
          };
        })(this),
        onDidCompleteConflictResolution: (function(_this) {
          return function(callback) {
            return _this.onDidCompleteConflictResolution(callback);
          };
        })(this),
        didCompleteConflictResolution: (function(_this) {
          return function() {
            return _this.emitter.emit('did-complete-conflict-resolution');
          };
        })(this)
      };
      return this.subs.add(atom.commands.add('atom-workspace', 'merge-conflicts:detect', function() {
        return MergeConflictsView.detect(pkgEmitter);
      }));
    },
    deactivate: function() {
      this.subs.dispose();
      return this.emitter.dispose();
    },
    config: {
      gitPath: {
        type: 'string',
        "default": '',
        description: 'Absolute path to your git executable.'
      }
    },
    onDidResolveConflict: function(callback) {
      return this.emitter.on('did-resolve-conflict', callback);
    },
    onDidResolveFile: function(callback) {
      return this.emitter.on('did-resolve-file', callback);
    },
    onDidQuitConflictResolution: function(callback) {
      return this.emitter.on('did-quit-conflict-resolution', callback);
    },
    onDidCompleteConflictResolution: function(callback) {
      return this.emitter.on('did-complete-conflict-resolution', callback);
    },
    registerContextApi: function(contextApi) {
      return MergeConflictsView.registerContextApi(contextApi);
    },
    showForContext: function(context) {
      return MergeConflictsView.showForContext(context, pkgEmitter);
    },
    hideForContext: function(context) {
      return MergeConflictsView.hideForContext(context);
    },
    provideApi: function() {
      if (pkgApi === null) {
        pkgApi = Object.freeze({
          registerContextApi: this.registerContextApi,
          showForContext: this.showForContext,
          hideForContext: this.hideForContext,
          onDidResolveConflict: pkgEmitter.onDidResolveConflict,
          onDidResolveFile: pkgEmitter.onDidResolveConflict,
          onDidQuitConflictResolution: pkgEmitter.onDidQuitConflictResolution,
          onDidCompleteConflictResolution: pkgEmitter.onDidCompleteConflictResolution
        });
      }
      return pkgApi;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvdG95b2tpLy5hdG9tL3BhY2thZ2VzL21lcmdlLWNvbmZsaWN0cy9saWIvbWFpbi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLE1BQWlDLE9BQUEsQ0FBUSxNQUFSLENBQWpDLEVBQUMsNkNBQUQsRUFBc0I7O0VBRXJCLHFCQUFzQixPQUFBLENBQVEsNkJBQVI7O0VBQ3RCLFNBQVUsT0FBQSxDQUFRLE9BQVI7O0VBRVgsVUFBQSxHQUFhOztFQUNiLE1BQUEsR0FBUzs7RUFFVCxNQUFNLENBQUMsT0FBUCxHQUVFO0lBQUEsUUFBQSxFQUFVLFNBQUMsS0FBRDtNQUNSLElBQUMsQ0FBQSxJQUFELEdBQVEsSUFBSTtNQUNaLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBSTtNQUVmLGtCQUFrQixDQUFDLGtCQUFuQixDQUFzQyxNQUF0QztNQUVBLFVBQUEsR0FDRTtRQUFBLG9CQUFBLEVBQXNCLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUMsUUFBRDttQkFBYyxLQUFDLENBQUEsb0JBQUQsQ0FBc0IsUUFBdEI7VUFBZDtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdEI7UUFDQSxrQkFBQSxFQUFvQixDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFDLEtBQUQ7bUJBQVcsS0FBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsc0JBQWQsRUFBc0MsS0FBdEM7VUFBWDtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FEcEI7UUFFQSxnQkFBQSxFQUFrQixDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFDLFFBQUQ7bUJBQWMsS0FBQyxDQUFBLGdCQUFELENBQWtCLFFBQWxCO1VBQWQ7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBRmxCO1FBR0EsY0FBQSxFQUFnQixDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFDLEtBQUQ7bUJBQVcsS0FBQyxDQUFBLE9BQU8sQ0FBQyxJ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LFVBQVUsQ0FBQywyQkFObkI7VUFPckIsK0JBQUEsRUFBaUMsVUFBVSxDQUFDLCtCQVB2QjtTQUFkLEVBRFg7O2FBVUE7SUFYVSxDQWhFWjs7QUFWRiIsInNvdXJjZXNDb250ZW50IjpbIntDb21wb3NpdGVEaXNwb3NhYmxlLCBFbWl0dGVyfSA9IHJlcXVpcmUgJ2F0b20nXG5cbntNZXJnZUNvbmZsaWN0c1ZpZXd9ID0gcmVxdWlyZSAnLi92aWV3L21lcmdlLWNvbmZsaWN0cy12aWV3J1xue0dpdE9wc30gPSByZXF1aXJlICcuL2dpdCdcblxucGtnRW1pdHRlciA9IG51bGw7XG5wa2dBcGkgPSBudWxsO1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5cbiAgYWN0aXZhdGU6IChzdGF0ZSkgLT5cbiAgICBAc3VicyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgQGVtaXR0ZXIgPSBuZXcgRW1pdHRlclxuXG4gICAgTWVyZ2VDb25mbGljdHNWaWV3LnJlZ2lzdGVyQ29udGV4dEFwaShHaXRPcHMpO1xuXG4gICAgcGtnRW1pdHRlciA9XG4gICAgICBvbkRpZFJlc29sdmVDb25mbGljdDogKGNhbGxiYWNrKSA9PiBAb25EaWRSZXNvbHZlQ29uZmxpY3QoY2FsbGJhY2spXG4gICAgICBkaWRSZXNvbHZlQ29uZmxpY3Q6IChldmVudCkgPT4gQGVtaXR0ZXIuZW1pdCAnZGlkLXJlc29sdmUtY29uZmxpY3QnLCBldmVudFxuICAgICAgb25EaWRSZXNvbHZlRmlsZTogKGNhbGxiYWNrKSA9PiBAb25EaWRSZXNvbHZlRmlsZShjYWxsYmFjaylcbiAgICAgIGRpZFJlc29sdmVGaWxlOiAoZXZlbnQpID0+IEBlbWl0dGVyLmVtaXQgJ2RpZC1yZXNvbHZlLWZpbGUnLCBldmVudFxuICAgICAgb25EaWRRdWl0Q29uZmxpY3RSZXNvbHV0aW9uOiAoY2FsbGJhY2spID0+IEBvbkRpZFF1aXRDb25mbGljdFJlc29sdXRpb24oY2FsbGJhY2spXG4gICAgICBkaWRRdWl0Q29uZmxpY3RSZXNvbHV0aW9uOiA9PiBAZW1pdHRlci5lbWl0ICdkaWQtcXVpdC1jb25mbGljdC1yZXNvbHV0aW9uJ1xuICAgICAgb25EaWRDb21wbGV0ZUNvbmZsaWN0UmVzb2x1dGlvbjogKGNhbGxiYWNrKSA9PiBAb25EaWRDb21wbGV0ZUNvbmZsaWN0UmVzb2x1dGlvbihjYWxsYmFjaylcbiAgICAgIGRpZENvbXBsZXRlQ29uZmxpY3RSZXNvbHV0aW9uOiA9PiBAZW1pdHRlci5lbWl0ICdkaWQtY29tcGxldGUtY29uZmxpY3QtcmVzb2x1dGlvbidcblxuICAgIEBzdWJzLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLCAnbWVyZ2UtY29uZmxpY3RzOmRldGVjdCcsIC0+XG4gICAgICBNZXJnZUNvbmZsaWN0c1ZpZXcuZGV0ZWN0KHBrZ0VtaXR0ZXIpXG5cbiAgZGVhY3RpdmF0ZTogLT5cbiAgICBAc3Vicy5kaXNwb3NlKClcbiAgICBAZW1pdHRlci5kaXNwb3NlKClcblxuICBjb25maWc6XG4gICAgZ2l0UGF0aDpcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZWZhdWx0OiAnJ1xuICAgICAgZGVzY3JpcHRpb246ICdBYnNvbHV0ZSBwYXRoIHRvIHlvdXIgZ2l0IGV4ZWN1dGFibGUuJ1xuXG4gICMgSW52b2tlIGEgY2FsbGJhY2sgZWFjaCB0aW1lIHRoYXQgYW4gaW5kaXZpZHVhbCBjb25mbGljdCBpcyByZXNvbHZlZC5cbiAgI1xuICBvbkRpZFJlc29sdmVDb25mbGljdDogKGNhbGxiYWNrKSAtPlxuICAgIEBlbWl0dGVyLm9uICdkaWQtcmVzb2x2ZS1jb25mbGljdCcsIGNhbGxiYWNrXG5cbiAgIyBJbnZva2UgYSBjYWxsYmFjayBlYWNoIHRpbWUgdGhhdCBhIGNvbXBsZXRlZCBmaWxlIGlzIHJlc29sdmVkLlxuICAjXG4gIG9uRGlkUmVzb2x2ZUZpbGU6IChjYWxsYmFjaykgLT5cbiAgICBAZW1pdHRlci5vbiAnZGlkLXJlc29sdmUtZmlsZScsIGNhbGxiYWNrXG5cbiAgIyBJbnZva2UgYSBjYWxsYmFjayBpZiBjb25mbGljdCByZXNvbHV0aW9uIGlzIHByZW1hdHVyZWx5IGV4aXRlZCwgd2hpbGUgY29uZmxpY3RzIHJlbWFpblxuICAjIHVucmVzb2x2ZWQuXG4gICNcbiAgb25EaWRRdWl0Q29uZmxpY3RSZXNvbHV0aW9uOiAoY2FsbGJhY2spIC0+XG4gICAgQGVtaXR0ZXIub24gJ2RpZC1xdWl0LWNvbmZsaWN0LXJlc29sdXRpb24nLCBjYWxsYmFja1xuXG4gICMgSW52b2tlIGEgY2FsbGJhY2sgaWYgY29uZmxpY3QgcmVzb2x1dGlvbiBpcyBjb21wbGV0ZWQgc3VjY2Vzc2Z1bGx5LCB3aXRoIGFsbCBjb25mbGljdHMgcmVzb2x2ZWRcbiAgIyBhbmQgYWxsIGZpbGVzIHJlc29sdmVkLlxuICAjXG4gIG9uRGlkQ29tcGxldGVDb25mbGljdFJlc29sdXRpb246IChjYWxsYmFjaykgLT5cbiAgICBAZW1pdHRlci5vbiAnZGlkLWNvbXBsZXRlLWNvbmZsaWN0LXJlc29sdXRpb24nLCBjYWxsYmFja1xuXG4gICMgUmVnaXN0ZXIgYSByZXBvc2l0b3J5IGNvbnRleHQgcHJvdmlkZXIgdGhhdCB3aWxsIGhhdmUgZnVuY3Rpb25hbGl0eSBmb3JcbiAgIyByZXRyaWV2aW5nIGFuZCByZXNvbHZpbmcgY29uZmxpY3RzLlxuICAjXG4gIHJlZ2lzdGVyQ29udGV4dEFwaTogKGNvbnRleHRBcGkpIC0+XG4gICAgTWVyZ2VDb25mbGljdHNWaWV3LnJlZ2lzdGVyQ29udGV4dEFwaShjb250ZXh0QXBpKVxuXG5cbiAgc2hvd0ZvckNvbnRleHQ6IChjb250ZXh0KSAtPlxuICAgIE1lcmdlQ29uZmxpY3RzVmlldy5zaG93Rm9yQ29udGV4dChjb250ZXh0LCBwa2dFbWl0dGVyKVxuXG4gIGhpZGVGb3JDb250ZXh0OiAoY29udGV4dCkgLT5cbiAgICBNZXJnZUNvbmZsaWN0c1ZpZXcuaGlkZUZvckNvbnRleHQoY29udGV4dClcblxuICBwcm92aWRlQXBpOiAtPlxuICAgIGlmIChwa2dBcGkgPT0gbnVsbClcbiAgICAgIHBrZ0FwaSA9IE9iamVjdC5mcmVlemUoe1xuICAgICAgICByZWdpc3RlckNvbnRleHRBcGk6IEByZWdpc3RlckNvbnRleHRBcGksXG4gICAgICAgIHNob3dGb3JDb250ZXh0OiBAc2hvd0ZvckNvbnRleHQsXG4gICAgICAgIGhpZGVGb3JDb250ZXh0OiBAaGlkZUZvckNvbnRleHQsXG4gICAgICAgIG9uRGlkUmVzb2x2ZUNvbmZsaWN0OiBwa2dFbWl0dGVyLm9uRGlkUmVzb2x2ZUNvbmZsaWN0LFxuICAgICAgICBvbkRpZFJlc29sdmVGaWxlOiBwa2dFbWl0dGVyLm9uRGlkUmVzb2x2ZUNvbmZsaWN0LFxuICAgICAgICBvbkRpZFF1aXRDb25mbGljdFJlc29sdXRpb246IHBrZ0VtaXR0ZXIub25EaWRRdWl0Q29uZmxpY3RSZXNvbHV0aW9uLFxuICAgICAgICBvbkRpZENvbXBsZXRlQ29uZmxpY3RSZXNvbHV0aW9uOiBwa2dFbWl0dGVyLm9uRGlkQ29tcGxldGVDb25mbGljdFJlc29sdXRpb24sXG4gICAgICB9KVxuICAgIHBrZ0FwaVxuIl19
