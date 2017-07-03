(function() {
  var decimal, float, int, namePrefixes, percent, variables;

  int = '\\d+';

  decimal = "\\." + int;

  float = "(?:" + int + decimal + "|" + int + "|" + decimal + ")";

  percent = float + "%";

  variables = '(?:@[a-zA-Z0-9\\-_]+|\\$[a-zA-Z0-9\\-_]+|[a-zA-Z_][a-zA-Z0-9\\-_]*)';

  namePrefixes = '^| |\\t|:|=|,|\\n|\'|"|`|\\(|\\[|\\{|>';

  module.exports = {
    int: int,
    float: float,
    percent: percent,
    optionalPercent: float + "%?",
    intOrPercent: "(?:" + percent + "|" + int + ")",
    floatOrPercent: "(?:" + percent + "|" + float + ")",
    comma: '\\s*,\\s*',
    notQuote: "[^\"'`\\n\\r]+",
    hexadecimal: '[\\da-fA-F]',
    ps: '\\(\\s*',
    pe: '\\s*\\)',
    variables: variables,
    namePrefixes: namePrefixes,
    createVariableRegExpString: function(variables) {
      var i, j, len, len1, res, v, variableNamesWithPrefix, variableNamesWithoutPrefix, withPrefixes, withoutPrefixes;
      variableNamesWithPrefix = [];
      variableNamesWithoutPrefix = [];
      withPrefixes = variables.filter(function(v) {
        return !v.noNamePrefix;
      });
      withoutPrefixes = variables.filter(function(v) {
        return v.noNamePrefix;
      });
      res = [];
      if (withPrefixes.length > 0) {
        for (i = 0, len = withPrefixes.length; i < len; i++) {
          v = withPrefixes[i];
          variableNamesWithPrefix.push(v.name.replace(/[-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"));
        }
        res.push("((?:" + namePrefixes + ")(" + (variableNamesWithPrefix.join('|')) + ")(\\s+!default)?(?!_|-|\\w|\\d|[ \\t]*[\\.:=]))");
      }
      if (withoutPrefixes.length > 0) {
        for (j = 0, len1 = withoutPrefixes.length; j < len1; j++) {
          v = withoutPrefixes[j];
          variableNamesWithoutPrefix.push(v.name.replace(/[-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"));
        }
        res.push("(" + (variableNamesWithoutPrefix.join('|')) + ")");
      }
      return res.join('|');
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvdG95b2tpLy5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL2xpYi9yZWdleGVzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsR0FBQSxHQUFNOztFQUNOLE9BQUEsR0FBVSxLQUFBLEdBQU07O0VBQ2hCLEtBQUEsR0FBUSxLQUFBLEdBQU0sR0FBTixHQUFZLE9BQVosR0FBb0IsR0FBcEIsR0FBdUIsR0FBdkIsR0FBMkIsR0FBM0IsR0FBOEIsT0FBOUIsR0FBc0M7O0VBQzlDLE9BQUEsR0FBYSxLQUFELEdBQU87O0VBQ25CLFNBQUEsR0FBWTs7RUFDWixZQUFBLEdBQWU7O0VBRWYsTUFBTSxDQUFDLE9BQVAsR0FDRTtJQUFBLEdBQUEsRUFBSyxHQUFMO0lBQ0EsS0FBQSxFQUFPLEtBRFA7SUFFQSxPQUFBLEVBQVMsT0FGVDtJQUdBLGVBQUEsRUFBb0IsS0FBRCxHQUFPLElBSDFCO0lBSUEsWUFBQSxFQUFjLEtBQUEsR0FBTSxPQUFOLEdBQWMsR0FBZCxHQUFpQixHQUFqQixHQUFxQixHQUpuQztJQUtBLGNBQUEsRUFBZ0IsS0FBQSxHQUFNLE9BQU4sR0FBYyxHQUFkLEdBQWlCLEtBQWpCLEdBQXVCLEdBTHZDO0lBTUEsS0FBQSxFQUFPLFdBTlA7SUFPQSxRQUFBLEVBQVUsZ0JBUFY7SUFRQSxXQUFBLEVBQWEsYUFSYjtJQVNBLEVBQUEsRUFBSSxTQVRKO0lBVUEsRUFBQSxFQUFJLFNBVko7SUFXQSxTQUFBLEVBQVcsU0FYWDtJQVlBLFlBQUEsRUFBYyxZQVpkO0lBYUEsMEJBQUEsRUFBNEIsU0FBQyxTQUFEO0FBQzFCLFVBQUE7TUFBQSx1QkFBQSxHQUEwQjtNQUMxQiwwQkFBQSxHQUE2QjtNQUM3QixZQUFBLEdBQWUsU0FBUyxDQUFDLE1BQVYsQ0FBaUIsU0FBQyxDQUFEO2VBQU8sQ0FBSSxDQUFDLENBQUM7TUFBYixDQUFqQjtNQUNmLGVBQUEsR0FBa0IsU0FBUyxDQUFDLE1BQVYsQ0FBaUIsU0FBQyxDQUFEO2VBQU8sQ0FBQyxDQUFDO01BQVQsQ0FBakI7TUFFbEIsR0FBQSxHQUFNO01BRU4sSUFBRyxZQUFZLENBQUMsTUFBYixHQUFzQixDQUF6QjtBQUNFLGFBQUEsOENBQUE7O1VBQ0UsdUJBQXVCLENBQUMsSUFBeEIsQ0FBNkIsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFQLENBQWUsb0NBQWYsRUFBcUQsTUFBckQsQ0FBN0I7QUFERjtRQUdBLEdBQUcsQ0FBQyxJQUFKLENBQVMsTUFBQSxHQUFPLFlBQVAsR0FBb0IsSUFBcEIsR0FBdUIsQ0FBQyx1QkFBdUIsQ0FBQyxJQUF4QixDQUE2QixHQUE3QixDQUFELENBQXZCLEdBQTBELGlEQUFuRSxFQUpGOztNQU1BLElBQUcsZUFBZSxDQUFDLE1BQWhCLEdBQXlCLENBQTVCO0FBQ0UsYUFBQSxtREFBQTs7VUFDRSwwQkFBMEIsQ0FBQyxJQUEzQixDQUFnQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQVAsQ0FBZSxvQ0FBZixFQUFxRCxNQUFyRCxDQUFoQztBQURGO1FBR0EsR0FBRyxDQUFDLElBQUosQ0FBUyxHQUFBLEdBQUcsQ0FBQywwQkFBMEIsQ0FBQyxJQUEzQixDQUFnQyxHQUFoQyxDQUFELENBQUgsR0FBeUMsR0FBbEQsRUFKRjs7YUFNQSxHQUFHLENBQUMsSUFBSixDQUFTLEdBQVQ7SUFwQjBCLENBYjVCOztBQVJGIiwic291cmNlc0NvbnRlbnQiOlsiaW50ID0gJ1xcXFxkKydcbmRlY2ltYWwgPSBcIlxcXFwuI3tpbnR9XCJcbmZsb2F0ID0gXCIoPzoje2ludH0je2RlY2ltYWx9fCN7aW50fXwje2RlY2ltYWx9KVwiXG5wZXJjZW50ID0gXCIje2Zsb2F0fSVcIlxudmFyaWFibGVzID0gJyg/OkBbYS16QS1aMC05XFxcXC1fXSt8XFxcXCRbYS16QS1aMC05XFxcXC1fXSt8W2EtekEtWl9dW2EtekEtWjAtOVxcXFwtX10qKSdcbm5hbWVQcmVmaXhlcyA9ICdefCB8XFxcXHR8Onw9fCx8XFxcXG58XFwnfFwifGB8XFxcXCh8XFxcXFt8XFxcXHt8PidcblxubW9kdWxlLmV4cG9ydHMgPVxuICBpbnQ6IGludFxuICBmbG9hdDogZmxvYXRcbiAgcGVyY2VudDogcGVyY2VudFxuICBvcHRpb25hbFBlcmNlbnQ6IFwiI3tmbG9hdH0lP1wiXG4gIGludE9yUGVyY2VudDogXCIoPzoje3BlcmNlbnR9fCN7aW50fSlcIlxuICBmbG9hdE9yUGVyY2VudDogXCIoPzoje3BlcmNlbnR9fCN7ZmxvYXR9KVwiXG4gIGNvbW1hOiAnXFxcXHMqLFxcXFxzKidcbiAgbm90UXVvdGU6IFwiW15cXFwiJ2BcXFxcblxcXFxyXStcIlxuICBoZXhhZGVjaW1hbDogJ1tcXFxcZGEtZkEtRl0nXG4gIHBzOiAnXFxcXChcXFxccyonXG4gIHBlOiAnXFxcXHMqXFxcXCknXG4gIHZhcmlhYmxlczogdmFyaWFibGVzXG4gIG5hbWVQcmVmaXhlczogbmFtZVByZWZpeGVzXG4gIGNyZWF0ZVZhcmlhYmxlUmVnRXhwU3RyaW5nOiAodmFyaWFibGVzKSAtPlxuICAgIHZhcmlhYmxlTmFtZXNXaXRoUHJlZml4ID0gW11cbiAgICB2YXJpYWJsZU5hbWVzV2l0aG91dFByZWZpeCA9IFtdXG4gICAgd2l0aFByZWZpeGVzID0gdmFyaWFibGVzLmZpbHRlciAodikgLT4gbm90IHYubm9OYW1lUHJlZml4XG4gICAgd2l0aG91dFByZWZpeGVzID0gdmFyaWFibGVzLmZpbHRlciAodikgLT4gdi5ub05hbWVQcmVmaXhcblxuICAgIHJlcyA9IFtdXG5cbiAgICBpZiB3aXRoUHJlZml4ZXMubGVuZ3RoID4gMFxuICAgICAgZm9yIHYgaW4gd2l0aFByZWZpeGVzXG4gICAgICAgIHZhcmlhYmxlTmFtZXNXaXRoUHJlZml4LnB1c2ggdi5uYW1lLnJlcGxhY2UoL1stXFxbXFxdXFwvXFx7XFx9XFwoXFwpXFwqXFwrXFw/XFwuXFxcXFxcXlxcJFxcfF0vZywgXCJcXFxcJCZcIilcblxuICAgICAgcmVzLnB1c2ggXCIoKD86I3tuYW1lUHJlZml4ZXN9KSgje3ZhcmlhYmxlTmFtZXNXaXRoUHJlZml4LmpvaW4oJ3wnKX0pKFxcXFxzKyFkZWZhdWx0KT8oPyFffC18XFxcXHd8XFxcXGR8WyBcXFxcdF0qW1xcXFwuOj1dKSlcIlxuXG4gICAgaWYgd2l0aG91dFByZWZpeGVzLmxlbmd0aCA+IDBcbiAgICAgIGZvciB2IGluIHdpdGhvdXRQcmVmaXhlc1xuICAgICAgICB2YXJpYWJsZU5hbWVzV2l0aG91dFByZWZpeC5wdXNoIHYubmFtZS5yZXBsYWNlKC9bLVxcW1xcXVxcL1xce1xcfVxcKFxcKVxcKlxcK1xcP1xcLlxcXFxcXF5cXCRcXHxdL2csIFwiXFxcXCQmXCIpXG5cbiAgICAgIHJlcy5wdXNoIFwiKCN7dmFyaWFibGVOYW1lc1dpdGhvdXRQcmVmaXguam9pbignfCcpfSlcIlxuXG4gICAgcmVzLmpvaW4oJ3wnKVxuIl19
