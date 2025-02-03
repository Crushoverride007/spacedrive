const { withXcodeProject } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * @typedef {Object} XcodeProject
 * @property {Function} pbxGroupByName - Gets a PBX group by name
 * @property {Function} findPBXGroupKey - Finds PBX group key
 * @property {(filePath: string, target?: string | null, groupKey: string) => string} addSourceFile - Adds source file to project and returns the file reference
 */

/**
 * @typedef {Object} ExpoConfig
 * @property {XcodeProject} modResults - Xcode project modification results
 */

/**
 * Adds native Swift functions to iOS Xcode project
 * @param {import('@expo/config-plugins').ExpoConfig} config - Expo config object
 * @returns {Promise<import('@expo/config-plugins').ExpoConfig>} Modified config
 */
/**
 * Enhances the provided configuration with native functions for an iOS project.
 *
 * This function modifies the Xcode project by copying necessary `.swift` and `.m` files
 * to the iOS project directory and adding them to the project. It also updates the
 * `Spacedrive-Bridging-Header.h` file with the required imports.
 *
 * @param {object} config - The configuration object to enhance.
 * @returns {object} The modified configuration object.
 *
 * @modifies Spacedrive-Bridging-Header.h
 * // This file is autogenerated by `withNativeFunctions.js`. Do not modify this file
 * #import <React/RCTBridge.h>
 */
const withNativeFunctions = (config) => {
	const mod = withXcodeProject(config, async (config) => {
		/** @type {XcodeProject} */
		const project = config.modResults;

		/** @type {{name: string, path: string}} */
		const group = project.pbxGroupByName('Spacedrive');
		/** @type {string} */
		const key = project.findPBXGroupKey({ name: group.name, path: group.path });

		const iosProjectFolder = path.join(__dirname, '../ios');

		// Copy the .swift and .m files to the iOS project
		fs.copyFileSync(
			path.join(__dirname, '../modules/native-functions/NativeFunctions.swift'),
			path.join(iosProjectFolder, 'NativeFunctions.swift')
		);
		fs.copyFileSync(
			path.join(__dirname, '../modules/native-functions/NativeFunctions.m'),
			path.join(iosProjectFolder, 'NativeFunctions.m')
		);

		// Add the .swift file to the project
		config.modResults.addSourceFile('NativeFunctions.swift', null, key);
		// Add the .m file to the project
		config.modResults.addSourceFile('NativeFunctions.m', null, key);

		// Update the Spacedrive-Bridging-Header.h file
		const bridgingHeaderPath = path.join(
			iosProjectFolder,
			'/Spacedrive/Spacedrive-Bridging-Header.h'
		);
		// Empty the file first
		fs.writeFileSync(bridgingHeaderPath, '');

		const comment =
			'// This file is autogenerated by `withNativeFunctions.js`. Do not modify this file, as it will be overwritten by the build process.\n';
		const importStatement = '#import <React/RCTBridge.h>\n';

		// Write new content
		fs.writeFileSync(bridgingHeaderPath, comment + importStatement);

		return config;
	});

	return mod;
};

module.exports = withNativeFunctions;
