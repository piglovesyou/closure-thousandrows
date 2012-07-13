
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
 * @return {boolean}
 */
goog.ui.ThousandRows.prototype.hasRecord = function (rowIndex) {
  // TODO: If has cache, true. Otherwise, false.
  return true;
};


/**
 * Row needs this method.
 * @return {Object} 
 */
goog.ui.ThousandRows.prototype.getRecord = function (rowIndex) {
  // TODO: Here is dummy data.
  return {
    id: rowIndex,
    title: '===title' + rowIndex + '==='
  };
};


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
        this.rowCountInPage_, this.rowHeight_, this.getDomHelper());

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
  return Math.ceil(this.totalRowCount_ / this.rowCountInPage_) - 1;
};










/**
 * @constructor
 * @param {string} pageIndex
 */
goog.ui.ThousandRows.Page = function (pageIndex, rowCount, rowHeight, opt_domHelper) {
  goog.base(this, opt_domHelper);
  this.setId('' + pageIndex);
  this.rowCount_ = rowCount;

  var dh = this.getDomHelper();
  var rowOffset = pageIndex * rowCount;
  goog.iter.forEach(goog.iter.range(rowCount), function (i) {
    var row = new goog.ui.ThousandRows.Row(rowOffset + i, rowHeight, dh);
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


goog.ui.ThousandRows.Row.baseCssName = goog.getCssName(goog.ui.ThousandRows.baseCssName, 'row');


goog.ui.ThousandRows.Row.CssPostFixes = {
  NOT_RENDERED: 'notrendered'
};


/**
 * @param {Object}
 */
goog.ui.ThousandRows.Row.prototype.renderRecord_ = function () {
  if (this.isInDocument() && this.hasRecord_()) {
    var dh = this.getDomHelper();
    var record = this.getRecord_();
    var elm = this.getElement();

    goog.dom.removeChildren(elm);
    dh.append(elm,
        dh.createDom('div', 'row-col row-id', record.id),
        dh.createDom('div', 'row-col row-title', record.title));
    goog.dom.classes.remove(elm,
        goog.getCssName(goog.ui.ThousandRows.Row.baseCssName,
          goog.ui.ThousandRows.Row.CssPostFixes.NOT_RENDERED));
  }
};


/** @inheritDoc */
goog.ui.ThousandRows.Row.prototype.enterDocument = function () {
  goog.base(this, 'enterDocument');
  this.renderRecord_();
};

/** @inheritDoc */
goog.ui.ThousandRows.Row.prototype.createDom = function () {
  var className = goog.ui.ThousandRows.Row.baseCssName;
  if (!this.hasRecord_()) {
    className += ' ' + goog.getCssName(goog.ui.ThousandRows.Row.baseCssName,
        goog.ui.ThousandRows.Row.CssPostFixes.NOT_RENDERED);
  }
  var elm = this.getDomHelper().createDom('div', {
    className: className
    // style: 'height: ' + this.height_ + 'px'
  });
  this.setElementInternal(elm);
};

goog.ui.ThousandRows.Row.prototype.getRecord_ = function () {
  return this.getDelegate_() && this.getDelegate_().getRecord(this.getId());
};

goog.ui.ThousandRows.Row.prototype.hasRecord_ = function () {
  return this.getDelegate_() && this.getDelegate_().hasRecord(this.getId());
};

/**
 * @return {!goog.ui.ThousandRows}
 */
goog.ui.ThousandRows.Row.prototype.getDelegate_ = function () {
  return this.getParent() && this.getParent().getParent();
};
