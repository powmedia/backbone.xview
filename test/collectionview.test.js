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
  
});
