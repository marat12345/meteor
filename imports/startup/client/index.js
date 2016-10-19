import React from 'react';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';
import App from '/imports/ui/layouts/App.jsx';
import '/imports/startup/client/accounts-config.js';

Meteor.startup(() => {
	render(<App />, document.getElementById('render-target'));
});