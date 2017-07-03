(function() {
  var PathsProvider, Range, fs, fuzzaldrin, path,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Range = require('atom').Range;

  fuzzaldrin = require('fuzzaldrin');

  path = require('path');

  fs = require('fs');

  module.exports = PathsProvider = (function() {
    function PathsProvider() {
      this.dispose = bind(this.dispose, this);
      this.prefixForCursor = bind(this.prefixForCursor, this);
      this.requestHandler = bind(this.requestHandler, this);
    }

    PathsProvider.prototype.id = 'autocomplete-paths-pathsprovider';

    PathsProvider.prototype.selector = '*';

    PathsProvider.prototype.wordRegex = /(?:[a-zA-Z]:)?[a-zA-Z0-9.\/\\_-]*(?:\/|\\\\?)[a-zA-Z0-9.\/\\_-]*/g;

    PathsProvider.prototype.cache = [];

    PathsProvider.prototype.requestHandler = function(options) {
      var basePath, editorPath, prefix, ref, suggestions;
      if (options == null) {
        options = {};
      }
      if (!((options.editor != null) && (options.buffer != null) && (options.cursor != null))) {
        return [];
      }
      editorPath = (ref = options.editor) != null ? ref.getPath() : void 0;
      if (!(editorPath != null ? editorPath.length : void 0)) {
        return [];
      }
      basePath = path.dirname(editorPath);
      if (basePath == null) {
        return [];
      }
      prefix = this.prefixForCursor(options.editor, options.buffer, options.cursor, options.position);
      if (!(prefix.length > atom.config.get('autocomplete-plus.minimumWordLength'))) {
        return [];
      }
      suggestions = this.findSuggestionsForPrefix(options.editor, basePath, prefix);
      if (!suggestions.length) {
        return [];
      }
      return suggestions;
    };

    PathsProvider.prototype.prefixForCursor = function(editor, buffer, cursor, position) {
      var end, start;
      if (!((buffer != null) && (cursor != null))) {
        return '';
      }
      start = this.getBeginningOfCurrentWordBufferPosition(editor, position, {
        wordRegex: this.wordRegex
      });
      end = cursor.getBufferPosition();
      if (!((start != null) && (end != null))) {
        return '';
      }
      return buffer.getTextInRange(new Range(start, end));
    };

    PathsProvider.prototype.getBeginningOfCurrentWordBufferPosition = function(editor, position, options) {
      var allowPrevious, beginningOfWordPosition, currentBufferPosition, ref, scanRange;
      if (options == null) {
        options = {};
      }
      if (position == null) {
        return;
      }
      allowPrevious = (ref = options.allowPrevious) != null ? ref : true;
      currentBufferPosition = position;
      scanRange = [[currentBufferPosition.row, 0], currentBufferPosition];
      beginningOfWordPosition = null;
      editor.backwardsScanInBufferRange(options.wordRegex, scanRange, function(arg) {
        var range, stop;
        range = arg.range, stop = arg.stop;
        if (range.end.isGreaterThanOrEqual(currentBufferPosition) || allowPrevious) {
          beginningOfWordPosition = range.start;
        }
        if (!(beginningOfWordPosition != null ? beginningOfWordPosition.isEqual(currentBufferPosition) : void 0)) {
          return stop();
        }
      });
      if (beginningOfWordPosition != null) {
        return beginningOfWordPosition;
      } else if (allowPrevious) {
        return [currentBufferPosition.row, 0];
      } else {
        return currentBufferPosition;
      }
    };

    PathsProvider.prototype.findSuggestionsForPrefix = function(editor, basePath, prefix) {
      var directory, e, files, label, prefixPath, result, resultPath, results, stat, suggestion, suggestions;
      if (basePath == null) {
        return [];
      }
      prefixPath = path.resolve(basePath, prefix);
      if (prefix.match(/[\/\\]$/)) {
        directory = prefixPath;
        prefix = '';
      } else {
        if (basePath === prefixPath) {
          directory = prefixPath;
        } else {
          directory = path.dirname(prefixPath);
        }
        prefix = path.basename(prefix);
      }
      try {
        stat = fs.statSync(directory);
        if (!stat.isDirectory()) {
          return [];
        }
      } catch (error) {
        e = error;
        return [];
      }
      try {
        files = fs.readdirSync(directory);
      } catch (error) {
        e = error;
        return [];
      }
      results = fuzzaldrin.filter(files, prefix);
      suggestions = (function() {
        var i, len, results1;
        results1 = [];
        for (i = 0, len = results.length; i < len; i++) {
          result = results[i];
          resultPath = path.resolve(directory, result);
          try {
            stat = fs.statSync(resultPath);
          } catch (error) {
            e = error;
            continue;
          }
          if (stat.isDirectory()) {
            label = 'Dir';
          } else if (stat.isFile()) {
            label = 'File';
          } else {
            continue;
          }
          suggestion = {
            word: result,
            prefix: prefix,
            label: label,
            data: {
              body: result
            }
          };
          if (suggestion.label !== 'File') {
            suggestion.onDidConfirm = function() {
              return atom.commands.dispatch(atom.views.getView(editor), 'autocomplete-plus:activate');
            };
          }
          results1.push(suggestion);
        }
        return results1;
      })();
      return suggestions;
    };

    PathsProvider.prototype.dispose = function() {
      this.editor = null;
      return this.basePath = null;
    };

    return PathsProvider;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvdG95b2tpLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1wYXRocy9saWIvcGF0aHMtcHJvdmlkZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSwwQ0FBQTtJQUFBOztFQUFDLFFBQVUsT0FBQSxDQUFRLE1BQVI7O0VBQ1gsVUFBQSxHQUFhLE9BQUEsQ0FBUSxZQUFSOztFQUNiLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDUCxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0VBRUwsTUFBTSxDQUFDLE9BQVAsR0FDTTs7Ozs7Ozs0QkFDSixFQUFBLEdBQUk7OzRCQUNKLFFBQUEsR0FBVTs7NEJBQ1YsU0FBQSxHQUFXOzs0QkFDWCxLQUFBLEdBQU87OzRCQUVQLGNBQUEsR0FBZ0IsU0FBQyxPQUFEO0FBQ2QsVUFBQTs7UUFEZSxVQUFVOztNQUN6QixJQUFBLENBQUEsQ0FBaUIsd0JBQUEsSUFBb0Isd0JBQXBCLElBQXdDLHdCQUF6RCxDQUFBO0FBQUEsZUFBTyxHQUFQOztNQUNBLFVBQUEsdUNBQTJCLENBQUUsT0FBaEIsQ0FBQTtNQUNiLElBQUEsdUJBQWlCLFVBQVUsQ0FBRSxnQkFBN0I7QUFBQSxlQUFPLEdBQVA7O01BQ0EsUUFBQSxHQUFXLElBQUksQ0FBQyxPQUFMLENBQWEsVUFBYjtNQUNYLElBQWlCLGdCQUFqQjtBQUFBLGVBQU8sR0FBUDs7TUFFQSxNQUFBLEdBQVMsSUFBQyxDQUFBLGVBQUQsQ0FBaUIsT0FBTyxDQUFDLE1BQXpCLEVBQWlDLE9BQU8sQ0FBQyxNQUF6QyxFQUFpRCxPQUFPLENBQUMsTUFBekQsRUFBaUUsT0FBTyxDQUFDLFFBQXpFO01BRVQsSUFBQSxDQUFBLENBQWlCLE1BQU0sQ0FBQyxNQUFQLEdBQWdCLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixxQ0FBaEIsQ0FBakMsQ0FBQTtBQUFBLGVBQU8sR0FBUDs7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LEtBQWxCLEVBQXlCLE1BQXpCO01BRVYsV0FBQTs7QUFBYzthQUFBLHlDQUFBOztVQUNaLFVBQUEsR0FBYSxJQUFJLENBQUMsT0FBTCxDQUFhLFNBQWIsRUFBd0IsTUFBeEI7QUFHYjtZQUNFLElBQUEsR0FBTyxFQUFFLENBQUMsUUFBSCxDQUFZLFVBQVosRUFEVDtXQUFBLGFBQUE7WUFFTTtBQUNKLHFCQUhGOztVQUlBLElBQUcsSUFBSSxDQUFDLFdBQUwsQ0FBQSxDQUFIO1lBQ0UsS0FBQSxHQUFRLE1BRFY7V0FBQSxNQUVLLElBQUcsSUFBSSxDQUFDLE1BQUwsQ0FBQSxDQUFIO1lBQ0gsS0FBQSxHQUFRLE9BREw7V0FBQSxNQUFBO0FBR0gscUJBSEc7O1VBS0wsVUFBQSxHQUNFO1lBQUEsSUFBQSxFQUFNLE1BQU47WUFDQSxNQUFBLEVBQVEsTUFEUjtZQUVBLEtBQUEsRUFBTyxLQUZQO1lBR0EsSUFBQSxFQUNFO2NBQUEsSUFBQSxFQUFNLE1BQU47YUFKRjs7VUFLRixJQUFHLFVBQVUsQ0FBQyxLQUFYLEtBQXNCLE1BQXpCO1lBQ0UsVUFBVSxDQUFDLFlBQVgsR0FBMEIsU0FBQTtxQkFDeEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFkLENBQXVCLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBWCxDQUFtQixNQUFuQixDQUF2QixFQUFtRCw0QkFBbkQ7WUFEd0IsRUFENUI7O3dCQUlBO0FBekJZOzs7QUEwQmQsYUFBTztJQXZEaUI7OzRCQXlEMUIsT0FBQSxHQUFTLFNBQUE7TUFDUCxJQUFDLENBQUEsTUFBRCxHQUFVO2FBQ1YsSUFBQyxDQUFBLFFBQUQsR0FBWTtJQUZMOzs7OztBQTlHWCIsInNvdXJjZXNDb250ZW50IjpbIntSYW5nZX0gID0gcmVxdWlyZSgnYXRvbScpXG5mdXp6YWxkcmluID0gcmVxdWlyZSgnZnV6emFsZHJpbicpXG5wYXRoID0gcmVxdWlyZSgncGF0aCcpXG5mcyA9IHJlcXVpcmUoJ2ZzJylcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgUGF0aHNQcm92aWRlclxuICBpZDogJ2F1dG9jb21wbGV0ZS1wYXRocy1wYXRoc3Byb3ZpZGVyJ1xuICBzZWxlY3RvcjogJyonXG4gIHdvcmRSZWdleDogLyg/OlthLXpBLVpdOik/W2EtekEtWjAtOS4vXFxcXF8tXSooPzpcXC98XFxcXFxcXFw/KVthLXpBLVowLTkuL1xcXFxfLV0qL2dcbiAgY2FjaGU6IFtdXG5cbiAgcmVxdWVzdEhhbmRsZXI6IChvcHRpb25zID0ge30pID0+XG4gICAgcmV0dXJuIFtdIHVubGVzcyBvcHRpb25zLmVkaXRvcj8gYW5kIG9wdGlvbnMuYnVmZmVyPyBhbmQgb3B0aW9ucy5jdXJzb3I/XG4gICAgZWRpdG9yUGF0aCA9IG9wdGlvbnMuZWRpdG9yPy5nZXRQYXRoKClcbiAgICByZXR1cm4gW10gdW5sZXNzIGVkaXRvclBhdGg/Lmxlbmd0aFxuICAgIGJhc2VQYXRoID0gcGF0aC5kaXJuYW1lKGVkaXRvclBhdGgpXG4gICAgcmV0dXJuIFtdIHVubGVzcyBiYXNlUGF0aD9cblxuICAgIHByZWZpeCA9IEBwcmVmaXhGb3JDdXJzb3Iob3B0aW9ucy5lZGl0b3IsIG9wdGlvbnMuYnVmZmVyLCBvcHRpb25zLmN1cnNvciwgb3B0aW9ucy5wb3NpdGlvbilcblxuICAgIHJldHVybiBbXSB1bmxlc3MgcHJlZml4Lmxlbmd0aCA+IGF0b20uY29uZmlnLmdldCgnYXV0b2NvbXBsZXRlLXBsdXMubWluaW11bVdvcmRMZW5ndGgnKVxuXG4gICAgc3VnZ2VzdGlvbnMgPSBAZmluZFN1Z2dlc3Rpb25zRm9yUHJlZml4KG9wdGlvbnMuZWRpdG9yLCBiYXNlUGF0aCwgcHJlZml4KVxuICAgIHJldHVybiBbXSB1bmxlc3Mgc3VnZ2VzdGlvbnMubGVuZ3RoXG4gICAgcmV0dXJuIHN1Z2dlc3Rpb25zXG5cbiAgcHJlZml4Rm9yQ3Vyc29yOiAoZWRpdG9yLCBidWZmZXIsIGN1cnNvciwgcG9zaXRpb24pID0+XG4gICAgcmV0dXJuICcnIHVubGVzcyBidWZmZXI/IGFuZCBjdXJzb3I/XG4gICAgc3RhcnQgPSBAZ2V0QmVnaW5uaW5nT2ZDdXJyZW50V29yZEJ1ZmZlclBvc2l0aW9uKGVkaXRvciwgcG9zaXRpb24sIHt3b3JkUmVnZXg6IEB3b3JkUmVnZXh9KVxuICAgIGVuZCA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gICAgcmV0dXJuICcnIHVubGVzcyBzdGFydD8gYW5kIGVuZD9cbiAgICBidWZmZXIuZ2V0VGV4dEluUmFuZ2UobmV3IFJhbmdlKHN0YXJ0LCBlbmQpKVxuXG4gIGdldEJlZ2lubmluZ09mQ3VycmVudFdvcmRCdWZmZXJQb3NpdGlvbjogKGVkaXRvciwgcG9zaXRpb24sIG9wdGlvbnMgPSB7fSkgLT5cbiAgICByZXR1cm4gdW5sZXNzIHBvc2l0aW9uP1xuICAgIGFsbG93UHJldmlvdXMgPSBvcHRpb25zLmFsbG93UHJldmlvdXMgPyB0cnVlXG4gICAgY3VycmVudEJ1ZmZlclBvc2l0aW9uID0gcG9zaXRpb25cbiAgICBzY2FuUmFuZ2UgPSBbW2N1cnJlbnRCdWZmZXJQb3NpdGlvbi5yb3csIDBdLCBjdXJyZW50QnVmZmVyUG9zaXRpb25dXG4gICAgYmVnaW5uaW5nT2ZXb3JkUG9zaXRpb24gPSBudWxsXG4gICAgZWRpdG9yLmJhY2t3YXJkc1NjYW5JbkJ1ZmZlclJhbmdlIChvcHRpb25zLndvcmRSZWdleCksIHNjYW5SYW5nZSwgKHtyYW5nZSwgc3RvcH0pIC0+XG4gICAgICBpZiByYW5nZS5lbmQuaXNHcmVhdGVyVGhhbk9yRXF1YWwoY3VycmVudEJ1ZmZlclBvc2l0aW9uKSBvciBhbGxvd1ByZXZpb3VzXG4gICAgICAgIGJlZ2lubmluZ09mV29yZFBvc2l0aW9uID0gcmFuZ2Uuc3RhcnRcbiAgICAgIGlmIG5vdCBiZWdpbm5pbmdPZldvcmRQb3NpdGlvbj8uaXNFcXVhbChjdXJyZW50QnVmZmVyUG9zaXRpb24pXG4gICAgICAgIHN0b3AoKVxuXG4gICAgaWYgYmVnaW5uaW5nT2ZXb3JkUG9zaXRpb24/XG4gICAgICBiZWdpbm5pbmdPZldvcmRQb3NpdGlvblxuICAgIGVsc2UgaWYgYWxsb3dQcmV2aW91c1xuICAgICAgW2N1cnJlbnRCdWZmZXJQb3NpdGlvbi5yb3csIDBdXG4gICAgZWxzZVxuICAgICAgY3VycmVudEJ1ZmZlclBvc2l0aW9uXG5cbiAgZmluZFN1Z2dlc3Rpb25zRm9yUHJlZml4OiAoZWRpdG9yLCBiYXNlUGF0aCwgcHJlZml4KSAtPlxuICAgIHJldHVybiBbXSB1bmxlc3MgYmFzZVBhdGg/XG5cbiAgICBwcmVmaXhQYXRoID0gcGF0aC5yZXNvbHZlKGJhc2VQYXRoLCBwcmVmaXgpXG5cbiAgICBpZiBwcmVmaXgubWF0Y2goL1svXFxcXF0kLylcbiAgICAgIGRpcmVjdG9yeSA9IHByZWZpeFBhdGhcbiAgICAgIHByZWZpeCA9ICcnXG4gICAgZWxzZVxuICAgICAgaWYgYmFzZVBhdGggaXMgcHJlZml4UGF0aFxuICAgICAgICBkaXJlY3RvcnkgPSBwcmVmaXhQYXRoXG4gICAgICBlbHNlXG4gICAgICAgIGRpcmVjdG9yeSA9IHBhdGguZGlybmFtZShwcmVmaXhQYXRoKVxuICAgICAgcHJlZml4ID0gcGF0aC5iYXNlbmFtZShwcmVmaXgpXG5cbiAgICAjIElzIHRoaXMgYWN0dWFsbHkgYSBkaXJlY3Rvcnk/XG4gICAgdHJ5XG4gICAgICBzdGF0ID0gZnMuc3RhdFN5bmMoZGlyZWN0b3J5KVxuICAgICAgcmV0dXJuIFtdIHVubGVzcyBzdGF0LmlzRGlyZWN0b3J5KClcbiAgICBjYXRjaCBlXG4gICAgICByZXR1cm4gW11cblxuICAgICMgR2V0IGZpbGVzXG4gICAgdHJ5XG4gICAgICBmaWxlcyA9IGZzLnJlYWRkaXJTeW5jKGRpcmVjdG9yeSlcbiAgICBjYXRjaCBlXG4gICAgICByZXR1cm4gW11cbiAgICByZXN1bHRzID0gZnV6emFsZHJpbi5maWx0ZXIoZmlsZXMsIHByZWZpeClcblxuICAgIHN1Z2dlc3Rpb25zID0gZm9yIHJlc3VsdCBpbiByZXN1bHRzXG4gICAgICByZXN1bHRQYXRoID0gcGF0aC5yZXNvbHZlKGRpcmVjdG9yeSwgcmVzdWx0KVxuXG4gICAgICAjIENoZWNrIGZvciB0eXBlXG4gICAgICB0cnlcbiAgICAgICAgc3RhdCA9IGZzLnN0YXRTeW5jKHJlc3VsdFBhdGgpXG4gICAgICBjYXRjaCBlXG4gICAgICAgIGNvbnRpbnVlXG4gICAgICBpZiBzdGF0LmlzRGlyZWN0b3J5KClcbiAgICAgICAgbGFiZWwgPSAnRGlyJ1xuICAgICAgZWxzZSBpZiBzdGF0LmlzRmlsZSgpXG4gICAgICAgIGxhYmVsID0gJ0ZpbGUnXG4gICAgICBlbHNlXG4gICAgICAgIGNvbnRpbnVlXG5cbiAgICAgIHN1Z2dlc3Rpb24gPVxuICAgICAgICB3b3JkOiByZXN1bHRcbiAgICAgICAgcHJlZml4OiBwcmVmaXhcbiAgICAgICAgbGFiZWw6IGxhYmVsXG4gICAgICAgIGRhdGE6XG4gICAgICAgICAgYm9keTogcmVzdWx0XG4gICAgICBpZiBzdWdnZXN0aW9uLmxhYmVsIGlzbnQgJ0ZpbGUnXG4gICAgICAgIHN1Z2dlc3Rpb24ub25EaWRDb25maXJtID0gLT5cbiAgICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGF0b20udmlld3MuZ2V0VmlldyhlZGl0b3IpLCAnYXV0b2NvbXBsZXRlLXBsdXM6YWN0aXZhdGUnKVxuXG4gICAgICBzdWdnZXN0aW9uXG4gICAgcmV0dXJuIHN1Z2dlc3Rpb25zXG5cbiAgZGlzcG9zZTogPT5cbiAgICBAZWRpdG9yID0gbnVsbFxuICAgIEBiYXNlUGF0aCA9IG51bGxcbiJdfQ==
