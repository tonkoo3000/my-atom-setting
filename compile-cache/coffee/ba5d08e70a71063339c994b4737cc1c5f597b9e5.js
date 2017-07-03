(function() {
  module.exports = {
    provider: null,
    ready: false,
    activate: function() {
      return this.ready = true;
    },
    deactivate: function() {
      return this.provider = null;
    },
    getProvider: function() {
      var PathsProvider;
      if (this.provider != null) {
        return this.provider;
      }
      PathsProvider = require('./paths-provider');
      this.provider = new PathsProvider();
      return this.provider;
    },
    provide: function() {
      return {
        provider: this.getProvider()
      };
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvdG95b2tpLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1wYXRocy9saWIvYXV0b2NvbXBsZXRlLXBhdGhzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7SUFBQSxRQUFBLEVBQVUsSUFBVjtJQUNBLEtBQUEsRUFBTyxLQURQO0lBR0EsUUFBQSxFQUFVLFNBQUE7YUFDUixJQUFDLENBQUEsS0FBRCxHQUFTO0lBREQsQ0FIVjtJQU1BLFVBQUEsRUFBWSxTQUFBO2FBQ1YsSUFBQyxDQUFBLFFBQUQsR0FBWTtJQURGLENBTlo7SUFTQSxXQUFBLEVBQWEsU0FBQTtBQUNYLFVBQUE7TUFBQSxJQUFvQixxQkFBcEI7QUFBQSxlQUFPLElBQUMsQ0FBQSxTQUFSOztNQUNBLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLGtCQUFSO01BQ2hCLElBQUMsQ0FBQSxRQUFELEdBQWdCLElBQUEsYUFBQSxDQUFBO0FBQ2hCLGFBQU8sSUFBQyxDQUFBO0lBSkcsQ0FUYjtJQWVBLE9BQUEsRUFBUyxTQUFBO0FBQ1AsYUFBTztRQUFDLFFBQUEsRUFBVSxJQUFDLENBQUEsV0FBRCxDQUFBLENBQVg7O0lBREEsQ0FmVDs7QUFERiIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID1cbiAgcHJvdmlkZXI6IG51bGxcbiAgcmVhZHk6IGZhbHNlXG5cbiAgYWN0aXZhdGU6IC0+XG4gICAgQHJlYWR5ID0gdHJ1ZVxuXG4gIGRlYWN0aXZhdGU6IC0+XG4gICAgQHByb3ZpZGVyID0gbnVsbFxuXG4gIGdldFByb3ZpZGVyOiAtPlxuICAgIHJldHVybiBAcHJvdmlkZXIgaWYgQHByb3ZpZGVyP1xuICAgIFBhdGhzUHJvdmlkZXIgPSByZXF1aXJlKCcuL3BhdGhzLXByb3ZpZGVyJylcbiAgICBAcHJvdmlkZXIgPSBuZXcgUGF0aHNQcm92aWRlcigpXG4gICAgcmV0dXJuIEBwcm92aWRlclxuXG4gIHByb3ZpZGU6IC0+XG4gICAgcmV0dXJuIHtwcm92aWRlcjogQGdldFByb3ZpZGVyKCl9XG4iXX0=
