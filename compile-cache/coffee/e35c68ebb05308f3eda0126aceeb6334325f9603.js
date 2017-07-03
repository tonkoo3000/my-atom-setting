(function() {
  var $, GitTimeplotPopup, RevisionView, View, moment, ref,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  moment = require('moment');

  ref = require("atom-space-pen-views"), $ = ref.$, View = ref.View;

  RevisionView = require('./git-revision-view');

  module.exports = GitTimeplotPopup = (function(superClass) {
    extend(GitTimeplotPopup, superClass);

    function GitTimeplotPopup() {
      this._onShowRevision = bind(this._onShowRevision, this);
      this._onMouseLeave = bind(this._onMouseLeave, this);
      this._onMouseEnter = bind(this._onMouseEnter, this);
      this.isMouseInPopup = bind(this.isMouseInPopup, this);
      this.remove = bind(this.remove, this);
      this.hide = bind(this.hide, this);
      return GitTimeplotPopup.__super__.constructor.apply(this, arguments);
    }

    GitTimeplotPopup.content = function(commitData, editor, start, end) {
      var dateFormat;
      dateFormat = "MMM DD YYYY ha";
      return this.div({
        "class": "select-list popover-list git-timemachine-popup"
      }, (function(_this) {
        return function() {
          _this.h5("There were " + commitData.length + " commits between");
          _this.h6((start.format(dateFormat)) + " and " + (end.format(dateFormat)));
          return _this.ul(function() {
            var authorDate, commit, i, len, linesAdded, linesDeleted, results;
            results = [];
            for (i = 0, len = commitData.length; i < len; i++) {
              commit = commitData[i];
              authorDate = moment.unix(commit.authorDate);
              linesAdded = commit.linesAdded || 0;
              linesDeleted = commit.linesDeleted || 0;
              results.push(_this.li({
                "data-rev": commit.hash,
                click: '_onShowRevision'
              }, function() {
                return _this.div({
                  "class": "commit"
                }, function() {
                  _this.div({
                    "class": "header"
                  }, function() {
                    _this.div("" + (authorDate.format(dateFormat)));
                    _this.div("" + commit.hash);
                    return _this.div(function() {
                      _this.span({
                        "class": 'added-count'
                      }, "+" + linesAdded + " ");
                      return _this.span({
                        "class": 'removed-count'
                      }, "-" + linesDeleted + " ");
                    });
                  });
                  _this.div(function() {
                    return _this.strong("" + commit.message);
                  });
                  return _this.div("Authored by " + commit.authorName + " " + (authorDate.fromNow()));
                });
              }));
            }
            return results;
          });
        };
      })(this));
    };

    GitTimeplotPopup.prototype.initialize = function(commitData, editor1) {
      this.editor = editor1;
      this.file = this.editor.getPath();
      this.appendTo(atom.views.getView(atom.workspace));
      this.mouseenter(this._onMouseEnter);
      return this.mouseleave(this._onMouseLeave);
    };

    GitTimeplotPopup.prototype.hide = function() {
      this._mouseInPopup = false;
      return GitTimeplotPopup.__super__.hide.apply(this, arguments);
    };

    GitTimeplotPopup.prototype.remove = function() {
      if (!this._mouseInPopup) {
        return GitTimeplotPopup.__super__.remove.apply(this, arguments);
      }
    };

    GitTimeplotPopup.prototype.isMouseInPopup = function() {
      return this._mouseInPopup === true;
    };

    GitTimeplotPopup.prototype._onMouseEnter = function(evt) {
      this._mouseInPopup = true;
    };

    GitTimeplotPopup.prototype._onMouseLeave = function(evt) {
      this.hide();
    };

    GitTimeplotPopup.prototype._onShowRevision = function(evt) {
      var revHash;
      revHash = $(evt.target).closest('li').data('rev');
      return RevisionView.showRevision(this.editor, revHash);
    };

    return GitTimeplotPopup;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvdG95b2tpLy5hdG9tL3BhY2thZ2VzL2dpdC10aW1lLW1hY2hpbmUvbGliL2dpdC10aW1lcGxvdC1wb3B1cC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLG9EQUFBO0lBQUE7Ozs7RUFBQSxNQUFBLEdBQVMsT0FBQSxDQUFRLFFBQVI7O0VBQ1QsTUFBWSxPQUFBLENBQVEsc0JBQVIsQ0FBWixFQUFDLFNBQUQsRUFBSTs7RUFFSixZQUFBLEdBQWUsT0FBQSxDQUFRLHFCQUFSOztFQUdmLE1BQU0sQ0FBQyxPQUFQLEdBQXVCOzs7Ozs7Ozs7Ozs7O0lBRXJCLGdCQUFDLENBQUEsT0FBRCxHQUFXLFNBQUMsVUFBRCxFQUFhLE1BQWIsRUFBcUIsS0FBckIsRUFBNEIsR0FBNUI7QUFDVCxVQUFBO01BQUEsVUFBQSxHQUFhO2FBQ2IsSUFBQyxDQUFBLEdBQUQsQ0FBSztRQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sZ0RBQVA7T0FBTCxFQUE4RCxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7VUFDNUQsS0FBQyxDQUFBLEVBQUQsQ0FBSSxhQUFBLEdBQWMsVUFBVSxDQUFDLE1BQXpCLEdBQWdDLGtCQUFwQztVQUNBLEtBQUMsQ0FBQSxFQUFELENBQU0sQ0FBQyxLQUFLLENBQUMsTUFBTixDQUFhLFVBQWIsQ0FBRCxDQUFBLEdBQTBCLE9BQTFCLEdBQWdDLENBQUMsR0FBRyxDQUFDLE1BQUosQ0FBVyxVQUFYLENBQUQsQ0FBdEM7aUJBQ0EsS0FBQyxDQUFBLEVBQUQsQ0FBSSxTQUFBO0FBQ0YsZ0JBQUE7QUFBQTtpQkFBQSw0Q0FBQTs7Y0FDRSxVQUFBLEdBQWEsTUFBTSxDQUFDLElBQVAsQ0FBWSxNQUFNLENBQUMsVUFBbkI7Y0FDYixVQUFBLEdBQWEsTUFBTSxDQUFDLFVBQVAsSUFBcUI7Y0FDbEMsWUFBQSxHQUFlLE1BQU0sQ0FBQyxZQUFQLElBQXVCOzJCQUN0QyxLQUFDLENBQUEsRUFBRCxDQUFJO2dCQUFBLFVBQUEsRUFBWSxNQUFNLENBQUMsSUFBbkI7Z0JBQXlCLEtBQUEsRUFBTyxpQkFBaEM7ZUFBSixFQUF1RCxTQUFBO3VCQUNyRCxLQUFDLENBQUEsR0FBRCxDQUFLO2tCQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sUUFBUDtpQkFBTCxFQUFzQixTQUFBO2tCQUNwQixLQUFDLENBQUEsR0FBRCxDQUFLO29CQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sUUFBUDttQkFBTCxFQUFzQixTQUFBO29CQUNwQixLQUFDLENBQUEsR0FBRCxDQUFLLEVBQUEsR0FBRSxDQUFDLFVBQVUsQ0FBQyxNQUFYLENBQWtCLFVBQWxCLENBQUQsQ0FBUDtvQkFDQSxLQUFDLENBQUEsR0FBRCxDQUFLLEVBQUEsR0FBRyxNQUFNLENBQUMsSUFBZjsyQkFDQSxLQUFDLENBQUEsR0FBRCxDQUFLLFNBQUE7c0JBQ0gsS0FBQyxDQUFBLElBQUQsQ0FBTTt3QkFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLGFBQVA7dUJBQU4sRUFBNEIsR0FBQSxHQUFJLFVBQUosR0FBZSxHQUEzQzs2QkFDQSxLQUFDLENBQUEsSUFBRCxDQUFNO3dCQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sZUFBUDt1QkFBTixFQUE4QixHQUFBLEdBQUksWUFBSixHQUFpQixHQUEvQztvQkFGRyxDQUFMO2tCQUhvQixDQUF0QjtrQkFPQSxLQUFDLENBQUEsR0FBRCxDQUFLLFNBQUE7MkJBQ0gsS0FBQyxDQUFBLE1BQUQsQ0FBUSxFQUFBLEdBQUcsTUFBTSxDQUFDLE9BQWxCO2tCQURHLENBQUw7eUJBR0EsS0FBQyxDQUFBLEdBQUQsQ0FBSyxjQUFBLEdBQWUsTUFBTSxDQUFDLFVBQXRCLEdBQWlDLEdBQWpDLEdBQW1DLENBQUMsVUFBVSxDQUFDLE9BQVgsQ0FBQSxDQUFELENBQXhDO2dCQVhvQixDQUF0QjtjQURxRCxDQUF2RDtBQUpGOztVQURFLENBQUo7UUFINEQ7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTlEO0lBRlM7OytCQXlCWCxVQUFBLEdBQVksU0FBQyxVQUFELEVBQWEsT0FBYjtNQUFhLElBQUMsQ0FBQSxTQUFEO01BQ3ZCLElBQUMsQ0FBQSxJQUFELEdBQVEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxPQUFSLENBQUE7TUFDUixJQUFDLENBQUEsUUFBRCxDQUFVLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBWCxDQUFtQixJQUFJLENBQUMsU0FBeEIsQ0FBVjtNQUNBLElBQUMsQ0FBQSxVQUFELENBQVksSUFBQyxDQUFBLGFBQWI7YUFDQSxJQUFDLENBQUEsVUFBRCxDQUFZLElBQUMsQ0FBQSxhQUFiO0lBSlU7OytCQU9aLElBQUEsR0FBTSxTQUFBO01BQ0osSUFBQyxDQUFBLGFBQUQsR0FBaUI7YUFDakIsNENBQUEsU0FBQTtJQUZJOzsrQkFLTixNQUFBLEdBQVEsU0FBQTtNQUNOLElBQUEsQ0FBTyxJQUFDLENBQUEsYUFBUjtlQUNFLDhDQUFBLFNBQUEsRUFERjs7SUFETTs7K0JBS1IsY0FBQSxHQUFnQixTQUFBO0FBQ2QsYUFBTyxJQUFDLENBQUEsYUFBRCxLQUFrQjtJQURYOzsrQkFJaEIsYUFBQSxHQUFlLFNBQUMsR0FBRDtNQUViLElBQUMsQ0FBQSxhQUFELEdBQWlCO0lBRko7OytCQU1mLGFBQUEsR0FBZSxTQUFDLEdBQUQ7TUFDYixJQUFDLENBQUEsSUFBRCxDQUFBO0lBRGE7OytCQUtmLGVBQUEsR0FBaUIsU0FBQyxHQUFEO0FBQ2YsVUFBQTtNQUFBLE9BQUEsR0FBVSxDQUFBLENBQUUsR0FBRyxDQUFDLE1BQU4sQ0FBYSxDQUFDLE9BQWQsQ0FBc0IsSUFBdEIsQ0FBMkIsQ0FBQyxJQUE1QixDQUFpQyxLQUFqQzthQUNWLFlBQVksQ0FBQyxZQUFiLENBQTBCLElBQUMsQ0FBQSxNQUEzQixFQUFtQyxPQUFuQztJQUZlOzs7O0tBM0Q2QjtBQU5oRCIsInNvdXJjZXNDb250ZW50IjpbIm1vbWVudCA9IHJlcXVpcmUgJ21vbWVudCdcbnskLCBWaWV3fSA9IHJlcXVpcmUgXCJhdG9tLXNwYWNlLXBlbi12aWV3c1wiXG5cblJldmlzaW9uVmlldyA9IHJlcXVpcmUgJy4vZ2l0LXJldmlzaW9uLXZpZXcnXG5cblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBHaXRUaW1lcGxvdFBvcHVwIGV4dGVuZHMgVmlld1xuXG4gIEBjb250ZW50ID0gKGNvbW1pdERhdGEsIGVkaXRvciwgc3RhcnQsIGVuZCkgLT5cbiAgICBkYXRlRm9ybWF0ID0gXCJNTU0gREQgWVlZWSBoYVwiXG4gICAgQGRpdiBjbGFzczogXCJzZWxlY3QtbGlzdCBwb3BvdmVyLWxpc3QgZ2l0LXRpbWVtYWNoaW5lLXBvcHVwXCIsID0+XG4gICAgICBAaDUgXCJUaGVyZSB3ZXJlICN7Y29tbWl0RGF0YS5sZW5ndGh9IGNvbW1pdHMgYmV0d2VlblwiXG4gICAgICBAaDYgXCIje3N0YXJ0LmZvcm1hdChkYXRlRm9ybWF0KX0gYW5kICN7ZW5kLmZvcm1hdChkYXRlRm9ybWF0KX1cIlxuICAgICAgQHVsID0+XG4gICAgICAgIGZvciBjb21taXQgaW4gY29tbWl0RGF0YVxuICAgICAgICAgIGF1dGhvckRhdGUgPSBtb21lbnQudW5peChjb21taXQuYXV0aG9yRGF0ZSlcbiAgICAgICAgICBsaW5lc0FkZGVkID0gY29tbWl0LmxpbmVzQWRkZWQgfHwgMFxuICAgICAgICAgIGxpbmVzRGVsZXRlZCA9IGNvbW1pdC5saW5lc0RlbGV0ZWQgfHwgMFxuICAgICAgICAgIEBsaSBcImRhdGEtcmV2XCI6IGNvbW1pdC5oYXNoLCBjbGljazogJ19vblNob3dSZXZpc2lvbicsID0+XG4gICAgICAgICAgICBAZGl2IGNsYXNzOiBcImNvbW1pdFwiLCA9PlxuICAgICAgICAgICAgICBAZGl2IGNsYXNzOiBcImhlYWRlclwiLCA9PlxuICAgICAgICAgICAgICAgIEBkaXYgXCIje2F1dGhvckRhdGUuZm9ybWF0KGRhdGVGb3JtYXQpfVwiXG4gICAgICAgICAgICAgICAgQGRpdiBcIiN7Y29tbWl0Lmhhc2h9XCJcbiAgICAgICAgICAgICAgICBAZGl2ID0+XG4gICAgICAgICAgICAgICAgICBAc3BhbiBjbGFzczogJ2FkZGVkLWNvdW50JywgXCIrI3tsaW5lc0FkZGVkfSBcIlxuICAgICAgICAgICAgICAgICAgQHNwYW4gY2xhc3M6ICdyZW1vdmVkLWNvdW50JywgXCItI3tsaW5lc0RlbGV0ZWR9IFwiXG5cbiAgICAgICAgICAgICAgQGRpdiA9PlxuICAgICAgICAgICAgICAgIEBzdHJvbmcgXCIje2NvbW1pdC5tZXNzYWdlfVwiXG5cbiAgICAgICAgICAgICAgQGRpdiBcIkF1dGhvcmVkIGJ5ICN7Y29tbWl0LmF1dGhvck5hbWV9ICN7YXV0aG9yRGF0ZS5mcm9tTm93KCl9XCJcblxuXG4gIGluaXRpYWxpemU6IChjb21taXREYXRhLCBAZWRpdG9yKSAtPlxuICAgIEBmaWxlID0gQGVkaXRvci5nZXRQYXRoKClcbiAgICBAYXBwZW5kVG8gYXRvbS52aWV3cy5nZXRWaWV3IGF0b20ud29ya3NwYWNlXG4gICAgQG1vdXNlZW50ZXIgQF9vbk1vdXNlRW50ZXJcbiAgICBAbW91c2VsZWF2ZSBAX29uTW91c2VMZWF2ZVxuXG4gICAgXG4gIGhpZGU6ICgpID0+XG4gICAgQF9tb3VzZUluUG9wdXAgPSBmYWxzZVxuICAgIHN1cGVyXG5cblxuICByZW1vdmU6ICgpID0+XG4gICAgdW5sZXNzIEBfbW91c2VJblBvcHVwXG4gICAgICBzdXBlclxuXG5cbiAgaXNNb3VzZUluUG9wdXA6ICgpID0+XG4gICAgcmV0dXJuIEBfbW91c2VJblBvcHVwID09IHRydWVcblxuXG4gIF9vbk1vdXNlRW50ZXI6IChldnQpID0+XG4gICAgIyBjb25zb2xlLmxvZyAnbW91c2UgaW4gcG9wdXAnXG4gICAgQF9tb3VzZUluUG9wdXAgPSB0cnVlXG4gICAgcmV0dXJuXG5cblxuICBfb25Nb3VzZUxlYXZlOiAoZXZ0KSA9PlxuICAgIEBoaWRlKClcbiAgICByZXR1cm5cblxuXG4gIF9vblNob3dSZXZpc2lvbjogKGV2dCkgPT5cbiAgICByZXZIYXNoID0gJChldnQudGFyZ2V0KS5jbG9zZXN0KCdsaScpLmRhdGEoJ3JldicpXG4gICAgUmV2aXNpb25WaWV3LnNob3dSZXZpc2lvbihAZWRpdG9yLCByZXZIYXNoKVxuXG4iXX0=
