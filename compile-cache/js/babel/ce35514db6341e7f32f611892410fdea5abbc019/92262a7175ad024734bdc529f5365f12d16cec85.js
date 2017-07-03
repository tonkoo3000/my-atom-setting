Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _blamer = require('blamer');

var _blamer2 = _interopRequireDefault(_blamer);

"use babel";

var blamer = null;

exports['default'] = function (file, callback) {

  if (!blamer) {
    blamer = new _blamer2['default']('git');
  }

  blamer.blameByFile(file).then(function (result) {
    return callback(result[file]);
  }, function (error) {
    return callback(null);
  });
};

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3RveW9raS8uYXRvbS9wYWNrYWdlcy9ibGFtZS9saWIvdXRpbHMvYmxhbWUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O3NCQUVtQixRQUFROzs7O0FBRjNCLFdBQVcsQ0FBQTs7QUFHWCxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUE7O3FCQUVGLFVBQVUsSUFBSSxFQUFFLFFBQVEsRUFBRTs7QUFFdkMsTUFBSSxDQUFDLE1BQU0sRUFBRTtBQUNYLFVBQU0sR0FBRyx3QkFBVyxLQUFLLENBQUMsQ0FBQTtHQUMzQjs7QUFHRCxRQUFNLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FDM0IsVUFBQyxNQUFNO1dBQUssUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztHQUFBLEVBQ2xDLFVBQUMsS0FBSztXQUFLLFFBQVEsQ0FBQyxJQUFJLENBQUM7R0FBQSxDQUMxQixDQUFBO0NBQ0YiLCJmaWxlIjoiL2hvbWUvdG95b2tpLy5hdG9tL3BhY2thZ2VzL2JsYW1lL2xpYi91dGlscy9ibGFtZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIGJhYmVsXCJcblxuaW1wb3J0IEJsYW1lciBmcm9tICdibGFtZXInXG5sZXQgYmxhbWVyID0gbnVsbFxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiAoZmlsZSwgY2FsbGJhY2spIHtcblxuICBpZiAoIWJsYW1lcikge1xuICAgIGJsYW1lciA9IG5ldyBCbGFtZXIoJ2dpdCcpXG4gIH1cblxuXG4gIGJsYW1lci5ibGFtZUJ5RmlsZShmaWxlKS50aGVuKFxuICAgIChyZXN1bHQpID0+IGNhbGxiYWNrKHJlc3VsdFtmaWxlXSksXG4gICAgKGVycm9yKSA9PiBjYWxsYmFjayhudWxsKVxuICApXG59XG4iXX0=