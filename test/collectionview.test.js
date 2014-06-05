/**
 * Tests for XView.Collection methods
 */


$(document).ready(function() {

  var XView = Backbone.XView,
      CollectionView = XView.Collection;


  module('CollectionView#constructor', {
    setup: function() {
      this.sinon = sinon.sandbox.create();

      this.sinon.spy(CollectionView.prototype, 'addItem');
      this.sinon.spy(CollectionView.prototype, 'removeItem');
      this.sinon.spy(CollectionView.prototype, 'resetItems');
      this.sinon.spy(CollectionView.prototype, 'onRequest');
      this.sinon.spy(CollectionView.prototype, 'onSync');
    },

    teardown: function() {
      this.sinon.restore();
    }
  });

  test('sets options and initial state', 2, function() {
    var ItemView = XView.extend(),
        collection = new Backbone.Collection();

    var view = new CollectionView({
      collection: collection,
      itemView: ItemView
    });

    equal(view.collection, collection);
    equal(view.itemView, ItemView);
  });

  test('binds to collection events', function() {
    var collection = new Backbone.Collection();

    var view = new CollectionView({
      itemView: XView,
      collection: collection
    });

    //Test
    collection.trigger('add', new Backbone.Model());
    ok(view.addItem.calledOnce);

    collection.trigger('remove', new Backbone.Model());
    ok(view.removeItem.calledOnce);

    collection.trigger('reset', new Backbone.Model());
    ok(view.resetItems.calledOnce);

    collection.trigger('request', new Backbone.Model());
    ok(view.onRequest.calledOnce);

    collection.trigger('sync', new Backbone.Model());
    ok(view.onSync.calledOnce);
  });


  module('CollectionView#render', {
    setup: function() {
      this.sinon = sinon.sandbox.create();

      this.sinon.spy(CollectionView.prototype, 'showFallback');
      this.sinon.spy(CollectionView.prototype, 'hideFallback');
      this.sinon.spy(CollectionView.prototype, 'showLoading');
      this.sinon.spy(CollectionView.prototype, 'hideLoading');
    },

    teardown: function() {
      this.sinon.restore();
    }
  });

  test('shows loading if in loading state', function() {
    var collection = new Backbone.Collection();

    var view = new CollectionView({
      itemView: XView,
      collection: collection
    });

    view.isLoading = true;

    view.render();

    ok(view.showLoading.calledOnce);
  });

  test('hides loading if not in loading state', function() {
    var collection = new Backbone.Collection();

    var view = new CollectionView({
      itemView: XView,
      collection: collection
    });

    view.isLoading = false;

    view.render();

    ok(view.hideLoading.calledOnce);
  });

  test('shows fallback if collection is empty and not loading', function() {
    var collection = new Backbone.Collection([]);

    var view = new CollectionView({
      itemView: XView,
      collection: collection
    });

    view.isLoading = false;

    view.render();

    ok(view.showFallback.calledOnce);
  });

  test('hides fallback if collection is empty but loading', function() {
    var collection = new Backbone.Collection([]);

    var view = new CollectionView({
      itemView: XView,
      collection: collection
    });

    view.isLoading = true;

    view.render();

    ok(view.hideFallback.calledOnce);
  });

  test('hides fallback if collection has models', function() {
    var collection = new Backbone.Collection([{ id: 1 }]);

    var view = new CollectionView({
      itemView: XView,
      collection: collection
    });

    view.render();

    equal(view.hideFallback.callCount, 1);
  });


  module('CollectionView#showFallback');

  test('shows the fallback element found with CollectionView#fallbackSelector', function() {
    var view = new CollectionView({
      itemView: XView,
      collection: new Backbone.Collection()
    });

    view.template = _.template('<div class="fallback"></div>');
    view.fallbackSelector = '.fallback';

    view.render();

    view.showFallback();

    equal(view.$('.fallback').css('display'), 'block');
  });


  module('CollectionView#hideFallback');

  test('hides the fallback element found with CollectionView#fallbackSelector', function() {
    var view = new CollectionView({
      itemView: XView,
      collection: new Backbone.Collection()
    });

    view.template = _.template('<div class="fallback"></div>');
    view.fallbackSelector = '.fallback';

    view.render();

    view.hideFallback();

    equal(view.$('.fallback').css('display'), 'none');
  });


  module('CollectionView#showLoading');

  test('shows the loading element found with CollectionView#loadingSelector', function() {
    var view = new CollectionView({
      itemView: XView,
      collection: new Backbone.Collection()
    });

    view.template = _.template('<div class="loading"></div>');
    view.loadingSelector = '.loading';

    view.render();

    view.showLoading();

    equal(view.$('.loading').css('display'), 'block');
  });


  module('CollectionView#hideLoading');

  test('hides the loading element found with CollectionView#loadingSelector', function() {
    var view = new CollectionView({
      itemView: XView,
      collection: new Backbone.Collection()
    });

    view.template = _.template('<div class="loading"></div>');
    view.loadingSelector = '.loading';

    view.render();

    view.hideLoading();

    equal(view.$('.loading').css('display'), 'none');
  });


  module('CollectionView#addItem');

  test('renders a new model - without a listSelector', function() {
    var ItemView = XView.extend(),
        model = new Backbone.Model();

    var collectionView = new CollectionView({
      itemView: ItemView,
      collection: new Backbone.Collection()
    });

    sinon.spy(collectionView, 'addView');

    collectionView.addItem(model);

    //Test addView was called correctly
    var args = collectionView.addView.args[0],
        selectorArg = args[0],
        optionsArg = args[1],
        viewArg = args[2];

    equal(selectorArg, null);
    deepEqual(optionsArg, { id: model.cid });

    ok(viewArg instanceof ItemView);
    equal(viewArg.model, model);
  });

  test('renders a new model - with a listSelector', function() {
    var ItemView = XView.extend(),
        model = new Backbone.Model();

    var collectionView = new CollectionView({
      itemView: ItemView,
      collection: new Backbone.Collection()
    });

    collectionView.listSelector = '.list';

    sinon.spy(collectionView, 'addView');

    collectionView.addItem(model);

    //Test addView was called correctly
    var args = collectionView.addView.args[0],
        selectorArg = args[0];

    equal(selectorArg, '.list');
  });


  module('CollectionView#removeItem');

  test('removes model view from the list', function() {
    var ItemView = XView.extend();

    var model = new Backbone.Model(),
        collection = new Backbone.Collection([model]);

    var view = new CollectionView({
      itemView: ItemView,
      collection: collection
    }).render();

    sinon.spy(view, 'removeView');

    view.removeItem(model);

    //Test removeView was called correctly
    var args = view.removeView.args[0],
        cidArg = args[0];

    equal(cidArg, model.cid);
  });


  module('CollectionView#resetItems');

  test('removes all views and adds all models', function() {
    var collection = new Backbone.Collection();

    var view = new CollectionView({
      itemView: XView,
      collection: collection
    });

    sinon.spy(view, 'removeViews');
    sinon.spy(view, 'addItem');

    collection.add([{ id: 1 }, { id: 2 }])

    view.resetItems();

    //Test
    ok(view.removeViews.calledOnce);
    equal(view.addItem.callCount, 2);
  });

  test('shows fallback if collection is empty', function() {
    var collection = new Backbone.Collection();

    var view = new CollectionView({
      itemView: XView,
      collection: collection
    });

    sinon.spy(view, 'showFallback');

    view.resetItems();

    //Test
    ok(view.showFallback.calledOnce);
  });

  test('hides fallback if collection has models', function() {
    var collection = new Backbone.Collection([{ id: 1 }]);

    var view = new CollectionView({
      itemView: XView,
      collection: collection
    });

    sinon.spy(view, 'hideFallback');

    view.resetItems();

    //Test
    ok(view.hideFallback.calledOnce);
  });


  module('CollectionView#onRequest');

  test('sets isLoading to true', function() {
    var view = new CollectionView({
      itemView: XView,
      collection: new Backbone.Collection()
    });

    view.onRequest();

    equal(view.isLoading, true);
  });

  test('shows loading if collection is empty', function() {
    var view = new CollectionView({
      itemView: XView,
      collection: new Backbone.Collection()
    });

    sinon.spy(view, 'showLoading');
    sinon.spy(view, 'hideFallback');

    view.onRequest();

    equal(view.showLoading.callCount, 1);
  });


  module('CollectionView#onSync');

  test('sets isLoading to false, hides loading', function() {
    var view = new CollectionView({
      itemView: XView,
      collection: new Backbone.Collection()
    });

    sinon.spy(view, 'hideLoading');

    view.onSync();

    equal(view.isLoading, false);
    equal(view.hideLoading.callCount, 1);
  });

  test('shows fallback if collection is empty', function() {
    var view = new CollectionView({
      itemView: XView,
      collection: new Backbone.Collection()
    });

    sinon.spy(view, 'showFallback');

    view.onSync();

    equal(view.showFallback.callCount, 1);
  });
  
});
