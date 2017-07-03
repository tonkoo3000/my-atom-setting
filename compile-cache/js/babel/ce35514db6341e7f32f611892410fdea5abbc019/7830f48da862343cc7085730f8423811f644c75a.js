function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

"use babel";

function findRepo(currentPath) {
  var lastPath = undefined;
  while (currentPath && lastPath !== currentPath) {
    lastPath = currentPath;
    currentPath = _path2['default'].dirname(currentPath);

    var repoPath = _path2['default'].join(currentPath, '.git');

    if (_fs2['default'].existsSync(repoPath)) {
      return repoPath;
    }
  }

  return null;
}

module.exports = findRepo;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3RveW9raS8uYXRvbS9wYWNrYWdlcy9ibGFtZS9saWIvdXRpbHMvZmluZC1yZXBvLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O29CQUVpQixNQUFNOzs7O2tCQUNSLElBQUk7Ozs7QUFIbkIsV0FBVyxDQUFBOztBQUtYLFNBQVMsUUFBUSxDQUFDLFdBQVcsRUFBRTtBQUM3QixNQUFJLFFBQVEsWUFBQSxDQUFBO0FBQ1osU0FBTyxXQUFXLElBQUksUUFBUSxLQUFLLFdBQVcsRUFBRTtBQUM5QyxZQUFRLEdBQUcsV0FBVyxDQUFBO0FBQ3RCLGVBQVcsR0FBRyxrQkFBSyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUE7O0FBRXZDLFFBQUksUUFBUSxHQUFHLGtCQUFLLElBQUksQ0FBQyxXQUFXLEVBQUUsTUFBTSxDQUFDLENBQUE7O0FBRTdDLFFBQUksZ0JBQUcsVUFBVSxDQUFDLFFBQVEsQ0FBQyxFQUFFO0FBQzNCLGFBQU8sUUFBUSxDQUFBO0tBQ2hCO0dBQ0Y7O0FBRUQsU0FBTyxJQUFJLENBQUE7Q0FDWjs7QUFFRCxNQUFNLENBQUMsT0FBTyxHQUFHLFFBQVEsQ0FBQSIsImZpbGUiOiIvaG9tZS90b3lva2kvLmF0b20vcGFja2FnZXMvYmxhbWUvbGliL3V0aWxzL2ZpbmQtcmVwby5qcyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIGJhYmVsXCJcblxuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCBmcyBmcm9tICdmcydcblxuZnVuY3Rpb24gZmluZFJlcG8oY3VycmVudFBhdGgpIHtcbiAgbGV0IGxhc3RQYXRoXG4gIHdoaWxlIChjdXJyZW50UGF0aCAmJiBsYXN0UGF0aCAhPT0gY3VycmVudFBhdGgpIHtcbiAgICBsYXN0UGF0aCA9IGN1cnJlbnRQYXRoXG4gICAgY3VycmVudFBhdGggPSBwYXRoLmRpcm5hbWUoY3VycmVudFBhdGgpXG5cbiAgICBsZXQgcmVwb1BhdGggPSBwYXRoLmpvaW4oY3VycmVudFBhdGgsICcuZ2l0JylcblxuICAgIGlmIChmcy5leGlzdHNTeW5jKHJlcG9QYXRoKSkge1xuICAgICAgcmV0dXJuIHJlcG9QYXRoXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG51bGxcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmaW5kUmVwb1xuIl19