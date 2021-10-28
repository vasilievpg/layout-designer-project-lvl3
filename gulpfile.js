// Определяем константы Gulp
const {src, dest, parallel, series, watch} = require('gulp');

// Подключаем Browsersync
const browserSync = require('browser-sync').create();

// Подключаем gulp-concat
const concat = require('gulp-concat');

// Подключаем модули gulp-sass
const sass = require('gulp-sass')(require('sass'));

// Подключаем модуль gulp-pug
const pug = require('gulp-pug');

// Подключаем модуль gulp-svg-sprite
const svgSprite = require('gulp-svg-sprite');

// Подключаем модуль del
const del = require('del');

// Определяем логику работы Browsersync
function browsersync() {
    browserSync.init({ // Инициализация Browsersync
        server: {baseDir: 'build/'}, // Указываем папку сервера
        notify: false, // Отключаем уведомления
        online: true // Режим работы: true или false
    })
}

function scripts() {
    return src([ // Берем файлы из источников
        'node_modules/bootstrap/dist/js/bootstrap.js',
        // Здесь остальные скрипты
    ])
        .pipe(dest('build/js/')) // Выгружаем готовый файл в папку назначения
        .pipe(browserSync.stream()) // Триггерим Browsersync для обновления страницы
}

function sass2css() {
    return src([
        'app/scss/app.scss'
        // Путь к главному файлу scss, который будет компилироваться
    ])
        .pipe(sass())
        .pipe(dest('./build/styles/'))

        // Обработка через плагин sass, указание конечного файла и его месторасположение
        .pipe(browserSync.stream()) // Сделаем инъекцию в браузер
}

function pug2html() {
    return src([
        'app/pages/index.pug',
        'app/pages/chat.pug'
    ])
        .pipe(pug({
            pretty: true
        }))
        .pipe(dest('./build/'))
        .pipe(browserSync.stream()) // Сделаем инъекцию в браузер
}

function images() {
    return src(['app/images/**/*', '!app/images/icons/**/*'])
        .pipe(dest('build/images/')) // Выгружаем готовый файл в папку назначения
        .pipe(browserSync.stream()) // Триггерим Browsersync для обновления страницы
}

function svg2sprite() {
    const config = {
        mode: {
            stack: { // Activate the «css» mode
                sprite: "../sprite.svg"
            }
        }
    };
    return src([
        'app/images/icons/*.svg'
    ])
        .pipe(svgSprite(config))
        .pipe(dest('./build/images/icons/'))
}

function cleanbuild() {
    return del('./build/**/*', { force: true }) // Удаляем все содержимое папки "./build/"
}

function startwatch() {

    // Выбираем все файлы JS в проекте, а затем исключим с суффиксом .min.js
    watch(['build/**/*.js', '!build/**/*.min.js'], scripts);

    // Мониторим файлы препроцессора на изменения
    watch('app/scss/**/*.scss', sass2css);

    // Мониторим файлы препроцессора на изменения
    watch('app/**/*.pug', pug2html);

    // Мониторим файлы HTML на изменения
    watch('build/**/*.html').on('change', browserSync.reload);
}

// Экспортируем функцию browsersync() как таск browsersync. Значение после знака = это имеющаяся функция.
exports.browsersync = browsersync;

// Экспортируем функцию scripts() в таск scripts
exports.scripts = scripts;

// Экспортируем функцию sass2css() в таск sass2css
exports.sass2css = sass2css;

// Экспортируем функцию pug2html() в таск pug2html
exports.pug2html = pug2html;

// Экспортируем функцию images() в таск images
exports.images = images;

// Экспортируем функцию svg2sprite() в таск svg2sprite
exports.svg2sprite = svg2sprite;

// Экспортируем функцию cleanbuild() как таск cleanbuild
exports.cleanbuild = cleanbuild;

// Экспортируем дефолтный таск с нужным набором функций
exports.default = series(parallel(cleanbuild, svg2sprite, sass2css, pug2html, images, scripts), parallel(browsersync, startwatch));
