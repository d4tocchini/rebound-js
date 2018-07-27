/**
   *  Copyright (c) 2013, Facebook, Inc.
   *  All rights reserved.
   *
   *  This source code is licensed under the BSD-style license found in the
   *  LICENSE file in the root directory of this source tree. An additional grant
   *  of patent rights can be found in the PATENTS file in the same directory.
   */
(function (rebound) {
'use strict';

rebound = rebound && rebound.hasOwnProperty('default') ? rebound['default'] : rebound;

function xlat(el, x, y) {
  el.style.mozTransform = el.style.msTransform = el.style.webkitTransform = el.style.transform = 'translate3d(' + x + 'px, ' + y + 'px, 0px)';
}

function xfrm(el) {
  var xlatX = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var xlatY = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

  var _scale = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1;

  var rot = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;

  var transformString = 'translate3d(' + xlatX + 'px, ' + xlatY + 'px, 0px) ' + 'scale3d(' + _scale + ', ' + _scale + ', 1) ' + 'rotate(' + rot + 'deg)';
  el.style.mozTransform = el.style.msTransform = el.style.webkitTransform = el.style.transform = transformString;
}

var downEvt = window.ontouchstart !== undefined ? 'touchstart' : 'mousedown';
var upEvt = window.ontouchend !== undefined ? 'touchend' : 'mouseup';

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var onFrame = rebound.util.onFrame;

var Cascade = function () {
  function Cascade(onEndListener) {
    classCallCheck(this, Cascade);

    this.springSystem = new rebound.SpringSystem(new rebound.SimulationLooper());
    this.spring = this.springSystem.createSpring(40, 4);
    this.spring.setRestSpeedThreshold = 0.5;
    this.spring.setRestDisplacementThreshold = 0.5;
    this.frames = [];
    this.players = [];
    this.currentFrame = 0;
    this.recordSpring(1);
    this.onEndListener = onEndListener;
    this._boundFrameCallback = this.renderFrame.bind(this);
  }

  Cascade.prototype.reset = function reset() {
    for (var i = 0; i < this.players.length; i++) {
      this.players[i].frame = 0;
    }
    this.currentFrame = 0;
    return this;
  };

  Cascade.prototype.recordSpring = function recordSpring(pos) {
    this.start = this.spring.getCurrentValue();
    this.end = pos;
    this.frames = [];
    this.spring.addListener(this);
    this.spring.setEndValue(pos);
    this.spring.removeListener(this);
    return this;
  };

  Cascade.prototype.onSpringUpdate = function onSpringUpdate(spring) {
    this.frames.push(spring.getCurrentValue());
  };

  Cascade.prototype.addPlayer = function addPlayer(fn) {
    this.players.push({ frame: 0, fn: fn, pos: this.players.length });
  };

  Cascade.prototype.play = function play() {
    if (this.playing) {
      return;
    }
    this.reset();
    if (this.didPlayOnce) {
      var target = this.spring.getEndValue() === 1 ? 0 : 1;
      this.spring.setOvershootClampingEnabled(target !== 1);
      this.recordSpring(target);
      this.players = this.players.reverse();
    }
    this.didPlayOnce = true;
    this.playing = true;
    this._boundFrameCallback();
  };

  Cascade.prototype.renderFrame = function renderFrame() {
    var toPlay = [];
    for (var i = 0; i < this.players.length; i++) {
      var player = this.players[i];
      if (player.frame < this.frames.length && i <= this.currentFrame) {
        toPlay.push(player);
      }
    }

    if (toPlay.length > 0) {
      for (var j = 0; j < toPlay.length; j++) {
        var _p = toPlay[j];
        var _frame = this.frames[_p.frame];
        _p.fn(_p.pos, _p.frame, _frame, this.start, this.end);
        _p.frame++;
      }
      this.currentFrame++;
      onFrame(this._boundFrameCallback);
    } else {
      this.playing = false;
      this.onEndListener && this.onEndListener();
    }
  };

  return Cascade;
}();

var doit = function doit() {
  var container = document.getElementById('cascadeEffectExample');

  var button = document.createElement('button');
  button.innerHTML = 'Transition In';
  var movingIn = true;
  button.addEventListener('click', function () {
    button.disabled = true;
    cascade.play();
  });
  container.appendChild(button);

  var secondContainer = document.createElement('div');
  secondContainer.className = 'secondContainer';
  container.appendChild(secondContainer);

  var cascade = new Cascade(function () {
    button.disabled = false;
    if (movingIn) {
      button.innerHTML = 'Transition Out';
      movingIn = false;
    } else {
      button.innerHTML = 'Transition In';
      movingIn = true;
    }
  });

  for (var i = 0; i < 10; i++) {
    var div = document.createElement('div');
    div.className = 'cascadeRow';
    div.innerHTML = 'row ' + (i + 1);
    div.style.opacity = 0;

    var r = rebound.MathUtil.mapValueInRange(i, 0, 9, 203, 255) | 0;
    var g = rebound.MathUtil.mapValueInRange(i, 0, 9, 17, 210) | 0;
    var b = rebound.MathUtil.mapValueInRange(i, 0, 9, 231, 0) | 0;
    div.style.backgroundColor = 'rgb(' + r + ',' + g + ',' + b + ')';

    container.appendChild(div);

    cascade.addPlayer(function (_div) {
      var clamped = false;
      var lastEnd = void 0;
      return function (idx, frame, val, start, end) {
        if (lastEnd !== end) {
          clamped = false;
        }

        var x = rebound.MathUtil.mapValueInRange(val, 0, 1, -200, 0);
        xlat(_div, x, 0);
        if (end > start && val > end || end < start && val < end || clamped) {
          val = end;
          clamped = true;
        }

        _div.style.opacity = val * 0.75;
        lastEnd = end;
      };
    }(div));
  }

  var _loop = function _loop(_i) {
    var div = document.createElement('div');
    var mapValueInRange = rebound.MathUtil.mapValueInRange;
    div.className = 'dot';
    div.style.opacity = 0;
    secondContainer.appendChild(div);

    var r = mapValueInRange(_i, 0, 117, 17, 0) | 0;
    var g = mapValueInRange(_i, 0, 117, 148, 204) | 0;
    var b = mapValueInRange(_i, 0, 117, 231, 0) | 0;
    div.style.backgroundColor = 'rgb(' + r + ',' + g + ',' + b + ')';

    cascade.addPlayer(function (_div) {
      var clamped = false;
      var lastEnd = void 0;
      return function (idx, frame, val, start, end) {
        if (lastEnd !== end) {
          clamped = false;
        }

        var y = mapValueInRange(val, 0, 1, 0, 0);
        var x = mapValueInRange(val, 0, 1, 100, 0);
        var rot = mapValueInRange(val, 0, 1, 190, 0);
        var scale$$1 = mapValueInRange(val, 0, 1, 0, 1);

        if (end > start && val > end || end < start && val < end || clamped) {
          val = end;
          clamped = true;
        }

        _div.style.opacity = val * 0.5;
        xfrm(_div, x, y, scale$$1, rot);

        lastEnd = end;
      };
    }(div));
  };

  for (var _i = 0; _i < 117; _i++) {
    _loop(_i);
  }

  setTimeout(function () {
    if (cascade.playing) {
      return;
    }
    button.disabled = true;
    cascade.play();
  }, 1000);
};

document.addEventListener('DOMContentLoaded', doit);

}(rebound));
