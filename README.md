# CS50 Seminar: Meteor.js + ReactJS

### Requirements
- Meteor.js (MongoDB and other packages will be installed automatically when you run meteor)

### Preferable
- OSX makes things infinitely simpler 
- Google Chrome or another browser with a Javascript inspector
- [React Developer Tools] (https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
- [Robomongo 0.9.0 RC10] (https://robomongo.org/download)

## Instructions
1. `git clone https://github.com/alan-xie/cs50seminar-meteor-react.git`

2. Meteor.js Installation 
  - OSX
    * `curl https://install.meteor.com/ | sh`
  - Windows
    * [Installation](https://install.meteor.com/windows)

3. We need to install React dependencies that make our app work. In the `cs50seminar-meteor-react` directory, run this command in Terminal: `meteor npm install --save react react-dom react-addons-pure-render-mixin react-addons-transition-group react-addons-css-transition-group react-addons-linked-state-mixin react-addons-create-fragment react-addons-update react-addons-test-utils react-addons-perf`

4. Run `meteor` inside the `cs50seminar-meteor-react` directory!

5. Run `mongorestore --host 127.0.0.1 --port 3001 --db meteor dump/meteor` in the `cs50seminar-meteor-react` directory. If you receive an error, you may have to right-click each of your existing collections in Robomongo and select "Drop Collection." Then, rerun the `mongorestore` command.


## Useful commands
- `meteor`
  * In the Meteor app directory, runs the app
- `mongodump --host 127.0.0.1 --port 3001 --db meteor`
  * While `meteor` is running, dumps the entire database into `dump/meteor` in the current directory
- `mongorestore --host 127.0.0.1 --port 3001 --db meteor dump/meteor`
  * While `meteor` is running, restores a db from a dump in the format `dump/meteor` 
- `mongoexport --host 127.0.0.1 --port 3001 --db meteor --collection titles --fields 'title,theatrical_release,domestic_gross,poster_url'  --out titles.json`
  * While `meteor` is running, exports the collection called titles with a specific subset of fields to `titles.json`
- `mongoimport --host 127.0.0.1 --port 3001 --db meteor --collection titles --file titles.json`
  * While `meteor` is running, imports the file `titles.json` to the collection called titles

## Useful reading
- [React Component Lifecycle] (https://facebook.github.io/react/docs/component-specs.html)
- [Meteor.publish and Meteor.subscribe] (https://www.meteor.com/tutorials/react/publish-and-subscribe)