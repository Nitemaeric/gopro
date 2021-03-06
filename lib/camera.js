var when = require('when')
var poll = require('when/poll')
var request = require('request')
var sequence = require('when/sequence')

var cheerio = require('cheerio')
var utils = require('./utils')

var fsPath = require('path')
var _ = require('lodash')
var CameraStatus = require('./camera_status')

function Camera(ip, password, _requestImpl) {
	this._request = _requestImpl || request
	this._password = password
	this._apiUrl = 'http://'+ip
	this._webUrl = 'http://'+ip+':8080'
	this._mode = "not set";
	this._modes = {
			"video": "0",
			"photo": "1",
			"burst": "2",
			"timelapse": "3"
		
		}
	this._photoResolutions = {
			"11mp": "0",
			"8mp": "1",
			"5mpw": "2",
			"5mpm": "3"

		}
}

Camera.prototype._cameraApi = function(method, intParam) {
	return this._apiCall('camera', method, intParam)
}

Camera.prototype._bacpacApi = function(method, intParam) {
	return this._apiCall('bacpac', method, intParam)
}

Camera.prototype._apiCall = function(api, method, intParam) {
	var dfd = when.defer()
	var parameter = ''

	if (intParam !== undefined)
		parameter = '&p=%0' + intParam

	var url = [this._apiUrl, api, method].filter(function(n){return n!= undefined}).join('/') +
		'?t=' + this._password + parameter

	console.log(url)
	this._request(url, function(err, res, body) {
		if (err) return dfd.reject(err)
		return dfd.resolve(res)
	})

	return dfd.promise
}

Camera.prototype._statusApi = function(cmd) {
	var dfd = when.defer()

	var url = this._apiUrl + "/" + cmd + '?t=' + this._password

	console.log(url)
	this._request(url, function(err, res, body) {
		if (err) return dfd.reject(err)
		return dfd.resolve(res)
	})

	return dfd.promise
}

Camera.prototype.status = function() {
	return this._bacpacApi('se').then(function(res) {
		if (res.statusCode != 200)
			return when.reject('Error '+res.statusCode+': '+body)

		// help! @gopro tell us!
		var status = {
			ready: res.body[15].charCodeAt(0) === 1
		}

		for (var i=0; i < res.body.length; i++) {
			console.log('status byte '+i, res.body[i].charCodeAt(0))
		}

		return status
	})
}

Camera.prototype.translateData = function(item){
	var self = this;
	var func_result =  function(){
		return self._statusApi(item).then(function(data){
			var methods = CameraStatus[item];
			var result = {}
			for(var method in methods){
				var key = methods[method];

				var a = key['a'];
				var b = key['b'];

				var ans = utils.binStringToHex(data.body).slice(a, b).join("");
				var translate = key['translate'];

				result[method] = (translate != '_hexToDec') ? translate[ans] : parseInt(ans, 16);
			}
			return result;
		});
	}
	return func_result;
}

Camera.prototype.fullStatus = function() {
	var self = this;
	return this.status().then(function(data){
		if(data.ready){
			var args = []
			for(var item in CameraStatus){
				args.push(item);
			}

			var translateData = _.bind(self.translateData, self);
			data = _.map(args, translateData);

			return sequence(data).then(utils.objectify);
		}
		else{
			return {power: "off"}
		}
	});
}

Camera.prototype.whenReady = function() {
	var that = this

	return poll(
		that.status.bind(that),
		500,
		function(status) {
			return status.ready
		}
	)
}

Camera.prototype.powerOn = function() {
	return this._bacpacApi('PW', 1)
}

Camera.prototype.powerOff = function() {
	return this._bacpacApi('PW', 0)
}

Camera.prototype.startBeeping = function() {
	return this._cameraApi('LL', 1)
}

Camera.prototype.stopBeeping = function() {
	return this._cameraApi('LL', 0)
}

Camera.prototype.startCapture = function() {
	return this._cameraApi('SH', 1)
}

Camera.prototype.stopCapture = function() {
	return this._cameraApi('SH', 0)
}


Camera.prototype.setVideoMode = function() {
	return this._cameraApi('CM', 0)
}

Camera.prototype.setPhotoMode = function() {
	return this._cameraApi('CM', 1)
}

Camera.prototype.setBurstMode = function() {
	return this._cameraApi('CM', 2)
}

Camera.prototype.setTimelapseMode = function() {
	return this._cameraApi('CM', 3)
}

Camera.prototype.setHeadUp = function(){
	return this._cameraApi("UP", 0)
}

Camera.prototype.setHeadDown = function(){
	return this._cameraApi("UP", 1)
}

Camera.prototype.deleteLast = function() {
	return this._cameraApi('DL')
}

Camera.prototype.deleteAll = function() {
	return this._cameraApi('DA')
}

Camera.prototype.erase = function() {
	return this.deleteAll()
}

Camera.prototype.beepOff = function() {
	return this._cameraApi('BS', 0)
}

Camera.prototype.ls = function(path) {
	var dfd = when.defer()
	var url = this._webUrl + (path || '')
	var files = []

	this._request(url, function(e, res, body) {
		if (e || res.statusCode !== 200)
			return dfd.reject(e.stack || e || res.statusCode)

		var $ = cheerio.load(body)

		$('table tbody tr').each(function() {
			var name = $(this).find('a.link').attr('href')
			var date = $(this).find('span.date').text()
			var size = $(this).find('span.size').text()
			files.push({
				name: name,
				isFolder: name[name.length-1] === '/',
				time: new Date(date),
				size: size !== '-' ? size : null
			})
		})

		dfd.resolve(files)
	})

	return dfd.promise
}

Camera.prototype.get = function(path) {
	var url = this._webUrl + (path || '')
	return when.resolve(this._request(url))
}

//Set mode to one of this._modes
Object.defineProperty(Camera.prototype, "mode", {
  enumerable: true,
  configurable: true,
	get: function(){return this._mode},
	set: function( s ){
		var ret;
		console.log("attempting to set mode "+s)
		if( this._modes.hasOwnProperty( s ) ){
			this._mode = s;
			ret = this._cameraApi('CM', this._modes[ s ]);
		}else{
			ret = "Invalid mode, must be one of "+Object.keys(this._modes)
		}
		return ret
	}

});

Object.defineProperty(Camera.prototype, "photoResolution", {
  enumerable: true,
  configurable: true,
	get: function(){return this._photoResolution},
	set: function( s ){
		var ret;
		console.log("attempting to set mode "+s)
		if( this._photoResolutions.hasOwnProperty(s) ){
			this._photoResolution = s;
			ret = this._cameraApi('PR', this._photoResolutions[ s ]);
		}else{
			ret = "Invalid mode, must be one of "+Object.keys(this._photoResolutions)
		}
		return ret
	}

});

exports.Camera = Camera
