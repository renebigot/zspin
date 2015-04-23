'use strict'

app.directive('theme', ['$q', 'zspin', 'fs', 'zip', 'themes',
  function($q, zspin, fs, zip, themes) {

    return {
      restrict: 'E',
      templateUrl: 'Theme/template.html',
      scope: {
        src: '@',
        menu: '@',
      },
      link: function(scope, el, attrs) {
        scope.tmpRoot = zspin.path('Cache', 'Theme');
        scope.tmpPath = scope.tmpRoot;

        // Update scope.theme when src attribute change
        scope.$watch('src', function(src) {
          if (!src) return;

          var path = fs.dirname(src);
          var name = scope.name || fs.basename(src);

          // Create new tmpPath, extract & load
          scope.tmpPath = fs.join(scope.tmpRoot, name);
          fs.mkdir(scope.tmpPath).then(function() {
            return zip.extract(src, scope.tmpPath);
          }).then(function() {
            scope.theme = themes(scope.tmpPath, scope.menu, name);
          });

        });

        // Remove tmpRoot on destroy
        scope.$on("$destroy", function handler() {
          console.log('actual destroy');
          fs.rmrf(scope.tmpPath);
        });

      }
    };
  }
]);