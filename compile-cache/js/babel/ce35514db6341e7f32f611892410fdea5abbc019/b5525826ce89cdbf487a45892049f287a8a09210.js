Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _atom = require('atom');

var _blameGutterView = require('./blame-gutter-view');

var _blameGutterView2 = _interopRequireDefault(_blameGutterView);

"use babel";

exports['default'] = {
  gitBlameMeView: null,
  modalPanel: null,
  subscriptions: null,

  config: {
    gutterFormat: {
      title: 'Format (gutter)',
      description: 'Placeholders: `{hash}`, `{date}` and `{author}.`',
      type: 'string',
      'default': '{hash} {date} {author}'
    },
    dateFormat: {
      title: 'Format (date)',
      description: ['Placeholders: `YYYY` (year), `MM` (month), `DD` (day), `HH` (hours), `mm` (minutes).', 'See [momentjs documentation](http://momentjs.com/docs/#/parsing/string-format/) for mor information.'].join('<br>'),
      type: 'string',
      'default': 'YYYY-MM-DD'
    },
    defaultWidth: {
      title: 'Default width (px)',
      type: 'integer',
      'default': 250,
      minimum: 50,
      maximum: 500
    }
  },

  activate: function activate() {
    var _this = this;

    var state = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    this.state = state;
    this.gutters = new Map();
    this.disposables = new _atom.CompositeDisposable();

    this.disposables.add(atom.commands.add('atom-workspace', {
      'blame:toggle': function blameToggle() {
        return _this.toggleBlameGutter();
      }
    }));
  },

  toggleBlameGutter: function toggleBlameGutter() {

    var editor = atom.workspace.getActiveTextEditor();
    if (!editor) {
      return;
    }

    var gutter = this.gutters.get(editor);
    if (gutter) {
      gutter.toggleVisible();
    } else {
      gutter = new _blameGutterView2['default'](this.state, editor);
      this.disposables.add(gutter);
      this.gutters.set(editor, gutter);
    }
  },

  deactivate: function deactivate() {
    this.disposables.dispose();
  },

  serialize: function serialize() {
    return this.state;
  }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3RveW9raS8uYXRvbS9wYWNrYWdlcy9ibGFtZS9saWIvaW5pdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7b0JBRW9DLE1BQU07OytCQUNkLHFCQUFxQjs7OztBQUhqRCxXQUFXLENBQUE7O3FCQUtJO0FBQ2IsZ0JBQWMsRUFBRSxJQUFJO0FBQ3BCLFlBQVUsRUFBRSxJQUFJO0FBQ2hCLGVBQWEsRUFBRSxJQUFJOztBQUVuQixRQUFNLEVBQUU7QUFDTixnQkFBWSxFQUFFO0FBQ1osV0FBSyxFQUFFLGlCQUFpQjtBQUN4QixpQkFBVyxFQUFFLGtEQUFrRDtBQUMvRCxVQUFJLEVBQUUsUUFBUTtBQUNkLGlCQUFTLHdCQUF3QjtLQUNsQztBQUNELGNBQVUsRUFBRTtBQUNWLFdBQUssRUFBRSxlQUFlO0FBQ3RCLGlCQUFXLEVBQUUsQ0FDWCxzRkFBc0YsRUFDdEYsc0dBQXNHLENBQ3ZHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztBQUNkLFVBQUksRUFBRSxRQUFRO0FBQ2QsaUJBQVMsWUFBWTtLQUN0QjtBQUNELGdCQUFZLEVBQUU7QUFDWixXQUFLLEVBQUUsb0JBQW9CO0FBQzNCLFVBQUksRUFBRSxTQUFTO0FBQ2YsaUJBQVMsR0FBRztBQUNaLGFBQU8sRUFBRSxFQUFFO0FBQ1gsYUFBTyxFQUFFLEdBQUc7S0FDYjtHQUNGOztBQUVELFVBQVEsRUFBQSxvQkFBYTs7O1FBQVosS0FBSyx5REFBRyxFQUFFOztBQUNqQixRQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQTtBQUNsQixRQUFJLENBQUMsT0FBTyxHQUFHLElBQUksR0FBRyxFQUFFLENBQUE7QUFDeEIsUUFBSSxDQUFDLFdBQVcsR0FBRywrQkFBeUIsQ0FBQTs7QUFFNUMsUUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUU7QUFDdkQsb0JBQWMsRUFBRTtlQUFNLE1BQUssaUJBQWlCLEVBQUU7T0FBQTtLQUMvQyxDQUFDLENBQUMsQ0FBQTtHQUNKOztBQUVELG1CQUFpQixFQUFBLDZCQUFHOztBQUVsQixRQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFtQixFQUFFLENBQUE7QUFDbkQsUUFBSSxDQUFDLE1BQU0sRUFBRTtBQUFFLGFBQU07S0FBRTs7QUFFdkIsUUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUE7QUFDckMsUUFBSSxNQUFNLEVBQUU7QUFDVixZQUFNLENBQUMsYUFBYSxFQUFFLENBQUE7S0FDdkIsTUFBTTtBQUNMLFlBQU0sR0FBRyxpQ0FBb0IsSUFBSSxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQTtBQUNoRCxVQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQTtBQUM1QixVQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUE7S0FDakM7R0FDRjs7QUFFRCxZQUFVLEVBQUEsc0JBQUc7QUFDWCxRQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFBO0dBQzNCOztBQUVELFdBQVMsRUFBQSxxQkFBRztBQUNWLFdBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQTtHQUNsQjtDQUNGIiwiZmlsZSI6Ii9ob21lL3RveW9raS8uYXRvbS9wYWNrYWdlcy9ibGFtZS9saWIvaW5pdC5qcyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIGJhYmVsXCJcblxuaW1wb3J0IHsgQ29tcG9zaXRlRGlzcG9zYWJsZSB9IGZyb20gJ2F0b20nXG5pbXBvcnQgQmxhbWVHdXR0ZXJWaWV3IGZyb20gJy4vYmxhbWUtZ3V0dGVyLXZpZXcnXG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgZ2l0QmxhbWVNZVZpZXc6IG51bGwsXG4gIG1vZGFsUGFuZWw6IG51bGwsXG4gIHN1YnNjcmlwdGlvbnM6IG51bGwsXG5cbiAgY29uZmlnOiB7XG4gICAgZ3V0dGVyRm9ybWF0OiB7XG4gICAgICB0aXRsZTogJ0Zvcm1hdCAoZ3V0dGVyKScsXG4gICAgICBkZXNjcmlwdGlvbjogJ1BsYWNlaG9sZGVyczogYHtoYXNofWAsIGB7ZGF0ZX1gIGFuZCBge2F1dGhvcn0uYCcsXG4gICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgIGRlZmF1bHQ6ICd7aGFzaH0ge2RhdGV9IHthdXRob3J9J1xuICAgIH0sXG4gICAgZGF0ZUZvcm1hdDoge1xuICAgICAgdGl0bGU6ICdGb3JtYXQgKGRhdGUpJyxcbiAgICAgIGRlc2NyaXB0aW9uOiBbXG4gICAgICAgICdQbGFjZWhvbGRlcnM6IGBZWVlZYCAoeWVhciksIGBNTWAgKG1vbnRoKSwgYEREYCAoZGF5KSwgYEhIYCAoaG91cnMpLCBgbW1gIChtaW51dGVzKS4nLFxuICAgICAgICAnU2VlIFttb21lbnRqcyBkb2N1bWVudGF0aW9uXShodHRwOi8vbW9tZW50anMuY29tL2RvY3MvIy9wYXJzaW5nL3N0cmluZy1mb3JtYXQvKSBmb3IgbW9yIGluZm9ybWF0aW9uLidcbiAgICAgIF0uam9pbignPGJyPicpLFxuICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICBkZWZhdWx0OiAnWVlZWS1NTS1ERCdcbiAgICB9LFxuICAgIGRlZmF1bHRXaWR0aDoge1xuICAgICAgdGl0bGU6ICdEZWZhdWx0IHdpZHRoIChweCknLFxuICAgICAgdHlwZTogJ2ludGVnZXInLFxuICAgICAgZGVmYXVsdDogMjUwLFxuICAgICAgbWluaW11bTogNTAsXG4gICAgICBtYXhpbXVtOiA1MDBcbiAgICB9XG4gIH0sXG5cbiAgYWN0aXZhdGUoc3RhdGUgPSB7fSkge1xuICAgIHRoaXMuc3RhdGUgPSBzdGF0ZVxuICAgIHRoaXMuZ3V0dGVycyA9IG5ldyBNYXAoKVxuICAgIHRoaXMuZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG5cbiAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZChhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS13b3Jrc3BhY2UnLCB7XG4gICAgICAnYmxhbWU6dG9nZ2xlJzogKCkgPT4gdGhpcy50b2dnbGVCbGFtZUd1dHRlcigpXG4gICAgfSkpXG4gIH0sXG5cbiAgdG9nZ2xlQmxhbWVHdXR0ZXIoKSB7XG5cbiAgICBjb25zdCBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICBpZiAoIWVkaXRvcikgeyByZXR1cm4gfVxuXG4gICAgbGV0IGd1dHRlciA9IHRoaXMuZ3V0dGVycy5nZXQoZWRpdG9yKVxuICAgIGlmIChndXR0ZXIpIHtcbiAgICAgIGd1dHRlci50b2dnbGVWaXNpYmxlKClcbiAgICB9IGVsc2Uge1xuICAgICAgZ3V0dGVyID0gbmV3IEJsYW1lR3V0dGVyVmlldyh0aGlzLnN0YXRlLCBlZGl0b3IpXG4gICAgICB0aGlzLmRpc3Bvc2FibGVzLmFkZChndXR0ZXIpXG4gICAgICB0aGlzLmd1dHRlcnMuc2V0KGVkaXRvciwgZ3V0dGVyKVxuICAgIH1cbiAgfSxcblxuICBkZWFjdGl2YXRlKCkge1xuICAgIHRoaXMuZGlzcG9zYWJsZXMuZGlzcG9zZSgpXG4gIH0sXG5cbiAgc2VyaWFsaXplKCkge1xuICAgIHJldHVybiB0aGlzLnN0YXRlXG4gIH1cbn1cbiJdfQ==