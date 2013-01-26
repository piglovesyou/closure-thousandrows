/**
 * @license
 * Copyright (c) 2012 Soichi Takamura (http://stakam.net/).
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 */

goog.provide('goog.ui.ThousandRows');

goog.require('goog.Uri');
goog.require('goog.iter');
goog.require('goog.math.Range');
goog.require('goog.ui.thousandrows.Model');
goog.require('goog.ui.thousandrows.Page');
goog.require('goog.ui.thousandrows.Row');
goog.require('goog.ui.thousandrows.VirtualScroller');



/**
 * @param {number} rowHeight DOM height of row, by which ThousandRows
 *                           calcurates virtual scroll height.
 * @param {number} rowCountInPage .
 * @param {?goog.ui.Scroller.ORIENTATION=} opt_orient Only
 *    VERTICAL or BOTH are available.
 * @param {goog.dom.DomHelper=} opt_domHelper .
 * @constructor
 * @extends {goog.ui.thousandrows.VirtualScroller}
 */
goog.ui.ThousandRows = function(rowHeight,
                                rowCountInPage, opt_orient, opt_domHelper) {
  goog.asserts.assert(opt_orient != goog.ui.Scroller.ORIENTATION.HORIZONTAL,
                      'Only VERTICAL or BOTH are available.');
  goog.base(this, opt_orient || goog.ui.Scroller.ORIENTATION.VERTICAL,
            opt_domHelper);

  /**
   * @type {number}
   * @private
   */
  this.rowHeight_ = rowHeight;

  /**
   * @type {number}
   * @private
   */
  this.rowCountInPage_ = rowCountInPage;


  /**
   * @type {goog.Timer}
   * @private
   */
  this.updateTimer_ = new goog.Timer(200);

};
goog.inherits(goog.ui.ThousandRows, goog.ui.thousandrows.VirtualScroller);


/**
 * @enum {string}
 */
goog.ui.ThousandRows.EventType = {
  UPDATE_PAGE: 'updatepage',
  UPDATE_TOTAL: 'updatetotal'
};


/**
 * @type {string}
 */
goog.ui.ThousandRows.prototype.baseName = 'thousandrows';


/**
 * @type {string}
 */
goog.ui.ThousandRows.prototype.baseCssName = 'goog-' +
    goog.ui.ThousandRows.prototype.baseName;


/**
 * @override
 * @param {string} id .
 * @return {?goog.ui.thousandrows.Page} .
 */
goog.ui.ThousandRows.prototype.getChild;


/**
 * @override
 * @param {number} index .
 * @return {?goog.ui.thousandrows.Page} .
 */
goog.ui.ThousandRows.prototype.getChildAt;


/**
 * When we re-set model and data structure gets different,
 *   we may want to change this.rowHeight_.
 * @param {number} height .
 */
goog.ui.ThousandRows.prototype.setRowHeight = function(height) {
  this.rowHeight_ = height;
};


/**
 * Also, we may want to change this.rowCountInPage_.
 * @param {number} count .
 */
goog.ui.ThousandRows.prototype.setRowCountInPane = function(count) {
  this.rowCountInPage_ = count;
};


/** @inheritDoc */
goog.ui.ThousandRows.prototype.setModel = function(model) {
  var old = this.getModel();
  if (old && this.hasModel()) {
    goog.events.removeAll(old);
    // We dont old.dispose() here because it can be used again.

    var removed = this.removeChildren(true);
    if (removed) {
      goog.array.forEach(removed, function(child) {
        child.dispose();
      });
    }
  }
  goog.base(this, 'setModel', model);
  if (this.isInDocument()) {
    this.observeModel_();
  }
};


/**
 * @return {?goog.ui.thousandrows.Model} .
 * @inheritDoc
 */
goog.ui.ThousandRows.prototype.getModel = function() {
  return /** @type {?goog.ui.thousandrows.Model} */(
      goog.base(this, 'getModel'));
};


/**
 * Call this before `decorate' or `update'.
 * @private
 */
goog.ui.ThousandRows.prototype.updateTotal_ = function() {
  this.setVirtualScrollHeight(this.rowHeight_ * this.getModel().getTotal());
  // We cannot update() here in case its before decorate.
};


/**
 * @param {goog.events.Event} e .
 * @private
 */
goog.ui.ThousandRows.prototype.handleUpdateTotal_ = function(e) {
  this.updateTotal_();
  // TODO: Scroll daragger flicks. Fix it.

  var timer = this.updateTimer_;
  if (!timer.enabled) {
    timer.start();
  } else {
    timer.stop();
    timer.start();
  }
  this.dispatchEvent({
    type: goog.ui.ThousandRows.EventType.UPDATE_TOTAL,
    total: this.getModel().getTotal()
  });
};


/**
 * @param {goog.events.Event} e .
 * @private
 */
goog.ui.ThousandRows.prototype.handleUpdateTimerTick_ = function(e) {
  this.updateTimer_.stop();
  this.update();
};


/**
 * @param {goog.events.Event} e .
 * @private
 */
goog.ui.ThousandRows.prototype.handleUpdatePage_ = function(e) {
  var ds = e.ds;
  var page = this.getChild('' + ds.index);
  if (page && page.isInDocument()) {
    page.renderRowsContent(ds.rowsData);
  }
  this.dispatchEvent(goog.ui.ThousandRows.EventType.UPDATE_PAGE);
};


/** @inheritDoc */
goog.ui.ThousandRows.prototype.createDom = function() {
  goog.base(this, 'createDom');
  goog.dom.classes.add(this.getElement(), this.baseCssName);
};


/** @inheritDoc */
goog.ui.ThousandRows.prototype.decorateInternal = function(element) {
  goog.base(this, 'decorateInternal', element);
  goog.dom.classes.add(element, this.baseCssName);
};


/** @inheritDoc */
goog.ui.ThousandRows.prototype.canDecorate = function(element) {
  return goog.base(this, 'canDecorate', element);
};


/** @inheritDoc */
goog.ui.ThousandRows.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');
  this.getHandler().listen(this.updateTimer_,
                           goog.Timer.TICK, this.handleUpdateTimerTick_);
  if (this.hasModel()) {
    // TODO: Shoud I call it before `enterDocument' of superClass?
    this.observeModel_();
  }
};


/**
 * TODO: Write doc.
 * @private
 */
goog.ui.ThousandRows.prototype.observeModel_ = function() {
  var model = this.getModel();
  this.getHandler()
    .listen(model, goog.ui.thousandrows.Model.EventType.UPDATE_TOTAL,
            this.handleUpdateTotal_)
    .listen(model, goog.ui.thousandrows.Model.EventType.UPDATE_PAGE,
            this.handleUpdatePage_);
  this.updateTotal_();
  this.adjustScrollTop(goog.ui.Scroller.ORIENTATION.VERTICAL);
};


/**
 * @return {boolean} .
 */
goog.ui.ThousandRows.prototype.hasModel = function() {
  return this.getModel() instanceof goog.ui.thousandrows.Model;
};


/** @inheritDoc */
goog.ui.ThousandRows.prototype.adjustScrollTop = function(orient) {
  if (orient & goog.ui.Scroller.ORIENTATION.VERTICAL) {
    this.renderPages_();
    this.getContentElement().scrollTop = this.getMargin_();
  } else {
    goog.base(this, 'adjustScrollTop', orient);
  }
};


/**
 * @private
 */
goog.ui.ThousandRows.prototype.renderPages_ = function() {
  var range = this.getExistingPageRange_();
  goog.array.forEach(this.getChildIds(), function(id) {
    if (!goog.math.Range.containsPoint(range, +id)) {
      var page = this.getChild(id);
      this.removeChild(page, true);
      page.dispose();
    }
  }, this);
  goog.iter.forEach(goog.iter.range(range.start, range.end + 1), function(i) {
    this.createPage(i);
  }, this);
};


/**
 * @param {number} pageIndex .
 * @return {goog.ui.thousandrows.Page} .
 */
goog.ui.ThousandRows.prototype.createPage = function(pageIndex) {
  var page = /** @type {?goog.ui.thousandrows.Page} */(
        this.getChild('' + pageIndex));
  if (!page) {
    page = this.createPage_(pageIndex);

    // insert right position in DOM.
    var inserted = !!(goog.array.find(this.getChildIds(), function(id, index) {
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
 * @param {number} pageIndex .
 * @return {goog.ui.thousandrows.Page} .
 * @protected
 * @suppress {underscore}
 */
goog.ui.ThousandRows.prototype.createPage_ = function(pageIndex) {
  return new goog.ui.thousandrows.Page(pageIndex,
        this.rowCountInPage_, this.rowHeight_, this.getDomHelper());
};


/**
 * @return {goog.math.Range} .
 * @private
 */
goog.ui.ThousandRows.prototype.getExistingPageRange_ = function() {
  var pageIndex = this.getPageIndex_();
  return new goog.math.Range(
      Math.max(0, pageIndex - 1),
      goog.math.clamp(this.getMaxPageIndex_(), 0, pageIndex + 1));
};


/**
 * @return {number} .
 * @private
 */
goog.ui.ThousandRows.prototype.getPageIndex_ = function() {
  return Math.floor(this.getVirtualScrollTop() / this.getPageHeight_());
};


/**
 * @return {number} .
 * @private
 */
goog.ui.ThousandRows.prototype.getMargin_ = function() {
  var margin = this.getVirtualScrollTop() % this.getPageHeight_();
  if (this.getPageIndex_() >= 1) {
    margin += this.getPageHeight_();
  }
  return margin;
};


/**
 * @return {number} .
 * @private
 */
goog.ui.ThousandRows.prototype.getPageHeight_ = function() {
  return this.rowHeight_ * this.rowCountInPage_;
};


/**
 * @return {number} .
 * @private
 */
goog.ui.ThousandRows.prototype.getMaxPageIndex_ = function() {
  return Math.ceil(this.getModel().getTotal() / this.rowCountInPage_) - 1;
};

