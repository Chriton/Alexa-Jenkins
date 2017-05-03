/**
 * Created by doru.muntean on 23/04/17.
 *
 * https://github.com/bignerdranch/developing-alexa-skills-solutions
 * https://github.com/alexa-js/alexa-app#schema-and-utterances
 * https://github.com/alexa-js/alexa-utterances
 */

'use strict';
module.change_code = 1;
var _ = require('lodash');
var Alexa = require('alexa-app');
var skill = new Alexa.app('jenkins');
var JenkinsHelper = require('./jenkins_helper');

skill.dictionary = {
	"job_names": ["smoke test", "regression test", "ubs campaign"],
	"build_synonym": ["build", "deploy", "start", "run"]
};



skill.intent('AMAZON.StopIntent',
	{},
	function(req, res) {
		res.say("Ok, good bye.").shouldEndSession(true).send();
	}
);

skill.intent('AMAZON.CancelIntent',
	{},
	function(req, res) {
		res.say("Ok, good bye.").shouldEndSession(true).send();
	}
);

skill.intent('AMAZON.HelpIntent',
	{},
	function(req, res) {
		res.say("I can ask Jenkins to build a job or tell you how many jobs Jenkins has. Which one would you like me to do?").shouldEndSession(false).send();
	}
);

skill.launch(function(req, res) {
	let prompt = "Hi! I can help you build jenkins jobs. Please tell me the name of the jenkins job you want me to start!";
	res.say(prompt).reprompt(prompt).shouldEndSession(false);
});

/**
 * Start a build in Jenkins
 * If a build/job name is NOT provided, Alexa will ask for one
 */
skill.intent('buildJobIntent', {
		"slots": {
			"JOBNAME": "AMAZON.LITERAL"
		},
		// "utterances": ["{|build|deploy|start|run}", "{|build|deploy|start|run} {-|JOBNAME}", "{-|JOBNAME}"]
		//todo - echo this - https://github.com/alexa-js/alexa-app#schema-and-utterances
		"utterances": ["{build_synonym} {-|JOBNAME}", "{build_synonym} {the |} {job_names|JOBNAME}", "{build_synonym}", "{-|JOBNAME}"]
	},
	function(req, res) {
		let job = req.slot('JOBNAME');
		let reprompt = "Please tell me the name of the job you would like me to start";

		if (_.isEmpty(job)) {
			// let prompt = "I didn't hear the job name. Tell me the name of the job you want to start.";
			let prompt = "What job?";
			res.say(prompt).reprompt(reprompt).shouldEndSession(false);
			return true;
		} else {
			let jenkinsBuildJob = new JenkinsHelper();
			//console.log(job);
			jenkinsBuildJob.buildJob(job).then(function(result) {
				//console.log(result);
				res.say(jenkinsBuildJob.buildJobResponse(result)).send();
			}).catch(function(err) {
				//console.log(err.statusCode);
				let prompt = "I'm sorry. I could't start the job " + job + ". Jenkins responded with error code " + err.statusCode;
				res.say(prompt).shouldEndSession(true).send();
			});
		return false;
		}
	}
);

/**
 * Respond with the number of jobs present in Jenkins
 */
skill.intent('numberOfJobsIntent', {
	"slots": {},
	//todo - echo this - https://github.com/alexa-js/alexa-app#schema-and-utterances
	"utterances": ["{how many|about} {number |}{|jobs} {|are}"]
},
	function(req, res) {
		let number_of_jobs = new JenkinsHelper();

		number_of_jobs.numberOfJobs().then(function(result) {
			//console.log(result);
			res.say(number_of_jobs.numberOfJobsResponse(result)).shouldEndSession(true).send();
		}).catch(function(err) {
			//console.log(err.statusCode);
			let prompt = "I'm sorry. Jenkins responded with error code " + err.statusCode;
			res.say(prompt).shouldEndSession(true).send();
		});
		return false;
	}
);

module.exports = skill;
