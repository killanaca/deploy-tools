'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

/**
 * Update web.config with webpackManifest, CSS and JS files hash.
 * @param {object} [obj] - obj
 * @param {object} [obj.longTermHash] - Return if long term hash is false
 * @param {string} obj.webConfig - Relative path of webconfig
 * @param {string} obj.cdn - The CDN domain
 * @param {string} obj.projectName - The project name
 * @param {string} obj.buildPathCss - The CSS build Path
 * @return {Promise} A Promise
 */
let updateWebconfigChunk = (() => {
	var _ref = _asyncToGenerator(function* ({ longTermHash = false, webConfigFile, cdn, projectName, buildPathCss }) {
		// check if config parameter exists. Web.config is OPT-IN
		if (!longTermHash) {
			return false;
		}
		// TODO: make this parallel
		const webpackAssets = yield _fs2.default.readJsonAsync('wp-assets-stats.json');
		const css = yield _fs2.default.readJsonAsync('css-assets-stats.json');
		const xmlString = yield _fs2.default.readFileAsync(webConfigFile);
		// <add key="vendors" value="" />
		// <add key="main" value="" />
		// <add key="vendors-backoffice" value="" />
		// <add key="main-backoffice" value="" />
		// <add key="main.css" value="" />
		// <add key="main-admin.css" value="" />
		// <add key="webpackManifest" value="" />
		const mainJs = webpackAssets.assetsByChunkName.main ? webpackAssets.assetsByChunkName.main[0] : '';
		const vendorsJs = webpackAssets.assetsByChunkName.vendors ? webpackAssets.assetsByChunkName.vendors[0] : '';
		const mainBackofficeJs = webpackAssets.assetsByChunkName['main-backoffice'] ? webpackAssets.assetsByChunkName['main-backoffice'][0] : '';
		const vendorsBackofficeJs = webpackAssets.assetsByChunkName['vendors-backoffice'] ? webpackAssets.assetsByChunkName['vendors-backoffice'][0] : '';

		const modernizr = (0, _find2.default)(webpackAssets.assets, function (i) {
			return i.name.indexOf('modernizr') >= 0;
		});
		const modernizrJs = modernizr ? modernizr.name : '';

		const mainCss = (0, _find2.default)(css.assets, function (i) {
			return i.filename.indexOf('main.css') >= 0;
		});
		const mainAdminCss = (0, _find2.default)(css.assets, function (i) {
			return i.filename.indexOf('main-admin.css') >= 0;
		});
		const jsRemotePath = webpackAssets.publicPath;
		const cssRemotePath = `${ cdn }/${ projectName }${ buildPathCss }`;
		const webpackManifest = {};
		// take only js files (exclude .map files)
		webpackAssets.assets.filter(function (i) {
			return i.name.match('.js$') !== null;
		}).forEach(function (item) {
			webpackManifest[item.chunks[0]] = item.name;
		});

		let newWebconfigXmlString = xmlString.replace(/<add .*"vendors".*\/>/igm, `<add key="vendors" value="${ jsRemotePath }${ vendorsJs }" />`);
		newWebconfigXmlString = newWebconfigXmlString.replace(/<add .*"main".*\/>/igm, `<add key="main" value="${ jsRemotePath }${ mainJs }" />`);
		newWebconfigXmlString = newWebconfigXmlString.replace(/<add .*"vendors-backoffice".*\/>/igm, `<add key="vendors-backoffice" value="${ jsRemotePath }${ vendorsBackofficeJs }" />`);
		newWebconfigXmlString = newWebconfigXmlString.replace(/<add .*"main-backoffice".*\/>/igm, `<add key="main-backoffice" value="${ jsRemotePath }${ mainBackofficeJs }" />`);
		newWebconfigXmlString = newWebconfigXmlString.replace(/<add .*"modernizr".*\/>/igm, `<add key="modernizr" value="${ jsRemotePath }${ modernizrJs }" />`);
		if (mainCss) {
			newWebconfigXmlString = newWebconfigXmlString.replace(/<add .*"main\.css".*\/>/igm, `<add key="main.css" value="${ cssRemotePath }${ mainCss.filename.replace(/\.css$/, '.') }${ mainCss.filehash }" />`);
		}
		if (mainAdminCss) {
			newWebconfigXmlString = newWebconfigXmlString.replace(/<add .*"main-admin\.css".*\/>/igm, `<add key="main-admin.css" value="${ cssRemotePath }${ mainAdminCss.filename.replace(/\.css$/, '.') }${ mainAdminCss.filehash }" />`);
		}
		newWebconfigXmlString = newWebconfigXmlString.replace(/<add .*"webpackManifest".*\/>/igm, `<add key="webpackManifest" value='${ JSON.stringify(webpackManifest) }' />`);
		return _fs2.default.writeFileAsync(webConfigFile, newWebconfigXmlString);
	});

	return function updateWebconfigChunk(_x) {
		return _ref.apply(this, arguments);
	};
})();

var _find = require('lodash/find');

var _find2 = _interopRequireDefault(_find);

var _fs = require('../libs/fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

exports.default = updateWebconfigChunk;