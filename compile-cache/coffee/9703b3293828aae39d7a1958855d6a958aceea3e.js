(function() {
  module.exports = function(colorPicker) {
    return {
      Emitter: (require('../modules/Emitter'))(),
      element: null,
      control: null,
      canvas: null,
      getHue: function() {
        if ((this.control && this.control.selection) && this.element) {
          return this.control.selection.y / this.element.getHeight() * 360;
        } else {
          return 0;
        }
      },
      emitSelectionChanged: function() {
        return this.Emitter.emit('selectionChanged', this.control.selection);
      },
      onSelectionChanged: function(callback) {
        return this.Emitter.on('selectionChanged', callback);
      },
      emitColorChanged: function() {
        return this.Emitter.emit('colorChanged', this.control.selection.color);
      },
      onColorChanged: function(callback) {
        return this.Emitter.on('colorChanged', callback);
      },
      activate: function() {
        var Body;
        Body = colorPicker.getExtension('Body');
        this.element = {
          el: (function() {
            var _classPrefix, _el;
            _classPrefix = Body.element.el.className;
            _el = document.createElement('div');
            _el.classList.add(_classPrefix + "-hue");
            return _el;
          })(),
          width: 0,
          height: 0,
          getWidth: function() {
            return this.width || this.el.offsetWidth;
          },
          getHeight: function() {
            return this.height || this.el.offsetHeight;
          },
          rect: null,
          getRect: function() {
            return this.rect || this.updateRect();
          },
          updateRect: function() {
            return this.rect = this.el.getClientRects()[0];
          },
          add: function(element) {
            this.el.appendChild(element);
            return this;
          }
        };
        Body.element.add(this.element.el, 2);
        colorPicker.onOpen((function(_this) {
          return function() {
            var _rect;
            if (!(_this.element.updateRect() && (_rect = _this.element.getRect()))) {
              return;
            }
            _this.width = _rect.width;
            return _this.height = _rect.height;
          };
        })(this));
        setTimeout((function(_this) {
          return function() {
            var Hue, _context, _elementHeight, _elementWidth, _gradient, _hex, _hexes, _i, _step, i, len;
            Hue = _this;
            _elementWidth = _this.element.getWidth();
            _elementHeight = _this.element.getHeight();
            _hexes = ['#f00', '#ff0', '#0f0', '#0ff', '#00f', '#f0f', '#f00'];
            _this.canvas = {
              el: (function() {
                var _el;
                _el = document.createElement('canvas');
                _el.width = _elementWidth;
                _el.height = _elementHeight;
                _el.classList.add(Hue.element.el.className + "-canvas");
                return _el;
              })(),
              context: null,
              getContext: function() {
                return this.context || (this.context = this.el.getContext('2d'));
              },
              getColorAtPosition: function(y) {
                return colorPicker.SmartColor.HSVArray([y / Hue.element.getHeight() * 360, 100, 100]);
              }
            };
            _context = _this.canvas.getContext();
            _step = 1 / (_hexes.length - 1);
            _gradient = _context.createLinearGradient(0, 0, 1, _elementHeight);
            for (_i = i = 0, len = _hexes.length; i < len; _i = ++i) {
              _hex = _hexes[_i];
              _gradient.addColorStop(_step * _i, _hex);
            }
            _context.fillStyle = _gradient;
            _context.fillRect(0, 0, _elementWidth, _elementHeight);
            return _this.element.add(_this.canvas.el);
          };
        })(this));
        setTimeout((function(_this) {
          return function() {
            var Hue, hasChild;
            hasChild = function(element, child) {
              var _parent;
              if (child && (_parent = child.parentNode)) {
                if (child === element) {
                  return true;
                } else {
                  return hasChild(element, _parent);
                }
              }
              return false;
            };
            Hue = _this;
            _this.control = {
              el: (function() {
                var _el;
                _el = document.createElement('div');
                _el.classList.add(Hue.element.el.className + "-control");
                return _el;
              })(),
              isGrabbing: false,
              selection: {
                y: 0,
                color: null
              },
              setSelection: function(e, y, offset) {
                var _height, _position, _rect, _width, _y;
                if (y == null) {
                  y = null;
                }
                if (offset == null) {
                  offset = null;
                }
                if (!(Hue.canvas && (_rect = Hue.element.getRect()))) {
                  return;
                }
                _width = Hue.element.getWidth();
                _height = Hue.element.getHeight();
                if (e) {
                  _y = e.pageY - _rect.top;
                } else if (typeof y === 'number') {
                  _y = y;
                } else if (typeof offset === 'number') {
                  _y = this.selection.y + offset;
                } else {
                  _y = this.selection.y;
                }
                _y = this.selection.y = Math.max(0, Math.min(_height, _y));
                this.selection.color = Hue.canvas.getColorAtPosition(_y);
                _position = {
                  y: Math.max(3, Math.min(_height - 6, _y))
                };
                requestAnimationFrame((function(_this) {
                  return function() {
                    return _this.el.style.top = _position.y + "px";
                  };
                })(this));
                return Hue.emitSelectionChanged();
              },
              refreshSelection: function() {
                return this.setSelection();
              }
            };
            _this.control.refreshSelection();
            colorPicker.onInputColor(function(smartColor) {
              var _hue;
              _hue = smartColor.toHSVArray()[0];
              return _this.control.setSelection(null, (_this.element.getHeight() / 360) * _hue);
            });
            Hue.onSelectionChanged(function() {
              return Hue.emitColorChanged();
            });
            colorPicker.onOpen(function() {
              return _this.control.refreshSelection();
            });
            colorPicker.onOpen(function() {
              return _this.control.isGrabbing = false;
            });
            colorPicker.onClose(function() {
              return _this.control.isGrabbing = false;
            });
            colorPicker.onMouseDown(function(e, isOnPicker) {
              if (!(isOnPicker && hasChild(Hue.element.el, e.target))) {
                return;
              }
              e.preventDefault();
              _this.control.isGrabbing = true;
              return _this.control.setSelection(e);
            });
            colorPicker.onMouseMove(function(e) {
              if (!_this.control.isGrabbing) {
                return;
              }
              return _this.control.setSelection(e);
            });
            colorPicker.onMouseUp(function(e) {
              if (!_this.control.isGrabbing) {
                return;
              }
              _this.control.isGrabbing = false;
              return _this.control.setSelection(e);
            });
            colorPicker.onMouseWheel(function(e, isOnPicker) {
              if (!(isOnPicker && hasChild(Hue.element.el, e.target))) {
                return;
              }
              e.preventDefault();
              return _this.control.setSelection(null, null, e.wheelDeltaY * .33);
            });
            return _this.element.add(_this.control.el);
          };
        })(this));
        return this;
      }
    };
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvdG95b2tpLy5hdG9tL3BhY2thZ2VzL2NvbG9yLXBpY2tlci9saWIvZXh0ZW5zaW9ucy9IdWUuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUtJO0VBQUEsTUFBTSxDQUFDLE9BQVAsR0FBaUIsU0FBQyxXQUFEO1dBQ2I7TUFBQSxPQUFBLEVBQVMsQ0FBQyxPQUFBLENBQVEsb0JBQVIsQ0FBRCxDQUFBLENBQUEsQ0FBVDtNQUVBLE9BQUEsRUFBUyxJQUZUO01BR0EsT0FBQSxFQUFTLElBSFQ7TUFJQSxNQUFBLEVBQVEsSUFKUjtNQVNBLE1BQUEsRUFBUSxTQUFBO1FBQ0osSUFBRyxDQUFDLElBQUMsQ0FBQSxPQUFELElBQWEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxTQUF2QixDQUFBLElBQXNDLElBQUMsQ0FBQSxPQUExQztBQUNJLGlCQUFPLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBUyxDQUFDLENBQW5CLEdBQXVCLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBVCxDQUFBLENBQXZCLEdBQThDLElBRHpEO1NBQUEsTUFBQTtBQUVLLGlCQUFPLEVBRlo7O01BREksQ0FUUjtNQWtCQSxvQkFBQSxFQUFzQixTQUFBO2VBQ2xCLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLGtCQUFkLEVBQWtDLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBM0M7TUFEa0IsQ0FsQnRCO01Bb0JBLGtCQUFBLEVBQW9CLFNBQUMsUUFBRDtlQUNoQixJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsQ0FBWSxrQkFBWixFQUFnQyxRQUFoQztNQURnQixDQXBCcEI7TUF3QkEsZ0JBQUEsRUFBa0IsU0FBQTtlQUNkLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLGNBQWQsRUFBOEIsSUFBQyxDQUFBLE9BQU8sQ0FBQyxTQUFTLENBQUMsS0FBakQ7TUFEYyxDQXhCbEI7TUEwQkEsY0FBQSxFQUFnQixTQUFDLFFBQUQ7ZUFDWixJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsQ0FBWSxjQUFaLEVBQTRCLFFBQTVCO01BRFksQ0ExQmhCO01BZ0NBLFFBQUEsRUFBVSxTQUFBO0FBQ04sWUFBQTtRQUFBLElBQUEsR0FBTyxXQUFXLENBQUMsWUFBWixDQUF5QixNQUF6QjtRQUlQLElBQUMsQ0FBQSxPQUFELEdBQ0k7VUFBQSxFQUFBLEVBQU8sQ0FBQSxTQUFBO0FBQ0gsZ0JBQUE7WUFBQSxZQUFBLEdBQWUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7WUFDL0IsR0FBQSxHQUFNLFFBQVEsQ0FBQyxhQUFULENBQXVCLEtBQXZCO1lBQ04sR0FBRyxDQUFDLFNBQVMsQ0FBQyxHQUFkLENBQXNCLFlBQUYsR0FBZ0IsTUFBcEM7QUFFQSxtQkFBTztVQUxKLENBQUEsQ0FBSCxDQUFBLENBQUo7VUFPQSxLQUFBLEVBQU8sQ0FQUDtVQVFBLE1BQUEsRUFBUSxDQVJSO1VBU0EsUUFBQSxFQUFVLFNBQUE7QUFBRyxtQkFBTyxJQUFDLENBQUEsS0FBRCxJQUFVLElBQUMsQ0FBQSxFQUFFLENBQUM7VUFBeEIsQ0FUVjtVQVVBLFNBQUEsRUFBVyxTQUFBO0FBQUcsbUJBQU8sSUFBQyxDQUFBLE1BQUQsSUFBVyxJQUFDLENBQUEsRUFBRSxDQUFDO1VBQXpCLENBVlg7VUFZQSxJQUFBLEVBQU0sSUFaTjtVQWFBLE9BQUEsRUFBUyxTQUFBO0FBQUcsbUJBQU8sSUFBQyxDQUFBLElBQUQsSUFBUyxJQUFDLENBQUEsVUFBRCxDQUFBO1VBQW5CLENBYlQ7VUFjQSxVQUFBLEVBQVksU0FBQTttQkFBRyxJQUFDLENBQUEsSUFBRCxHQUFRLElBQUMsQ0FBQSxFQUFFLENBQUMsY0FBSixDQUFBLENBQXFCLENBQUEsQ0FBQTtVQUFoQyxDQWRaO1VBaUJBLEdBQUEsRUFBSyxTQUFDLE9BQUQ7WUFDRCxJQUFDLENBQUEsRUFBRSxDQUFDLFdBQUosQ0FBZ0IsT0FBaEI7QUFDQSxtQkFBTztVQUZOLENBakJMOztRQW9CSixJQUFJLENBQUMsT0FBTyxDQUFDLEdBQWIsQ0FBaUIsSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUExQixFQUE4QixDQUE5QjtRQUlBLFdBQVcsQ0FBQyxNQUFaLENBQW1CLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7QUFDZixnQkFBQTtZQUFBLElBQUEsQ0FBQSxDQUFjLEtBQUMsQ0FBQSxPQUFPLENBQUMsVUFBVCxDQUFBLENBQUEsSUFBMEIsQ0FBQSxLQUFBLEdBQVEsS0FBQyxDQUFBLE9BQU8sQ0FBQyxPQUFULENBQUEsQ0FBUixDQUF4QyxDQUFBO0FBQUEscUJBQUE7O1lBQ0EsS0FBQyxDQUFBLEtBQUQsR0FBUyxLQUFLLENBQUM7bUJBQ2YsS0FBQyxDQUFBLE1BQUQsR0FBVSxLQUFLLENBQUM7VUFIRDtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbkI7UUFPQSxVQUFBLENBQVcsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTtBQUNQLGdCQUFBO1lBQUEsR0FBQSxHQUFNO1lBR04sYUFBQSxHQUFnQixLQUFDLENBQUEsT0FBTyxDQUFDLFFBQVQsQ0FBQTtZQUNoQixjQUFBLEdBQWlCLEtBQUMsQ0FBQSxPQUFPLENBQUMsU0FBVCxDQUFBO1lBR2pCLE1BQUEsR0FBUyxDQUFDLE1BQUQsRUFBUyxNQUFULEVBQWlCLE1BQWpCLEVBQXlCLE1BQXpCLEVBQWlDLE1BQWpDLEVBQXlDLE1BQXpDLEVBQWlELE1BQWpEO1lBR1QsS0FBQyxDQUFBLE1BQUQsR0FDSTtjQUFBLEVBQUEsRUFBTyxDQUFBLFNBQUE7QUFDSCxvQkFBQTtnQkFBQSxHQUFBLEdBQU0sUUFBUSxDQUFDLGFBQVQsQ0FBdUIsUUFBdkI7Z0JBQ04sR0FBRyxDQUFDLEtBQUosR0FBWTtnQkFDWixHQUFHLENBQUMsTUFBSixHQUFhO2dCQUNiLEdBQUcsQ0FBQyxTQUFTLENBQUMsR0FBZCxDQUFzQixHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxTQUFqQixHQUE0QixTQUFoRDtBQUVBLHVCQUFPO2NBTkosQ0FBQSxDQUFILENBQUEsQ0FBSjtjQVFBLE9BQUEsRUFBUyxJQVJUO2NBU0EsVUFBQSxFQUFZLFNBQUE7dUJBQUcsSUFBQyxDQUFBLE9BQUQsSUFBWSxDQUFDLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBQyxDQUFBLEVBQUUsQ0FBQyxVQUFKLENBQWUsSUFBZixDQUFaO2NBQWYsQ0FUWjtjQVdBLGtCQUFBLEVBQW9CLFNBQUMsQ0FBRDtBQUFPLHVCQUFPLFdBQVcsQ0FBQyxVQUFVLENBQUMsUUFBdkIsQ0FBZ0MsQ0FDOUQsQ0FBQSxHQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsU0FBWixDQUFBLENBQUosR0FBOEIsR0FEZ0MsRUFFOUQsR0FGOEQsRUFHOUQsR0FIOEQsQ0FBaEM7Y0FBZCxDQVhwQjs7WUFpQkosUUFBQSxHQUFXLEtBQUMsQ0FBQSxNQUFNLENBQUMsVUFBUixDQUFBO1lBRVgsS0FBQSxHQUFRLENBQUEsR0FBSSxDQUFDLE1BQU0sQ0FBQyxNQUFQLEdBQWdCLENBQWpCO1lBQ1osU0FBQSxHQUFZLFFBQVEsQ0FBQyxvQkFBVCxDQUE4QixDQUE5QixFQUFpQyxDQUFqQyxFQUFvQyxDQUFwQyxFQUF1QyxjQUF2QztBQUNaLGlCQUFBLGtEQUFBOztjQUFBLFNBQVMsQ0FBQyxZQUFWLENBQXdCLEtBQUEsR0FBUSxFQUFoQyxFQUFxQyxJQUFyQztBQUFBO1lBRUEsUUFBUSxDQUFDLFNBQVQsR0FBcUI7WUFDckIsUUFBUSxDQUFDLFFBQVQsQ0FBa0IsQ0FBbEIsRUFBcUIsQ0FBckIsRUFBd0IsYUFBeEIsRUFBdUMsY0FBdkM7bUJBR0EsS0FBQyxDQUFBLE9BQU8sQ0FBQyxHQUFULENBQWEsS0FBQyxDQUFBLE1BQU0sQ0FBQyxFQUFyQjtVQXZDTztRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBWDtRQTJDQSxVQUFBLENBQVcsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTtBQUNQLGdCQUFBO1lBQUEsUUFBQSxHQUFXLFNBQUMsT0FBRCxFQUFVLEtBQVY7QUFDUCxrQkFBQTtjQUFBLElBQUcsS0FBQSxJQUFVLENBQUEsT0FBQSxHQUFVLEtBQUssQ0FBQyxVQUFoQixDQUFiO2dCQUNJLElBQUcsS0FBQSxLQUFTLE9BQVo7QUFDSSx5QkFBTyxLQURYO2lCQUFBLE1BQUE7QUFFSyx5QkFBTyxRQUFBLENBQVMsT0FBVCxFQUFrQixPQUFsQixFQUZaO2lCQURKOztBQUlBLHFCQUFPO1lBTEE7WUFRWCxHQUFBLEdBQU07WUFFTixLQUFDLENBQUEsT0FBRCxHQUNJO2NBQUEsRUFBQSxFQUFPLENBQUEsU0FBQTtBQUNILG9CQUFBO2dCQUFBLEdBQUEsR0FBTSxRQUFRLENBQUMsYUFBVCxDQUF1QixLQUF2QjtnQkFDTixHQUFHLENBQUMsU0FBUyxDQUFDLEdBQWQsQ0FBc0IsR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsU0FBakIsR0FBNEIsVUFBaEQ7QUFFQSx1QkFBTztjQUpKLENBQUEsQ0FBSCxDQUFBLENBQUo7Y0FLQSxVQUFBLEVBQVksS0FMWjtjQVFBLFNBQUEsRUFDSTtnQkFBQSxDQUFBLEVBQUcsQ0FBSDtnQkFDQSxLQUFBLEVBQU8sSUFEUDtlQVRKO2NBV0EsWUFBQSxFQUFjLFNBQUMsQ0FBRCxFQUFJLENBQUosRUFBWSxNQUFaO0FBQ1Ysb0JBQUE7O2tCQURjLElBQUU7OztrQkFBTSxTQUFPOztnQkFDN0IsSUFBQSxDQUFBLENBQWMsR0FBRyxDQUFDLE1BQUosSUFBZSxDQUFBLEtBQUEsR0FBUSxHQUFHLENBQUMsT0FBTyxDQUFDLE9BQVosQ0FBQSxDQUFSLENBQTdCLENBQUE7QUFBQSx5QkFBQTs7Z0JBRUEsTUFBQSxHQUFTLEdBQUcsQ0FBQyxPQUFPLENBQUMsUUFBWixDQUFBO2dCQUNULE9BQUEsR0FBVSxHQUFHLENBQUMsT0FBTyxDQUFDLFNBQVosQ0FBQTtnQkFFVixJQUFHLENBQUg7a0JBQVUsRUFBQSxHQUFLLENBQUMsQ0FBQyxLQUFGLEdBQVUsS0FBSyxDQUFDLElBQS9CO2lCQUFBLE1BRUssSUFBSSxPQUFPLENBQVAsS0FBWSxRQUFoQjtrQkFDRCxFQUFBLEdBQUssRUFESjtpQkFBQSxNQUdBLElBQUksT0FBTyxNQUFQLEtBQWlCLFFBQXJCO2tCQUNELEVBQUEsR0FBSyxJQUFDLENBQUEsU0FBUyxDQUFDLENBQVgsR0FBZSxPQURuQjtpQkFBQSxNQUFBO2tCQUdBLEVBQUEsR0FBSyxJQUFDLENBQUEsU0FBUyxDQUFDLEVBSGhCOztnQkFLTCxFQUFBLEdBQUssSUFBQyxDQUFBLFNBQVMsQ0FBQyxDQUFYLEdBQWUsSUFBSSxDQUFDLEdBQUwsQ0FBUyxDQUFULEVBQWEsSUFBSSxDQUFDLEdBQUwsQ0FBUyxPQUFULEVBQWtCLEVBQWxCLENBQWI7Z0JBQ3BCLElBQUMsQ0FBQSxTQUFTLENBQUMsS0FBWCxHQUFtQixHQUFHLENBQUMsTUFBTSxDQUFDLGtCQUFYLENBQThCLEVBQTlCO2dCQUVuQixTQUFBLEdBQVk7a0JBQUEsQ0FBQSxFQUFHLElBQUksQ0FBQyxHQUFMLENBQVMsQ0FBVCxFQUFhLElBQUksQ0FBQyxHQUFMLENBQVUsT0FBQSxHQUFVLENBQXBCLEVBQXdCLEVBQXhCLENBQWIsQ0FBSDs7Z0JBRVoscUJBQUEsQ0FBc0IsQ0FBQSxTQUFBLEtBQUE7eUJBQUEsU0FBQTsyQkFDbEIsS0FBQyxDQUFBLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBVixHQUFvQixTQUFTLENBQUMsQ0FBWixHQUFlO2tCQURmO2dCQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdEI7QUFFQSx1QkFBTyxHQUFHLENBQUMsb0JBQUosQ0FBQTtjQXZCRyxDQVhkO2NBb0NBLGdCQUFBLEVBQWtCLFNBQUE7dUJBQUcsSUFBQyxDQUFBLFlBQUQsQ0FBQTtjQUFILENBcENsQjs7WUFxQ0osS0FBQyxDQUFBLE9BQU8sQ0FBQyxnQkFBVCxDQUFBO1lBR0EsV0FBVyxDQUFDLFlBQVosQ0FBeUIsU0FBQyxVQUFEO0FBQ3JCLGtCQUFBO2NBQUEsSUFBQSxHQUFPLFVBQVUsQ0FBQyxVQUFYLENBQUEsQ0FBd0IsQ0FBQSxDQUFBO3FCQUMvQixLQUFDLENBQUEsT0FBTyxDQUFDLFlBQVQsQ0FBc0IsSUFBdEIsRUFBNEIsQ0FBQyxLQUFDLENBQUEsT0FBTyxDQUFDLFNBQVQsQ0FBQSxDQUFBLEdBQXVCLEdBQXhCLENBQUEsR0FBK0IsSUFBM0Q7WUFGcUIsQ0FBekI7WUFLQSxHQUFHLENBQUMsa0JBQUosQ0FBdUIsU0FBQTtxQkFBRyxHQUFHLENBQUMsZ0JBQUosQ0FBQTtZQUFILENBQXZCO1lBR0EsV0FBVyxDQUFDLE1BQVosQ0FBbUIsU0FBQTtxQkFBRyxLQUFDLENBQUEsT0FBTyxDQUFDLGdCQUFULENBQUE7WUFBSCxDQUFuQjtZQUNBLFdBQVcsQ0FBQyxNQUFaLENBQW1CLFNBQUE7cUJBQUcsS0FBQyxDQUFBLE9BQU8sQ0FBQyxVQUFULEdBQXNCO1lBQXpCLENBQW5CO1lBQ0EsV0FBVyxDQUFDLE9BQVosQ0FBb0IsU0FBQTtxQkFBRyxLQUFDLENBQUEsT0FBTyxDQUFDLFVBQVQsR0FBc0I7WUFBekIsQ0FBcEI7WUFHQSxXQUFXLENBQUMsV0FBWixDQUF3QixTQUFDLENBQUQsRUFBSSxVQUFKO2NBQ3BCLElBQUEsQ0FBQSxDQUFjLFVBQUEsSUFBZSxRQUFBLENBQVMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFyQixFQUF5QixDQUFDLENBQUMsTUFBM0IsQ0FBN0IsQ0FBQTtBQUFBLHVCQUFBOztjQUNBLENBQUMsQ0FBQyxjQUFGLENBQUE7Y0FDQSxLQUFDLENBQUEsT0FBTyxDQUFDLFVBQVQsR0FBc0I7cUJBQ3RCLEtBQUMsQ0FBQSxPQUFPLENBQUMsWUFBVCxDQUFzQixDQUF0QjtZQUpvQixDQUF4QjtZQU1BLFdBQVcsQ0FBQyxXQUFaLENBQXdCLFNBQUMsQ0FBRDtjQUNwQixJQUFBLENBQWMsS0FBQyxDQUFBLE9BQU8sQ0FBQyxVQUF2QjtBQUFBLHVCQUFBOztxQkFDQSxLQUFDLENBQUEsT0FBTyxDQUFDLFlBQVQsQ0FBc0IsQ0FBdEI7WUFGb0IsQ0FBeEI7WUFJQSxXQUFXLENBQUMsU0FBWixDQUFzQixTQUFDLENBQUQ7Y0FDbEIsSUFBQSxDQUFjLEtBQUMsQ0FBQSxPQUFPLENBQUMsVUFBdkI7QUFBQSx1QkFBQTs7Y0FDQSxLQUFDLENBQUEsT0FBTyxDQUFDLFVBQVQsR0FBc0I7cUJBQ3RCLEtBQUMsQ0FBQSxPQUFPLENBQUMsWUFBVCxDQUFzQixDQUF0QjtZQUhrQixDQUF0QjtZQUtBLFdBQVcsQ0FBQyxZQUFaLENBQXlCLFNBQUMsQ0FBRCxFQUFJLFVBQUo7Y0FDckIsSUFBQSxDQUFBLENBQWMsVUFBQSxJQUFlLFFBQUEsQ0FBUyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQXJCLEVBQXlCLENBQUMsQ0FBQyxNQUEzQixDQUE3QixDQUFBO0FBQUEsdUJBQUE7O2NBQ0EsQ0FBQyxDQUFDLGNBQUYsQ0FBQTtxQkFDQSxLQUFDLENBQUEsT0FBTyxDQUFDLFlBQVQsQ0FBc0IsSUFBdEIsRUFBNEIsSUFBNUIsRUFBbUMsQ0FBQyxDQUFDLFdBQUYsR0FBZ0IsR0FBbkQ7WUFIcUIsQ0FBekI7bUJBTUEsS0FBQyxDQUFBLE9BQU8sQ0FBQyxHQUFULENBQWEsS0FBQyxDQUFBLE9BQU8sQ0FBQyxFQUF0QjtVQXRGTztRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBWDtBQXVGQSxlQUFPO01BdktELENBaENWOztFQURhO0FBQWpCIiwic291cmNlc0NvbnRlbnQiOlsiIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jICBDb2xvciBQaWNrZXIvZXh0ZW5zaW9uczogSHVlXG4jICBDb2xvciBIdWUgY29udHJvbGxlclxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IChjb2xvclBpY2tlcikgLT5cbiAgICAgICAgRW1pdHRlcjogKHJlcXVpcmUgJy4uL21vZHVsZXMvRW1pdHRlcicpKClcblxuICAgICAgICBlbGVtZW50OiBudWxsXG4gICAgICAgIGNvbnRyb2w6IG51bGxcbiAgICAgICAgY2FudmFzOiBudWxsXG5cbiAgICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAjICBVdGlsaXR5IGZ1bmN0aW9uIHRvIGdldCB0aGUgY3VycmVudCBodWVcbiAgICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgZ2V0SHVlOiAtPlxuICAgICAgICAgICAgaWYgKEBjb250cm9sIGFuZCBAY29udHJvbC5zZWxlY3Rpb24pIGFuZCBAZWxlbWVudFxuICAgICAgICAgICAgICAgIHJldHVybiBAY29udHJvbC5zZWxlY3Rpb24ueSAvIEBlbGVtZW50LmdldEhlaWdodCgpICogMzYwXG4gICAgICAgICAgICBlbHNlIHJldHVybiAwXG5cbiAgICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAjICBTZXQgdXAgZXZlbnRzIGFuZCBoYW5kbGluZ1xuICAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICAjIFNlbGVjdGlvbiBDaGFuZ2VkIGV2ZW50XG4gICAgICAgIGVtaXRTZWxlY3Rpb25DaGFuZ2VkOiAtPlxuICAgICAgICAgICAgQEVtaXR0ZXIuZW1pdCAnc2VsZWN0aW9uQ2hhbmdlZCcsIEBjb250cm9sLnNlbGVjdGlvblxuICAgICAgICBvblNlbGVjdGlvbkNoYW5nZWQ6IChjYWxsYmFjaykgLT5cbiAgICAgICAgICAgIEBFbWl0dGVyLm9uICdzZWxlY3Rpb25DaGFuZ2VkJywgY2FsbGJhY2tcblxuICAgICAgICAjIENvbG9yIENoYW5nZWQgZXZlbnRcbiAgICAgICAgZW1pdENvbG9yQ2hhbmdlZDogLT5cbiAgICAgICAgICAgIEBFbWl0dGVyLmVtaXQgJ2NvbG9yQ2hhbmdlZCcsIEBjb250cm9sLnNlbGVjdGlvbi5jb2xvclxuICAgICAgICBvbkNvbG9yQ2hhbmdlZDogKGNhbGxiYWNrKSAtPlxuICAgICAgICAgICAgQEVtaXR0ZXIub24gJ2NvbG9yQ2hhbmdlZCcsIGNhbGxiYWNrXG5cbiAgICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAjICBDcmVhdGUgYW5kIGFjdGl2YXRlIEh1ZSBjb250cm9sbGVyXG4gICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgIGFjdGl2YXRlOiAtPlxuICAgICAgICAgICAgQm9keSA9IGNvbG9yUGlja2VyLmdldEV4dGVuc2lvbiAnQm9keSdcblxuICAgICAgICAjICBDcmVhdGUgdGhlIGVsZW1lbnRcbiAgICAgICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgICAgIEBlbGVtZW50ID1cbiAgICAgICAgICAgICAgICBlbDogZG8gLT5cbiAgICAgICAgICAgICAgICAgICAgX2NsYXNzUHJlZml4ID0gQm9keS5lbGVtZW50LmVsLmNsYXNzTmFtZVxuICAgICAgICAgICAgICAgICAgICBfZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50ICdkaXYnXG4gICAgICAgICAgICAgICAgICAgIF9lbC5jbGFzc0xpc3QuYWRkIFwiI3sgX2NsYXNzUHJlZml4IH0taHVlXCJcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gX2VsXG4gICAgICAgICAgICAgICAgIyBVdGlsaXR5IGZ1bmN0aW9uc1xuICAgICAgICAgICAgICAgIHdpZHRoOiAwXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiAwXG4gICAgICAgICAgICAgICAgZ2V0V2lkdGg6IC0+IHJldHVybiBAd2lkdGggb3IgQGVsLm9mZnNldFdpZHRoXG4gICAgICAgICAgICAgICAgZ2V0SGVpZ2h0OiAtPiByZXR1cm4gQGhlaWdodCBvciBAZWwub2Zmc2V0SGVpZ2h0XG5cbiAgICAgICAgICAgICAgICByZWN0OiBudWxsXG4gICAgICAgICAgICAgICAgZ2V0UmVjdDogLT4gcmV0dXJuIEByZWN0IG9yIEB1cGRhdGVSZWN0KClcbiAgICAgICAgICAgICAgICB1cGRhdGVSZWN0OiAtPiBAcmVjdCA9IEBlbC5nZXRDbGllbnRSZWN0cygpWzBdXG5cbiAgICAgICAgICAgICAgICAjIEFkZCBhIGNoaWxkIG9uIHRoZSBIdWUgZWxlbWVudFxuICAgICAgICAgICAgICAgIGFkZDogKGVsZW1lbnQpIC0+XG4gICAgICAgICAgICAgICAgICAgIEBlbC5hcHBlbmRDaGlsZCBlbGVtZW50XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzXG4gICAgICAgICAgICBCb2R5LmVsZW1lbnQuYWRkIEBlbGVtZW50LmVsLCAyXG5cbiAgICAgICAgIyAgVXBkYXRlIGVsZW1lbnQgcmVjdCB3aGVuIENvbG9yIFBpY2tlciBvcGVuc1xuICAgICAgICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICAgICAgY29sb3JQaWNrZXIub25PcGVuID0+XG4gICAgICAgICAgICAgICAgcmV0dXJuIHVubGVzcyBAZWxlbWVudC51cGRhdGVSZWN0KCkgYW5kIF9yZWN0ID0gQGVsZW1lbnQuZ2V0UmVjdCgpXG4gICAgICAgICAgICAgICAgQHdpZHRoID0gX3JlY3Qud2lkdGhcbiAgICAgICAgICAgICAgICBAaGVpZ2h0ID0gX3JlY3QuaGVpZ2h0XG5cbiAgICAgICAgIyAgQ3JlYXRlIGFuZCBkcmF3IGNhbnZhc1xuICAgICAgICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICAgICAgc2V0VGltZW91dCA9PiAjIHdhaXQgZm9yIHRoZSBET01cbiAgICAgICAgICAgICAgICBIdWUgPSB0aGlzXG5cbiAgICAgICAgICAgICAgICAjIFByZXBhcmUgc29tZSB2YXJpYWJsZXNcbiAgICAgICAgICAgICAgICBfZWxlbWVudFdpZHRoID0gQGVsZW1lbnQuZ2V0V2lkdGgoKVxuICAgICAgICAgICAgICAgIF9lbGVtZW50SGVpZ2h0ID0gQGVsZW1lbnQuZ2V0SGVpZ2h0KClcblxuICAgICAgICAgICAgICAgICMgUmVkIHRocm91Z2ggYWxsIHRoZSBtYWluIGNvbG9ycyBhbmQgYmFjayB0byByZWRcbiAgICAgICAgICAgICAgICBfaGV4ZXMgPSBbJyNmMDAnLCAnI2ZmMCcsICcjMGYwJywgJyMwZmYnLCAnIzAwZicsICcjZjBmJywgJyNmMDAnXVxuXG4gICAgICAgICAgICAgICAgIyBDcmVhdGUgY2FudmFzIGVsZW1lbnRcbiAgICAgICAgICAgICAgICBAY2FudmFzID1cbiAgICAgICAgICAgICAgICAgICAgZWw6IGRvIC0+XG4gICAgICAgICAgICAgICAgICAgICAgICBfZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50ICdjYW52YXMnXG4gICAgICAgICAgICAgICAgICAgICAgICBfZWwud2lkdGggPSBfZWxlbWVudFdpZHRoXG4gICAgICAgICAgICAgICAgICAgICAgICBfZWwuaGVpZ2h0ID0gX2VsZW1lbnRIZWlnaHRcbiAgICAgICAgICAgICAgICAgICAgICAgIF9lbC5jbGFzc0xpc3QuYWRkIFwiI3sgSHVlLmVsZW1lbnQuZWwuY2xhc3NOYW1lIH0tY2FudmFzXCJcblxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF9lbFxuICAgICAgICAgICAgICAgICAgICAjIFV0aWxpdHkgZnVuY3Rpb25zXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQ6IG51bGxcbiAgICAgICAgICAgICAgICAgICAgZ2V0Q29udGV4dDogLT4gQGNvbnRleHQgb3IgKEBjb250ZXh0ID0gQGVsLmdldENvbnRleHQgJzJkJylcblxuICAgICAgICAgICAgICAgICAgICBnZXRDb2xvckF0UG9zaXRpb246ICh5KSAtPiByZXR1cm4gY29sb3JQaWNrZXIuU21hcnRDb2xvci5IU1ZBcnJheSBbXG4gICAgICAgICAgICAgICAgICAgICAgICB5IC8gSHVlLmVsZW1lbnQuZ2V0SGVpZ2h0KCkgKiAzNjBcbiAgICAgICAgICAgICAgICAgICAgICAgIDEwMFxuICAgICAgICAgICAgICAgICAgICAgICAgMTAwXVxuXG4gICAgICAgICAgICAgICAgIyBEcmF3IGdyYWRpZW50XG4gICAgICAgICAgICAgICAgX2NvbnRleHQgPSBAY2FudmFzLmdldENvbnRleHQoKVxuXG4gICAgICAgICAgICAgICAgX3N0ZXAgPSAxIC8gKF9oZXhlcy5sZW5ndGggLSAxKVxuICAgICAgICAgICAgICAgIF9ncmFkaWVudCA9IF9jb250ZXh0LmNyZWF0ZUxpbmVhckdyYWRpZW50IDAsIDAsIDEsIF9lbGVtZW50SGVpZ2h0XG4gICAgICAgICAgICAgICAgX2dyYWRpZW50LmFkZENvbG9yU3RvcCAoX3N0ZXAgKiBfaSksIF9oZXggZm9yIF9oZXgsIF9pIGluIF9oZXhlc1xuXG4gICAgICAgICAgICAgICAgX2NvbnRleHQuZmlsbFN0eWxlID0gX2dyYWRpZW50XG4gICAgICAgICAgICAgICAgX2NvbnRleHQuZmlsbFJlY3QgMCwgMCwgX2VsZW1lbnRXaWR0aCwgX2VsZW1lbnRIZWlnaHRcblxuICAgICAgICAgICAgICAgICMgQWRkIHRvIEh1ZSBlbGVtZW50XG4gICAgICAgICAgICAgICAgQGVsZW1lbnQuYWRkIEBjYW52YXMuZWxcblxuICAgICAgICAjICBDcmVhdGUgSHVlIGNvbnRyb2wgZWxlbWVudFxuICAgICAgICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICAgICAgc2V0VGltZW91dCA9PiAjIHdhaXQgZm9yIHRoZSBET01cbiAgICAgICAgICAgICAgICBoYXNDaGlsZCA9IChlbGVtZW50LCBjaGlsZCkgLT5cbiAgICAgICAgICAgICAgICAgICAgaWYgY2hpbGQgYW5kIF9wYXJlbnQgPSBjaGlsZC5wYXJlbnROb2RlXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBjaGlsZCBpcyBlbGVtZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgcmV0dXJuIGhhc0NoaWxkIGVsZW1lbnQsIF9wYXJlbnRcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG5cbiAgICAgICAgICAgICAgICAjIENyZWF0ZSBlbGVtZW50XG4gICAgICAgICAgICAgICAgSHVlID0gdGhpc1xuXG4gICAgICAgICAgICAgICAgQGNvbnRyb2wgPVxuICAgICAgICAgICAgICAgICAgICBlbDogZG8gLT5cbiAgICAgICAgICAgICAgICAgICAgICAgIF9lbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgJ2RpdidcbiAgICAgICAgICAgICAgICAgICAgICAgIF9lbC5jbGFzc0xpc3QuYWRkIFwiI3sgSHVlLmVsZW1lbnQuZWwuY2xhc3NOYW1lIH0tY29udHJvbFwiXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBfZWxcbiAgICAgICAgICAgICAgICAgICAgaXNHcmFiYmluZzogbm9cblxuICAgICAgICAgICAgICAgICAgICAjIFNldCBjb250cm9sIHNlbGVjdGlvblxuICAgICAgICAgICAgICAgICAgICBzZWxlY3Rpb246XG4gICAgICAgICAgICAgICAgICAgICAgICB5OiAwXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2xvcjogbnVsbFxuICAgICAgICAgICAgICAgICAgICBzZXRTZWxlY3Rpb246IChlLCB5PW51bGwsIG9mZnNldD1udWxsKSAtPlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHVubGVzcyBIdWUuY2FudmFzIGFuZCBfcmVjdCA9IEh1ZS5lbGVtZW50LmdldFJlY3QoKVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBfd2lkdGggPSBIdWUuZWxlbWVudC5nZXRXaWR0aCgpXG4gICAgICAgICAgICAgICAgICAgICAgICBfaGVpZ2h0ID0gSHVlLmVsZW1lbnQuZ2V0SGVpZ2h0KClcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgZSB0aGVuIF95ID0gZS5wYWdlWSAtIF9yZWN0LnRvcFxuICAgICAgICAgICAgICAgICAgICAgICAgIyBTZXQgdGhlIHkgZGlyZWN0bHlcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHR5cGVvZiB5IGlzICdudW1iZXInKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF95ID0geVxuICAgICAgICAgICAgICAgICAgICAgICAgIyBIYW5kbGUgc2Nyb2xsXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmICh0eXBlb2Ygb2Zmc2V0IGlzICdudW1iZXInKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF95ID0gQHNlbGVjdGlvbi55ICsgb2Zmc2V0XG4gICAgICAgICAgICAgICAgICAgICAgICAjIERlZmF1bHQgdG8gdG9wXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIF95ID0gQHNlbGVjdGlvbi55XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIF95ID0gQHNlbGVjdGlvbi55ID0gTWF0aC5tYXggMCwgKE1hdGgubWluIF9oZWlnaHQsIF95KVxuICAgICAgICAgICAgICAgICAgICAgICAgQHNlbGVjdGlvbi5jb2xvciA9IEh1ZS5jYW52YXMuZ2V0Q29sb3JBdFBvc2l0aW9uIF95XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIF9wb3NpdGlvbiA9IHk6IE1hdGgubWF4IDMsIChNYXRoLm1pbiAoX2hlaWdodCAtIDYpLCBfeSlcblxuICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lID0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQGVsLnN0eWxlLnRvcCA9IFwiI3sgX3Bvc2l0aW9uLnkgfXB4XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBIdWUuZW1pdFNlbGVjdGlvbkNoYW5nZWQoKVxuXG4gICAgICAgICAgICAgICAgICAgIHJlZnJlc2hTZWxlY3Rpb246IC0+IEBzZXRTZWxlY3Rpb24oKVxuICAgICAgICAgICAgICAgIEBjb250cm9sLnJlZnJlc2hTZWxlY3Rpb24oKVxuXG4gICAgICAgICAgICAgICAgIyBJZiB0aGUgQ29sb3IgUGlja2VyIGlzIGZlZCBhIGNvbG9yLCBzZXQgaXRcbiAgICAgICAgICAgICAgICBjb2xvclBpY2tlci5vbklucHV0Q29sb3IgKHNtYXJ0Q29sb3IpID0+XG4gICAgICAgICAgICAgICAgICAgIF9odWUgPSBzbWFydENvbG9yLnRvSFNWQXJyYXkoKVswXVxuICAgICAgICAgICAgICAgICAgICBAY29udHJvbC5zZXRTZWxlY3Rpb24gbnVsbCwgKEBlbGVtZW50LmdldEhlaWdodCgpIC8gMzYwKSAqIF9odWVcblxuICAgICAgICAgICAgICAgICMgV2hlbiB0aGUgc2VsZWN0aW9uIGNoYW5nZXMsIHRoZSBjb2xvciBoYXMgY2hhbmdlZFxuICAgICAgICAgICAgICAgIEh1ZS5vblNlbGVjdGlvbkNoYW5nZWQgLT4gSHVlLmVtaXRDb2xvckNoYW5nZWQoKVxuXG4gICAgICAgICAgICAgICAgIyBSZXNldFxuICAgICAgICAgICAgICAgIGNvbG9yUGlja2VyLm9uT3BlbiA9PiBAY29udHJvbC5yZWZyZXNoU2VsZWN0aW9uKClcbiAgICAgICAgICAgICAgICBjb2xvclBpY2tlci5vbk9wZW4gPT4gQGNvbnRyb2wuaXNHcmFiYmluZyA9IG5vXG4gICAgICAgICAgICAgICAgY29sb3JQaWNrZXIub25DbG9zZSA9PiBAY29udHJvbC5pc0dyYWJiaW5nID0gbm9cblxuICAgICAgICAgICAgICAgICMgQmluZCBjb250cm9sbGVyIGV2ZW50c1xuICAgICAgICAgICAgICAgIGNvbG9yUGlja2VyLm9uTW91c2VEb3duIChlLCBpc09uUGlja2VyKSA9PlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdW5sZXNzIGlzT25QaWNrZXIgYW5kIGhhc0NoaWxkIEh1ZS5lbGVtZW50LmVsLCBlLnRhcmdldFxuICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgICAgICAgICAgICAgQGNvbnRyb2wuaXNHcmFiYmluZyA9IHllc1xuICAgICAgICAgICAgICAgICAgICBAY29udHJvbC5zZXRTZWxlY3Rpb24gZVxuXG4gICAgICAgICAgICAgICAgY29sb3JQaWNrZXIub25Nb3VzZU1vdmUgKGUpID0+XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB1bmxlc3MgQGNvbnRyb2wuaXNHcmFiYmluZ1xuICAgICAgICAgICAgICAgICAgICBAY29udHJvbC5zZXRTZWxlY3Rpb24gZVxuXG4gICAgICAgICAgICAgICAgY29sb3JQaWNrZXIub25Nb3VzZVVwIChlKSA9PlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdW5sZXNzIEBjb250cm9sLmlzR3JhYmJpbmdcbiAgICAgICAgICAgICAgICAgICAgQGNvbnRyb2wuaXNHcmFiYmluZyA9IG5vXG4gICAgICAgICAgICAgICAgICAgIEBjb250cm9sLnNldFNlbGVjdGlvbiBlXG5cbiAgICAgICAgICAgICAgICBjb2xvclBpY2tlci5vbk1vdXNlV2hlZWwgKGUsIGlzT25QaWNrZXIpID0+XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB1bmxlc3MgaXNPblBpY2tlciBhbmQgaGFzQ2hpbGQgSHVlLmVsZW1lbnQuZWwsIGUudGFyZ2V0XG4gICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICAgICAgICAgICAgICBAY29udHJvbC5zZXRTZWxlY3Rpb24gbnVsbCwgbnVsbCwgKGUud2hlZWxEZWx0YVkgKiAuMzMpICMgbWFrZSBpdCBhIGJpdCBzb2Z0ZXJcblxuICAgICAgICAgICAgICAgICMgQWRkIHRvIEh1ZSBlbGVtZW50XG4gICAgICAgICAgICAgICAgQGVsZW1lbnQuYWRkIEBjb250cm9sLmVsXG4gICAgICAgICAgICByZXR1cm4gdGhpc1xuIl19
