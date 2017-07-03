(function() {
  var Navigator;

  Navigator = (function() {
    function Navigator(separatorMarker) {
      var ref;
      this.separatorMarker = separatorMarker;
      ref = [null, null, null], this.conflict = ref[0], this.previous = ref[1], this.next = ref[2];
    }

    Navigator.prototype.linkToPrevious = function(c) {
      this.previous = c;
      if (c != null) {
        return c.navigator.next = this.conflict;
      }
    };

    Navigator.prototype.nextUnresolved = function() {
      var current;
      current = this.next;
      while ((current != null) && current.isResolved()) {
        current = current.navigator.next;
      }
      return current;
    };

    Navigator.prototype.previousUnresolved = function() {
      var current;
      current = this.previous;
      while ((current != null) && current.isResolved()) {
        current = current.navigator.previous;
      }
      return current;
    };

    Navigator.prototype.markers = function() {
      return [this.separatorMarker];
    };

    return Navigator;

  })();

  module.exports = {
    Navigator: Navigator
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvdG95b2tpLy5hdG9tL3BhY2thZ2VzL21lcmdlLWNvbmZsaWN0cy9saWIvbmF2aWdhdG9yLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQU07SUFFUyxtQkFBQyxlQUFEO0FBQ1gsVUFBQTtNQURZLElBQUMsQ0FBQSxrQkFBRDtNQUNaLE1BQWdDLENBQUMsSUFBRCxFQUFPLElBQVAsRUFBYSxJQUFiLENBQWhDLEVBQUMsSUFBQyxDQUFBLGlCQUFGLEVBQVksSUFBQyxDQUFBLGlCQUFiLEVBQXVCLElBQUMsQ0FBQTtJQURiOzt3QkFHYixjQUFBLEdBQWdCLFNBQUMsQ0FBRDtNQUNkLElBQUMsQ0FBQSxRQUFELEdBQVk7TUFDWixJQUFnQyxTQUFoQztlQUFBLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBWixHQUFtQixJQUFDLENBQUEsU0FBcEI7O0lBRmM7O3dCQUloQixjQUFBLEdBQWdCLFNBQUE7QUFDZCxVQUFBO01BQUEsT0FBQSxHQUFVLElBQUMsQ0FBQTtBQUNYLGFBQU0saUJBQUEsSUFBYSxPQUFPLENBQUMsVUFBUixDQUFBLENBQW5CO1FBQ0UsT0FBQSxHQUFVLE9BQU8sQ0FBQyxTQUFTLENBQUM7TUFEOUI7YUFFQTtJQUpjOzt3QkFNaEIsa0JBQUEsR0FBb0IsU0FBQTtBQUNsQixVQUFBO01BQUEsT0FBQSxHQUFVLElBQUMsQ0FBQTtBQUNYLGFBQU0saUJBQUEsSUFBYSxPQUFPLENBQUMsVUFBUixDQUFBLENBQW5CO1FBQ0UsT0FBQSxHQUFVLE9BQU8sQ0FBQyxTQUFTLENBQUM7TUFEOUI7YUFFQTtJQUprQjs7d0JBTXBCLE9BQUEsR0FBUyxTQUFBO2FBQUcsQ0FBQyxJQUFDLENBQUEsZUFBRjtJQUFIOzs7Ozs7RUFFWCxNQUFNLENBQUMsT0FBUCxHQUNFO0lBQUEsU0FBQSxFQUFXLFNBQVg7O0FBeEJGIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgTmF2aWdhdG9yXG5cbiAgY29uc3RydWN0b3I6IChAc2VwYXJhdG9yTWFya2VyKSAtPlxuICAgIFtAY29uZmxpY3QsIEBwcmV2aW91cywgQG5leHRdID0gW251bGwsIG51bGwsIG51bGxdXG5cbiAgbGlua1RvUHJldmlvdXM6IChjKSAtPlxuICAgIEBwcmV2aW91cyA9IGNcbiAgICBjLm5hdmlnYXRvci5uZXh0ID0gQGNvbmZsaWN0IGlmIGM/XG5cbiAgbmV4dFVucmVzb2x2ZWQ6IC0+XG4gICAgY3VycmVudCA9IEBuZXh0XG4gICAgd2hpbGUgY3VycmVudD8gYW5kIGN1cnJlbnQuaXNSZXNvbHZlZCgpXG4gICAgICBjdXJyZW50ID0gY3VycmVudC5uYXZpZ2F0b3IubmV4dFxuICAgIGN1cnJlbnRcblxuICBwcmV2aW91c1VucmVzb2x2ZWQ6IC0+XG4gICAgY3VycmVudCA9IEBwcmV2aW91c1xuICAgIHdoaWxlIGN1cnJlbnQ/IGFuZCBjdXJyZW50LmlzUmVzb2x2ZWQoKVxuICAgICAgY3VycmVudCA9IGN1cnJlbnQubmF2aWdhdG9yLnByZXZpb3VzXG4gICAgY3VycmVudFxuXG4gIG1hcmtlcnM6IC0+IFtAc2VwYXJhdG9yTWFya2VyXVxuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIE5hdmlnYXRvcjogTmF2aWdhdG9yXG4iXX0=
