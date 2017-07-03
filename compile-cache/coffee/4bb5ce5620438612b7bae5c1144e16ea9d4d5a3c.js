(function() {
  var CompositeDisposable;

  CompositeDisposable = require('event-kit').CompositeDisposable;

  module.exports = {
    active: false,
    isActive: function() {
      return this.active;
    },
    activate: function(state) {
      return this.subscriptions = new CompositeDisposable;
    },
    consumeMinimapServiceV1: function(minimap1) {
      this.minimap = minimap1;
      return this.minimap.registerPlugin('minimap-autohide', this);
    },
    deactivate: function() {
      this.minimap.unregisterPlugin('minimap-autohide');
      return this.minimap = null;
    },
    activatePlugin: function() {
      if (this.active) {
        return;
      }
      this.active = true;
      return this.minimapsSubscription = this.minimap.observeMinimaps((function(_this) {
        return function(minimap) {
          var editor, minimapElement;
          minimapElement = atom.views.getView(minimap);
          editor = minimap.getTextEditor();
          return _this.subscriptions.add(editor.onDidChangeScrollTop(function() {
            return _this.handleScroll(minimapElement);
          }));
        };
      })(this));
    },
    handleScroll: function(el) {
      el.classList.add('scrolling');
      if (el.timer) {
        clearTimeout(el.timer);
      }
      return el.timer = setTimeout((function() {
        return el.classList.remove('scrolling');
      }), 1500);
    },
    deactivatePlugin: function() {
      if (!this.active) {
        return;
      }
      this.active = false;
      this.minimapsSubscription.dispose();
      return this.subscriptions.dispose();
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvdG95b2tpLy5hdG9tL3BhY2thZ2VzL21pbmltYXAtYXV0b2hpZGUvbGliL21pbmltYXAtYXV0b2hpZGUuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQyxzQkFBdUIsT0FBQSxDQUFRLFdBQVI7O0VBRXhCLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7SUFBQSxNQUFBLEVBQVEsS0FBUjtJQUVBLFFBQUEsRUFBVSxTQUFBO2FBQUcsSUFBQyxDQUFBO0lBQUosQ0FGVjtJQUlBLFFBQUEsRUFBVSxTQUFDLEtBQUQ7YUFDUixJQUFDLENBQUEsYUFBRCxHQUFpQixJQUFJO0lBRGIsQ0FKVjtJQU9BLHVCQUFBLEVBQXlCLFNBQUMsUUFBRDtNQUFDLElBQUMsQ0FBQSxVQUFEO2FBQ3hCLElBQUMsQ0FBQSxPQUFPLENBQUMsY0FBVCxDQUF3QixrQkFBeEIsRUFBNEMsSUFBNUM7SUFEdUIsQ0FQekI7SUFVQSxVQUFBLEVBQVksU0FBQTtNQUNWLElBQUMsQ0FBQSxPQUFPLENBQUMsZ0JBQVQsQ0FBMEIsa0JBQTFCO2FBQ0EsSUFBQyxDQUFBLE9BQUQsR0FBVztJQUZELENBVlo7SUFjQSxjQUFBLEVBQWdCLFNBQUE7TUFDZCxJQUFVLElBQUMsQ0FBQSxNQUFYO0FBQUEsZUFBQTs7TUFFQSxJQUFDLENBQUEsTUFBRCxHQUFVO2FBRVYsSUFBQyxDQUFBLG9CQUFELEdBQXdCLElBQUMsQ0FBQSxPQUFPLENBQUMsZUFBVCxDQUF5QixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsT0FBRDtBQUMvQyxjQUFBO1VBQUEsY0FBQSxHQUFpQixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQVgsQ0FBbUIsT0FBbkI7VUFDakIsTUFBQSxHQUFRLE9BQU8sQ0FBQyxhQUFSLENBQUE7aUJBQ1IsS0FBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLE1BQU0sQ0FBQyxvQkFBUCxDQUE0QixTQUFBO21CQUM3QyxLQUFDLENBQUEsWUFBRCxDQUFjLGNBQWQ7VUFENkMsQ0FBNUIsQ0FBbkI7UUFIK0M7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXpCO0lBTFYsQ0FkaEI7SUF5QkEsWUFBQSxFQUFjLFNBQUMsRUFBRDtNQUNaLEVBQUUsQ0FBQyxTQUFTLENBQUMsR0FBYixDQUFpQixXQUFqQjtNQUVBLElBQUcsRUFBRSxDQUFDLEtBQU47UUFDRSxZQUFBLENBQWEsRUFBRSxDQUFDLEtBQWhCLEVBREY7O2FBR0EsRUFBRSxDQUFDLEtBQUgsR0FBVyxVQUFBLENBQVcsQ0FBRSxTQUFBO2VBQ3RCLEVBQUUsQ0FBQyxTQUFTLENBQUMsTUFBYixDQUFvQixXQUFwQjtNQURzQixDQUFGLENBQVgsRUFFUixJQUZRO0lBTkMsQ0F6QmQ7SUFtQ0EsZ0JBQUEsRUFBa0IsU0FBQTtNQUNoQixJQUFBLENBQWMsSUFBQyxDQUFBLE1BQWY7QUFBQSxlQUFBOztNQUVBLElBQUMsQ0FBQSxNQUFELEdBQVU7TUFDVixJQUFDLENBQUEsb0JBQW9CLENBQUMsT0FBdEIsQ0FBQTthQUNBLElBQUMsQ0FBQSxhQUFhLENBQUMsT0FBZixDQUFBO0lBTGdCLENBbkNsQjs7QUFIRiIsInNvdXJjZXNDb250ZW50IjpbIntDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2V2ZW50LWtpdCdcblxubW9kdWxlLmV4cG9ydHMgPVxuICBhY3RpdmU6IGZhbHNlXG5cbiAgaXNBY3RpdmU6IC0+IEBhY3RpdmVcblxuICBhY3RpdmF0ZTogKHN0YXRlKSAtPlxuICAgIEBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcblxuICBjb25zdW1lTWluaW1hcFNlcnZpY2VWMTogKEBtaW5pbWFwKSAtPlxuICAgIEBtaW5pbWFwLnJlZ2lzdGVyUGx1Z2luICdtaW5pbWFwLWF1dG9oaWRlJywgdGhpc1xuXG4gIGRlYWN0aXZhdGU6IC0+XG4gICAgQG1pbmltYXAudW5yZWdpc3RlclBsdWdpbiAnbWluaW1hcC1hdXRvaGlkZSdcbiAgICBAbWluaW1hcCA9IG51bGxcblxuICBhY3RpdmF0ZVBsdWdpbjogLT5cbiAgICByZXR1cm4gaWYgQGFjdGl2ZVxuXG4gICAgQGFjdGl2ZSA9IHRydWVcblxuICAgIEBtaW5pbWFwc1N1YnNjcmlwdGlvbiA9IEBtaW5pbWFwLm9ic2VydmVNaW5pbWFwcyAobWluaW1hcCkgPT5cbiAgICAgIG1pbmltYXBFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KG1pbmltYXApXG4gICAgICBlZGl0b3I9IG1pbmltYXAuZ2V0VGV4dEVkaXRvcigpXG4gICAgICBAc3Vic2NyaXB0aW9ucy5hZGQgZWRpdG9yLm9uRGlkQ2hhbmdlU2Nyb2xsVG9wID0+XG4gICAgICAgIEBoYW5kbGVTY3JvbGwgbWluaW1hcEVsZW1lbnRcblxuICBoYW5kbGVTY3JvbGw6IChlbCktPlxuICAgIGVsLmNsYXNzTGlzdC5hZGQoJ3Njcm9sbGluZycpXG5cbiAgICBpZiBlbC50aW1lclxuICAgICAgY2xlYXJUaW1lb3V0IGVsLnRpbWVyXG5cbiAgICBlbC50aW1lciA9IHNldFRpbWVvdXQgKCAtPlxuICAgICAgZWwuY2xhc3NMaXN0LnJlbW92ZSgnc2Nyb2xsaW5nJylcbiAgICApLCAxNTAwXG5cbiAgZGVhY3RpdmF0ZVBsdWdpbjogLT5cbiAgICByZXR1cm4gdW5sZXNzIEBhY3RpdmVcblxuICAgIEBhY3RpdmUgPSBmYWxzZVxuICAgIEBtaW5pbWFwc1N1YnNjcmlwdGlvbi5kaXNwb3NlKClcbiAgICBAc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiJdfQ==
