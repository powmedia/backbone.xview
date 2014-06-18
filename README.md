Backbone.XView
==============

Easy to use view manager for Backbone. Effortless nested views and templating.

Live interactive demo:
http://jsbin.com/iyugul/16/edit

##Usage

###Easy templating
When styling your app it can be much easier to have all class names and tags defined in templates, rather than scattered between templates and JS code with `tagName` and `className`.

Backbone.XView automatically renders templates and child views, allowing you to keep all HTML tags, CSS IDs and classes in the template.

```js
var UserListView = Backbone.XView.extend({
  template: _.template('<h1>Users</h1><ul class="userList"></ul>')
});

var UserView = Backbone.XView.extend({
  unwrap: true, //Remove the extra 'div' tag that would be added by a regular Backbone view
  template: _.template('<li class="user">Name: <%= name %></li>')
});

var users = new Backbone.Collection([
  { name: 'Bob' },
  { name: 'Gene' },
  { name: 'Tina' }
]);

var list = new UserListView().render();

//Insert each child view into the <ul> from the list by providing a selector
users.each(function(user) {
  list.addView('.userList', new UserView({ model: user }));
});
```

`list.$el.html()` is now:

```html
<h1>Users</h1>
<ul class="userList">
  <li class="user">Name: Bob</li>
  <li class="user">Name: Gene</li>
  <li class="user">Name: Tina</li>
</ul>
```


###Deeply nested views

If you're not using templates, XView can still help in managing nested views:

```js
var parent = new Backbone.XView(),
    child = new Backbone.XView({ tagName: 'i' }),
    grandchild = new Backbone.XView({ tagName: 'b' });

child.$el.html('Child 1');
grandchild.$el.html('Child 2');

//Nest child in parent, and grandchild in child
parent.addView(child);
child.addView(grandchild);

parent.render();

console.log(parent.$el.html());
//<i>Child 1<b>Child 2</b></i>

//All nested views will be removed
parent.remove();
```


##Changelog
###1.5.0
- Add XView#renderTemplate() for overriding how templates are executed
- Locals override renderHelpers

###1.4.0
- Fixes for fallback, loading and initial render state
- Add methods for showing/hiding fallback/loading elements so they can be overridden

###1.3.x
- CollectionView: change itemContainer to listSelector
- CollectionView: add fallbackSelector and loadingSelector

###1.2.x
- Add CollectionView, accessible through XView.Collection or Backbone.XView.Collection

###1.1.x
- Add proper CommonJS support
