(function() {
  var FooterView;

  module.exports = FooterView = (function() {
    function FooterView(isWhitespaceIgnored) {
      var copyToLeftButton, copyToRightButton, ignoreWhitespaceLabel, left, mid, nextDiffButton, numDifferences, prevDiffButton, right, selectionDivider;
      this.element = document.createElement('div');
      this.element.classList.add('split-diff-ui');
      prevDiffButton = document.createElement('button');
      prevDiffButton.classList.add('btn');
      prevDiffButton.classList.add('btn-md');
      prevDiffButton.classList.add('prev-diff');
      prevDiffButton.onclick = function() {
        return atom.commands.dispatch(atom.views.getView(atom.workspace), 'split-diff:prev-diff');
      };
      prevDiffButton.title = 'Move to Previous Diff';
      nextDiffButton = document.createElement('button');
      nextDiffButton.classList.add('btn');
      nextDiffButton.classList.add('btn-md');
      nextDiffButton.classList.add('next-diff');
      nextDiffButton.onclick = function() {
        return atom.commands.dispatch(atom.views.getView(atom.workspace), 'split-diff:next-diff');
      };
      nextDiffButton.title = 'Move to Next Diff';
      this.selectionCountValue = document.createElement('span');
      this.selectionCountValue.classList.add('selection-count-value');
      this.element.appendChild(this.selectionCountValue);
      selectionDivider = document.createElement('span');
      selectionDivider.textContent = '/';
      selectionDivider.classList.add('selection-divider');
      this.element.appendChild(selectionDivider);
      this.selectionCount = document.createElement('div');
      this.selectionCount.classList.add('selection-count');
      this.selectionCount.classList.add('hidden');
      this.selectionCount.appendChild(this.selectionCountValue);
      this.selectionCount.appendChild(selectionDivider);
      this.numDifferencesValue = document.createElement('span');
      this.numDifferencesValue.classList.add('num-diff-value');
      this.numDifferencesValue.textContent = '...';
      this.numDifferencesText = document.createElement('span');
      this.numDifferencesText.textContent = 'differences';
      this.numDifferencesText.classList.add('num-diff-text');
      numDifferences = document.createElement('div');
      numDifferences.classList.add('num-diff');
      numDifferences.appendChild(this.numDifferencesValue);
      numDifferences.appendChild(this.numDifferencesText);
      left = document.createElement('div');
      left.classList.add('left');
      left.appendChild(prevDiffButton);
      left.appendChild(nextDiffButton);
      left.appendChild(this.selectionCount);
      left.appendChild(numDifferences);
      this.element.appendChild(left);
      copyToLeftButton = document.createElement('button');
      copyToLeftButton.classList.add('btn');
      copyToLeftButton.classList.add('btn-md');
      copyToLeftButton.classList.add('copy-to-left');
      copyToLeftButton.onclick = function() {
        return atom.commands.dispatch(atom.views.getView(atom.workspace), 'split-diff:copy-to-left');
      };
      copyToLeftButton.title = 'Copy to Left';
      copyToRightButton = document.createElement('button');
      copyToRightButton.classList.add('btn');
      copyToRightButton.classList.add('btn-md');
      copyToRightButton.classList.add('copy-to-right');
      copyToRightButton.onclick = function() {
        return atom.commands.dispatch(atom.views.getView(atom.workspace), 'split-diff:copy-to-right');
      };
      copyToRightButton.title = 'Copy to Right';
      mid = document.createElement('div');
      mid.classList.add('mid');
      mid.appendChild(copyToLeftButton);
      mid.appendChild(copyToRightButton);
      this.element.appendChild(mid);
      this.ignoreWhitespaceValue = document.createElement('input');
      this.ignoreWhitespaceValue.type = 'checkbox';
      this.ignoreWhitespaceValue.id = 'ignore-whitespace-checkbox';
      this.ignoreWhitespaceValue.checked = isWhitespaceIgnored;
      this.ignoreWhitespaceValue.addEventListener('change', function() {
        return atom.commands.dispatch(atom.views.getView(atom.workspace), 'split-diff:ignore-whitespace');
      });
      ignoreWhitespaceLabel = document.createElement('label');
      ignoreWhitespaceLabel.classList.add('ignore-whitespace-label');
      ignoreWhitespaceLabel.htmlFor = 'ignore-whitespace-checkbox';
      ignoreWhitespaceLabel.textContent = 'Ignore Whitespace';
      right = document.createElement('div');
      right.classList.add('right');
      right.appendChild(this.ignoreWhitespaceValue);
      right.appendChild(ignoreWhitespaceLabel);
      this.element.appendChild(right);
    }

    FooterView.prototype.destroy = function() {
      this.element.remove();
      return this.footerPanel.destroy();
    };

    FooterView.prototype.getElement = function() {
      return this.element;
    };

    FooterView.prototype.createPanel = function() {
      return this.footerPanel = atom.workspace.addBottomPanel({
        item: this.element
      });
    };

    FooterView.prototype.show = function() {
      return this.footerPanel.show();
    };

    FooterView.prototype.hide = function() {
      return this.footerPanel.hide();
    };

    FooterView.prototype.setNumDifferences = function(num) {
      if (num === 1) {
        this.numDifferencesText.textContent = 'difference';
      } else {
        this.numDifferencesText.textContent = 'differences';
      }
      return this.numDifferencesValue.textContent = num;
    };

    FooterView.prototype.showSelectionCount = function(count) {
      this.selectionCountValue.textContent = count;
      return this.selectionCount.classList.remove('hidden');
    };

    FooterView.prototype.hideSelectionCount = function() {
      return this.selectionCount.classList.add('hidden');
    };

    FooterView.prototype.setIgnoreWhitespace = function(isWhitespaceIgnored) {
      return this.ignoreWhitespaceValue.checked = isWhitespaceIgnored;
    };

    return FooterView;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvdG95b2tpLy5hdG9tL3BhY2thZ2VzL2dpdC10aW1lLW1hY2hpbmUvbm9kZV9tb2R1bGVzL3NwbGl0LWRpZmYvbGliL3VpL2Zvb3Rlci12aWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtJQUNTLG9CQUFDLG1CQUFEO0FBRVgsVUFBQTtNQUFBLElBQUMsQ0FBQSxPQUFELEdBQVcsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsS0FBdkI7TUFDWCxJQUFDLENBQUEsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFuQixDQUF1QixlQUF2QjtNQU9BLGNBQUEsR0FBaUIsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsUUFBdkI7TUFDakIsY0FBYyxDQUFDLFNBQVMsQ0FBQyxHQUF6QixDQUE2QixLQUE3QjtNQUNBLGNBQWMsQ0FBQyxTQUFTLENBQUMsR0FBekIsQ0FBNkIsUUFBN0I7TUFDQSxjQUFjLENBQUMsU0FBUyxDQUFDLEdBQXpCLENBQTZCLFdBQTdCO01BQ0EsY0FBYyxDQUFDLE9BQWYsR0FBeUIsU0FBQTtlQUN2QixJQUFJLENBQUMsUUFBUSxDQUFDLFFBQWQsQ0FBdUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLENBQW1CLElBQUksQ0FBQyxTQUF4QixDQUF2QixFQUEyRCxzQkFBM0Q7TUFEdUI7TUFFekIsY0FBYyxDQUFDLEtBQWYsR0FBdUI7TUFFdkIsY0FBQSxHQUFpQixRQUFRLENBQUMsYUFBVCxDQUF1QixRQUF2QjtNQUNqQixjQUFjLENBQUMsU0FBUyxDQUFDLEdBQXpCLENBQTZCLEtBQTdCO01BQ0EsY0FBYyxDQUFDLFNBQVMsQ0FBQyxHQUF6QixDQUE2QixRQUE3QjtNQUNBLGNBQWMsQ0FBQyxTQUFTLENBQUMsR0FBekIsQ0FBNkIsV0FBN0I7TUFDQSxjQUFjLENBQUMsT0FBZixHQUF5QixTQUFBO2VBQ3ZCLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBZCxDQUF1QixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQVgsQ0FBbUIsSUFBSSxDQUFDLFNBQXhCLENBQXZCLEVBQTJELHNCQUEzRDtNQUR1QjtNQUV6QixjQUFjLENBQUMsS0FBZixHQUF1QjtNQUd2QixJQUFDLENBQUEsbUJBQUQsR0FBdUIsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsTUFBdkI7TUFDdkIsSUFBQyxDQUFBLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxHQUEvQixDQUFtQyx1QkFBbkM7TUFDQSxJQUFDLENBQUEsT0FBTyxDQUFDLFdBQVQsQ0FBcUIsSUFBQyxDQUFBLG1CQUF0QjtNQUVBLGdCQUFBLEdBQW1CLFFBQVEsQ0FBQyxhQUFULENBQXVCLE1BQXZCO01BQ25CLGdCQUFnQixDQUFDLFdBQWpCLEdBQStCO01BQy9CLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxHQUEzQixDQUErQixtQkFBL0I7TUFDQSxJQUFDLENBQUEsT0FBTyxDQUFDLFdBQVQsQ0FBcUIsZ0JBQXJCO01BRUEsSUFBQyxDQUFBLGNBQUQsR0FBa0IsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsS0FBdkI7TUFDbEIsSUFBQyxDQUFBLGNBQWMsQ0FBQyxTQUFTLENBQUMsR0FBMUIsQ0FBOEIsaUJBQTlCO01BQ0EsSUFBQyxDQUFBLGNBQWMsQ0FBQyxTQUFTLENBQUMsR0FBMUIsQ0FBOEIsUUFBOUI7TUFFQSxJQUFDLENBQUEsY0FBYyxDQUFDLFdBQWhCLENBQTRCLElBQUMsQ0FBQSxtQkFBN0I7TUFDQSxJQUFDLENBQUEsY0FBYyxDQUFDLFdBQWhCLENBQTRCLGdCQUE1QjtNQUdBLElBQUMsQ0FBQSxtQkFBRCxHQUF1QixRQUFRLENBQUMsYUFBVCxDQUF1QixNQUF2QjtNQUN2QixJQUFDLENBQUEsbUJBQW1CLENBQUMsU0FBUyxDQUFDLEdBQS9CLENBQW1DLGdCQUFuQztNQUNBLElBQUMsQ0FBQSxtQkFBbUIsQ0FBQyxXQUFyQixHQUFtQztNQUVuQyxJQUFDLENBQUEsa0JBQUQsR0FBc0IsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsTUFBdkI7TUFDdEIsSUFBQyxDQUFBLGtCQUFrQixDQUFDLFdBQXBCLEdBQWtDO01BQ2xDLElBQUMsQ0FBQSxrQkFBa0IsQ0FBQyxTQUFTLENBQUMsR0FBOUIsQ0FBa0MsZUFBbEM7TUFFQSxjQUFBLEdBQWlCLFFBQVEsQ0FBQyxhQUFULENBQXVCLEtBQXZCO01BQ2pCLGNBQWMsQ0FBQyxTQUFTLENBQUMsR0FBekIsQ0FBNkIsVUFBN0I7TUFFQSxjQUFjLENBQUMsV0FBZixDQUEyQixJQUFDLENBQUEsbUJBQTVCO01BQ0EsY0FBYyxDQUFDLFdBQWYsQ0FBMkIsSUFBQyxDQUFBLGtCQUE1QjtNQUVBLElBQUEsR0FBTyxRQUFRLENBQUMsYUFBVCxDQUF1QixLQUF2QjtNQUNQLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBZixDQUFtQixNQUFuQjtNQUNBLElBQUksQ0FBQyxXQUFMLENBQWlCLGNBQWpCO01BQ0EsSUFBSSxDQUFDLFdBQUwsQ0FBaUIsY0FBakI7TUFDQSxJQUFJLENBQUMsV0FBTCxDQUFpQixJQUFDLENBQUEsY0FBbEI7TUFDQSxJQUFJLENBQUMsV0FBTCxDQUFpQixjQUFqQjtNQUVBLElBQUMsQ0FBQSxPQUFPLENBQUMsV0FBVCxDQUFxQixJQUFyQjtNQU9BLGdCQUFBLEdBQW1CLFFBQVEsQ0FBQyxhQUFULENBQXVCLFFBQXZCO01BQ25CLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxHQUEzQixDQUErQixLQUEvQjtNQUNBLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxHQUEzQixDQUErQixRQUEvQjtNQUNBLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxHQUEzQixDQUErQixjQUEvQjtNQUNBLGdCQUFnQixDQUFDLE9BQWpCLEdBQTJCLFNBQUE7ZUFDekIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFkLENBQXVCLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBWCxDQUFtQixJQUFJLENBQUMsU0FBeEIsQ0FBdkIsRUFBMkQseUJBQTNEO01BRHlCO01BRTNCLGdCQUFnQixDQUFDLEtBQWpCLEdBQXlCO01BR3pCLGlCQUFBLEdBQW9CLFFBQVEsQ0FBQyxhQUFULENBQXVCLFFBQXZCO01BQ3BCLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxHQUE1QixDQUFnQyxLQUFoQztNQUNBLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxHQUE1QixDQUFnQyxRQUFoQztNQUNBLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxHQUE1QixDQUFnQyxlQUFoQztNQUNBLGlCQUFpQixDQUFDLE9BQWxCLEdBQTRCLFNBQUE7ZUFDMUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFkLENBQXVCLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBWCxDQUFtQixJQUFJLENBQUMsU0FBeEIsQ0FBdkIsRUFBMkQsMEJBQTNEO01BRDBCO01BRTVCLGlCQUFpQixDQUFDLEtBQWxCLEdBQTBCO01BRzFCLEdBQUEsR0FBTSxRQUFRLENBQUMsYUFBVCxDQUF1QixLQUF2QjtNQUVOLEdBQUcsQ0FBQyxTQUFTLENBQUMsR0FBZCxDQUFrQixLQUFsQjtNQUVBLEdBQUcsQ0FBQyxXQUFKLENBQWdCLGdCQUFoQjtNQUNBLEdBQUcsQ0FBQyxXQUFKLENBQWdCLGlCQUFoQjtNQUNBLElBQUMsQ0FBQSxPQUFPLENBQUMsV0FBVCxDQUFxQixHQUFyQjtNQU9BLElBQUMsQ0FBQSxxQkFBRCxHQUF5QixRQUFRLENBQUMsYUFBVCxDQUF1QixPQUF2QjtNQUN6QixJQUFDLENBQUEscUJBQXFCLENBQUMsSUFBdkIsR0FBOEI7TUFDOUIsSUFBQyxDQUFBLHFCQUFxQixDQUFDLEVBQXZCLEdBQTRCO01BRTVCLElBQUMsQ0FBQSxxQkFBcUIsQ0FBQyxPQUF2QixHQUFpQztNQUVqQyxJQUFDLENBQUEscUJBQXFCLENBQUMsZ0JBQXZCLENBQXdDLFFBQXhDLEVBQWtELFNBQUE7ZUFDaEQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFkLENBQXVCLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBWCxDQUFtQixJQUFJLENBQUMsU0FBeEIsQ0FBdkIsRUFBMkQsOEJBQTNEO01BRGdELENBQWxEO01BSUEscUJBQUEsR0FBd0IsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsT0FBdkI7TUFDeEIscUJBQXFCLENBQUMsU0FBUyxDQUFDLEdBQWhDLENBQW9DLHlCQUFwQztNQUNBLHFCQUFxQixDQUFDLE9BQXRCLEdBQWdDO01BQ2hDLHFCQUFxQixDQUFDLFdBQXRCLEdBQW9DO01BRXBDLEtBQUEsR0FBUSxRQUFRLENBQUMsYUFBVCxDQUF1QixLQUF2QjtNQUNSLEtBQUssQ0FBQyxTQUFTLENBQUMsR0FBaEIsQ0FBb0IsT0FBcEI7TUFFQSxLQUFLLENBQUMsV0FBTixDQUFrQixJQUFDLENBQUEscUJBQW5CO01BQ0EsS0FBSyxDQUFDLFdBQU4sQ0FBa0IscUJBQWxCO01BRUEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxXQUFULENBQXFCLEtBQXJCO0lBNUhXOzt5QkErSGIsT0FBQSxHQUFTLFNBQUE7TUFDUCxJQUFDLENBQUEsT0FBTyxDQUFDLE1BQVQsQ0FBQTthQUNBLElBQUMsQ0FBQSxXQUFXLENBQUMsT0FBYixDQUFBO0lBRk87O3lCQUlULFVBQUEsR0FBWSxTQUFBO2FBQ1YsSUFBQyxDQUFBO0lBRFM7O3lCQUdaLFdBQUEsR0FBYSxTQUFBO2FBQ1gsSUFBQyxDQUFBLFdBQUQsR0FBZSxJQUFJLENBQUMsU0FBUyxDQUFDLGNBQWYsQ0FBOEI7UUFBQSxJQUFBLEVBQU0sSUFBQyxDQUFBLE9BQVA7T0FBOUI7SUFESjs7eUJBR2IsSUFBQSxHQUFNLFNBQUE7YUFDSixJQUFDLENBQUEsV0FBVyxDQUFDLElBQWIsQ0FBQTtJQURJOzt5QkFHTixJQUFBLEdBQU0sU0FBQTthQUNKLElBQUMsQ0FBQSxXQUFXLENBQUMsSUFBYixDQUFBO0lBREk7O3lCQUlOLGlCQUFBLEdBQW1CLFNBQUMsR0FBRDtNQUNqQixJQUFHLEdBQUEsS0FBTyxDQUFWO1FBQ0UsSUFBQyxDQUFBLGtCQUFrQixDQUFDLFdBQXBCLEdBQWtDLGFBRHBDO09BQUEsTUFBQTtRQUdFLElBQUMsQ0FBQSxrQkFBa0IsQ0FBQyxXQUFwQixHQUFrQyxjQUhwQzs7YUFJQSxJQUFDLENBQUEsbUJBQW1CLENBQUMsV0FBckIsR0FBbUM7SUFMbEI7O3lCQVNuQixrQkFBQSxHQUFvQixTQUFDLEtBQUQ7TUFDbEIsSUFBQyxDQUFBLG1CQUFtQixDQUFDLFdBQXJCLEdBQW1DO2FBQ25DLElBQUMsQ0FBQSxjQUFjLENBQUMsU0FBUyxDQUFDLE1BQTFCLENBQWlDLFFBQWpDO0lBRmtCOzt5QkFLcEIsa0JBQUEsR0FBb0IsU0FBQTthQUNsQixJQUFDLENBQUEsY0FBYyxDQUFDLFNBQVMsQ0FBQyxHQUExQixDQUE4QixRQUE5QjtJQURrQjs7eUJBSXBCLG1CQUFBLEdBQXFCLFNBQUMsbUJBQUQ7YUFDbkIsSUFBQyxDQUFBLHFCQUFxQixDQUFDLE9BQXZCLEdBQWlDO0lBRGQ7Ozs7O0FBcEt2QiIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIEZvb3RlclZpZXdcbiAgY29uc3RydWN0b3I6IChpc1doaXRlc3BhY2VJZ25vcmVkKSAtPlxuICAgICMgY3JlYXRlIHJvb3QgVUkgZWxlbWVudFxuICAgIEBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICBAZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdzcGxpdC1kaWZmLXVpJylcblxuICAgICMgLS0tLS0tLS0tLS0tXG4gICAgIyBMRUZUIENPTFVNTiB8XG4gICAgIyAtLS0tLS0tLS0tLS1cblxuICAgICMgY3JlYXRlIHByZXYgZGlmZiBidXR0b25cbiAgICBwcmV2RGlmZkJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpXG4gICAgcHJldkRpZmZCdXR0b24uY2xhc3NMaXN0LmFkZCgnYnRuJylcbiAgICBwcmV2RGlmZkJ1dHRvbi5jbGFzc0xpc3QuYWRkKCdidG4tbWQnKVxuICAgIHByZXZEaWZmQnV0dG9uLmNsYXNzTGlzdC5hZGQoJ3ByZXYtZGlmZicpXG4gICAgcHJldkRpZmZCdXR0b24ub25jbGljayA9ICgpIC0+XG4gICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSksICdzcGxpdC1kaWZmOnByZXYtZGlmZicpXG4gICAgcHJldkRpZmZCdXR0b24udGl0bGUgPSAnTW92ZSB0byBQcmV2aW91cyBEaWZmJ1xuICAgICMgY3JlYXRlIG5leHQgZGlmZiBidXR0b25cbiAgICBuZXh0RGlmZkJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpXG4gICAgbmV4dERpZmZCdXR0b24uY2xhc3NMaXN0LmFkZCgnYnRuJylcbiAgICBuZXh0RGlmZkJ1dHRvbi5jbGFzc0xpc3QuYWRkKCdidG4tbWQnKVxuICAgIG5leHREaWZmQnV0dG9uLmNsYXNzTGlzdC5hZGQoJ25leHQtZGlmZicpXG4gICAgbmV4dERpZmZCdXR0b24ub25jbGljayA9ICgpIC0+XG4gICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSksICdzcGxpdC1kaWZmOm5leHQtZGlmZicpXG4gICAgbmV4dERpZmZCdXR0b24udGl0bGUgPSAnTW92ZSB0byBOZXh0IERpZmYnXG5cbiAgICAjIGNyZWF0ZSBzZWxlY3Rpb24gY291bnRlclxuICAgIEBzZWxlY3Rpb25Db3VudFZhbHVlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpXG4gICAgQHNlbGVjdGlvbkNvdW50VmFsdWUuY2xhc3NMaXN0LmFkZCgnc2VsZWN0aW9uLWNvdW50LXZhbHVlJylcbiAgICBAZWxlbWVudC5hcHBlbmRDaGlsZChAc2VsZWN0aW9uQ291bnRWYWx1ZSlcbiAgICAjIGNyZWF0ZSBzZWxlY3Rpb24gZGl2aWRlclxuICAgIHNlbGVjdGlvbkRpdmlkZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJylcbiAgICBzZWxlY3Rpb25EaXZpZGVyLnRleHRDb250ZW50ID0gJy8nXG4gICAgc2VsZWN0aW9uRGl2aWRlci5jbGFzc0xpc3QuYWRkKCdzZWxlY3Rpb24tZGl2aWRlcicpXG4gICAgQGVsZW1lbnQuYXBwZW5kQ2hpbGQoc2VsZWN0aW9uRGl2aWRlcilcbiAgICAjIGNyZWF0ZSBzZWxlY3Rpb24gY291bnQgY29udGFpbmVyXG4gICAgQHNlbGVjdGlvbkNvdW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICBAc2VsZWN0aW9uQ291bnQuY2xhc3NMaXN0LmFkZCgnc2VsZWN0aW9uLWNvdW50JylcbiAgICBAc2VsZWN0aW9uQ291bnQuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJylcbiAgICAjIGFkZCBpdGVtcyB0byBjb250YWluZXJcbiAgICBAc2VsZWN0aW9uQ291bnQuYXBwZW5kQ2hpbGQoQHNlbGVjdGlvbkNvdW50VmFsdWUpXG4gICAgQHNlbGVjdGlvbkNvdW50LmFwcGVuZENoaWxkKHNlbGVjdGlvbkRpdmlkZXIpXG5cbiAgICAjIGNyZWF0ZSBudW1iZXIgb2YgZGlmZmVyZW5jZXMgdmFsdWVcbiAgICBAbnVtRGlmZmVyZW5jZXNWYWx1ZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKVxuICAgIEBudW1EaWZmZXJlbmNlc1ZhbHVlLmNsYXNzTGlzdC5hZGQoJ251bS1kaWZmLXZhbHVlJylcbiAgICBAbnVtRGlmZmVyZW5jZXNWYWx1ZS50ZXh0Q29udGVudCA9ICcuLi4nXG4gICAgIyBjcmVhdGUgbnVtYmVyIG9mIGRpZmZlcmVuY2VzIHRleHRcbiAgICBAbnVtRGlmZmVyZW5jZXNUZXh0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpXG4gICAgQG51bURpZmZlcmVuY2VzVGV4dC50ZXh0Q29udGVudCA9ICdkaWZmZXJlbmNlcydcbiAgICBAbnVtRGlmZmVyZW5jZXNUZXh0LmNsYXNzTGlzdC5hZGQoJ251bS1kaWZmLXRleHQnKVxuICAgICMgY3JlYXRlIG51bWJlciBvZiBkaWZmZXJlbmNlcyBjb250YWluZXJcbiAgICBudW1EaWZmZXJlbmNlcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgbnVtRGlmZmVyZW5jZXMuY2xhc3NMaXN0LmFkZCgnbnVtLWRpZmYnKVxuICAgICMgYWRkIGl0ZW1zIHRvIGNvbnRhaW5lclxuICAgIG51bURpZmZlcmVuY2VzLmFwcGVuZENoaWxkKEBudW1EaWZmZXJlbmNlc1ZhbHVlKVxuICAgIG51bURpZmZlcmVuY2VzLmFwcGVuZENoaWxkKEBudW1EaWZmZXJlbmNlc1RleHQpXG4gICAgIyBjcmVhdGUgbGVmdCBjb2x1bW4gYW5kIGFkZCBwcmV2L25leHQgYnV0dG9ucyBhbmQgbnVtYmVyIG9mIGRpZmZlcmVuY2VzIHRleHRcbiAgICBsZWZ0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICBsZWZ0LmNsYXNzTGlzdC5hZGQoJ2xlZnQnKVxuICAgIGxlZnQuYXBwZW5kQ2hpbGQocHJldkRpZmZCdXR0b24pXG4gICAgbGVmdC5hcHBlbmRDaGlsZChuZXh0RGlmZkJ1dHRvbilcbiAgICBsZWZ0LmFwcGVuZENoaWxkKEBzZWxlY3Rpb25Db3VudClcbiAgICBsZWZ0LmFwcGVuZENoaWxkKG51bURpZmZlcmVuY2VzKVxuICAgICMgYWRkIGNvbnRhaW5lciB0byBVSVxuICAgIEBlbGVtZW50LmFwcGVuZENoaWxkKGxlZnQpXG5cbiAgICAjIC0tLS0tLS0tLS0tXG4gICAgIyBNSUQgQ09MVU1OIHxcbiAgICAjIC0tLS0tLS0tLS0tXG5cbiAgICAjIGNyZWF0ZSBjb3B5IHRvIGxlZnQgYnV0dG9uXG4gICAgY29weVRvTGVmdEJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpXG4gICAgY29weVRvTGVmdEJ1dHRvbi5jbGFzc0xpc3QuYWRkKCdidG4nKVxuICAgIGNvcHlUb0xlZnRCdXR0b24uY2xhc3NMaXN0LmFkZCgnYnRuLW1kJylcbiAgICBjb3B5VG9MZWZ0QnV0dG9uLmNsYXNzTGlzdC5hZGQoJ2NvcHktdG8tbGVmdCcpXG4gICAgY29weVRvTGVmdEJ1dHRvbi5vbmNsaWNrID0gKCkgLT5cbiAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKSwgJ3NwbGl0LWRpZmY6Y29weS10by1sZWZ0JylcbiAgICBjb3B5VG9MZWZ0QnV0dG9uLnRpdGxlID0gJ0NvcHkgdG8gTGVmdCdcbiAgICAjY29weVRvTGVmdEJ1dHRvbi50ZXh0Q29udGVudCA9ICdDb3B5IHRvIExlZnQnXG4gICAgIyBjcmVhdGUgY29weSB0byByaWdodCBidXR0b25cbiAgICBjb3B5VG9SaWdodEJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpXG4gICAgY29weVRvUmlnaHRCdXR0b24uY2xhc3NMaXN0LmFkZCgnYnRuJylcbiAgICBjb3B5VG9SaWdodEJ1dHRvbi5jbGFzc0xpc3QuYWRkKCdidG4tbWQnKVxuICAgIGNvcHlUb1JpZ2h0QnV0dG9uLmNsYXNzTGlzdC5hZGQoJ2NvcHktdG8tcmlnaHQnKVxuICAgIGNvcHlUb1JpZ2h0QnV0dG9uLm9uY2xpY2sgPSAoKSAtPlxuICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpLCAnc3BsaXQtZGlmZjpjb3B5LXRvLXJpZ2h0JylcbiAgICBjb3B5VG9SaWdodEJ1dHRvbi50aXRsZSA9ICdDb3B5IHRvIFJpZ2h0J1xuICAgICNjb3B5VG9SaWdodEJ1dHRvbi50ZXh0Q29udGVudCA9ICdDb3B5IHRvIFJpZ2h0J1xuICAgICMgY3JlYXRlIG1pZCBjb2x1bW5cbiAgICBtaWQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgICNtaWQuY2xhc3NMaXN0LmFkZCgnYnRuLWdyb3VwJylcbiAgICBtaWQuY2xhc3NMaXN0LmFkZCgnbWlkJylcbiAgICAjIGFkZCBidXR0b25zIHRvIGJ1dHRvbiBncm91cFxuICAgIG1pZC5hcHBlbmRDaGlsZChjb3B5VG9MZWZ0QnV0dG9uKVxuICAgIG1pZC5hcHBlbmRDaGlsZChjb3B5VG9SaWdodEJ1dHRvbilcbiAgICBAZWxlbWVudC5hcHBlbmRDaGlsZChtaWQpXG5cbiAgICAjIC0tLS0tLS0tLS0tLS1cbiAgICAjIFJJR0hUIENPTFVNTiB8XG4gICAgIyAtLS0tLS0tLS0tLS0tXG5cbiAgICAjIGNyZWF0ZSBpZ25vcmUgd2hpdGVzcGFjZSBjaGVja2JveFxuICAgIEBpZ25vcmVXaGl0ZXNwYWNlVmFsdWUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpXG4gICAgQGlnbm9yZVdoaXRlc3BhY2VWYWx1ZS50eXBlID0gJ2NoZWNrYm94J1xuICAgIEBpZ25vcmVXaGl0ZXNwYWNlVmFsdWUuaWQgPSAnaWdub3JlLXdoaXRlc3BhY2UtY2hlY2tib3gnXG4gICAgIyBzZXQgY2hlY2tib3ggdmFsdWUgdG8gY3VycmVudCBwYWNrYWdlIGlnbm9yZSB3aGl0ZXNwYWNlIHNldHRpbmdcbiAgICBAaWdub3JlV2hpdGVzcGFjZVZhbHVlLmNoZWNrZWQgPSBpc1doaXRlc3BhY2VJZ25vcmVkXG4gICAgIyByZWdpc3RlciBjb21tYW5kIHRvIGNoZWNrYm94XG4gICAgQGlnbm9yZVdoaXRlc3BhY2VWYWx1ZS5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoKSAtPlxuICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpLCAnc3BsaXQtZGlmZjppZ25vcmUtd2hpdGVzcGFjZScpXG4gICAgKVxuICAgICMgY3JlYXRlIGlnbm9yZSB3aGl0ZXNwYWNlIGxhYmVsXG4gICAgaWdub3JlV2hpdGVzcGFjZUxhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGFiZWwnKVxuICAgIGlnbm9yZVdoaXRlc3BhY2VMYWJlbC5jbGFzc0xpc3QuYWRkKCdpZ25vcmUtd2hpdGVzcGFjZS1sYWJlbCcpXG4gICAgaWdub3JlV2hpdGVzcGFjZUxhYmVsLmh0bWxGb3IgPSAnaWdub3JlLXdoaXRlc3BhY2UtY2hlY2tib3gnXG4gICAgaWdub3JlV2hpdGVzcGFjZUxhYmVsLnRleHRDb250ZW50ID0gJ0lnbm9yZSBXaGl0ZXNwYWNlJ1xuICAgICMgY3JlYXRlIHJpZ2h0IGNvbHVtblxuICAgIHJpZ2h0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICByaWdodC5jbGFzc0xpc3QuYWRkKCdyaWdodCcpXG4gICAgIyBhZGQgaXRlbXMgdG8gY29udGFpbmVyXG4gICAgcmlnaHQuYXBwZW5kQ2hpbGQoQGlnbm9yZVdoaXRlc3BhY2VWYWx1ZSlcbiAgICByaWdodC5hcHBlbmRDaGlsZChpZ25vcmVXaGl0ZXNwYWNlTGFiZWwpXG4gICAgIyBhZGQgc2V0dGluZ3MgdG8gVUlcbiAgICBAZWxlbWVudC5hcHBlbmRDaGlsZChyaWdodClcblxuICAjIFRlYXIgZG93biBhbnkgc3RhdGUgYW5kIGRldGFjaFxuICBkZXN0cm95OiAtPlxuICAgIEBlbGVtZW50LnJlbW92ZSgpXG4gICAgQGZvb3RlclBhbmVsLmRlc3Ryb3koKVxuXG4gIGdldEVsZW1lbnQ6IC0+XG4gICAgQGVsZW1lbnRcblxuICBjcmVhdGVQYW5lbDogLT5cbiAgICBAZm9vdGVyUGFuZWwgPSBhdG9tLndvcmtzcGFjZS5hZGRCb3R0b21QYW5lbChpdGVtOiBAZWxlbWVudClcblxuICBzaG93OiAtPlxuICAgIEBmb290ZXJQYW5lbC5zaG93KClcblxuICBoaWRlOiAtPlxuICAgIEBmb290ZXJQYW5lbC5oaWRlKClcblxuICAjIHNldCB0aGUgbnVtYmVyIG9mIGRpZmZlcmVuY2VzIHZhbHVlXG4gIHNldE51bURpZmZlcmVuY2VzOiAobnVtKSAtPlxuICAgIGlmIG51bSA9PSAxXG4gICAgICBAbnVtRGlmZmVyZW5jZXNUZXh0LnRleHRDb250ZW50ID0gJ2RpZmZlcmVuY2UnXG4gICAgZWxzZVxuICAgICAgQG51bURpZmZlcmVuY2VzVGV4dC50ZXh0Q29udGVudCA9ICdkaWZmZXJlbmNlcydcbiAgICBAbnVtRGlmZmVyZW5jZXNWYWx1ZS50ZXh0Q29udGVudCA9IG51bVxuXG4gICMgc2hvdyB0aGUgc2VsZWN0aW9uIGNvdW50ZXIgbmV4dCB0byB0aGUgbnVtYmVyIG9mIGRpZmZlcmVuY2VzXG4gICMgaXQgd2lsbCB0dXJuICdZIGRpZmZlcmVuY2VzJyBpbnRvICdYIC8gWSBkaWZmZXJlbmNlcydcbiAgc2hvd1NlbGVjdGlvbkNvdW50OiAoY291bnQpIC0+XG4gICAgQHNlbGVjdGlvbkNvdW50VmFsdWUudGV4dENvbnRlbnQgPSBjb3VudFxuICAgIEBzZWxlY3Rpb25Db3VudC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKVxuXG4gICMgaGlkZSB0aGUgc2VsZWN0aW9uIGNvdW50ZXIgbmV4dCB0byB0aGUgbnVtYmVyIG9mIGRpZmZlcmVuY2VzXG4gIGhpZGVTZWxlY3Rpb25Db3VudDogKCkgLT5cbiAgICBAc2VsZWN0aW9uQ291bnQuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJylcblxuICAjIHNldCB0aGUgc3RhdGUgb2YgdGhlIGlnbm9yZSB3aGl0ZXNwYWNlIGNoZWNrYm94XG4gIHNldElnbm9yZVdoaXRlc3BhY2U6IChpc1doaXRlc3BhY2VJZ25vcmVkKSAtPlxuICAgIEBpZ25vcmVXaGl0ZXNwYWNlVmFsdWUuY2hlY2tlZCA9IGlzV2hpdGVzcGFjZUlnbm9yZWRcbiJdfQ==
