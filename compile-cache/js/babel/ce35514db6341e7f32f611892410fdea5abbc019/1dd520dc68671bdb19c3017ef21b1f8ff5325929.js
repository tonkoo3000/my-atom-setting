Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _findRepo = require('./find-repo');

var _findRepo2 = _interopRequireDefault(_findRepo);

var _gitWrapper = require('git-wrapper');

var _gitWrapper2 = _interopRequireDefault(_gitWrapper);

var _configProvider = require('../config/provider');

var _configProvider2 = _interopRequireDefault(_configProvider);

"use babel";

function parseRemote(remote, config) {
  for (var exp of config.exps) {
    var m = remote.match(exp);
    if (m) {
      return { protocol: m[1], host: m[2], user: m[3], repo: m[4] };
    }
  }

  return null;
}

function buildLink(remote, hash, config) {
  data = parseRemote(remote, config);
  if (data) {
    return config.template.replace('{protocol}', data.protocol || 'https').replace('{host}', data.host).replace('{user}', data.user).replace('{repo}', data.repo).replace('{hash}', hash);
  }

  return null;
}

function getConfig(git, key, callback) {
  git.exec('config', { get: true }, [key], callback);
}

function getCommitLink(file, hash, callback) {
  var repoPath = (0, _findRepo2['default'])(file);
  if (!repoPath) {
    return;
  }

  var git = new _gitWrapper2['default']({ 'git-dir': repoPath });
  getConfig(git, 'atom-blame.browser-url', function (error, url) {

    if (url) {
      var _link = url.replace(/(^\s+|\s+$)/g, '').replace('{hash}', hash);

      if (_link) {
        return callback(_link);
      }
    }

    getConfig(git, 'remote.origin.url', function (error, remote) {

      if (error) {
        return console.error(error);
      }

      remote = remote.replace(/(^\s+|\s+$)/g, '');

      for (var config of _configProvider2['default']) {
        link = buildLink(remote, hash, config);
        if (link) {
          return callback(link);
        }
      }

      callback(null);
    });
  });
}

exports['default'] = getCommitLink;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3RveW9raS8uYXRvbS9wYWNrYWdlcy9ibGFtZS9saWIvdXRpbHMvZ2V0LWNvbW1pdC1saW5rLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozt3QkFFcUIsYUFBYTs7OzswQkFDbEIsYUFBYTs7Ozs4QkFDVCxvQkFBb0I7Ozs7QUFKeEMsV0FBVyxDQUFBOztBQU1WLFNBQVMsV0FBVyxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUU7QUFDcEMsT0FBSyxJQUFJLEdBQUcsSUFBSSxNQUFNLENBQUMsSUFBSSxFQUFFO0FBQzNCLFFBQUksQ0FBQyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDekIsUUFBSSxDQUFDLEVBQUU7QUFDTCxhQUFPLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFBO0tBQzlEO0dBQ0Y7O0FBRUQsU0FBTyxJQUFJLENBQUE7Q0FDWjs7QUFFRCxTQUFTLFNBQVMsQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRTtBQUN2QyxNQUFJLEdBQUcsV0FBVyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQTtBQUNsQyxNQUFJLElBQUksRUFBRTtBQUNSLFdBQU8sTUFBTSxDQUFDLFFBQVEsQ0FDbkIsT0FBTyxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsUUFBUSxJQUFJLE9BQU8sQ0FBQyxDQUMvQyxPQUFPLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FDNUIsT0FBTyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQzVCLE9BQU8sQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUM1QixPQUFPLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFBO0dBQzNCOztBQUVELFNBQU8sSUFBSSxDQUFBO0NBQ1o7O0FBRUQsU0FBUyxTQUFTLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUU7QUFDckMsS0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBRSxHQUFHLENBQUUsRUFBRSxRQUFRLENBQUMsQ0FBQTtDQUNyRDs7QUFFRCxTQUFTLGFBQWEsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRTtBQUMzQyxNQUFJLFFBQVEsR0FBRywyQkFBUyxJQUFJLENBQUMsQ0FBQTtBQUM3QixNQUFJLENBQUMsUUFBUSxFQUFFO0FBQ2IsV0FBTTtHQUNQOztBQUVELE1BQUksR0FBRyxHQUFHLDRCQUFRLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUE7QUFDMUMsV0FBUyxDQUFDLEdBQUcsRUFBRSx3QkFBd0IsRUFBRSxVQUFDLEtBQUssRUFBRSxHQUFHLEVBQUs7O0FBRXZELFFBQUksR0FBRyxFQUFFO0FBQ1AsVUFBSSxLQUFJLEdBQUcsR0FBRyxDQUNYLE9BQU8sQ0FBQyxjQUFjLEVBQUUsRUFBRSxDQUFDLENBQzNCLE9BQU8sQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUE7O0FBRTFCLFVBQUksS0FBSSxFQUFFO0FBQ1IsZUFBTyxRQUFRLENBQUMsS0FBSSxDQUFDLENBQUE7T0FDdEI7S0FDRjs7QUFFRCxhQUFTLENBQUMsR0FBRyxFQUFFLG1CQUFtQixFQUFFLFVBQUMsS0FBSyxFQUFFLE1BQU0sRUFBSzs7QUFFckQsVUFBSSxLQUFLLEVBQUU7QUFBRSxlQUFPLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUE7T0FBRTs7QUFFMUMsWUFBTSxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsY0FBYyxFQUFFLEVBQUUsQ0FBQyxDQUFBOztBQUUzQyxXQUFLLElBQUksTUFBTSxpQ0FBYTtBQUMxQixZQUFJLEdBQUcsU0FBUyxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUE7QUFDdEMsWUFBSSxJQUFJLEVBQUU7QUFDUixpQkFBTyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUE7U0FDdEI7T0FDRjs7QUFFRCxjQUFRLENBQUMsSUFBSSxDQUFDLENBQUE7S0FDZixDQUFDLENBQUE7R0FDSCxDQUFDLENBQUE7Q0FDSDs7cUJBRWMsYUFBYSIsImZpbGUiOiIvaG9tZS90b3lva2kvLmF0b20vcGFja2FnZXMvYmxhbWUvbGliL3V0aWxzL2dldC1jb21taXQtbGluay5qcyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIGJhYmVsXCJcblxuaW1wb3J0IGZpbmRSZXBvIGZyb20gJy4vZmluZC1yZXBvJ1xuaW1wb3J0IEdpdCBmcm9tICdnaXQtd3JhcHBlcidcbmltcG9ydCBjb25maWdzIGZyb20gJy4uL2NvbmZpZy9wcm92aWRlcidcblxuIGZ1bmN0aW9uIHBhcnNlUmVtb3RlKHJlbW90ZSwgY29uZmlnKSB7XG4gIGZvciAobGV0IGV4cCBvZiBjb25maWcuZXhwcykge1xuICAgIGxldCBtID0gcmVtb3RlLm1hdGNoKGV4cClcbiAgICBpZiAobSkge1xuICAgICAgcmV0dXJuIHsgcHJvdG9jb2w6IG1bMV0sIGhvc3Q6IG1bMl0sIHVzZXI6IG1bM10sIHJlcG86IG1bNF0gfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBudWxsXG59XG5cbmZ1bmN0aW9uIGJ1aWxkTGluayhyZW1vdGUsIGhhc2gsIGNvbmZpZykge1xuICBkYXRhID0gcGFyc2VSZW1vdGUocmVtb3RlLCBjb25maWcpXG4gIGlmIChkYXRhKSB7XG4gICAgcmV0dXJuIGNvbmZpZy50ZW1wbGF0ZVxuICAgICAgLnJlcGxhY2UoJ3twcm90b2NvbH0nLCBkYXRhLnByb3RvY29sIHx8ICdodHRwcycpXG4gICAgICAucmVwbGFjZSgne2hvc3R9JywgZGF0YS5ob3N0KVxuICAgICAgLnJlcGxhY2UoJ3t1c2VyfScsIGRhdGEudXNlcilcbiAgICAgIC5yZXBsYWNlKCd7cmVwb30nLCBkYXRhLnJlcG8pXG4gICAgICAucmVwbGFjZSgne2hhc2h9JywgaGFzaClcbiAgfVxuXG4gIHJldHVybiBudWxsXG59XG5cbmZ1bmN0aW9uIGdldENvbmZpZyhnaXQsIGtleSwgY2FsbGJhY2spIHtcbiAgZ2l0LmV4ZWMoJ2NvbmZpZycsIHsgZ2V0OiB0cnVlIH0sIFsga2V5IF0sIGNhbGxiYWNrKVxufVxuXG5mdW5jdGlvbiBnZXRDb21taXRMaW5rKGZpbGUsIGhhc2gsIGNhbGxiYWNrKSB7XG4gIGxldCByZXBvUGF0aCA9IGZpbmRSZXBvKGZpbGUpXG4gIGlmICghcmVwb1BhdGgpIHtcbiAgICByZXR1cm5cbiAgfVxuXG4gIGxldCBnaXQgPSBuZXcgR2l0KHsgJ2dpdC1kaXInOiByZXBvUGF0aCB9KVxuICBnZXRDb25maWcoZ2l0LCAnYXRvbS1ibGFtZS5icm93c2VyLXVybCcsIChlcnJvciwgdXJsKSA9PiB7XG5cbiAgICBpZiAodXJsKSB7XG4gICAgICBsZXQgbGluayA9IHVybFxuICAgICAgICAucmVwbGFjZSgvKF5cXHMrfFxccyskKS9nLCAnJylcbiAgICAgICAgLnJlcGxhY2UoJ3toYXNofScsIGhhc2gpXG5cbiAgICAgIGlmIChsaW5rKSB7XG4gICAgICAgIHJldHVybiBjYWxsYmFjayhsaW5rKVxuICAgICAgfVxuICAgIH1cblxuICAgIGdldENvbmZpZyhnaXQsICdyZW1vdGUub3JpZ2luLnVybCcsIChlcnJvciwgcmVtb3RlKSA9PiB7XG5cbiAgICAgIGlmIChlcnJvcikgeyByZXR1cm4gY29uc29sZS5lcnJvcihlcnJvcikgfVxuXG4gICAgICByZW1vdGUgPSByZW1vdGUucmVwbGFjZSgvKF5cXHMrfFxccyskKS9nLCAnJylcblxuICAgICAgZm9yIChsZXQgY29uZmlnIG9mIGNvbmZpZ3MpIHtcbiAgICAgICAgbGluayA9IGJ1aWxkTGluayhyZW1vdGUsIGhhc2gsIGNvbmZpZylcbiAgICAgICAgaWYgKGxpbmspIHtcbiAgICAgICAgICByZXR1cm4gY2FsbGJhY2sobGluaylcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBjYWxsYmFjayhudWxsKVxuICAgIH0pXG4gIH0pXG59XG5cbmV4cG9ydCBkZWZhdWx0IGdldENvbW1pdExpbmtcbiJdfQ==