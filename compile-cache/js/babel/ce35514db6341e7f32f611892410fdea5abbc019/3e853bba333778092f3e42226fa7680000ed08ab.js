var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _editorDiffExtender = require('./editor-diff-extender');

var _editorDiffExtender2 = _interopRequireDefault(_editorDiffExtender);

var _computeWordDiff = require('./compute-word-diff');

var _computeWordDiff2 = _interopRequireDefault(_computeWordDiff);

'use babel';

module.exports = (function () {
  /*
   * @param editors Array of editors being diffed.
   * @param diff ex: {
   *                    oldLineOffsets: [lineNumber: numOffsetLines, ...],
   *                    newLineOffsets: [lineNumber: numOffsetLines, ...],
   *                    chunks: [{
   *                                newLineStart: (int),
   *                                newLineEnd: (int),
   *                                oldLineStart: (int),
   *                                oldLineEnd: (int)
   *                            }, ...]
   *                 }
   */

  function DiffView(editors) {
    _classCallCheck(this, DiffView);

    this._editorDiffExtender1 = new _editorDiffExtender2['default'](editors.editor1);
    this._editorDiffExtender2 = new _editorDiffExtender2['default'](editors.editor2);
    this._chunks = null;
    this._isSelectionActive = false;
    this._selectedChunkIndex = 0;
    this._COPY_HELP_MESSAGE = 'Place your cursor in a chunk first!';
  }

  /**
   * Adds highlighting to the editors to show the diff.
   *
   * @param chunks The diff chunks to highlight.
   * @param leftHighlightType The type of highlight (ex: 'added').
   * @param rightHighlightType The type of highlight (ex: 'removed').
   * @param isWordDiffEnabled Whether differences between words per line should be highlighted.
   * @param isWhitespaceIgnored Whether whitespace should be ignored.
   */

  _createClass(DiffView, [{
    key: 'displayDiff',
    value: function displayDiff(diff, leftHighlightType, rightHighlightType, isWordDiffEnabled, isWhitespaceIgnored) {
      this._chunks = diff.chunks;

      // make the last chunk equal size on both screens so the editors retain sync scroll #58
      if (this._chunks.length > 0) {
        var lastChunk = this._chunks[this._chunks.length - 1];
        var oldChunkRange = lastChunk.oldLineEnd - lastChunk.oldLineStart;
        var newChunkRange = lastChunk.newLineEnd - lastChunk.newLineStart;
        if (oldChunkRange > newChunkRange) {
          // make the offset as large as needed to make the chunk the same size in both editors
          diff.newLineOffsets[lastChunk.newLineStart + newChunkRange] = oldChunkRange - newChunkRange;
        } else if (newChunkRange > oldChunkRange) {
          // make the offset as large as needed to make the chunk the same size in both editors
          diff.oldLineOffsets[lastChunk.oldLineStart + oldChunkRange] = newChunkRange - oldChunkRange;
        }
      }

      for (chunk of this._chunks) {
        this._editorDiffExtender1.highlightLines(chunk.oldLineStart, chunk.oldLineEnd, leftHighlightType);
        this._editorDiffExtender2.highlightLines(chunk.newLineStart, chunk.newLineEnd, rightHighlightType);

        if (isWordDiffEnabled) {
          this._highlightWordsInChunk(chunk, leftHighlightType, rightHighlightType, isWhitespaceIgnored);
        }
      }

      this._editorDiffExtender1.setLineOffsets(diff.oldLineOffsets);
      this._editorDiffExtender2.setLineOffsets(diff.newLineOffsets);
    }

    /**
     * Clears the diff highlighting and offsets from the editors.
     */
  }, {
    key: 'clearDiff',
    value: function clearDiff() {
      this._editorDiffExtender1.destroyMarkers();
      this._editorDiffExtender2.destroyMarkers();
    }

    /**
     * Called to move the current selection highlight to the next diff chunk.
     */
  }, {
    key: 'nextDiff',
    value: function nextDiff() {
      if (this._isSelectionActive) {
        this._selectedChunkIndex++;
        if (this._selectedChunkIndex >= this._chunks.length) {
          this._selectedChunkIndex = 0;
        }
      } else {
        this._isSelectionActive = true;
      }

      this._selectChunk(this._selectedChunkIndex);
      return this._selectedChunkIndex;
    }

    /**
     * Called to move the current selection highlight to the previous diff chunk.
     */
  }, {
    key: 'prevDiff',
    value: function prevDiff() {
      if (this._isSelectionActive) {
        this._selectedChunkIndex--;
        if (this._selectedChunkIndex < 0) {
          this._selectedChunkIndex = this._chunks.length - 1;
        }
      } else {
        this._isSelectionActive = true;
      }

      this._selectChunk(this._selectedChunkIndex);
      return this._selectedChunkIndex;
    }

    /**
     * Copies the currently selected diff chunk from the left editor to the right
     * editor.
     */
  }, {
    key: 'copyToRight',
    value: function copyToRight() {
      var linesToCopy = this._editorDiffExtender1.getCursorDiffLines();

      if (linesToCopy.length == 0) {
        atom.notifications.addWarning('Split Diff', { detail: this._COPY_HELP_MESSAGE, dismissable: false, icon: 'diff' });
      }

      // keep track of line offset (used when there are multiple chunks being moved)
      var offset = 0;

      for (lineRange of linesToCopy) {
        for (diffChunk of this._chunks) {
          if (lineRange.start.row == diffChunk.oldLineStart) {
            var textToCopy = this._editorDiffExtender1.getEditor().getTextInBufferRange([[diffChunk.oldLineStart, 0], [diffChunk.oldLineEnd, 0]]);
            var lastBufferRow = this._editorDiffExtender2.getEditor().getLastBufferRow();

            // insert new line if the chunk we want to copy will be below the last line of the other editor
            if (diffChunk.newLineStart + offset > lastBufferRow) {
              this._editorDiffExtender2.getEditor().setCursorBufferPosition([lastBufferRow, 0], { autoscroll: false });
              this._editorDiffExtender2.getEditor().insertNewline();
            }

            this._editorDiffExtender2.getEditor().setTextInBufferRange([[diffChunk.newLineStart + offset, 0], [diffChunk.newLineEnd + offset, 0]], textToCopy);
            // offset will be the amount of lines to be copied minus the amount of lines overwritten
            offset += diffChunk.oldLineEnd - diffChunk.oldLineStart - (diffChunk.newLineEnd - diffChunk.newLineStart);
            // move the selection pointer back so the next diff chunk is not skipped
            if (this._editorDiffExtender1.hasSelection() || this._editorDiffExtender2.hasSelection()) {
              this._selectedChunkIndex--;
            }
          }
        }
      }
    }

    /**
     * Copies the currently selected diff chunk from the right editor to the left
     * editor.
     */
  }, {
    key: 'copyToLeft',
    value: function copyToLeft() {
      var linesToCopy = this._editorDiffExtender2.getCursorDiffLines();

      if (linesToCopy.length == 0) {
        atom.notifications.addWarning('Split Diff', { detail: this._COPY_HELP_MESSAGE, dismissable: false, icon: 'diff' });
      }

      var offset = 0; // keep track of line offset (used when there are multiple chunks being moved)
      for (lineRange of linesToCopy) {
        for (diffChunk of this._chunks) {
          if (lineRange.start.row == diffChunk.newLineStart) {
            var textToCopy = this._editorDiffExtender2.getEditor().getTextInBufferRange([[diffChunk.newLineStart, 0], [diffChunk.newLineEnd, 0]]);
            var lastBufferRow = this._editorDiffExtender1.getEditor().getLastBufferRow();
            // insert new line if the chunk we want to copy will be below the last line of the other editor
            if (diffChunk.oldLineStart + offset > lastBufferRow) {
              this._editorDiffExtender1.getEditor().setCursorBufferPosition([lastBufferRow, 0], { autoscroll: false });
              this._editorDiffExtender1.getEditor().insertNewline();
            }

            this._editorDiffExtender1.getEditor().setTextInBufferRange([[diffChunk.oldLineStart + offset, 0], [diffChunk.oldLineEnd + offset, 0]], textToCopy);
            // offset will be the amount of lines to be copied minus the amount of lines overwritten
            offset += diffChunk.newLineEnd - diffChunk.newLineStart - (diffChunk.oldLineEnd - diffChunk.oldLineStart);
            // move the selection pointer back so the next diff chunk is not skipped
            if (this._editorDiffExtender1.hasSelection() || this._editorDiffExtender2.hasSelection()) {
              this._selectedChunkIndex--;
            }
          }
        }
      }
    }

    /**
     * Cleans up the editor indicated by index. A clean up will remove the editor
     * or the pane if necessary. Typically left editor == 1 and right editor == 2.
     *
     * @param editorIndex The index of the editor to clean up.
     */
  }, {
    key: 'cleanUpEditor',
    value: function cleanUpEditor(editorIndex) {
      if (editorIndex === 1) {
        this._editorDiffExtender1.cleanUp();
      } else if (editorIndex === 2) {
        this._editorDiffExtender2.cleanUp();
      }
    }

    /**
     * Destroys the editor diff extenders.
     */
  }, {
    key: 'destroy',
    value: function destroy() {
      this._editorDiffExtender1.destroy();
      this._editorDiffExtender2.destroy();
    }

    /**
     * Gets the number of differences between the editors.
     *
     * @return int The number of differences between the editors.
     */
  }, {
    key: 'getNumDifferences',
    value: function getNumDifferences() {
      return this._chunks.length;
    }

    // ----------------------------------------------------------------------- //
    // --------------------------- PRIVATE METHODS --------------------------- //
    // ----------------------------------------------------------------------- //

    /**
     * Selects and highlights the diff chunk in both editors according to the
     * given index.
     *
     * @param index The index of the diff chunk to highlight in both editors.
     */
  }, {
    key: '_selectChunk',
    value: function _selectChunk(index) {
      var diffChunk = this._chunks[index];
      if (diffChunk != null) {
        // deselect previous next/prev highlights
        this._editorDiffExtender1.deselectAllLines();
        this._editorDiffExtender2.deselectAllLines();
        // highlight and scroll editor 1
        this._editorDiffExtender1.selectLines(diffChunk.oldLineStart, diffChunk.oldLineEnd);
        this._editorDiffExtender1.getEditor().setCursorBufferPosition([diffChunk.oldLineStart, 0], { autoscroll: true });
        // highlight and scroll editor 2
        this._editorDiffExtender2.selectLines(diffChunk.newLineStart, diffChunk.newLineEnd);
        this._editorDiffExtender2.getEditor().setCursorBufferPosition([diffChunk.newLineStart, 0], { autoscroll: true });
      }
    }

    /**
     * Highlights the word diff of the chunk passed in.
     *
     * @param chunk The chunk that should have its words highlighted.
     */
  }, {
    key: '_highlightWordsInChunk',
    value: function _highlightWordsInChunk(chunk, leftHighlightType, rightHighlightType, isWhitespaceIgnored) {
      var leftLineNumber = chunk.oldLineStart;
      var rightLineNumber = chunk.newLineStart;
      // for each line that has a corresponding line
      while (leftLineNumber < chunk.oldLineEnd && rightLineNumber < chunk.newLineEnd) {
        var editor1LineText = this._editorDiffExtender1.getEditor().lineTextForBufferRow(leftLineNumber);
        var editor2LineText = this._editorDiffExtender2.getEditor().lineTextForBufferRow(rightLineNumber);

        if (editor1LineText == '') {
          // computeWordDiff returns empty for lines that are paired with empty lines
          // need to force a highlight
          this._editorDiffExtender2.setWordHighlights(rightLineNumber, [{ changed: true, value: editor2LineText }], rightHighlightType, isWhitespaceIgnored);
        } else if (editor2LineText == '') {
          // computeWordDiff returns empty for lines that are paired with empty lines
          // need to force a highlight
          this._editorDiffExtender1.setWordHighlights(leftLineNumber, [{ changed: true, value: editor1LineText }], leftHighlightType, isWhitespaceIgnored);
        } else {
          // perform regular word diff
          var wordDiff = _computeWordDiff2['default'].computeWordDiff(editor1LineText, editor2LineText);
          this._editorDiffExtender1.setWordHighlights(leftLineNumber, wordDiff.removedWords, leftHighlightType, isWhitespaceIgnored);
          this._editorDiffExtender2.setWordHighlights(rightLineNumber, wordDiff.addedWords, rightHighlightType, isWhitespaceIgnored);
        }

        leftLineNumber++;
        rightLineNumber++;
      }

      // highlight remaining lines in left editor
      while (leftLineNumber < chunk.oldLineEnd) {
        var editor1LineText = this._editorDiffExtender1.getEditor().lineTextForBufferRow(leftLineNumber);
        this._editorDiffExtender1.setWordHighlights(leftLineNumber, [{ changed: true, value: editor1LineText }], leftHighlightType, isWhitespaceIgnored);
        leftLineNumber++;
      }
      // highlight remaining lines in the right editor
      while (rightLineNumber < chunk.newLineEnd) {
        this._editorDiffExtender2.setWordHighlights(rightLineNumber, [{ changed: true, value: this._editorDiffExtender2.getEditor().lineTextForBufferRow(rightLineNumber) }], rightHighlightType, isWhitespaceIgnored);
        rightLineNumber++;
      }
    }
  }]);

  return DiffView;
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3RveW9raS8uYXRvbS9wYWNrYWdlcy9naXQtdGltZS1tYWNoaW5lL25vZGVfbW9kdWxlcy9zcGxpdC1kaWZmL2xpYi9kaWZmLXZpZXcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O2tDQUUrQix3QkFBd0I7Ozs7K0JBQzNCLHFCQUFxQjs7OztBQUhqRCxXQUFXLENBQUE7O0FBTVgsTUFBTSxDQUFDLE9BQU87Ozs7Ozs7Ozs7Ozs7OztBQWNELFdBZFUsUUFBUSxDQWNoQixPQUFPLEVBQUc7MEJBZEYsUUFBUTs7QUFlM0IsUUFBSSxDQUFDLG9CQUFvQixHQUFHLG9DQUF3QixPQUFPLENBQUMsT0FBTyxDQUFFLENBQUM7QUFDdEUsUUFBSSxDQUFDLG9CQUFvQixHQUFHLG9DQUF3QixPQUFPLENBQUMsT0FBTyxDQUFFLENBQUM7QUFDdEUsUUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7QUFDcEIsUUFBSSxDQUFDLGtCQUFrQixHQUFHLEtBQUssQ0FBQztBQUNoQyxRQUFJLENBQUMsbUJBQW1CLEdBQUcsQ0FBQyxDQUFDO0FBQzdCLFFBQUksQ0FBQyxrQkFBa0IsR0FBRyxxQ0FBcUMsQ0FBQztHQUNqRTs7Ozs7Ozs7Ozs7O2VBckJvQixRQUFROztXQWdDbEIscUJBQUUsSUFBSSxFQUFFLGlCQUFpQixFQUFFLGtCQUFrQixFQUFFLGlCQUFpQixFQUFFLG1CQUFtQixFQUFHO0FBQ2pHLFVBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQzs7O0FBRzNCLFVBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFHO0FBQzVCLFlBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFFLENBQUM7QUFDeEQsWUFBSSxhQUFhLEdBQUcsU0FBUyxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUMsWUFBWSxDQUFDO0FBQ2xFLFlBQUks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QUFjLEVBQUUsQ0FBQztBQUNqQix1QkFBZSxFQUFFLENBQUM7T0FDbkI7OztBQUdELGFBQU8sY0FBYyxHQUFHLEtBQUssQ0FBQyxVQUFVLEVBQUc7QUFDekMsWUFBSSxlQUFlLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFNBQVMsRUFBRSxDQUFDLG9CQUFvQixDQUFFLGNBQWMsQ0FBRSxDQUFDO0FBQ25HLFlBQUksQ0FBQyxvQkFBb0IsQ0FBQyxpQkFBaUIsQ0FBRSxjQUFjLEVBQUUsQ0FBQyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLGVBQWUsRUFBRSxDQUFDLEVBQUUsaUJBQWlCLEVBQUUsbUJBQW1CLENBQUUsQ0FBQztBQUNuSixzQkFBYyxFQUFFLENBQUM7T0FDbEI7O0FBRUQsYUFBTyxlQUFlLEdBQUcsS0FBSyxDQUFDLFVBQVUsRUFBRztBQUMxQyxZQUFJLENBQUMsb0JBQW9CLENBQUMsaUJBQWlCLENBQUUsZUFBZSxFQUFFLENBQUMsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsb0JBQW9CLENBQUMsU0FBUyxFQUFFLENBQUMsb0JBQW9CLENBQUUsZUFBZSxDQUFFLEVBQUUsQ0FBQyxFQUFFLGtCQUFrQixFQUFFLG1CQUFtQixDQUFFLENBQUM7QUFDbk4sdUJBQWUsRUFBRSxDQUFDO09BQ25CO0tBQ0Y7OztTQXBSb0IsUUFBUTtJQXFSOUIsQ0FBQyIsImZpbGUiOiIvaG9tZS90b3lva2kvLmF0b20vcGFja2FnZXMvZ2l0LXRpbWUtbWFjaGluZS9ub2RlX21vZHVsZXMvc3BsaXQtZGlmZi9saWIvZGlmZi12aWV3LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuaW1wb3J0IEVkaXRvckRpZmZFeHRlbmRlciBmcm9tICcuL2VkaXRvci1kaWZmLWV4dGVuZGVyJztcbmltcG9ydCBDb21wdXRlV29yZERpZmYgZnJvbSAnLi9jb21wdXRlLXdvcmQtZGlmZic7XG5cblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBEaWZmVmlldyB7XG4gIC8qXG4gICAqIEBwYXJhbSBlZGl0b3JzIEFycmF5IG9mIGVkaXRvcnMgYmVpbmcgZGlmZmVkLlxuICAgKiBAcGFyYW0gZGlmZiBleDoge1xuICAgKiAgICAgICAgICAgICAgICAgICAgb2xkTGluZU9mZnNldHM6IFtsaW5lTnVtYmVyOiBudW1PZmZzZXRMaW5lcywgLi4uXSxcbiAgICogICAgICAgICAgICAgICAgICAgIG5ld0xpbmVPZmZzZXRzOiBbbGluZU51bWJlcjogbnVtT2Zmc2V0TGluZXMsIC4uLl0sXG4gICAqICAgICAgICAgICAgICAgICAgICBjaHVua3M6IFt7XG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdMaW5lU3RhcnQ6IChpbnQpLFxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3TGluZUVuZDogKGludCksXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbGRMaW5lU3RhcnQ6IChpbnQpLFxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb2xkTGluZUVuZDogKGludClcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgLi4uXVxuICAgKiAgICAgICAgICAgICAgICAgfVxuICAgKi9cbiAgY29uc3RydWN0b3IoIGVkaXRvcnMgKSB7XG4gICAgdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMSA9IG5ldyBFZGl0b3JEaWZmRXh0ZW5kZXIoIGVkaXRvcnMuZWRpdG9yMSApO1xuICAgIHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjIgPSBuZXcgRWRpdG9yRGlmZkV4dGVuZGVyKCBlZGl0b3JzLmVkaXRvcjIgKTtcbiAgICB0aGlzLl9jaHVua3MgPSBudWxsO1xuICAgIHRoaXMuX2lzU2VsZWN0aW9uQWN0aXZlID0gZmFsc2U7XG4gICAgdGhpcy5fc2VsZWN0ZWRDaHVua0luZGV4ID0gMDtcbiAgICB0aGlzLl9DT1BZX0hFTFBfTUVTU0FHRSA9ICdQbGFjZSB5b3VyIGN1cnNvciBpbiBhIGNodW5rIGZpcnN0ISc7XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBoaWdobGlnaHRpbmcgdG8gdGhlIGVkaXRvcnMgdG8gc2hvdyB0aGUgZGlmZi5cbiAgICpcbiAgICogQHBhcmFtIGNodW5rcyBUaGUgZGlmZiBjaHVua3MgdG8gaGlnaGxpZ2h0LlxuICAgKiBAcGFyYW0gbGVmdEhpZ2hsaWdodFR5cGUgVGhlIHR5cGUgb2YgaGlnaGxpZ2h0IChleDogJ2FkZGVkJykuXG4gICAqIEBwYXJhbSByaWdodEhpZ2hsaWdodFR5cGUgVGhlIHR5cGUgb2YgaGlnaGxpZ2h0IChleDogJ3JlbW92ZWQnKS5cbiAgICogQHBhcmFtIGlzV29yZERpZmZFbmFibGVkIFdoZXRoZXIgZGlmZmVyZW5jZXMgYmV0d2VlbiB3b3JkcyBwZXIgbGluZSBzaG91bGQgYmUgaGlnaGxpZ2h0ZWQuXG4gICAqIEBwYXJhbSBpc1doaXRlc3BhY2VJZ25vcmVkIFdoZXRoZXIgd2hpdGVzcGFjZSBzaG91bGQgYmUgaWdub3JlZC5cbiAgICovXG4gIGRpc3BsYXlEaWZmKCBkaWZmLCBsZWZ0SGlnaGxpZ2h0VHlwZSwgcmlnaHRIaWdobGlnaHRUeXBlLCBpc1dvcmREaWZmRW5hYmxlZCwgaXNXaGl0ZXNwYWNlSWdub3JlZCApIHtcbiAgICB0aGlzLl9jaHVua3MgPSBkaWZmLmNodW5rcztcblxuICAgIC8vIG1ha2UgdGhlIGxhc3QgY2h1bmsgZXF1YWwgc2l6ZSBvbiBib3RoIHNjcmVlbnMgc28gdGhlIGVkaXRvcnMgcmV0YWluIHN5bmMgc2Nyb2xsICM1OFxuICAgIGlmKCB0aGlzLl9jaHVua3MubGVuZ3RoID4gMCApIHtcbiAgICAgIHZhciBsYXN0Q2h1bmsgPSB0aGlzLl9jaHVua3NbIHRoaXMuX2NodW5rcy5sZW5ndGggLSAxIF07XG4gICAgICB2YXIgb2xkQ2h1bmtSYW5nZSA9IGxhc3RDaHVuay5vbGRMaW5lRW5kIC0gbGFzdENodW5rLm9sZExpbmVTdGFydDtcbiAgICAgIHZhciBuZXdDaHVua1JhbmdlID0gbGFzdENodW5rLm5ld0xpbmVFbmQgLSBsYXN0Q2h1bmsubmV3TGluZVN0YXJ0O1xuICAgICAgaWYoIG9sZENodW5rUmFuZ2UgPiBuZXdDaHVua1JhbmdlICkge1xuICAgICAgICAvLyBtYWtlIHRoZSBvZmZzZXQgYXMgbGFyZ2UgYXMgbmVlZGVkIHRvIG1ha2UgdGhlIGNodW5rIHRoZSBzYW1lIHNpemUgaW4gYm90aCBlZGl0b3JzXG4gICAgICAgIGRpZmYubmV3TGluZU9mZnNldHNbIGxhc3RDaHVuay5uZXdMaW5lU3RhcnQgKyBuZXdDaHVua1JhbmdlIF0gPSBvbGRDaHVua1JhbmdlIC0gbmV3Q2h1bmtSYW5nZTtcbiAgICAgIH0gZWxzZSBpZiggbmV3Q2h1bmtSYW5nZSA+IG9sZENodW5rUmFuZ2UgKSB7XG4gICAgICAgIC8vIG1ha2UgdGhlIG9mZnNldCBhcyBsYXJnZSBhcyBuZWVkZWQgdG8gbWFrZSB0aGUgY2h1bmsgdGhlIHNhbWUgc2l6ZSBpbiBib3RoIGVkaXRvcnNcbiAgICAgICAgZGlmZi5vbGRMaW5lT2Zmc2V0c1sgbGFzdENodW5rLm9sZExpbmVTdGFydCArIG9sZENodW5rUmFuZ2UgXSA9IG5ld0NodW5rUmFuZ2UgLSBvbGRDaHVua1JhbmdlO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZvciggY2h1bmsgb2YgdGhpcy5fY2h1bmtzICkge1xuICAgICAgdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMS5oaWdobGlnaHRMaW5lcyggY2h1bmsub2xkTGluZVN0YXJ0LCBjaHVuay5vbGRMaW5lRW5kLCBsZWZ0SGlnaGxpZ2h0VHlwZSApO1xuICAgICAgdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMi5oaWdobGlnaHRMaW5lcyggY2h1bmsubmV3TGluZVN0YXJ0LCBjaHVuay5uZXdMaW5lRW5kLCByaWdodEhpZ2hsaWdodFR5cGUgKTtcblxuICAgICAgaWYoIGlzV29yZERpZmZFbmFibGVkICkge1xuICAgICAgICB0aGlzLl9oaWdobGlnaHRXb3Jkc0luQ2h1bmsoIGNodW5rLCBsZWZ0SGlnaGxpZ2h0VHlwZSwgcmlnaHRIaWdobGlnaHRUeXBlLCBpc1doaXRlc3BhY2VJZ25vcmVkICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMS5zZXRMaW5lT2Zmc2V0cyggZGlmZi5vbGRMaW5lT2Zmc2V0cyApO1xuICAgIHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjIuc2V0TGluZU9mZnNldHMoIGRpZmYubmV3TGluZU9mZnNldHMgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbGVhcnMgdGhlIGRpZmYgaGlnaGxpZ2h0aW5nIGFuZCBvZmZzZXRzIGZyb20gdGhlIGVkaXRvcnMuXG4gICAqL1xuICBjbGVhckRpZmYoKSB7XG4gICAgdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMS5kZXN0cm95TWFya2VycygpO1xuICAgIHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjIuZGVzdHJveU1hcmtlcnMoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsZWQgdG8gbW92ZSB0aGUgY3VycmVudCBzZWxlY3Rpb24gaGlnaGxpZ2h0IHRvIHRoZSBuZXh0IGRpZmYgY2h1bmsuXG4gICAqL1xuICBuZXh0RGlmZigpIHtcbiAgICBpZiggdGhpcy5faXNTZWxlY3Rpb25BY3RpdmUgKSB7XG4gICAgICB0aGlzLl9zZWxlY3RlZENodW5rSW5kZXgrKztcbiAgICAgIGlmKCB0aGlzLl9zZWxlY3RlZENodW5rSW5kZXggPj0gdGhpcy5fY2h1bmtzLmxlbmd0aCApIHtcbiAgICAgICAgdGhpcy5fc2VsZWN0ZWRDaHVua0luZGV4ID0gMDtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5faXNTZWxlY3Rpb25BY3RpdmUgPSB0cnVlO1xuICAgIH1cblxuICAgIHRoaXMuX3NlbGVjdENodW5rKCB0aGlzLl9zZWxlY3RlZENodW5rSW5kZXggKTtcbiAgICByZXR1cm4gdGhpcy5fc2VsZWN0ZWRDaHVua0luZGV4O1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxlZCB0byBtb3ZlIHRoZSBjdXJyZW50IHNlbGVjdGlvbiBoaWdobGlnaHQgdG8gdGhlIHByZXZpb3VzIGRpZmYgY2h1bmsuXG4gICAqL1xuICBwcmV2RGlmZigpIHtcbiAgICBpZiggdGhpcy5faXNTZWxlY3Rpb25BY3RpdmUgKSB7XG4gICAgICB0aGlzLl9zZWxlY3RlZENodW5rSW5kZXgtLTtcbiAgICAgIGlmKCB0aGlzLl9zZWxlY3RlZENodW5rSW5kZXggPCAwICkge1xuICAgICAgICB0aGlzLl9zZWxlY3RlZENodW5rSW5kZXggPSB0aGlzLl9jaHVua3MubGVuZ3RoIC0gMVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9pc1NlbGVjdGlvbkFjdGl2ZSA9IHRydWU7XG4gICAgfVxuXG4gICAgdGhpcy5fc2VsZWN0Q2h1bmsoIHRoaXMuX3NlbGVjdGVkQ2h1bmtJbmRleCApO1xuICAgIHJldHVybiB0aGlzLl9zZWxlY3RlZENodW5rSW5kZXg7XG4gIH1cblxuICAvKipcbiAgICogQ29waWVzIHRoZSBjdXJyZW50bHkgc2VsZWN0ZWQgZGlmZiBjaHVuayBmcm9tIHRoZSBsZWZ0IGVkaXRvciB0byB0aGUgcmlnaHRcbiAgICogZWRpdG9yLlxuICAgKi9cbiAgY29weVRvUmlnaHQoKSB7XG4gICAgdmFyIGxpbmVzVG9Db3B5ID0gdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMS5nZXRDdXJzb3JEaWZmTGluZXMoKTtcblxuICAgIGlmKCBsaW5lc1RvQ29weS5sZW5ndGggPT0gMCApIHtcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKCdTcGxpdCBEaWZmJywge2RldGFpbDogdGhpcy5fQ09QWV9IRUxQX01FU1NBR0UsIGRpc21pc3NhYmxlOiBmYWxzZSwgaWNvbjogJ2RpZmYnfSlcbiAgICB9XG5cbiAgICAvLyBrZWVwIHRyYWNrIG9mIGxpbmUgb2Zmc2V0ICh1c2VkIHdoZW4gdGhlcmUgYXJlIG11bHRpcGxlIGNodW5rcyBiZWluZyBtb3ZlZClcbiAgICB2YXIgb2Zmc2V0ID0gMDtcblxuICAgIGZvciggbGluZVJhbmdlIG9mIGxpbmVzVG9Db3B5ICkge1xuICAgICAgZm9yKCBkaWZmQ2h1bmsgb2YgdGhpcy5fY2h1bmtzICkge1xuICAgICAgICBpZiggbGluZVJhbmdlLnN0YXJ0LnJvdyA9PSBkaWZmQ2h1bmsub2xkTGluZVN0YXJ0ICkge1xuICAgICAgICAgIHZhciB0ZXh0VG9Db3B5ID0gdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMS5nZXRFZGl0b3IoKS5nZXRUZXh0SW5CdWZmZXJSYW5nZSggW1tkaWZmQ2h1bmsub2xkTGluZVN0YXJ0LCAwXSwgW2RpZmZDaHVuay5vbGRMaW5lRW5kLCAwXV0gKTtcbiAgICAgICAgICB2YXIgbGFzdEJ1ZmZlclJvdyA9IHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjIuZ2V0RWRpdG9yKCkuZ2V0TGFzdEJ1ZmZlclJvdygpO1xuXG4gICAgICAgICAgLy8gaW5zZXJ0IG5ldyBsaW5lIGlmIHRoZSBjaHVuayB3ZSB3YW50IHRvIGNvcHkgd2lsbCBiZSBiZWxvdyB0aGUgbGFzdCBsaW5lIG9mIHRoZSBvdGhlciBlZGl0b3JcbiAgICAgICAgICBpZiggKGRpZmZDaHVuay5uZXdMaW5lU3RhcnQgKyBvZmZzZXQpID4gbGFzdEJ1ZmZlclJvdyApIHtcbiAgICAgICAgICAgIHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjIuZ2V0RWRpdG9yKCkuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oIFtsYXN0QnVmZmVyUm93LCAwXSwge2F1dG9zY3JvbGw6IGZhbHNlfSApO1xuICAgICAgICAgICAgdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMi5nZXRFZGl0b3IoKS5pbnNlcnROZXdsaW5lKCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMi5nZXRFZGl0b3IoKS5zZXRUZXh0SW5CdWZmZXJSYW5nZSggW1tkaWZmQ2h1bmsubmV3TGluZVN0YXJ0ICsgb2Zmc2V0LCAwXSwgW2RpZmZDaHVuay5uZXdMaW5lRW5kICsgb2Zmc2V0LCAwXV0sIHRleHRUb0NvcHkgKTtcbiAgICAgICAgICAvLyBvZmZzZXQgd2lsbCBiZSB0aGUgYW1vdW50IG9mIGxpbmVzIHRvIGJlIGNvcGllZCBtaW51cyB0aGUgYW1vdW50IG9mIGxpbmVzIG92ZXJ3cml0dGVuXG4gICAgICAgICAgb2Zmc2V0ICs9IChkaWZmQ2h1bmsub2xkTGluZUVuZCAtIGRpZmZDaHVuay5vbGRMaW5lU3RhcnQpIC0gKGRpZmZDaHVuay5uZXdMaW5lRW5kIC0gZGlmZkNodW5rLm5ld0xpbmVTdGFydCk7XG4gICAgICAgICAgLy8gbW92ZSB0aGUgc2VsZWN0aW9uIHBvaW50ZXIgYmFjayBzbyB0aGUgbmV4dCBkaWZmIGNodW5rIGlzIG5vdCBza2lwcGVkXG4gICAgICAgICAgaWYoIHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjEuaGFzU2VsZWN0aW9uKCkgfHwgdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMi5oYXNTZWxlY3Rpb24oKSApIHtcbiAgICAgICAgICAgIHRoaXMuX3NlbGVjdGVkQ2h1bmtJbmRleC0tO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDb3BpZXMgdGhlIGN1cnJlbnRseSBzZWxlY3RlZCBkaWZmIGNodW5rIGZyb20gdGhlIHJpZ2h0IGVkaXRvciB0byB0aGUgbGVmdFxuICAgKiBlZGl0b3IuXG4gICAqL1xuICBjb3B5VG9MZWZ0KCkge1xuICAgIHZhciBsaW5lc1RvQ29weSA9IHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjIuZ2V0Q3Vyc29yRGlmZkxpbmVzKCk7XG5cbiAgICBpZiggbGluZXNUb0NvcHkubGVuZ3RoID09IDAgKSB7XG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZyggJ1NwbGl0IERpZmYnLCB7ZGV0YWlsOiB0aGlzLl9DT1BZX0hFTFBfTUVTU0FHRSwgZGlzbWlzc2FibGU6IGZhbHNlLCBpY29uOiAnZGlmZid9ICk7XG4gICAgfVxuXG4gICAgdmFyIG9mZnNldCA9IDA7IC8vIGtlZXAgdHJhY2sgb2YgbGluZSBvZmZzZXQgKHVzZWQgd2hlbiB0aGVyZSBhcmUgbXVsdGlwbGUgY2h1bmtzIGJlaW5nIG1vdmVkKVxuICAgIGZvciggbGluZVJhbmdlIG9mIGxpbmVzVG9Db3B5ICkge1xuICAgICAgZm9yKCBkaWZmQ2h1bmsgb2YgdGhpcy5fY2h1bmtzICkge1xuICAgICAgICBpZiggbGluZVJhbmdlLnN0YXJ0LnJvdyA9PSBkaWZmQ2h1bmsubmV3TGluZVN0YXJ0ICkge1xuICAgICAgICAgIHZhciB0ZXh0VG9Db3B5ID0gdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMi5nZXRFZGl0b3IoKS5nZXRUZXh0SW5CdWZmZXJSYW5nZSggW1tkaWZmQ2h1bmsubmV3TGluZVN0YXJ0LCAwXSwgW2RpZmZDaHVuay5uZXdMaW5lRW5kLCAwXV0gKTtcbiAgICAgICAgICB2YXIgbGFzdEJ1ZmZlclJvdyA9IHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjEuZ2V0RWRpdG9yKCkuZ2V0TGFzdEJ1ZmZlclJvdygpO1xuICAgICAgICAgIC8vIGluc2VydCBuZXcgbGluZSBpZiB0aGUgY2h1bmsgd2Ugd2FudCB0byBjb3B5IHdpbGwgYmUgYmVsb3cgdGhlIGxhc3QgbGluZSBvZiB0aGUgb3RoZXIgZWRpdG9yXG4gICAgICAgICAgaWYoIChkaWZmQ2h1bmsub2xkTGluZVN0YXJ0ICsgb2Zmc2V0KSA+IGxhc3RCdWZmZXJSb3cgKSB7XG4gICAgICAgICAgICB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIxLmdldEVkaXRvcigpLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCBbbGFzdEJ1ZmZlclJvdywgMF0sIHthdXRvc2Nyb2xsOiBmYWxzZX0gKTtcbiAgICAgICAgICAgIHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjEuZ2V0RWRpdG9yKCkuaW5zZXJ0TmV3bGluZSgpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjEuZ2V0RWRpdG9yKCkuc2V0VGV4dEluQnVmZmVyUmFuZ2UoIFtbZGlmZkNodW5rLm9sZExpbmVTdGFydCArIG9mZnNldCwgMF0sIFtkaWZmQ2h1bmsub2xkTGluZUVuZCArIG9mZnNldCwgMF1dLCB0ZXh0VG9Db3B5ICk7XG4gICAgICAgICAgLy8gb2Zmc2V0IHdpbGwgYmUgdGhlIGFtb3VudCBvZiBsaW5lcyB0byBiZSBjb3BpZWQgbWludXMgdGhlIGFtb3VudCBvZiBsaW5lcyBvdmVyd3JpdHRlblxuICAgICAgICAgIG9mZnNldCArPSAoZGlmZkNodW5rLm5ld0xpbmVFbmQgLSBkaWZmQ2h1bmsubmV3TGluZVN0YXJ0KSAtIChkaWZmQ2h1bmsub2xkTGluZUVuZCAtIGRpZmZDaHVuay5vbGRMaW5lU3RhcnQpO1xuICAgICAgICAgIC8vIG1vdmUgdGhlIHNlbGVjdGlvbiBwb2ludGVyIGJhY2sgc28gdGhlIG5leHQgZGlmZiBjaHVuayBpcyBub3Qgc2tpcHBlZFxuICAgICAgICAgIGlmKCB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIxLmhhc1NlbGVjdGlvbigpIHx8IHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjIuaGFzU2VsZWN0aW9uKCkgKSB7XG4gICAgICAgICAgICB0aGlzLl9zZWxlY3RlZENodW5rSW5kZXgtLTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2xlYW5zIHVwIHRoZSBlZGl0b3IgaW5kaWNhdGVkIGJ5IGluZGV4LiBBIGNsZWFuIHVwIHdpbGwgcmVtb3ZlIHRoZSBlZGl0b3JcbiAgICogb3IgdGhlIHBhbmUgaWYgbmVjZXNzYXJ5LiBUeXBpY2FsbHkgbGVmdCBlZGl0b3IgPT0gMSBhbmQgcmlnaHQgZWRpdG9yID09IDIuXG4gICAqXG4gICAqIEBwYXJhbSBlZGl0b3JJbmRleCBUaGUgaW5kZXggb2YgdGhlIGVkaXRvciB0byBjbGVhbiB1cC5cbiAgICovXG4gIGNsZWFuVXBFZGl0b3IoIGVkaXRvckluZGV4ICkge1xuICAgIGlmKCBlZGl0b3JJbmRleCA9PT0gMSApIHtcbiAgICAgIHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjEuY2xlYW5VcCgpO1xuICAgIH0gZWxzZSBpZiggZWRpdG9ySW5kZXggPT09IDIgKSB7XG4gICAgICB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIyLmNsZWFuVXAoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRGVzdHJveXMgdGhlIGVkaXRvciBkaWZmIGV4dGVuZGVycy5cbiAgICovXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMS5kZXN0cm95KCk7XG4gICAgdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMi5kZXN0cm95KCk7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgbnVtYmVyIG9mIGRpZmZlcmVuY2VzIGJldHdlZW4gdGhlIGVkaXRvcnMuXG4gICAqXG4gICAqIEByZXR1cm4gaW50IFRoZSBudW1iZXIgb2YgZGlmZmVyZW5jZXMgYmV0d2VlbiB0aGUgZWRpdG9ycy5cbiAgICovXG4gIGdldE51bURpZmZlcmVuY2VzKCkge1xuICAgIHJldHVybiB0aGlzLl9jaHVua3MubGVuZ3RoO1xuICB9XG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIFBSSVZBVEUgTUVUSE9EUyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxuICAvKipcbiAgICogU2VsZWN0cyBhbmQgaGlnaGxpZ2h0cyB0aGUgZGlmZiBjaHVuayBpbiBib3RoIGVkaXRvcnMgYWNjb3JkaW5nIHRvIHRoZVxuICAgKiBnaXZlbiBpbmRleC5cbiAgICpcbiAgICogQHBhcmFtIGluZGV4IFRoZSBpbmRleCBvZiB0aGUgZGlmZiBjaHVuayB0byBoaWdobGlnaHQgaW4gYm90aCBlZGl0b3JzLlxuICAgKi9cbiAgX3NlbGVjdENodW5rKCBpbmRleCApIHtcbiAgICB2YXIgZGlmZkNodW5rID0gdGhpcy5fY2h1bmtzW2luZGV4XTtcbiAgICBpZiggZGlmZkNodW5rICE9IG51bGwgKSB7XG4gICAgICAvLyBkZXNlbGVjdCBwcmV2aW91cyBuZXh0L3ByZXYgaGlnaGxpZ2h0c1xuICAgICAgdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMS5kZXNlbGVjdEFsbExpbmVzKCk7XG4gICAgICB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIyLmRlc2VsZWN0QWxsTGluZXMoKTtcbiAgICAgIC8vIGhpZ2hsaWdodCBhbmQgc2Nyb2xsIGVkaXRvciAxXG4gICAgICB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIxLnNlbGVjdExpbmVzKCBkaWZmQ2h1bmsub2xkTGluZVN0YXJ0LCBkaWZmQ2h1bmsub2xkTGluZUVuZCApO1xuICAgICAgdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMS5nZXRFZGl0b3IoKS5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbiggW2RpZmZDaHVuay5vbGRMaW5lU3RhcnQsIDBdLCB7YXV0b3Njcm9sbDogdHJ1ZX0gKTtcbiAgICAgIC8vIGhpZ2hsaWdodCBhbmQgc2Nyb2xsIGVkaXRvciAyXG4gICAgICB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIyLnNlbGVjdExpbmVzKCBkaWZmQ2h1bmsubmV3TGluZVN0YXJ0LCBkaWZmQ2h1bmsubmV3TGluZUVuZCApO1xuICAgICAgdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMi5nZXRFZGl0b3IoKS5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbiggW2RpZmZDaHVuay5uZXdMaW5lU3RhcnQsIDBdLCB7YXV0b3Njcm9sbDogdHJ1ZX0gKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogSGlnaGxpZ2h0cyB0aGUgd29yZCBkaWZmIG9mIHRoZSBjaHVuayBwYXNzZWQgaW4uXG4gICAqXG4gICAqIEBwYXJhbSBjaHVuayBUaGUgY2h1bmsgdGhhdCBzaG91bGQgaGF2ZSBpdHMgd29yZHMgaGlnaGxpZ2h0ZWQuXG4gICAqL1xuICBfaGlnaGxpZ2h0V29yZHNJbkNodW5rKCBjaHVuaywgbGVmdEhpZ2hsaWdodFR5cGUsIHJpZ2h0SGlnaGxpZ2h0VHlwZSwgaXNXaGl0ZXNwYWNlSWdub3JlZCApIHtcbiAgICB2YXIgbGVmdExpbmVOdW1iZXIgPSBjaHVuay5vbGRMaW5lU3RhcnQ7XG4gICAgdmFyIHJpZ2h0TGluZU51bWJlciA9IGNodW5rLm5ld0xpbmVTdGFydDtcbiAgICAvLyBmb3IgZWFjaCBsaW5lIHRoYXQgaGFzIGEgY29ycmVzcG9uZGluZyBsaW5lXG4gICAgd2hpbGUoIGxlZnRMaW5lTnVtYmVyIDwgY2h1bmsub2xkTGluZUVuZCAmJiByaWdodExpbmVOdW1iZXIgPCBjaHVuay5uZXdMaW5lRW5kICkge1xuICAgICAgdmFyIGVkaXRvcjFMaW5lVGV4dCA9IHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjEuZ2V0RWRpdG9yKCkubGluZVRleHRGb3JCdWZmZXJSb3coIGxlZnRMaW5lTnVtYmVyICk7XG4gICAgICB2YXIgZWRpdG9yMkxpbmVUZXh0ID0gdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMi5nZXRFZGl0b3IoKS5saW5lVGV4dEZvckJ1ZmZlclJvdyggcmlnaHRMaW5lTnVtYmVyICk7XG5cbiAgICAgIGlmKCBlZGl0b3IxTGluZVRleHQgPT0gJycgKSB7XG4gICAgICAgIC8vIGNvbXB1dGVXb3JkRGlmZiByZXR1cm5zIGVtcHR5IGZvciBsaW5lcyB0aGF0IGFyZSBwYWlyZWQgd2l0aCBlbXB0eSBsaW5lc1xuICAgICAgICAvLyBuZWVkIHRvIGZvcmNlIGEgaGlnaGxpZ2h0XG4gICAgICAgIHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjIuc2V0V29yZEhpZ2hsaWdodHMoIHJpZ2h0TGluZU51bWJlciwgW3sgY2hhbmdlZDogdHJ1ZSwgdmFsdWU6IGVkaXRvcjJMaW5lVGV4dCB9XSwgcmlnaHRIaWdobGlnaHRUeXBlLCBpc1doaXRlc3BhY2VJZ25vcmVkICk7XG4gICAgICB9IGVsc2UgaWYoIGVkaXRvcjJMaW5lVGV4dCA9PSAnJyApIHtcbiAgICAgICAgLy8gY29tcHV0ZVdvcmREaWZmIHJldHVybnMgZW1wdHkgZm9yIGxpbmVzIHRoYXQgYXJlIHBhaXJlZCB3aXRoIGVtcHR5IGxpbmVzXG4gICAgICAgIC8vIG5lZWQgdG8gZm9yY2UgYSBoaWdobGlnaHRcbiAgICAgICAgdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMS5zZXRXb3JkSGlnaGxpZ2h0cyggbGVmdExpbmVOdW1iZXIsIFt7IGNoYW5nZWQ6IHRydWUsIHZhbHVlOiBlZGl0b3IxTGluZVRleHQgfV0sIGxlZnRIaWdobGlnaHRUeXBlLCBpc1doaXRlc3BhY2VJZ25vcmVkICk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBwZXJmb3JtIHJlZ3VsYXIgd29yZCBkaWZmXG4gICAgICAgIHZhciB3b3JkRGlmZiA9IENvbXB1dGVXb3JkRGlmZi5jb21wdXRlV29yZERpZmYoIGVkaXRvcjFMaW5lVGV4dCwgZWRpdG9yMkxpbmVUZXh0ICk7XG4gICAgICAgIHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjEuc2V0V29yZEhpZ2hsaWdodHMoIGxlZnRMaW5lTnVtYmVyLCB3b3JkRGlmZi5yZW1vdmVkV29yZHMsIGxlZnRIaWdobGlnaHRUeXBlLCBpc1doaXRlc3BhY2VJZ25vcmVkICk7XG4gICAgICAgIHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjIuc2V0V29yZEhpZ2hsaWdodHMoIHJpZ2h0TGluZU51bWJlciwgd29yZERpZmYuYWRkZWRXb3JkcywgcmlnaHRIaWdobGlnaHRUeXBlLCBpc1doaXRlc3BhY2VJZ25vcmVkICk7XG4gICAgICB9XG5cbiAgICAgIGxlZnRMaW5lTnVtYmVyKys7XG4gICAgICByaWdodExpbmVOdW1iZXIrKztcbiAgICB9XG5cbiAgICAvLyBoaWdobGlnaHQgcmVtYWluaW5nIGxpbmVzIGluIGxlZnQgZWRpdG9yXG4gICAgd2hpbGUoIGxlZnRMaW5lTnVtYmVyIDwgY2h1bmsub2xkTGluZUVuZCApIHtcbiAgICAgIHZhciBlZGl0b3IxTGluZVRleHQgPSB0aGlzLl9lZGl0b3JEaWZmRXh0ZW5kZXIxLmdldEVkaXRvcigpLmxpbmVUZXh0Rm9yQnVmZmVyUm93KCBsZWZ0TGluZU51bWJlciApO1xuICAgICAgdGhpcy5fZWRpdG9yRGlmZkV4dGVuZGVyMS5zZXRXb3JkSGlnaGxpZ2h0cyggbGVmdExpbmVOdW1iZXIsIFt7IGNoYW5nZWQ6IHRydWUsIHZhbHVlOiBlZGl0b3IxTGluZVRleHQgfV0sIGxlZnRIaWdobGlnaHRUeXBlLCBpc1doaXRlc3BhY2VJZ25vcmVkICk7XG4gICAgICBsZWZ0TGluZU51bWJlcisrO1xuICAgIH1cbiAgICAvLyBoaWdobGlnaHQgcmVtYWluaW5nIGxpbmVzIGluIHRoZSByaWdodCBlZGl0b3JcbiAgICB3aGlsZSggcmlnaHRMaW5lTnVtYmVyIDwgY2h1bmsubmV3TGluZUVuZCApIHtcbiAgICAgIHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjIuc2V0V29yZEhpZ2hsaWdodHMoIHJpZ2h0TGluZU51bWJlciwgW3sgY2hhbmdlZDogdHJ1ZSwgdmFsdWU6IHRoaXMuX2VkaXRvckRpZmZFeHRlbmRlcjIuZ2V0RWRpdG9yKCkubGluZVRleHRGb3JCdWZmZXJSb3coIHJpZ2h0TGluZU51bWJlciApIH1dLCByaWdodEhpZ2hsaWdodFR5cGUsIGlzV2hpdGVzcGFjZUlnbm9yZWQgKTtcbiAgICAgIHJpZ2h0TGluZU51bWJlcisrO1xuICAgIH1cbiAgfVxufTtcbiJdfQ==