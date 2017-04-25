/**
 * Created by doru.muntean on 23/04/17.
 *
 * https://github.com/bignerdranch/developing-alexa-skills-solutions
 */

'use strict';
module.change_code = 1;
var _ = require('lodash');
var Alexa = require('alexa-app');
var skill = new Alexa.app('jenkins');
var JenkinsHelper = require('./jenkins_helper');

skill.launch(function(req, res) {
	let prompt = "Tell me the name of the job you want to start.";
	res.say(prompt).reprompt(prompt).shouldEndSession(false);
});

/**
 * Start a build in Jenkins
 * If a build/job name is NOT provided, Alexa will ask for one
 */
skill.intent('buildJenkinsJobIntent', {
		'slots': {
			'Jobname': 'AMAZON.LITERAL'
		},
		'utterances': ["{|build|deploy|start|run} {-|Jobname}", "{|build|deploy|start|run}", "{-|Jobname}"]
	},
	function(req, res) {
		let job = req.slot('Jobname');
		let reprompt = "Tell me the name of the job you would like me to start.";

		if (_.isEmpty(job)) {
			let prompt = "I didn't hear the job name. Tell me the name of the job you want to start.";
			res.say(prompt).reprompt(reprompt).shouldEndSession(false);
			return true;
		} else {
			let jenkinsBuildJob = new JenkinsHelper();
			//console.log(job);
			jenkinsBuildJob.buildJob(job).then(function(result) {
				//console.log(result);
				res.say(jenkinsBuildJob.buildResponse(result)).send();
			}).catch(function(err) {
				//console.log(err.statusCode);
				let prompt = "I'm sorry. I could't start the job. Jenkins responded with error code " + err.statusCode;
				res.say(prompt).shouldEndSession(true).send();
			});
			return false;
		}
	}
);

/**
 * Respond with the number of jobs present in Jenkins
 */
skill.intent('listJenkinsJobsIntent', {
	'slots': {},
	'utterances': ["{|how many} {|jobs} {|are}"]
},
	function(req, res) {
		let number_of_jobs = new JenkinsHelper();

		number_of_jobs.listJobs().then(function(result) {
			//console.log(result);
			res.say(number_of_jobs.listResponse(result)).shouldEndSession(true).send();
		}).catch(function(err) {
			//console.log(err.statusCode);
			let prompt = "I'm sorry. Jenkins responded with error code " + err.statusCode;
			res.say(prompt).shouldEndSession(true).send();
		});
		return false;
	}
);

module.exports = skill;
