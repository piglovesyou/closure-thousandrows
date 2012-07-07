
goog.provide('goog.ui.ThousandRows');

goog.require('goog.ui.VirtualScroller');

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
goog.ui.ThousandRows = function (opt_domHelper) {
  goog.base(this, goog.ui.Scroller.ORIENTATION.VERTICAL, opt_domHelper);
};
goog.inherits(goog.ui.ThousandRows, goog.ui.VirtualScroller);

goog.ui.ThousandRows.prototype.enterDocument = function () {
  goog.base(this, 'enterDocument');
  // this.getHandler().listen(this.getSlider(), 
};


/**
 * @return {goog.math.Range}
 */
goog.ui.ThousandRows.prototype.getPageRange_ = function () {
  // return 
};

goog.ui.ThousandRows.prototype.parseRecords = function (records) {
  goog.array.forEach(records, function (record) {
    
  });
};







goog.ui.ThousandRows.prototype.rowHeight_ = 20;
goog.ui.ThousandRows.prototype.setRowHeight = function (height) {this.rowHeight_ = height;};

goog.ui.ThousandRows.prototype.rowCountInPage_ = 10;
goog.ui.ThousandRows.prototype.setRowCountInPage_ = function (count) {this.rowCountInPage_ = count;};

goog.ui.ThousandRows.prototype.totalRowCount_ = 100;
goog.ui.ThousandRows.prototype.setTotalRowCount = function (count) {this.totalRowCount_ = count;};


/**
 * @constructor
 */
goog.ui.ThousandRows.Page = function (records, opt_domHelper) {
  goog.base(this, opt_domHelper);
  this.records_ = records;
};
goog.inherits(goog.ui.ThousandRows.Page, goog.ui.Component);





/**
 * @constructor
 */
goog.ui.ThousandRows.Row = function (opt_domHelper) {
  goog.base(this, opt_domHelper);
};
goog.inherits(goog.ui.ThousandRows.Row, goog.ui.Component);


