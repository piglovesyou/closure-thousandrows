/**
 * @license
 * Copyright (c) 2012 Soichi Takamura (http://stakam.net/).
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 */

goog.provide('goog.ui.thousandrows.Row');

goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.ui.Component');
goog.require('goog.ui.thousandrows.RowRenderer');

/**
 * @param {string|number} rowIndex .
 * @param {number} height .
 * @param {goog.ui.thousandrows.RowRenderer} opt_renderer .
 * @param {goog.dom.DomHelper} opt_domHelper .
 * @constructor
 * @extends {goog.ui.Component}
 */
goog.ui.thousandrows.Row = function(rowIndex,
                                    height, opt_renderer, opt_domHelper) {
  goog.base(this, opt_domHelper);

  this.setId('' + rowIndex);

  /**
   * @type {number}
   * @private
   */
  this.height_ = height;

  /**
   * @type {goog.ui.thousandrows.RowRenderer}
   * @private
   */
  this.renderer_ = opt_renderer ||
      goog.ui.thousandrows.RowRenderer.getInstance();
};
goog.inherits(goog.ui.thousandrows.Row, goog.ui.Component);

/**
 * @param {Object} record .
 */
goog.ui.thousandrows.Row.prototype.renderContent = function(record) {
  if (!this.isInDocument()) return;
  var content = this.getContentElement();
  goog.dom.removeChildren(content);
  if (record) {
    this.renderContent_(record);
    this.asRendered_(true);
  } else {
    this.asRendered_(false);
  }
};

/**
 * @param {Object} record .
 * @private
 */
goog.ui.thousandrows.Row.prototype.renderContent_ = function(record) {
  this.getDomHelper().appendChild(
      /** @type {!Node} */(this.getContentElement()),
      this.renderer_.renderContent(this, record));
};

/**
 * @type {boolean}
 * @private
 */
goog.ui.thousandrows.Row.prototype.hasContent_ = false;

/**
 * @return {boolean} .
 */
goog.ui.thousandrows.Row.prototype.hasContent = function() {
  return !!this.hasContent_;
};

/**
 * @param {boolean} rendered Whether the content rendered or not.
 * @private
 */
goog.ui.thousandrows.Row.prototype.asRendered_ = function(rendered) {
  goog.dom.classes.enable(this.getElement(),
      goog.getCssName(this.getCssName(), 'notrendered'), !rendered);
  this.hasContent_ = !!rendered;
};

/** @inheritDoc */
goog.ui.thousandrows.Row.prototype.createDom = function() {
  var elm = this.renderer_.createDom(this);
  this.setElementInternal(elm);
  this.asRendered_(false);
};

/**
 * @type {?string}
 */
goog.ui.thousandrows.Row.prototype.baseCssName;

/**
 * @return {string} .
 */
goog.ui.thousandrows.Row.prototype.getCssName = function() {
  return this.baseCssName ||
      (this.baseCssName =
        (this.getParent() &&
         this.getParent().getParent().baseCssName &&
         goog.getCssName(this.getParent().getParent().baseCssName ||
                         'thousandrows', 'row')));
};
