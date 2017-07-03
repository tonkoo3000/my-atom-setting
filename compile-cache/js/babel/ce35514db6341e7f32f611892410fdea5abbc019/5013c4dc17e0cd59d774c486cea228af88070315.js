Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _underscorePlus = require('underscore-plus');

var _underscorePlus2 = _interopRequireDefault(_underscorePlus);

var _side = require('./side');

var _navigator = require('./navigator');

// Public: Model an individual conflict parsed from git's automatic conflict resolution output.
'use babel';

var Conflict = (function () {

  /*
   * Private: Initialize a new Conflict with its constituent Sides, Navigator, and the MergeState
   * it belongs to.
   *
   * ours [Side] the lines of this conflict that the current user contributed (by our best guess).
   * theirs [Side] the lines of this conflict that another contributor created.
   * base [Side] the lines of merge base of this conflict. Optional.
   * navigator [Navigator] maintains references to surrounding Conflicts in the original file.
   * state [MergeState] repository-wide information about the current merge.
   */

  function Conflict(ours, theirs, base, navigator, merge) {
    _classCallCheck(this, Conflict);

    this.ours = ours;
    this.theirs = theirs;
    this.base = base;
    this.navigator = navigator;
    this.merge = merge;

    this.emitter = new _atom.Emitter();

    // Populate back-references
    this.ours.conflict = this;
    this.theirs.conflict = this;
    if (this.base) {
      this.base.conflict = this;
    }
    this.navigator.conflict = this;

    // Begin unresolved
    this.resolution = null;
  }

  // Regular expression that matches the beginning of a potential conflict.

  /*
   * Public: Has this conflict been resolved in any way?
   *
   * Return [Boolean]
   */

  _createClass(Conflict, [{
    key: 'isResolved',
    value: function isResolved() {
      return this.resolution !== null;
    }

    /*
     * Public: Attach an event handler to be notified when this conflict is resolved.
     *
     * callback [Function]
     */
  }, {
    key: 'onDidResolveConflict',
    value: function onDidResolveConflict(callback) {
      return this.emitter.on('resolve-conflict', callback);
    }

    /*
     * Public: Specify which Side is to be kept. Note that either side may have been modified by the
     * user prior to resolution. Notify any subscribers.
     *
     * side [Side] our changes or their changes.
     */
  }, {
    key: 'resolveAs',
    value: function resolveAs(side) {
      this.resolution = side;
      this.emitter.emit('resolve-conflict');
    }

    /*
     * Public: Locate the position that the editor should scroll to in order to make this conflict
     * visible.
     *
     * Return [Point] buffer coordinates
     */
  }, {
    key: 'scrollTarget',
    value: function scrollTarget() {
      return this.ours.marker.getTailBufferPosition();
    }

    /*
     * Public: Audit all Marker instances owned by subobjects within this Conflict.
     *
     * Return [Array<Marker>]
     */
  }, {
    key: 'markers',
    value: function markers() {
      var ms = [this.ours.markers(), this.theirs.markers(), this.navigator.markers()];
      if (this.baseSide) {
        ms.push(this.baseSide.markers());
      }
      return _underscorePlus2['default'].flatten(ms, true);
    }

    /*
     * Public: Console-friendly identification of this conflict.
     *
     * Return [String] that distinguishes this conflict from others.
     */
  }, {
    key: 'toString',
    value: function toString() {
      return '[conflict: ' + this.ours + ' ' + this.theirs + ']';
    }

    /*
     * Public: Parse any conflict markers in a TextEditor's buffer and return a Conflict that contains
     * markers corresponding to each.
     *
     * merge [MergeState] Repository-wide state of the merge.
     * editor [TextEditor] The editor to search.
     * return [Array<Conflict>] A (possibly empty) collection of parsed Conflicts.
     */
  }], [{
    key: 'all',
    value: function all(merge, editor) {
      var conflicts = [];
      var lastRow = -1;

      editor.getBuffer().scan(CONFLICT_START_REGEX, function (m) {
        conflictStartRow = m.range.start.row;
        if (conflictStartRow < lastRow) {
          // Match within an already-parsed conflict.
          return;
        }

        var visitor = new ConflictVisitor(merge, editor);

        try {
          lastRow = parseConflict(merge, editor, conflictStartRow, visitor);
          var conflict = visitor.conflict();

          if (conflicts.length > 0) {
            conflict.navigator.linkToPrevious(conflicts[conflicts.length - 1]);
          }
          conflicts.push(conflict);
        } catch (e) {
          if (!e.parserState) throw e;

          if (!atom.inSpecMode()) {
            console.error('Unable to parse conflict: ' + e.message + '\n' + e.stack);
          }
        }
      });

      return conflicts;
    }
  }]);

  return Conflict;
})();

exports.Conflict = Conflict;
var CONFLICT_START_REGEX = /^<{7} (.+)\r?\n/g;

// Side positions.
var TOP = 'top';
var BASE = 'base';
var BOTTOM = 'bottom';

// Options used to initialize markers.
var options = {
  persistent: false,
  invalidate: 'never'
};

/*
 * Private: conflict parser visitor that ignores all events.
 */

var NoopVisitor = (function () {
  function NoopVisitor() {
    _classCallCheck(this, NoopVisitor);
  }

  /*
   * Private: conflict parser visitor that marks each buffer range and assembles a Conflict from the
   * pieces.
   */

  _createClass(NoopVisitor, [{
    key: 'visitOurSide',
    value: function visitOurSide(position, bannerRow, textRowStart, textRowEnd) {}
  }, {
    key: 'visitBaseSide',
    value: function visitBaseSide(position, bannerRow, textRowStart, textRowEnd) {}
  }, {
    key: 'visitSeparator',
    value: function visitSeparator(sepRowStart, sepRowEnd) {}
  }, {
    key: 'visitTheirSide',
    value: function visitTheirSide(position, bannerRow, textRowStart, textRowEnd) {}
  }]);

  return NoopVisitor;
})();

var ConflictVisitor = (function () {

  /*
   * merge - [MergeState] passed to each instantiated Side.
   * editor - [TextEditor] displaying the conflicting text.
   */

  function ConflictVisitor(merge, editor) {
    _classCallCheck(this, ConflictVisitor);

    this.merge = merge;
    this.editor = editor;
    this.previousSide = null;

    this.ourSide = null;
    this.baseSide = null;
    this.navigator = null;
  }

  /*
   * Private: parseConflict discovers git conflict markers in a corpus of text and constructs Conflict
   * instances that mark the correct lines.
   *
   * Returns [Integer] the buffer row after the final <<<<<< boundary.
   */

  /*
   * position - [String] one of TOP or BOTTOM.
   * bannerRow - [Integer] of the buffer row that contains our side's banner.
   * textRowStart - [Integer] of the first buffer row that contain this side's text.
   * textRowEnd - [Integer] of the first buffer row beyond the extend of this side's text.
   */

  _createClass(ConflictVisitor, [{
    key: 'visitOurSide',
    value: function visitOurSide(position, bannerRow, textRowStart, textRowEnd) {
      this.ourSide = this.markSide(position, _side.OurSide, bannerRow, textRowStart, textRowEnd);
    }

    /*
     * bannerRow - [Integer] the buffer row that contains our side's banner.
     * textRowStart - [Integer] first buffer row that contain this side's text.
     * textRowEnd - [Integer] first buffer row beyond the extend of this side's text.
     */
  }, {
    key: 'visitBaseSide',
    value: function visitBaseSide(bannerRow, textRowStart, textRowEnd) {
      this.baseSide = this.markSide(BASE, _side.BaseSide, bannerRow, textRowStart, textRowEnd);
    }

    /*
     * sepRowStart - [Integer] buffer row that contains the "=======" separator.
     * sepRowEnd - [Integer] the buffer row after the separator.
     */
  }, {
    key: 'visitSeparator',
    value: function visitSeparator(sepRowStart, sepRowEnd) {
      var marker = this.editor.markBufferRange([[sepRowStart, 0], [sepRowEnd, 0]], options);
      this.previousSide.followingMarker = marker;

      this.navigator = new _navigator.Navigator(marker);
      this.previousSide = this.navigator;
    }

    /*
     * position - [String] Always BASE; accepted for consistency.
     * bannerRow - [Integer] the buffer row that contains our side's banner.
     * textRowStart - [Integer] first buffer row that contain this side's text.
     * textRowEnd - [Integer] first buffer row beyond the extend of this side's text.
     */
  }, {
    key: 'visitTheirSide',
    value: function visitTheirSide(position, bannerRow, textRowStart, textRowEnd) {
      this.theirSide = this.markSide(position, _side.TheirSide, bannerRow, textRowStart, textRowEnd);
    }
  }, {
    key: 'markSide',
    value: function markSide(position, sideKlass, bannerRow, textRowStart, textRowEnd) {
      var description = this.sideDescription(bannerRow);

      var bannerMarker = this.editor.markBufferRange([[bannerRow, 0], [bannerRow + 1, 0]], options);

      if (this.previousSide) {
        this.previousSide.followingMarker = bannerMarker;
      }

      var textRange = [[textRowStart, 0], [textRowEnd, 0]];
      var textMarker = this.editor.markBufferRange(textRange, options);
      var text = this.editor.getTextInBufferRange(textRange);

      var side = new sideKlass(text, description, textMarker, bannerMarker, position);
      this.previousSide = side;
      return side;
    }

    /*
     * Parse the banner description for the current side from a banner row.
     */
  }, {
    key: 'sideDescription',
    value: function sideDescription(bannerRow) {
      return this.editor.lineTextForBufferRow(bannerRow).match(/^[<|>]{7} (.*)$/)[1];
    }
  }, {
    key: 'conflict',
    value: function conflict() {
      this.previousSide.followingMarker = this.previousSide.refBannerMarker;

      return new Conflict(this.ourSide, this.theirSide, this.baseSide, this.navigator, this.merge);
    }
  }]);

  return ConflictVisitor;
})();

var parseConflict = function parseConflict(merge, editor, row, visitor) {
  var lastBoundary = null;

  // Visit a side that begins with a banner and description as its first line.
  var visitHeaderSide = function visitHeaderSide(position, visitMethod) {
    var sideRowStart = row;
    row += 1;
    advanceToBoundary('|=');
    var sideRowEnd = row;

    visitor[visitMethod](position, sideRowStart, sideRowStart + 1, sideRowEnd);
  };

  // Visit the base side from diff3 output, if one is present, then visit the separator.
  var visitBaseAndSeparator = function visitBaseAndSeparator() {
    if (lastBoundary === '|') {
      visitBaseSide();
    }

    visitSeparator();
  };

  // Visit a base side from diff3 output.
  var visitBaseSide = function visitBaseSide() {
    var sideRowStart = row;
    row += 1;

    var b = advanceToBoundary('<=');
    while (b === '<') {
      // Embedded recursive conflict within a base side, caused by a criss-cross merge.
      // Advance beyond it without marking anything.
      row = parseConflict(merge, editor, row, new NoopVisitor());
      b = advanceToBoundary('<=');
    }

    var sideRowEnd = row;

    visitor.visitBaseSide(sideRowStart, sideRowStart + 1, sideRowEnd);
  };

  // Visit a "========" separator.
  var visitSeparator = function visitSeparator() {
    var sepRowStart = row;
    row += 1;
    var sepRowEnd = row;

    visitor.visitSeparator(sepRowStart, sepRowEnd);
  };

  // Vidie a side with a banner and description as its last line.
  var visitFooterSide = function visitFooterSide(position, visitMethod) {
    var sideRowStart = row;
    var b = advanceToBoundary('>');
    row += 1;
    sideRowEnd = row;

    visitor[visitMethod](position, sideRowEnd - 1, sideRowStart, sideRowEnd - 1);
  };

  // Determine if the current row is a side boundary.
  //
  // boundaryKinds - [String] any combination of <, |, =, or > to limit the kinds of boundary
  //   detected.
  //
  // Returns the matching boundaryKinds character, or `null` if none match.
  var isAtBoundary = function isAtBoundary() {
    var boundaryKinds = arguments.length <= 0 || arguments[0] === undefined ? '<|=>' : arguments[0];

    var line = editor.lineTextForBufferRow(row);
    for (b of boundaryKinds) {
      if (line.startsWith(b.repeat(7))) {
        return b;
      }
    }
    return null;
  };

  // Increment the current row until the current line matches one of the provided boundary kinds,
  // or until there are no more lines in the editor.
  //
  // boundaryKinds - [String] any combination of <, |, =, or > to limit the kinds of boundaries
  //   that halt the progression.
  //
  // Returns the matching boundaryKinds character, or 'null' if there are no matches to the end of
  // the editor.
  var advanceToBoundary = function advanceToBoundary() {
    var boundaryKinds = arguments.length <= 0 || arguments[0] === undefined ? '<|=>' : arguments[0];

    var b = isAtBoundary(boundaryKinds);
    while (b === null) {
      row += 1;
      if (row > editor.getLastBufferRow()) {
        var e = new Error('Unterminated conflict side');
        e.parserState = true;
        throw e;
      }
      b = isAtBoundary(boundaryKinds);
    }

    lastBoundary = b;
    return b;
  };

  if (!merge.isRebase) {
    visitHeaderSide(TOP, 'visitOurSide');
    visitBaseAndSeparator();
    visitFooterSide(BOTTOM, 'visitTheirSide');
  } else {
    visitHeaderSide(TOP, 'visitTheirSide');
    visitBaseAndSeparator();
    visitFooterSide(BOTTOM, 'visitOurSide');
  }

  return row;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3RveW9raS8uYXRvbS9wYWNrYWdlcy9tZXJnZS1jb25mbGljdHMvbGliL2NvbmZsaWN0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7b0JBRXNCLE1BQU07OzhCQUNkLGlCQUFpQjs7OztvQkFFa0IsUUFBUTs7eUJBQ2pDLGFBQWE7OztBQU5yQyxXQUFXLENBQUE7O0lBU0UsUUFBUTs7Ozs7Ozs7Ozs7OztBQVlQLFdBWkQsUUFBUSxDQVlOLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUU7MEJBWnhDLFFBQVE7O0FBYWpCLFFBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFBO0FBQ2hCLFFBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFBO0FBQ3BCLFFBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFBO0FBQ2hCLFFBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFBO0FBQzFCLFFBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFBOztBQUVsQixRQUFJLENBQUMsT0FBTyxHQUFHLG1CQUFhLENBQUE7OztBQUc1QixRQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUE7QUFDekIsUUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFBO0FBQzNCLFFBQUksSUFBSSxDQUFDLElBQUksRUFBRTtBQUNiLFVBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQTtLQUMxQjtBQUNELFFBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQTs7O0FBRzlCLFFBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFBO0dBQ3ZCOzs7Ozs7Ozs7O2VBL0JVLFFBQVE7O1dBc0NULHNCQUFHO0FBQ1gsYUFBTyxJQUFJLENBQUMsVUFBVSxLQUFLLElBQUksQ0FBQTtLQUNoQzs7Ozs7Ozs7O1dBT29CLDhCQUFDLFFBQVEsRUFBRTtBQUM5QixhQUFP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LENBQUE7T0FDUjtBQUNELE9BQUMsR0FBRyxZQUFZLENBQUMsYUFBYSxDQUFDLENBQUE7S0FDaEM7O0FBRUQsZ0JBQVksR0FBRyxDQUFDLENBQUE7QUFDaEIsV0FBTyxDQUFDLENBQUE7R0FDVCxDQUFBOztBQUVELE1BQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFO0FBQ25CLG1CQUFlLENBQUMsR0FBRyxFQUFFLGNBQWMsQ0FBQyxDQUFBO0FBQ3BDLHlCQUFxQixFQUFFLENBQUE7QUFDdkIsbUJBQWUsQ0FBQyxNQUFNLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQTtHQUMxQyxNQUFNO0FBQ0wsbUJBQWUsQ0FBQyxHQUFHLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQTtBQUN0Qyx5QkFBcUIsRUFBRSxDQUFBO0FBQ3ZCLG1CQUFlLENBQUMsTUFBTSxFQUFFLGNBQWMsQ0FBQyxDQUFBO0dBQ3hDOztBQUVELFNBQU8sR0FBRyxDQUFBO0NBQ1gsQ0FBQSIsImZpbGUiOiIvaG9tZS90b3lva2kvLmF0b20vcGFja2FnZXMvbWVyZ2UtY29uZmxpY3RzL2xpYi9jb25mbGljdC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbmltcG9ydCB7RW1pdHRlcn0gZnJvbSAnYXRvbSdcbmltcG9ydCBfIGZyb20gJ3VuZGVyc2NvcmUtcGx1cydcblxuaW1wb3J0IHtTaWRlLCBPdXJTaWRlLCBUaGVpclNpZGUsIEJhc2VTaWRlfSBmcm9tICcuL3NpZGUnXG5pbXBvcnQge05hdmlnYXRvcn0gZnJvbSAnLi9uYXZpZ2F0b3InXG5cbi8vIFB1YmxpYzogTW9kZWwgYW4gaW5kaXZpZHVhbCBjb25mbGljdCBwYXJzZWQgZnJvbSBnaXQncyBhdXRvbWF0aWMgY29uZmxpY3QgcmVzb2x1dGlvbiBvdXRwdXQuXG5leHBvcnQgY2xhc3MgQ29uZmxpY3Qge1xuXG4gIC8qXG4gICAqIFByaXZhdGU6IEluaXRpYWxpemUgYSBuZXcgQ29uZmxpY3Qgd2l0aCBpdHMgY29uc3RpdHVlbnQgU2lkZXMsIE5hdmlnYXRvciwgYW5kIHRoZSBNZXJnZVN0YXRlXG4gICAqIGl0IGJlbG9uZ3MgdG8uXG4gICAqXG4gICAqIG91cnMgW1NpZGVdIHRoZSBsaW5lcyBvZiB0aGlzIGNvbmZsaWN0IHRoYXQgdGhlIGN1cnJlbnQgdXNlciBjb250cmlidXRlZCAoYnkgb3VyIGJlc3QgZ3Vlc3MpLlxuICAgKiB0aGVpcnMgW1NpZGVdIHRoZSBsaW5lcyBvZiB0aGlzIGNvbmZsaWN0IHRoYXQgYW5vdGhlciBjb250cmlidXRvciBjcmVhdGVkLlxuICAgKiBiYXNlIFtTaWRlXSB0aGUgbGluZXMgb2YgbWVyZ2UgYmFzZSBvZiB0aGlzIGNvbmZsaWN0LiBPcHRpb25hbC5cbiAgICogbmF2aWdhdG9yIFtOYXZpZ2F0b3JdIG1haW50YWlucyByZWZlcmVuY2VzIHRvIHN1cnJvdW5kaW5nIENvbmZsaWN0cyBpbiB0aGUgb3JpZ2luYWwgZmlsZS5cbiAgICogc3RhdGUgW01lcmdlU3RhdGVdIHJlcG9zaXRvcnktd2lkZSBpbmZvcm1hdGlvbiBhYm91dCB0aGUgY3VycmVudCBtZXJnZS5cbiAgICovXG4gIGNvbnN0cnVjdG9yIChvdXJzLCB0aGVpcnMsIGJhc2UsIG5hdmlnYXRvciwgbWVyZ2UpIHtcbiAgICB0aGlzLm91cnMgPSBvdXJzXG4gICAgdGhpcy50aGVpcnMgPSB0aGVpcnNcbiAgICB0aGlzLmJhc2UgPSBiYXNlXG4gICAgdGhpcy5uYXZpZ2F0b3IgPSBuYXZpZ2F0b3JcbiAgICB0aGlzLm1lcmdlID0gbWVyZ2VcblxuICAgIHRoaXMuZW1pdHRlciA9IG5ldyBFbWl0dGVyKClcblxuICAgIC8vIFBvcHVsYXRlIGJhY2stcmVmZXJlbmNlc1xuICAgIHRoaXMub3Vycy5jb25mbGljdCA9IHRoaXNcbiAgICB0aGlzLnRoZWlycy5jb25mbGljdCA9IHRoaXNcbiAgICBpZiAodGhpcy5iYXNlKSB7XG4gICAgICB0aGlzLmJhc2UuY29uZmxpY3QgPSB0aGlzXG4gICAgfVxuICAgIHRoaXMubmF2aWdhdG9yLmNvbmZsaWN0ID0gdGhpc1xuXG4gICAgLy8gQmVnaW4gdW5yZXNvbHZlZFxuICAgIHRoaXMucmVzb2x1dGlvbiA9IG51bGxcbiAgfVxuXG4gIC8qXG4gICAqIFB1YmxpYzogSGFzIHRoaXMgY29uZmxpY3QgYmVlbiByZXNvbHZlZCBpbiBhbnkgd2F5P1xuICAgKlxuICAgKiBSZXR1cm4gW0Jvb2xlYW5dXG4gICAqL1xuICBpc1Jlc29sdmVkKCkge1xuICAgIHJldHVybiB0aGlzLnJlc29sdXRpb24gIT09IG51bGxcbiAgfVxuXG4gIC8qXG4gICAqIFB1YmxpYzogQXR0YWNoIGFuIGV2ZW50IGhhbmRsZXIgdG8gYmUgbm90aWZpZWQgd2hlbiB0aGlzIGNvbmZsaWN0IGlzIHJlc29sdmVkLlxuICAgKlxuICAgKiBjYWxsYmFjayBbRnVuY3Rpb25dXG4gICAqL1xuICBvbkRpZFJlc29sdmVDb25mbGljdCAoY2FsbGJhY2spIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLm9uKCdyZXNvbHZlLWNvbmZsaWN0JywgY2FsbGJhY2spXG4gIH1cblxuICAvKlxuICAgKiBQdWJsaWM6IFNwZWNpZnkgd2hpY2ggU2lkZSBpcyB0byBiZSBrZXB0LiBOb3RlIHRoYXQgZWl0aGVyIHNpZGUgbWF5IGhhdmUgYmVlbiBtb2RpZmllZCBieSB0aGVcbiAgICogdXNlciBwcmlvciB0byByZXNvbHV0aW9uLiBOb3RpZnkgYW55IHN1YnNjcmliZXJzLlxuICAgKlxuICAgKiBzaWRlIFtTaWRlXSBvdXIgY2hhbmdlcyBvciB0aGVpciBjaGFuZ2VzLlxuICAgKi9cbiAgcmVzb2x2ZUFzIChzaWRlKSB7XG4gICAgdGhpcy5yZXNvbHV0aW9uID0gc2lkZVxuICAgIHRoaXMuZW1pdHRlci5lbWl0KCdyZXNvbHZlLWNvbmZsaWN0JylcbiAgfVxuXG4gIC8qXG4gICAqIFB1YmxpYzogTG9jYXRlIHRoZSBwb3NpdGlvbiB0aGF0IHRoZSBlZGl0b3Igc2hvdWxkIHNjcm9sbCB0byBpbiBvcmRlciB0byBtYWtlIHRoaXMgY29uZmxpY3RcbiAgICogdmlzaWJsZS5cbiAgICpcbiAgICogUmV0dXJuIFtQb2ludF0gYnVmZmVyIGNvb3JkaW5hdGVzXG4gICAqL1xuICBzY3JvbGxUYXJnZXQgKCkge1xuICAgIHJldHVybiB0aGlzLm91cnMubWFya2VyLmdldFRhaWxCdWZmZXJQb3NpdGlvbigpXG4gIH1cblxuICAvKlxuICAgKiBQdWJsaWM6IEF1ZGl0IGFsbCBNYXJrZXIgaW5zdGFuY2VzIG93bmVkIGJ5IHN1Ym9iamVjdHMgd2l0aGluIHRoaXMgQ29uZmxpY3QuXG4gICAqXG4gICAqIFJldHVybiBbQXJyYXk8TWFya2VyPl1cbiAgICovXG4gIG1hcmtlcnMgKCkge1xuICAgIGNvbnN0IG1zID0gW3RoaXMub3Vycy5tYXJrZXJzKCksIHRoaXMudGhlaXJzLm1hcmtlcnMoKSwgdGhpcy5uYXZpZ2F0b3IubWFya2VycygpXVxuICAgIGlmICh0aGlzLmJhc2VTaWRlKSB7XG4gICAgICBtcy5wdXNoKHRoaXMuYmFzZVNpZGUubWFya2VycygpKVxuICAgIH1cbiAgICByZXR1cm4gXy5mbGF0dGVuKG1zLCB0cnVlKVxuICB9XG5cbiAgLypcbiAgICogUHVibGljOiBDb25zb2xlLWZyaWVuZGx5IGlkZW50aWZpY2F0aW9uIG9mIHRoaXMgY29uZmxpY3QuXG4gICAqXG4gICAqIFJldHVybiBbU3RyaW5nXSB0aGF0IGRpc3Rpbmd1aXNoZXMgdGhpcyBjb25mbGljdCBmcm9tIG90aGVycy5cbiAgICovXG4gIHRvU3RyaW5nICgpIHtcbiAgICByZXR1cm4gYFtjb25mbGljdDogJHt0aGlzLm91cnN9ICR7dGhpcy50aGVpcnN9XWBcbiAgfVxuXG4gIC8qXG4gICAqIFB1YmxpYzogUGFyc2UgYW55IGNvbmZsaWN0IG1hcmtlcnMgaW4gYSBUZXh0RWRpdG9yJ3MgYnVmZmVyIGFuZCByZXR1cm4gYSBDb25mbGljdCB0aGF0IGNvbnRhaW5zXG4gICAqIG1hcmtlcnMgY29ycmVzcG9uZGluZyB0byBlYWNoLlxuICAgKlxuICAgKiBtZXJnZSBbTWVyZ2VTdGF0ZV0gUmVwb3NpdG9yeS13aWRlIHN0YXRlIG9mIHRoZSBtZXJnZS5cbiAgICogZWRpdG9yIFtUZXh0RWRpdG9yXSBUaGUgZWRpdG9yIHRvIHNlYXJjaC5cbiAgICogcmV0dXJuIFtBcnJheTxDb25mbGljdD5dIEEgKHBvc3NpYmx5IGVtcHR5KSBjb2xsZWN0aW9uIG9mIHBhcnNlZCBDb25mbGljdHMuXG4gICAqL1xuICBzdGF0aWMgYWxsIChtZXJnZSwgZWRpdG9yKSB7XG4gICAgY29uc3QgY29uZmxpY3RzID0gW11cbiAgICBsZXQgbGFzdFJvdyA9IC0xXG5cbiAgICBlZGl0b3IuZ2V0QnVmZmVyKCkuc2NhbihDT05GTElDVF9TVEFSVF9SRUdFWCwgKG0pID0+IHtcbiAgICAgIGNvbmZsaWN0U3RhcnRSb3cgPSBtLnJhbmdlLnN0YXJ0LnJvd1xuICAgICAgaWYgKGNvbmZsaWN0U3RhcnRSb3cgPCBsYXN0Um93KSB7XG4gICAgICAgIC8vIE1hdGNoIHdpdGhpbiBhbiBhbHJlYWR5LXBhcnNlZCBjb25mbGljdC5cbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHZpc2l0b3IgPSBuZXcgQ29uZmxpY3RWaXNpdG9yKG1lcmdlLCBlZGl0b3IpXG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGxhc3RSb3cgPSBwYXJzZUNvbmZsaWN0KG1lcmdlLCBlZGl0b3IsIGNvbmZsaWN0U3RhcnRSb3csIHZpc2l0b3IpXG4gICAgICAgIGNvbnN0IGNvbmZsaWN0ID0gdmlzaXRvci5jb25mbGljdCgpXG5cbiAgICAgICAgaWYgKGNvbmZsaWN0cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgY29uZmxpY3QubmF2aWdhdG9yLmxpbmtUb1ByZXZpb3VzKGNvbmZsaWN0c1tjb25mbGljdHMubGVuZ3RoIC0gMV0pXG4gICAgICAgIH1cbiAgICAgICAgY29uZmxpY3RzLnB1c2goY29uZmxpY3QpXG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGlmICghZS5wYXJzZXJTdGF0ZSkgdGhyb3cgZVxuXG4gICAgICAgIGlmICghYXRvbS5pblNwZWNNb2RlKCkpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKGBVbmFibGUgdG8gcGFyc2UgY29uZmxpY3Q6ICR7ZS5tZXNzYWdlfVxcbiR7ZS5zdGFja31gKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcblxuICAgIHJldHVybiBjb25mbGljdHNcbiAgfVxufVxuXG4vLyBSZWd1bGFyIGV4cHJlc3Npb24gdGhhdCBtYXRjaGVzIHRoZSBiZWdpbm5pbmcgb2YgYSBwb3RlbnRpYWwgY29uZmxpY3QuXG5jb25zdCBDT05GTElDVF9TVEFSVF9SRUdFWCA9IC9ePHs3fSAoLispXFxyP1xcbi9nXG5cbi8vIFNpZGUgcG9zaXRpb25zLlxuY29uc3QgVE9QID0gJ3RvcCdcbmNvbnN0IEJBU0UgPSAnYmFzZSdcbmNvbnN0IEJPVFRPTSA9ICdib3R0b20nXG5cbi8vIE9wdGlvbnMgdXNlZCB0byBpbml0aWFsaXplIG1hcmtlcnMuXG5jb25zdCBvcHRpb25zID0ge1xuICBwZXJzaXN0ZW50OiBmYWxzZSxcbiAgaW52YWxpZGF0ZTogJ25ldmVyJ1xufVxuXG4vKlxuICogUHJpdmF0ZTogY29uZmxpY3QgcGFyc2VyIHZpc2l0b3IgdGhhdCBpZ25vcmVzIGFsbCBldmVudHMuXG4gKi9cbmNsYXNzIE5vb3BWaXNpdG9yIHtcblxuICB2aXNpdE91clNpZGUgKHBvc2l0aW9uLCBiYW5uZXJSb3csIHRleHRSb3dTdGFydCwgdGV4dFJvd0VuZCkgeyB9XG5cbiAgdmlzaXRCYXNlU2lkZSAocG9zaXRpb24sIGJhbm5lclJvdywgdGV4dFJvd1N0YXJ0LCB0ZXh0Um93RW5kKSB7IH1cblxuICB2aXNpdFNlcGFyYXRvciAoc2VwUm93U3RhcnQsIHNlcFJvd0VuZCkgeyB9XG5cbiAgdmlzaXRUaGVpclNpZGUgKHBvc2l0aW9uLCBiYW5uZXJSb3csIHRleHRSb3dTdGFydCwgdGV4dFJvd0VuZCkgeyB9XG5cbn1cblxuLypcbiAqIFByaXZhdGU6IGNvbmZsaWN0IHBhcnNlciB2aXNpdG9yIHRoYXQgbWFya3MgZWFjaCBidWZmZXIgcmFuZ2UgYW5kIGFzc2VtYmxlcyBhIENvbmZsaWN0IGZyb20gdGhlXG4gKiBwaWVjZXMuXG4gKi9cbmNsYXNzIENvbmZsaWN0VmlzaXRvciB7XG5cbiAgLypcbiAgICogbWVyZ2UgLSBbTWVyZ2VTdGF0ZV0gcGFzc2VkIHRvIGVhY2ggaW5zdGFudGlhdGVkIFNpZGUuXG4gICAqIGVkaXRvciAtIFtUZXh0RWRpdG9yXSBkaXNwbGF5aW5nIHRoZSBjb25mbGljdGluZyB0ZXh0LlxuICAgKi9cbiAgY29uc3RydWN0b3IgKG1lcmdlLCBlZGl0b3IpIHtcbiAgICB0aGlzLm1lcmdlID0gbWVyZ2VcbiAgICB0aGlzLmVkaXRvciA9IGVkaXRvclxuICAgIHRoaXMucHJldmlvdXNTaWRlID0gbnVsbFxuXG4gICAgdGhpcy5vdXJTaWRlID0gbnVsbFxuICAgIHRoaXMuYmFzZVNpZGUgPSBudWxsXG4gICAgdGhpcy5uYXZpZ2F0b3IgPSBudWxsXG4gIH1cblxuICAvKlxuICAgKiBwb3NpdGlvbiAtIFtTdHJpbmddIG9uZSBvZiBUT1Agb3IgQk9UVE9NLlxuICAgKiBiYW5uZXJSb3cgLSBbSW50ZWdlcl0gb2YgdGhlIGJ1ZmZlciByb3cgdGhhdCBjb250YWlucyBvdXIgc2lkZSdzIGJhbm5lci5cbiAgICogdGV4dFJvd1N0YXJ0IC0gW0ludGVnZXJdIG9mIHRoZSBmaXJzdCBidWZmZXIgcm93IHRoYXQgY29udGFpbiB0aGlzIHNpZGUncyB0ZXh0LlxuICAgKiB0ZXh0Um93RW5kIC0gW0ludGVnZXJdIG9mIHRoZSBmaXJzdCBidWZmZXIgcm93IGJleW9uZCB0aGUgZXh0ZW5kIG9mIHRoaXMgc2lkZSdzIHRleHQuXG4gICAqL1xuICB2aXNpdE91clNpZGUgKHBvc2l0aW9uLCBiYW5uZXJSb3csIHRleHRSb3dTdGFydCwgdGV4dFJvd0VuZCkge1xuICAgIHRoaXMub3VyU2lkZSA9IHRoaXMubWFya1NpZGUocG9zaXRpb24sIE91clNpZGUsIGJhbm5lclJvdywgdGV4dFJvd1N0YXJ0LCB0ZXh0Um93RW5kKVxuICB9XG5cbiAgLypcbiAgICogYmFubmVyUm93IC0gW0ludGVnZXJdIHRoZSBidWZmZXIgcm93IHRoYXQgY29udGFpbnMgb3VyIHNpZGUncyBiYW5uZXIuXG4gICAqIHRleHRSb3dTdGFydCAtIFtJbnRlZ2VyXSBmaXJzdCBidWZmZXIgcm93IHRoYXQgY29udGFpbiB0aGlzIHNpZGUncyB0ZXh0LlxuICAgKiB0ZXh0Um93RW5kIC0gW0ludGVnZXJdIGZpcnN0IGJ1ZmZlciByb3cgYmV5b25kIHRoZSBleHRlbmQgb2YgdGhpcyBzaWRlJ3MgdGV4dC5cbiAgICovXG4gIHZpc2l0QmFzZVNpZGUgKGJhbm5lclJvdywgdGV4dFJvd1N0YXJ0LCB0ZXh0Um93RW5kKSB7XG4gICAgdGhpcy5iYXNlU2lkZSA9IHRoaXMubWFya1NpZGUoQkFTRSwgQmFzZVNpZGUsIGJhbm5lclJvdywgdGV4dFJvd1N0YXJ0LCB0ZXh0Um93RW5kKVxuICB9XG5cbiAgLypcbiAgICogc2VwUm93U3RhcnQgLSBbSW50ZWdlcl0gYnVmZmVyIHJvdyB0aGF0IGNvbnRhaW5zIHRoZSBcIj09PT09PT1cIiBzZXBhcmF0b3IuXG4gICAqIHNlcFJvd0VuZCAtIFtJbnRlZ2VyXSB0aGUgYnVmZmVyIHJvdyBhZnRlciB0aGUgc2VwYXJhdG9yLlxuICAgKi9cbiAgdmlzaXRTZXBhcmF0b3IgKHNlcFJvd1N0YXJ0LCBzZXBSb3dFbmQpIHtcbiAgICBjb25zdCBtYXJrZXIgPSB0aGlzLmVkaXRvci5tYXJrQnVmZmVyUmFuZ2UoW1tzZXBSb3dTdGFydCwgMF0sIFtzZXBSb3dFbmQsIDBdXSwgb3B0aW9ucylcbiAgICB0aGlzLnByZXZpb3VzU2lkZS5mb2xsb3dpbmdNYXJrZXIgPSBtYXJrZXJcblxuICAgIHRoaXMubmF2aWdhdG9yID0gbmV3IE5hdmlnYXRvcihtYXJrZXIpXG4gICAgdGhpcy5wcmV2aW91c1NpZGUgPSB0aGlzLm5hdmlnYXRvclxuICB9XG5cbiAgLypcbiAgICogcG9zaXRpb24gLSBbU3RyaW5nXSBBbHdheXMgQkFTRTsgYWNjZXB0ZWQgZm9yIGNvbnNpc3RlbmN5LlxuICAgKiBiYW5uZXJSb3cgLSBbSW50ZWdlcl0gdGhlIGJ1ZmZlciByb3cgdGhhdCBjb250YWlucyBvdXIgc2lkZSdzIGJhbm5lci5cbiAgICogdGV4dFJvd1N0YXJ0IC0gW0ludGVnZXJdIGZpcnN0IGJ1ZmZlciByb3cgdGhhdCBjb250YWluIHRoaXMgc2lkZSdzIHRleHQuXG4gICAqIHRleHRSb3dFbmQgLSBbSW50ZWdlcl0gZmlyc3QgYnVmZmVyIHJvdyBiZXlvbmQgdGhlIGV4dGVuZCBvZiB0aGlzIHNpZGUncyB0ZXh0LlxuICAgKi9cbiAgdmlzaXRUaGVpclNpZGUgKHBvc2l0aW9uLCBiYW5uZXJSb3csIHRleHRSb3dTdGFydCwgdGV4dFJvd0VuZCkge1xuICAgIHRoaXMudGhlaXJTaWRlID0gdGhpcy5tYXJrU2lkZShwb3NpdGlvbiwgVGhlaXJTaWRlLCBiYW5uZXJSb3csIHRleHRSb3dTdGFydCwgdGV4dFJvd0VuZClcbiAgfVxuXG4gIG1hcmtTaWRlIChwb3NpdGlvbiwgc2lkZUtsYXNzLCBiYW5uZXJSb3csIHRleHRSb3dTdGFydCwgdGV4dFJvd0VuZCkge1xuICAgIGNvbnN0IGRlc2NyaXB0aW9uID0gdGhpcy5zaWRlRGVzY3JpcHRpb24oYmFubmVyUm93KVxuXG4gICAgY29uc3QgYmFubmVyTWFya2VyID0gdGhpcy5lZGl0b3IubWFya0J1ZmZlclJhbmdlKFtbYmFubmVyUm93LCAwXSwgW2Jhbm5lclJvdyArIDEsIDBdXSwgb3B0aW9ucylcblxuICAgIGlmICh0aGlzLnByZXZpb3VzU2lkZSkge1xuICAgICAgdGhpcy5wcmV2aW91c1NpZGUuZm9sbG93aW5nTWFya2VyID0gYmFubmVyTWFya2VyXG4gICAgfVxuXG4gICAgY29uc3QgdGV4dFJhbmdlID0gW1t0ZXh0Um93U3RhcnQsIDBdLCBbdGV4dFJvd0VuZCwgMF1dXG4gICAgY29uc3QgdGV4dE1hcmtlciA9IHRoaXMuZWRpdG9yLm1hcmtCdWZmZXJSYW5nZSh0ZXh0UmFuZ2UsIG9wdGlvbnMpXG4gICAgY29uc3QgdGV4dCA9IHRoaXMuZWRpdG9yLmdldFRleHRJbkJ1ZmZlclJhbmdlKHRleHRSYW5nZSlcblxuICAgIGNvbnN0IHNpZGUgPSBuZXcgc2lkZUtsYXNzKHRleHQsIGRlc2NyaXB0aW9uLCB0ZXh0TWFya2VyLCBiYW5uZXJNYXJrZXIsIHBvc2l0aW9uKVxuICAgIHRoaXMucHJldmlvdXNTaWRlID0gc2lkZVxuICAgIHJldHVybiBzaWRlXG4gIH1cblxuICAvKlxuICAgKiBQYXJzZSB0aGUgYmFubmVyIGRlc2NyaXB0aW9uIGZvciB0aGUgY3VycmVudCBzaWRlIGZyb20gYSBiYW5uZXIgcm93LlxuICAgKi9cbiAgc2lkZURlc2NyaXB0aW9uIChiYW5uZXJSb3cpIHtcbiAgICByZXR1cm4gdGhpcy5lZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3coYmFubmVyUm93KS5tYXRjaCgvXls8fD5dezd9ICguKikkLylbMV1cbiAgfVxuXG4gIGNvbmZsaWN0ICgpIHtcbiAgICB0aGlzLnByZXZpb3VzU2lkZS5mb2xsb3dpbmdNYXJrZXIgPSB0aGlzLnByZXZpb3VzU2lkZS5yZWZCYW5uZXJNYXJrZXJcblxuICAgIHJldHVybiBuZXcgQ29uZmxpY3QodGhpcy5vdXJTaWRlLCB0aGlzLnRoZWlyU2lkZSwgdGhpcy5iYXNlU2lkZSwgdGhpcy5uYXZpZ2F0b3IsIHRoaXMubWVyZ2UpXG4gIH1cblxufVxuXG4vKlxuICogUHJpdmF0ZTogcGFyc2VDb25mbGljdCBkaXNjb3ZlcnMgZ2l0IGNvbmZsaWN0IG1hcmtlcnMgaW4gYSBjb3JwdXMgb2YgdGV4dCBhbmQgY29uc3RydWN0cyBDb25mbGljdFxuICogaW5zdGFuY2VzIHRoYXQgbWFyayB0aGUgY29ycmVjdCBsaW5lcy5cbiAqXG4gKiBSZXR1cm5zIFtJbnRlZ2VyXSB0aGUgYnVmZmVyIHJvdyBhZnRlciB0aGUgZmluYWwgPDw8PDw8IGJvdW5kYXJ5LlxuICovXG5jb25zdCBwYXJzZUNvbmZsaWN0ID0gZnVuY3Rpb24gKG1lcmdlLCBlZGl0b3IsIHJvdywgdmlzaXRvcikge1xuICBsZXQgbGFzdEJvdW5kYXJ5ID0gbnVsbFxuXG4gIC8vIFZpc2l0IGEgc2lkZSB0aGF0IGJlZ2lucyB3aXRoIGEgYmFubmVyIGFuZCBkZXNjcmlwdGlvbiBhcyBpdHMgZmlyc3QgbGluZS5cbiAgY29uc3QgdmlzaXRIZWFkZXJTaWRlID0gKHBvc2l0aW9uLCB2aXNpdE1ldGhvZCkgPT4ge1xuICAgIGNvbnN0IHNpZGVSb3dTdGFydCA9IHJvd1xuICAgIHJvdyArPSAxXG4gICAgYWR2YW5jZVRvQm91bmRhcnkoJ3w9JylcbiAgICBjb25zdCBzaWRlUm93RW5kID0gcm93XG5cbiAgICB2aXNpdG9yW3Zpc2l0TWV0aG9kXShwb3NpdGlvbiwgc2lkZVJvd1N0YXJ0LCBzaWRlUm93U3RhcnQgKyAxLCBzaWRlUm93RW5kKVxuICB9XG5cbiAgLy8gVmlzaXQgdGhlIGJhc2Ugc2lkZSBmcm9tIGRpZmYzIG91dHB1dCwgaWYgb25lIGlzIHByZXNlbnQsIHRoZW4gdmlzaXQgdGhlIHNlcGFyYXRvci5cbiAgY29uc3QgdmlzaXRCYXNlQW5kU2VwYXJhdG9yID0gKCkgPT4ge1xuICAgIGlmIChsYXN0Qm91bmRhcnkgPT09ICd8Jykge1xuICAgICAgdmlzaXRCYXNlU2lkZSgpXG4gICAgfVxuXG4gICAgdmlzaXRTZXBhcmF0b3IoKVxuICB9XG5cbiAgLy8gVmlzaXQgYSBiYXNlIHNpZGUgZnJvbSBkaWZmMyBvdXRwdXQuXG4gIGNvbnN0IHZpc2l0QmFzZVNpZGUgPSAoKSA9PiB7XG4gICAgY29uc3Qgc2lkZVJvd1N0YXJ0ID0gcm93XG4gICAgcm93ICs9IDFcblxuICAgIGxldCBiID0gYWR2YW5jZVRvQm91bmRhcnkoJzw9JylcbiAgICB3aGlsZSAoYiA9PT0gJzwnKSB7XG4gICAgICAvLyBFbWJlZGRlZCByZWN1cnNpdmUgY29uZmxpY3Qgd2l0aGluIGEgYmFzZSBzaWRlLCBjYXVzZWQgYnkgYSBjcmlzcy1jcm9zcyBtZXJnZS5cbiAgICAgIC8vIEFkdmFuY2UgYmV5b25kIGl0IHdpdGhvdXQgbWFya2luZyBhbnl0aGluZy5cbiAgICAgIHJvdyA9IHBhcnNlQ29uZmxpY3QobWVyZ2UsIGVkaXRvciwgcm93LCBuZXcgTm9vcFZpc2l0b3IoKSlcbiAgICAgIGIgPSBhZHZhbmNlVG9Cb3VuZGFyeSgnPD0nKVxuICAgIH1cblxuICAgIGNvbnN0IHNpZGVSb3dFbmQgPSByb3dcblxuICAgIHZpc2l0b3IudmlzaXRCYXNlU2lkZShzaWRlUm93U3RhcnQsIHNpZGVSb3dTdGFydCArIDEsIHNpZGVSb3dFbmQpXG4gIH1cblxuICAvLyBWaXNpdCBhIFwiPT09PT09PT1cIiBzZXBhcmF0b3IuXG4gIGNvbnN0IHZpc2l0U2VwYXJhdG9yID0gKCkgPT4ge1xuICAgIGNvbnN0IHNlcFJvd1N0YXJ0ID0gcm93XG4gICAgcm93ICs9IDFcbiAgICBjb25zdCBzZXBSb3dFbmQgPSByb3dcblxuICAgIHZpc2l0b3IudmlzaXRTZXBhcmF0b3Ioc2VwUm93U3RhcnQsIHNlcFJvd0VuZClcbiAgfVxuXG4gIC8vIFZpZGllIGEgc2lkZSB3aXRoIGEgYmFubmVyIGFuZCBkZXNjcmlwdGlvbiBhcyBpdHMgbGFzdCBsaW5lLlxuICBjb25zdCB2aXNpdEZvb3RlclNpZGUgPSAocG9zaXRpb24sIHZpc2l0TWV0aG9kKSA9PiB7XG4gICAgY29uc3Qgc2lkZVJvd1N0YXJ0ID0gcm93XG4gICAgY29uc3QgYiA9IGFkdmFuY2VUb0JvdW5kYXJ5KCc+JylcbiAgICByb3cgKz0gMVxuICAgIHNpZGVSb3dFbmQgPSByb3dcblxuICAgIHZpc2l0b3JbdmlzaXRNZXRob2RdKHBvc2l0aW9uLCBzaWRlUm93RW5kIC0gMSwgc2lkZVJvd1N0YXJ0LCBzaWRlUm93RW5kIC0gMSlcbiAgfVxuXG4gIC8vIERldGVybWluZSBpZiB0aGUgY3VycmVudCByb3cgaXMgYSBzaWRlIGJvdW5kYXJ5LlxuICAvL1xuICAvLyBib3VuZGFyeUtpbmRzIC0gW1N0cmluZ10gYW55IGNvbWJpbmF0aW9uIG9mIDwsIHwsID0sIG9yID4gdG8gbGltaXQgdGhlIGtpbmRzIG9mIGJvdW5kYXJ5XG4gIC8vICAgZGV0ZWN0ZWQuXG4gIC8vXG4gIC8vIFJldHVybnMgdGhlIG1hdGNoaW5nIGJvdW5kYXJ5S2luZHMgY2hhcmFjdGVyLCBvciBgbnVsbGAgaWYgbm9uZSBtYXRjaC5cbiAgY29uc3QgaXNBdEJvdW5kYXJ5ID0gKGJvdW5kYXJ5S2luZHMgPSAnPHw9PicpID0+IHtcbiAgICBjb25zdCBsaW5lID0gZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93KHJvdylcbiAgICBmb3IgKGIgb2YgYm91bmRhcnlLaW5kcykge1xuICAgICAgaWYgKGxpbmUuc3RhcnRzV2l0aChiLnJlcGVhdCg3KSkpIHtcbiAgICAgICAgcmV0dXJuIGJcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGxcbiAgfVxuXG4gIC8vIEluY3JlbWVudCB0aGUgY3VycmVudCByb3cgdW50aWwgdGhlIGN1cnJlbnQgbGluZSBtYXRjaGVzIG9uZSBvZiB0aGUgcHJvdmlkZWQgYm91bmRhcnkga2luZHMsXG4gIC8vIG9yIHVudGlsIHRoZXJlIGFyZSBubyBtb3JlIGxpbmVzIGluIHRoZSBlZGl0b3IuXG4gIC8vXG4gIC8vIGJvdW5kYXJ5S2luZHMgLSBbU3RyaW5nXSBhbnkgY29tYmluYXRpb24gb2YgPCwgfCwgPSwgb3IgPiB0byBsaW1pdCB0aGUga2luZHMgb2YgYm91bmRhcmllc1xuICAvLyAgIHRoYXQgaGFsdCB0aGUgcHJvZ3Jlc3Npb24uXG4gIC8vXG4gIC8vIFJldHVybnMgdGhlIG1hdGNoaW5nIGJvdW5kYXJ5S2luZHMgY2hhcmFjdGVyLCBvciAnbnVsbCcgaWYgdGhlcmUgYXJlIG5vIG1hdGNoZXMgdG8gdGhlIGVuZCBvZlxuICAvLyB0aGUgZWRpdG9yLlxuICBjb25zdCBhZHZhbmNlVG9Cb3VuZGFyeSA9IChib3VuZGFyeUtpbmRzID0gJzx8PT4nKSA9PiB7XG4gICAgbGV0IGIgPSBpc0F0Qm91bmRhcnkoYm91bmRhcnlLaW5kcylcbiAgICB3aGlsZSAoYiA9PT0gbnVsbCkge1xuICAgICAgcm93ICs9IDFcbiAgICAgIGlmIChyb3cgPiBlZGl0b3IuZ2V0TGFzdEJ1ZmZlclJvdygpKSB7XG4gICAgICAgIGNvbnN0IGUgPSBuZXcgRXJyb3IoJ1VudGVybWluYXRlZCBjb25mbGljdCBzaWRlJylcbiAgICAgICAgZS5wYXJzZXJTdGF0ZSA9IHRydWVcbiAgICAgICAgdGhyb3cgZVxuICAgICAgfVxuICAgICAgYiA9IGlzQXRCb3VuZGFyeShib3VuZGFyeUtpbmRzKVxuICAgIH1cblxuICAgIGxhc3RCb3VuZGFyeSA9IGJcbiAgICByZXR1cm4gYlxuICB9XG5cbiAgaWYgKCFtZXJnZS5pc1JlYmFzZSkge1xuICAgIHZpc2l0SGVhZGVyU2lkZShUT1AsICd2aXNpdE91clNpZGUnKVxuICAgIHZpc2l0QmFzZUFuZFNlcGFyYXRvcigpXG4gICAgdmlzaXRGb290ZXJTaWRlKEJPVFRPTSwgJ3Zpc2l0VGhlaXJTaWRlJylcbiAgfSBlbHNlIHtcbiAgICB2aXNpdEhlYWRlclNpZGUoVE9QLCAndmlzaXRUaGVpclNpZGUnKVxuICAgIHZpc2l0QmFzZUFuZFNlcGFyYXRvcigpXG4gICAgdmlzaXRGb290ZXJTaWRlKEJPVFRPTSwgJ3Zpc2l0T3VyU2lkZScpXG4gIH1cblxuICByZXR1cm4gcm93XG59XG4iXX0=