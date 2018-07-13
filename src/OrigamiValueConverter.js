/**
 *  Copyright (c) 2013, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 */

// Math for converting from
// [Origami](http://facebook.github.io/origami/) to
// [Rebound](http://facebook.github.io/rebound).
// You mostly don't need to worry about this, just use
// SpringConfig.fromOrigamiTensionAndFriction(v, v);

export function tensionFromOrigamiValue(oValue: number): number {
  return oValue * 3.62 + 85.39999999999999;
}

export function origamiValueFromTension(tension: number): number {
  return tension / 3.62 - 23.591160220994475;
}

export function frictionFromOrigamiValue(oValue: number): number {
  return oValue * 3.0 + 1.0;
}

export function origamiFromFriction(friction: number): number {
  return friction / 3.0 - 0.333333333333334;
}
