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
      this.CV = CollectionView.extend({
        itemView: XView,
        template: _.template('<div class="loading">Loading</div><div class="fallback">Fallback</div>'),
        loadingSelector: '.loading',
        fallbackSelector: '.fallback'
      });
    }
  });

  test('shows loading if in loading state', function() {
    var collection = new Backbone.Collection();

    var view = new this.CV({
      collection: collection
    });

    view.isLoading = true;

    view.render();

    equal(view.$('.loading').css('display'), 'block');
  });

  test('hides loading if not in loading state', function() {
    var collection = new Backbone.Collection();

    var view = new this.CV({
      collection: collection
    });

    view.isLoading = false;

    view.render();

    equal(view.$('.loading').css('display'), 'none');
  });

  test('shows fallback if collection is empty and not loading', function() {
    var collection = new Backbone.Collection([]);

    var view = new this.CV({
      collection: collection
    });

    view.isLoading = false;

    view.render();

    equal(view.$('.fallback').css('display'), 'block');
  });

  test('hides fallback if collection is empty but loading', function() {
    var collection = new Backbone.Collection([]);

    var view = new this.CV({
      collection: collection
    });

    view.isLoading = true;

    view.render();

    equal(view.$('.fallback').css('display'), 'none');
  });

  test('hides fallback if collection has models', function() {
    var collection = new Backbone.Collection([{ id: 1 }]);

    var view = new this.CV({
      collection: collection
    });

    view.render();

    equal(view.$('.fallback').css('display'), 'none');
  });
  
});
