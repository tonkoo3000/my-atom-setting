(function() {
  var BufferColorsScanner, ColorContext, ColorExpression, ColorScanner, ColorsChunkSize, ExpressionsRegistry;

  ColorScanner = require('../color-scanner');

  ColorContext = require('../color-context');

  ColorExpression = require('../color-expression');

  ExpressionsRegistry = require('../expressions-registry');

  ColorsChunkSize = 100;

  BufferColorsScanner = (function() {
    function BufferColorsScanner(config) {
      var colorVariables, registry, variables;
      this.buffer = config.buffer, variables = config.variables, colorVariables = config.colorVariables, this.bufferPath = config.bufferPath, this.scope = config.scope, registry = config.registry;
      registry = ExpressionsRegistry.deserialize(registry, ColorExpression);
      this.context = new ColorContext({
        variables: variables,
        colorVariables: colorVariables,
        referencePath: this.bufferPath,
        registry: registry
      });
      this.scanner = new ColorScanner({
        context: this.context
      });
      this.results = [];
    }

    BufferColorsScanner.prototype.scan = function() {
      var lastIndex, result;
      if (this.bufferPath == null) {
        return;
      }
      lastIndex = 0;
      while (result = this.scanner.search(this.buffer, this.scope, lastIndex)) {
        this.results.push(result);
        if (this.results.length >= ColorsChunkSize) {
          this.flushColors();
        }
        lastIndex = result.lastIndex;
      }
      return this.flushColors();
    };

    BufferColorsScanner.prototype.flushColors = function() {
      emit('scan-buffer:colors-found', this.results);
      return this.results = [];
    };

    return BufferColorsScanner;

  })();

  module.exports = function(config) {
    return new BufferColorsScanner(config).scan();
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvdG95b2tpLy5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL2xpYi90YXNrcy9zY2FuLWJ1ZmZlci1jb2xvcnMtaGFuZGxlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLFlBQUEsR0FBZSxPQUFBLENBQVEsa0JBQVI7O0VBQ2YsWUFBQSxHQUFlLE9BQUEsQ0FBUSxrQkFBUjs7RUFDZixlQUFBLEdBQWtCLE9BQUEsQ0FBUSxxQkFBUjs7RUFDbEIsbUJBQUEsR0FBc0IsT0FBQSxDQUFRLHlCQUFSOztFQUN0QixlQUFBLEdBQWtCOztFQUVaO0lBQ1MsNkJBQUMsTUFBRDtBQUNYLFVBQUE7TUFBQyxJQUFDLENBQUEsZ0JBQUEsTUFBRixFQUFVLDRCQUFWLEVBQXFCLHNDQUFyQixFQUFxQyxJQUFDLENBQUEsb0JBQUEsVUFBdEMsRUFBa0QsSUFBQyxDQUFBLGVBQUEsS0FBbkQsRUFBMEQ7TUFDMUQsUUFBQSxHQUFXLG1CQUFtQixDQUFDLFdBQXBCLENBQWdDLFFBQWhDLEVBQTBDLGVBQTFDO01BQ1gsSUFBQyxDQUFBLE9BQUQsR0FBZSxJQUFBLFlBQUEsQ0FBYTtRQUFDLFdBQUEsU0FBRDtRQUFZLGdCQUFBLGNBQVo7UUFBNEIsYUFBQSxFQUFlLElBQUMsQ0FBQSxVQUE1QztRQUF3RCxVQUFBLFFBQXhEO09BQWI7TUFDZixJQUFDLENBQUEsT0FBRCxHQUFlLElBQUEsWUFBQSxDQUFhO1FBQUUsU0FBRCxJQUFDLENBQUEsT0FBRjtPQUFiO01BQ2YsSUFBQyxDQUFBLE9BQUQsR0FBVztJQUxBOztrQ0FPYixJQUFBLEdBQU0sU0FBQTtBQUNKLFVBQUE7TUFBQSxJQUFjLHVCQUFkO0FBQUEsZUFBQTs7TUFDQSxTQUFBLEdBQVk7QUFDWixhQUFNLE1BQUEsR0FBUyxJQUFDLENBQUEsT0FBTyxDQUFDLE1BQVQsQ0FBZ0IsSUFBQyxDQUFBLE1BQWpCLEVBQXlCLElBQUMsQ0FBQSxLQUExQixFQUFpQyxTQUFqQyxDQUFmO1FBQ0UsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsTUFBZDtRQUVBLElBQWtCLElBQUMsQ0FBQSxPQUFPLENBQUMsTUFBVCxJQUFtQixlQUFyQztVQUFBLElBQUMsQ0FBQSxXQUFELENBQUEsRUFBQTs7UUFDQyxZQUFhO01BSmhCO2FBTUEsSUFBQyxDQUFBLFdBQUQsQ0FBQTtJQVRJOztrQ0FXTixXQUFBLEdBQWEsU0FBQTtNQUNYLElBQUEsQ0FBSywwQkFBTCxFQUFpQyxJQUFDLENBQUEsT0FBbEM7YUFDQSxJQUFDLENBQUEsT0FBRCxHQUFXO0lBRkE7Ozs7OztFQUlmLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFNBQUMsTUFBRDtXQUNYLElBQUEsbUJBQUEsQ0FBb0IsTUFBcEIsQ0FBMkIsQ0FBQyxJQUE1QixDQUFBO0VBRFc7QUE3QmpCIiwic291cmNlc0NvbnRlbnQiOlsiQ29sb3JTY2FubmVyID0gcmVxdWlyZSAnLi4vY29sb3Itc2Nhbm5lcidcbkNvbG9yQ29udGV4dCA9IHJlcXVpcmUgJy4uL2NvbG9yLWNvbnRleHQnXG5Db2xvckV4cHJlc3Npb24gPSByZXF1aXJlICcuLi9jb2xvci1leHByZXNzaW9uJ1xuRXhwcmVzc2lvbnNSZWdpc3RyeSA9IHJlcXVpcmUgJy4uL2V4cHJlc3Npb25zLXJlZ2lzdHJ5J1xuQ29sb3JzQ2h1bmtTaXplID0gMTAwXG5cbmNsYXNzIEJ1ZmZlckNvbG9yc1NjYW5uZXJcbiAgY29uc3RydWN0b3I6IChjb25maWcpIC0+XG4gICAge0BidWZmZXIsIHZhcmlhYmxlcywgY29sb3JWYXJpYWJsZXMsIEBidWZmZXJQYXRoLCBAc2NvcGUsIHJlZ2lzdHJ5fSA9IGNvbmZpZ1xuICAgIHJlZ2lzdHJ5ID0gRXhwcmVzc2lvbnNSZWdpc3RyeS5kZXNlcmlhbGl6ZShyZWdpc3RyeSwgQ29sb3JFeHByZXNzaW9uKVxuICAgIEBjb250ZXh0ID0gbmV3IENvbG9yQ29udGV4dCh7dmFyaWFibGVzLCBjb2xvclZhcmlhYmxlcywgcmVmZXJlbmNlUGF0aDogQGJ1ZmZlclBhdGgsIHJlZ2lzdHJ5fSlcbiAgICBAc2Nhbm5lciA9IG5ldyBDb2xvclNjYW5uZXIoe0Bjb250ZXh0fSlcbiAgICBAcmVzdWx0cyA9IFtdXG5cbiAgc2NhbjogLT5cbiAgICByZXR1cm4gdW5sZXNzIEBidWZmZXJQYXRoP1xuICAgIGxhc3RJbmRleCA9IDBcbiAgICB3aGlsZSByZXN1bHQgPSBAc2Nhbm5lci5zZWFyY2goQGJ1ZmZlciwgQHNjb3BlLCBsYXN0SW5kZXgpXG4gICAgICBAcmVzdWx0cy5wdXNoKHJlc3VsdClcblxuICAgICAgQGZsdXNoQ29sb3JzKCkgaWYgQHJlc3VsdHMubGVuZ3RoID49IENvbG9yc0NodW5rU2l6ZVxuICAgICAge2xhc3RJbmRleH0gPSByZXN1bHRcblxuICAgIEBmbHVzaENvbG9ycygpXG5cbiAgZmx1c2hDb2xvcnM6IC0+XG4gICAgZW1pdCgnc2Nhbi1idWZmZXI6Y29sb3JzLWZvdW5kJywgQHJlc3VsdHMpXG4gICAgQHJlc3VsdHMgPSBbXVxuXG5tb2R1bGUuZXhwb3J0cyA9IChjb25maWcpIC0+XG4gIG5ldyBCdWZmZXJDb2xvcnNTY2FubmVyKGNvbmZpZykuc2NhbigpXG4iXX0=
