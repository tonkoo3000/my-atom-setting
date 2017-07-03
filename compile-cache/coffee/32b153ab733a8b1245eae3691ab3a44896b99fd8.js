(function() {
  var ColorBufferElement, ColorMarkerElement, CompositeDisposable, Emitter, EventsDelegation, nextHighlightId, ref, ref1, registerOrUpdateElement,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  ref = require('atom-utils'), registerOrUpdateElement = ref.registerOrUpdateElement, EventsDelegation = ref.EventsDelegation;

  ref1 = [], ColorMarkerElement = ref1[0], Emitter = ref1[1], CompositeDisposable = ref1[2];

  nextHighlightId = 0;

  ColorBufferElement = (function(superClass) {
    extend(ColorBufferElement, superClass);

    function ColorBufferElement() {
      return ColorBufferElement.__super__.constructor.apply(this, arguments);
    }

    EventsDelegation.includeInto(ColorBufferElement);

    ColorBufferElement.prototype.createdCallback = function() {
      var ref2, ref3;
      if (Emitter == null) {
        ref2 = require('atom'), Emitter = ref2.Emitter, CompositeDisposable = ref2.CompositeDisposable;
      }
      ref3 = [0, 0], this.editorScrollLeft = ref3[0], this.editorScrollTop = ref3[1];
      this.emitter = new Emitter;
      this.subscriptions = new CompositeDisposable;
      this.displayedMarkers = [];
      this.usedMarkers = [];
      this.unusedMarkers = [];
      return this.viewsByMarkers = new WeakMap;
    };

    ColorBufferElement.prototype.attachedCallback = function() {
      this.attached = true;
      return this.update();
    };

    ColorBufferElement.prototype.detachedCallback = function() {
      return this.attached = false;
    };

    ColorBufferElement.prototype.onDidUpdate = function(callback) {
      return this.emitter.on('did-update', callback);
    };

    ColorBufferElement.prototype.getModel = function() {
      return this.colorBuffer;
    };

    ColorBufferElement.prototype.setModel = function(colorBuffer) {
      var scrollLeftListener, scrollTopListener;
      this.colorBuffer = colorBuffer;
      this.editor = this.colorBuffer.editor;
      if (this.editor.isDestroyed()) {
        return;
      }
      this.editorElement = atom.views.getView(this.editor);
      this.colorBuffer.initialize().then((function(_this) {
        return function() {
          return _this.update();
        };
      })(this));
      this.subscriptions.add(this.colorBuffer.onDidUpdateColorMarkers((function(_this) {
        return function() {
          return _this.update();
        };
      })(this)));
      this.subscriptions.add(this.colorBuffer.onDidDestroy((function(_this) {
        return function() {
          return _this.destroy();
        };
      })(this)));
      scrollLeftListener = (function(_this) {
        return function(editorScrollLeft) {
          _this.editorScrollLeft = editorScrollLeft;
          return _this.updateScroll();
        };
      })(this);
      scrollTopListener = (function(_this) {
        return function(editorScrollTop) {
          _this.editorScrollTop = editorScrollTop;
          if (_this.useNativeDecorations()) {
            return;
          }
          _this.updateScroll();
          return requestAnimationFrame(function() {
            return _this.updateMarkers();
          });
        };
      })(this);
      if (this.editorElement.onDidChangeScrollLeft != null) {
        this.subscriptions.add(this.editorElement.onDidChangeScrollLeft(scrollLeftListener));
        this.subscriptions.add(this.editorElement.onDidChangeScrollTop(scrollTopListener));
      } else {
        this.subscriptions.add(this.editor.onDidChangeScrollLeft(scrollLeftListener));
        this.subscriptions.add(this.editor.onDidChangeScrollTop(scrollTopListener));
      }
      this.subscriptions.add(this.editor.onDidChange((function(_this) {
        return function() {
          return _this.usedMarkers.forEach(function(marker) {
            var ref2;
            if ((ref2 = marker.colorMarker) != null) {
              ref2.invalidateScreenRangeCache();
            }
            return marker.checkScreenRange();
          });
        };
      })(this)));
      this.subscriptions.add(this.editor.onDidAddCursor((function(_this) {
        return function() {
          return _this.requestSelectionUpdate();
        };
      })(this)));
      this.subscriptions.add(this.editor.onDidRemoveCursor((function(_this) {
        return function() {
          return _this.requestSelectionUpdate();
        };
      })(this)));
      this.subscriptions.add(this.editor.onDidChangeCursorPosition((function(_this) {
        return function() {
          return _this.requestSelectionUpdate();
        };
      })(this)));
      this.subscriptions.add(this.editor.onDidAddSelection((function(_this) {
        return function() {
          return _this.requestSelectionUpdate();
        };
      })(this)));
      this.subscriptions.add(this.editor.onDidRemoveSelection((function(_this) {
        return function() {
          return _this.requestSelectionUpdate();
        };
      })(this)));
      this.subscriptions.add(this.editor.onDidChangeSelectionRange((function(_this) {
        return function() {
          return _this.requestSelectionUpdate();
        };
      })(this)));
      if (this.editor.onDidTokenize != null) {
        this.subscriptions.add(this.editor.onDidTokenize((function(_this) {
          return function() {
            return _this.editorConfigChanged();
          };
        })(this)));
      } else {
        this.subscriptions.add(this.editor.displayBuffer.onDidTokenize((function(_this) {
          return function() {
            return _this.editorConfigChanged();
          };
        })(this)));
      }
      this.subscriptions.add(atom.config.observe('editor.fontSize', (function(_this) {
        return function() {
          return _this.editorConfigChanged();
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('editor.lineHeight', (function(_this) {
        return function() {
          return _this.editorConfigChanged();
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('pigments.maxDecorationsInGutter', (function(_this) {
        return function() {
          return _this.update();
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('pigments.markerType', (function(_this) {
        return function(type) {
          if (ColorMarkerElement == null) {
            ColorMarkerElement = require('./color-marker-element');
          }
          if (ColorMarkerElement.prototype.rendererType !== type) {
            ColorMarkerElement.setMarkerType(type);
          }
          if (_this.isNativeDecorationType(type)) {
            _this.initializeNativeDecorations(type);
          } else {
            if (type === 'background') {
              _this.classList.add('above-editor-content');
            } else {
              _this.classList.remove('above-editor-content');
            }
            _this.destroyNativeDecorations();
            _this.updateMarkers(type);
          }
          return _this.previousType = type;
        };
      })(this)));
      this.subscriptions.add(atom.styles.onDidAddStyleElement((function(_this) {
        return function() {
          return _this.editorConfigChanged();
        };
      })(this)));
      this.subscriptions.add(this.editorElement.onDidAttach((function(_this) {
        return function() {
          return _this.attach();
        };
      })(this)));
      return this.subscriptions.add(this.editorElement.onDidDetach((function(_this) {
        return function() {
          return _this.detach();
        };
      })(this)));
    };

    ColorBufferElement.prototype.attach = function() {
      var ref2;
      if (this.parentNode != null) {
        return;
      }
      if (this.editorElement == null) {
        return;
      }
      return (ref2 = this.getEditorRoot().querySelector('.lines')) != null ? ref2.appendChild(this) : void 0;
    };

    ColorBufferElement.prototype.detach = function() {
      if (this.parentNode == null) {
        return;
      }
      return this.parentNode.removeChild(this);
    };

    ColorBufferElement.prototype.destroy = function() {
      this.detach();
      this.subscriptions.dispose();
      if (this.isNativeDecorationType()) {
        this.destroyNativeDecorations();
      } else {
        this.releaseAllMarkerViews();
      }
      return this.colorBuffer = null;
    };

    ColorBufferElement.prototype.update = function() {
      if (this.useNativeDecorations()) {
        if (this.isGutterType()) {
          return this.updateGutterDecorations();
        } else {
          return this.updateHighlightDecorations(this.previousType);
        }
      } else {
        return this.updateMarkers();
      }
    };

    ColorBufferElement.prototype.updateScroll = function() {
      if (this.editorElement.hasTiledRendering && !this.useNativeDecorations()) {
        return this.style.webkitTransform = "translate3d(" + (-this.editorScrollLeft) + "px, " + (-this.editorScrollTop) + "px, 0)";
      }
    };

    ColorBufferElement.prototype.getEditorRoot = function() {
      return this.editorElement;
    };

    ColorBufferElement.prototype.editorConfigChanged = function() {
      if ((this.parentNode == null) || this.useNativeDecorations()) {
        return;
      }
      this.usedMarkers.forEach((function(_this) {
        return function(marker) {
          if (marker.colorMarker != null) {
            return marker.render();
          } else {
            console.warn("A marker view was found in the used instance pool while having a null model", marker);
            return _this.releaseMarkerElement(marker);
          }
        };
      })(this));
      return this.updateMarkers();
    };

    ColorBufferElement.prototype.isGutterType = function(type) {
      if (type == null) {
        type = this.previousType;
      }
      return type === 'gutter' || type === 'native-dot' || type === 'native-square-dot';
    };

    ColorBufferElement.prototype.isDotType = function(type) {
      if (type == null) {
        type = this.previousType;
      }
      return type === 'native-dot' || type === 'native-square-dot';
    };

    ColorBufferElement.prototype.useNativeDecorations = function() {
      return this.isNativeDecorationType(this.previousType);
    };

    ColorBufferElement.prototype.isNativeDecorationType = function(type) {
      if (ColorMarkerElement == null) {
        ColorMarkerElement = require('./color-marker-element');
      }
      return ColorMarkerElement.isNativeDecorationType(type);
    };

    ColorBufferElement.prototype.initializeNativeDecorations = function(type) {
      this.releaseAllMarkerViews();
      this.destroyNativeDecorations();
      if (this.isGutterType(type)) {
        return this.initializeGutter(type);
      } else {
        return this.updateHighlightDecorations(type);
      }
    };

    ColorBufferElement.prototype.destroyNativeDecorations = function() {
      if (this.isGutterType()) {
        return this.destroyGutter();
      } else {
        return this.destroyHighlightDecorations();
      }
    };

    ColorBufferElement.prototype.updateHighlightDecorations = function(type) {
      var className, i, j, len, len1, m, markers, markersByRows, maxRowLength, ref2, ref3, ref4, ref5, style;
      if (this.editor.isDestroyed()) {
        return;
      }
      if (this.styleByMarkerId == null) {
        this.styleByMarkerId = {};
      }
      if (this.decorationByMarkerId == null) {
        this.decorationByMarkerId = {};
      }
      markers = this.colorBuffer.getValidColorMarkers();
      ref2 = this.displayedMarkers;
      for (i = 0, len = ref2.length; i < len; i++) {
        m = ref2[i];
        if (!(indexOf.call(markers, m) < 0)) {
          continue;
        }
        if ((ref3 = this.decorationByMarkerId[m.id]) != null) {
          ref3.destroy();
        }
        this.removeChild(this.styleByMarkerId[m.id]);
        delete this.styleByMarkerId[m.id];
        delete this.decorationByMarkerId[m.id];
      }
      markersByRows = {};
      maxRowLength = 0;
      for (j = 0, len1 = markers.length; j < len1; j++) {
        m = markers[j];
        if (((ref4 = m.color) != null ? ref4.isValid() : void 0) && indexOf.call(this.displayedMarkers, m) < 0) {
          ref5 = this.getHighlighDecorationCSS(m, type), className = ref5.className, style = ref5.style;
          this.appendChild(style);
          this.styleByMarkerId[m.id] = style;
          this.decorationByMarkerId[m.id] = this.editor.decorateMarker(m.marker, {
            type: 'highlight',
            "class": "pigments-" + type + " " + className,
            includeMarkerText: type === 'highlight'
          });
        }
      }
      this.displayedMarkers = markers;
      return this.emitter.emit('did-update');
    };

    ColorBufferElement.prototype.destroyHighlightDecorations = function() {
      var deco, id, ref2;
      ref2 = this.decorationByMarkerId;
      for (id in ref2) {
        deco = ref2[id];
        if (this.styleByMarkerId[id] != null) {
          this.removeChild(this.styleByMarkerId[id]);
        }
        deco.destroy();
      }
      delete this.decorationByMarkerId;
      delete this.styleByMarkerId;
      return this.displayedMarkers = [];
    };

    ColorBufferElement.prototype.getHighlighDecorationCSS = function(marker, type) {
      var className, l, style;
      className = "pigments-highlight-" + (nextHighlightId++);
      style = document.createElement('style');
      l = marker.color.luma;
      if (type === 'native-background') {
        style.innerHTML = "." + className + " .region {\n  background-color: " + (marker.color.toCSS()) + ";\n  color: " + (l > 0.43 ? 'black' : 'white') + ";\n}";
      } else if (type === 'native-underline') {
        style.innerHTML = "." + className + " .region {\n  background-color: " + (marker.color.toCSS()) + ";\n}";
      } else if (type === 'native-outline') {
        style.innerHTML = "." + className + " .region {\n  border-color: " + (marker.color.toCSS()) + ";\n}";
      }
      return {
        className: className,
        style: style
      };
    };

    ColorBufferElement.prototype.initializeGutter = function(type) {
      var gutterContainer, options;
      options = {
        name: "pigments-" + type
      };
      if (type !== 'gutter') {
        options.priority = 1000;
      }
      this.gutter = this.editor.addGutter(options);
      this.displayedMarkers = [];
      if (this.decorationByMarkerId == null) {
        this.decorationByMarkerId = {};
      }
      gutterContainer = this.getEditorRoot().querySelector('.gutter-container');
      this.gutterSubscription = new CompositeDisposable;
      this.gutterSubscription.add(this.subscribeTo(gutterContainer, {
        mousedown: (function(_this) {
          return function(e) {
            var colorMarker, markerId, targetDecoration;
            targetDecoration = e.path[0];
            if (!targetDecoration.matches('span')) {
              targetDecoration = targetDecoration.querySelector('span');
            }
            if (targetDecoration == null) {
              return;
            }
            markerId = targetDecoration.dataset.markerId;
            colorMarker = _this.displayedMarkers.filter(function(m) {
              return m.id === Number(markerId);
            })[0];
            if (!((colorMarker != null) && (_this.colorBuffer != null))) {
              return;
            }
            return _this.colorBuffer.selectColorMarkerAndOpenPicker(colorMarker);
          };
        })(this)
      }));
      if (this.isDotType(type)) {
        this.gutterSubscription.add(this.editor.onDidChange((function(_this) {
          return function(changes) {
            if (Array.isArray(changes)) {
              return changes != null ? changes.forEach(function(change) {
                return _this.updateDotDecorationsOffsets(change.start.row, change.newExtent.row);
              }) : void 0;
            } else if ((changes.start != null) && (changes.newExtent != null)) {
              return _this.updateDotDecorationsOffsets(changes.start.row, changes.newExtent.row);
            }
          };
        })(this)));
      }
      return this.updateGutterDecorations(type);
    };

    ColorBufferElement.prototype.destroyGutter = function() {
      var decoration, id, ref2;
      this.gutter.destroy();
      this.gutterSubscription.dispose();
      this.displayedMarkers = [];
      ref2 = this.decorationByMarkerId;
      for (id in ref2) {
        decoration = ref2[id];
        decoration.destroy();
      }
      delete this.decorationByMarkerId;
      return delete this.gutterSubscription;
    };

    ColorBufferElement.prototype.updateGutterDecorations = function(type) {
      var deco, decoWidth, i, j, len, len1, m, markers, markersByRows, maxDecorationsInGutter, maxRowLength, ref2, ref3, ref4, row, rowLength;
      if (type == null) {
        type = this.previousType;
      }
      if (this.editor.isDestroyed()) {
        return;
      }
      markers = this.colorBuffer.getValidColorMarkers();
      ref2 = this.displayedMarkers;
      for (i = 0, len = ref2.length; i < len; i++) {
        m = ref2[i];
        if (!(indexOf.call(markers, m) < 0)) {
          continue;
        }
        if ((ref3 = this.decorationByMarkerId[m.id]) != null) {
          ref3.destroy();
        }
        delete this.decorationByMarkerId[m.id];
      }
      markersByRows = {};
      maxRowLength = 0;
      maxDecorationsInGutter = atom.config.get('pigments.maxDecorationsInGutter');
      for (j = 0, len1 = markers.length; j < len1; j++) {
        m = markers[j];
        if (((ref4 = m.color) != null ? ref4.isValid() : void 0) && indexOf.call(this.displayedMarkers, m) < 0) {
          this.decorationByMarkerId[m.id] = this.gutter.decorateMarker(m.marker, {
            type: 'gutter',
            "class": 'pigments-gutter-marker',
            item: this.getGutterDecorationItem(m)
          });
        }
        deco = this.decorationByMarkerId[m.id];
        row = m.marker.getStartScreenPosition().row;
        if (markersByRows[row] == null) {
          markersByRows[row] = 0;
        }
        if (markersByRows[row] >= maxDecorationsInGutter) {
          continue;
        }
        rowLength = 0;
        if (type !== 'gutter') {
          rowLength = this.editorElement.pixelPositionForScreenPosition([row, 2e308]).left;
        }
        decoWidth = 14;
        deco.properties.item.style.left = (rowLength + markersByRows[row] * decoWidth) + "px";
        markersByRows[row]++;
        maxRowLength = Math.max(maxRowLength, markersByRows[row]);
      }
      if (type === 'gutter') {
        atom.views.getView(this.gutter).style.minWidth = (maxRowLength * decoWidth) + "px";
      } else {
        atom.views.getView(this.gutter).style.width = "0px";
      }
      this.displayedMarkers = markers;
      return this.emitter.emit('did-update');
    };

    ColorBufferElement.prototype.updateDotDecorationsOffsets = function(rowStart, rowEnd) {
      var deco, decoWidth, i, m, markerRow, markersByRows, ref2, ref3, results, row, rowLength;
      markersByRows = {};
      results = [];
      for (row = i = ref2 = rowStart, ref3 = rowEnd; ref2 <= ref3 ? i <= ref3 : i >= ref3; row = ref2 <= ref3 ? ++i : --i) {
        results.push((function() {
          var j, len, ref4, results1;
          ref4 = this.displayedMarkers;
          results1 = [];
          for (j = 0, len = ref4.length; j < len; j++) {
            m = ref4[j];
            deco = this.decorationByMarkerId[m.id];
            if (m.marker == null) {
              continue;
            }
            markerRow = m.marker.getStartScreenPosition().row;
            if (row !== markerRow) {
              continue;
            }
            if (markersByRows[row] == null) {
              markersByRows[row] = 0;
            }
            rowLength = this.editorElement.pixelPositionForScreenPosition([row, 2e308]).left;
            decoWidth = 14;
            deco.properties.item.style.left = (rowLength + markersByRows[row] * decoWidth) + "px";
            results1.push(markersByRows[row]++);
          }
          return results1;
        }).call(this));
      }
      return results;
    };

    ColorBufferElement.prototype.getGutterDecorationItem = function(marker) {
      var div;
      div = document.createElement('div');
      div.innerHTML = "<span style='background-color: " + (marker.color.toCSS()) + ";' data-marker-id='" + marker.id + "'></span>";
      return div;
    };

    ColorBufferElement.prototype.requestMarkerUpdate = function(markers) {
      if (this.frameRequested) {
        this.dirtyMarkers = this.dirtyMarkers.concat(markers);
        return;
      } else {
        this.dirtyMarkers = markers.slice();
        this.frameRequested = true;
      }
      return requestAnimationFrame((function(_this) {
        return function() {
          var dirtyMarkers, i, len, m, ref2;
          dirtyMarkers = [];
          ref2 = _this.dirtyMarkers;
          for (i = 0, len = ref2.length; i < len; i++) {
            m = ref2[i];
            if (indexOf.call(dirtyMarkers, m) < 0) {
              dirtyMarkers.push(m);
            }
          }
          delete _this.frameRequested;
          delete _this.dirtyMarkers;
          if (_this.colorBuffer == null) {
            return;
          }
          return dirtyMarkers.forEach(function(marker) {
            return marker.render();
          });
        };
      })(this));
    };

    ColorBufferElement.prototype.updateMarkers = function(type) {
      var base, base1, i, j, len, len1, m, markers, ref2, ref3, ref4;
      if (type == null) {
        type = this.previousType;
      }
      if (this.editor.isDestroyed()) {
        return;
      }
      markers = this.colorBuffer.findValidColorMarkers({
        intersectsScreenRowRange: (ref2 = typeof (base = this.editorElement).getVisibleRowRange === "function" ? base.getVisibleRowRange() : void 0) != null ? ref2 : typeof (base1 = this.editor).getVisibleRowRange === "function" ? base1.getVisibleRowRange() : void 0
      });
      ref3 = this.displayedMarkers;
      for (i = 0, len = ref3.length; i < len; i++) {
        m = ref3[i];
        if (indexOf.call(markers, m) < 0) {
          this.releaseMarkerView(m);
        }
      }
      for (j = 0, len1 = markers.length; j < len1; j++) {
        m = markers[j];
        if (((ref4 = m.color) != null ? ref4.isValid() : void 0) && indexOf.call(this.displayedMarkers, m) < 0) {
          this.requestMarkerView(m);
        }
      }
      this.displayedMarkers = markers;
      return this.emitter.emit('did-update');
    };

    ColorBufferElement.prototype.requestMarkerView = function(marker) {
      var view;
      if (this.unusedMarkers.length) {
        view = this.unusedMarkers.shift();
      } else {
        if (ColorMarkerElement == null) {
          ColorMarkerElement = require('./color-marker-element');
        }
        view = new ColorMarkerElement;
        view.setContainer(this);
        view.onDidRelease((function(_this) {
          return function(arg) {
            var marker;
            marker = arg.marker;
            _this.displayedMarkers.splice(_this.displayedMarkers.indexOf(marker), 1);
            return _this.releaseMarkerView(marker);
          };
        })(this));
        this.appendChild(view);
      }
      view.setModel(marker);
      this.hideMarkerIfInSelectionOrFold(marker, view);
      this.usedMarkers.push(view);
      this.viewsByMarkers.set(marker, view);
      return view;
    };

    ColorBufferElement.prototype.releaseMarkerView = function(markerOrView) {
      var marker, view;
      marker = markerOrView;
      view = this.viewsByMarkers.get(markerOrView);
      if (view != null) {
        if (marker != null) {
          this.viewsByMarkers["delete"](marker);
        }
        return this.releaseMarkerElement(view);
      }
    };

    ColorBufferElement.prototype.releaseMarkerElement = function(view) {
      this.usedMarkers.splice(this.usedMarkers.indexOf(view), 1);
      if (!view.isReleased()) {
        view.release(false);
      }
      return this.unusedMarkers.push(view);
    };

    ColorBufferElement.prototype.releaseAllMarkerViews = function() {
      var i, j, len, len1, ref2, ref3, view;
      ref2 = this.usedMarkers;
      for (i = 0, len = ref2.length; i < len; i++) {
        view = ref2[i];
        view.destroy();
      }
      ref3 = this.unusedMarkers;
      for (j = 0, len1 = ref3.length; j < len1; j++) {
        view = ref3[j];
        view.destroy();
      }
      this.usedMarkers = [];
      this.unusedMarkers = [];
      return Array.prototype.forEach.call(this.querySelectorAll('pigments-color-marker'), function(el) {
        return el.parentNode.removeChild(el);
      });
    };

    ColorBufferElement.prototype.requestSelectionUpdate = function() {
      if (this.updateRequested) {
        return;
      }
      this.updateRequested = true;
      return requestAnimationFrame((function(_this) {
        return function() {
          _this.updateRequested = false;
          if (_this.editor.getBuffer().isDestroyed()) {
            return;
          }
          return _this.updateSelections();
        };
      })(this));
    };

    ColorBufferElement.prototype.updateSelections = function() {
      var decoration, i, j, len, len1, marker, ref2, ref3, results, results1, view;
      if (this.editor.isDestroyed()) {
        return;
      }
      if (this.useNativeDecorations()) {
        ref2 = this.displayedMarkers;
        results = [];
        for (i = 0, len = ref2.length; i < len; i++) {
          marker = ref2[i];
          decoration = this.decorationByMarkerId[marker.id];
          if (decoration != null) {
            results.push(this.hideDecorationIfInSelection(marker, decoration));
          } else {
            results.push(void 0);
          }
        }
        return results;
      } else {
        ref3 = this.displayedMarkers;
        results1 = [];
        for (j = 0, len1 = ref3.length; j < len1; j++) {
          marker = ref3[j];
          view = this.viewsByMarkers.get(marker);
          if (view != null) {
            view.classList.remove('hidden');
            view.classList.remove('in-fold');
            results1.push(this.hideMarkerIfInSelectionOrFold(marker, view));
          } else {
            results1.push(console.warn("A color marker was found in the displayed markers array without an associated view", marker));
          }
        }
        return results1;
      }
    };

    ColorBufferElement.prototype.hideDecorationIfInSelection = function(marker, decoration) {
      var classes, i, len, markerRange, props, range, selection, selections;
      selections = this.editor.getSelections();
      props = decoration.getProperties();
      classes = props["class"].split(/\s+/g);
      for (i = 0, len = selections.length; i < len; i++) {
        selection = selections[i];
        range = selection.getScreenRange();
        markerRange = marker.getScreenRange();
        if (!((markerRange != null) && (range != null))) {
          continue;
        }
        if (markerRange.intersectsWith(range)) {
          if (classes[0].match(/-in-selection$/) == null) {
            classes[0] += '-in-selection';
          }
          props["class"] = classes.join(' ');
          decoration.setProperties(props);
          return;
        }
      }
      classes = classes.map(function(cls) {
        return cls.replace('-in-selection', '');
      });
      props["class"] = classes.join(' ');
      return decoration.setProperties(props);
    };

    ColorBufferElement.prototype.hideMarkerIfInSelectionOrFold = function(marker, view) {
      var i, len, markerRange, range, results, selection, selections;
      selections = this.editor.getSelections();
      results = [];
      for (i = 0, len = selections.length; i < len; i++) {
        selection = selections[i];
        range = selection.getScreenRange();
        markerRange = marker.getScreenRange();
        if (!((markerRange != null) && (range != null))) {
          continue;
        }
        if (markerRange.intersectsWith(range)) {
          view.classList.add('hidden');
        }
        if (this.editor.isFoldedAtBufferRow(marker.getBufferRange().start.row)) {
          results.push(view.classList.add('in-fold'));
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    ColorBufferElement.prototype.colorMarkerForMouseEvent = function(event) {
      var bufferPosition, position;
      position = this.screenPositionForMouseEvent(event);
      if (position == null) {
        return;
      }
      bufferPosition = this.colorBuffer.editor.bufferPositionForScreenPosition(position);
      return this.colorBuffer.getColorMarkerAtBufferPosition(bufferPosition);
    };

    ColorBufferElement.prototype.screenPositionForMouseEvent = function(event) {
      var pixelPosition;
      pixelPosition = this.pixelPositionForMouseEvent(event);
      if (pixelPosition == null) {
        return;
      }
      if (this.editorElement.screenPositionForPixelPosition != null) {
        return this.editorElement.screenPositionForPixelPosition(pixelPosition);
      } else {
        return this.editor.screenPositionForPixelPosition(pixelPosition);
      }
    };

    ColorBufferElement.prototype.pixelPositionForMouseEvent = function(event) {
      var clientX, clientY, left, ref2, rootElement, scrollTarget, top;
      clientX = event.clientX, clientY = event.clientY;
      scrollTarget = this.editorElement.getScrollTop != null ? this.editorElement : this.editor;
      rootElement = this.getEditorRoot();
      if (rootElement.querySelector('.lines') == null) {
        return;
      }
      ref2 = rootElement.querySelector('.lines').getBoundingClientRect(), top = ref2.top, left = ref2.left;
      top = clientY - top + scrollTarget.getScrollTop();
      left = clientX - left + scrollTarget.getScrollLeft();
      return {
        top: top,
        left: left
      };
    };

    return ColorBufferElement;

  })(HTMLElement);

  module.exports = ColorBufferElement = registerOrUpdateElement('pigments-markers', ColorBufferElement.prototype);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvdG95b2tpLy5hdG9tL3BhY2thZ2VzL3BpZ21lbnRzL2xpYi9jb2xvci1idWZmZXItZWxlbWVudC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLDJJQUFBO0lBQUE7Ozs7RUFBQSxNQUE4QyxPQUFBLENBQVEsWUFBUixDQUE5QyxFQUFDLHFEQUFELEVBQTBCOztFQUUxQixPQUFxRCxFQUFyRCxFQUFDLDRCQUFELEVBQXFCLGlCQUFyQixFQUE4Qjs7RUFFOUIsZUFBQSxHQUFrQjs7RUFFWjs7Ozs7OztJQUNKLGdCQUFnQixDQUFDLFdBQWpCLENBQTZCLGtCQUE3Qjs7aUNBRUEsZUFBQSxHQUFpQixTQUFBO0FBQ2YsVUFBQTtNQUFBLElBQU8sZUFBUDtRQUNFLE9BQWlDLE9BQUEsQ0FBUSxNQUFSLENBQWpDLEVBQUMsc0JBQUQsRUFBVSwrQ0FEWjs7TUFHQSxPQUF3QyxDQUFDLENBQUQsRUFBSSxDQUFKLENBQXhDLEVBQUMsSUFBQyxDQUFBLDBCQUFGLEVBQW9CLElBQUMsQ0FBQTtNQUNyQixJQUFDLENBQUEsT0FBRCxHQUFXLElBQUk7TUFDZixJQUFDLENBQUEsYUFBRCxHQUFpQixJQUFJO01BQ3JCLElBQUMsQ0FBQSxnQkFBRCxHQUFvQjtNQUNwQixJQUFDLENBQUEsV0FBRCxHQUFlO01BQ2YsSUFBQyxDQUFBLGFBQUQsR0FBaUI7YUFDakIsSUFBQyxDQUFBLGNBQUQsR0FBa0IsSUFBSTtJQVZQOztpQ0FZakIsZ0JBQUEsR0FBa0IsU0FBQTtNQUNoQixJQUFDLENBQUEsUUFBRCxHQUFZO2FBQ1osSUFBQyxDQUFBLE1BQUQsQ0FBQTtJQUZnQjs7aUNBSWxCLGdCQUFBLEdBQWtCLFNBQUE7YUFDaEIsSUFBQyxDQUFBLFFBQUQsR0FBWTtJQURJOztpQ0FHbEIsV0FBQSxHQUFhLFNBQUMsUUFBRDthQUNYLElBQUMsQ0FBQSxPQUFPLENBQUMsRUFBVCxDQUFZLFlBQVos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QyxDQUFBLE1BQU0sQ0FBQyw4QkFBUixDQUF1QyxhQUF2QyxFQUhGOztJQUwyQjs7aUNBVTdCLDBCQUFBLEdBQTRCLFNBQUMsS0FBRDtBQUMxQixVQUFBO01BQUMsdUJBQUQsRUFBVTtNQUVWLFlBQUEsR0FBa0IsdUNBQUgsR0FDYixJQUFDLENBQUEsYUFEWSxHQUdiLElBQUMsQ0FBQTtNQUVILFdBQUEsR0FBYyxJQUFDLENBQUEsYUFBRCxDQUFBO01BRWQsSUFBYywyQ0FBZDtBQUFBLGVBQUE7O01BRUEsT0FBYyxXQUFXLENBQUMsYUFBWixDQUEwQixRQUExQixDQUFtQyxDQUFDLHFCQUFwQyxDQUFBLENBQWQsRUFBQyxjQUFELEVBQU07TUFDTixHQUFBLEdBQU0sT0FBQSxHQUFVLEdBQVYsR0FBZ0IsWUFBWSxDQUFDLFlBQWIsQ0FBQTtNQUN0QixJQUFBLEdBQU8sT0FBQSxHQUFVLElBQVYsR0FBaUIsWUFBWSxDQUFDLGFBQWIsQ0FBQTthQUN4QjtRQUFDLEtBQUEsR0FBRDtRQUFNLE1BQUEsSUFBTjs7SUFmMEI7Ozs7S0E3akJHOztFQThrQmpDLE1BQU0sQ0FBQyxPQUFQLEdBQ0Esa0JBQUEsR0FDQSx1QkFBQSxDQUF3QixrQkFBeEIsRUFBNEMsa0JBQWtCLENBQUMsU0FBL0Q7QUF0bEJBIiwic291cmNlc0NvbnRlbnQiOlsie3JlZ2lzdGVyT3JVcGRhdGVFbGVtZW50LCBFdmVudHNEZWxlZ2F0aW9ufSA9IHJlcXVpcmUgJ2F0b20tdXRpbHMnXG5cbltDb2xvck1hcmtlckVsZW1lbnQsIEVtaXR0ZXIsIENvbXBvc2l0ZURpc3Bvc2FibGVdID0gW11cblxubmV4dEhpZ2hsaWdodElkID0gMFxuXG5jbGFzcyBDb2xvckJ1ZmZlckVsZW1lbnQgZXh0ZW5kcyBIVE1MRWxlbWVudFxuICBFdmVudHNEZWxlZ2F0aW9uLmluY2x1ZGVJbnRvKHRoaXMpXG5cbiAgY3JlYXRlZENhbGxiYWNrOiAtPlxuICAgIHVubGVzcyBFbWl0dGVyP1xuICAgICAge0VtaXR0ZXIsIENvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcblxuICAgIFtAZWRpdG9yU2Nyb2xsTGVmdCwgQGVkaXRvclNjcm9sbFRvcF0gPSBbMCwgMF1cbiAgICBAZW1pdHRlciA9IG5ldyBFbWl0dGVyXG4gICAgQHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIEBkaXNwbGF5ZWRNYXJrZXJzID0gW11cbiAgICBAdXNlZE1hcmtlcnMgPSBbXVxuICAgIEB1bnVzZWRNYXJrZXJzID0gW11cbiAgICBAdmlld3NCeU1hcmtlcnMgPSBuZXcgV2Vha01hcFxuXG4gIGF0dGFjaGVkQ2FsbGJhY2s6IC0+XG4gICAgQGF0dGFjaGVkID0gdHJ1ZVxuICAgIEB1cGRhdGUoKVxuXG4gIGRldGFjaGVkQ2FsbGJhY2s6IC0+XG4gICAgQGF0dGFjaGVkID0gZmFsc2VcblxuICBvbkRpZFVwZGF0ZTogKGNhbGxiYWNrKSAtPlxuICAgIEBlbWl0dGVyLm9uICdkaWQtdXBkYXRlJywgY2FsbGJhY2tcblxuICBnZXRNb2RlbDogLT4gQGNvbG9yQnVmZmVyXG5cbiAgc2V0TW9kZWw6IChAY29sb3JCdWZmZXIpIC0+XG4gICAge0BlZGl0b3J9ID0gQGNvbG9yQnVmZmVyXG4gICAgcmV0dXJuIGlmIEBlZGl0b3IuaXNEZXN0cm95ZWQoKVxuICAgIEBlZGl0b3JFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KEBlZGl0b3IpXG5cbiAgICBAY29sb3JCdWZmZXIuaW5pdGlhbGl6ZSgpLnRoZW4gPT4gQHVwZGF0ZSgpXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQGNvbG9yQnVmZmVyLm9uRGlkVXBkYXRlQ29sb3JNYXJrZXJzID0+IEB1cGRhdGUoKVxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAY29sb3JCdWZmZXIub25EaWREZXN0cm95ID0+IEBkZXN0cm95KClcblxuICAgIHNjcm9sbExlZnRMaXN0ZW5lciA9IChAZWRpdG9yU2Nyb2xsTGVmdCkgPT4gQHVwZGF0ZVNjcm9sbCgpXG4gICAgc2Nyb2xsVG9wTGlzdGVuZXIgPSAoQGVkaXRvclNjcm9sbFRvcCkgPT5cbiAgICAgIHJldHVybiBpZiBAdXNlTmF0aXZlRGVjb3JhdGlvbnMoKVxuICAgICAgQHVwZGF0ZVNjcm9sbCgpXG4gICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPT4gQHVwZGF0ZU1hcmtlcnMoKVxuXG4gICAgaWYgQGVkaXRvckVsZW1lbnQub25EaWRDaGFuZ2VTY3JvbGxMZWZ0P1xuICAgICAgQHN1YnNjcmlwdGlvbnMuYWRkIEBlZGl0b3JFbGVtZW50Lm9uRGlkQ2hhbmdlU2Nyb2xsTGVmdChzY3JvbGxMZWZ0TGlzdGVuZXIpXG4gICAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQGVkaXRvckVsZW1lbnQub25EaWRDaGFuZ2VTY3JvbGxUb3Aoc2Nyb2xsVG9wTGlzdGVuZXIpXG4gICAgZWxzZVxuICAgICAgQHN1YnNjcmlwdGlvbnMuYWRkIEBlZGl0b3Iub25EaWRDaGFuZ2VTY3JvbGxMZWZ0KHNjcm9sbExlZnRMaXN0ZW5lcilcbiAgICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAZWRpdG9yLm9uRGlkQ2hhbmdlU2Nyb2xsVG9wKHNjcm9sbFRvcExpc3RlbmVyKVxuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIEBlZGl0b3Iub25EaWRDaGFuZ2UgPT5cbiAgICAgIEB1c2VkTWFya2Vycy5mb3JFYWNoIChtYXJrZXIpIC0+XG4gICAgICAgIG1hcmtlci5jb2xvck1hcmtlcj8uaW52YWxpZGF0ZVNjcmVlblJhbmdlQ2FjaGUoKVxuICAgICAgICBtYXJrZXIuY2hlY2tTY3JlZW5SYW5nZSgpXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQGVkaXRvci5vbkRpZEFkZEN1cnNvciA9PlxuICAgICAgQHJlcXVlc3RTZWxlY3Rpb25VcGRhdGUoKVxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAZWRpdG9yLm9uRGlkUmVtb3ZlQ3Vyc29yID0+XG4gICAgICBAcmVxdWVzdFNlbGVjdGlvblVwZGF0ZSgpXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIEBlZGl0b3Iub25EaWRDaGFuZ2VDdXJzb3JQb3NpdGlvbiA9PlxuICAgICAgQHJlcXVlc3RTZWxlY3Rpb25VcGRhdGUoKVxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAZWRpdG9yLm9uRGlkQWRkU2VsZWN0aW9uID0+XG4gICAgICBAcmVxdWVzdFNlbGVjdGlvblVwZGF0ZSgpXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIEBlZGl0b3Iub25EaWRSZW1vdmVTZWxlY3Rpb24gPT5cbiAgICAgIEByZXF1ZXN0U2VsZWN0aW9uVXBkYXRlKClcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQGVkaXRvci5vbkRpZENoYW5nZVNlbGVjdGlvblJhbmdlID0+XG4gICAgICBAcmVxdWVzdFNlbGVjdGlvblVwZGF0ZSgpXG5cbiAgICBpZiBAZWRpdG9yLm9uRGlkVG9rZW5pemU/XG4gICAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQGVkaXRvci5vbkRpZFRva2VuaXplID0+IEBlZGl0b3JDb25maWdDaGFuZ2VkKClcbiAgICBlbHNlXG4gICAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQGVkaXRvci5kaXNwbGF5QnVmZmVyLm9uRGlkVG9rZW5pemUgPT5cbiAgICAgICAgQGVkaXRvckNvbmZpZ0NoYW5nZWQoKVxuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29uZmlnLm9ic2VydmUgJ2VkaXRvci5mb250U2l6ZScsID0+XG4gICAgICBAZWRpdG9yQ29uZmlnQ2hhbmdlZCgpXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb25maWcub2JzZXJ2ZSAnZWRpdG9yLmxpbmVIZWlnaHQnLCA9PlxuICAgICAgQGVkaXRvckNvbmZpZ0NoYW5nZWQoKVxuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29uZmlnLm9ic2VydmUgJ3BpZ21lbnRzLm1heERlY29yYXRpb25zSW5HdXR0ZXInLCA9PlxuICAgICAgQHVwZGF0ZSgpXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb25maWcub2JzZXJ2ZSAncGlnbWVudHMubWFya2VyVHlwZScsICh0eXBlKSA9PlxuICAgICAgQ29sb3JNYXJrZXJFbGVtZW50ID89IHJlcXVpcmUgJy4vY29sb3ItbWFya2VyLWVsZW1lbnQnXG5cbiAgICAgIGlmIENvbG9yTWFya2VyRWxlbWVudDo6cmVuZGVyZXJUeXBlIGlzbnQgdHlwZVxuICAgICAgICBDb2xvck1hcmtlckVsZW1lbnQuc2V0TWFya2VyVHlwZSh0eXBlKVxuXG4gICAgICBpZiBAaXNOYXRpdmVEZWNvcmF0aW9uVHlwZSh0eXBlKVxuICAgICAgICBAaW5pdGlhbGl6ZU5hdGl2ZURlY29yYXRpb25zKHR5cGUpXG4gICAgICBlbHNlXG4gICAgICAgIGlmIHR5cGUgaXMgJ2JhY2tncm91bmQnXG4gICAgICAgICAgQGNsYXNzTGlzdC5hZGQoJ2Fib3ZlLWVkaXRvci1jb250ZW50JylcbiAgICAgICAgZWxzZVxuICAgICAgICAgIEBjbGFzc0xpc3QucmVtb3ZlKCdhYm92ZS1lZGl0b3ItY29udGVudCcpXG5cbiAgICAgICAgQGRlc3Ryb3lOYXRpdmVEZWNvcmF0aW9ucygpXG4gICAgICAgIEB1cGRhdGVNYXJrZXJzKHR5cGUpXG5cbiAgICAgIEBwcmV2aW91c1R5cGUgPSB0eXBlXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5zdHlsZXMub25EaWRBZGRTdHlsZUVsZW1lbnQgPT5cbiAgICAgIEBlZGl0b3JDb25maWdDaGFuZ2VkKClcblxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAZWRpdG9yRWxlbWVudC5vbkRpZEF0dGFjaCA9PiBAYXR0YWNoKClcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQGVkaXRvckVsZW1lbnQub25EaWREZXRhY2ggPT4gQGRldGFjaCgpXG5cbiAgYXR0YWNoOiAtPlxuICAgIHJldHVybiBpZiBAcGFyZW50Tm9kZT9cbiAgICByZXR1cm4gdW5sZXNzIEBlZGl0b3JFbGVtZW50P1xuICAgIEBnZXRFZGl0b3JSb290KCkucXVlcnlTZWxlY3RvcignLmxpbmVzJyk/LmFwcGVuZENoaWxkKHRoaXMpXG5cbiAgZGV0YWNoOiAtPlxuICAgIHJldHVybiB1bmxlc3MgQHBhcmVudE5vZGU/XG5cbiAgICBAcGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzKVxuXG4gIGRlc3Ryb3k6IC0+XG4gICAgQGRldGFjaCgpXG4gICAgQHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG5cbiAgICBpZiBAaXNOYXRpdmVEZWNvcmF0aW9uVHlwZSgpXG4gICAgICBAZGVzdHJveU5hdGl2ZURlY29yYXRpb25zKClcbiAgICBlbHNlXG4gICAgICBAcmVsZWFzZUFsbE1hcmtlclZpZXdzKClcblxuICAgIEBjb2xvckJ1ZmZlciA9IG51bGxcblxuICB1cGRhdGU6IC0+XG4gICAgaWYgQHVzZU5hdGl2ZURlY29yYXRpb25zKClcbiAgICAgIGlmIEBpc0d1dHRlclR5cGUoKVxuICAgICAgICBAdXBkYXRlR3V0dGVyRGVjb3JhdGlvbnMoKVxuICAgICAgZWxzZVxuICAgICAgICBAdXBkYXRlSGlnaGxpZ2h0RGVjb3JhdGlvbnMoQHByZXZpb3VzVHlwZSlcbiAgICBlbHNlXG4gICAgICBAdXBkYXRlTWFya2VycygpXG5cbiAgdXBkYXRlU2Nyb2xsOiAtPlxuICAgIGlmIEBlZGl0b3JFbGVtZW50Lmhhc1RpbGVkUmVuZGVyaW5nIGFuZCBub3QgQHVzZU5hdGl2ZURlY29yYXRpb25zKClcbiAgICAgIEBzdHlsZS53ZWJraXRUcmFuc2Zvcm0gPSBcInRyYW5zbGF0ZTNkKCN7LUBlZGl0b3JTY3JvbGxMZWZ0fXB4LCAjey1AZWRpdG9yU2Nyb2xsVG9wfXB4LCAwKVwiXG5cbiAgZ2V0RWRpdG9yUm9vdDogLT4gQGVkaXRvckVsZW1lbnRcblxuICBlZGl0b3JDb25maWdDaGFuZ2VkOiAtPlxuICAgIHJldHVybiBpZiBub3QgQHBhcmVudE5vZGU/IG9yIEB1c2VOYXRpdmVEZWNvcmF0aW9ucygpXG4gICAgQHVzZWRNYXJrZXJzLmZvckVhY2ggKG1hcmtlcikgPT5cbiAgICAgIGlmIG1hcmtlci5jb2xvck1hcmtlcj9cbiAgICAgICAgbWFya2VyLnJlbmRlcigpXG4gICAgICBlbHNlXG4gICAgICAgIGNvbnNvbGUud2FybiBcIkEgbWFya2VyIHZpZXcgd2FzIGZvdW5kIGluIHRoZSB1c2VkIGluc3RhbmNlIHBvb2wgd2hpbGUgaGF2aW5nIGEgbnVsbCBtb2RlbFwiLCBtYXJrZXJcbiAgICAgICAgQHJlbGVhc2VNYXJrZXJFbGVtZW50KG1hcmtlcilcblxuICAgIEB1cGRhdGVNYXJrZXJzKClcblxuICBpc0d1dHRlclR5cGU6ICh0eXBlPUBwcmV2aW91c1R5cGUpIC0+XG4gICAgdHlwZSBpbiBbJ2d1dHRlcicsICduYXRpdmUtZG90JywgJ25hdGl2ZS1zcXVhcmUtZG90J11cblxuICBpc0RvdFR5cGU6ICAodHlwZT1AcHJldmlvdXNUeXBlKSAtPlxuICAgIHR5cGUgaW4gWyduYXRpdmUtZG90JywgJ25hdGl2ZS1zcXVhcmUtZG90J11cblxuICB1c2VOYXRpdmVEZWNvcmF0aW9uczogLT5cbiAgICBAaXNOYXRpdmVEZWNvcmF0aW9uVHlwZShAcHJldmlvdXNUeXBlKVxuXG4gIGlzTmF0aXZlRGVjb3JhdGlvblR5cGU6ICh0eXBlKSAtPlxuICAgIENvbG9yTWFya2VyRWxlbWVudCA/PSByZXF1aXJlICcuL2NvbG9yLW1hcmtlci1lbGVtZW50J1xuXG4gICAgQ29sb3JNYXJrZXJFbGVtZW50LmlzTmF0aXZlRGVjb3JhdGlvblR5cGUodHlwZSlcblxuICBpbml0aWFsaXplTmF0aXZlRGVjb3JhdGlvbnM6ICh0eXBlKSAtPlxuICAgICAgQHJlbGVhc2VBbGxNYXJrZXJWaWV3cygpXG4gICAgICBAZGVzdHJveU5hdGl2ZURlY29yYXRpb25zKClcblxuICAgICAgaWYgQGlzR3V0dGVyVHlwZSh0eXBlKVxuICAgICAgICBAaW5pdGlhbGl6ZUd1dHRlcih0eXBlKVxuICAgICAgZWxzZVxuICAgICAgICBAdXBkYXRlSGlnaGxpZ2h0RGVjb3JhdGlvbnModHlwZSlcblxuICBkZXN0cm95TmF0aXZlRGVjb3JhdGlvbnM6IC0+XG4gICAgaWYgQGlzR3V0dGVyVHlwZSgpXG4gICAgICBAZGVzdHJveUd1dHRlcigpXG4gICAgZWxzZVxuICAgICAgQGRlc3Ryb3lIaWdobGlnaHREZWNvcmF0aW9ucygpXG5cbiAgIyMgICAjIyAgICAgIyMgIyMgICMjIyMjIyAgICMjICAgICAjIyAjIyAgICAgICAjIyAgIyMjIyMjICAgIyMgICAgICMjICMjIyMjIyMjXG4gICMjICAgIyMgICAgICMjICMjICMjICAgICMjICAjIyAgICAgIyMgIyMgICAgICAgIyMgIyMgICAgIyMgICMjICAgICAjIyAgICAjI1xuICAjIyAgICMjICAgICAjIyAjIyAjIyAgICAgICAgIyMgICAgICMjICMjICAgICAgICMjICMjICAgICAgICAjIyAgICAgIyMgICAgIyNcbiAgIyMgICAjIyMjIyMjIyMgIyMgIyMgICAjIyMjICMjIyMjIyMjIyAjIyAgICAgICAjIyAjIyAgICMjIyMgIyMjIyMjIyMjICAgICMjXG4gICMjICAgIyMgICAgICMjICMjICMjICAgICMjICAjIyAgICAgIyMgIyMgICAgICAgIyMgIyMgICAgIyMgICMjICAgICAjIyAgICAjI1xuICAjIyAgICMjICAgICAjIyAjIyAjIyAgICAjIyAgIyMgICAgICMjICMjICAgICAgICMjICMjICAgICMjICAjIyAgICAgIyMgICAgIyNcbiAgIyMgICAjIyAgICAgIyMgIyMgICMjIyMjIyAgICMjICAgICAjIyAjIyMjIyMjIyAjIyAgIyMjIyMjICAgIyMgICAgICMjICAgICMjXG5cbiAgdXBkYXRlSGlnaGxpZ2h0RGVjb3JhdGlvbnM6ICh0eXBlKSAtPlxuICAgIHJldHVybiBpZiBAZWRpdG9yLmlzRGVzdHJveWVkKClcblxuICAgIEBzdHlsZUJ5TWFya2VySWQgPz0ge31cbiAgICBAZGVjb3JhdGlvbkJ5TWFya2VySWQgPz0ge31cblxuICAgIG1hcmtlcnMgPSBAY29sb3JCdWZmZXIuZ2V0VmFsaWRDb2xvck1hcmtlcnMoKVxuXG4gICAgZm9yIG0gaW4gQGRpc3BsYXllZE1hcmtlcnMgd2hlbiBtIG5vdCBpbiBtYXJrZXJzXG4gICAgICBAZGVjb3JhdGlvbkJ5TWFya2VySWRbbS5pZF0/LmRlc3Ryb3koKVxuICAgICAgQHJlbW92ZUNoaWxkKEBzdHlsZUJ5TWFya2VySWRbbS5pZF0pXG4gICAgICBkZWxldGUgQHN0eWxlQnlNYXJrZXJJZFttLmlkXVxuICAgICAgZGVsZXRlIEBkZWNvcmF0aW9uQnlNYXJrZXJJZFttLmlkXVxuXG4gICAgbWFya2Vyc0J5Um93cyA9IHt9XG4gICAgbWF4Um93TGVuZ3RoID0gMFxuXG4gICAgZm9yIG0gaW4gbWFya2Vyc1xuICAgICAgaWYgbS5jb2xvcj8uaXNWYWxpZCgpIGFuZCBtIG5vdCBpbiBAZGlzcGxheWVkTWFya2Vyc1xuICAgICAgICB7Y2xhc3NOYW1lLCBzdHlsZX0gPSBAZ2V0SGlnaGxpZ2hEZWNvcmF0aW9uQ1NTKG0sIHR5cGUpXG4gICAgICAgIEBhcHBlbmRDaGlsZChzdHlsZSlcbiAgICAgICAgQHN0eWxlQnlNYXJrZXJJZFttLmlkXSA9IHN0eWxlXG4gICAgICAgIEBkZWNvcmF0aW9uQnlNYXJrZXJJZFttLmlkXSA9IEBlZGl0b3IuZGVjb3JhdGVNYXJrZXIobS5tYXJrZXIsIHtcbiAgICAgICAgICB0eXBlOiAnaGlnaGxpZ2h0J1xuICAgICAgICAgIGNsYXNzOiBcInBpZ21lbnRzLSN7dHlwZX0gI3tjbGFzc05hbWV9XCJcbiAgICAgICAgICBpbmNsdWRlTWFya2VyVGV4dDogdHlwZSBpcyAnaGlnaGxpZ2h0J1xuICAgICAgICB9KVxuXG4gICAgQGRpc3BsYXllZE1hcmtlcnMgPSBtYXJrZXJzXG4gICAgQGVtaXR0ZXIuZW1pdCAnZGlkLXVwZGF0ZSdcblxuICBkZXN0cm95SGlnaGxpZ2h0RGVjb3JhdGlvbnM6IC0+XG4gICAgZm9yIGlkLCBkZWNvIG9mIEBkZWNvcmF0aW9uQnlNYXJrZXJJZFxuICAgICAgQHJlbW92ZUNoaWxkKEBzdHlsZUJ5TWFya2VySWRbaWRdKSBpZiBAc3R5bGVCeU1hcmtlcklkW2lkXT9cbiAgICAgIGRlY28uZGVzdHJveSgpXG5cbiAgICBkZWxldGUgQGRlY29yYXRpb25CeU1hcmtlcklkXG4gICAgZGVsZXRlIEBzdHlsZUJ5TWFya2VySWRcbiAgICBAZGlzcGxheWVkTWFya2VycyA9IFtdXG5cbiAgZ2V0SGlnaGxpZ2hEZWNvcmF0aW9uQ1NTOiAobWFya2VyLCB0eXBlKSAtPlxuICAgIGNsYXNzTmFtZSA9IFwicGlnbWVudHMtaGlnaGxpZ2h0LSN7bmV4dEhpZ2hsaWdodElkKyt9XCJcbiAgICBzdHlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJylcbiAgICBsID0gbWFya2VyLmNvbG9yLmx1bWFcblxuICAgIGlmIHR5cGUgaXMgJ25hdGl2ZS1iYWNrZ3JvdW5kJ1xuICAgICAgc3R5bGUuaW5uZXJIVE1MID0gXCJcIlwiXG4gICAgICAuI3tjbGFzc05hbWV9IC5yZWdpb24ge1xuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAje21hcmtlci5jb2xvci50b0NTUygpfTtcbiAgICAgICAgY29sb3I6ICN7aWYgbCA+IDAuNDMgdGhlbiAnYmxhY2snIGVsc2UgJ3doaXRlJ307XG4gICAgICB9XG4gICAgICBcIlwiXCJcbiAgICBlbHNlIGlmIHR5cGUgaXMgJ25hdGl2ZS11bmRlcmxpbmUnXG4gICAgICBzdHlsZS5pbm5lckhUTUwgPSBcIlwiXCJcbiAgICAgIC4je2NsYXNzTmFtZX0gLnJlZ2lvbiB7XG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6ICN7bWFya2VyLmNvbG9yLnRvQ1NTKCl9O1xuICAgICAgfVxuICAgICAgXCJcIlwiXG4gICAgZWxzZSBpZiB0eXBlIGlzICduYXRpdmUtb3V0bGluZSdcbiAgICAgIHN0eWxlLmlubmVySFRNTCA9IFwiXCJcIlxuICAgICAgLiN7Y2xhc3NOYW1lfSAucmVnaW9uIHtcbiAgICAgICAgYm9yZGVyLWNvbG9yOiAje21hcmtlci5jb2xvci50b0NTUygpfTtcbiAgICAgIH1cbiAgICAgIFwiXCJcIlxuXG4gICAge2NsYXNzTmFtZSwgc3R5bGV9XG5cbiAgIyMgICAgICMjIyMjIyAgICMjICAgICAjIyAjIyMjIyMjIyAjIyMjIyMjIyAjIyMjIyMjIyAjIyMjIyMjI1xuICAjIyAgICAjIyAgICAjIyAgIyMgICAgICMjICAgICMjICAgICAgICMjICAgICMjICAgICAgICMjICAgICAjI1xuICAjIyAgICAjIyAgICAgICAgIyMgICAgICMjICAgICMjICAgICAgICMjICAgICMjICAgICAgICMjICAgICAjI1xuICAjIyAgICAjIyAgICMjIyMgIyMgICAgICMjICAgICMjICAgICAgICMjICAgICMjIyMjIyAgICMjIyMjIyMjXG4gICMjICAgICMjICAgICMjICAjIyAgICAgIyMgICAgIyMgICAgICAgIyMgICAgIyMgICAgICAgIyMgICAjI1xuICAjIyAgICAjIyAgICAjIyAgIyMgICAgICMjICAgICMjICAgICAgICMjICAgICMjICAgICAgICMjICAgICMjXG4gICMjICAgICAjIyMjIyMgICAgIyMjIyMjIyAgICAgIyMgICAgICAgIyMgICAgIyMjIyMjIyMgIyMgICAgICMjXG5cbiAgaW5pdGlhbGl6ZUd1dHRlcjogKHR5cGUpIC0+XG4gICAgb3B0aW9ucyA9IG5hbWU6IFwicGlnbWVudHMtI3t0eXBlfVwiXG4gICAgb3B0aW9ucy5wcmlvcml0eSA9IDEwMDAgaWYgdHlwZSBpc250ICdndXR0ZXInXG5cbiAgICBAZ3V0dGVyID0gQGVkaXRvci5hZGRHdXR0ZXIob3B0aW9ucylcbiAgICBAZGlzcGxheWVkTWFya2VycyA9IFtdXG4gICAgQGRlY29yYXRpb25CeU1hcmtlcklkID89IHt9XG4gICAgZ3V0dGVyQ29udGFpbmVyID0gQGdldEVkaXRvclJvb3QoKS5xdWVyeVNlbGVjdG9yKCcuZ3V0dGVyLWNvbnRhaW5lcicpXG4gICAgQGd1dHRlclN1YnNjcmlwdGlvbiA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG5cbiAgICBAZ3V0dGVyU3Vic2NyaXB0aW9uLmFkZCBAc3Vic2NyaWJlVG8gZ3V0dGVyQ29udGFpbmVyLFxuICAgICAgbW91c2Vkb3duOiAoZSkgPT5cbiAgICAgICAgdGFyZ2V0RGVjb3JhdGlvbiA9IGUucGF0aFswXVxuXG4gICAgICAgIHVubGVzcyB0YXJnZXREZWNvcmF0aW9uLm1hdGNoZXMoJ3NwYW4nKVxuICAgICAgICAgIHRhcmdldERlY29yYXRpb24gPSB0YXJnZXREZWNvcmF0aW9uLnF1ZXJ5U2VsZWN0b3IoJ3NwYW4nKVxuXG4gICAgICAgIHJldHVybiB1bmxlc3MgdGFyZ2V0RGVjb3JhdGlvbj9cblxuICAgICAgICBtYXJrZXJJZCA9IHRhcmdldERlY29yYXRpb24uZGF0YXNldC5tYXJrZXJJZFxuICAgICAgICBjb2xvck1hcmtlciA9IEBkaXNwbGF5ZWRNYXJrZXJzLmZpbHRlcigobSkgLT4gbS5pZCBpcyBOdW1iZXIobWFya2VySWQpKVswXVxuXG4gICAgICAgIHJldHVybiB1bmxlc3MgY29sb3JNYXJrZXI/IGFuZCBAY29sb3JCdWZmZXI/XG5cbiAgICAgICAgQGNvbG9yQnVmZmVyLnNlbGVjdENvbG9yTWFya2VyQW5kT3BlblBpY2tlcihjb2xvck1hcmtlcilcblxuICAgIGlmIEBpc0RvdFR5cGUodHlwZSlcbiAgICAgIEBndXR0ZXJTdWJzY3JpcHRpb24uYWRkIEBlZGl0b3Iub25EaWRDaGFuZ2UgKGNoYW5nZXMpID0+XG4gICAgICAgIGlmIEFycmF5LmlzQXJyYXkgY2hhbmdlc1xuICAgICAgICAgIGNoYW5nZXM/LmZvckVhY2ggKGNoYW5nZSkgPT5cbiAgICAgICAgICAgIEB1cGRhdGVEb3REZWNvcmF0aW9uc09mZnNldHMoY2hhbmdlLnN0YXJ0LnJvdywgY2hhbmdlLm5ld0V4dGVudC5yb3cpXG5cbiAgICAgICAgZWxzZSBpZiBjaGFuZ2VzLnN0YXJ0PyBhbmQgY2hhbmdlcy5uZXdFeHRlbnQ/XG4gICAgICAgICAgQHVwZGF0ZURvdERlY29yYXRpb25zT2Zmc2V0cyhjaGFuZ2VzLnN0YXJ0LnJvdywgY2hhbmdlcy5uZXdFeHRlbnQucm93KVxuXG4gICAgQHVwZGF0ZUd1dHRlckRlY29yYXRpb25zKHR5cGUpXG5cbiAgZGVzdHJveUd1dHRlcjogLT5cbiAgICBAZ3V0dGVyLmRlc3Ryb3koKVxuICAgIEBndXR0ZXJTdWJzY3JpcHRpb24uZGlzcG9zZSgpXG4gICAgQGRpc3BsYXllZE1hcmtlcnMgPSBbXVxuICAgIGRlY29yYXRpb24uZGVzdHJveSgpIGZvciBpZCwgZGVjb3JhdGlvbiBvZiBAZGVjb3JhdGlvbkJ5TWFya2VySWRcbiAgICBkZWxldGUgQGRlY29yYXRpb25CeU1hcmtlcklkXG4gICAgZGVsZXRlIEBndXR0ZXJTdWJzY3JpcHRpb25cblxuICB1cGRhdGVHdXR0ZXJEZWNvcmF0aW9uczogKHR5cGU9QHByZXZpb3VzVHlwZSkgLT5cbiAgICByZXR1cm4gaWYgQGVkaXRvci5pc0Rlc3Ryb3llZCgpXG5cbiAgICBtYXJrZXJzID0gQGNvbG9yQnVmZmVyLmdldFZhbGlkQ29sb3JNYXJrZXJzKClcblxuICAgIGZvciBtIGluIEBkaXNwbGF5ZWRNYXJrZXJzIHdoZW4gbSBub3QgaW4gbWFya2Vyc1xuICAgICAgQGRlY29yYXRpb25CeU1hcmtlcklkW20uaWRdPy5kZXN0cm95KClcbiAgICAgIGRlbGV0ZSBAZGVjb3JhdGlvbkJ5TWFya2VySWRbbS5pZF1cblxuICAgIG1hcmtlcnNCeVJvd3MgPSB7fVxuICAgIG1heFJvd0xlbmd0aCA9IDBcbiAgICBtYXhEZWNvcmF0aW9uc0luR3V0dGVyID0gYXRvbS5jb25maWcuZ2V0KCdwaWdtZW50cy5tYXhEZWNvcmF0aW9uc0luR3V0dGVyJylcblxuICAgIGZvciBtIGluIG1hcmtlcnNcbiAgICAgIGlmIG0uY29sb3I/LmlzVmFsaWQoKSBhbmQgbSBub3QgaW4gQGRpc3BsYXllZE1hcmtlcnNcbiAgICAgICAgQGRlY29yYXRpb25CeU1hcmtlcklkW20uaWRdID0gQGd1dHRlci5kZWNvcmF0ZU1hcmtlcihtLm1hcmtlciwge1xuICAgICAgICAgIHR5cGU6ICdndXR0ZXInXG4gICAgICAgICAgY2xhc3M6ICdwaWdtZW50cy1ndXR0ZXItbWFya2VyJ1xuICAgICAgICAgIGl0ZW06IEBnZXRHdXR0ZXJEZWNvcmF0aW9uSXRlbShtKVxuICAgICAgICB9KVxuXG4gICAgICBkZWNvID0gQGRlY29yYXRpb25CeU1hcmtlcklkW20uaWRdXG4gICAgICByb3cgPSBtLm1hcmtlci5nZXRTdGFydFNjcmVlblBvc2l0aW9uKCkucm93XG4gICAgICBtYXJrZXJzQnlSb3dzW3Jvd10gPz0gMFxuXG4gICAgICBjb250aW51ZSBpZiBtYXJrZXJzQnlSb3dzW3Jvd10gPj0gbWF4RGVjb3JhdGlvbnNJbkd1dHRlclxuXG4gICAgICByb3dMZW5ndGggPSAwXG5cbiAgICAgIGlmIHR5cGUgaXNudCAnZ3V0dGVyJ1xuICAgICAgICByb3dMZW5ndGggPSBAZWRpdG9yRWxlbWVudC5waXhlbFBvc2l0aW9uRm9yU2NyZWVuUG9zaXRpb24oW3JvdywgSW5maW5pdHldKS5sZWZ0XG5cbiAgICAgIGRlY29XaWR0aCA9IDE0XG5cbiAgICAgIGRlY28ucHJvcGVydGllcy5pdGVtLnN0eWxlLmxlZnQgPSBcIiN7cm93TGVuZ3RoICsgbWFya2Vyc0J5Um93c1tyb3ddICogZGVjb1dpZHRofXB4XCJcblxuICAgICAgbWFya2Vyc0J5Um93c1tyb3ddKytcbiAgICAgIG1heFJvd0xlbmd0aCA9IE1hdGgubWF4KG1heFJvd0xlbmd0aCwgbWFya2Vyc0J5Um93c1tyb3ddKVxuXG4gICAgaWYgdHlwZSBpcyAnZ3V0dGVyJ1xuICAgICAgYXRvbS52aWV3cy5nZXRWaWV3KEBndXR0ZXIpLnN0eWxlLm1pbldpZHRoID0gXCIje21heFJvd0xlbmd0aCAqIGRlY29XaWR0aH1weFwiXG4gICAgZWxzZVxuICAgICAgYXRvbS52aWV3cy5nZXRWaWV3KEBndXR0ZXIpLnN0eWxlLndpZHRoID0gXCIwcHhcIlxuXG4gICAgQGRpc3BsYXllZE1hcmtlcnMgPSBtYXJrZXJzXG4gICAgQGVtaXR0ZXIuZW1pdCAnZGlkLXVwZGF0ZSdcblxuICB1cGRhdGVEb3REZWNvcmF0aW9uc09mZnNldHM6IChyb3dTdGFydCwgcm93RW5kKSAtPlxuICAgIG1hcmtlcnNCeVJvd3MgPSB7fVxuXG4gICAgZm9yIHJvdyBpbiBbcm93U3RhcnQuLnJvd0VuZF1cbiAgICAgIGZvciBtIGluIEBkaXNwbGF5ZWRNYXJrZXJzXG4gICAgICAgIGRlY28gPSBAZGVjb3JhdGlvbkJ5TWFya2VySWRbbS5pZF1cbiAgICAgICAgY29udGludWUgdW5sZXNzIG0ubWFya2VyP1xuICAgICAgICBtYXJrZXJSb3cgPSBtLm1hcmtlci5nZXRTdGFydFNjcmVlblBvc2l0aW9uKCkucm93XG4gICAgICAgIGNvbnRpbnVlIHVubGVzcyByb3cgaXMgbWFya2VyUm93XG5cbiAgICAgICAgbWFya2Vyc0J5Um93c1tyb3ddID89IDBcblxuICAgICAgICByb3dMZW5ndGggPSBAZWRpdG9yRWxlbWVudC5waXhlbFBvc2l0aW9uRm9yU2NyZWVuUG9zaXRpb24oW3JvdywgSW5maW5pdHldKS5sZWZ0XG5cbiAgICAgICAgZGVjb1dpZHRoID0gMTRcblxuICAgICAgICBkZWNvLnByb3BlcnRpZXMuaXRlbS5zdHlsZS5sZWZ0ID0gXCIje3Jvd0xlbmd0aCArIG1hcmtlcnNCeVJvd3Nbcm93XSAqIGRlY29XaWR0aH1weFwiXG4gICAgICAgIG1hcmtlcnNCeVJvd3Nbcm93XSsrXG5cbiAgZ2V0R3V0dGVyRGVjb3JhdGlvbkl0ZW06IChtYXJrZXIpIC0+XG4gICAgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICBkaXYuaW5uZXJIVE1MID0gXCJcIlwiXG4gICAgPHNwYW4gc3R5bGU9J2JhY2tncm91bmQtY29sb3I6ICN7bWFya2VyLmNvbG9yLnRvQ1NTKCl9OycgZGF0YS1tYXJrZXItaWQ9JyN7bWFya2VyLmlkfSc+PC9zcGFuPlxuICAgIFwiXCJcIlxuICAgIGRpdlxuXG4gICMjICAgICMjICAgICAjIyAgICAjIyMgICAgIyMjIyMjIyMgICMjICAgICMjICMjIyMjIyMjICMjIyMjIyMjICAgIyMjIyMjXG4gICMjICAgICMjIyAgICMjIyAgICMjICMjICAgIyMgICAgICMjICMjICAgIyMgICMjICAgICAgICMjICAgICAjIyAjIyAgICAjI1xuICAjIyAgICAjIyMjICMjIyMgICMjICAgIyMgICMjICAgICAjIyAjIyAgIyMgICAjIyAgICAgICAjIyAgICAgIyMgIyNcbiAgIyMgICAgIyMgIyMjICMjICMjICAgICAjIyAjIyMjIyMjIyAgIyMjIyMgICAgIyMjIyMjICAgIyMjIyMjIyMgICAjIyMjIyNcbiAgIyMgICAgIyMgICAgICMjICMjIyMjIyMjIyAjIyAgICMjICAgIyMgICMjICAgIyMgICAgICAgIyMgICAjIyAgICAgICAgICMjXG4gICMjICAgICMjICAgICAjIyAjIyAgICAgIyMgIyMgICAgIyMgICMjICAgIyMgICMjICAgICAgICMjICAgICMjICAjIyAgICAjI1xuICAjIyAgICAjIyAgICAgIyMgIyMgICAgICMjICMjICAgICAjIyAjIyAgICAjIyAjIyMjIyMjIyAjIyAgICAgIyMgICMjIyMjI1xuXG4gIHJlcXVlc3RNYXJrZXJVcGRhdGU6IChtYXJrZXJzKSAtPlxuICAgIGlmIEBmcmFtZVJlcXVlc3RlZFxuICAgICAgQGRpcnR5TWFya2VycyA9IEBkaXJ0eU1hcmtlcnMuY29uY2F0KG1hcmtlcnMpXG4gICAgICByZXR1cm5cbiAgICBlbHNlXG4gICAgICBAZGlydHlNYXJrZXJzID0gbWFya2Vycy5zbGljZSgpXG4gICAgICBAZnJhbWVSZXF1ZXN0ZWQgPSB0cnVlXG5cbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPT5cbiAgICAgIGRpcnR5TWFya2VycyA9IFtdXG4gICAgICBkaXJ0eU1hcmtlcnMucHVzaChtKSBmb3IgbSBpbiBAZGlydHlNYXJrZXJzIHdoZW4gbSBub3QgaW4gZGlydHlNYXJrZXJzXG5cbiAgICAgIGRlbGV0ZSBAZnJhbWVSZXF1ZXN0ZWRcbiAgICAgIGRlbGV0ZSBAZGlydHlNYXJrZXJzXG5cbiAgICAgIHJldHVybiB1bmxlc3MgQGNvbG9yQnVmZmVyP1xuXG4gICAgICBkaXJ0eU1hcmtlcnMuZm9yRWFjaCAobWFya2VyKSAtPiBtYXJrZXIucmVuZGVyKClcblxuICB1cGRhdGVNYXJrZXJzOiAodHlwZT1AcHJldmlvdXNUeXBlKSAtPlxuICAgIHJldHVybiBpZiBAZWRpdG9yLmlzRGVzdHJveWVkKClcblxuICAgIG1hcmtlcnMgPSBAY29sb3JCdWZmZXIuZmluZFZhbGlkQ29sb3JNYXJrZXJzKHtcbiAgICAgIGludGVyc2VjdHNTY3JlZW5Sb3dSYW5nZTogQGVkaXRvckVsZW1lbnQuZ2V0VmlzaWJsZVJvd1JhbmdlPygpID8gQGVkaXRvci5nZXRWaXNpYmxlUm93UmFuZ2U/KClcbiAgICB9KVxuXG4gICAgZm9yIG0gaW4gQGRpc3BsYXllZE1hcmtlcnMgd2hlbiBtIG5vdCBpbiBtYXJrZXJzXG4gICAgICBAcmVsZWFzZU1hcmtlclZpZXcobSlcblxuICAgIGZvciBtIGluIG1hcmtlcnMgd2hlbiBtLmNvbG9yPy5pc1ZhbGlkKCkgYW5kIG0gbm90IGluIEBkaXNwbGF5ZWRNYXJrZXJzXG4gICAgICBAcmVxdWVzdE1hcmtlclZpZXcobSlcblxuICAgIEBkaXNwbGF5ZWRNYXJrZXJzID0gbWFya2Vyc1xuXG4gICAgQGVtaXR0ZXIuZW1pdCAnZGlkLXVwZGF0ZSdcblxuICByZXF1ZXN0TWFya2VyVmlldzogKG1hcmtlcikgLT5cbiAgICBpZiBAdW51c2VkTWFya2Vycy5sZW5ndGhcbiAgICAgIHZpZXcgPSBAdW51c2VkTWFya2Vycy5zaGlmdCgpXG4gICAgZWxzZVxuICAgICAgQ29sb3JNYXJrZXJFbGVtZW50ID89IHJlcXVpcmUgJy4vY29sb3ItbWFya2VyLWVsZW1lbnQnXG5cbiAgICAgIHZpZXcgPSBuZXcgQ29sb3JNYXJrZXJFbGVtZW50XG4gICAgICB2aWV3LnNldENvbnRhaW5lcih0aGlzKVxuICAgICAgdmlldy5vbkRpZFJlbGVhc2UgKHttYXJrZXJ9KSA9PlxuICAgICAgICBAZGlzcGxheWVkTWFya2Vycy5zcGxpY2UoQGRpc3BsYXllZE1hcmtlcnMuaW5kZXhPZihtYXJrZXIpLCAxKVxuICAgICAgICBAcmVsZWFzZU1hcmtlclZpZXcobWFya2VyKVxuICAgICAgQGFwcGVuZENoaWxkIHZpZXdcblxuICAgIHZpZXcuc2V0TW9kZWwobWFya2VyKVxuXG4gICAgQGhpZGVNYXJrZXJJZkluU2VsZWN0aW9uT3JGb2xkKG1hcmtlciwgdmlldylcbiAgICBAdXNlZE1hcmtlcnMucHVzaCh2aWV3KVxuICAgIEB2aWV3c0J5TWFya2Vycy5zZXQobWFya2VyLCB2aWV3KVxuICAgIHZpZXdcblxuICByZWxlYXNlTWFya2VyVmlldzogKG1hcmtlck9yVmlldykgLT5cbiAgICBtYXJrZXIgPSBtYXJrZXJPclZpZXdcbiAgICB2aWV3ID0gQHZpZXdzQnlNYXJrZXJzLmdldChtYXJrZXJPclZpZXcpXG5cbiAgICBpZiB2aWV3P1xuICAgICAgQHZpZXdzQnlNYXJrZXJzLmRlbGV0ZShtYXJrZXIpIGlmIG1hcmtlcj9cbiAgICAgIEByZWxlYXNlTWFya2VyRWxlbWVudCh2aWV3KVxuXG4gIHJlbGVhc2VNYXJrZXJFbGVtZW50OiAodmlldykgLT5cbiAgICBAdXNlZE1hcmtlcnMuc3BsaWNlKEB1c2VkTWFya2Vycy5pbmRleE9mKHZpZXcpLCAxKVxuICAgIHZpZXcucmVsZWFzZShmYWxzZSkgdW5sZXNzIHZpZXcuaXNSZWxlYXNlZCgpXG4gICAgQHVudXNlZE1hcmtlcnMucHVzaCh2aWV3KVxuXG4gIHJlbGVhc2VBbGxNYXJrZXJWaWV3czogLT5cbiAgICB2aWV3LmRlc3Ryb3koKSBmb3IgdmlldyBpbiBAdXNlZE1hcmtlcnNcbiAgICB2aWV3LmRlc3Ryb3koKSBmb3IgdmlldyBpbiBAdW51c2VkTWFya2Vyc1xuXG4gICAgQHVzZWRNYXJrZXJzID0gW11cbiAgICBAdW51c2VkTWFya2VycyA9IFtdXG5cbiAgICBBcnJheTo6Zm9yRWFjaC5jYWxsIEBxdWVyeVNlbGVjdG9yQWxsKCdwaWdtZW50cy1jb2xvci1tYXJrZXInKSwgKGVsKSAtPiBlbC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGVsKVxuXG4gICMjICAgICAjIyMjIyMgICMjIyMjIyMjICMjICAgICAgICMjIyMjIyMjICAjIyMjIyMgICMjIyMjIyMjXG4gICMjICAgICMjICAgICMjICMjICAgICAgICMjICAgICAgICMjICAgICAgICMjICAgICMjICAgICMjXG4gICMjICAgICMjICAgICAgICMjICAgICAgICMjICAgICAgICMjICAgICAgICMjICAgICAgICAgICMjXG4gICMjICAgICAjIyMjIyMgICMjIyMjIyAgICMjICAgICAgICMjIyMjIyAgICMjICAgICAgICAgICMjXG4gICMjICAgICAgICAgICMjICMjICAgICAgICMjICAgICAgICMjICAgICAgICMjICAgICAgICAgICMjXG4gICMjICAgICMjICAgICMjICMjICAgICAgICMjICAgICAgICMjICAgICAgICMjICAgICMjICAgICMjXG4gICMjICAgICAjIyMjIyMgICMjIyMjIyMjICMjIyMjIyMjICMjIyMjIyMjICAjIyMjIyMgICAgICMjXG5cbiAgcmVxdWVzdFNlbGVjdGlvblVwZGF0ZTogLT5cbiAgICByZXR1cm4gaWYgQHVwZGF0ZVJlcXVlc3RlZFxuXG4gICAgQHVwZGF0ZVJlcXVlc3RlZCA9IHRydWVcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPT5cbiAgICAgIEB1cGRhdGVSZXF1ZXN0ZWQgPSBmYWxzZVxuICAgICAgcmV0dXJuIGlmIEBlZGl0b3IuZ2V0QnVmZmVyKCkuaXNEZXN0cm95ZWQoKVxuICAgICAgQHVwZGF0ZVNlbGVjdGlvbnMoKVxuXG4gIHVwZGF0ZVNlbGVjdGlvbnM6IC0+XG4gICAgcmV0dXJuIGlmIEBlZGl0b3IuaXNEZXN0cm95ZWQoKVxuICAgIGlmIEB1c2VOYXRpdmVEZWNvcmF0aW9ucygpXG4gICAgICBmb3IgbWFya2VyIGluIEBkaXNwbGF5ZWRNYXJrZXJzXG4gICAgICAgIGRlY29yYXRpb24gPSBAZGVjb3JhdGlvbkJ5TWFya2VySWRbbWFya2VyLmlkXVxuXG4gICAgICAgIEBoaWRlRGVjb3JhdGlvbklmSW5TZWxlY3Rpb24obWFya2VyLCBkZWNvcmF0aW9uKSBpZiBkZWNvcmF0aW9uP1xuICAgIGVsc2VcbiAgICAgIGZvciBtYXJrZXIgaW4gQGRpc3BsYXllZE1hcmtlcnNcbiAgICAgICAgdmlldyA9IEB2aWV3c0J5TWFya2Vycy5nZXQobWFya2VyKVxuICAgICAgICBpZiB2aWV3P1xuICAgICAgICAgIHZpZXcuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJylcbiAgICAgICAgICB2aWV3LmNsYXNzTGlzdC5yZW1vdmUoJ2luLWZvbGQnKVxuICAgICAgICAgIEBoaWRlTWFya2VySWZJblNlbGVjdGlvbk9yRm9sZChtYXJrZXIsIHZpZXcpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBjb25zb2xlLndhcm4gXCJBIGNvbG9yIG1hcmtlciB3YXMgZm91bmQgaW4gdGhlIGRpc3BsYXllZCBtYXJrZXJzIGFycmF5IHdpdGhvdXQgYW4gYXNzb2NpYXRlZCB2aWV3XCIsIG1hcmtlclxuXG4gIGhpZGVEZWNvcmF0aW9uSWZJblNlbGVjdGlvbjogKG1hcmtlciwgZGVjb3JhdGlvbikgLT5cbiAgICBzZWxlY3Rpb25zID0gQGVkaXRvci5nZXRTZWxlY3Rpb25zKClcblxuICAgIHByb3BzID0gZGVjb3JhdGlvbi5nZXRQcm9wZXJ0aWVzKClcbiAgICBjbGFzc2VzID0gcHJvcHMuY2xhc3Muc3BsaXQoL1xccysvZylcblxuICAgIGZvciBzZWxlY3Rpb24gaW4gc2VsZWN0aW9uc1xuICAgICAgcmFuZ2UgPSBzZWxlY3Rpb24uZ2V0U2NyZWVuUmFuZ2UoKVxuICAgICAgbWFya2VyUmFuZ2UgPSBtYXJrZXIuZ2V0U2NyZWVuUmFuZ2UoKVxuXG4gICAgICBjb250aW51ZSB1bmxlc3MgbWFya2VyUmFuZ2U/IGFuZCByYW5nZT9cbiAgICAgIGlmIG1hcmtlclJhbmdlLmludGVyc2VjdHNXaXRoKHJhbmdlKVxuICAgICAgICBjbGFzc2VzWzBdICs9ICctaW4tc2VsZWN0aW9uJyB1bmxlc3MgY2xhc3Nlc1swXS5tYXRjaCgvLWluLXNlbGVjdGlvbiQvKT9cbiAgICAgICAgcHJvcHMuY2xhc3MgPSBjbGFzc2VzLmpvaW4oJyAnKVxuICAgICAgICBkZWNvcmF0aW9uLnNldFByb3BlcnRpZXMocHJvcHMpXG4gICAgICAgIHJldHVyblxuXG4gICAgY2xhc3NlcyA9IGNsYXNzZXMubWFwIChjbHMpIC0+IGNscy5yZXBsYWNlKCctaW4tc2VsZWN0aW9uJywgJycpXG4gICAgcHJvcHMuY2xhc3MgPSBjbGFzc2VzLmpvaW4oJyAnKVxuICAgIGRlY29yYXRpb24uc2V0UHJvcGVydGllcyhwcm9wcylcblxuICBoaWRlTWFya2VySWZJblNlbGVjdGlvbk9yRm9sZDogKG1hcmtlciwgdmlldykgLT5cbiAgICBzZWxlY3Rpb25zID0gQGVkaXRvci5nZXRTZWxlY3Rpb25zKClcblxuICAgIGZvciBzZWxlY3Rpb24gaW4gc2VsZWN0aW9uc1xuICAgICAgcmFuZ2UgPSBzZWxlY3Rpb24uZ2V0U2NyZWVuUmFuZ2UoKVxuICAgICAgbWFya2VyUmFuZ2UgPSBtYXJrZXIuZ2V0U2NyZWVuUmFuZ2UoKVxuXG4gICAgICBjb250aW51ZSB1bmxlc3MgbWFya2VyUmFuZ2U/IGFuZCByYW5nZT9cblxuICAgICAgdmlldy5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKSBpZiBtYXJrZXJSYW5nZS5pbnRlcnNlY3RzV2l0aChyYW5nZSlcbiAgICAgIHZpZXcuY2xhc3NMaXN0LmFkZCgnaW4tZm9sZCcpIGlmICBAZWRpdG9yLmlzRm9sZGVkQXRCdWZmZXJSb3cobWFya2VyLmdldEJ1ZmZlclJhbmdlKCkuc3RhcnQucm93KVxuXG4gICMjICAgICAjIyMjIyMgICAjIyMjIyMjICAjIyAgICAjIyAjIyMjIyMjIyAjIyMjIyMjIyAjIyAgICAgIyMgIyMjIyMjIyNcbiAgIyMgICAgIyMgICAgIyMgIyMgICAgICMjICMjIyAgICMjICAgICMjICAgICMjICAgICAgICAjIyAgICMjICAgICAjI1xuICAjIyAgICAjIyAgICAgICAjIyAgICAgIyMgIyMjIyAgIyMgICAgIyMgICAgIyMgICAgICAgICAjIyAjIyAgICAgICMjXG4gICMjICAgICMjICAgICAgICMjICAgICAjIyAjIyAjIyAjIyAgICAjIyAgICAjIyMjIyMgICAgICAjIyMgICAgICAgIyNcbiAgIyMgICAgIyMgICAgICAgIyMgICAgICMjICMjICAjIyMjICAgICMjICAgICMjICAgICAgICAgIyMgIyMgICAgICAjI1xuICAjIyAgICAjIyAgICAjIyAjIyAgICAgIyMgIyMgICAjIyMgICAgIyMgICAgIyMgICAgICAgICMjICAgIyMgICAgICMjXG4gICMjICAgICAjIyMjIyMgICAjIyMjIyMjICAjIyAgICAjIyAgICAjIyAgICAjIyMjIyMjIyAjIyAgICAgIyMgICAgIyNcbiAgIyNcbiAgIyMgICAgIyMgICAgICMjICMjIyMjIyMjICMjICAgICMjICMjICAgICAjI1xuICAjIyAgICAjIyMgICAjIyMgIyMgICAgICAgIyMjICAgIyMgIyMgICAgICMjXG4gICMjICAgICMjIyMgIyMjIyAjIyAgICAgICAjIyMjICAjIyAjIyAgICAgIyNcbiAgIyMgICAgIyMgIyMjICMjICMjIyMjIyAgICMjICMjICMjICMjICAgICAjI1xuICAjIyAgICAjIyAgICAgIyMgIyMgICAgICAgIyMgICMjIyMgIyMgICAgICMjXG4gICMjICAgICMjICAgICAjIyAjIyAgICAgICAjIyAgICMjIyAjIyAgICAgIyNcbiAgIyMgICAgIyMgICAgICMjICMjIyMjIyMjICMjICAgICMjICAjIyMjIyMjXG5cbiAgY29sb3JNYXJrZXJGb3JNb3VzZUV2ZW50OiAoZXZlbnQpIC0+XG4gICAgcG9zaXRpb24gPSBAc2NyZWVuUG9zaXRpb25Gb3JNb3VzZUV2ZW50KGV2ZW50KVxuXG4gICAgcmV0dXJuIHVubGVzcyBwb3NpdGlvbj9cblxuICAgIGJ1ZmZlclBvc2l0aW9uID0gQGNvbG9yQnVmZmVyLmVkaXRvci5idWZmZXJQb3NpdGlvbkZvclNjcmVlblBvc2l0aW9uKHBvc2l0aW9uKVxuXG4gICAgQGNvbG9yQnVmZmVyLmdldENvbG9yTWFya2VyQXRCdWZmZXJQb3NpdGlvbihidWZmZXJQb3NpdGlvbilcblxuICBzY3JlZW5Qb3NpdGlvbkZvck1vdXNlRXZlbnQ6IChldmVudCkgLT5cbiAgICBwaXhlbFBvc2l0aW9uID0gQHBpeGVsUG9zaXRpb25Gb3JNb3VzZUV2ZW50KGV2ZW50KVxuXG4gICAgcmV0dXJuIHVubGVzcyBwaXhlbFBvc2l0aW9uP1xuXG4gICAgaWYgQGVkaXRvckVsZW1lbnQuc2NyZWVuUG9zaXRpb25Gb3JQaXhlbFBvc2l0aW9uP1xuICAgICAgQGVkaXRvckVsZW1lbnQuc2NyZWVuUG9zaXRpb25Gb3JQaXhlbFBvc2l0aW9uKHBpeGVsUG9zaXRpb24pXG4gICAgZWxzZVxuICAgICAgQGVkaXRvci5zY3JlZW5Qb3NpdGlvbkZvclBpeGVsUG9zaXRpb24ocGl4ZWxQb3NpdGlvbilcblxuICBwaXhlbFBvc2l0aW9uRm9yTW91c2VFdmVudDogKGV2ZW50KSAtPlxuICAgIHtjbGllbnRYLCBjbGllbnRZfSA9IGV2ZW50XG5cbiAgICBzY3JvbGxUYXJnZXQgPSBpZiBAZWRpdG9yRWxlbWVudC5nZXRTY3JvbGxUb3A/XG4gICAgICBAZWRpdG9yRWxlbWVudFxuICAgIGVsc2VcbiAgICAgIEBlZGl0b3JcblxuICAgIHJvb3RFbGVtZW50ID0gQGdldEVkaXRvclJvb3QoKVxuXG4gICAgcmV0dXJuIHVubGVzcyByb290RWxlbWVudC5xdWVyeVNlbGVjdG9yKCcubGluZXMnKT9cblxuICAgIHt0b3AsIGxlZnR9ID0gcm9vdEVsZW1lbnQucXVlcnlTZWxlY3RvcignLmxpbmVzJykuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICB0b3AgPSBjbGllbnRZIC0gdG9wICsgc2Nyb2xsVGFyZ2V0LmdldFNjcm9sbFRvcCgpXG4gICAgbGVmdCA9IGNsaWVudFggLSBsZWZ0ICsgc2Nyb2xsVGFyZ2V0LmdldFNjcm9sbExlZnQoKVxuICAgIHt0b3AsIGxlZnR9XG5cbm1vZHVsZS5leHBvcnRzID1cbkNvbG9yQnVmZmVyRWxlbWVudCA9XG5yZWdpc3Rlck9yVXBkYXRlRWxlbWVudCAncGlnbWVudHMtbWFya2VycycsIENvbG9yQnVmZmVyRWxlbWVudC5wcm90b3R5cGVcbiJdfQ==
