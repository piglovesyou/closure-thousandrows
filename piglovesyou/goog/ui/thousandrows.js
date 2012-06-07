
goog.provide('goog.ui.ThousandRows');

goog.require('goog.ui.VirtualScroller');


/**
 * @constructor
 */
goog.ui.ThousandRows = function (opt_domHelper) {
  goog.base(this, goog.ui.Scroller.ORIENTATION, opt_domHelper);
};
goog.inherits(goog.ui.ThousandRows, goog.ui.VirtualScroller);
