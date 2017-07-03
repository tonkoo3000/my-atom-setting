Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _gravatar = require('gravatar');

var _gravatar2 = _interopRequireDefault(_gravatar);

var _open = require('open');

var _open2 = _interopRequireDefault(_open);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _atom = require('atom');

var _utilsBlame = require('./utils/blame');

var _utilsBlame2 = _interopRequireDefault(_utilsBlame);

var _utilsGetCommit = require('./utils/get-commit');

var _utilsGetCommit2 = _interopRequireDefault(_utilsGetCommit);

var _utilsGetCommitLink = require('./utils/get-commit-link');

var _utilsGetCommitLink2 = _interopRequireDefault(_utilsGetCommitLink);

var _utilsThrottle = require('./utils/throttle');

var _utilsThrottle2 = _interopRequireDefault(_utilsThrottle);

"use babel";

var BlameGutterView = (function () {
  function BlameGutterView(state, editor) {
    _classCallCheck(this, BlameGutterView);

    this.state = state;
    this.editor = editor;
    this.listeners = {};

    this.state.width = atom.config.get('blame.defaultWidth');
    this.setGutterWidth(this.state.width);

    this.colors = {};
    this.gutter = this.editor.addGutter({ name: 'blame' });
    this.markers = [];

    this.editorElement = atom.views.getView(this.editor);

    this.setVisible(true);
  }

  _createClass(BlameGutterView, [{
    key: 'toggleVisible',
    value: function toggleVisible() {
      this.setVisible(!this.visible);
    }
  }, {
    key: 'setVisible',
    value: function setVisible(visible) {
      var _this = this;

      this.visible = visible;

      if (this.editor.isModified()) {
        this.visible = false;
      }

      if (this.visible) {
        this.update();

        if (!this.disposables) {
          this.disposables = new _atom.CompositeDisposable();
        }
        this.disposables.add(this.editor.onDidSave(function () {
          return _this.update();
        }));

        this.gutter.show();

        this.scrollListener = this.editorElement.onDidChangeScrollTop((0, _utilsThrottle2['default'])(function () {
          return _this.hideTooltips();
        }, 500));
      } else {
        if (this.scrollListener) {
          this.scrollListener.dispose();
        }
        this.gutter.hide();

        if (this.disposables) {
          this.disposables.dispose();
        }
        this.disposables = null;
        this.removeAllMarkers();
      }
    }
  }, {
    key: 'hideTooltips',
    value: function hideTooltips() {
      // Trigger resize event on window to hide tooltips
      window.dispatchEvent(new Event('resize'));
    }
  }, {
    key: 'update',
    value: function update() {
      var _this2 = this;

      (0, _utilsBlame2['default'])(this.editor.getPath(), function (result) {
        if (!_this2.visible) {
          return;
        }

        _this2.removeAllMarkers();

        var lastHash = null;
        var commitCount = 0;

        if (!result) {
          return;
        }

        Object.keys(result).forEach(function (key) {
          var line = result[key];

          var lineStr;
          var hash = line.rev.replace(/\s.*/, '');

          if (lastHash !== hash) {
            lineStr = _this2.formatTooltip(hash, line);
            rowCls = 'blame-' + (commitCount++ % 2 === 0 ? 'even' : 'odd');
          } else {
            lineStr = '';
          }

          lastHash = hash;

          _this2.addMarker(Number(key) - 1, hash, rowCls, lineStr);
        });
      });
    }
  }, {
    key: 'formatTooltip',
    value: function formatTooltip(hash, line) {
      var dateFormat = atom.config.get('blame.dateFormat');
      var dateStr = (0, _moment2['default'])(line.date, 'YYYY-MM-DD HH:mm:ss').format(dateFormat);

      if (this.isCommited(hash)) {
        return atom.config.get('blame.gutterFormat').replace('{hash}', '<span class="hash">' + hash + '</span>').replace('{date}', '<span class="date">' + dateStr + '</span>').replace('{author}', '<span class="author">' + line.author + '</span>');
      }

      return '' + line.author;
    }
  }, {
    key: 'linkClicked',
    value: function linkClicked(hash) {
      (0, _utilsGetCommitLink2['default'])(this.editor.getPath(), hash.replace(/^[\^]/, ''), function (link) {
        if (link) {
          return (0, _open2['default'])(link);
        }
        atom.notifications.addInfo("Unknown url.");
      });
    }
  }, {
    key: 'copyClicked',
    value: function copyClicked(hash) {
      atom.clipboard.write(hash);
    }
  }, {
    key: 'formateDate',
    value: function formateDate(date) {
      date = new Date(date);
      yyyy = date.getFullYear();
      mm = date.getMonth() + 1;
      if (mm < 10) {
        mm = '0' + mm;
      }
      dd = date.getDate();
      if (dd < 10) {
        dd = '0' + dd;
      }

      return yyyy + '-' + mm + '-' + dd;
    }
  }, {
    key: 'addMarker',
    value: function addMarker(lineNo, hash, rowCls, lineStr) {
      item = this.markerInnerDiv(rowCls);

      // no need to create objects and events on blank lines
      if (lineStr.length > 0) {
        if (this.isCommited(hash)) {
          item.appendChild(this.copySpan(hash));
          item.appendChild(this.linkSpan(hash));
        }
        item.appendChild(this.lineSpan(lineStr, hash));

        if (this.isCommited(hash)) {
          this.addTooltip(item, hash);
        }
      }

      item.appendChild(this.resizeHandleDiv());

      marker = this.editor.markBufferRange([[lineNo, 0], [lineNo, 0]]);
      this.editor.decorateMarker(marker, {
        type: 'gutter',
        gutterName: 'blame',
        'class': 'blame-gutter',
        item: item
      });
      this.markers.push(marker);
    }
  }, {
    key: 'markerInnerDiv',
    value: function markerInnerDiv(rowCls) {
      item = document.createElement('div');
      item.classList.add('blame-gutter-inner');
      item.classList.add(rowCls);
      return item;
    }
  }, {
    key: 'resizeHandleDiv',
    value: function resizeHandleDiv() {
      resizeHandle = document.createElement('div');
      resizeHandle.addEventListener('mousedown', this.resizeStarted.bind(this));
      resizeHandle.classList.add('blame-gutter-handle');
      return resizeHandle;
    }
  }, {
    key: 'lineSpan',
    value: function lineSpan(str, hash) {
      span = document.createElement('span');
      span.innerHTML = str;
      return span;
    }
  }, {
    key: 'copySpan',
    value: function copySpan(hash) {
      var _this3 = this;

      return this.iconSpan(hash, 'copy', function () {
        _this3.copyClicked(hash);
      });
    }
  }, {
    key: 'linkSpan',
    value: function linkSpan(hash) {
      var _this4 = this;

      return this.iconSpan(hash, 'link', function () {
        _this4.linkClicked(hash);
      });
    }
  }, {
    key: 'iconSpan',
    value: function iconSpan(hash, key, listener) {
      span = document.createElement('span');
      span.setAttribute('data-hash', hash);
      span.classList.add('icon');
      span.classList.add('icon-' + key);
      span.addEventListener('click', listener);

      return span;
    }
  }, {
    key: 'removeAllMarkers',
    value: function removeAllMarkers() {
      this.markers.forEach(function (marker) {
        return marker.destroy();
      });
      this.markers = [];
    }
  }, {
    key: 'resizeStarted',
    value: function resizeStarted(e) {
      this.bind('mousemove', this.resizeMove);
      this.bind('mouseup', this.resizeStopped);

      this.resizeStartedAtX = e.pageX;
      this.resizeWidth = this.state.width;
    }
  }, {
    key: 'resizeStopped',
    value: function resizeStopped(e) {
      this.unbind('mousemove');
      this.unbind('mouseup');

      e.stopPropagation();
      e.preventDefault();
    }
  }, {
    key: 'bind',
    value: function bind(event, listener) {
      this.unbind(event);
      this.listeners[event] = listener.bind(this);
      document.addEventListener(event, this.listeners[event]);
    }
  }, {
    key: 'unbind',
    value: function unbind(event) {
      if (this.listeners[event]) {
        document.removeEventListener(event, this.listeners[event]);
        this.listeners[event] = false;
      }
    }
  }, {
    key: 'resizeMove',
    value: function resizeMove(e) {
      diff = e.pageX - this.resizeStartedAtX;
      this.setGutterWidth(this.resizeWidth + diff);

      e.stopPropagation();
      e.preventDefault();
    }
  }, {
    key: 'gutterStyle',
    value: function gutterStyle() {
      sheet = document.createElement('style');
      sheet.type = 'text/css';
      sheet.id = 'blame-gutter-style';
      return sheet;
    }
  }, {
    key: 'setGutterWidth',
    value: function setGutterWidth(width) {
      this.state.width = Math.max(50, Math.min(width, 500));

      sheet = document.getElementById('blame-gutter-style');
      if (!sheet) {
        sheet = this.gutterStyle();
        document.head.appendChild(sheet);
      }

      // TODO remove `::shadow` when  Atom 1.3 is stable
      sheet.innerHTML = '\n      atom-text-editor .gutter[gutter-name="blame"],\n      atom-text-editor::shadow .gutter[gutter-name="blame"] {\n        width: ' + this.state.width + 'px\n      }\n    ';
    }
  }, {
    key: 'isCommited',
    value: function isCommited(hash) {
      return !/^[0]+$/.test(hash);
    }
  }, {
    key: 'addTooltip',
    value: function addTooltip(item, hash) {
      var _this5 = this;

      if (!item.getAttribute('data-has-tooltip')) {
        item.setAttribute('data-has-tooltip', true);

        (0, _utilsGetCommit2['default'])(this.editor.getPath(), hash.replace(/^[\^]/, ''), function (msg) {
          if (!_this5.visible) {
            return;
          }

          avatar = _gravatar2['default'].url(msg.email, { s: 80 });
          _this5.disposables.add(atom.tooltips.add(item, {
            title: '\n            <div class="blame-tooltip">\n              <div class="head">\n                <img class="avatar" src="http:' + avatar + '"/>\n                <div class="subject">' + msg.subject + '</div>\n                <div class="author">' + msg.author + '</div>\n              </div>\n              <div class="body">' + msg.message.replace('\n', '<br>') + '</div>\n            </div>\n          '
          }));
        });
      }
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this.setVisible(false);
      this.gutter.destroy();
      if (this.disposables) {
        this.disposables.dispose();
      }
    }
  }]);

  return BlameGutterView;
})();

exports['default'] = BlameGutterView;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3RveW9raS8uYXRvbS9wYWNrYWdlcy9ibGFtZS9saWIvYmxhbWUtZ3V0dGVyLXZpZXcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozt3QkFFcUIsVUFBVTs7OztvQkFDZCxNQUFNOzs7O3NCQUNKLFFBQVE7Ozs7b0JBQ1MsTUFBTTs7MEJBQ3hCLGVBQWU7Ozs7OEJBQ1gsb0JBQW9COzs7O2tDQUNoQix5QkFBeUI7Ozs7NkJBQzlCLGtCQUFrQjs7OztBQVR2QyxXQUFXLENBQUE7O0lBV0wsZUFBZTtBQUVSLFdBRlAsZUFBZSxDQUVQLEtBQUssRUFBRSxNQUFNLEVBQUU7MEJBRnZCLGVBQWU7O0FBSWpCLFFBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFBO0FBQ2xCLFFBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFBO0FBQ3BCLFFBQUksQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFBOztBQUVuQixRQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFBO0FBQ3hELFFBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQTs7QUFFckMsUUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUE7QUFDaEIsUUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFBO0FBQ3RELFFBQUksQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFBOztBQUVqQixRQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQTs7QUFFcEQsUUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQTtHQUN0Qjs7ZUFsQkcsZUFBZTs7V0FvQk4seUJBQUc7QUFDZCxVQUFJ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QUFFO0FBQ2pCLG1CQUFNO1dBQ1A7O0FBRUQsZ0JBQU0sR0FBRyxzQkFBUyxHQUFHLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFBO0FBQzNDLGlCQUFLLFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFO0FBQzNDLGlCQUFLLGtJQUdpQyxNQUFNLGtEQUNmLEdBQUcsQ0FBQyxPQUFPLG9EQUNaLEdBQUcsQ0FBQyxNQUFNLHNFQUVkLEdBQUcsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsMkNBRXhEO1dBQ0YsQ0FBQyxDQUFDLENBQUE7U0FDSixDQUFDLENBQUE7T0FDSDtLQUNGOzs7V0FFTSxtQkFBRztBQUNSLFVBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUE7QUFDdEIsVUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQTtBQUNyQixVQUFJLElBQUksQ0FBQyxXQUFXLEVBQUU7QUFBRSxZQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFBO09BQUU7S0FDckQ7OztTQTVTRyxlQUFlOzs7cUJBK1NOLGVBQWUiLCJmaWxlIjoiL2hvbWUvdG95b2tpLy5hdG9tL3BhY2thZ2VzL2JsYW1lL2xpYi9ibGFtZS1ndXR0ZXItdmlldy5qcyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIGJhYmVsXCJcblxuaW1wb3J0IGdyYXZhdGFyIGZyb20gJ2dyYXZhdGFyJ1xuaW1wb3J0IG9wZW4gZnJvbSAnb3BlbidcbmltcG9ydCBtb21lbnQgZnJvbSAnbW9tZW50J1xuaW1wb3J0IHsgQ29tcG9zaXRlRGlzcG9zYWJsZSB9IGZyb20gJ2F0b20nXG5pbXBvcnQgYmxhbWUgZnJvbSAnLi91dGlscy9ibGFtZSdcbmltcG9ydCBnZXRDb21taXQgZnJvbSAnLi91dGlscy9nZXQtY29tbWl0J1xuaW1wb3J0IGdldENvbW1pdExpbmsgZnJvbSAnLi91dGlscy9nZXQtY29tbWl0LWxpbmsnXG5pbXBvcnQgdGhyb3R0bGUgZnJvbSAnLi91dGlscy90aHJvdHRsZSdcblxuY2xhc3MgQmxhbWVHdXR0ZXJWaWV3IHtcblxuICBjb25zdHJ1Y3RvcihzdGF0ZSwgZWRpdG9yKSB7XG5cbiAgICB0aGlzLnN0YXRlID0gc3RhdGVcbiAgICB0aGlzLmVkaXRvciA9IGVkaXRvclxuICAgIHRoaXMubGlzdGVuZXJzID0ge31cblxuICAgIHRoaXMuc3RhdGUud2lkdGggPSBhdG9tLmNvbmZpZy5nZXQoJ2JsYW1lLmRlZmF1bHRXaWR0aCcpXG4gICAgdGhpcy5zZXRHdXR0ZXJXaWR0aCh0aGlzLnN0YXRlLndpZHRoKVxuXG4gICAgdGhpcy5jb2xvcnMgPSB7fVxuICAgIHRoaXMuZ3V0dGVyID0gdGhpcy5lZGl0b3IuYWRkR3V0dGVyKHsgbmFtZTogJ2JsYW1lJyB9KVxuICAgIHRoaXMubWFya2VycyA9IFtdXG5cbiAgICB0aGlzLmVkaXRvckVsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcodGhpcy5lZGl0b3IpXG5cbiAgICB0aGlzLnNldFZpc2libGUodHJ1ZSlcbiAgfVxuXG4gIHRvZ2dsZVZpc2libGUoKSB7XG4gICAgdGhpcy5zZXRWaXNpYmxlKCF0aGlzLnZpc2libGUpXG4gIH1cblxuICBzZXRWaXNpYmxlKHZpc2libGUpIHtcbiAgICB0aGlzLnZpc2libGUgPSB2aXNpYmxlXG5cbiAgICBpZiAodGhpcy5lZGl0b3IuaXNNb2RpZmllZCgpKSB7IHRoaXMudmlzaWJsZSA9IGZhbHNlIH1cblxuICAgIGlmICh0aGlzLnZpc2libGUpIHtcbiAgICAgIHRoaXMudXBkYXRlKClcblxuICAgICAgaWYgKCF0aGlzLmRpc3Bvc2FibGVzKSB7IHRoaXMuZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpIH1cbiAgICAgIHRoaXMuZGlzcG9zYWJsZXMuYWRkKHRoaXMuZWRpdG9yLm9uRGlkU2F2ZSgoKSA9PiB0aGlzLnVwZGF0ZSgpKSlcblxuICAgICAgdGhpcy5ndXR0ZXIuc2hvdygpXG5cbiAgICAgIHRoaXMuc2Nyb2xsTGlzdGVuZXIgPSB0aGlzLmVkaXRvckVsZW1lbnQub25EaWRDaGFuZ2VTY3JvbGxUb3AoXG4gICAgICAgIHRocm90dGxlKCgpID0+IHRoaXMuaGlkZVRvb2x0aXBzKCksIDUwMClcbiAgICAgIClcblxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodGhpcy5zY3JvbGxMaXN0ZW5lcikgeyB0aGlzLnNjcm9sbExpc3RlbmVyLmRpc3Bvc2UoKSB9XG4gICAgICB0aGlzLmd1dHRlci5oaWRlKClcblxuICAgICAgaWYgKHRoaXMuZGlzcG9zYWJsZXMpIHsgdGhpcy5kaXNwb3NhYmxlcy5kaXNwb3NlKCkgfVxuICAgICAgdGhpcy5kaXNwb3NhYmxlcyA9IG51bGxcbiAgICAgIHRoaXMucmVtb3ZlQWxsTWFya2VycygpXG4gICAgfVxuICB9XG5cbiAgaGlkZVRvb2x0aXBzKCkge1xuICAgIC8vIFRyaWdnZXIgcmVzaXplIGV2ZW50IG9uIHdpbmRvdyB0byBoaWRlIHRvb2x0aXBzXG4gICAgd2luZG93LmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCdyZXNpemUnKSlcbiAgfVxuXG4gIHVwZGF0ZSgpIHtcbiAgICBibGFtZSh0aGlzLmVkaXRvci5nZXRQYXRoKCksIChyZXN1bHQpID0+IHtcbiAgICAgIGlmICghdGhpcy52aXNpYmxlKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICB0aGlzLnJlbW92ZUFsbE1hcmtlcnMoKVxuXG4gICAgICB2YXIgbGFzdEhhc2ggPSBudWxsXG4gICAgICB2YXIgY29tbWl0Q291bnQgPSAwXG5cbiAgICAgIGlmICghcmVzdWx0KSB7IHJldHVybiB9XG5cbiAgICAgIE9iamVjdC5rZXlzKHJlc3VsdCkuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgICBjb25zdCBsaW5lID0gcmVzdWx0W2tleV1cblxuICAgICAgICB2YXIgbGluZVN0clxuICAgICAgICB2YXIgaGFzaCA9IGxpbmUucmV2LnJlcGxhY2UoL1xccy4qLywgJycpXG5cbiAgICAgICAgaWYgKGxhc3RIYXNoICE9PSBoYXNoKSB7XG4gICAgICAgICAgbGluZVN0ciA9IHRoaXMuZm9ybWF0VG9vbHRpcChoYXNoLCBsaW5lKVxuICAgICAgICAgIHJvd0NscyA9IGBibGFtZS0keyhjb21taXRDb3VudCsrICUgMiA9PT0gMCkgPyAnZXZlbicgOiAnb2RkJ31gXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbGluZVN0cj0gJydcbiAgICAgICAgfVxuXG4gICAgICAgIGxhc3RIYXNoID0gaGFzaFxuXG4gICAgICAgIHRoaXMuYWRkTWFya2VyKE51bWJlcihrZXkpIC0gMSwgaGFzaCwgcm93Q2xzLCBsaW5lU3RyKVxuICAgICAgfSlcbiAgICB9KVxuICB9XG5cbiAgZm9ybWF0VG9vbHRpcChoYXNoLCBsaW5lKSB7XG4gICAgdmFyIGRhdGVGb3JtYXQgPSBhdG9tLmNvbmZpZy5nZXQoJ2JsYW1lLmRhdGVGb3JtYXQnKVxuICAgIHZhciBkYXRlU3RyID0gbW9tZW50KGxpbmUuZGF0ZSwgJ1lZWVktTU0tREQgSEg6bW06c3MnKVxuICAgICAgLmZvcm1hdChkYXRlRm9ybWF0KVxuXG4gICAgaWYgKHRoaXMuaXNDb21taXRlZChoYXNoKSkge1xuICAgICAgcmV0dXJuIGF0b20uY29uZmlnLmdldCgnYmxhbWUuZ3V0dGVyRm9ybWF0JylcbiAgICAgICAgLnJlcGxhY2UoJ3toYXNofScsIGA8c3BhbiBjbGFzcz1cImhhc2hcIj4ke2hhc2h9PC9zcGFuPmApXG4gICAgICAgIC5yZXBsYWNlKCd7ZGF0ZX0nLCBgPHNwYW4gY2xhc3M9XCJkYXRlXCI+JHtkYXRlU3RyfTwvc3Bhbj5gKVxuICAgICAgICAucmVwbGFjZSgne2F1dGhvcn0nLCBgPHNwYW4gY2xhc3M9XCJhdXRob3JcIj4ke2xpbmUuYXV0aG9yfTwvc3Bhbj5gKVxuICAgIH1cblxuICAgIHJldHVybiBgJHtsaW5lLmF1dGhvcn1gXG4gIH1cblxuICBsaW5rQ2xpY2tlZChoYXNoKSB7XG4gICAgZ2V0Q29tbWl0TGluayh0aGlzLmVkaXRvci5nZXRQYXRoKCksIGhhc2gucmVwbGFjZSgvXltcXF5dLywgJycpLCAobGluaykgPT4ge1xuICAgICAgaWYgKGxpbmspIHtcbiAgICAgICAgcmV0dXJuIG9wZW4obGluaylcbiAgICAgIH1cbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvKFwiVW5rbm93biB1cmwuXCIpXG4gICAgfSlcbiAgfVxuXG4gIGNvcHlDbGlja2VkKGhhc2gpIHtcbiAgICBhdG9tLmNsaXBib2FyZC53cml0ZShoYXNoKVxuICB9XG5cbiAgZm9ybWF0ZURhdGUoZGF0ZSkge1xuICAgIGRhdGUgPSBuZXcgRGF0ZShkYXRlKVxuICAgIHl5eXkgPSBkYXRlLmdldEZ1bGxZZWFyKClcbiAgICBtbSA9IGRhdGUuZ2V0TW9udGgoKSArIDFcbiAgICBpZiAobW0gPCAxMCkgeyBtbSA9IGAwJHttbX1gIH1cbiAgICBkZCA9IGRhdGUuZ2V0RGF0ZSgpXG4gICAgaWYgKGRkIDwgMTApIHsgZGQgPSBgMCR7ZGR9YCB9XG5cbiAgICByZXR1cm4gYCR7eXl5eX0tJHttbX0tJHtkZH1gXG4gIH1cblxuICBhZGRNYXJrZXIobGluZU5vLCBoYXNoLCByb3dDbHMsIGxpbmVTdHIpIHtcbiAgICBpdGVtID0gdGhpcy5tYXJrZXJJbm5lckRpdihyb3dDbHMpXG5cbiAgICAvLyBubyBuZWVkIHRvIGNyZWF0ZSBvYmplY3RzIGFuZCBldmVudHMgb24gYmxhbmsgbGluZXNcbiAgICBpZiAobGluZVN0ci5sZW5ndGggPiAwKSB7XG4gICAgICBpZiAodGhpcy5pc0NvbW1pdGVkKGhhc2gpKSB7XG4gICAgICAgIGl0ZW0uYXBwZW5kQ2hpbGQodGhpcy5jb3B5U3BhbihoYXNoKSlcbiAgICAgICAgaXRlbS5hcHBlbmRDaGlsZCh0aGlzLmxpbmtTcGFuKGhhc2gpKVxuICAgICAgfVxuICAgICAgaXRlbS5hcHBlbmRDaGlsZCh0aGlzLmxpbmVTcGFuKGxpbmVTdHIsIGhhc2gpKVxuXG4gICAgICBpZiAodGhpcy5pc0NvbW1pdGVkKGhhc2gpKSB7XG4gICAgICAgIHRoaXMuYWRkVG9vbHRpcChpdGVtLCBoYXNoKVxuICAgICAgfVxuICAgIH1cblxuICAgIGl0ZW0uYXBwZW5kQ2hpbGQodGhpcy5yZXNpemVIYW5kbGVEaXYoKSlcblxuICAgIG1hcmtlciA9IHRoaXMuZWRpdG9yLm1hcmtCdWZmZXJSYW5nZShbW2xpbmVObywgMF0sIFtsaW5lTm8sIDBdXSlcbiAgICB0aGlzLmVkaXRvci5kZWNvcmF0ZU1hcmtlcihtYXJrZXIsIHtcbiAgICAgIHR5cGU6ICdndXR0ZXInLFxuICAgICAgZ3V0dGVyTmFtZTogJ2JsYW1lJyxcbiAgICAgIGNsYXNzOiAnYmxhbWUtZ3V0dGVyJyxcbiAgICAgIGl0ZW06IGl0ZW1cbiAgICB9KVxuICAgIHRoaXMubWFya2Vycy5wdXNoKG1hcmtlcilcbiAgfVxuXG4gIG1hcmtlcklubmVyRGl2KHJvd0Nscykge1xuICAgIGl0ZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIGl0ZW0uY2xhc3NMaXN0LmFkZCgnYmxhbWUtZ3V0dGVyLWlubmVyJylcbiAgICBpdGVtLmNsYXNzTGlzdC5hZGQocm93Q2xzKVxuICAgIHJldHVybiBpdGVtXG4gIH1cblxuICByZXNpemVIYW5kbGVEaXYoKSB7XG4gICAgcmVzaXplSGFuZGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICByZXNpemVIYW5kbGUuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdGhpcy5yZXNpemVTdGFydGVkLmJpbmQodGhpcykpXG4gICAgcmVzaXplSGFuZGxlLmNsYXNzTGlzdC5hZGQoJ2JsYW1lLWd1dHRlci1oYW5kbGUnKVxuICAgIHJldHVybiByZXNpemVIYW5kbGVcbiAgfVxuXG4gIGxpbmVTcGFuKHN0ciwgaGFzaCkge1xuICAgIHNwYW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJylcbiAgICBzcGFuLmlubmVySFRNTCA9IHN0clxuICAgIHJldHVybiBzcGFuXG4gIH1cblxuICBjb3B5U3BhbihoYXNoKSB7XG4gICAgcmV0dXJuIHRoaXMuaWNvblNwYW4oaGFzaCwgJ2NvcHknLCAoKSA9PiB7XG4gICAgICB0aGlzLmNvcHlDbGlja2VkKGhhc2gpXG4gICAgfSlcbiAgfVxuXG4gIGxpbmtTcGFuKGhhc2gpIHtcbiAgICByZXR1cm4gdGhpcy5pY29uU3BhbihoYXNoLCAnbGluaycsICgpID0+IHtcbiAgICAgIHRoaXMubGlua0NsaWNrZWQoaGFzaClcbiAgICB9KVxuICB9XG5cbiAgaWNvblNwYW4oaGFzaCwga2V5LCBsaXN0ZW5lcikge1xuICAgIHNwYW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJylcbiAgICBzcGFuLnNldEF0dHJpYnV0ZSgnZGF0YS1oYXNoJywgaGFzaClcbiAgICBzcGFuLmNsYXNzTGlzdC5hZGQoJ2ljb24nKVxuICAgIHNwYW4uY2xhc3NMaXN0LmFkZChgaWNvbi0ke2tleX1gKVxuICAgIHNwYW4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBsaXN0ZW5lcilcblxuICAgIHJldHVybiBzcGFuXG4gIH1cblxuICByZW1vdmVBbGxNYXJrZXJzKCkge1xuICAgIHRoaXMubWFya2Vycy5mb3JFYWNoKG1hcmtlciA9PiBtYXJrZXIuZGVzdHJveSgpKVxuICAgIHRoaXMubWFya2VycyA9IFtdXG4gIH1cblxuICByZXNpemVTdGFydGVkKGUpIHtcbiAgICB0aGlzLmJpbmQoJ21vdXNlbW92ZScsIHRoaXMucmVzaXplTW92ZSlcbiAgICB0aGlzLmJpbmQoJ21vdXNldXAnLCB0aGlzLnJlc2l6ZVN0b3BwZWQpXG5cbiAgICB0aGlzLnJlc2l6ZVN0YXJ0ZWRBdFggPSBlLnBhZ2VYXG4gICAgdGhpcy5yZXNpemVXaWR0aCA9IHRoaXMuc3RhdGUud2lkdGhcbiAgfVxuXG4gIHJlc2l6ZVN0b3BwZWQoZSkge1xuICAgIHRoaXMudW5iaW5kKCdtb3VzZW1vdmUnKVxuICAgIHRoaXMudW5iaW5kKCdtb3VzZXVwJylcblxuICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcbiAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgfVxuXG4gIGJpbmQoZXZlbnQsIGxpc3RlbmVyKSB7XG4gICAgdGhpcy51bmJpbmQoZXZlbnQpXG4gICAgdGhpcy5saXN0ZW5lcnNbZXZlbnRdID0gbGlzdGVuZXIuYmluZCh0aGlzKVxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIHRoaXMubGlzdGVuZXJzW2V2ZW50XSlcbiAgfVxuXG4gIHVuYmluZChldmVudCkge1xuICAgIGlmICh0aGlzLmxpc3RlbmVyc1tldmVudF0pIHtcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnQsIHRoaXMubGlzdGVuZXJzW2V2ZW50XSlcbiAgICAgIHRoaXMubGlzdGVuZXJzW2V2ZW50XSA9IGZhbHNlXG4gICAgfVxuICB9XG5cbiAgcmVzaXplTW92ZShlKSB7XG4gICAgZGlmZiA9IGUucGFnZVggLSB0aGlzLnJlc2l6ZVN0YXJ0ZWRBdFhcbiAgICB0aGlzLnNldEd1dHRlcldpZHRoKHRoaXMucmVzaXplV2lkdGggKyBkaWZmKVxuXG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuICAgIGUucHJldmVudERlZmF1bHQoKVxuICB9XG5cbiAgZ3V0dGVyU3R5bGUoKSB7XG4gICAgc2hlZXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpXG4gICAgc2hlZXQudHlwZSA9ICd0ZXh0L2NzcydcbiAgICBzaGVldC5pZCA9ICdibGFtZS1ndXR0ZXItc3R5bGUnXG4gICAgcmV0dXJuIHNoZWV0XG4gIH1cblxuICBzZXRHdXR0ZXJXaWR0aCh3aWR0aCkge1xuICAgIHRoaXMuc3RhdGUud2lkdGggPSBNYXRoLm1heCg1MCwgTWF0aC5taW4od2lkdGgsIDUwMCkpXG5cbiAgICBzaGVldCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdibGFtZS1ndXR0ZXItc3R5bGUnKVxuICAgIGlmICghc2hlZXQpIHtcbiAgICAgIHNoZWV0ID0gdGhpcy5ndXR0ZXJTdHlsZSgpXG4gICAgICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHNoZWV0KVxuICAgIH1cblxuICAgIC8vIFRPRE8gcmVtb3ZlIGA6OnNoYWRvd2Agd2hlbiAgQXRvbSAxLjMgaXMgc3RhYmxlXG4gICAgc2hlZXQuaW5uZXJIVE1MID0gYFxuICAgICAgYXRvbS10ZXh0LWVkaXRvciAuZ3V0dGVyW2d1dHRlci1uYW1lPVwiYmxhbWVcIl0sXG4gICAgICBhdG9tLXRleHQtZWRpdG9yOjpzaGFkb3cgLmd1dHRlcltndXR0ZXItbmFtZT1cImJsYW1lXCJdIHtcbiAgICAgICAgd2lkdGg6ICR7dGhpcy5zdGF0ZS53aWR0aH1weFxuICAgICAgfVxuICAgIGBcbiAgfVxuXG4gIGlzQ29tbWl0ZWQoaGFzaCkge1xuICAgIHJldHVybiAhL15bMF0rJC8udGVzdChoYXNoKVxuICB9XG5cbiAgYWRkVG9vbHRpcChpdGVtLCBoYXNoKSB7XG5cbiAgICBpZiAoIWl0ZW0uZ2V0QXR0cmlidXRlKCdkYXRhLWhhcy10b29sdGlwJykpIHtcbiAgICAgIGl0ZW0uc2V0QXR0cmlidXRlKCdkYXRhLWhhcy10b29sdGlwJywgdHJ1ZSlcblxuICAgICAgZ2V0Q29tbWl0KHRoaXMuZWRpdG9yLmdldFBhdGgoKSwgaGFzaC5yZXBsYWNlKC9eW1xcXl0vLCAnJyksIChtc2cpID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLnZpc2libGUpIHtcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuXG4gICAgICAgIGF2YXRhciA9IGdyYXZhdGFyLnVybChtc2cuZW1haWwsIHsgczogODAgfSlcbiAgICAgICAgdGhpcy5kaXNwb3NhYmxlcy5hZGQoYXRvbS50b29sdGlwcy5hZGQoaXRlbSwge1xuICAgICAgICAgIHRpdGxlOiBgXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiYmxhbWUtdG9vbHRpcFwiPlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiaGVhZFwiPlxuICAgICAgICAgICAgICAgIDxpbWcgY2xhc3M9XCJhdmF0YXJcIiBzcmM9XCJodHRwOiR7YXZhdGFyfVwiLz5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwic3ViamVjdFwiPiR7bXNnLnN1YmplY3R9PC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImF1dGhvclwiPiR7bXNnLmF1dGhvcn08L2Rpdj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJib2R5XCI+JHttc2cubWVzc2FnZS5yZXBsYWNlKCdcXG4nLCAnPGJyPicpfTwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgYFxuICAgICAgICB9KSlcbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLnNldFZpc2libGUoZmFsc2UpXG4gICAgdGhpcy5ndXR0ZXIuZGVzdHJveSgpXG4gICAgaWYgKHRoaXMuZGlzcG9zYWJsZXMpIHsgdGhpcy5kaXNwb3NhYmxlcy5kaXNwb3NlKCkgfVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEJsYW1lR3V0dGVyVmlld1xuIl19