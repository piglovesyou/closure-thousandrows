
goog.provide('goog.ui.ThousandRows');

goog.require('goog.ui.VirtualScroller');
goog.require('goog.iter');
goog.require('goog.Timer');

var dummy = {};
dummy.i_ = 0;
dummy.provideRowsData = function (fn) {
  setTimeout(function () {
    fn({
      meta: { total: 120 },
      records: [
        { id_: 'id:' + dummy.i_, title: 'title' + dummy.i_++ },
        { id_: 'id:' + dummy.i_, title: 'title' + dummy.i_++ },
        { id_: 'id:' + dummy.i_, title: 'title' + dummy.i_++ },
        { id_: 'id:' + dummy.i_, title: 'title' + dummy.i_++ },
        { id_: 'id:' + dummy.i_, title: 'title' + dummy.i_++ },
        { id_: 'id:' + dummy.i_, title: 'title' + dummy.i_++ },
        { id_: 'id:' + dummy.i_, title: 'title' + dummy.i_++ },
        { id_: 'id:' + dummy.i_, title: 'title' + dummy.i_++ },
        { id_: 'id:' + dummy.i_, title: 'title' + dummy.i_++ },
        { id_: 'id:' + dummy.i_, title: 'title' + dummy.i_++ }
      ]
    });
  }, 500);
};





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


goog.ui.ThousandRows.prototype.enterDocument = function () {
  goog.base(this, 'enterDocument');
  this.adjustScrollTop();
};


/** @inheritDoc */
goog.ui.ThousandRows.prototype.adjustScrollTop = function (orient) {

  var pageIndex = Math.floor(this.getVirtualScrollTop() / this.getPageHeight_());
  var actualTopMargin = this.getVirtualScrollTop() % this.getPageHeight_();

  var page = this.getPage_(pageIndex);

  this.getContentElement().scrollTop = actualTopMargin;
};


goog.ui.ThousandRows.prototype.getPage_ = function (pageIndex) {
  var page;
  this.forEachChild(function (child) {
    if (pageIndex == child.getId()) {
      page = child;
    } else {
      this.removeChild(child, true);
    }
  }, this);
  if (!page) {
    page = new goog.ui.ThousandRows.Page(pageIndex.toString(),
        this.rowCountInPage_, this.rowHeight_);
    this.addChild(page, true);
  }
  return page;
};


goog.ui.ThousandRows.prototype.getPageHeight_ = function () {
  return this.rowHeight_ * this.rowCountInPage_;
};

/**
 * @return {goog.math.Range}
 */
goog.ui.ThousandRows.prototype.getPageRange_ = function () {
  // this.
};

goog.ui.ThousandRows.prototype.parseRecords = function (records) {
  goog.array.forEach(records, function (record) {
    
  });
};









/**
 * @constructor
 */
goog.ui.ThousandRows.Page = function (pageIndex, rowCount, rowHeight, opt_domHelper) {
  goog.base(this, opt_domHelper);
  this.setId(pageIndex);
  this.rowCount_ = rowCount;

  goog.iter.forEach(goog.iter.range(rowCount), function () {
    var row = new goog.ui.ThousandRows.Row(rowHeight);
    this.addChild(row, true);
  }, this);
};
goog.inherits(goog.ui.ThousandRows.Page, goog.ui.Component);

goog.ui.ThousandRows.Page.prototype.createDom = function () {
  var elm = this.getDomHelper().createDom('div', '--page--');
  this.setElementInternal(elm);
};






/**
 * @constructor
 */
goog.ui.ThousandRows.Row = function (height, opt_domHelper) {
  goog.base(this, opt_domHelper);
  this.height_ = height;
};
goog.inherits(goog.ui.ThousandRows.Row, goog.ui.Component);


goog.ui.ThousandRows.Row.prototype.createDom = function () {
  var elm = this.getDomHelper().createDom('div', {
    style: 'height: ' + this.height_ + 'px'
  }, 'aaa' + this.getParent().getId() + '----' + this.getId());
  this.setElementInternal(elm);
};
