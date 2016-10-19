import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import { Session } from 'meteor/session';
import ReactDOM from 'react-dom';
import AccountsUIWrapper from '../components/AccountsUIWrapper.jsx';
import ActorRevChart from '../components/Actor_RevChart.jsx';
import { Titles } from '/imports/api/films.js';
import { People } from '/imports/api/films.js';

class App extends Component {

	// Essentially a class init, inherits props from default Component
	constructor(props) {
		super(props);

		// Initialize states
		this.state = {
			readyToViz: false,
			mounted: false,
		};
	}

	// Handling prior to the component mounting
	componentWillMount() {

		// A Meteor method! We want to get the list of names in /private/names.csv
		// All Meteor methods are asynchronous and allow callbacks  
		Meteor.call("get_names", function(err,res) {
			// The method returns the list of names in the variable 'res'
			// We want to separate the list based on newline characters
			var all_people = res.split('\n');
			// We save the list of names in a Session variable
			Session.set("all_people", all_people);
			
			// Use jQuery autocomplete to suggest names
			// This is installed to Meteor in a separate library!
			$(".auto").autocomplete({
				source: function(request, response) {
					// We only show 10 results max to avoid cluttering the UI
					var results = $.ui.autocomplete.filter(all_people, request.term);
					response(results.slice(0, 10));
				},
				// The dropdown shows up after .2 seconds and requires 3 chars
				delay:200,
				minLength: 3
			});
		});
	}

	// Handling after component mounting
	componentDidMount() {
		// Example of changing Meteor state
		this.setState({mounted: true});
	}

	// Executed upon form submit and interacts with Meteor's instance of Mongo to get data
  	handleSubmit(event) {
  		// Makes sure we don't clear the form just yet
  		event.preventDefault();

	    // Find the text field via the React ref
	    const input_person = ReactDOM.findDOMNode(this.refs.textInput).value.trim();
	    
	    // Save the name as a Session variable that we can access outside this method
	    Session.set("input_person", input_person);

	    // Clear form (we don't have to do this but it's neat)
	    ReactDOM.findDOMNode(this.refs.textInput).value = '';

	    // Initialize an autorun handle so we can run this block asynchronously 
	    // We also have the ability to stop the Autorun loop upon meeting a condition
	    // And then we can run some callback magic (see below onStop method)
		const trackerHandle = Tracker.autorun(function() {

			// We attach a handle to the Meteor.subscribe call which asks our DB for data
			// Meteor.subscribe is paired with Meteor.publish in /imports/api/films.js
			// Above, we've imported Titles and People so we can use them here
			// See each Meteor.publish statement for arguments Meteor.subscribe takes
		    const peopleHandle = Meteor.subscribe('people', input_person, function() {

		    	// Meteor.subscribe is asynchronous and gets a callback function
		    	// We can console.log the person we're looking for
		    	// People.findOne is a Mongo method we can call 
		    	// It's important to note this People is in Meteor's Minimongo instance in the browser
		    	// This is NOT the MongoDB instance running on localhost:3001
		    	// Check your inspector to see this printout
				console.log(People.findOne({'name': Session.get("input_person")}));
			});

			// When Meteor.subscribe is ready with our data, we can do more stuff
			// This will get triggered at some point because of Tracker.autorun
			if (peopleHandle.ready()) {

				// We can get the result from Minimongo (as per the above console.log statement)
				var result = People.findOne({'name': Session.get("input_person")});

				// Access that person's "films" field
				var films = result["films"];

				// Standard for loop iterating through list of films
				for (var i = 0; i < films.length; i++) {

					// We do something similar to above, but this time we Meteor.subscribe to titles
					// We get individual title information from MongoDB and store it in Minimongo
					// We also have a callback here
				    const titleHandle = Meteor.subscribe('titles', films[i], function () {
				    	
				    	// We can use the same findOne method to find each film
				    	// Returns the first film if duplicate names
				    	console.log(Titles.findOne({'title': films[i]}));
				    	
				    	// After getting each title, we want to know if this is the final movie
				    	// We check the number of titles in Minimongo memory relative to the length of person's films
				    	if (Titles._collection.find().count() == Object.keys(films).length) {

				    		// If we have all this person's films, we stop the trackerHandle from line 73
				    		// This stops Autorun
			    			trackerHandle.stop();
			    		}
				    });

				    // Similar check to above to determine whether we should stop Tracker.autorun
				    if (titleHandle.ready()) {	
			    		if (Titles._collection.find().count() == Object.keys(films).length) {
			    			trackerHandle.stop();
			    		}
				    
				    }
				} 
			}
		});

		// Callback on terminating the autorun loop
		// We have to bind "this" to this callback because it's not in scope
		trackerHandle.onStop(function() {
			// We call prepare function (below) on an individual's name
			this.prepare(People._collection.findOne({"name" : input_person}));
			this.setState({"readyToViz" : true});
		}.bind(this));
	}

	// Helper function that prepares data for visualization in d3
	// Accepts an actor's name, creates a Session variable
	prepare(data) {
		// Helper function rounds a number to two digits
		function roundToTwo(num) {    
		    return +(Math.round(num + "e+2")  + "e-2");
		}

		// Initialize dicts for processing filmography
		var film_dates = {}
		var film_revenues = {}
		var film_posters = {}
		var query = undefined;

		// We get each Title in Minimongo and get data from it
		for (i = 0; i < data["films"].length; i++) {
			query = Titles.findOne({"title": data["films"][i]});
			try {
				film_dates[data["films"][i]] = query["theatrical_release"];
				film_revenues[data["films"][i]] = query["domestic_gross"] / 1000000;
				film_posters[data["films"][i]] = query["poster_url"];
			}
			catch(error) {
				film_posters[data["films"][i]] = "";
			}
		}

		// Construct data structure for revenues graph, d3 prefers a list of dicts
		var revenue_metaset = []
		var dset_entry = {date: '', revenues: 0, film: '', img: ''};
		var date_keys = Object.keys(film_dates);
		for (var i = 0; i < date_keys.length; i++) {
			var temp = new Date(film_dates[date_keys[i]]);
		    dset_entry.date = temp;
		    dset_entry.film = date_keys[i];
		    dset_entry.img = film_posters[date_keys[i]];
		    revenue_metaset[i] = dset_entry;
		    dset_entry = {};
		}
		var revenue_keys = Object.keys(film_revenues);
		for (var i = 0; i < revenue_keys.length; i++) {
		    revenue_metaset[i].revenues = roundToTwo(+film_revenues[revenue_keys[i]]);
		    dset_entry = {};
		}
		revenue_metaset.sort(function(a,b){

			// Turn your strings into dates, and then subtract them
			// to get a value that is either negative, positive, or zero.
			return new Date(b.date) - new Date(a.date);
		});

		// Save this processed data in a Session variable
		Session.set("revenue_metaset", revenue_metaset.reverse());
	}
 
	render() {
		return (
			<div className="container">
				{/* Comments in JSX look like this */}
				<header>
					<AccountsUIWrapper />
					<div className="box">
						<div className="container-0">
							<div className='container-1'>
								<img src='Pilot.png'/>
							</div>
							<div>
								{/* Ternary condition will conditionally render different blocks. 
								"A ? B : C" is the same thing as "if A then B else C"  
								In this case, we don't let users access the search bar without logging in. */}
								{ this.props.currentUser ? 
								<div className='container-2'>
									<span id="icon"><i className="fa fa-search"></i></span>
									<form className="new-query" onSubmit={this.handleSubmit.bind(this)} >
										<input className="auto" type="input" id="search" ref="textInput"/>
						            </form>
					            </div> : 
					            <div> 
					            	<p>Please log in first!</p>
					            </div> }
					        </div>
				        </div>
			        </div>
				</header>
				{/* We don't even render this unless we're sure that we have data */}
				{this.state.readyToViz ?
					<div className="vis-container">
						<table className="visTable">
						<tbody>
							<tr>
								<td>
									<div className="vis2">
										{/* React component! We can pass data into the component as props. 
										We stored it above as a Session variable so we could access it here. */}
										<ActorRevChart data={Session.get("revenue_metaset")} actor={Session.get("input_person")} /> 
									</div>
								</td>
							</tr>
						</tbody>
						</table>
					</div> : 
				'' }
			</div>        
		);
	}
};

App.propTypes = {
	currentUser: PropTypes.object,
};

export default createContainer(() => { 
   	return {
		currentUser: Meteor.user()
	};
}, App);