/**
 * Tests from Backbone View, adjusted to test XView
 * When updating for a new Backbone version, just paste the view test contents
 * below and do a find/replace for Backbone.View -> Backbone.XView
 */


$(document).ready(function() {

  var XView = Backbone.XView;


  module('XView#constructor');

  test('sets options and initial state', 3, function() {
    var parent = new XView(),
        template = _.template('x');

    var view = new XView({
      parent: parent,
      template: template
    });

    equal(view.parent, parent);
    equal(view.template, template);

    equal(view.rendered, false);
  });


  module('XView#templateData');

  test('without model', 1, function() {
    var view = new XView();

    deepEqual(view.templateData(), {});
  });

  test('templateData: with model', 1, function() {
    var view = new XView({
      model: new Backbone.Model({ name: 'Bob' })
    });

    deepEqual(view.templateData(), { name: 'Bob' });
  });


  module("XView#addView", {
    setup: function() {
      this.sinon = sinon.sandbox.create();

      this.sinon.spy(XView.prototype, 'renderView');
    },

    teardown: function() {
      this.sinon.restore();
    }
  });

  test('addView(view) - adds views and returns them', 8, function() {
    var child1 = new XView(),
        child2 = new XView(),
        parent = new XView();

    //Add first child
    var returnedView1 = parent.addView(child1);

    equal(_.size(parent.children), 1);
    equal(returnedView1, child1);

    //Add second child
    var returnedView2 = parent.addView(child2);

    equal(_.size(parent.children), 2);
    equal(returnedView2, child2);

    //Check details
    _.each(parent.children, function(item, key) {
      equal(item.selector, null);
      ok(item.view instanceof Backbone.View);
    });
  });

  test('addView(selector, view) - adds views with given selector', 2, function() {
    var child = new XView(),
        parent = new XView();

    parent.addView('.childContainer', child);

    _.each(parent.children, function(item) {
      equal(item.selector, '.childContainer');
      equal(item.view, child);
    });
  });

  test('addView(selector, options, view) - can specify child view ID', 3, function() {
    var child = new XView(),
        parent = new XView();

    parent.addView('.foo', { id: 123}, child);

    _.each(parent.children, function(item, key) {
      equal(item.selector, '.foo');
      equal(item.view, child);
      equal(key, 123);
    });
  });

  test('only renders children if parent has already rendered', 2, function() {
    var child1 = new XView(),
        child2 = new XView(),
        parent = new XView();

    //When not rendered
    parent.rendered = false;
    parent.addView(child1);

    equal(parent.renderView.called, false);

    //When rendered
    parent.rendered = true;
    parent.addView(child2);

    equal(parent.renderView.calledOnce, true);
  });


  module('XView#getView');

  test('returns a view given the ID', 2, function() {
    var parent = new XView(),
        child1 = new XView(),
        child2 = new XView();

    parent.addView(null, { id: 1 }, child1);
    parent.addView(null, { id: 2 }, child2);

    equal(parent.getView(1), child1);
    equal(parent.getView(2), child2);
  });


  module('XView#render', {
    setup: function() {
      this.sinon = sinon.sandbox.create();
    },

    teardown: function() {
      this.sinon.restore();
    }
  });

  test('renders parent and child views', 5, function() {    
    var parent = new XView(),
        child1 = new XView(),
        child2 = new XView();

    parent.addView(child1);
    parent.addView(child2);
    
    //Spy renderViews()
    this.sinon.spy(parent, 'renderViews');
    this.sinon.spy(child1, 'renderViews');
    this.sinon.spy(child2, 'renderViews');

    var returnedView = parent.render();

    //Calls renderViews() once for parent and once for each child
    ok(parent.renderViews.calledOnce);
    ok(child1.renderViews.calledOnce);
    ok(child2.renderViews.calledOnce);

    //Returns self
    equal(returnedView, parent);

    //Sets rendered to true
    equal(parent.rendered, true);
  });

  test('calls onRender() if defined', 1, function() {
    var view = new XView();

    view.onRender = function() {}

    this.sinon.spy(view, 'onRender');

    view.render();

    ok(view.onRender.calledOnce);
  });

  test('with template and simple templateData object', 1, function() {
    var view = new XView();

    view.template = _.template('<i><%= message %></i>');
    view.templateData = { message: 'Hello' };

    view.render();

    equal(view.$el.html(), '<i>Hello</i>');
  });

  test('with template and templateData function', 1, function() {
    var view = new XView();

    view.template = _.template('<i><%= message %></i>');
    view.templateData = function() {
      return { message: 'Goodbye' }
    }

    view.render();

    equal(view.$el.html(), '<i>Goodbye</i>');
  });

  test('with template and renderHelpers', function() {
    var view = new XView();

    view.renderHelpers = {
      shout: function(str) {
        return str.toUpperCase();
      }
    }

    view.template = _.template('<i><%= shout(message) %></i>');
    view.templateData = { message: 'Hello' };

    view.render();

    equal(view.$el.html(), '<i>HELLO</i>');
  });

  test('with template and unwrap - replaces element', 2, function() {
    var view = new XView();

    view.tagName = 'div';
    view.unwrap = true;
    view.template = _.template('<i><%= message %></i>');
    view.templateData = { message: 'Hi' };

    view.render();

    ok(view.$el.is('i'), 'The main element should be the outermost one from the template');
    equal(view.$el.html(), 'Hi');
  });

  test('with template and unwrap when already rendered', 3, function() {
    var view = new XView();

    this.sinon.spy(view, 'delegateEvents');

    view.tagName = 'div';
    view.unwrap = true;
    view.template = _.template('<i><%= message %></i>');
    view.templateData = { message: 'Hi' };

    view.render();

    //Re-render
    view.render();

    //Should now be the same, even though the view has been rendered twice
    ok(view.$el.is('i'), 'The main element should be the outermost one from the template');
    equal(view.$el.html(), 'Hi');

    //Should call delegateEvents again to avoid zombie listeners
    equal(view.delegateEvents.callCount, 2, 'Should call delegateEvents twice');
  });


  module('XView#renderViews', {
    setup: function() {
      this.sinon = sinon.sandbox.create();
    },

    teardown: function() {
      this.sinon.restore();
    }
  });

  test('calls renderView for each child ID', 2, function() {
    var parent = new XView(),
        child1 = new XView(),
        child2 = new XView();

    parent.addView(null, { id: 1 }, child1);
    parent.addView(null, { id: 2 }, child2);

    this.sinon.spy(parent, 'renderView');

    parent.renderViews();

    var args = parent.renderView.args;

    equal(args[0][0], 1);
    equal(args[1][0], 2);
  });


  module('XView#renderView', {
    setup: function() {
      this.sinon = sinon.sandbox.create();
    },

    teardown: function() {
      this.sinon.restore();
    }
  });

  test('without selector: appends to main element', 1, function() {
    var parent = new XView(),
        child = new XView({ template: _.template('<i>Child</i>') });

    parent.addView(null, { id: 123 }, child);

    //Simulate rendering the view
    parent.setElement($('<div><span>Existing content</span></div>'));

    parent.renderView(123);

    equal(parent.$el.html(), '<span>Existing content</span><div><i>Child</i></div>');
  });

  test('with selector: inserts child el into selected part of parent', 1, function() {
    var parent = new XView(),
        child = new XView({ template: _.template('<i>Child</i>') });

    parent.addView('.container', { id: 456 }, child);

    //Simulate rendering the view
    parent.setElement($('<div><div class="container"></div></div>'));

    parent.renderView(456);

    equal(parent.$el.html(), '<div class="container"><div><i>Child</i></div></div>');
  });


  module('XView#removeViews', {
    setup: function() {
      this.sinon = sinon.sandbox.create();
    },

    teardown: function() {
      this.sinon.restore();
    }
  });

  test('calls removeView for each child ID', 2, function() {
    var parent = new XView(),
        child1 = new XView(),
        child2 = new XView();

    parent.addView(null, { id: 1 }, child1);
    parent.addView(null, { id: 2 }, child2);

    this.sinon.spy(parent, 'removeView');

    parent.removeViews();

    var args = parent.removeView.args;

    equal(args[0][0], 1);
    equal(args[1][0], 2);
  });


  module('XView#removeView', {
    setup: function() {
      this.sinon = sinon.sandbox.create();
    },

    teardown: function() {
      this.sinon.restore();
    }
  });

  test('calls remove() on child view', 2, function() {
    var parent = new XView(),
        child = new XView();

    parent.addView(null, { id: 123 }, child);

    this.sinon.spy(child, 'remove');

    parent.removeView(123);

    ok(child.remove.calledOnce, 'Should call remove()');

    equal(_.size(parent.children), 0, 'Deletes child from view.children');
  });


  module('XView#remove', {
    setup: function() {
      this.sinon = sinon.sandbox.create();
    },

    teardown: function() {
      this.sinon.restore();
    }
  });

  test('calls removeViews to remove all children', 2, function() {
    var parent = new XView(),
        child = new XView();

    this.sinon.spy(parent, 'removeViews');
    this.sinon.spy(Backbone.View.prototype, 'remove');

    parent.addView(child);

    parent.remove();

    ok(parent.removeViews.calledOnce);

    //Calls remove() once for the parent, once for the child
    equal(Backbone.View.prototype.remove.callCount, 2, 'Should call remove() twice');
  });

});
