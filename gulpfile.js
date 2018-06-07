var gulp = require('gulp'),
	sass = require('gulp-sass'),
	rename = require('gulp-rename'),
	cssmin = require('gulp-minify-css'),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglify'),
	jshint = require('gulp-jshint'),
	scsslint = require('gulp-sass-lint'),
	cache = require('gulp-cached'),
	prefix = require('gulp-autoprefixer'),
	browserSync = require('browser-sync').create(),
	reload = browserSync.reload,
	size = require('gulp-size'),
	plumber = require('gulp-plumber'),
	deploy = require('gulp-gh-pages'),
	babel = require('gulp-babel'),
	pug = require('gulp-pug'),
	notify = require('gulp-notify');


gulp.task('scss', function() {
	var onError = function(err) {
		notify.onError({
			title: "Gulp",
			subtitle: "Failure!",
			message: "Error: <%= error.message %>",
			sound: "Beep"
		})(err);
		this.emit('end');
	};

	return gulp.src('src/scss/main.scss')
		.pipe(plumber({
			errorHandler: onError
		}))
		.pipe(sass())
		.pipe(size({
			gzip: true,
			showFiles: true
		}))
		.pipe(prefix())
		.pipe(rename('main.css'))
		.pipe(gulp.dest('dist/css'))
		.pipe(reload({
			stream: true
		}))
		.pipe(cssmin())
		.pipe(size({
			gzip: true,
			showFiles: true
		}))
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(gulp.dest('dist/css'))
		.pipe(browserSync.stream())
});

gulp.task('browserSync', function() {
	browserSync.init({
		server: {
			baseDir: "./dist"
		}
	});
});

gulp.task('deploy', function() {
	return gulp.src('dist/**/*')
		.pipe(deploy());
});

gulp.task('views', function buildHTML() {
	return gulp.src('src/pug/**/*.pug')
		.pipe(pug())
		.pipe(gulp.dest('dist'))

});

gulp.task('js', function() {
	gulp.src('src/js/*.js')
		.pipe(babel({
			presets: ['env']
		}))
		.pipe(uglify())
		.pipe(size({
			gzip: true,
			showFiles: true
		}))
		.pipe(concat('j.js'))
		.pipe(gulp.dest('dist/js'))
		.pipe(reload({
			stream: true
		}));
});

gulp.task('vendorjs', function() {
	gulp.src('src/js/vendor/*.js')
		.pipe(babel({
			presets: ['env']
		}))
		.pipe(uglify())
		.pipe(size({
			gzip: true,
			showFiles: true
		}))
		.pipe(concat('vendor.js'))
		.pipe(gulp.dest('dist/js'))
		.pipe(reload({
			stream: true
		}));
});

gulp.task('scss-lint', function() {
	gulp.src('src/scss/**/*.scss')
		.pipe(cache('scsslint'))
		.pipe(scsslint());
});

gulp.task('jshint', function() {
	gulp.src('src/js/*.js')
		.pipe(jshint({
			esversion: 6
		}))
		.pipe(jshint.reporter('default'));
});

gulp.task('watch', function() {
	browserSync.init({
		server: {
			baseDir: "./dist"
		}
	});
	gulp.watch('src/scss/**/*.scss', ['scss']);
	gulp.watch('src/js/*.js', ['jshint', 'js', 'vendorjs']);
	gulp.watch('src/**/*.pug', ['views', 'pugwatch']);
	// gulp.watch('img/*', ['imgmin']);
});

gulp.task('pugwatch', function() {
	browserSync.reload();
	// done();

});



gulp.task('imgmin', function() {
	return gulp.src('img/*')
		.pipe(imagemin({
			progressive: true,
			svgoPlugins: [{
				removeViewBox: false
			}],
			use: [pngquant()]
		}))
		.pipe(gulp.dest('dist/img'));
});

gulp.task('default', ['js', 'scss', 'watch', 'vendorjs', 'views']);
// 'imgmin', 'minify-html'