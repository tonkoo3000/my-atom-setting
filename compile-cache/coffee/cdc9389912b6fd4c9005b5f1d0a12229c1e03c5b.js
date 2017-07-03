(function() {
  var VariableParser, VariableScanner, countLines, ref;

  ref = [], VariableParser = ref[0], countLines = ref[1];

  module.exports = VariableScanner = (function() {
    function VariableScanner(params) {
      if (params == null) {
        params = {};
      }
      if (VariableParser == null) {
        VariableParser = require('./variable-parser');
      }
      this.parser = params.parser, this.registry = params.registry, this.scope = params.scope;
      if (this.parser == null) {
        this.parser = new VariableParser(this.registry);
      }
    }

    VariableScanner.prototype.getRegExp = function() {
      return new RegExp(this.registry.getRegExpForScope(this.scope), 'gm');
    };

    VariableScanner.prototype.search = function(text, start) {
      var i, index, lastIndex, len, line, lineCountIndex, match, matchText, regexp, result, v;
      if (start == null) {
        start = 0;
      }
      if (this.registry.getExpressionsForScope(this.scope).length === 0) {
        return;
      }
      if (countLines == null) {
        countLines = require('./utils').countLines;
      }
      regexp = this.getRegExp();
      regexp.lastIndex = start;
      while (match = regexp.exec(text)) {
        matchText = match[0];
        index = match.index;
        lastIndex = regexp.lastIndex;
        result = this.parser.parse(matchText);
        if (result != null) {
          result.lastIndex += index;
          if (result.length > 0) {
            result.range[0] += index;
            result.range[1] += index;
            line = -1;
            lineCountIndex = 0;
            for (i = 0, len = result.length; i < len; i++) {
              v = result[i];
              v.range[0] += index;
              v.range[1] += index;
              line = v.line = line + countLines(text.slice(lineCountIndex, +v.range[0] + 1 || 9e9));
              lineCountIndex = v.range[0];
            }
            return result;
          } else {
            regexp.lastIndex = result.lastIndex;
          }
        }
      }
      return void 0;
    };

    return VariableScanner;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvdG95b2tpLy5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL2xpYi92YXJpYWJsZS1zY2FubmVyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsTUFBK0IsRUFBL0IsRUFBQyx1QkFBRCxFQUFpQjs7RUFFakIsTUFBTSxDQUFDLE9BQVAsR0FDTTtJQUNTLHlCQUFDLE1BQUQ7O1FBQUMsU0FBTzs7O1FBQ25CLGlCQUFrQixPQUFBLENBQVEsbUJBQVI7O01BRWpCLElBQUMsQ0FBQSxnQkFBQSxNQUFGLEVBQVUsSUFBQyxDQUFBLGtCQUFBLFFBQVgsRUFBcUIsSUFBQyxDQUFBLGVBQUE7O1FBQ3RCLElBQUMsQ0FBQSxTQUFjLElBQUEsY0FBQSxDQUFlLElBQUMsQ0FBQSxRQUFoQjs7SUFKSjs7OEJBTWIsU0FBQSxHQUFXLFNBQUE7YUFDTCxJQUFBLE1BQUEsQ0FBTyxJQUFDLENBQUEsUUFBUSxDQUFDLGlCQUFWLENBQTRCLElBQUMsQ0FBQSxLQUE3QixDQUFQLEVBQTRDLElBQTVDO0lBREs7OzhCQUdYLE1BQUEsR0FBUSxTQUFDLElBQUQsRUFBTyxLQUFQO0FBQ04sVUFBQTs7UUFEYSxRQUFNOztNQUNuQixJQUFVLElBQUMsQ0FBQSxRQUFRLENBQUMsc0JBQVYsQ0FBaUMsSUFBQyxDQUFBLEtBQWxDLENBQXdDLENBQUMsTUFBekMsS0FBbUQsQ0FBN0Q7QUFBQSxlQUFBOzs7UUFFQSxhQUFjLE9BQUEsQ0FBUSxTQUFSLENBQWtCLENBQUM7O01BRWpDLE1BQUEsR0FBUyxJQUFDLENBQUEsU0FBRCxDQUFBO01BQ1QsTUFBTSxDQUFDLFNBQVAsR0FBbUI7QUFFbkIsYUFBTSxLQUFBLEdBQVEsTUFBTSxDQUFDLElBQVAsQ0FBWSxJQUFaLENBQWQ7UUFDRyxZQUFhO1FBQ2IsUUFBUztRQUNULFlBQWE7UUFFZCxNQUFBLEdBQVMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUFSLENBQWMsU0FBZDtRQUVULElBQUcsY0FBSDtVQUNFLE1BQU0sQ0FBQyxTQUFQLElBQW9CO1VBRXBCLElBQUcsTUFBTSxDQUFDLE1BQVAsR0FBZ0IsQ0FBbkI7WUFDRSxNQUFNLENBQUMsS0FBTSxDQUFBLENBQUEsQ0FBYixJQUFtQjtZQUNuQixNQUFNLENBQUMsS0FBTSxDQUFBLENBQUEsQ0FBYixJQUFtQjtZQUVuQixJQUFBLEdBQU8sQ0FBQztZQUNSLGNBQUEsR0FBaUI7QUFFakIsaUJBQUEsd0NBQUE7O2NBQ0UsQ0FBQyxDQUFDLEtBQU0sQ0FBQSxDQUFBLENBQVIsSUFBYztjQUNkLENBQUMsQ0FBQyxLQUFNLENBQUEsQ0FBQSxDQUFSLElBQWM7Y0FDZCxJQUFBLEdBQU8sQ0FBQyxDQUFDLElBQUYsR0FBUyxJQUFBLEdBQU8sVUFBQSxDQUFXLElBQUssOENBQWhCO2NBQ3ZCLGNBQUEsR0FBaUIsQ0FBQyxDQUFDLEtBQU0sQ0FBQSxDQUFBO0FBSjNCO0FBTUEsbUJBQU8sT0FiVDtXQUFBLE1BQUE7WUFlRSxNQUFNLENBQUMsU0FBUCxHQUFtQixNQUFNLENBQUMsVUFmNUI7V0FIRjs7TUFQRjtBQTJCQSxhQUFPO0lBbkNEOzs7OztBQWJWIiwic291cmNlc0NvbnRlbnQiOlsiW1ZhcmlhYmxlUGFyc2VyLCBjb3VudExpbmVzXSA9IFtdXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIFZhcmlhYmxlU2Nhbm5lclxuICBjb25zdHJ1Y3RvcjogKHBhcmFtcz17fSkgLT5cbiAgICBWYXJpYWJsZVBhcnNlciA/PSByZXF1aXJlICcuL3ZhcmlhYmxlLXBhcnNlcidcblxuICAgIHtAcGFyc2VyLCBAcmVnaXN0cnksIEBzY29wZX0gPSBwYXJhbXNcbiAgICBAcGFyc2VyID89IG5ldyBWYXJpYWJsZVBhcnNlcihAcmVnaXN0cnkpXG5cbiAgZ2V0UmVnRXhwOiAtPlxuICAgIG5ldyBSZWdFeHAoQHJlZ2lzdHJ5LmdldFJlZ0V4cEZvclNjb3BlKEBzY29wZSksICdnbScpXG5cbiAgc2VhcmNoOiAodGV4dCwgc3RhcnQ9MCkgLT5cbiAgICByZXR1cm4gaWYgQHJlZ2lzdHJ5LmdldEV4cHJlc3Npb25zRm9yU2NvcGUoQHNjb3BlKS5sZW5ndGggaXMgMFxuXG4gICAgY291bnRMaW5lcyA/PSByZXF1aXJlKCcuL3V0aWxzJykuY291bnRMaW5lc1xuXG4gICAgcmVnZXhwID0gQGdldFJlZ0V4cCgpXG4gICAgcmVnZXhwLmxhc3RJbmRleCA9IHN0YXJ0XG5cbiAgICB3aGlsZSBtYXRjaCA9IHJlZ2V4cC5leGVjKHRleHQpXG4gICAgICBbbWF0Y2hUZXh0XSA9IG1hdGNoXG4gICAgICB7aW5kZXh9ID0gbWF0Y2hcbiAgICAgIHtsYXN0SW5kZXh9ID0gcmVnZXhwXG5cbiAgICAgIHJlc3VsdCA9IEBwYXJzZXIucGFyc2UobWF0Y2hUZXh0KVxuXG4gICAgICBpZiByZXN1bHQ/XG4gICAgICAgIHJlc3VsdC5sYXN0SW5kZXggKz0gaW5kZXhcblxuICAgICAgICBpZiByZXN1bHQubGVuZ3RoID4gMFxuICAgICAgICAgIHJlc3VsdC5yYW5nZVswXSArPSBpbmRleFxuICAgICAgICAgIHJlc3VsdC5yYW5nZVsxXSArPSBpbmRleFxuXG4gICAgICAgICAgbGluZSA9IC0xXG4gICAgICAgICAgbGluZUNvdW50SW5kZXggPSAwXG5cbiAgICAgICAgICBmb3IgdiBpbiByZXN1bHRcbiAgICAgICAgICAgIHYucmFuZ2VbMF0gKz0gaW5kZXhcbiAgICAgICAgICAgIHYucmFuZ2VbMV0gKz0gaW5kZXhcbiAgICAgICAgICAgIGxpbmUgPSB2LmxpbmUgPSBsaW5lICsgY291bnRMaW5lcyh0ZXh0W2xpbmVDb3VudEluZGV4Li52LnJhbmdlWzBdXSlcbiAgICAgICAgICAgIGxpbmVDb3VudEluZGV4ID0gdi5yYW5nZVswXVxuXG4gICAgICAgICAgcmV0dXJuIHJlc3VsdFxuICAgICAgICBlbHNlXG4gICAgICAgICAgcmVnZXhwLmxhc3RJbmRleCA9IHJlc3VsdC5sYXN0SW5kZXhcblxuICAgIHJldHVybiB1bmRlZmluZWRcbiJdfQ==
