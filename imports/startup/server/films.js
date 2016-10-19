import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
export const Titles = new Mongo.Collection('titles');
export const People = new Mongo.Collection('people');

// This ensures that this only executes server-side
// However, if you place this chunk in a client-side file, people can see it!
// Don't put API keys here or anything sensitive
if (Meteor.isServer) {
	// Meteor.publish defines each collection as a string (name)
	// It can take a number of arguments we use in the actual search
	Meteor.publish('titles', function titlesPublication(title) {
		
		// Check helps with input validation
		check(title, String);

		// This accesses the real MongoDB database on localhost:3001 
		// We return a subset of the data 
		return Titles.find({'title':title}, 
			{fields: {
				"title": 1,
				"theatrical_release": 1,
				"domestic_gross": 1,
				"poster_url": 1
			}});
	});

	Meteor.publish('people', function peoplePublication(person) {
		check(person, String);
		return People.find({'name': person},
			{fields: {
				"name": 1, 
				"films":1
			}});
	});

	// Define all methods here using this format
	// Essentially server-side methods that can call an API or access local files
	Meteor.methods({
		"get_names" () {
			return Assets.getText('names.csv');
		},
	});
}