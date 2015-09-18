![](http://i.imgur.com/LdRYNfs.png?1)
#Codepoems
An experimental IDE for the amazing [Processing Language.](https://www.processing.org/).

![](http://hinecsoft.com/codepoems/assets/screenshot_share_01.png)

# Features
(Some I currently working on)

*	Live documentation
*	Autocomplete
*	Media Viewer
*	Multiple Themes
*	Sublime text bindings
*	Open multiple formats (GLSL,JSON,TXT & XML)

# About 
This is an experimental tool that I created for personal purpose in my projects on [hinecsoft.com](http://hinecsoft.com).

This is my first open source project, I apologize for the newbie stuff. This is an opportunity to continue learning.


# P5M (Processing Modules)
I'm working with a dependecy injection for Processing called [P5M](https://github.com/necsoft/P5M), this version let's you use these modules in your project.

# Technology Involved
Codepoems is built using [io.js](https://iojs.org), [nwjs](http://nwjs.io/) and the processing-java CLI.

# Download
The current release is only for Mac OS X, but I'm working in a Windows and Linux versions.

* **[Download Codepoems v0.8.0-alpha for OS X](https://github.com/necsoft/codepoems/releases)**

# Building
You need to have [node-webkit-builder](https://github.com/mllrsohn/node-webkit-builder) in order to run these commands. The node-webkit-builder creates a builder folder with the packages.

#### Building for OSX64
```
git clone https://github.com/necsoft/codepoems
npm install
bower install
npm run build_osx64
```

#### Compiling Stylesheets
I am currently using Sass+Compass for the stylesheets. You can use ``compass watch`` in the ``app/static/`` folder.

# I need volunteers
If you think you can help me with, please send your pull requests!

# Get in touch
Feel free to talk with me [@necsoft](https://twitter.com/necsoft), I would love to hear your opinions!
