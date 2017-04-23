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
	var prompt = 'Tell me the name of the job you want to start.';
	res.say(prompt).reprompt(prompt).shouldEndSession(false);
});


skill.intent('buildJenkinsJobIntent', {
		'slots': {
			// 'Jobname': 'JOBS'
			'Jobname': 'AMAZON.LITERAL'
		},
		'utterances': ["{|build|deploy|start|run} {-|Jobname}", "{|build|deploy|start|run}", "{-|Jobname}"]
	},
	function(req, res) {
		var job = req.slot('Jobname');
		var reprompt = 'Tell me the name of the job you would like me to start.';

		if (_.isEmpty(job)) {
			var prompt = 'I didn\'t hear the job name. Tell me the name of the job you want to start.';
			res.say(prompt).reprompt(reprompt).shouldEndSession(false);
			return true;
		} else {
			var jenkinsBuildJob = new JenkinsHelper();
			console.log(job);
			jenkinsBuildJob.buildJob(job).then(function(result) {
				console.log(result);
				res.say(jenkinsBuildJob.buildResponse(result)).send();
			}).catch(function(err) {
				console.log(err.statusCode);
				var prompt = 'I\'m sorry. I could\'t start the job. Jenkins responded with error code ' + err.statusCode; // 'The error message is: ' + err.message;
				// res.say(prompt).reprompt(reprompt).shouldEndSession(false).send();
				res.say(prompt).shouldEndSession(true).send();
			});
			return false;
		}
	}
);


skill.intent('listJenkinsJobsIntent', {
	'slots': {},
	'utterances': ["{|how many} {|jobs} {|are}"]
},
	function(req, res) {
		var number_of_jobs = new JenkinsHelper();

		number_of_jobs.listJobs().then(function(result) {
			console.log(result);
			// res.say(number_of_jobs.listResponse(result)).send();
			res.say(number_of_jobs.listResponse(result)).shouldEndSession(true).send();
		}).catch(function(err) {
			console.log(err.statusCode);
			var prompt = 'I\'m sorry. Jenkins responded with error code ' + err.statusCode;
			res.say(prompt).shouldEndSession(true).send();
		});
		return false;
	}
);



module.exports = skill;
