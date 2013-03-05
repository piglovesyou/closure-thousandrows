
goog.provide('goog.ui.thousandrows.DefaultRowRenderer');
goog.provide('goog.ui.thousandrows.RowRenderer');


/**
 * Base class of RowRenderer. You may want to customize row
 * rendering, so implement this class and pass it to
 * ThousandRow's constructor argument.
 * @interface
 */
goog.ui.thousandrows.RowRenderer = function() {};


/**
 * @param {goog.ui.thousandrows.Row} row The component instance
 *    that we are creating DOM for.
 * @return {Element} Create outer DOM.
 */
goog.ui.thousandrows.RowRenderer.prototype.createDom = goog.abstractMethod;


/**
 * @param {goog.ui.thousandrows.Row} row The component instance
 *    that we are creating DOM for.
 * @param {Object} record to render.
 * @return {Node} Content DOM of the row.
 */
goog.ui.thousandrows.RowRenderer.prototype.renderContent = goog.abstractMethod;




/**
 * @constructor
 * @implements {goog.ui.thousandrows.RowRenderer}
 */
goog.ui.thousandrows.DefaultRowRenderer = function() {};
goog.addSingletonGetter(goog.ui.thousandrows.DefaultRowRenderer);


/**
 * @inheritDoc
 */
goog.ui.thousandrows.DefaultRowRenderer.prototype.createDom = function(row) {
  return row.getDomHelper().createDom('div', {
    className: row.getCssName()
  });
};


/**
 * @inheritDoc
 */
goog.ui.thousandrows.DefaultRowRenderer.prototype.renderContent =
    function(row, record) {
  goog.asserts.assert(record['index'] ||
                      record['title'] ||
                      record['body'], 'Use custom row renderer.');
  var dh = row.getDomHelper();
  var fragment = dh.getDocument().createDocumentFragment();
  dh.append(fragment,
      dh.createDom('div', 'row-col row-index', '' + record['index']),
      dh.createDom('div', 'row-col row-title', record['title']),
      dh.createDom('div', 'row-col row-description', record['body']));
  return fragment;
};
