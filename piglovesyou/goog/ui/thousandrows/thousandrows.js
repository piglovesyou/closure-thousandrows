/**
 * @license
 * Copyright (c) 2012 Soichi Takamura (http://stakam.net/)
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 */

goog.provide('goog.ui.ThousandRows');

goog.require('goog.ui.thousandrows.VirtualScroller');
goog.require('goog.ui.thousandrows.Page');
goog.require('goog.ui.thousandrows.Row');
goog.require('goog.ui.thousandrows.Model');

goog.require('goog.iter');
goog.require('goog.math.Range');
goog.require('goog.Uri');



/**
 * @param {goog.ui.thousandrows.Model} model
 * @param {number} rowHeight
 * @param {number} rowCountInPage
 * @param {goog.dom.DomHelper=} opt_domHelper
 * @constructor
 * @extends {goog.ui.thousandrows.VirtualScroller}
 */
goog.ui.ThousandRows = function (model, rowHeight, rowCountInPage, opt_domHelper) {
  goog.base(this, goog.ui.Scroller.ORIENTATION.VERTICAL, opt_domHelper);

  this.rowHeight_      = rowHeight;
  this.rowCountInPage_ = rowCountInPage;

  this.setModel(/** @type {!goog.ui.thousandrows.Model} */model);

  this.updateTotal_();
};
goog.inherits(goog.ui.ThousandRows, goog.ui.thousandrows.VirtualScroller);


/**
 * @type {string}
 */
goog.ui.ThousandRows.prototype.baseName = 'thousandrows';


/**
 * @type {string}
 */
goog.ui.ThousandRows.prototype.baseCssName = 'goog-' + goog.ui.ThousandRows.prototype.baseName;


goog.ui.ThousandRows.prototype.updateTotal_ = function () {
  this.setVirtualScrollHeight(this.rowHeight_ * this.getModel().getTotal());
};


/** @inheritDoc */
goog.ui.ThousandRows.prototype.decorateInternal = function (element) {
  goog.dom.classes.add(element, this.baseCssName);
  goog.base(this, 'decorateInternal', element);
};


/** @inheritDoc */
goog.ui.ThousandRows.prototype.enterDocument = function () {
  goog.base(this, 'enterDocument');
  this.adjustScrollTop(goog.ui.Scroller.ORIENTATION.VERTICAL);
};


/** @inheritDoc */
goog.ui.ThousandRows.prototype.adjustScrollTop = function (orient) {
  this.renderPages_();
  this.getContentElement().scrollTop = this.getMargin_();
};


goog.ui.ThousandRows.prototype.renderPages_ = function () {
  var range = this.getExistingPageRange_();
  goog.array.forEach(this.getChildIds(), function (id) {
    if (!goog.math.Range.containsPoint(range, +id)) {
       this.removeChild(id, true);
    }
  }, this);
  goog.iter.forEach(goog.iter.range(range.start, range.end + 1), function (i) {
    this.createPage_(i);
  }, this);
};


/**
 * @param {number} pageIndex
 * @return {goog.ui.thousandrows.Page}
 */
goog.ui.ThousandRows.prototype.createPage_ = function (pageIndex) {
  var page = /** @type {?goog.ui.thousandrows.Page} */(this.getChild('' + pageIndex));
  if (!page) {
    page = new goog.ui.thousandrows.Page(pageIndex,
        this.rowCountInPage_, this.rowHeight_, this.getDomHelper());

    // insert right position in DOM.
    var inserted = !!(goog.array.find(this.getChildIds(), function (id, index) {
      if (+id > pageIndex) {
        this.addChildAt(page, index, true);
        return true;
      }
      return false;
    }, this));
    if (!inserted) this.addChild(page, true);
  }
  return page;
};


/**
 * @return {goog.math.Range}
 */
goog.ui.ThousandRows.prototype.getExistingPageRange_ = function () {
  var pageIndex = this.getPageIndex_();
  return new goog.math.Range(
      Math.max(0, pageIndex - 1),
      Math.min(this.getMaxPageIndex_(), pageIndex + 1));
};


/**
 * @return {number}
 */
goog.ui.ThousandRows.prototype.getPageIndex_ = function () {
  return Math.floor(this.getVirtualScrollTop() / this.getPageHeight_());
};


/**
 * @return {number}
 */
goog.ui.ThousandRows.prototype.getMargin_ = function () {
  var margin = this.getVirtualScrollTop() % this.getPageHeight_();
  if (this.getPageIndex_() >= 1) {
    margin += this.getPageHeight_();
  }
  return margin;
};


/**
 * @return {number}
 */
goog.ui.ThousandRows.prototype.getPageHeight_ = function () {
  return this.rowHeight_ * this.rowCountInPage_;
};


/**
 * @return {number}
 */
goog.ui.ThousandRows.prototype.getMaxPageIndex_ = function () {
  return Math.ceil(this.getModel().getTotal() / this.rowCountInPage_) - 1;
};

