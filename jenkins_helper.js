/**
 * Created by doru.muntean on 23/04/17.
 */


'use strict';
var _ = require('lodash');
var requestPromise = require('request-promise');
var http_success = [ 200, 201 ];

/**
 * Your Jenkins address goes here
 * @type {string}
 */
var ENDPOINT = 'http://79.115.45.174:8080';

function JenkinsHelper() {}

JenkinsHelper.prototype.buildJob = function(jobName) {

	var encodeJobName = encodeURI(jobName);

	var options = {
		method: 'POST',
		// hostname: ENDPOINT,
		// port: 8080,
		// path: "/job/" + encodeJobName + "/build",
		uri: ENDPOINT + "/job/" + encodeJobName + "/build",
		//json: true,
		resolveWithFullResponse: true,
	};
	return requestPromise(options);
};


JenkinsHelper.prototype.listJobs = function() {

	var options = {
		method: 'GET',
		uri: ENDPOINT + "/api/json",
		json: true,
		// uri: "http://79.115.45.174:8080/api/json",
		resolveWithFullResponse: true,
	};
	return requestPromise(options);
};

JenkinsHelper.prototype.listResponse = function(statusObject) {
	console.log(statusObject);
	if (http_success.indexOf(statusObject.statusCode) > -1){
		//count the number of jobs from the response
		let template = _.template('There are ${number_of_jobs} jobs in jenkins.');
		return template({
			number_of_jobs: statusObject.body.jobs.length,
		});
	}
	else {
		//status code received from Jenkins is not one of the http_success
		let template =_.template('I\'m sorry. I could\'t get that information. I\'ve received the status code ${status} from jenkins');
		return template({
			status: statusObject.statusCode,
		});
	}
};


JenkinsHelper.prototype.buildResponse = function(statusObject) {
	if (http_success.indexOf(statusObject.statusCode) > -1){
	// if(statusObject.statusCode === 201) {
		var template = _.template('Ok, I\'ve started the job. '); //I\'ve received the status code ${status} from jenkins');
		return template({
		status: statusObject.statusCode,
	});
	} else {
		//status code received from Jenkins is not one of the http_success
		var template =_.template('Sorry, I could\'t start the job. I\'ve received the status code ${status} from jenkins');
		return template({
		status: statusObject.statusCode,
		});
	}
};

module.exports = JenkinsHelper;
