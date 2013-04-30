function AntieFramework(configPath) {

	var _configPath;
	var fs = require('fs');

	if (!(this instanceof AntieFramework)) {
		return new AntieFramework(config);
	}

	/**
	 * The class constructor.
	 *
	 * Sets the config path used to locate pageStrategy elements, defaults to the current working directory if no config
	 * path is provided.
	 * @param string|bool $configPath The directory path to the antie config directory.
	 */
	var __construct = function(configPath) {
		_configPath = (configPath === "undefined") ? process.cwd() + "/" : process.cwd() + "/" + configPath;
	}
	/**
	 * Returns the doctype required by this device. The doctype is used in the returned HTML page.
	 *
	 * @param object $deviceConfig The device configuration information for the device that made the request.
	 * @return string The doctype associated with this device.
	 */
	var getDocType = function(deviceConfig) {
		var devicePageStrategy = deviceConfig.pageStrategy;
		return getPageStrategyElement(devicePageStrategy, 'doctype', '<!DOCTYPE html>');
	}
	/**
	 * Returns The mimetype that needs to be associated with the HTTP response for this device.
	 *
	 * @param object $deviceConfig The device configuration information for the device that made the request.
	 * @return string The HTTP mimetype required by this device. If this value is not found in the page strategy
	 * default return value is 'text/html'.
	 */
	var getMimeType = function(deviceConfig) {
		var devicePageStrategy = deviceConfig.pageStrategy;
		return getPageStrategyElement(devicePageStrategy, 'mimetype', 'text/html');
	}
	/**
	 * Returns the root HTML tag to be used in the HTML response.
	 *
	 * @param object $deviceConfig The device configuration information for the device that made the request.
	 * @return string The root HTML element required by this device. If this value is not found in the page strategy
	 * default return value is <html>.
	 */
	var getRootHtmlTag = function(deviceConfig) {
		var devicePageStrategy = deviceConfig.pageStrategy;
		return getPageStrategyElement(devicePageStrategy, 'rootelement', '<html>');
	}
	/**
	 * Returns any extra HTML content that the device requires to be placed in the HTML <head>.
	 *
	 * @param object $deviceConfig The device configuration information for the device that made the request.
	 * @return string The HTML content to be placed in the HTML <head>.
	 */
	var getDeviceHeaders = function(deviceConfig) {
		var devicePageStrategy = deviceConfig.pageStrategy;
		return getPageStrategyElement(devicePageStrategy, 'header', "");
	}
	/**
	 * Returns any extra HTML content that the device requires to be placed in the HTML <body>.
	 *
	 * @param object $deviceConfig The device configuration information for the device that made the request.
	 * @return string The HTML content to be placed in the HTML <body>.
	 */
	var getDeviceBody = function(deviceConfig) {
		var devicePageStrategy = deviceConfig.pageStrategy;
		return getPageStrategyElement(devicePageStrategy, 'body', "");
	}
	/**
	 * Replaces whitespace with underscores and lowercases all uppercase characters. Used to compare strings where
	 * capitalization is not guaranteed.
	 *
	 * @static
	 * @param string $value The value to be normalized.
	 * @return string The normalized value.
	 */
	var normaliseKeyNames = function(value) {
		return value.replace(/[^a-zA-Z0-9]/gi, "_").toLowerCase();
	}
	/**
	 * Returns a JSON formatted device configuration from the file system
	 *
	 * @param $key The unique device identifier, typically brand-model.
	 * @param $type The $_configPath sub-directory where the device configuration is located.
	 * @return string of JSON. Empty string if not found.
	 */
	var getConfigurationFromFilesystem = function(key, type) {
		var configurationJSON = {};
		var configurationPath = [_configPath, type, "/", key, ".json"].join("");
		configurationJSON = JSON.parse(fs.readFileSync([configurationPath].join("")).toString());
		return configurationJSON;
	}
	/**
	 * Returns an element (property) of the page strategy or the provided default value.
	 *
	 * The page strategy is used to determine the value of various properties to be used in the HTTP response depending
	 * on the class of device. This is required to support multiple specification standards such as HTML5, PlayStation 3,
	 * HBBTV and Maple.
	 *
	 * The page strategy elements are contained in a directory structure located in $this->_configpath/pagestrategy.
	 *
	 * Typical page strategy elements include: the HTTP header mimetype property, HTML doctype, HTML head, HTML root
	 * element & HTML body. For example the HTML <head> and <body> may need to contain vendor specific code/markup.
	 *
	 * @param string $pageStrategy The page strategy used by this device.
	 * @param string $element The page strategy property to return (Sub-directory of $this->_configpath/pagestrategy
	 * directory).
	 * @param string $default The default value to return if the page strategy does not contain the requested element.
	 * @return string An element (property) of the page strategy or the default value.
	 */
	var getPageStrategyElement = function(pageStrategy, element, defaultValue) {
		var returnFile = "";
		try {
			returnFile = fs.readFileSync([ _configPath, "pagestrategy/", pageStrategy, "/", element].join(""));
		} catch (e) {
			returnFile = defaultValue
		}
		return returnFile;
	}
	/**
	 * Returns a device configuration that includes any overridden properties defined in the supplied patch object.
	 *
	 * @static
	 * @param object $original The device configuration information for the device that made the request.
	 * @param object $patch Device configuration override properties.
	 * @return object The original device configuration along with any overridden properties as defined in the patch
	 * object.
	 */
	var mergeConfigurations = function(original, patch) {
		var key, hashOwn = Object.prototype.hasOwnProperty;
		
		for (key in patch) {
			if (hashOwn.call(key)) {
				original[key] = mergeConfigurations(original[key], patch[key]);
			} else {
				original[key] = patch[key];
			}
		}
				
		return original;
	}
	__construct(configPath);

	return {
		normaliseKeyNames : normaliseKeyNames,
		mergeConfigurations : mergeConfigurations,
		getPageStrategyElement : getPageStrategyElement,
		getConfigurationFromFilesystem : getConfigurationFromFilesystem,
		getDeviceBody : getDeviceBody,
		getDeviceHeaders : getDeviceHeaders,
		getRootHtmlTag : getRootHtmlTag,
		getMimeType : getMimeType,
		getDocType : getDocType
	};
}

module.exports = AntieFramework
