import gulp from 'gulp';
import sourcemaps from 'gulp-sourcemaps';
import sass from 'gulp-sass';
import autoprefixer from 'gulp-autoprefixer';
import project from '../aurelia.json';
import { build } from 'aurelia-cli';

export default function processCSS() {
	return gulp.src(project.cssProcessor.source)
		.pipe(sourcemaps.init())
		.pipe(sass().on('error', sass.logError))
		.pipe(autoprefixer({
			browsers: [
				'Android >= 2.3',
				'BlackBerry >= 7',
				'Chrome >= 9',
				'Firefox >= 4',
				'Explorer >= 9',
				'iOS >= 5',
				'Opera >= 11',
				'Safari >= 5',
				'ChromeAndroid >= 9',
				'FirefoxAndroid >= 4',
				'ExplorerMobile >= 9'
			]
		}))
		.pipe(build.bundle());
}
