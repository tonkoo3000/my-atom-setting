(function() {
  var Range, RangeFinder;

  Range = require('atom').Range;

  module.exports = RangeFinder = (function() {
    RangeFinder.rangesFor = function(editor) {
      return new RangeFinder(editor).ranges();
    };

    function RangeFinder(editor1) {
      this.editor = editor1;
    }

    RangeFinder.prototype.ranges = function() {
      var selectionRanges;
      selectionRanges = this.selectionRanges();
      if (selectionRanges.length === 0) {
        return [this.sortableRangeFrom(this.sortableRangeForEntireBuffer())];
      } else {
        return selectionRanges.map((function(_this) {
          return function(selectionRange) {
            return _this.sortableRangeFrom(selectionRange);
          };
        })(this));
      }
    };

    RangeFinder.prototype.selectionRanges = function() {
      return this.editor.getSelectedBufferRanges().filter(function(range) {
        return !range.isEmpty();
      });
    };

    RangeFinder.prototype.sortableRangeForEntireBuffer = function() {
      return this.editor.getBuffer().getRange();
    };

    RangeFinder.prototype.sortableRangeFrom = function(selectionRange) {
      var endCol, endRow, startCol, startRow;
      startRow = selectionRange.start.row;
      startCol = 0;
      endRow = selectionRange.end.column === 0 ? selectionRange.end.row - 1 : selectionRange.end.row;
      endCol = this.editor.lineTextForBufferRow(endRow).length;
      return new Range([startRow, startCol], [endRow, endCol]);
    };

    return RangeFinder;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvdG95b2tpLy5hdG9tL3BhY2thZ2VzL3NvcnQtbGluZXMvbGliL3JhbmdlLWZpbmRlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFDLFFBQVMsT0FBQSxDQUFRLE1BQVI7O0VBRVYsTUFBTSxDQUFDLE9BQVAsR0FDTTtJQUVKLFdBQUMsQ0FBQSxTQUFELEdBQVksU0FBQyxNQUFEO2FBQ04sSUFBQSxXQUFBLENBQVksTUFBWixDQUFtQixDQUFDLE1BQXBCLENBQUE7SUFETTs7SUFJQyxxQkFBQyxPQUFEO01BQUMsSUFBQyxDQUFBLFNBQUQ7SUFBRDs7MEJBR2IsTUFBQSxHQUFRLFNBQUE7QUFDTixVQUFBO01BQUEsZUFBQSxHQUFrQixJQUFDLENBQUEsZUFBRCxDQUFBO01BQ2xCLElBQUcsZUFBZSxDQUFDLE1BQWhCLEtBQTBCLENBQTdCO2VBQ0UsQ0FBQyxJQUFDLENBQUEsaUJBQUQsQ0FBbUIsSUFBQyxDQUFBLDRCQUFELENBQUEsQ0FBbkIsQ0FBRCxFQURGO09BQUEsTUFBQTtlQUdFLGVBQWUsQ0FBQyxHQUFoQixDQUFvQixDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFDLGNBQUQ7bUJBQ2xCLEtBQUMsQ0FBQSxpQkFBRCxDQUFtQixjQUFuQjtVQURrQjtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBcEIsRUFIRjs7SUFGTTs7MEJBU1IsZUFBQSxHQUFpQixTQUFBO2FBQ2YsSUFBQyxDQUFBLE1BQU0sQ0FBQyx1QkFBUixDQUFBLENBQWlDLENBQUMsTUFBbEMsQ0FBeUMsU0FBQyxLQUFEO2VBQ3ZDLENBQUksS0FBSyxDQUFDLE9BQU4sQ0FBQTtNQURtQyxDQUF6QztJQURlOzswQkFLakIsNEJBQUEsR0FBOEIsU0FBQTthQUM1QixJQUFDLENBQUEsTUFBTSxDQUFDLFNBQVIsQ0FBQSxDQUFtQixDQUFDLFFBQXBCLENBQUE7SUFENEI7OzBCQUk5QixpQkFBQSxHQUFtQixTQUFDLGNBQUQ7QUFDakIsVUFBQTtNQUFBLFFBQUEsR0FBVyxjQUFjLENBQUMsS0FBSyxDQUFDO01BQ2hDLFFBQUEsR0FBVztNQUNYLE1BQUEsR0FBWSxjQUFjLENBQUMsR0FBRyxDQUFDLE1BQW5CLEtBQTZCLENBQWhDLEdBQ1AsY0FBYyxDQUFDLEdBQUcsQ0FBQyxHQUFuQixHQUF5QixDQURsQixHQUdQLGNBQWMsQ0FBQyxHQUFHLENBQUM7TUFDckIsTUFBQSxHQUFTLElBQUMsQ0FBQSxNQUFNLENBQUMsb0JBQVIsQ0FBNkIsTUFBN0IsQ0FBb0MsQ0FBQzthQUUxQyxJQUFBLEtBQUEsQ0FBTSxDQUFDLFFBQUQsRUFBVyxRQUFYLENBQU4sRUFBNEIsQ0FBQyxNQUFELEVBQVMsTUFBVCxDQUE1QjtJQVRhOzs7OztBQTlCckIiLCJzb3VyY2VzQ29udGVudCI6WyJ7UmFuZ2V9ID0gcmVxdWlyZSAnYXRvbSdcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgUmFuZ2VGaW5kZXJcbiAgIyBQdWJsaWNcbiAgQHJhbmdlc0ZvcjogKGVkaXRvcikgLT5cbiAgICBuZXcgUmFuZ2VGaW5kZXIoZWRpdG9yKS5yYW5nZXMoKVxuXG4gICMgUHVibGljXG4gIGNvbnN0cnVjdG9yOiAoQGVkaXRvcikgLT5cblxuICAjIFB1YmxpY1xuICByYW5nZXM6IC0+XG4gICAgc2VsZWN0aW9uUmFuZ2VzID0gQHNlbGVjdGlvblJhbmdlcygpXG4gICAgaWYgc2VsZWN0aW9uUmFuZ2VzLmxlbmd0aCBpcyAwXG4gICAgICBbQHNvcnRhYmxlUmFuZ2VGcm9tKEBzb3J0YWJsZVJhbmdlRm9yRW50aXJlQnVmZmVyKCkpXVxuICAgIGVsc2VcbiAgICAgIHNlbGVjdGlvblJhbmdlcy5tYXAgKHNlbGVjdGlvblJhbmdlKSA9PlxuICAgICAgICBAc29ydGFibGVSYW5nZUZyb20oc2VsZWN0aW9uUmFuZ2UpXG5cbiAgIyBJbnRlcm5hbFxuICBzZWxlY3Rpb25SYW5nZXM6IC0+XG4gICAgQGVkaXRvci5nZXRTZWxlY3RlZEJ1ZmZlclJhbmdlcygpLmZpbHRlciAocmFuZ2UpIC0+XG4gICAgICBub3QgcmFuZ2UuaXNFbXB0eSgpXG5cbiAgIyBJbnRlcm5hbFxuICBzb3J0YWJsZVJhbmdlRm9yRW50aXJlQnVmZmVyOiAtPlxuICAgIEBlZGl0b3IuZ2V0QnVmZmVyKCkuZ2V0UmFuZ2UoKVxuXG4gICMgSW50ZXJuYWxcbiAgc29ydGFibGVSYW5nZUZyb206IChzZWxlY3Rpb25SYW5nZSkgLT5cbiAgICBzdGFydFJvdyA9IHNlbGVjdGlvblJhbmdlLnN0YXJ0LnJvd1xuICAgIHN0YXJ0Q29sID0gMFxuICAgIGVuZFJvdyA9IGlmIHNlbGVjdGlvblJhbmdlLmVuZC5jb2x1bW4gPT0gMFxuICAgICAgc2VsZWN0aW9uUmFuZ2UuZW5kLnJvdyAtIDFcbiAgICBlbHNlXG4gICAgICBzZWxlY3Rpb25SYW5nZS5lbmQucm93XG4gICAgZW5kQ29sID0gQGVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdyhlbmRSb3cpLmxlbmd0aFxuXG4gICAgbmV3IFJhbmdlIFtzdGFydFJvdywgc3RhcnRDb2xdLCBbZW5kUm93LCBlbmRDb2xdXG4iXX0=
