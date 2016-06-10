/**
*
* Copyright © 2014-2016 killanaca All rights reserved.
*
* This source code is licensed under the MIT license found in the
* LICENSE.txt file in the root directory of this source tree.
*
*/

import trimEnd from 'lodash/trimEnd';
import c from './libs/config';
import path from 'path';
import imageminTask from 'imagemin';
import imageminMozjpeg from 'imagemin-mozjpeg';
import imageminPngquant from 'imagemin-pngquant';
import imageminGifsicle from 'imagemin-gifsicle';
import logger from './libs/logger';
const debug = require('debug')('dt');

const loadConfig = () => c().load();

async function imagemin(config = loadConfig()) {
	// copy image to temp folder
	if (!config.get('imagePath')) {
		return;
	}
	const srcPath = path.join(process.cwd(), config.get('imagePath'));
	// normalize path. remove the trailing slash from /data/images/ -> /data/images
	const dstPath = path.join(process.cwd(), `${trimEnd(config.get('imagePath'), '/')}-temp`);
	debug('try to copy images from ', srcPath, 'to', dstPath);
	const files = await imageminTask([`${srcPath}*.{jpg,png,gif}`], dstPath, {
		plugins: [
			imageminMozjpeg({ targa: true }),
			imageminPngquant({ quality: '65-80' }),
			imageminGifsicle(),
		],
	});
	logger.log('minified images', files.map((o) => o.path).join(' , '));
}

export default imagemin;