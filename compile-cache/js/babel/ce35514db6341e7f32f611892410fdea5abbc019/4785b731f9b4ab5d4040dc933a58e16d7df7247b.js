'use babel';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

module.exports = (function () {
  function EditorDiffExtender(editor) {
    _classCallCheck(this, EditorDiffExtender);

    this._editor = editor;
    this._markers = [];
    this._currentSelection = null;
    this._oldPlaceholderText = editor.getPlaceholderText();
    editor.setPlaceholderText('Paste what you want to diff here!');
    // add split-diff css selector to editors for keybindings #73
    atom.views.getView(this._editor).classList.add('split-diff');
  }

  /**
   * Creates a decoration for an offset. Adds the marker to this._markers.
   *
   * @param lineNumber The line number to add the block decoration to.
   * @param numberOfLines The number of lines that the block decoration's height will be.
   * @param blockPosition Specifies whether to put the decoration before the line or after.
   */

  _createClass(EditorDiffExtender, [{
    key: '_addOffsetDecoration',
    value: function _addOffsetDecoration(lineNumber, numberOfLines, blockPosition) {
      var element = document.createElement('div');
      element.className += 'split-diff-offset';
      // if no text, set height for blank lines
      element.style.minHeight = numberOfLines * this._editor.getLineHeightInPixels() + 'px';

      var marker = this._editor.markScreenPosition([lineNumber, 0], { invalidate: 'never' });
      this._editor.decorateMarker(marker, { type: 'block', position: blockPosition, item: element });
      this._markers.push(marker);
    }

    /**
     * Adds offsets (blank lines) into the editor.
     *
     * @param lineOffsets An array of offsets (blank lines) to insert into this editor.
     */
  }, {
    key: 'setLineOffsets',
    value: function setLineOffsets(lineOffsets) {
      var offsetLineNumbers = Object.keys(lineOffsets).map(function (lineNumber) {
        return parseInt(lineNumber, 10);
      }).sort(function (x, y) {
        return x - y;
      });

      for (var offsetLineNumber of offsetLineNumbers) {
        if (offsetLineNumber == 0) {
          // add block decoration before if adding to line 0
          this._addOffsetDecoration(offsetLineNumber - 1, lineOffsets[offsetLineNumber], 'before');
        } else {
          // add block decoration after if adding to lines > 0
          this._addOffsetDecoration(offsetLineNumber - 1, lineOffsets[offsetLineNumber], 'after');
        }
      }
    }

    /**
     * Creates marker for line highlight. Adds it to this._markers.
     *
     * @param startIndex The start index of the line chunk to highlight.
     * @param endIndex The end index of the line chunk to highlight.
     * @param highlightType The type of highlight to be applied to the line.
     */
  }, {
    key: 'highlightLines',
    value: function highlightLines(startIndex, endIndex, highlightType) {
      if (startIndex != endIndex) {
        var highlightClass = 'split-diff-' + highlightType;
        this._markers.push(this._createLineMarker(startIndex, endIndex, highlightClass));
      }
    }

    /**
     * Creates a marker and decorates its line and line number.
     *
     * @param startLineNumber A buffer line number to start highlighting at.
     * @param endLineNumber A buffer line number to end highlighting at.
     * @param highlightClass The type of highlight to be applied to the line.
     *    Could be a value of: ['split-diff-insert', 'split-diff-delete',
     *    'split-diff-select'].
     * @return The created line marker.
     */
  }, {
    key: '_createLineMarker',
    value: function _createLineMarker(startLineNumber, endLineNumber, highlightClass) {
      var marker = this._editor.markBufferRange([[startLineNumber, 0], [endLineNumber, 0]], { invalidate: 'never', 'class': highlightClass });

      this._editor.decorateMarker(marker, { type: 'line-number', 'class': highlightClass });
      this._editor.decorateMarker(marker, { type: 'line', 'class': highlightClass });

      return marker;
    }

    /**
     * Highlights words in a given line.
     *
     * @param lineNumber The line number to highlight words on.
     * @param wordDiff An array of objects which look like...
     *    added: boolean (not used)
     *    count: number (not used)
     *    removed: boolean (not used)
     *    value: string
     *    changed: boolean
     * @param type The type of highlight to be applied to the words.
     */
  }, {
    key: 'setWordHighlights',
    value: function setWordHighlights(lineNumber, wordDiff, type, isWhitespaceIgnored) {
      if (wordDiff === undefined) wordDiff = [];

      var klass = 'split-diff-word-' + type;
      var count = 0;

      for (var i = 0; i < wordDiff.length; i++) {
        if (wordDiff[i].value) {
          // fix for #49
          // if there was a change
          // AND one of these is true:
          // if the string is not spaces, highlight
          // OR
          // if the string is spaces and whitespace not ignored, highlight
          if (wordDiff[i].changed && (/\S/.test(wordDiff[i].value) || !/\S/.test(wordDiff[i].value) && !isWhitespaceIgnored)) {
            var marker = this._editor.markBufferRange([[lineNumber, count], [lineNumber, count + wordDiff[i].value.length]], { invalidate: 'never', persistent: false, 'class': klass });

            this._editor.decorateMarker(marker, { type: 'highlight', 'class': klass });
            this._markers.push(marker);
          }
          count += wordDiff[i].value.length;
        }
      }
    }

    /**
     * Destroys all markers added to this editor by split-diff.
     */
  }, {
    key: 'destroyMarkers',
    value: function destroyMarkers() {
      for (var i = 0; i < this._markers.length; i++) {
        this._markers[i].destroy();
      }
      this._markers = [];

      this.deselectAllLines();
    }

    /**
     * Destroys the instance of the EditorDiffExtender and cleans up after itself.
     */
  }, {
    key: 'destroy',
    value: function destroy() {
      this.destroyMarkers();
      this._editor.setPlaceholderText(this._oldPlaceholderText);
      // remove split-diff css selector from editors for keybindings #73
      atom.views.getView(this._editor).classList.remove('split-diff');
    }

    /**
     * Not added to this._markers because we want it to persist between updates.
     *
     * @param startLine The line number that the selection starts at.
     * @param endLine The line number that the selection ends at (non-inclusive).
     */
  }, {
    key: 'selectLines',
    value: function selectLines(startLine, endLine) {
      // don't want to highlight if they are the same (same numbers means chunk is
      // just pointing to a location to copy-to-right/copy-to-left)
      if (startLine < endLine) {
        this._currentSelection = this._createLineMarker(startLine, endLine, 'split-diff-selected');
      }
    }

    /**
     * Destroy the selection markers.
     */
  }, {
    key: 'deselectAllLines',
    value: function deselectAllLines() {
      if (this._currentSelection) {
        this._currentSelection.destroy();
        this._currentSelection = null;
      }
    }

    /**
     * Used to test whether there is currently an active selection highlight in
     * the editor.
     *
     * @return A boolean signifying whether there is an active selection highlight.
     */
  }, {
    key: 'hasSelection',
    value: function hasSelection() {
      if (this._currentSelection) {
        return true;
      }
      return false;
    }

    /**
     * Enable soft wrap for this editor.
     */
  }, {
    key: 'enableSoftWrap',
    value: function enableSoftWrap() {
      try {
        this._editor.setSoftWrapped(true);
      } catch (e) {
        //console.log('Soft wrap was enabled on a text editor that does not exist.');
      }
    }

    /**
     * Removes the text editor without prompting a save.
     */
  }, {
    key: 'cleanUp',
    value: function cleanUp() {
      // if the pane that this editor was in is now empty, we will destroy it
      var editorPane = atom.workspace.paneForItem(this._editor);
      if (typeof editorPane !== 'undefined' && editorPane != null && editorPane.getItems().length == 1) {
        editorPane.destroy();
      } else {
        this._editor.destroy();
      }
    }

    /**
     * Finds cursor-touched line ranges that are marked as different in an editor
     * view.
     *
     * @return The line ranges of diffs that are touched by a cursor.
     */
  }, {
    key: 'getCursorDiffLines',
    value: function getCursorDiffLines() {
      var cursorPositions = this._editor.getCursorBufferPositions();
      var touchedLines = [];

      for (var i = 0; i < cursorPositions.length; i++) {
        for (var j = 0; j < this._markers.length; j++) {
          var markerRange = this._markers[j].getBufferRange();

          if (cursorPositions[i].row >= markerRange.start.row && cursorPositions[i].row < markerRange.end.row) {
            touchedLines.push(markerRange);
            break;
          }
        }
      }

      // put the chunks in order so the copy function doesn't mess up
      touchedLines.sort(function (lineA, lineB) {
        return lineA.start.row - lineB.start.row;
      });

      return touchedLines;
    }

    /**
     * Used to get the Text Editor object for this view. Helpful for calling basic
     * Atom Text Editor functions.
     *
     * @return The Text Editor object for this view.
     */
  }, {
    key: 'getEditor',
    value: function getEditor() {
      return this._editor;
    }
  }]);

  return EditorDiffExtender;
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3RveW9raS8uYXRvbS9wYWNrYWdlcy9naXQtdGltZS1tYWNoaW5lL25vZGVfbW9kdWxlcy9zcGxpdC1kaWZmL2xpYi9lZGl0b3ItZGlmZi1leHRlbmRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxXQUFXLENBQUE7Ozs7OztBQUVYLE1BQU0sQ0FBQyxPQUFPO0FBS0QsV0FMVSxrQkFBa0IsQ0FLM0IsTUFBTSxFQUFFOzBCQUxDLGtCQUFrQjs7QUFNckMsUUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7QUFDdEIsUUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7QUFDbkIsUUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQztBQUM5QixRQUFJLENBQUMsbUJBQW1CLEdBQUcsTUFBTSxDQUFDLGtCQUFrQixFQUFFLENBQUM7QUFDdkQsVUFBTSxDQUFDLGtCQUFrQixDQUFDLG1DQUFtQyxDQUFDLENBQUM7O0FBRS9ELFFBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO0dBQzlEOzs7Ozs7Ozs7O2VBYm9CLGtCQUFrQjs7V0FzQm5CLDhCQUFDLFVBQVUsRUFBRSxhQUFhLEVBQUUsYUFBYSxFQUFRO0FBQ25FLFVBQUksT0FBTyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDNUMsYUFBTyxDQUFDLFNBQVMsSUFBSSxtQkFBbUIsQ0FBQzs7QUFFekMsYUFBTyxDQUFDLEtBQUssQ0FBQyxTQUFTLEdBQUcsQUFBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxxQkFBcUIsRUFBRSxHQUFJLElBQUksQ0FBQzs7QUFFeEYsVUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFDLFVBQVUs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b20vcGFja2FnZXMvZ2l0LXRpbWUtbWFjaGluZS9ub2RlX21vZHVsZXMvc3BsaXQtZGlmZi9saWIvZWRpdG9yLWRpZmYtZXh0ZW5kZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIEVkaXRvckRpZmZFeHRlbmRlciB7XG4gIF9lZGl0b3I6IE9iamVjdDtcbiAgX21hcmtlcnM6IEFycmF5PGF0b20kTWFya2VyPjtcbiAgX2N1cnJlbnRTZWxlY3Rpb246IEFycmF5PGF0b20kTWFya2VyPjtcblxuICBjb25zdHJ1Y3RvcihlZGl0b3IpIHtcbiAgICB0aGlzLl9lZGl0b3IgPSBlZGl0b3I7XG4gICAgdGhpcy5fbWFya2VycyA9IFtdO1xuICAgIHRoaXMuX2N1cnJlbnRTZWxlY3Rpb24gPSBudWxsO1xuICAgIHRoaXMuX29sZFBsYWNlaG9sZGVyVGV4dCA9IGVkaXRvci5nZXRQbGFjZWhvbGRlclRleHQoKTtcbiAgICBlZGl0b3Iuc2V0UGxhY2Vob2xkZXJUZXh0KCdQYXN0ZSB3aGF0IHlvdSB3YW50IHRvIGRpZmYgaGVyZSEnKTtcbiAgICAvLyBhZGQgc3BsaXQtZGlmZiBjc3Mgc2VsZWN0b3IgdG8gZWRpdG9ycyBmb3Iga2V5YmluZGluZ3MgIzczXG4gICAgYXRvbS52aWV3cy5nZXRWaWV3KHRoaXMuX2VkaXRvcikuY2xhc3NMaXN0LmFkZCgnc3BsaXQtZGlmZicpO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBkZWNvcmF0aW9uIGZvciBhbiBvZmZzZXQuIEFkZHMgdGhlIG1hcmtlciB0byB0aGlzLl9tYXJrZXJzLlxuICAgKlxuICAgKiBAcGFyYW0gbGluZU51bWJlciBUaGUgbGluZSBudW1iZXIgdG8gYWRkIHRoZSBibG9jayBkZWNvcmF0aW9uIHRvLlxuICAgKiBAcGFyYW0gbnVtYmVyT2ZMaW5lcyBUaGUgbnVtYmVyIG9mIGxpbmVzIHRoYXQgdGhlIGJsb2NrIGRlY29yYXRpb24ncyBoZWlnaHQgd2lsbCBiZS5cbiAgICogQHBhcmFtIGJsb2NrUG9zaXRpb24gU3BlY2lmaWVzIHdoZXRoZXIgdG8gcHV0IHRoZSBkZWNvcmF0aW9uIGJlZm9yZSB0aGUgbGluZSBvciBhZnRlci5cbiAgICovXG4gIF9hZGRPZmZzZXREZWNvcmF0aW9uKGxpbmVOdW1iZXIsIG51bWJlck9mTGluZXMsIGJsb2NrUG9zaXRpb24pOiB2b2lkIHtcbiAgICB2YXIgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGVsZW1lbnQuY2xhc3NOYW1lICs9ICdzcGxpdC1kaWZmLW9mZnNldCc7XG4gICAgLy8gaWYgbm8gdGV4dCwgc2V0IGhlaWdodCBmb3IgYmxhbmsgbGluZXNcbiAgICBlbGVtZW50LnN0eWxlLm1pbkhlaWdodCA9IChudW1iZXJPZkxpbmVzICogdGhpcy5fZWRpdG9yLmdldExpbmVIZWlnaHRJblBpeGVscygpKSArICdweCc7XG5cbiAgICB2YXIgbWFya2VyID0gdGhpcy5fZWRpdG9yLm1hcmtTY3JlZW5Qb3NpdGlvbihbbGluZU51bWJlciwgMF0sIHtpbnZhbGlkYXRlOiAnbmV2ZXInfSk7XG4gICAgdGhpcy5fZWRpdG9yLmRlY29yYXRlTWFya2VyKG1hcmtlciwge3R5cGU6ICdibG9jaycsIHBvc2l0aW9uOiBibG9ja1Bvc2l0aW9uLCBpdGVtOiBlbGVtZW50fSk7XG4gICAgdGhpcy5fbWFya2Vycy5wdXNoKG1hcmtlcik7XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBvZmZzZXRzIChibGFuayBsaW5lcykgaW50byB0aGUgZWRpdG9yLlxuICAgKlxuICAgKiBAcGFyYW0gbGluZU9mZnNldHMgQW4gYXJyYXkgb2Ygb2Zmc2V0cyAoYmxhbmsgbGluZXMpIHRvIGluc2VydCBpbnRvIHRoaXMgZWRpdG9yLlxuICAgKi9cbiAgc2V0TGluZU9mZnNldHMobGluZU9mZnNldHM6IGFueSk6IHZvaWQge1xuICAgIHZhciBvZmZzZXRMaW5lTnVtYmVycyA9IE9iamVjdC5rZXlzKGxpbmVPZmZzZXRzKS5tYXAobGluZU51bWJlciA9PiBwYXJzZUludChsaW5lTnVtYmVyLCAxMCkpLnNvcnQoKHgsIHkpID0+IHggLSB5KTtcblxuICAgIGZvciAodmFyIG9mZnNldExpbmVOdW1iZXIgb2Ygb2Zmc2V0TGluZU51bWJlcnMpIHtcbiAgICAgIGlmIChvZmZzZXRMaW5lTnVtYmVyID09IDApIHtcbiAgICAgICAgLy8gYWRkIGJsb2NrIGRlY29yYXRpb24gYmVmb3JlIGlmIGFkZGluZyB0byBsaW5lIDBcbiAgICAgICAgdGhpcy5fYWRkT2Zmc2V0RGVjb3JhdGlvbihvZmZzZXRMaW5lTnVtYmVyLTEsIGxpbmVPZmZzZXRzW29mZnNldExpbmVOdW1iZXJdLCAnYmVmb3JlJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBhZGQgYmxvY2sgZGVjb3JhdGlvbiBhZnRlciBpZiBhZGRpbmcgdG8gbGluZXMgPiAwXG4gICAgICAgIHRoaXMuX2FkZE9mZnNldERlY29yYXRpb24ob2Zmc2V0TGluZU51bWJlci0xLCBsaW5lT2Zmc2V0c1tvZmZzZXRMaW5lTnVtYmVyXSwgJ2FmdGVyJyk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgbWFya2VyIGZvciBsaW5lIGhpZ2hsaWdodC4gQWRkcyBpdCB0byB0aGlzLl9tYXJrZXJzLlxuICAgKlxuICAgKiBAcGFyYW0gc3RhcnRJbmRleCBUaGUgc3RhcnQgaW5kZXggb2YgdGhlIGxpbmUgY2h1bmsgdG8gaGlnaGxpZ2h0LlxuICAgKiBAcGFyYW0gZW5kSW5kZXggVGhlIGVuZCBpbmRleCBvZiB0aGUgbGluZSBjaHVuayB0byBoaWdobGlnaHQuXG4gICAqIEBwYXJhbSBoaWdobGlnaHRUeXBlIFRoZSB0eXBlIG9mIGhpZ2hsaWdodCB0byBiZSBhcHBsaWVkIHRvIHRoZSBsaW5lLlxuICAgKi9cbiAgaGlnaGxpZ2h0TGluZXMoIHN0YXJ0SW5kZXgsIGVuZEluZGV4LCBoaWdobGlnaHRUeXBlICkge1xuICAgIGlmKCBzdGFydEluZGV4ICE9IGVuZEluZGV4ICkge1xuICAgICAgdmFyIGhpZ2hsaWdodENsYXNzID0gJ3NwbGl0LWRpZmYtJyArIGhpZ2hsaWdodFR5cGU7XG4gICAgICB0aGlzLl9tYXJrZXJzLnB1c2goIHRoaXMuX2NyZWF0ZUxpbmVNYXJrZXIoIHN0YXJ0SW5kZXgsIGVuZEluZGV4LCBoaWdobGlnaHRDbGFzcyApICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBtYXJrZXIgYW5kIGRlY29yYXRlcyBpdHMgbGluZSBhbmQgbGluZSBudW1iZXIuXG4gICAqXG4gICAqIEBwYXJhbSBzdGFydExpbmVOdW1iZXIgQSBidWZmZXIgbGluZSBudW1iZXIgdG8gc3RhcnQgaGlnaGxpZ2h0aW5nIGF0LlxuICAgKiBAcGFyYW0gZW5kTGluZU51bWJlciBBIGJ1ZmZlciBsaW5lIG51bWJlciB0byBlbmQgaGlnaGxpZ2h0aW5nIGF0LlxuICAgKiBAcGFyYW0gaGlnaGxpZ2h0Q2xhc3MgVGhlIHR5cGUgb2YgaGlnaGxpZ2h0IHRvIGJlIGFwcGxpZWQgdG8gdGhlIGxpbmUuXG4gICAqICAgIENvdWxkIGJlIGEgdmFsdWUgb2Y6IFsnc3BsaXQtZGlmZi1pbnNlcnQnLCAnc3BsaXQtZGlmZi1kZWxldGUnLFxuICAgKiAgICAnc3BsaXQtZGlmZi1zZWxlY3QnXS5cbiAgICogQHJldHVybiBUaGUgY3JlYXRlZCBsaW5lIG1hcmtlci5cbiAgICovXG4gIF9jcmVhdGVMaW5lTWFya2VyKHN0YXJ0TGluZU51bWJlcjogbnVtYmVyLCBlbmRMaW5lTnVtYmVyOiBudW1iZXIsIGhpZ2hsaWdodENsYXNzOiBzdHJpbmcpOiBhdG9tJE1hcmtlciB7XG4gICAgdmFyIG1hcmtlciA9IHRoaXMuX2VkaXRvci5tYXJrQnVmZmVyUmFuZ2UoW1tzdGFydExpbmVOdW1iZXIsIDBdLCBbZW5kTGluZU51bWJlciwgMF1dLCB7aW52YWxpZGF0ZTogJ25ldmVyJywgY2xhc3M6IGhpZ2hsaWdodENsYXNzfSlcblxuICAgIHRoaXMuX2VkaXRvci5kZWNvcmF0ZU1hcmtlcihtYXJrZXIsIHt0eXBlOiAnbGluZS1udW1iZXInLCBjbGFzczogaGlnaGxpZ2h0Q2xhc3N9KTtcbiAgICB0aGlzLl9lZGl0b3IuZGVjb3JhdGVNYXJrZXIobWFya2VyLCB7dHlwZTogJ2xpbmUnLCBjbGFzczogaGlnaGxpZ2h0Q2xhc3N9KTtcblxuICAgIHJldHVybiBtYXJrZXI7XG4gIH1cblxuICAvKipcbiAgICogSGlnaGxpZ2h0cyB3b3JkcyBpbiBhIGdpdmVuIGxpbmUuXG4gICAqXG4gICAqIEBwYXJhbSBsaW5lTnVtYmVyIFRoZSBsaW5lIG51bWJlciB0byBoaWdobGlnaHQgd29yZHMgb24uXG4gICAqIEBwYXJhbSB3b3JkRGlmZiBBbiBhcnJheSBvZiBvYmplY3RzIHdoaWNoIGxvb2sgbGlrZS4uLlxuICAgKiAgICBhZGRlZDogYm9vbGVhbiAobm90IHVzZWQpXG4gICAqICAgIGNvdW50OiBudW1iZXIgKG5vdCB1c2VkKVxuICAgKiAgICByZW1vdmVkOiBib29sZWFuIChub3QgdXNlZClcbiAgICogICAgdmFsdWU6IHN0cmluZ1xuICAgKiAgICBjaGFuZ2VkOiBib29sZWFuXG4gICAqIEBwYXJhbSB0eXBlIFRoZSB0eXBlIG9mIGhpZ2hsaWdodCB0byBiZSBhcHBsaWVkIHRvIHRoZSB3b3Jkcy5cbiAgICovXG4gIHNldFdvcmRIaWdobGlnaHRzKGxpbmVOdW1iZXI6IG51bWJlciwgd29yZERpZmY6IEFycmF5PGFueT4gPSBbXSwgdHlwZTogc3RyaW5nLCBpc1doaXRlc3BhY2VJZ25vcmVkOiBib29sZWFuKTogdm9pZCB7XG4gICAgdmFyIGtsYXNzID0gJ3NwbGl0LWRpZmYtd29yZC0nICsgdHlwZTtcbiAgICB2YXIgY291bnQgPSAwO1xuXG4gICAgZm9yICh2YXIgaT0wOyBpPHdvcmREaWZmLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAod29yZERpZmZbaV0udmFsdWUpIHsgLy8gZml4IGZvciAjNDlcbiAgICAgICAgLy8gaWYgdGhlcmUgd2FzIGEgY2hhbmdlXG4gICAgICAgIC8vIEFORCBvbmUgb2YgdGhlc2UgaXMgdHJ1ZTpcbiAgICAgICAgLy8gaWYgdGhlIHN0cmluZyBpcyBub3Qgc3BhY2VzLCBoaWdobGlnaHRcbiAgICAgICAgLy8gT1JcbiAgICAgICAgLy8gaWYgdGhlIHN0cmluZyBpcyBzcGFjZXMgYW5kIHdoaXRlc3BhY2Ugbm90IGlnbm9yZWQsIGhpZ2hsaWdodFxuICAgICAgICBpZiAod29yZERpZmZbaV0uY2hhbmdlZFxuICAgICAgICAgICYmICgvXFxTLy50ZXN0KHdvcmREaWZmW2ldLnZhbHVlKVxuICAgICAgICAgIHx8ICghL1xcUy8udGVzdCh3b3JkRGlmZltpXS52YWx1ZSkgJiYgIWlzV2hpdGVzcGFjZUlnbm9yZWQpKSkge1xuICAgICAgICAgIHZhciBtYXJrZXIgPSB0aGlzLl9lZGl0b3IubWFya0J1ZmZlclJhbmdlKFtbbGluZU51bWJlciwgY291bnRdLCBbbGluZU51bWJlciwgKGNvdW50ICsgd29yZERpZmZbaV0udmFsdWUubGVuZ3RoKV1dLCB7aW52YWxpZGF0ZTogJ25ldmVyJywgcGVyc2lzdGVudDogZmFsc2UsIGNsYXNzOiBrbGFzc30pXG5cbiAgICAgICAgICB0aGlzLl9lZGl0b3IuZGVjb3JhdGVNYXJrZXIobWFya2VyLCB7dHlwZTogJ2hpZ2hsaWdodCcsIGNsYXNzOiBrbGFzc30pO1xuICAgICAgICAgIHRoaXMuX21hcmtlcnMucHVzaChtYXJrZXIpO1xuICAgICAgICB9XG4gICAgICAgIGNvdW50ICs9IHdvcmREaWZmW2ldLnZhbHVlLmxlbmd0aDtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRGVzdHJveXMgYWxsIG1hcmtlcnMgYWRkZWQgdG8gdGhpcyBlZGl0b3IgYnkgc3BsaXQtZGlmZi5cbiAgICovXG4gIGRlc3Ryb3lNYXJrZXJzKCk6IHZvaWQge1xuICAgIGZvciAodmFyIGk9MDsgaTx0aGlzLl9tYXJrZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB0aGlzLl9tYXJrZXJzW2ldLmRlc3Ryb3koKTtcbiAgICB9XG4gICAgdGhpcy5fbWFya2VycyA9IFtdO1xuXG4gICAgdGhpcy5kZXNlbGVjdEFsbExpbmVzKCk7XG4gIH1cblxuICAvKipcbiAgICogRGVzdHJveXMgdGhlIGluc3RhbmNlIG9mIHRoZSBFZGl0b3JEaWZmRXh0ZW5kZXIgYW5kIGNsZWFucyB1cCBhZnRlciBpdHNlbGYuXG4gICAqL1xuICBkZXN0cm95KCk6IHZvaWQge1xuICAgICAgdGhpcy5kZXN0cm95TWFya2VycygpO1xuICAgICAgdGhpcy5fZWRpdG9yLnNldFBsYWNlaG9sZGVyVGV4dCh0aGlzLl9vbGRQbGFjZWhvbGRlclRleHQpO1xuICAgICAgLy8gcmVtb3ZlIHNwbGl0LWRpZmYgY3NzIHNlbGVjdG9yIGZyb20gZWRpdG9ycyBmb3Iga2V5YmluZGluZ3MgIzczXG4gICAgICBhdG9tLnZpZXdzLmdldFZpZXcodGhpcy5fZWRpdG9yKS5jbGFzc0xpc3QucmVtb3ZlKCdzcGxpdC1kaWZmJylcbiAgfVxuXG4gIC8qKlxuICAgKiBOb3QgYWRkZWQgdG8gdGhpcy5fbWFya2VycyBiZWNhdXNlIHdlIHdhbnQgaXQgdG8gcGVyc2lzdCBiZXR3ZWVuIHVwZGF0ZXMuXG4gICAqXG4gICAqIEBwYXJhbSBzdGFydExpbmUgVGhlIGxpbmUgbnVtYmVyIHRoYXQgdGhlIHNlbGVjdGlvbiBzdGFydHMgYXQuXG4gICAqIEBwYXJhbSBlbmRMaW5lIFRoZSBsaW5lIG51bWJlciB0aGF0IHRoZSBzZWxlY3Rpb24gZW5kcyBhdCAobm9uLWluY2x1c2l2ZSkuXG4gICAqL1xuICBzZWxlY3RMaW5lcyhzdGFydExpbmU6IG51bWJlciwgZW5kTGluZTogbnVtYmVyKTogdm9pZCB7XG4gICAgLy8gZG9uJ3Qgd2FudCB0byBoaWdobGlnaHQgaWYgdGhleSBhcmUgdGhlIHNhbWUgKHNhbWUgbnVtYmVycyBtZWFucyBjaHVuayBpc1xuICAgIC8vIGp1c3QgcG9pbnRpbmcgdG8gYSBsb2NhdGlvbiB0byBjb3B5LXRvLXJpZ2h0L2NvcHktdG8tbGVmdClcbiAgICBpZiAoc3RhcnRMaW5lIDwgZW5kTGluZSkge1xuICAgICAgdGhpcy5fY3VycmVudFNlbGVjdGlvbiA9IHRoaXMuX2NyZWF0ZUxpbmVNYXJrZXIoc3RhcnRMaW5lLCBlbmRMaW5lLCAnc3BsaXQtZGlmZi1zZWxlY3RlZCcpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBEZXN0cm95IHRoZSBzZWxlY3Rpb24gbWFya2Vycy5cbiAgICovXG4gIGRlc2VsZWN0QWxsTGluZXMoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX2N1cnJlbnRTZWxlY3Rpb24pIHtcbiAgICAgIHRoaXMuX2N1cnJlbnRTZWxlY3Rpb24uZGVzdHJveSgpO1xuICAgICAgdGhpcy5fY3VycmVudFNlbGVjdGlvbiA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFVzZWQgdG8gdGVzdCB3aGV0aGVyIHRoZXJlIGlzIGN1cnJlbnRseSBhbiBhY3RpdmUgc2VsZWN0aW9uIGhpZ2hsaWdodCBpblxuICAgKiB0aGUgZWRpdG9yLlxuICAgKlxuICAgKiBAcmV0dXJuIEEgYm9vbGVhbiBzaWduaWZ5aW5nIHdoZXRoZXIgdGhlcmUgaXMgYW4gYWN0aXZlIHNlbGVjdGlvbiBoaWdobGlnaHQuXG4gICAqL1xuICBoYXNTZWxlY3Rpb24oKTogYm9vbGVhbiB7XG4gICAgaWYodGhpcy5fY3VycmVudFNlbGVjdGlvbikge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIEVuYWJsZSBzb2Z0IHdyYXAgZm9yIHRoaXMgZWRpdG9yLlxuICAgKi9cbiAgZW5hYmxlU29mdFdyYXAoKTogdm9pZCB7XG4gICAgdHJ5IHtcbiAgICAgIHRoaXMuX2VkaXRvci5zZXRTb2Z0V3JhcHBlZCh0cnVlKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAvL2NvbnNvbGUubG9nKCdTb2Z0IHdyYXAgd2FzIGVuYWJsZWQgb24gYSB0ZXh0IGVkaXRvciB0aGF0IGRvZXMgbm90IGV4aXN0LicpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIHRoZSB0ZXh0IGVkaXRvciB3aXRob3V0IHByb21wdGluZyBhIHNhdmUuXG4gICAqL1xuICBjbGVhblVwKCk6IHZvaWQge1xuICAgIC8vIGlmIHRoZSBwYW5lIHRoYXQgdGhpcyBlZGl0b3Igd2FzIGluIGlzIG5vdyBlbXB0eSwgd2Ugd2lsbCBkZXN0cm95IGl0XG4gICAgdmFyIGVkaXRvclBhbmUgPSBhdG9tLndvcmtzcGFjZS5wYW5lRm9ySXRlbSh0aGlzLl9lZGl0b3IpO1xuICAgIGlmICh0eXBlb2YgZWRpdG9yUGFuZSAhPT0gJ3VuZGVmaW5lZCcgJiYgZWRpdG9yUGFuZSAhPSBudWxsICYmIGVkaXRvclBhbmUuZ2V0SXRlbXMoKS5sZW5ndGggPT0gMSkge1xuICAgICAgZWRpdG9yUGFuZS5kZXN0cm95KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2VkaXRvci5kZXN0cm95KCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEZpbmRzIGN1cnNvci10b3VjaGVkIGxpbmUgcmFuZ2VzIHRoYXQgYXJlIG1hcmtlZCBhcyBkaWZmZXJlbnQgaW4gYW4gZWRpdG9yXG4gICAqIHZpZXcuXG4gICAqXG4gICAqIEByZXR1cm4gVGhlIGxpbmUgcmFuZ2VzIG9mIGRpZmZzIHRoYXQgYXJlIHRvdWNoZWQgYnkgYSBjdXJzb3IuXG4gICAqL1xuICBnZXRDdXJzb3JEaWZmTGluZXMoKTogYW55IHtcbiAgICB2YXIgY3Vyc29yUG9zaXRpb25zID0gdGhpcy5fZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9ucygpO1xuICAgIHZhciB0b3VjaGVkTGluZXMgPSBbXTtcblxuICAgIGZvciAodmFyIGk9MDsgaTxjdXJzb3JQb3NpdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGZvciAodmFyIGo9MDsgajx0aGlzLl9tYXJrZXJzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgIHZhciBtYXJrZXJSYW5nZSA9IHRoaXMuX21hcmtlcnNbal0uZ2V0QnVmZmVyUmFuZ2UoKTtcblxuICAgICAgICBpZiAoY3Vyc29yUG9zaXRpb25zW2ldLnJvdyA+PSBtYXJrZXJSYW5nZS5zdGFydC5yb3dcbiAgICAgICAgICAmJiBjdXJzb3JQb3NpdGlvbnNbaV0ucm93IDwgbWFya2VyUmFuZ2UuZW5kLnJvdykge1xuICAgICAgICAgICAgdG91Y2hlZExpbmVzLnB1c2gobWFya2VyUmFuZ2UpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBwdXQgdGhlIGNodW5rcyBpbiBvcmRlciBzbyB0aGUgY29weSBmdW5jdGlvbiBkb2Vzbid0IG1lc3MgdXBcbiAgICB0b3VjaGVkTGluZXMuc29ydChmdW5jdGlvbihsaW5lQSwgbGluZUIpIHtcbiAgICAgIHJldHVybiBsaW5lQS5zdGFydC5yb3cgLSBsaW5lQi5zdGFydC5yb3c7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdG91Y2hlZExpbmVzO1xuICB9XG5cbiAgLyoqXG4gICAqIFVzZWQgdG8gZ2V0IHRoZSBUZXh0IEVkaXRvciBvYmplY3QgZm9yIHRoaXMgdmlldy4gSGVscGZ1bCBmb3IgY2FsbGluZyBiYXNpY1xuICAgKiBBdG9tIFRleHQgRWRpdG9yIGZ1bmN0aW9ucy5cbiAgICpcbiAgICogQHJldHVybiBUaGUgVGV4dCBFZGl0b3Igb2JqZWN0IGZvciB0aGlzIHZpZXcuXG4gICAqL1xuICBnZXRFZGl0b3IoKTogVGV4dEVkaXRvciB7XG4gICAgcmV0dXJuIHRoaXMuX2VkaXRvcjtcbiAgfVxufTtcbiJdfQ==