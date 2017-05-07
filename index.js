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


skill.launch(function(req, res) {
	req.getSession().set("question", "buildJob");
	let prompt = "Hi! please tell me the name of the Jenkins job you want me to start!";
	res.say(prompt).reprompt(prompt).shouldEndSession(false);
});


skill.intent('AMAZON.HelpIntent', {

	},
	function(req, res) {

	let session = req.getSession();
	let help = session.get("question");

		switch (help) {

			case "buildJob":
				req.getSession().set("question", "buildJob");
				res.say("To start a Job you have to tell me the name of it! What is the name of the job?").shouldEndSession(false).send();
				break;

			case "lastBuild":
				req.getSession().set("question", "lastBuild");
				res.say("To give you information about the last build, you have to give me the name of the job! What is the name of the job?").shouldEndSession(false).send();
				break;

			default:
				res.say("I can ask Jenkins to build a job or tell you how many jobs Jenkins has. Which one would you like me to do?")
					.card({
						type: "Standard",
						title: "Using this skill", // this is not required for type Simple
						// text: "Examples",
						text: "You can say things like:\nAlexa, tell Jenkins to start the smoke test\nAlexa, ask Jenkins ho many jobs does it have\nAlexa, tell Jenkins to deploy UBS Campaign"
					}).shouldEndSession(false).send();
		}
	//session.clear("question");
	}
);

skill.intent('AMAZON.StopIntent', {

	},
	function(req, res) {
		res.say("Ok, Good-bye.").shouldEndSession(true).send();
	}
);

skill.intent('AMAZON.CancelIntent', {

	},
	function(req, res) {
		res.say("Ok, Good-bye.").shouldEndSession(true).send();
	}
);

/**
 * Start a build in Jenkins
 * If a build/job name is NOT provided, Alexa will ask for one
 */
skill.intent('buildJobIntent', {
		"slots": {
			"BUILD_JOB_NAME": "JOB_NAMES"
		},
		/* "utterances": ["{|build|deploy|start|run}", "{|build|deploy|start|run} {-|BUILD_JOB_NAME}", "{-|BUILD_JOB_NAME}"] */
		/* todo - echo this - https://github.com/alexa-js/alexa-app#schema-and-utterances */
		/* "utterances": ["{build_synonym} {-|BUILD_JOB_NAME}", "{build_synonym} {the |} {job_names|BUILD_JOB_NAME}", "{build_synonym}", "{-|BUILD_JOB_NAME}"] */
		"utterances": [ "{build_synonym} {the |} {-|BUILD_JOB_NAME}", "{build_synonym}" ]
	},
	function(req, res) {

		req.getSession().set("question", "buildJob");
		let job = req.slot('BUILD_JOB_NAME');
		let reprompt = "Please tell me the name of the Job you would like to start!";

		if (_.isEmpty(job)) {

			let prompt = "What job do you want to start?";
			res.say(prompt).reprompt(reprompt).shouldEndSession(false).send();
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


skill.intent('lastBuildIntent', {
	"slots": {
        "LAST_JOB_NAME": "JOB_NAMES"
	},
	"utterances": [ "about the last build", "about the last {result|results}", "about the last {build|result|results} {for |}{of |}{the |}{-|LAST_JOB_NAME}", "about {the |} {-|LAST_JOB_NAME} last {build|result|results}" ]
	},
	function(req, res) {

		req.getSession().set("question", "lastBuild");
		let job = req.slot('LAST_JOB_NAME');
		let reprompt = "Please tell me the name of the Job for which you want the last build information!";

		if (_.isEmpty(job)) {

			let prompt = "For what job you want the information?";
			res.say(prompt).reprompt(reprompt).shouldEndSession(false).send();
			return true;
		} else {
			let last_build = new JenkinsHelper();
			last_build.lastBuild(job).then(function(result) {
					// res.say(last_build.lastBuildResponse(result)).shouldEndSession(true).send();
				last_build.lastBuildResponse(result).then(function(result){
					res.say(result).shouldEndSession(true).send();
				});
				}).catch(function(err) {
					let prompt = "I'm sorry. I couldn't get the last build information for job " + job + ". Jenkins responded with error code " + err.statusCode;
					res.say(prompt).shouldEndSession(true).send();
					}
				);
		return false;
		}
	}
);



skill.intent('multipleIntent', {
	"slots": {
		"MULTIPLE_JOB_NAME": "JOB_NAMES"
	},
		"utterances": [ "{-|MULTIPLE_JOB_NAME}" ]
	},
	function(req, res) {

	let session = req.getSession();
	let context = session.get("question");
	let job = req.slot('MULTIPLE_JOB_NAME');

		switch (context) {

			case "lastBuild":

				let last_build = new JenkinsHelper();

				last_build.lastBuild(job).then(function(result) {

					last_build.lastBuildResponse(result).then(function(result){
						res.say(result).shouldEndSession(true).send();
					});

				}).catch(function(err) {
						let prompt = "I'm sorry. There was a problem." + err.statusCode;
						res.say(prompt).shouldEndSession(true).send();
					}
				);
				return false;

				break;

			case "buildJob":

				let jenkinsBuildJob = new JenkinsHelper();
				//console.log(job);
				jenkinsBuildJob.buildJob(job).then(function(result) {
					//console.log(result);
					res.say(jenkinsBuildJob.buildJobResponse(result)).shouldEndSession(true).send();
				}).catch(function(err) {
					//console.log(err.statusCode);
					let prompt = "I'm sorry. I could't start the job " + job + ". Jenkins responded with error code " + err.statusCode;
					res.say(prompt).shouldEndSession(true).send();
				});
				return false;

				break;

			default:
				//for when user says: ask jenkins smoke test
				res.say("I can ask Jenkins to build a job or tell you how many jobs Jenkins has. Which one would you like me to do?")
					.card({
						type: "Standard",
						title: "Using this skill", // this is not required for type Simple
						// text: "Examples",
						text: "You can say things like:\nAlexa, tell Jenkins to start the smoke test\nAlexa, ask Jenkins ho many jobs does it have\nAlexa, tell Jenkins to deploy UBS Campaign"
					}).shouldEndSession(false).send();
				return true;
		}
	}
);

/**
 * Respond with the number of jobs present in Jenkins
 */
skill.intent('numberOfJobsIntent', {
        "slots": {},
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


// skill.error = function(exception, req, res) {
//	res.say("Sorry, something bad happened");
// };

// skill.sessionEnded(function(req, res) {
//	TODO
// });


module.exports = skill;
