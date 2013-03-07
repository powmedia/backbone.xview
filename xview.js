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
  if (typeof define === 'function' && define.amd) {
      // AMD
      define(['underscore', 'backbone'], factory);
  } else {
      // globals
      factory(_, Backbone);
  }
}(function(_, Backbone) {



  /**
   * Source
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
     * @param {Boolean} [options.unwrap]    Whether to use only the template, so that there isn't an extra tag around the template contents
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
        html = $(this.template(data));

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
   * Exports
   */
  Backbone.XView = XView;

  //For use in NodeJS
  if (typeof module != 'undefined') module.exports = XView;
  
  return Backbone;

}));
