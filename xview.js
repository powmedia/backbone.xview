/**
 * XView
 *
 * Easily create hierarchical structures
 * An XView can make multiple child views, which can have multiple child views.
 * When removing a parent view, children are removed automatically.
 *
 * Easy templating
 * Add a template string to the template property, and optionally add unwrap: true 
 * to avoid having Backbone wrap it in an extra tag. This can make templating 
 * and styling easier.
 */


/**
 * Factory
 */
;(function(factory) {
  // AMD
  if (typeof define === 'function' && define.amd) {      
    define(['underscore', 'backbone'], factory);
  }

  //CommonJS
  else if (typeof exports !== 'undefined') {
    factory(require('underscore'), require('backbone'));
  }

  //Globals
  else {
    factory(_, Backbone);
  }
}(function(_, Backbone) {



  /**
   * Main view
   */
  var XView = Backbone.View.extend({
    //Helpers functions (and properties) that are sent to the template on render
    renderHelpers: {},

    /**
     * Constructor
     *
     * @param {Object} [options]
     * @param {View} [options.parent]       Parent view (Passed automatically when using XView#addView)
     * @param {Function} [options.template] Compiled template, e.g. the result of _.template('<div></div>')
     * @param {Boolean} [options.unwrap]    Whether to use only the template, so that there isn't an extra tag around the template contents. NOTE: If using unwrap, there must be one single parent element in the template. 
     */
    constructor: function(options) {
      options = options || {};

      this.parent = options.parent;
      this.children = {};

      if (options.template) this.template = options.template;
      if (options.unwrap) this.unwrap = options.unwrap;

      this.rendered = false;

      Backbone.View.prototype.constructor.call(this, options);
    },

    /**
     * Returns the data to be sent to the template.
     * Default implementation is to return the model JSON object,
     * but this method can be overridden to return any other data
     *
     * This can also be overridden with a simple object rather than function.
     * 
     * @return {Object}     The data to send to the template
     */
    templateData: function() {
      return this.model ? this.model.toJSON() : {};
    },

    /**
     * Adds a child view.
     * If a selector is specified, the view will be appended to that part of the template.
     *
     * @param {String} [selector]
     * @param {Object} [options]
     * @param {Mixed} [options.id]    For fine-grained control if you need to access views after being added. Not necessary in most cases.
     * @param {View} view
     * @return {View}
     */
    addView: function(selector, options, view) {
      //Normalise arguments
      if (arguments.length == 2) { //selector, view
        view = options;
        options = {};
      } else if (arguments.length == 1) { //view
        view = selector;
        options = {};
        selector = null;
      }

      //Generate an ID if not given
      var id = options.id || _.uniqueId();

      //Add to the list of children
      var child = this.children[id] = {
        selector: selector,
        view: view
      };

      //If this view is already rendered, add the child automatically
      if (this.rendered) {
        this.renderView(id);
      }

      return view;
    },

    /**
     * Get a child view by ID
     *
     * @param {Mixed} id      The child view ID
     *
     * @return {View|Null}
     */
    getView: function(id) {
      var child = this.children[id];
      
      return child ? child.view : null;
    },

    /**
     * Renders the main element with the template.
     *
     * If using a template and the 'unwrap' property is true then the template HTML will not be wrapped
     * in an extra tag. This can make editing and styling templates easier.
     * 
     * @return {View}     Returns self
     */
    render: function() {
      if (this.template) {
        var html = '';

        //Get data for template
        var data = _.isFunction(this.templateData) ? this.templateData() : this.templateData;

        //Add template helpers
        _.extend(data, this.renderHelpers);

        //Render HTML
        html = Backbone.$(this.template(data));

        //If using unwrap and this is an update, only replace the main element contents
        //This ensures the view that's actually in the DOM is updated
        if (this.unwrap) {
          if (!this.rendered) {
            this.setElement(html);
          } else {
            this.$el.html(html.html());
            this.delegateEvents();
          }
        } else {
          this.$el.html(html);
        }
      }

      this.renderViews();

      if (this.onRender) this.onRender();

      this.rendered = true;

      return this;
    },

    /**
     * Render all child views
     */
    renderViews: function() {
      var self = this,
          ids = _.keys(this.children);

      _.each(ids, _.bind(self.renderView, this));
    },

    /**
     * Renders a child view and adds it to it's locations in the parent element
     *
     * @param {Mixed} id    The child view ID
     */
    renderView: function(id) {
      var child = this.children[id];

      var selector = child.selector,
          view = child.view,
          $el = null;

      view.render();

      //Decide where the child view is going
      if (selector) {
        $el = this.$el.find(selector);
      } else {
        $el = this.$el;
      }

      $el.append(view.el);
    },

    /**
     * Close and remove all child views
     */
    removeViews: function() {
      var self = this,
          ids = _.keys(this.children);

      _.each(ids, _.bind(self.removeView, this));
    },

    /**
     * Close and remove a child view
     *
     * @param {Mixed} id    Child view ID
     */
    removeView: function(id) {
      var children = this.children,
          child = children[id];

      if (!child) return;

      child.view.remove();

      delete children[id];
    },

    /**
     * Closes child views then this one, removes event listeners etc.
     */
    remove: function() {
      this.removeViews();

      Backbone.View.prototype.remove.call(this);
    }
  });


  /**
   * CollectionView
   * Renders a list of ItemViews representing a collection
   */
  var CollectionView = XView.extend({
    tagName: 'ul',

    //Selector string for where items will be inserted. If not set, will default to the root element
    listSelector: null,

    //Selector string for content to show if there are no items
    fallbackSelector: null,

    //Selector string for content to show if there are no items
    loadingSelector: null,

    /**
     * Constructor
     *
     * @param {Object} options
     * @param {Collection} options.collection   Collection to render
     * @param {XView} options.itemView          Constructor (not instance) for an item view
     */
    constructor: function(options) {
      XView.prototype.constructor.call(this, options);

      options = options || {};

      if (options.collection) this.collection = options.collection;
      if (!this.collection) throw new Error('collection is required');

      if (options.itemView) this.itemView = options.itemView;
      if (!this.itemView) throw new Error('itemView is required');

      this.listenTo(this.collection, 'add', this.addItem);
      this.listenTo(this.collection, 'remove', this.removeItem);
      this.listenTo(this.collection, 'reset', this.resetItems);
      this.listenTo(this.collection, 'request', this.onRequest);
      this.listenTo(this.collection, 'sync', this.onSync);

      //Render items if already in the collection
      if (this.collection.length) this.resetItems();
    },

    render: function() {
      XView.prototype.render.call(this);

      //Show loading if collection is being fetched
      if (this.isLoading) {
        this.showLoading();

        this.hideFallback();
      }

      //Not loading; show fallback if collection is empty
      else {
        this.hideLoading();

        if (this.collection.length) {
          this.hideFallback();
        } else {
          this.showFallback();
        }
      }

      return this;
    },

    /**
     * Shows the fallback element using this.fallbackSelector
     */
    showFallback: function() {
      this.$(this.fallbackSelector).show();
    },

    /**
     * Hides the fallback element using this.fallbackSelector
     */
    hideFallback: function() {
      this.$(this.fallbackSelector).hide();
    },

    /**
     * Shows the loading element using this.loadingSelector
     */
    showLoading: function() {
      this.$(this.loadingSelector).show();
    },

    /**
     * Hides the loading element using this.loadingSelector
     */
    hideLoading: function() {
      this.$(this.loadingSelector).hide();
    },

    /**
     * Renders a new model
     * 
     * @param {Model} model
     */
    addItem: function(model) {
      var view = new this.itemView({
        model: model
      });

      this.addView(this.listSelector || null, { id: model.cid }, view);
    },

    /**
     * @param {Model} model
     */
    removeItem: function(model) {
      this.removeView(model.cid);
    },

    /**
     * Removes existing item views and adds the current collection contents
     */
    resetItems: function() {
      this.removeViews();

      this.collection.each(_.bind(this.addItem, this));

      //Show fallback if there are no items
      if (!this.collection.length) {
        this.showFallback();
      }
    },

    /**
     * Callback for when a request has started, i.e. collection is in loading state
     */
    onRequest: function() {
      this.isLoading = true;

      //Show loading if there are no items
      if (!this.collection.length) {
        this.showLoading();
      }
    },

    /**
     * Callback for when a request has ended, i.e. collection is not in loading state
     */
    onSync: function() {
      //Hide loading
      this.isLoading = false;
      this.hideLoading();

      //Show fallback if there are no items
      if (!this.collection.length) {
        this.showFallback();
      }
    }
  });


  /**
   * Exports
   */
  XView.Collection = CollectionView;

  Backbone.XView = XView;

  //For use in NodeJS
  if (typeof module != 'undefined') module.exports = XView;
  
  return Backbone.XView;

}));
