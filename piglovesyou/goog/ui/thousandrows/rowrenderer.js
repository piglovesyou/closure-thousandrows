
goog.provide('goog.ui.thousandrows.RowRenderer');

/**
 * @constructor
 */
goog.ui.thousandrows.RowRenderer = function () {};
goog.addSingletonGetter(goog.ui.thousandrows.RowRenderer);


/**
 * @param {goog.ui.thousandrows.Row} row
 * @return {Element}
 */
goog.ui.thousandrows.RowRenderer.prototype.createDom = function (row) {
  return row.getDomHelper().createDom('div', {
    className: row.getCssName()
    // style: 'height: ' + this.height_ + 'px'
  });
};


/**
 * @param {goog.ui.thousandrows.Row} row
 * @param {Object} record
 * @return {Node}
 */
goog.ui.thousandrows.RowRenderer.prototype.createContent = function (row, record) {
  goog.asserts.assert(record['index'] || record['title'] || record['body'], 'Use custom row renderer.');
  var dh = row.getDomHelper();
  var fragment = dh.getDocument().createDocumentFragment();
  dh.append(fragment,
      dh.createDom('div', 'row-col row-index', '' + record['index']),
      dh.createDom('div', 'row-col row-title', record['title']),
      dh.createDom('div', 'row-col row-description', record['body']));
  return fragment;
};

