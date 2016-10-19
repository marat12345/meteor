# Pilot HackHarvard Demo (Meteor.js + ReactJS + MongoDB)

### Requirements
- Meteor.js (MongoDB and other packages will be installed automatically when you run meteor)

### Preferable
- OSX makes things infinitely simpler 
- Google Chrome or another browser with a Javascript inspector
- [React Developer Tools] (https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
- [Robomongo 0.9.0 RC10] (https://robomongo.org/download)

## Instructions
1. `git clone https://github.com/alan-xie/hackharvard-pilot.git`

2. Meteor.js Installation 
  - OSX
    * `curl https://install.meteor.com/ | sh`
  - Windows
    * [Installation](https://install.meteor.com/windows)

4. Run `meteor` inside the `hackharvard-pilot` directory!


## Useful commands
- `meteor`
- `mongodump --host 127.0.0.1 --port 3001 --db meteor`
- `mongorestore --host 127.0.0.1 --port 3001 --db meteor dump/films`
- `mongoexport --host 127.0.0.1 --port 3001 --db meteor --collection titles --fields 'title,theatrical_release,domestic_gross,poster_url'  --out titles.json`
- `mongoimport --host 127.0.0.1 --port 3001 --db meteor --collection titles --file titles.json`

## Useful reading
- [React Component Lifecycle] (https://facebook.github.io/react/docs/component-specs.html)
- [Meteor.publish and Meteor.subscribe] (https://www.meteor.com/tutorials/react/publish-and-subscribe)