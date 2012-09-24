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
 * @param {number} rowHeight
 * @param {number} rowCountInPage
 * @param {goog.dom.DomHelper=} opt_domHelper
 * @constructor
 * @extends {goog.ui.thousandrows.VirtualScroller}
 */
goog.ui.ThousandRows = function (rowHeight, rowCountInPage, opt_domHelper) {
  goog.base(this, goog.ui.Scroller.ORIENTATION.VERTICAL, opt_domHelper);

  this.rowHeight_      = rowHeight;
  this.rowCountInPage_ = rowCountInPage;

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


/** @inheritDoc */
goog.ui.ThousandRows.prototype.setModel = function (model) {
  var old = this.getModel();
  if (old && this.hasModel()) {
    goog.events.removeAll(old);
    // We dont old.dispose() here because it can be used again.
 
    var removed = this.removeChildren(true);
    if (removed) {
      goog.array.forEach(removed, function (child) {
        child.dispose();
      });
    }
  }
  goog.base(this, 'setModel', model);
  if (this.isInDocument()) {
    this.observeModel_()
  }
};


/**
 * @return {?goog.ui.thousandrows.Model}
 * @override
 */
goog.ui.ThousandRows.prototype.getModel = function () {
  return /** @type {?goog.ui.thousandrows.Model} */(goog.base(this, 'getModel'));
};


/**
 * Call this before `decorate' or `update'.
 */
goog.ui.ThousandRows.prototype.updateTotal_ = function () {
  this.setVirtualScrollHeight(this.rowHeight_ * this.getModel().getTotal());
  // We cannot update() here in case its before decorate.
};


goog.ui.ThousandRows.prototype.updateTimer_ = new goog.Timer(200);

goog.ui.ThousandRows.prototype.handleUpdateTotal_ = function (e) {
  this.updateTotal_();
  // TODO: Scroll daragger flicks. Fix it.

  var timer = this.updateTimer_;
  if (!timer.enabled) {
    timer.start();
  } else {
    timer.stop();
    timer.start();
  }
};


goog.ui.ThousandRows.prototype.handleUpdateTimerTick_ = function (e) {
  this.updateTimer_.stop();
  this.update();
};


goog.ui.ThousandRows.prototype.handleUpdatePage_ = function (e) {
  var ds = e.ds;
  var page = this.getChild('' + ds.index);
  if (page && page.isInDocument()) {
    page.renderRowsContent(ds.rowsData);
  }
};


/** @inheritDoc */
goog.ui.ThousandRows.prototype.createDom = function () {
  goog.base(this, 'createDom');
  goog.dom.classes.add(this.getElement(), this.baseCssName);
};


/** @inheritDoc */
goog.ui.ThousandRows.prototype.decorateInternal = function (element) {
  goog.base(this, 'decorateInternal', element);
  goog.dom.classes.add(element, this.baseCssName);
};


/** @inheritDoc */
goog.ui.ThousandRows.prototype.canDecorate = function (element) {
  return goog.base(this, 'canDecorate', element);
};


/** @inheritDoc */
goog.ui.ThousandRows.prototype.enterDocument = function () {
  goog.base(this, 'enterDocument');
  this.getHandler().listen(this.updateTimer_, goog.Timer.TICK, this.handleUpdateTimerTick_);
  if (this.hasModel()) {
    this.observeModel_();
  }
};


goog.ui.ThousandRows.prototype.observeModel_ = function () {
  var model = this.getModel();
  this.getHandler()
    .listen(model, goog.ui.thousandrows.Model.EventType.UPDATE_TOTAL, this.handleUpdateTotal_)
    .listen(model, goog.ui.thousandrows.Model.EventType.UPDATE_PAGE, this.handleUpdatePage_);
  this.updateTotal_();
  this.adjustScrollTop(goog.ui.Scroller.ORIENTATION.VERTICAL);
};


/**
 * @return {boolean}
 */
goog.ui.ThousandRows.prototype.hasModel = function () {
  return this.getModel() instanceof goog.ui.thousandrows.Model;
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
      var page = this.getChild(id);
      this.removeChild(page, true);
      page.dispose();
    }
  }, this);
  goog.iter.forEach(goog.iter.range(range.start, range.end + 1), function (i) {
    this.createPage(i);
  }, this);
};


/**
 * @param {number} pageIndex
 * @return {goog.ui.thousandrows.Page}
 */
goog.ui.ThousandRows.prototype.createPage = function (pageIndex) {
  var page = /** @type {?goog.ui.thousandrows.Page} */(this.getChild('' + pageIndex));
  if (!page) {
    page = this.createPage_(pageIndex);

    // insert right position in DOM.
    var inserted = !!(goog.array.find(this.getChildIds(), function (id, index) {
      if (+id > pageIndex) {
        this.addChildAt(page, index, true);
        return true;
      }
      return false;
    }, this));
    if (!inserted) this.addChild(page, true);
    this.getModel().getRecordAtPageIndex(pageIndex, this.rowCountInPage_);
  }
  return page;
};


/**
 * @return {goog.ui.thousandrows.Page}
 * @protected
 */
goog.ui.ThousandRows.prototype.createPage_ = function (pageIndex) {
  return new goog.ui.thousandrows.Page(pageIndex,
        this.rowCountInPage_, this.rowHeight_, this.getDomHelper());
};


/**
 * @return {goog.math.Range}
 */
goog.ui.ThousandRows.prototype.getExistingPageRange_ = function () {
  var pageIndex = this.getPageIndex_();
  return new goog.math.Range(
      Math.max(0, pageIndex - 1),
      goog.math.clamp(this.getMaxPageIndex_(), 0, pageIndex + 1));
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

