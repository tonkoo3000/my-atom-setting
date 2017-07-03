(function() {
  var BaseSide, OurSide, Side, TheirSide,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Side = (function() {
    function Side(originalText, ref, marker, refBannerMarker, position) {
      this.originalText = originalText;
      this.ref = ref;
      this.marker = marker;
      this.refBannerMarker = refBannerMarker;
      this.position = position;
      this.conflict = null;
      this.isDirty = false;
      this.followingMarker = null;
    }

    Side.prototype.resolve = function() {
      return this.conflict.resolveAs(this);
    };

    Side.prototype.wasChosen = function() {
      return this.conflict.resolution === this;
    };

    Side.prototype.lineClass = function() {
      if (this.wasChosen()) {
        return 'conflict-resolved';
      } else if (this.isDirty) {
        return 'conflict-dirty';
      } else {
        return "conflict-" + (this.klass());
      }
    };

    Side.prototype.markers = function() {
      return [this.marker, this.refBannerMarker];
    };

    Side.prototype.toString = function() {
      var chosenMark, dirtyMark, text;
      text = this.originalText.replace(/[\n\r]/, ' ');
      if (text.length > 20) {
        text = text.slice(0, 18) + "...";
      }
      dirtyMark = this.isDirty ? ' dirty' : '';
      chosenMark = this.wasChosen() ? ' chosen' : '';
      return "[" + (this.klass()) + ": " + text + " :" + dirtyMark + chosenMark + "]";
    };

    return Side;

  })();

  OurSide = (function(superClass) {
    extend(OurSide, superClass);

    function OurSide() {
      return OurSide.__super__.constructor.apply(this, arguments);
    }

    OurSide.prototype.site = function() {
      return 1;
    };

    OurSide.prototype.klass = function() {
      return 'ours';
    };

    OurSide.prototype.description = function() {
      return 'our changes';
    };

    OurSide.prototype.eventName = function() {
      return 'merge-conflicts:accept-ours';
    };

    return OurSide;

  })(Side);

  TheirSide = (function(superClass) {
    extend(TheirSide, superClass);

    function TheirSide() {
      return TheirSide.__super__.constructor.apply(this, arguments);
    }

    TheirSide.prototype.site = function() {
      return 2;
    };

    TheirSide.prototype.klass = function() {
      return 'theirs';
    };

    TheirSide.prototype.description = function() {
      return 'their changes';
    };

    TheirSide.prototype.eventName = function() {
      return 'merge-conflicts:accept-theirs';
    };

    return TheirSide;

  })(Side);

  BaseSide = (function(superClass) {
    extend(BaseSide, superClass);

    function BaseSide() {
      return BaseSide.__super__.constructor.apply(this, arguments);
    }

    BaseSide.prototype.site = function() {
      return 3;
    };

    BaseSide.prototype.klass = function() {
      return 'base';
    };

    BaseSide.prototype.description = function() {
      return 'merged base';
    };

    BaseSide.prototype.eventName = function() {
      return 'merge-conflicts:accept-base';
    };

    return BaseSide;

  })(Side);

  module.exports = {
    Side: Side,
    OurSide: OurSide,
    TheirSide: TheirSide,
    BaseSide: BaseSide
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvdG95b2tpLy5hdG9tL3BhY2thZ2VzL21lcmdlLWNvbmZsaWN0cy9saWIvc2lkZS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLGtDQUFBO0lBQUE7OztFQUFNO0lBQ1MsY0FBQyxZQUFELEVBQWdCLEdBQWhCLEVBQXNCLE1BQXRCLEVBQStCLGVBQS9CLEVBQWlELFFBQWpEO01BQUMsSUFBQyxDQUFBLGVBQUQ7TUFBZSxJQUFDLENBQUEsTUFBRDtNQUFNLElBQUMsQ0FBQSxTQUFEO01BQVMsSUFBQyxDQUFBLGtCQUFEO01BQWtCLElBQUMsQ0FBQSxXQUFEO01BQzVELElBQUMsQ0FBQSxRQUFELEdBQVk7TUFDWixJQUFDLENBQUEsT0FBRCxHQUFXO01BQ1gsSUFBQyxDQUFBLGVBQUQsR0FBbUI7SUFIUjs7bUJBS2IsT0FBQSxHQUFTLFNBQUE7YUFBRyxJQUFDLENBQUEsUUFBUSxDQUFDLFNBQVYsQ0FBb0IsSUFBcEI7SUFBSDs7bUJBRVQsU0FBQSxHQUFXLFNBQUE7YUFBRyxJQUFDLENBQUEsUUFBUSxDQUFDLFVBQVYsS0FBd0I7SUFBM0I7O21CQUVYLFNBQUEsR0FBVyxTQUFBO01BQ1QsSUFBRyxJQUFDLENBQUEsU0FBRCxDQUFBLENBQUg7ZUFDRSxvQkFERjtPQUFBLE1BRUssSUFBRyxJQUFDLENBQUEsT0FBSjtlQUNILGlCQURHO09BQUEsTUFBQTtlQUdILFdBQUEsR0FBVyxDQUFDLElBQUMsQ0FBQSxLQUFELENBQUEsQ0FBRCxFQUhSOztJQUhJOzttQkFRWCxPQUFBLEdBQVMsU0FBQTthQUFHLENBQUMsSUFBQyxDQUFBLE1BQUYsRUFBVSxJQUFDLENBQUEsZUFBWDtJQUFIOzttQkFFVCxRQUFBLEdBQVUsU0FBQTtBQUNSLFVBQUE7TUFBQSxJQUFBLEdBQU8sSUFBQyxDQUFBLFlBQVksQ0FBQyxPQUFkLENBQXNCLFFBQXRCLEVBQWdDLEdBQWhDO01BQ1AsSUFBRyxJQUFJLENBQUMsTUFBTCxHQUFjLEVBQWpCO1FBQ0UsSUFBQSxHQUFPLElBQUssYUFBTCxHQUFjLE1BRHZCOztNQUVBLFNBQUEsR0FBZSxJQUFDLENBQUEsT0FBSixHQUFpQixRQUFqQixHQUErQjtNQUMzQyxVQUFBLEdBQWdCLElBQUMsQ0FBQSxTQUFELENBQUEsQ0FBSCxHQUFxQixTQUFyQixHQUFvQzthQUNqRCxHQUFBLEdBQUcsQ0FBQyxJQUFDLENBQUEsS0FBRCxDQUFBLENBQUQsQ0FBSCxHQUFhLElBQWIsR0FBaUIsSUFBakIsR0FBc0IsSUFBdEIsR0FBMEIsU0FBMUIsR0FBc0MsVUFBdEMsR0FBaUQ7SUFOekM7Ozs7OztFQVNOOzs7Ozs7O3NCQUVKLElBQUEsR0FBTSxTQUFBO2FBQUc7SUFBSDs7c0JBRU4sS0FBQSxHQUFPLFNBQUE7YUFBRztJQUFIOztzQkFFUCxXQUFBLEdBQWEsU0FBQTthQUFHO0lBQUg7O3NCQUViLFNBQUEsR0FBVyxTQUFBO2FBQUc7SUFBSDs7OztLQVJTOztFQVVoQjs7Ozs7Ozt3QkFFSixJQUFBLEdBQU0sU0FBQTthQUFHO0lBQUg7O3dCQUVOLEtBQUEsR0FBTyxTQUFBO2FBQUc7SUFBSDs7d0JBRVAsV0FBQSxHQUFhLFNBQUE7YUFBRztJQUFIOzt3QkFFYixTQUFBLEdBQVcsU0FBQTthQUFHO0lBQUg7Ozs7S0FSVzs7RUFVbEI7Ozs7Ozs7dUJBRUosSUFBQSxHQUFNLFNBQUE7YUFBRztJQUFIOzt1QkFFTixLQUFBLEdBQU8sU0FBQTthQUFHO0lBQUg7O3VCQUVQLFdBQUEsR0FBYSxTQUFBO2FBQUc7SUFBSDs7dUJBRWIsU0FBQSxHQUFXLFNBQUE7YUFBRztJQUFIOzs7O0tBUlU7O0VBVXZCLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7SUFBQSxJQUFBLEVBQU0sSUFBTjtJQUNBLE9BQUEsRUFBUyxPQURUO0lBRUEsU0FBQSxFQUFXLFNBRlg7SUFHQSxRQUFBLEVBQVUsUUFIVjs7QUE1REYiLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBTaWRlXG4gIGNvbnN0cnVjdG9yOiAoQG9yaWdpbmFsVGV4dCwgQHJlZiwgQG1hcmtlciwgQHJlZkJhbm5lck1hcmtlciwgQHBvc2l0aW9uKSAtPlxuICAgIEBjb25mbGljdCA9IG51bGxcbiAgICBAaXNEaXJ0eSA9IGZhbHNlXG4gICAgQGZvbGxvd2luZ01hcmtlciA9IG51bGxcblxuICByZXNvbHZlOiAtPiBAY29uZmxpY3QucmVzb2x2ZUFzIHRoaXNcblxuICB3YXNDaG9zZW46IC0+IEBjb25mbGljdC5yZXNvbHV0aW9uIGlzIHRoaXNcblxuICBsaW5lQ2xhc3M6IC0+XG4gICAgaWYgQHdhc0Nob3NlbigpXG4gICAgICAnY29uZmxpY3QtcmVzb2x2ZWQnXG4gICAgZWxzZSBpZiBAaXNEaXJ0eVxuICAgICAgJ2NvbmZsaWN0LWRpcnR5J1xuICAgIGVsc2VcbiAgICAgIFwiY29uZmxpY3QtI3tAa2xhc3MoKX1cIlxuXG4gIG1hcmtlcnM6IC0+IFtAbWFya2VyLCBAcmVmQmFubmVyTWFya2VyXVxuXG4gIHRvU3RyaW5nOiAtPlxuICAgIHRleHQgPSBAb3JpZ2luYWxUZXh0LnJlcGxhY2UoL1tcXG5cXHJdLywgJyAnKVxuICAgIGlmIHRleHQubGVuZ3RoID4gMjBcbiAgICAgIHRleHQgPSB0ZXh0WzAuLjE3XSArIFwiLi4uXCJcbiAgICBkaXJ0eU1hcmsgPSBpZiBAaXNEaXJ0eSB0aGVuICcgZGlydHknIGVsc2UgJydcbiAgICBjaG9zZW5NYXJrID0gaWYgQHdhc0Nob3NlbigpIHRoZW4gJyBjaG9zZW4nIGVsc2UgJydcbiAgICBcIlsje0BrbGFzcygpfTogI3t0ZXh0fSA6I3tkaXJ0eU1hcmt9I3tjaG9zZW5NYXJrfV1cIlxuXG5cbmNsYXNzIE91clNpZGUgZXh0ZW5kcyBTaWRlXG5cbiAgc2l0ZTogLT4gMVxuXG4gIGtsYXNzOiAtPiAnb3VycydcblxuICBkZXNjcmlwdGlvbjogLT4gJ291ciBjaGFuZ2VzJ1xuXG4gIGV2ZW50TmFtZTogLT4gJ21lcmdlLWNvbmZsaWN0czphY2NlcHQtb3VycydcblxuY2xhc3MgVGhlaXJTaWRlIGV4dGVuZHMgU2lkZVxuXG4gIHNpdGU6IC0+IDJcblxuICBrbGFzczogLT4gJ3RoZWlycydcblxuICBkZXNjcmlwdGlvbjogLT4gJ3RoZWlyIGNoYW5nZXMnXG5cbiAgZXZlbnROYW1lOiAtPiAnbWVyZ2UtY29uZmxpY3RzOmFjY2VwdC10aGVpcnMnXG5cbmNsYXNzIEJhc2VTaWRlIGV4dGVuZHMgU2lkZVxuXG4gIHNpdGU6IC0+IDNcblxuICBrbGFzczogLT4gJ2Jhc2UnXG5cbiAgZGVzY3JpcHRpb246IC0+ICdtZXJnZWQgYmFzZSdcblxuICBldmVudE5hbWU6IC0+ICdtZXJnZS1jb25mbGljdHM6YWNjZXB0LWJhc2UnXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgU2lkZTogU2lkZVxuICBPdXJTaWRlOiBPdXJTaWRlXG4gIFRoZWlyU2lkZTogVGhlaXJTaWRlXG4gIEJhc2VTaWRlOiBCYXNlU2lkZVxuIl19
