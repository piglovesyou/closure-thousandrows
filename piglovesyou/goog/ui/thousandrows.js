
goog.provide('goog.ui.ThousandRows');

goog.require('goog.ui.VirtualScroller');
goog.require('goog.iter');
goog.require('goog.math.Range');
goog.require('goog.Timer');
goog.require('goog.asserts');


var dummyDataSource = new goog.ds.JsDataSource({}, 'dummy');
goog.ds.DataManager.getInstance().addDataSource(dummyDataSource);

for (var i=0;i<30;i++) {
  dummyDataSource.setChildNode('row_' + i, { title: 'title'+i, body: 'body....' });
}


/**
 * @param {number} rowHeight
 * @param {number} rowCountInPage
 * @param {number} totalRowCount
 * @param {goog.ds.DataNode} dataSource
 * @param {goog.dom.DomHelper=} opt_domHelper
 * @constructor
 * @extends {goog.ui.VirtualScroller}
 */
goog.ui.ThousandRows = function (rowHeight, rowCountInPage, totalRowCount, dataSource, opt_domHelper) {
  goog.base(this, goog.ui.Scroller.ORIENTATION.VERTICAL, opt_domHelper);

  this.rowHeight_      = rowHeight;
  this.rowCountInPage_ = rowCountInPage;
  this.totalRowCount_  = totalRowCount;
  this.setVirtualScrollHeight(rowHeight * totalRowCount);

  this.setModel(dataSource || dummyDataSource);

  goog.asserts.assert(this.getModel());
};
goog.inherits(goog.ui.ThousandRows, goog.ui.VirtualScroller);


/**
 * @type {string}
 */
goog.ui.ThousandRows.prototype.rowDataNamePrefix_ = 'row_';


/**
 * @param {string}
 */
goog.ui.ThousandRows.prototype.setRowDataNamePrefix_ = function (prefix) {
  this.rowDataNamePrefix_ = prefix;
};


/**
 * Row needs this method.
 * @param {number} index
 * @return {Object} 
 */
goog.ui.ThousandRows.prototype.getRecordAtRowIndex = function (index) {
  return this.getModel().getChildNode(this.rowDataNamePrefix_ + index);
};


/**
 * @type {string}
 */
goog.ui.ThousandRows.baseName = 'thousandrows';


/**
 * @type {string}
 */
goog.ui.ThousandRows.baseCssName = 'goog-' + goog.ui.ThousandRows.baseName;


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
 * @param {string} pageIndex
 * @param {number} rowCount
 * @param {number} rowHeight
 * @param {goog.dom.DomHelper} opt_domHelper
 * @constructor
 * @extends {goog.ui.Component}
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
 * @param {string|number} rowIndex
 * @param {number} height
 * @param {goog.dom.DomHelper} opt_domHelper
 * @constructor
 * @extends {goog.ui.Component}
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
 * @type {string}
 */
goog.ui.ThousandRows.Row.baseCssName = goog.getCssName(goog.ui.ThousandRows.baseCssName, 'row');


/**
 * @enum {string}
 */
goog.ui.ThousandRows.Row.CssPostFixes = {
  NOT_RENDERED: 'notrendered'
};


/**
 * @param {Object}
 */
goog.ui.ThousandRows.Row.prototype.renderRecord_ = function () {
  if (!this.isInDocument()) return;

  var elm = this.getElement();
  var record = this.getRecord_();
  if (record) {
    var dh = this.getDomHelper();
    goog.dom.removeChildren(elm);
    dh.append(elm,
        dh.createDom('div', 'row-col row-id', record.getDataName()),
        dh.createDom('div', 'row-col row-title', record.getChildNodeValue('title')),
        dh.createDom('div', 'row-col row-description', record.getChildNodeValue('body')));
    goog.dom.classes.remove(elm,
        goog.getCssName(goog.ui.ThousandRows.Row.baseCssName,
          goog.ui.ThousandRows.Row.CssPostFixes.NOT_RENDERED));
  } else {
    goog.dom.classes.add(elm, goog.getCssName(goog.ui.ThousandRows.Row.baseCssName,
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
  var elm = this.getDomHelper().createDom('div', {
    className: goog.ui.ThousandRows.Row.baseCssName
    // style: 'height: ' + this.height_ + 'px'
  });
  this.setElementInternal(elm);
};

goog.ui.ThousandRows.Row.prototype.getRecord_ = function () {
  return this.getDelegate_() && this.getDelegate_().getRecordAtRowIndex(this.getId());
};

/**
 * @return {!goog.ui.ThousandRows}
 */
goog.ui.ThousandRows.Row.prototype.getDelegate_ = function () {
  return this.getParent() && this.getParent().getParent();
};
