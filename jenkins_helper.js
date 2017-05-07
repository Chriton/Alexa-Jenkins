/**
 * Created by doru.muntean on 23/04/17.
 *
 */


'use strict';
var Promise = require("bluebird");
// var _ = Promise.promisifyAll(require("lodash"));

var _ = require('lodash');
var requestPromise = require('request-promise');
var http_success = [ 200, 201 ];
var prettyMs = require('pretty-ms');
var moment = require('moment');

/**
 * Your Jenkins address goes here
 * @type {string}
 */
var ENDPOINT = 'http://86.127.228.196:8080';
// var ENDPOINT = 'http://47eb376a.ngrok.io';

function JenkinsHelper() {}

/**
 * Send a request to the Jenkins API to start a job
 * @param jobName - the name of the job you want to build
 * @returns {*}
 */
JenkinsHelper.prototype.buildJob = function(jobName) {
	let encodeJobName = encodeURI(jobName);

	let options = {
		method: 'POST',
		uri: ENDPOINT + "/job/" + encodeJobName + "/build",
		//json: true,
		resolveWithFullResponse: true,
	};
	return requestPromise(options);
};

/**
 * Format the response from the buildJob function
 * @param statusObject
 * @returns {*}
 */
JenkinsHelper.prototype.buildJobResponse = function(statusObject) {
    if (http_success.indexOf(statusObject.statusCode) > -1) {
        let template = _.template("Ok, I've started the job ");
        return template({
            status: statusObject.statusCode,
        });
    } else {
        //status code received from Jenkins is not one of the http_success
        let template =_.template("Sorry, I could't start the job. I've received the status code ${status} from jenkins");
        return template({
            status: statusObject.statusCode,
        });
    }
};


JenkinsHelper.prototype.lastBuild = function(jobName) {
	let encodeJobName = encodeURI(jobName);

	let options = {
		method: 'POST',
		uri: ENDPOINT + "/job/" + encodeJobName + "/lastBuild/api/json",
		json: true,
		resolveWithFullResponse: true,
	};
	return requestPromise(options);
};


JenkinsHelper.prototype.lastBuildResponse = function(statusObject) {

	if (http_success.indexOf(statusObject.statusCode) > -1) {

		// let template = _.template("The last job has a status of ${result}. It took ${time} for this job to finish. The job number is ${number}.");
		// return template({
		// 	result: statusObject.body.result.toLowerCase(),
		// 	time: prettyMs(statusObject.body.duration, {verbose: true}),
		// 	number: statusObject.body.number,
		// })

		return new Promise(function(resolve, reject) {

			let result = statusObject.body.result.toLowerCase();
			let time = prettyMs(statusObject.body.duration, {verbose: true});
			let number = statusObject.body.number;
			let date = moment(statusObject.body.timestamp).format("dddd, D MMMM YYYY");
			let hour = moment(statusObject.body.timestamp).format("hh:mm");
			// let when = moment.unix(statusObject.body.timestamp).format("LLLL");

			/* everything turned out fine */
			if(result && time && number)
			resolve("The status of the last build is " +  result + ". It took " + time + " for this job to finish. The job number is " + number + ". The build date is "+ date + " at " + hour);

			else {
				reject(Error("I cannot communicate with Jenkins."));
			}
		});

	} else {
		//status code received from Jenkins is not one of the http_success
		let template =_.template("I'm sorry. I could't get that information. I've received the status code ${status} from jenkins");
		return template({
			status: statusObject.statusCode,
		});
	}
};


/**
 * Request the number of jobs from the Jenkins API
 * @returns {*}
 */
JenkinsHelper.prototype.numberOfJobs = function() {

	let options = {
		method: 'GET',
		uri: ENDPOINT + "/api/json",
		json: true,
		resolveWithFullResponse: true,
	};
	return requestPromise(options);
};

/**
 * Extract and format the number of Jenkins jobs received from the numberOfJobs function
 * @param statusObject - the json response from the numberOfJobs function
 * @returns {*}
 */
JenkinsHelper.prototype.numberOfJobsResponse = function(statusObject) {
	//console.log(statusObject);
	if (http_success.indexOf(statusObject.statusCode) > -1) {
		let template = _.template("There are ${number_of_jobs} jobs in jenkins.");
		return template({
			number_of_jobs: statusObject.body.jobs.length,
		});
	} else {
		//status code received from Jenkins is not one of the http_success
		let template =_.template("I'm sorry. I could't get that information. I've received the status code ${status} from jenkins");
		return template({
			status: statusObject.statusCode,
		});
	}
};

module.exports = JenkinsHelper;
