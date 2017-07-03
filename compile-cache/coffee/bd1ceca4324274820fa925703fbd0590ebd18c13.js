(function() {
  var ArgumentParser, fs, path;

  path = require('path');

  fs = require('fs');

  module.exports = ArgumentParser = (function() {
    function ArgumentParser() {}

    ArgumentParser.prototype.parseValue = function(value) {
      if (value === void 0) {
        return true;
      }
      value = value.trim();
      if (value === true || value === 'true' || value === 'yes') {
        return true;
      }
      if (value === false || value === 'false' || value === 'no') {
        return false;
      }
      if (isFinite(value)) {
        if (value.indexOf('.') > -1) {
          return parseFloat(value);
        } else {
          return parseInt(value);
        }
      }
      if (value[0] === '[') {
        value = this.parseArray(value);
      }
      if (value[0] === '{') {
        value = this.parseObject(value);
      }
      return value;
    };

    ArgumentParser.prototype.parseArray = function(arrayAsString) {
      var arr, match, regex, value;
      arrayAsString = arrayAsString.substr(1, arrayAsString.length - 2);
      regex = /(?:\s*(?:(?:'(.*?)')|(?:"(.*?)")|([^,;]+))?)*/g;
      arr = [];
      while ((match = regex.exec(arrayAsString)) !== null) {
        if (match.index === regex.lastIndex) {
          regex.lastIndex++;
        }
        value = match[1] ? match[1] : match[2] ? match[2] : match[3] ? match[3] : void 0;
        if (value !== void 0) {
          value = this.parseValue(value);
          arr.push(value);
        }
      }
      return arr;
    };

    ArgumentParser.prototype.parseObject = function(objectAsString) {
      var key, match, obj, regex, value;
      objectAsString = objectAsString.substr(1, objectAsString.length - 2);
      regex = /(?:(\!?[\w-\.]+)(?:\s*:\s*(?:(?:'(.*?)')|(?:"(.*?)")|([^,;]+)))?)*/g;
      obj = {};
      while ((match = regex.exec(objectAsString)) !== null) {
        if (match.index === regex.lastIndex) {
          regex.lastIndex++;
        }
        if (match[1] !== void 0) {
          key = match[1].trim();
          value = match[2] ? match[2] : match[3] ? match[3] : match[4] ? match[4] : void 0;
          if (key[0] === '!') {
            key = key.substr(1);
            if (value === void 0) {
              value = 'false';
            }
          }
          obj[key] = this.parseValue(value);
        }
      }
      return obj;
    };

    return ArgumentParser;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvdG95b2tpLy5hdG9tL3BhY2thZ2VzL3Nhc3MtYXV0b2NvbXBpbGUvbGliL2hlbHBlci9hcmd1bWVudC1wYXJzZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBQ1AsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSOztFQUdMLE1BQU0sQ0FBQyxPQUFQLEdBQ007Ozs2QkFFRixVQUFBLEdBQVksU0FBQyxLQUFEO01BRVIsSUFBRyxLQUFBLEtBQVMsTUFBWjtBQUNJLGVBQU8sS0FEWDs7TUFHQSxLQUFBLEdBQVEsS0FBSyxDQUFDLElBQU4sQ0FBQTtNQUdSLElBQUcsS0FBQSxLQUFVLElBQVYsSUFBQSxLQUFBLEtBQWdCLE1BQWhCLElBQUEsS0FBQSxLQUF3QixLQUEzQjtBQUNJLGVBQU8sS0FEWDs7TUFFQSxJQUFHLEtBQUEsS0FBVSxLQUFWLElBQUEsS0FBQSxLQUFpQixPQUFqQixJQUFBLEtBQUEsS0FBMEIsSUFBN0I7QUFDSSxlQUFPLE1BRFg7O01BSUEsSUFBRyxRQUFBLENBQVMsS0FBVCxDQUFIO1FBQ0ksSUFBRyxLQUFLLENBQUMsT0FBTixDQUFjLEdBQWQsQ0FBQSxHQUFxQixDQUFDLENBQXpCO0FBQ0ksaUJBQU8sVUFBQSxDQUFXLEtBQVgsRUFEWDtTQUFBLE1BQUE7QUFHSSxpQkFBTyxRQUFBLENBQVMsS0FBVCxFQUhYO1NBREo7O01BT0EsSUFBRyxLQUFNLENBQUEsQ0FBQSxDQUFOLEtBQVksR0FBZjtRQUNJLEtBQUEsR0FBUSxJQUFDLENBQUEsVUFBRCxDQUFZLEtBQVosRUFEWjs7TUFJQSxJQUFHLEtBQU0sQ0FBQSxDQUFBLENBQU4sS0FBWSxHQUFmO1FBQ0ksS0FBQSxHQUFRLElBQUMsQ0FBQSxXQUFELENBQWEsS0FBYixFQURaOztBQUdBLGFBQU87SUE1QkM7OzZCQStCWixVQUFBLEdBQVksU0FBQyxhQUFEO0FBQ1IsVUFBQTtNQUFBLGFBQUEsR0FBZ0IsYUFBYSxDQUFDLE1BQWQsQ0FBcUIsQ0FBckIsRUFBd0IsYUFBYSxDQUFDLE1BQWQsR0FBdUIsQ0FBL0M7TUFDaEIsS0FBQSxHQUFRO01BQ1IsR0FBQSxHQUFNO0FBQ04sYUFBTSxDQUFDLEtBQUEsR0FBUSxLQUFLLENBQUMsSUFBTixDQUFXLGFBQVgsQ0FBVCxDQUFBLEtBQXlDLElBQS9DO1FBQ0ksSUFBRyxLQUFLLENBQUMsS0FBTixLQUFlLEtBQUssQ0FBQyxTQUF4QjtVQUNJLEtBQUssQ0FBQyxTQUFOLEdBREo7O1FBR0EsS0FBQSxHQUFXLEtBQU0sQ0FBQSxDQUFBLENBQVQsR0FBaUIsS0FBTSxDQUFBLENBQUEsQ0FBdkIsR0FBa0MsS0FBTSxDQUFBLENBQUEsQ0FBVCxHQUFpQixLQUFNLENBQUEsQ0FBQSxDQUF2QixHQUFrQyxLQUFNLENBQUEsQ0FBQSxDQUFULEdBQWlCLEtBQU0sQ0FBQSxDQUFBLENBQXZCLEdBQStCO1FBQ3JHLElBQUcsS0FBQSxLQUFXLE1BQWQ7VUFDSSxLQUFBLEdBQVEsSUFBQyxDQUFBLFVBQUQsQ0FBWSxLQUFaO1VBQ1IsR0FBRyxDQUFDLElBQUosQ0FBUyxLQUFULEVBRko7O01BTEo7QUFTQSxhQUFPO0lBYkM7OzZCQWdCWixXQUFBLEdBQWEsU0FBQyxjQUFEO0FBQ1QsVUFBQTtNQUFBLGNBQUEsR0FBaUIsY0FBYyxDQUFDLE1BQWYsQ0FBc0IsQ0FBdEIsRUFBeUIsY0FBYyxDQUFDLE1BQWYsR0FBd0IsQ0FBakQ7TUFDakIsS0FBQSxHQUFRO01BQ1IsR0FBQSxHQUFNO0FBQ04sYUFBTSxDQUFDLEtBQUEsR0FBUSxLQUFLLENBQUMsSUFBTixDQUFXLGNBQVgsQ0FBVCxDQUFBLEtBQTBDLElBQWhEO1FBQ0ksSUFBRyxLQUFLLENBQUMsS0FBTixLQUFlLEtBQUssQ0FBQyxTQUF4QjtVQUNJLEtBQUssQ0FBQyxTQUFOLEdBREo7O1FBR0EsSUFBRyxLQUFNLENBQUEsQ0FBQSxDQUFOLEtBQVksTUFBZjtVQUNJLEdBQUEsR0FBTSxLQUFNLENBQUEsQ0FBQSxDQUFFLENBQUMsSUFBVCxDQUFBO1VBQ04sS0FBQSxHQUFXLEtBQU0sQ0FBQSxDQUFBLENBQVQsR0FBaUIsS0FBTSxDQUFBLENBQUEsQ0FBdkIsR0FBa0MsS0FBTSxDQUFBLENBQUEsQ0FBVCxHQUFpQixLQUFNLENBQUEsQ0FBQSxDQUF2QixHQUFrQyxLQUFNLENBQUEsQ0FBQSxDQUFULEdBQWlCLEtBQU0sQ0FBQSxDQUFBLENBQXZCLEdBQUE7VUFDdEUsSUFBRyxHQUFJLENBQUEsQ0FBQSxDQUFKLEtBQVUsR0FBYjtZQUNJLEdBQUEsR0FBTSxHQUFHLENBQUMsTUFBSixDQUFXLENBQVg7WUFDTixJQUFHLEtBQUEsS0FBUyxNQUFaO2NBQ0ksS0FBQSxHQUFRLFFBRFo7YUFGSjs7VUFJQSxHQUFJLENBQUEsR0FBQSxDQUFKLEdBQVcsSUFBQyxDQUFBLFVBQUQsQ0FBWSxLQUFaLEVBUGY7O01BSko7QUFhQSxhQUFPO0lBakJFOzs7OztBQXREakIiLCJzb3VyY2VzQ29udGVudCI6WyJwYXRoID0gcmVxdWlyZSgncGF0aCcpXG5mcyA9IHJlcXVpcmUoJ2ZzJylcblxuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBBcmd1bWVudFBhcnNlclxuXG4gICAgcGFyc2VWYWx1ZTogKHZhbHVlKSAtPlxuICAgICAgICAjIHVuZGVmaW5lZCBpcyBhIHNwZWNpYWwgdmFsdWUgdGhhdCBtZWFucywgdGhhdCB0aGUga2V5IGlzIGRlZmluZWQsIGJ1dCBubyB2YWx1ZVxuICAgICAgICBpZiB2YWx1ZSBpcyB1bmRlZmluZWRcbiAgICAgICAgICAgIHJldHVybiB0cnVlXG5cbiAgICAgICAgdmFsdWUgPSB2YWx1ZS50cmltKClcblxuICAgICAgICAjIEJvb2xlYW5cbiAgICAgICAgaWYgdmFsdWUgaW4gW3RydWUsICd0cnVlJywgJ3llcyddXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICBpZiB2YWx1ZSBpbiBbZmFsc2UsICdmYWxzZScsICdubyddXG4gICAgICAgICAgICByZXR1cm4gZmFsc2VcblxuICAgICAgICAjIE51bWJlclxuICAgICAgICBpZiBpc0Zpbml0ZSh2YWx1ZSlcbiAgICAgICAgICAgIGlmIHZhbHVlLmluZGV4T2YoJy4nKSA+IC0xXG4gICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQodmFsdWUpXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlSW50KHZhbHVlKVxuXG4gICAgICAgICMgQXJyYXlcbiAgICAgICAgaWYgdmFsdWVbMF0gaXMgJ1snXG4gICAgICAgICAgICB2YWx1ZSA9IEBwYXJzZUFycmF5KHZhbHVlKVxuXG4gICAgICAgICMgT2JqZWN0XG4gICAgICAgIGlmIHZhbHVlWzBdIGlzICd7J1xuICAgICAgICAgICAgdmFsdWUgPSBAcGFyc2VPYmplY3QodmFsdWUpXG5cbiAgICAgICAgcmV0dXJuIHZhbHVlXG5cblxuICAgIHBhcnNlQXJyYXk6IChhcnJheUFzU3RyaW5nKSAtPlxuICAgICAgICBhcnJheUFzU3RyaW5nID0gYXJyYXlBc1N0cmluZy5zdWJzdHIoMSwgYXJyYXlBc1N0cmluZy5sZW5ndGggLSAyKVxuICAgICAgICByZWdleCA9IC8oPzpcXHMqKD86KD86JyguKj8pJyl8KD86XCIoLio/KVwiKXwoW14sO10rKSk/KSovZ1xuICAgICAgICBhcnIgPSBbXVxuICAgICAgICB3aGlsZSAobWF0Y2ggPSByZWdleC5leGVjKGFycmF5QXNTdHJpbmcpKSBpc250IG51bGxcbiAgICAgICAgICAgIGlmIG1hdGNoLmluZGV4ID09IHJlZ2V4Lmxhc3RJbmRleFxuICAgICAgICAgICAgICAgIHJlZ2V4Lmxhc3RJbmRleCsrXG5cbiAgICAgICAgICAgIHZhbHVlID0gaWYgbWF0Y2hbMV0gdGhlbiBtYXRjaFsxXSBlbHNlIGlmIG1hdGNoWzJdIHRoZW4gbWF0Y2hbMl0gZWxzZSBpZiBtYXRjaFszXSB0aGVuIG1hdGNoWzNdIGVsc2UgdW5kZWZpbmVkXG4gICAgICAgICAgICBpZiB2YWx1ZSBpc250IHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgIHZhbHVlID0gQHBhcnNlVmFsdWUodmFsdWUpXG4gICAgICAgICAgICAgICAgYXJyLnB1c2godmFsdWUpXG5cbiAgICAgICAgcmV0dXJuIGFyclxuXG5cbiAgICBwYXJzZU9iamVjdDogKG9iamVjdEFzU3RyaW5nKSAtPlxuICAgICAgICBvYmplY3RBc1N0cmluZyA9IG9iamVjdEFzU3RyaW5nLnN1YnN0cigxLCBvYmplY3RBc1N0cmluZy5sZW5ndGggLSAyKVxuICAgICAgICByZWdleCA9IC8oPzooXFwhP1tcXHctXFwuXSspKD86XFxzKjpcXHMqKD86KD86JyguKj8pJyl8KD86XCIoLio/KVwiKXwoW14sO10rKSkpPykqL2dcbiAgICAgICAgb2JqID0ge31cbiAgICAgICAgd2hpbGUgKG1hdGNoID0gcmVnZXguZXhlYyhvYmplY3RBc1N0cmluZykpIGlzbnQgbnVsbFxuICAgICAgICAgICAgaWYgbWF0Y2guaW5kZXggPT0gcmVnZXgubGFzdEluZGV4XG4gICAgICAgICAgICAgICAgcmVnZXgubGFzdEluZGV4KytcblxuICAgICAgICAgICAgaWYgbWF0Y2hbMV0gIT0gdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAga2V5ID0gbWF0Y2hbMV0udHJpbSgpXG4gICAgICAgICAgICAgICAgdmFsdWUgPSBpZiBtYXRjaFsyXSB0aGVuIG1hdGNoWzJdIGVsc2UgaWYgbWF0Y2hbM10gdGhlbiBtYXRjaFszXSBlbHNlIGlmIG1hdGNoWzRdIHRoZW4gbWF0Y2hbNF1cbiAgICAgICAgICAgICAgICBpZiBrZXlbMF0gaXMgJyEnXG4gICAgICAgICAgICAgICAgICAgIGtleSA9IGtleS5zdWJzdHIoMSlcbiAgICAgICAgICAgICAgICAgICAgaWYgdmFsdWUgaXMgdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9ICdmYWxzZSdcbiAgICAgICAgICAgICAgICBvYmpba2V5XSA9IEBwYXJzZVZhbHVlKHZhbHVlKVxuXG4gICAgICAgIHJldHVybiBvYmpcbiJdfQ==