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

function createSpring(springSystem, friction, tension, rawValues) {
  var spring = springSystem.createSpring();
  var springConfig = void 0;
  if (rawValues) {
    springConfig = new rebound.SpringConfig(friction, tension);
  } else {
    springConfig = rebound.SpringConfig.fromOrigamiTensionAndFriction(friction, tension);
  }
  spring.setSpringConfig(springConfig);
  spring.setCurrentValue(0);
  return spring;
}

function scale(el, val) {
  el.style.mozTransform = el.style.msTransform = el.style.webkitTransform = el.style.transform = 'scale3d(' + val + ', ' + val + ', 1)';
}

function drawGridLines(canvas, ctx, graphScale) {
  ctx.beginPath();
  ctx.moveTo(0, canvas.height / 2);
  ctx.lineTo(canvas.width, canvas.height / 2);
  ctx.moveTo(0, -1 * graphScale + canvas.height / 2);
  ctx.lineTo(canvas.width, -1 * graphScale + canvas.height / 2);
  ctx.moveTo(0, 1 * graphScale + canvas.height / 2);
  ctx.lineTo(canvas.width, 1 * graphScale + canvas.height / 2);
  ctx.lineWidth = 0.5;
  ctx.strokeStyle = '#ff0000';
  ctx.stroke();
  ctx.closePath();
  ctx.lineWidth = 0.25;
  ctx.beginPath();
  for (var i = 0; i < 600; i += 10) {
    ctx.moveTo(0, i);
    ctx.lineTo(canvas.width, i);
  }
  for (var _i = 0; _i < 600; _i += 10) {
    ctx.moveTo(_i, 0);
    ctx.lineTo(_i, canvas.height);
  }
  ctx.strokeStyle = '#0000ff';
  ctx.stroke();
  ctx.lineWidth = 1;
  ctx.closePath();
}

function mapValueFromRangeToRange(value, fromLow, fromHigh, toLow, toHigh) {
  var fromRangeSize = fromHigh - fromLow;
  var toRangeSize = toHigh - toLow;
  var valueScale = (value - fromLow) / fromRangeSize;
  return toLow + valueScale * toRangeSize;
}

var downEvt = window.ontouchstart !== undefined ? 'touchstart' : 'mousedown';
var upEvt = window.ontouchend !== undefined ? 'touchend' : 'mouseup';

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var example1 = function example1() {
  var springSystem = new rebound.SpringSystem();
  var spring = createSpring(springSystem, 40, 3);
  var springConfig = spring.getSpringConfig();
  var photo = document.getElementById('example-photo');
  spring.addListener({
    onSpringUpdate: function onSpringUpdate(_spring) {
      scale(photo, mapValueFromRangeToRange(_spring.getCurrentValue(), 0, -1, 1, 0.5));
    }
  });

  var canvas = document.getElementById('graph-canvas');
  var ctx = canvas.getContext('2d');
  var graphScale = 80;

  var time = 0;

  var GraphingSpringSystemListener = function () {
    function GraphingSpringSystemListener() {
      classCallCheck(this, GraphingSpringSystemListener);

      this.height = canvas.height;
      this.width = canvas.width;
      this.lastTime = 0;
    }

    GraphingSpringSystemListener.prototype.onBeforeIntegrate = function onBeforeIntegrate() {};

    GraphingSpringSystemListener.prototype.onAfterIntegrate = function onAfterIntegrate() {
      time += 3;
      this.graphSpring(spring, 'black');

      if (time >= 600) {
        ctx.moveTo(0, canvas.height / 2);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawGridLines(canvas, ctx, graphScale);
        time = 0;
        graphingSpringSystemListener.lastTime = time;
      }
      this.lastTime = time;
    };

    GraphingSpringSystemListener.prototype.graphSpring = function graphSpring(_spring, color) {
      var x = time;
      var y = _spring.getCurrentValue() * graphScale + this.height / 2;
      if (this.lastX > x) {
        this.lastX = 1;
      }
      ctx.beginPath();
      ctx.moveTo(this.lastTime, _spring.lastY || this.height / 2);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.closePath();
      _spring.lastY = y;
    };

    return GraphingSpringSystemListener;
  }();

  var graphingSpringSystemListener = new GraphingSpringSystemListener();
  drawGridLines(canvas, ctx, graphScale);
  springSystem.addListener(graphingSpringSystemListener);

  photo.addEventListener(downEvt, function () {
    spring.setEndValue(-1);
  });

  document.body.addEventListener(upEvt, function () {
    spring.setEndValue(0);
  });

  var frictionControl = document.getElementById('friction');
  var frictionValue = document.getElementById('friction_value');
  var tensionControl = document.getElementById('tension');
  var tensionValue = document.getElementById('tension_value');

  var onFrictionChange = function onFrictionChange() {
    springConfig.friction = rebound.OrigamiValueConverter.frictionFromOrigamiValue(frictionControl.value);
    frictionValue.innerHTML = frictionControl.value;
  };

  var onTensionChange = function onTensionChange() {
    springConfig.tension = rebound.OrigamiValueConverter.tensionFromOrigamiValue(tensionControl.value);
    tensionValue.innerHTML = tensionControl.value;
  };

  frictionControl.addEventListener('change', onFrictionChange);
  frictionControl.addEventListener('input', onFrictionChange);

  tensionControl.addEventListener('change', onTensionChange);
  tensionControl.addEventListener('input', onTensionChange);
};

document.addEventListener('DOMContentLoaded', example1);

}(rebound));
