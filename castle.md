# Castle (0.9)


Because modern web apps can be simple

### Intro

Adopting big web frameworks like Angular or React makes you tied with technologies and tools that creates heavy applications and requires hours of learning on islands of technicalities that will become obsolete in few years.
Castle is different because it is simple and small.

With Castle you have the opportunity to work with a simple framework, understanding the internals, improving, customizing and contributing.

I am not kidding, the Castle runtime is less than 500 lines of unminified JavaScript and the 
tools simple and small as well.

Castle just adds the missing bits to make life more productive, and can be used with Javascript or Typescript.

Castle runs even in IE.

### Get started

Download here [castle.zip](castle.zip)

Open a command line as administrator and type

```
castle install
```

This will add Castle to your system path.

Choose a directory to create your first app and type:

```
castle create MyApp
cd MyApp
```
This will create a folder with a sample application.

Castle does not depends on Typescript, but it is a good tool to have.
The default application configures Typescript and the Visual Studio Code.

Open the folder and select the menu Terminal "Run Build Task..."

This will compile ts files generating js files.

Now  we are ready to build

```
castle build
```
And you application is ready.

## How it works?

Castle scan the current directory looking for pair of js + html files 
with the same name. For instance:

Home.js
```
class Home {
}
```
Home.html

```
<Home>
  <h1>Title</h1>
</Home>
```
This pair represents our pages or controls. The html file has little differences 
compared with normal html file because we have a root element that has the name of 
the control/page.


Castle then generates for each pair another file (.t.js) that basically has 
the html inserted as string inside a JavaScript file.

Latter this string is used as template to instantiate your control.

The final job of the tool is to insert each pair (js + .t.js) inside our index.html.

At begging (event onload), the Castle runtime will instantiate the page called Home.

## Page instantiation

The page instantiation is done automatically by the runtime when you navigate for some 
page. The page name is the fragment part of the url. For instance, http://localhost#Page1
will instantiate and show Page1. 

To create a link for page just use:

```
<a href="#Page2">Page2</a>
```
When a page is instantiated both the JavaScript object and the DOM elements are instantiated. 

The DOM elements of a page are inserted at the div id="maindiv". 

During the instantiation the JavaScript objects sets the attribute **htmlElement** to the root 
of the DOM elements it represents.

We can declare this using Typescript as:

```
class Home {
    htmlElement : HTMLElementDiv;
}
```
## Custom control instantiation

Controls are instantiated inside html just like normal html elements.

For instance:

```
<Home>
  <h1>Title</h1>
  <MyButton text="Click"><MyButton>
</Home>
```
When controls are instantiated inside pages they receive a attribute **Parent** that points 
to the control that is the parent and also **Screen** that points to the screen they are inserted. 

The DOM objects also receive these attributes. 

To receive a button event on the page we can do: 

```
<Home>
    <button onclick="Parent.OnButtonClick()">Prev</button> 
</Home>
```

We also can inject a variable to your control inside the page using "data-id". This works 
for custom control or normal html controls.



```
<Home>
  <h1>Title</h1>
  <MyButton text="Click" data-id="btn"><MyButton>
</Home>
```
The object Home will have a btn as variable. Using typescript we can declare
this.

```
class Home {
    btn : HtmlButtonElement;
}
```
## Events

When a page or control is instantiated it calls (if present) the event **OnShow**.


## Reference

Each control/page has a root html element that is by default div.
If you want to use another element as root use **data-c**
```
<View data-c="canvas">
</View>
```

Language selection can be done at runtime using **data-t** tag splitting
the text with the character informed by data-t.

```
   <a href="#Login" data-t="#">Já Tenho conta#Already have account</a>
```

Look at the source code to customize this.

## Design Notes

The html [template element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/template) was 
considered. But it requires newer browsers and web components to be equivalent on Castle solution.

