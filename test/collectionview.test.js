/**
 * Tests for XView.Collection methods
 */


$(document).ready(function() {

  var XView = Backbone.XView,
      CollectionView = XView.Collection;


  module('CollectionView#constructor');

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

    ok(view.hideFallback.calledOnce);
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
  
});
