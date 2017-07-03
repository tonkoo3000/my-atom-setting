"use babel";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = throttle;

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function throttle(fn, threshhold, scope) {

  threshhold = threshhold || 250;

  var last = undefined,
      timer = undefined;

  var step = function step(time, args) {
    last = time;
    fn.apply(undefined, _toConsumableArray(args));
  };

  return function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var now = new Date().getTime();

    clearTimeout(timer);

    if (last && now < last + threshhold) {
      timer = setTimeout(function () {
        return step(now, args);
      }, threshhold);
    } else {
      step(now, args);
    }
  };
}

module.exports = exports["default"];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3RveW9raS8uYXRvbS9wYWNrYWdlcy9ibGFtZS9saWIvdXRpbHMvdGhyb3R0bGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFBOzs7OztxQkFFYSxRQUFROzs7O0FBQWpCLFNBQVMsUUFBUSxDQUFDLEVBQUUsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFOztBQUV0RCxZQUFVLEdBQUcsVUFBVSxJQUFJLEdBQUcsQ0FBQzs7QUFFL0IsTUFBSSxJQUFJLFlBQUE7TUFBRSxLQUFLLFlBQUEsQ0FBQzs7QUFFaEIsTUFBTSxJQUFJLEdBQUcsU0FBUCxJQUFJLENBQUksSUFBSSxFQUFFLElBQUksRUFBSztBQUMzQixRQUFJLEdBQUcsSUFBSSxDQUFDO0FBQ1osTUFBRSxxQ0FBSSxJQUFJLEVBQUMsQ0FBQztHQUNiLENBQUE7O0FBRUQsU0FBTyxZQUFhO3NDQUFULElBQUk7QUFBSixVQUFJOzs7QUFFYixRQUFNLEdBQUcsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDOztBQUVqQyxnQkFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDOztBQUVwQixRQUFJLElBQUksSUFBSSxHQUFHLEdBQUcsSUFBSSxHQUFHLFVBQVUsRUFBRTtBQUNuQyxXQUFLLEdBQUcsVUFBVSxDQUFDO2VBQU0sSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUM7T0FBQSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0tBQ3ZELE1BQU07QUFDTCxVQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFBO0tBQ2hCO0dBQ0YsQ0FBQztDQUNIIiwiZmlsZSI6Ii9ob21lL3RveW9raS8uYXRvbS9wYWNrYWdlcy9ibGFtZS9saWIvdXRpbHMvdGhyb3R0bGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBiYWJlbFwiXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHRocm90dGxlKGZuLCB0aHJlc2hob2xkLCBzY29wZSkge1xuXG4gIHRocmVzaGhvbGQgPSB0aHJlc2hob2xkIHx8IDI1MDtcblxuICBsZXQgbGFzdCwgdGltZXI7XG5cbiAgY29uc3Qgc3RlcCA9ICh0aW1lLCBhcmdzKSA9PiB7XG4gICAgbGFzdCA9IHRpbWU7XG4gICAgZm4oLi4uYXJncyk7XG4gIH1cblxuICByZXR1cm4gKC4uLmFyZ3MpID0+IHtcblxuICAgIGNvbnN0IG5vdyA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuXG4gICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcblxuICAgIGlmIChsYXN0ICYmIG5vdyA8IGxhc3QgKyB0aHJlc2hob2xkKSB7XG4gICAgICB0aW1lciA9IHNldFRpbWVvdXQoKCkgPT4gc3RlcChub3csIGFyZ3MpLCB0aHJlc2hob2xkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RlcChub3csIGFyZ3MpXG4gICAgfVxuICB9O1xufVxuIl19