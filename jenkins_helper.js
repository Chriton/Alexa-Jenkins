/**
 * Created by doru.muntean on 23/04/17.
 *
 */


'use strict';
var _ = require('lodash');
var requestPromise = require('request-promise');
var http_success = [ 200, 201 ];


/**
 * Your Jenkins address goes here
 * @type {string}
 */
var ENDPOINT = 'http://86.127.228.196:8080';

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
