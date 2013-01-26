# goog.ui.ThousandRows
A module for Google Closure Library to implement a big list, which has a lot of rows. 


## Demo
Visit http://stakam.net/closure/120722/


## Features
Main features of this plugin are:
- Light motion. ThousandRows stores data, but not elements in the document.
- Loading is also light. ThousandRows always gets minimum data from a server.
- You can jump whereever you want by means of virtually srolling implementation. 

There are constraints such as:
- Divs of rows have to be the same height (for scrolling consistency).


## Usage
This is how to create an instance of thousandrows.

```js
  // Instantiate ThousandRows itself.
  var thousandrows = new goog.ui.ThousandRows(
                  39,      // Required: Each row height.
                  20);     // Required: How much rows a page contains.
                  
  // In addition, we need model instance that interacts with a server and datasource.
  var model = new goog.ui.thousandrows.Model(
                  '/rows', // Required: URL through which thousandrows interacts with a server by xhr.
                  10000,   // Optional: Total amount of rows.
                  true);   // Optional: Pass true if you want to update total amount
                           //            in terms of response content of xhr.

  thousandrows.decorate(goog.dom.getElement('my-thousandrows'));
  
  // We can lazily set model before or after decorating/rendering thousandrows.
  // Also, we can overwrite model of an existing thousandrows.
  thousandrows.setModel(model);
```

In the case above, you have to adjust and change JSON structure from a server.
But most of the time, you want adjust and change the way of how to extract data from JSON on the client side.
In that case, you have to extend Model class and override methods below:

```js
  // When you want change GET parameter of XHR, override it.
  goog.ui.thousandrows.Model.prototype.buildUri_

  // When total count of rows is in responseJSON, override it.
  goog.ui.thousandrows.Model.prototype.extractTotalFromJson

  // When you want change how to extract rows data, override it.
  goog.ui.thousandrows.Model.prototype.extractRowsDataFromJson
```


## Tests
### 1. Browser Test
In progress..

### 2. Code-Checking by Closure Compiler
Run
```bash
$ make compile
```
Then you'll get warnings if any.


## Lisence
```
Copyright (c) 2012 Soichi Takamura (http://stakam.net/)
Dual licensed under the MIT and GPL licenses:
 http://www.opensource.org/licenses/mit-license.php
 http://www.gnu.org/licenses/gpl.html
```
