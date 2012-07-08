
goog.provide('goog.ui.ThousandRows');

goog.require('goog.ui.VirtualScroller');
goog.require('goog.iter');
goog.require('goog.math.Range');
goog.require('goog.Timer');


var dummy = {};
dummy.provideRowsData = (function () {
  var counter = 0;
  return function () {
    return {
      meta: { total: 120 },
      records: [
        { id_: 'id:' + counter, title: 'title' + counter++ },
        { id_: 'id:' + counter, title: 'title' + counter++ },
        { id_: 'id:' + counter, title: 'title' + counter++ },
        { id_: 'id:' + counter, title: 'title' + counter++ },
        { id_: 'id:' + counter, title: 'title' + counter++ },
        { id_: 'id:' + counter, title: 'title' + counter++ },
        { id_: 'id:' + counter, title: 'title' + counter++ },
        { id_: 'id:' + counter, title: 'title' + counter++ },
        { id_: 'id:' + counter, title: 'title' + counter++ },
        { id_: 'id:' + counter, title: 'title' + counter++ }
      ]
    };
  };
})();





/**
 * @constructor
 */
goog.ui.ThousandRows = function (rowHeight, rowCountInPage, totalRowCount, opt_domHelper) {
  goog.base(this, goog.ui.Scroller.ORIENTATION.VERTICAL, opt_domHelper);

  this.rowHeight_      = rowHeight;
  this.rowCountInPage_ = rowCountInPage;
  this.totalRowCount_  = totalRowCount;

  this.setVirtualScrollHeight(rowHeight * totalRowCount);
};
goog.inherits(goog.ui.ThousandRows, goog.ui.VirtualScroller);


/**
 * @type {string}
 */
goog.ui.ThousandRows.baseCssName = 'goog-thousandrows';


/** @inheritDoc */
goog.ui.ThousandRows.prototype.decorateInternal = function (element) {
  goog.dom.classes.add(element, goog.ui.ThousandRows.baseCssName);
  goog.base(this, 'decorateInternal', element);
};


/** @inheritDoc */
goog.ui.ThousandRows.prototype.enterDocument = function () {
  goog.base(this, 'enterDocument');
  this.adjustScrollTop();
};



/** @inheritDoc */
goog.ui.ThousandRows.prototype.adjustScrollTop = function (orient) {

  this.renderPages_();

  this.getContentElement().scrollTop = this.getMargin_();
};


goog.ui.ThousandRows.prototype.renderPages_ = function () {
  var range = this.getPageRange_();
  goog.array.forEach(this.getChildIds(), function (id) {
    if (!goog.math.Range.containsPoint(range, +id)) {
       this.removeChild(id, true);
    }
  }, this);
  goog.iter.forEach(goog.iter.range(range.start, range.end + 1), function (i) {
    this.createPage_(i);
  }, this);

  console.log(this.getChildIds());
};


/**
 * @param {number} pageIndex
 * @return {goog.ui.ThousandRows.Page}
 */
goog.ui.ThousandRows.prototype.createPage_ = function (pageIndex) {
  var page = this.getChild('' + pageIndex);
  if (!page) {
    page = new goog.ui.ThousandRows.Page(pageIndex,
        this.rowCountInPage_, this.rowHeight_);

    // insert right position in DOM.
    var inserted = !!(goog.array.find(this.getChildIds(), function (id, index) {
      if (+id > pageIndex) {
        this.addChildAt(page, index, true);
        return true;
      }
    }, this));
    if (!inserted) this.addChild(page, true);
  }
  return page;
};


/**
 * @return {goog.math.Range}
 */
goog.ui.ThousandRows.prototype.getPageRange_ = function () {
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
  return Math.ceil(this.totalRowCount_ / this.rowCountInPage_);
};










/**
 * @constructor
 * @param {string} pageIndex
 */
goog.ui.ThousandRows.Page = function (pageIndex, rowCount, rowHeight, opt_domHelper) {
  goog.base(this, opt_domHelper);
  this.setId('' + pageIndex);
  this.rowCount_ = rowCount;

  var rowOffset = pageIndex * rowCount;
  goog.iter.forEach(goog.iter.range(rowCount), function (i) {
    var row = new goog.ui.ThousandRows.Row(rowOffset + i, rowHeight);
    this.addChild(row, true);
  }, this);
};
goog.inherits(goog.ui.ThousandRows.Page, goog.ui.Component);


/** @inheritDoc */
goog.ui.ThousandRows.Page.prototype.createDom = function () {
  var elm = this.getDomHelper().createDom('div',
      goog.getCssName(goog.ui.ThousandRows.baseCssName, 'page'));
  this.setElementInternal(elm);
};






/**
 * @constructor
 * @param {string|number} rowIndex
 */
goog.ui.ThousandRows.Row = function (rowIndex, height, opt_domHelper) {
  goog.base(this, opt_domHelper);

  this.setId('' + rowIndex);

  /**
   * @type {number}
   */
  this.height_ = height;
};
goog.inherits(goog.ui.ThousandRows.Row, goog.ui.Component);


/**
 * @return {!goog.ui.ThousandRows}
 */
goog.ui.ThousandRows.Row.prototype.getDelegate_ = function () {
  return this.getParnet().getParent();
};


/**
 * @param {Object}
 */
goog.ui.ThousandRows.Row.prototype.renderRecord = function (record) {
  if (this.isInDocument_()) {
    this.record_ = record;
    var elm = this.getElement();
    // TODO: Render with record. I will create Renderer class.
    goog.dom.classes.remove(elm, goog.getCssName(goog.ui.ThousandRows.baseCssName, 'row-notrendered'));
  }
};


/** @inheritDoc */
goog.ui.ThousandRows.Row.prototype.createDom = function () {
  var className = goog.getCssName(goog.ui.ThousandRows.baseCssName, 'row');
  if (!this.record_) className += ' ' + goog.getCssName(goog.ui.ThousandRows.baseCssName, 'row-notrendered');
  var elm = this.getDomHelper().createDom('div', {
    className: className,
    style: 'height: ' + this.height_ + 'px'
  });
  if (this.record_) this.renderRecord(this.record_);
  this.setElementInternal(elm);
};
