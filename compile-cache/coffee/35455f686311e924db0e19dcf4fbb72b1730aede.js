(function() {
  var RangeFinder, sortLines, sortLinesInsensitive, sortLinesNatural, sortLinesReversed, sortTextLines, uniqueLines;

  RangeFinder = require('./range-finder');

  module.exports = {
    activate: function() {
      return atom.commands.add('atom-text-editor:not([mini])', {
        'sort-lines:sort': function() {
          var editor;
          editor = atom.workspace.getActiveTextEditor();
          return sortLines(editor);
        },
        'sort-lines:reverse-sort': function() {
          var editor;
          editor = atom.workspace.getActiveTextEditor();
          return sortLinesReversed(editor);
        },
        'sort-lines:unique': function() {
          var editor;
          editor = atom.workspace.getActiveTextEditor();
          return uniqueLines(editor);
        },
        'sort-lines:case-insensitive-sort': function() {
          var editor;
          editor = atom.workspace.getActiveTextEditor();
          return sortLinesInsensitive(editor);
        },
        'sort-lines:natural': function() {
          var editor;
          editor = atom.workspace.getActiveTextEditor();
          return sortLinesNatural(editor);
        }
      });
    }
  };

  sortTextLines = function(editor, sorter) {
    var sortableRanges;
    sortableRanges = RangeFinder.rangesFor(editor);
    return sortableRanges.forEach(function(range) {
      var textLines;
      textLines = editor.getTextInBufferRange(range).split(/\r?\n/g);
      textLines = sorter(textLines);
      return editor.setTextInBufferRange(range, textLines.join("\n"));
    });
  };

  sortLines = function(editor) {
    return sortTextLines(editor, function(textLines) {
      return textLines.sort(function(a, b) {
        return a.localeCompare(b);
      });
    });
  };

  sortLinesReversed = function(editor) {
    return sortTextLines(editor, function(textLines) {
      return textLines.sort(function(a, b) {
        return b.localeCompare(a);
      });
    });
  };

  uniqueLines = function(editor) {
    return sortTextLines(editor, function(textLines) {
      return textLines.filter(function(value, index, self) {
        return self.indexOf(value) === index;
      });
    });
  };

  sortLinesInsensitive = function(editor) {
    return sortTextLines(editor, function(textLines) {
      return textLines.sort(function(a, b) {
        return a.toLowerCase().localeCompare(b.toLowerCase());
      });
    });
  };

  sortLinesNatural = function(editor) {
    return sortTextLines(editor, function(textLines) {
      var naturalSortRegex;
      naturalSortRegex = /^(\d*)(\D*)(\d*)([\s\S]*)$/;
      return textLines.sort((function(_this) {
        return function(a, b) {
          var __, aLeadingNum, aRemainder, aTrailingNum, aWord, bLeadingNum, bRemainder, bTrailingNum, bWord, ref, ref1;
          if (a === b) {
            return 0;
          }
          ref = naturalSortRegex.exec(a), __ = ref[0], aLeadingNum = ref[1], aWord = ref[2], aTrailingNum = ref[3], aRemainder = ref[4];
          ref1 = naturalSortRegex.exec(b), __ = ref1[0], bLeadingNum = ref1[1], bWord = ref1[2], bTrailingNum = ref1[3], bRemainder = ref1[4];
          if (aWord !== bWord) {
            return (a < b ? -1 : 1);
          }
          if (aLeadingNum !== bLeadingNum) {
            return (aLeadingNum < bLeadingNum ? -1 : 1);
          }
          if (aTrailingNum !== bTrailingNum) {
            return (aTrailingNum < bTrailingNum ? -1 : 1);
          }
          return 0;
        };
      })(this));
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvdG95b2tpLy5hdG9tL3BhY2thZ2VzL3NvcnQtbGluZXMvbGliL3NvcnQtbGluZXMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxXQUFBLEdBQWMsT0FBQSxDQUFRLGdCQUFSOztFQUVkLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7SUFBQSxRQUFBLEVBQVUsU0FBQTthQUNSLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQiw4QkFBbEIsRUFDRTtRQUFBLGlCQUFBLEVBQW1CLFNBQUE7QUFDakIsY0FBQTtVQUFBLE1BQUEsR0FBUyxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFmLENBQUE7aUJBQ1QsU0FBQSxDQUFVLE1BQVY7UUFGaUIsQ0FBbkI7UUFHQSx5QkFBQSxFQUEyQixTQUFBO0FBQ3pCLGNBQUE7VUFBQSxNQUFBLEdBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBZixDQUFBO2lCQUNULGlCQUFBLENBQWtCLE1BQWxCO1FBRnlCLENBSDNCO1FBTUEsbUJBQUEsRUFBcUIsU0FBQTtBQUNuQixjQUFBO1VBQUEsTUFBQSxHQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQWYsQ0FBQTtpQkFDVCxXQUFBLENBQVksTUFBWjtRQUZtQixDQU5yQjtRQVNBLGtDQUFBLEVBQW9DLFNBQUE7QUFDbEMsY0FBQTtVQUFBLE1BQUEsR0FBUyxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFmLENBQUE7aUJBQ1Qsb0JBQUEsQ0FBcUIsTUFBckI7UUFGa0MsQ0FUcEM7UUFZQSxvQkFBQSxFQUFzQixTQUFBO0FBQ3BCLGNBQUE7VUFBQSxNQUFBLEdBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBZixDQUFBO2lCQUNULGdCQUFBLENBQWlCLE1BQWpCO1FBRm9CLENBWnRCO09BREY7SUFEUSxDQUFWOzs7RUFrQkYsYUFBQSxHQUFnQixTQUFDLE1BQUQsRUFBUyxNQUFU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c291cmNlc0NvbnRlbnQiOlsiUmFuZ2VGaW5kZXIgPSByZXF1aXJlICcuL3JhbmdlLWZpbmRlcidcblxubW9kdWxlLmV4cG9ydHMgPVxuICBhY3RpdmF0ZTogLT5cbiAgICBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS10ZXh0LWVkaXRvcjpub3QoW21pbmldKScsXG4gICAgICAnc29ydC1saW5lczpzb3J0JzogLT5cbiAgICAgICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgICAgIHNvcnRMaW5lcyhlZGl0b3IpXG4gICAgICAnc29ydC1saW5lczpyZXZlcnNlLXNvcnQnOiAtPlxuICAgICAgICBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICAgICAgc29ydExpbmVzUmV2ZXJzZWQoZWRpdG9yKVxuICAgICAgJ3NvcnQtbGluZXM6dW5pcXVlJzogLT5cbiAgICAgICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgICAgIHVuaXF1ZUxpbmVzKGVkaXRvcilcbiAgICAgICdzb3J0LWxpbmVzOmNhc2UtaW5zZW5zaXRpdmUtc29ydCc6IC0+XG4gICAgICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgICAgICBzb3J0TGluZXNJbnNlbnNpdGl2ZShlZGl0b3IpXG4gICAgICAnc29ydC1saW5lczpuYXR1cmFsJzogLT5cbiAgICAgICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgICAgIHNvcnRMaW5lc05hdHVyYWwoZWRpdG9yKVxuXG5zb3J0VGV4dExpbmVzID0gKGVkaXRvciwgc29ydGVyKSAtPlxuICBzb3J0YWJsZVJhbmdlcyA9IFJhbmdlRmluZGVyLnJhbmdlc0ZvcihlZGl0b3IpXG4gIHNvcnRhYmxlUmFuZ2VzLmZvckVhY2ggKHJhbmdlKSAtPlxuICAgIHRleHRMaW5lcyA9IGVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZShyYW5nZSkuc3BsaXQoL1xccj9cXG4vZylcbiAgICB0ZXh0TGluZXMgPSBzb3J0ZXIodGV4dExpbmVzKVxuICAgIGVkaXRvci5zZXRUZXh0SW5CdWZmZXJSYW5nZShyYW5nZSwgdGV4dExpbmVzLmpvaW4oXCJcXG5cIikpXG5cbnNvcnRMaW5lcyA9IChlZGl0b3IpIC0+XG4gIHNvcnRUZXh0TGluZXMgZWRpdG9yLCAodGV4dExpbmVzKSAtPlxuICAgIHRleHRMaW5lcy5zb3J0IChhLCBiKSAtPiBhLmxvY2FsZUNvbXBhcmUoYilcblxuc29ydExpbmVzUmV2ZXJzZWQgPSAoZWRpdG9yKSAtPlxuICBzb3J0VGV4dExpbmVzIGVkaXRvciwgKHRleHRMaW5lcykgLT5cbiAgICB0ZXh0TGluZXMuc29ydCAoYSwgYikgLT4gYi5sb2NhbGVDb21wYXJlKGEpXG5cbnVuaXF1ZUxpbmVzID0gKGVkaXRvcikgLT5cbiAgc29ydFRleHRMaW5lcyBlZGl0b3IsICh0ZXh0TGluZXMpIC0+XG4gICAgdGV4dExpbmVzLmZpbHRlciAodmFsdWUsIGluZGV4LCBzZWxmKSAtPiBzZWxmLmluZGV4T2YodmFsdWUpID09IGluZGV4XG5cbnNvcnRMaW5lc0luc2Vuc2l0aXZlID0gKGVkaXRvcikgLT5cbiAgc29ydFRleHRMaW5lcyBlZGl0b3IsICh0ZXh0TGluZXMpIC0+XG4gICAgdGV4dExpbmVzLnNvcnQgKGEsIGIpIC0+IGEudG9Mb3dlckNhc2UoKS5sb2NhbGVDb21wYXJlKGIudG9Mb3dlckNhc2UoKSlcblxuc29ydExpbmVzTmF0dXJhbCA9IChlZGl0b3IpIC0+XG4gIHNvcnRUZXh0TGluZXMgZWRpdG9yLCAodGV4dExpbmVzKSAtPlxuICAgIG5hdHVyYWxTb3J0UmVnZXggPSAvXihcXGQqKShcXEQqKShcXGQqKShbXFxzXFxTXSopJC9cbiAgICB0ZXh0TGluZXMuc29ydCAoYSwgYikgPT5cbiAgICAgIHJldHVybiAwIGlmIGEgaXMgYlxuICAgICAgW19fLCBhTGVhZGluZ051bSwgYVdvcmQsIGFUcmFpbGluZ051bSwgYVJlbWFpbmRlcl0gPSBuYXR1cmFsU29ydFJlZ2V4LmV4ZWMoYSlcbiAgICAgIFtfXywgYkxlYWRpbmdOdW0sIGJXb3JkLCBiVHJhaWxpbmdOdW0sIGJSZW1haW5kZXJdID0gbmF0dXJhbFNvcnRSZWdleC5leGVjKGIpXG4gICAgICByZXR1cm4gKGlmIGEgPCBiIHRoZW4gLTEgZWxzZSAxKSBpZiBhV29yZCBpc250IGJXb3JkXG4gICAgICByZXR1cm4gKGlmIGFMZWFkaW5nTnVtIDwgYkxlYWRpbmdOdW0gdGhlbiAtMSBlbHNlIDEpIGlmIGFMZWFkaW5nTnVtIGlzbnQgYkxlYWRpbmdOdW1cbiAgICAgIHJldHVybiAoaWYgYVRyYWlsaW5nTnVtIDwgYlRyYWlsaW5nTnVtIHRoZW4gLTEgZWxzZSAxKSBpZiBhVHJhaWxpbmdOdW0gaXNudCBiVHJhaWxpbmdOdW1cbiAgICAgIHJldHVybiAwXG4iXX0=
