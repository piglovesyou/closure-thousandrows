/**
 * @license
 * Copyright (c) 2012 Soichi Takamura (http://stakam.net/)
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 */

goog.provide('goog.ui.thousandrows.VirtualScroller');

goog.require('goog.ui.Scroller');


/**
 * @constructor
 * @param {?goog.ui.Scroller.ORIENTATION=} 
 */
goog.ui.VirtualScroller = function (opt_orient, opt_domHelper) {
  goog.base(this, opt_orient, opt_domHelper);
};
goog.inherits(goog.ui.VirtualScroller, goog.ui.Scroller);


/**
 * @type {Number}
 */
goog.ui.VirtualScroller.prototype.virtualScrollHeight_ = -1;


/**
 * Call this before `decorate' or `update'.
 */
goog.ui.VirtualScroller.prototype.setVirtualScrollHeight = function (scrollHeight) {
  this.virtualScrollHeight_ = scrollHeight;
  return this;
};


goog.ui.VirtualScroller.prototype.getVirtualScrollTop = function () {
  return Math.round(this.getScrollableRange() * this.getSlider().getRate());
};


/**
 * Provide virtual scroll height, not actual one.
 * @override
 */
goog.ui.VirtualScroller.prototype.getScrollHeight = function () {
  return this.virtualScrollHeight_ >= 0 ? this.virtualScrollHeight_ : this.containerElm_.scrollHeight;
};
