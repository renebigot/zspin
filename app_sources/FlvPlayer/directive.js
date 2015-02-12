app.directive('flvplayer', ['$window', '$timeout',
  function($window, $timeout) {
    return {
      restrict: 'E',
      transclude: true,
      scope: {
        autoload : '@',
        autoplay : '@',
        loop     : '@',
        flv      : '@',
        volume   : '@',
        height   : '@',
        width    : '@',
        model    : '=ngModel',
      },
      link: function(scope, el, attrs) {
        var uid = 'flvplayer'+(''+Math.random()).replace(/[^0-9]/g,'');
        var file = 'file:///Users/godric/Projects/zspin/zspin-gui/build/swf/player_flv_js.swf';


        var model = scope.model || {};
        // Model options
        var options = scope.options = model.options = model.options || {};
        options.flv           = scope.flv              || options.flv       || '';
        options.autoload      = !!scope.autoload       || options.autoload  || true;
        options.autoplay      = !!scope.autoplay       || options.autoplay  || false;
        options.loop          = !!scope.loop           || options.loop      || false;
        options.width         = parseInt(scope.width)  || options.width     || 320;
        options.height        = parseInt(scope.height) || options.height    || 240;
        options.volume        = parseInt(scope.volume) || options.volume    || 1;
        options.buffer        = options.buffer         || 5;
        options.interval      = options.interval       || 100;

        // Model status options
        var status = scope.status = model.status = model.status || {};
        status.ready         = false;
        status.position      = 0;
        status.duration      = NaN;
        status.volume        = 100;
        status.isPlaying     = false;
        status.bytesTotal    = NaN;
        status.bytesLoaded   = NaN;
        status.bytesPercent  = NaN;
        status.bufferLength  = NaN;
        status.bufferTime    = NaN;

        var controls = scope.constrols = model.controls = model.controls || {};
        controls._rpc = function(name, args) {
          document[uid].SetVariable('method:'+name, args||'');
        };
        controls.setUrl = function(url) {
          controls._rpc('setUrl', url);
        };
        controls.play = function() {
          controls._rpc('play');
        };
        controls.pause = function() {
          controls._rpc('pause');
        };
        controls.stop = function() {
          controls._rpc('stop');
        };
        controls.setVolume = function(volume) {
          controls._rpc('setVolume', volume);
        };
        controls.setPosition = function(time) {
          controls._rpc('setPosition', Math.round(time*1000));
        };

        window[uid] = {
          onInit: function () {
            scope.$apply(function() {
              controls.setVolume();
              status.ready = true;
            });
          },
          onClick: function () {
            var ev = document.createEvent('MouseEvent');
            ev.initMouseEvent('click',
              true, true, window, null,   /* bubble, cancelable, view, details */
              0, 0, 0, 0,                 /* screenX, screenY, clientX, clientY */
              false, false, false, false, /* ctrlKey, altKey, shiftKey, metaKey */
              0, null                     /* button, relatedTarget */
            );
            el[0].dispatchEvent(ev);
          },
          onKeyUp: function (keyCode) {
          },
          onFinished: function () {
            controls.setPosition(0);
            if (options.loop) {
              $timeout(controls.play, 100);
            }
          },
          onUpdate: function () {
            scope.$apply(function() {
              var l = window[uid];
              status.bytesTotal   = parseFloat(l.bytesTotal);
              status.bytesLoaded  = parseFloat(l.bytesLoaded);
              status.bytesPercent = parseFloat(l.bytesPercent);
              status.bufferLength = parseFloat(l.bufferLength);
              status.bufferTime   = parseFloat(l.bufferTime);
              status.isPlaying    = l.isPlaying !== 'false';
              status.position     = l.position/1000 || 0;
              status.duration     = l.duration/1000;
              status.volume       = parseInt(l.volume);
            });
          },
        };


        var flashVars = [
          'listener='      + uid,                        // The javascript listener waiting for the flash events.
          'flv='           + options.flv,                // Source of the flv video file
          'autoload='      + (options.autoload?'1':'0'), // 1 to auto-play
          'autoplay='      + (options.autoplay?'1':'0'), // 1 to auto-play
          'buffer='        + options.buffer,             // The number of seconds to buffer. By default set to 5
          'interval='      + options.interval,           // Time interval between updates, in milliseconds.
          'useHandCursor=0',                             // 0 to hide the hand when hovering the video.
          'useexternalinterface=1',                      // 1 to use ExternalInterface to update the javascript listener.
        ].join('&');

        el.html([
            '<object id="'+uid+'" type="application/x-shockwave-flash"',
            '    data="'+file+'"',
            '    width="'+options.width+'"',
            '    height="'+options.height+'">',
            '  <param name="movie" value="'+file+'" />',
            '  <param name="autoplay" value="true" />',
            '  <param name="wmode" value="transparent" />',
            '  <param name="AllowScriptAccess" value="always" />',
            '  <param name="AllowNetworking" value="all" />',
            '  <param name="FlashVars" value="'+flashVars+'" />',
            '</object>',
          ].join('\n')
        );

        scope.$watch('flv', function(value) {
          options.flv = value;
        });
        scope.$watch('loop', function(value) {
          if (value)
            options.loop = value !== 'false';
        });
        scope.$watch('width', function(value) {
          if (value || value === 0)
            options.width = value;
        });
        scope.$watch('height', function(value) {
          if (value || value === 0)
            options.height = value;
        });
        scope.$watch('volume', function(value) {
          if (value || value === 0)
            options.volume = value;
        });

        scope.$watch('options.flv', function(value) {
          if (value || value === 0)
            controls.setUrl(value);
        });
        scope.$watch('options.width', function(value) {
          if (value || value === 0)
            document[uid].width = scope.width || value;
        });
        scope.$watch('options.height', function(value) {
          if (value || value === 0)
            document[uid].height = scope.height || value;
        });
        scope.$watch('options.volume', function(value) {
          if (value || value === 0)
            controls.setVolume(parseInt(value));
        });

      }
    };
  }
]);