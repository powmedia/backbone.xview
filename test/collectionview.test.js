/**
 * Tests for XView.Collection methods
 */


$(document).ready(function() {

  var XView = Backbone.XView,
      CollectionView = XView.Collection;


  module('CollectionView#constructor');

  test('sets options and initial state', 2, function() {
    var ItemView = new Backbone.XView.extend(),
        collection = new Backbone.Collection(),
        template = _.template('x');

    var view = new CollectionView({
      collection: collection,
      itemView: ItemView
    });

    equal(view.collection, collection);
    equal(view.itemView, ItemView);
  });
  
});
