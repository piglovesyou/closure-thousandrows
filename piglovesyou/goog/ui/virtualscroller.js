
goog.provide('goog.ui.VirtualScroller');

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
