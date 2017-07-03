(function() {
  module.exports = function() {
    return {
      hexToRgb: function(hex) {
        hex = hex.replace('#', '');
        if (hex.length === 3) {
          hex = hex.replace(/(.)(.)(.)/, "$1$1$2$2$3$3");
        }
        return [parseInt(hex.substr(0, 2), 16), parseInt(hex.substr(2, 2), 16), parseInt(hex.substr(4, 2), 16)];
      },
      hexaToRgb: function(hexa) {
        return this.hexToRgb((hexa.match(/rgba\((\#.+),/))[1]);
      },
      hexToHsl: function(hex) {
        return this.rgbToHsl(this.hexToRgb(hex.replace('#', '')));
      },
      rgbToHex: function(rgb) {
        var _componentToHex;
        _componentToHex = function(component) {
          var _hex;
          _hex = component.toString(16);
          if (_hex.length === 1) {
            return "0" + _hex;
          } else {
            return _hex;
          }
        };
        return [_componentToHex(rgb[0]), _componentToHex(rgb[1]), _componentToHex(rgb[2])].join('');
      },
      rgbToHsl: function(arg) {
        var _d, _h, _l, _max, _min, _s, b, g, r;
        r = arg[0], g = arg[1], b = arg[2];
        r /= 255;
        g /= 255;
        b /= 255;
        _max = Math.max(r, g, b);
        _min = Math.min(r, g, b);
        _l = (_max + _min) / 2;
        if (_max === _min) {
          return [0, 0, Math.floor(_l * 100)];
        }
        _d = _max - _min;
        _s = _l > 0.5 ? _d / (2 - _max - _min) : _d / (_max + _min);
        switch (_max) {
          case r:
            _h = (g - b) / _d + (g < b ? 6 : 0);
            break;
          case g:
            _h = (b - r) / _d + 2;
            break;
          case b:
            _h = (r - g) / _d + 4;
        }
        _h /= 6;
        return [Math.floor(_h * 360), Math.floor(_s * 100), Math.floor(_l * 100)];
      },
      rgbToHsv: function(arg) {
        var b, computedH, computedS, computedV, d, g, h, maxRGB, minRGB, r;
        r = arg[0], g = arg[1], b = arg[2];
        computedH = 0;
        computedS = 0;
        computedV = 0;
        if ((r == null) || (g == null) || (b == null) || isNaN(r) || isNaN(g) || isNaN(b)) {
          return;
        }
        if (r < 0 || g < 0 || b < 0 || r > 255 || g > 255 || b > 255) {
          return;
        }
        r = r / 255;
        g = g / 255;
        b = b / 255;
        minRGB = Math.min(r, Math.min(g, b));
        maxRGB = Math.max(r, Math.max(g, b));
        if (minRGB === maxRGB) {
          computedV = minRGB;
          return [0, 0, computedV];
        }
        d = (r === minRGB ? g - b : (b === minRGB ? r - g : b - r));
        h = (r === minRGB ? 3 : (b === minRGB ? 1 : 5));
        computedH = 60 * (h - d / (maxRGB - minRGB));
        computedS = (maxRGB - minRGB) / maxRGB;
        computedV = maxRGB;
        return [computedH, computedS, computedV];
      },
      hsvToHsl: function(arg) {
        var h, s, v;
        h = arg[0], s = arg[1], v = arg[2];
        return [h, s * v / ((h = (2 - s) * v) < 1 ? h : 2 - h), h / 2];
      },
      hsvToRgb: function(arg) {
        var _f, _i, _p, _q, _result, _t, h, s, v;
        h = arg[0], s = arg[1], v = arg[2];
        h /= 60;
        s /= 100;
        v /= 100;
        if (s === 0) {
          return [Math.round(v * 255), Math.round(v * 255), Math.round(v * 255)];
        }
        _i = Math.floor(h);
        _f = h - _i;
        _p = v * (1 - s);
        _q = v * (1 - s * _f);
        _t = v * (1 - s * (1 - _f));
        _result = (function() {
          switch (_i) {
            case 0:
              return [v, _t, _p];
            case 1:
              return [_q, v, _p];
            case 2:
              return [_p, v, _t];
            case 3:
              return [_p, _q, v];
            case 4:
              return [_t, _p, v];
            case 5:
              return [v, _p, _q];
            default:
              return [v, _t, _p];
          }
        })();
        return [Math.round(_result[0] * 255), Math.round(_result[1] * 255), Math.round(_result[2] * 255)];
      },
      hslToHsv: function(arg) {
        var h, l, s;
        h = arg[0], s = arg[1], l = arg[2];
        s /= 100;
        l /= 100;
        s *= l < .5 ? l : 1 - l;
        return [h, (2 * s / (l + s)) || 0, l + s];
      },
      hslToRgb: function(input) {
        var h, ref, s, v;
        ref = this.hslToHsv(input), h = ref[0], s = ref[1], v = ref[2];
        return this.hsvToRgb([h, s * 100, v * 100]);
      },
      vecToRgb: function(input) {
        return [(input[0] * 255) << 0, (input[1] * 255) << 0, (input[2] * 255) << 0];
      },
      rgbToVec: function(input) {
        return [(input[0] / 255).toFixed(2), (input[1] / 255).toFixed(2), (input[2] / 255).toFixed(2)];
      }
    };
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvdG95b2tpLy5hdG9tL3BhY2thZ2VzL2NvbG9yLXBpY2tlci9saWIvbW9kdWxlcy9Db252ZXJ0LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFJSTtFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFNBQUE7V0FNYjtNQUFBLFFBQUEsRUFBVSxTQUFDLEdBQUQ7UUFDTixHQUFBLEdBQU0sR0FBRyxDQUFDLE9BQUosQ0FBWSxHQUFaLEVBQWlCLEVBQWpCO1FBQ04sSUFBaUQsR0FBRyxDQUFDLE1BQUosS0FBYyxDQUEvRDtVQUFBLEdBQUEsR0FBTSxHQUFHLENBQUMsT0FBSixDQUFZLFdBQVosRUFBeUIsY0FBekIsRUFBTjs7QUFFQSxlQUFPLENBQ0gsUUFBQSxDQUFVLEdBQUcsQ0FBQyxNQUFKLENBQVcsQ0FBWCxFQUFjLENBQWQsQ0FBVixFQUE0QixFQUE1QixDQURHLEVBRUgsUUFBQSxDQUFVLEdBQUcsQ0FBQyxNQUFKLENBQVcsQ0FBWCxFQUFjLENBQWQsQ0FBVixFQUE0QixFQUE1QixDQUZHLEVBR0gsUUFBQSxDQUFVLEdBQUcsQ0FBQyxNQUFKLENBQVcsQ0FBWCxFQUFjLENBQWQsQ0FBVixFQUE0QixFQUE1QixDQUhHO01BSkQsQ0FBVjtNQVlBLFNBQUEsRUFBVyxTQUFDLElBQUQ7QUFDUCxlQUFPLElBQUMsQ0FBQSxRQUFELENBQVUsQ0FBQyxJQUFJLENBQUMsS0FBTCxDQUFXLGVBQVgsQ0FBRCxDQUE2QixDQUFBLENBQUEsQ0FBdkM7TUFEQSxDQVpYO01Ba0JBLFFBQUEsRUFBVSxTQUFDLEdBQUQ7QUFDTixlQUFPLElBQUMsQ0FBQSxRQUFELENBQVUsSUFBQyxDQUFBLFFBQUQsQ0FBVSxHQUFHLENBQUMsT0FBSixDQUFZLEdBQVosRUFBaUIsRUFBakIsQ0FBVixDQUFWO01BREQsQ0FsQlY7TUF3QkEsUUFBQSxFQUFVLFNBQUMsR0FBRDtBQUNOLFlBQUE7UUFBQSxlQUFBLEdBQWtC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eEIsQ0FBQyxLQUFNLENBQUEsQ0FBQSxDQUFOLEdBQVcsR0FBWixDQUFnQixDQUFDLE9BQWpCLENBQXlCLENBQXpCLENBRHdCLEVBRXhCLENBQUMsS0FBTSxDQUFBLENBQUEsQ0FBTixHQUFXLEdBQVosQ0FBZ0IsQ0FBQyxPQUFqQixDQUF5QixDQUF6QixDQUZ3QixFQUd4QixDQUFDLEtBQU0sQ0FBQSxDQUFBLENBQU4sR0FBVyxHQUFaLENBQWdCLENBQUMsT0FBakIsQ0FBeUIsQ0FBekIsQ0FId0I7TUFBbEIsQ0FyTFY7O0VBTmE7QUFBakIiLCJzb3VyY2VzQ29udGVudCI6WyIjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgIENvbnZlcnRcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICAgbW9kdWxlLmV4cG9ydHMgPSAtPlxuICAgICAgICAjIFRPRE86IEkgZG9uJ3QgbGlrZSB0aGlzIGZpbGUuIEl0J3MgdWdseSBhbmQgZmVlbHMgd2VpcmRcblxuICAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICMgIEhFWCB0byBSR0JcbiAgICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgaGV4VG9SZ2I6IChoZXgpIC0+XG4gICAgICAgICAgICBoZXggPSBoZXgucmVwbGFjZSAnIycsICcnXG4gICAgICAgICAgICBoZXggPSBoZXgucmVwbGFjZSAvKC4pKC4pKC4pLywgXCIkMSQxJDIkMiQzJDNcIiBpZiBoZXgubGVuZ3RoIGlzIDNcblxuICAgICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgICAgICBwYXJzZUludCAoaGV4LnN1YnN0ciAwLCAyKSwgMTZcbiAgICAgICAgICAgICAgICBwYXJzZUludCAoaGV4LnN1YnN0ciAyLCAyKSwgMTZcbiAgICAgICAgICAgICAgICBwYXJzZUludCAoaGV4LnN1YnN0ciA0LCAyKSwgMTZdXG5cbiAgICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAjICBIRVhBIHRvIFJHQlxuICAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICBoZXhhVG9SZ2I6IChoZXhhKSAtPlxuICAgICAgICAgICAgcmV0dXJuIEBoZXhUb1JnYiAoaGV4YS5tYXRjaCAvcmdiYVxcKChcXCMuKyksLylbMV1cblxuICAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICMgIEhFWCB0byBIU0xcbiAgICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgaGV4VG9Ic2w6IChoZXgpIC0+XG4gICAgICAgICAgICByZXR1cm4gQHJnYlRvSHNsIEBoZXhUb1JnYiBoZXgucmVwbGFjZSAnIycsICcnXG5cbiAgICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAjICBSR0IgdG8gSEVYXG4gICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgIHJnYlRvSGV4OiAocmdiKSAtPlxuICAgICAgICAgICAgX2NvbXBvbmVudFRvSGV4ID0gKGNvbXBvbmVudCkgLT5cbiAgICAgICAgICAgICAgICBfaGV4ID0gY29tcG9uZW50LnRvU3RyaW5nIDE2XG4gICAgICAgICAgICAgICAgcmV0dXJuIGlmIF9oZXgubGVuZ3RoIGlzIDEgdGhlbiBcIjAjeyBfaGV4IH1cIiBlbHNlIF9oZXhcblxuICAgICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgICAgICAoX2NvbXBvbmVudFRvSGV4IHJnYlswXSlcbiAgICAgICAgICAgICAgICAoX2NvbXBvbmVudFRvSGV4IHJnYlsxXSlcbiAgICAgICAgICAgICAgICAoX2NvbXBvbmVudFRvSGV4IHJnYlsyXSlcbiAgICAgICAgICAgIF0uam9pbiAnJ1xuXG4gICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgIyAgUkdCIHRvIEhTTFxuICAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICByZ2JUb0hzbDogKFtyLCBnLCBiXSkgLT5cbiAgICAgICAgICAgIHIgLz0gMjU1XG4gICAgICAgICAgICBnIC89IDI1NVxuICAgICAgICAgICAgYiAvPSAyNTVcblxuICAgICAgICAgICAgX21heCA9IE1hdGgubWF4IHIsIGcsIGJcbiAgICAgICAgICAgIF9taW4gPSBNYXRoLm1pbiByLCBnLCBiXG5cbiAgICAgICAgICAgIF9sID0gKF9tYXggKyBfbWluKSAvIDJcblxuICAgICAgICAgICAgaWYgX21heCBpcyBfbWluIHRoZW4gcmV0dXJuIFswLCAwLCBNYXRoLmZsb29yIF9sICogMTAwXVxuXG4gICAgICAgICAgICBfZCA9IF9tYXggLSBfbWluXG4gICAgICAgICAgICBfcyA9IGlmIF9sID4gMC41IHRoZW4gX2QgLyAoMiAtIF9tYXggLSBfbWluKSBlbHNlIF9kIC8gKF9tYXggKyBfbWluKVxuXG4gICAgICAgICAgICBzd2l0Y2ggX21heFxuICAgICAgICAgICAgICAgIHdoZW4gciB0aGVuIF9oID0gKGcgLSBiKSAvIF9kICsgKGlmIGcgPCBiIHRoZW4gNiBlbHNlIDApXG4gICAgICAgICAgICAgICAgd2hlbiBnIHRoZW4gX2ggPSAoYiAtIHIpIC8gX2QgKyAyXG4gICAgICAgICAgICAgICAgd2hlbiBiIHRoZW4gX2ggPSAociAtIGcpIC8gX2QgKyA0XG5cbiAgICAgICAgICAgIF9oIC89IDZcblxuICAgICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgICAgICBNYXRoLmZsb29yIF9oICogMzYwXG4gICAgICAgICAgICAgICAgTWF0aC5mbG9vciBfcyAqIDEwMFxuICAgICAgICAgICAgICAgIE1hdGguZmxvb3IgX2wgKiAxMDBdXG5cbiAgICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAjICBSR0IgdG8gSFNWXG4gICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgIHJnYlRvSHN2OiAoW3IsIGcsIGJdKSAtPlxuICAgICAgICAgICAgY29tcHV0ZWRIID0gMFxuICAgICAgICAgICAgY29tcHV0ZWRTID0gMFxuICAgICAgICAgICAgY29tcHV0ZWRWID0gMFxuXG4gICAgICAgICAgICBpZiBub3Qgcj8gb3Igbm90IGc/IG9yIG5vdCBiPyBvciBpc05hTihyKSBvciBpc05hTihnKSBvciBpc05hTihiKVxuICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgaWYgciA8IDAgb3IgZyA8IDAgb3IgYiA8IDAgb3IgciA+IDI1NSBvciBnID4gMjU1IG9yIGIgPiAyNTVcbiAgICAgICAgICAgICAgICByZXR1cm5cblxuICAgICAgICAgICAgciA9IHIgLyAyNTVcbiAgICAgICAgICAgIGcgPSBnIC8gMjU1XG4gICAgICAgICAgICBiID0gYiAvIDI1NVxuXG4gICAgICAgICAgICBtaW5SR0IgPSBNYXRoLm1pbihyLCBNYXRoLm1pbihnLCBiKSlcbiAgICAgICAgICAgIG1heFJHQiA9IE1hdGgubWF4KHIsIE1hdGgubWF4KGcsIGIpKVxuXG4gICAgICAgICAgICAjIEJsYWNrLWdyYXktd2hpdGVcbiAgICAgICAgICAgIGlmIG1pblJHQiBpcyBtYXhSR0JcbiAgICAgICAgICAgICAgICBjb21wdXRlZFYgPSBtaW5SR0JcblxuICAgICAgICAgICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICAgICAgICAgIDBcbiAgICAgICAgICAgICAgICAgICAgMFxuICAgICAgICAgICAgICAgICAgICBjb21wdXRlZFZdXG5cbiAgICAgICAgICAgICMgQ29sb3JzIG90aGVyIHRoYW4gYmxhY2stZ3JheS13aGl0ZTpcbiAgICAgICAgICAgIGQgPSAoaWYgKHIgaXMgbWluUkdCKSB0aGVuIGcgLSBiIGVsc2UgKChpZiAoYiBpcyBtaW5SR0IpIHRoZW4gciAtIGcgZWxzZSBiIC0gcikpKVxuICAgICAgICAgICAgaCA9IChpZiAociBpcyBtaW5SR0IpIHRoZW4gMyBlbHNlICgoaWYgKGIgaXMgbWluUkdCKSB0aGVuIDEgZWxzZSA1KSkpXG5cbiAgICAgICAgICAgIGNvbXB1dGVkSCA9IDYwICogKGggLSBkIC8gKG1heFJHQiAtIG1pblJHQikpXG4gICAgICAgICAgICBjb21wdXRlZFMgPSAobWF4UkdCIC0gbWluUkdCKSAvIG1heFJHQlxuICAgICAgICAgICAgY29tcHV0ZWRWID0gbWF4UkdCXG5cbiAgICAgICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICAgICAgY29tcHV0ZWRIXG4gICAgICAgICAgICAgICAgY29tcHV0ZWRTXG4gICAgICAgICAgICAgICAgY29tcHV0ZWRWXVxuXG4gICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgIyAgSFNWIHRvIEhTTFxuICAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICBoc3ZUb0hzbDogKFtoLCBzLCB2XSkgLT4gW1xuICAgICAgICAgICAgaFxuICAgICAgICAgICAgcyAqIHYgLyAoaWYgKGggPSAoMiAtIHMpICogdikgPCAxIHRoZW4gaCBlbHNlIDIgLSBoKVxuICAgICAgICAgICAgaCAvIDJdXG5cbiAgICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAjICBIU1YgdG8gUkdCXG4gICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgIGhzdlRvUmdiOiAoW2gsIHMsIHZdKSAtPlxuICAgICAgICAgICAgaCAvPSA2MCAjIDAgdG8gNVxuICAgICAgICAgICAgcyAvPSAxMDBcbiAgICAgICAgICAgIHYgLz0gMTAwXG5cbiAgICAgICAgICAgICMgQWNocm9tYXRpYyBncmF5c2NhbGVcbiAgICAgICAgICAgIGlmIHMgaXMgMCB0aGVuIHJldHVybiBbXG4gICAgICAgICAgICAgICAgTWF0aC5yb3VuZCB2ICogMjU1XG4gICAgICAgICAgICAgICAgTWF0aC5yb3VuZCB2ICogMjU1XG4gICAgICAgICAgICAgICAgTWF0aC5yb3VuZCB2ICogMjU1XVxuXG4gICAgICAgICAgICBfaSA9IE1hdGguZmxvb3IgaFxuICAgICAgICAgICAgX2YgPSBoIC0gX2lcbiAgICAgICAgICAgIF9wID0gdiAqICgxIC0gcylcbiAgICAgICAgICAgIF9xID0gdiAqICgxIC0gcyAqIF9mKVxuICAgICAgICAgICAgX3QgPSB2ICogKDEgLSBzICogKDEgLSBfZikpXG5cbiAgICAgICAgICAgIF9yZXN1bHQgPSBzd2l0Y2ggX2lcbiAgICAgICAgICAgICAgICB3aGVuIDAgdGhlbiBbdiwgX3QsIF9wXVxuICAgICAgICAgICAgICAgIHdoZW4gMSB0aGVuIFtfcSwgdiwgX3BdXG4gICAgICAgICAgICAgICAgd2hlbiAyIHRoZW4gW19wLCB2LCBfdF1cbiAgICAgICAgICAgICAgICB3aGVuIDMgdGhlbiBbX3AsIF9xLCB2XVxuICAgICAgICAgICAgICAgIHdoZW4gNCB0aGVuIFtfdCwgX3AsIHZdXG4gICAgICAgICAgICAgICAgd2hlbiA1IHRoZW4gW3YsIF9wLCBfcV1cbiAgICAgICAgICAgICAgICBlbHNlIFt2LCBfdCwgX3BdXG5cbiAgICAgICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICAgICAgTWF0aC5yb3VuZCBfcmVzdWx0WzBdICogMjU1XG4gICAgICAgICAgICAgICAgTWF0aC5yb3VuZCBfcmVzdWx0WzFdICogMjU1XG4gICAgICAgICAgICAgICAgTWF0aC5yb3VuZCBfcmVzdWx0WzJdICogMjU1XVxuXG4gICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgIyAgSFNMIHRvIEhTVlxuICAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICBoc2xUb0hzdjogKFtoLCBzLCBsXSkgLT5cbiAgICAgICAgICAgIHMgLz0gMTAwXG4gICAgICAgICAgICBsIC89IDEwMFxuXG4gICAgICAgICAgICBzICo9IGlmIGwgPCAuNSB0aGVuIGwgZWxzZSAxIC0gbFxuXG4gICAgICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgICAgIGhcbiAgICAgICAgICAgICAgICAoMiAqIHMgLyAobCArIHMpKSBvciAwXG4gICAgICAgICAgICAgICAgbCArIHNdXG5cbiAgICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAjICBIU0wgdG8gUkdCXG4gICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgIGhzbFRvUmdiOiAoaW5wdXQpIC0+XG4gICAgICAgICAgICBbaCwgcywgdl0gPSBAaHNsVG9Ic3YgaW5wdXRcbiAgICAgICAgICAgIHJldHVybiBAaHN2VG9SZ2IgW2gsIChzICogMTAwKSwgKHYgKiAxMDApXVxuXG4gICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgIyAgVkVDIHRvIFJHQlxuICAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICB2ZWNUb1JnYjogKGlucHV0KSAtPiByZXR1cm4gW1xuICAgICAgICAgICAgKGlucHV0WzBdICogMjU1KSA8PCAwXG4gICAgICAgICAgICAoaW5wdXRbMV0gKiAyNTUpIDw8IDBcbiAgICAgICAgICAgIChpbnB1dFsyXSAqIDI1NSkgPDwgMF1cblxuICAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICMgIFJHQiB0byBWRUNcbiAgICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgcmdiVG9WZWM6IChpbnB1dCkgLT4gcmV0dXJuIFtcbiAgICAgICAgICAgIChpbnB1dFswXSAvIDI1NSkudG9GaXhlZCAyXG4gICAgICAgICAgICAoaW5wdXRbMV0gLyAyNTUpLnRvRml4ZWQgMlxuICAgICAgICAgICAgKGlucHV0WzJdIC8gMjU1KS50b0ZpeGVkIDJdXG4iXX0=
