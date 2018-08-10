const OPENWEATHER_REQ_BASEURL = 'http://api.openweathermap.org/data/2.5/forecast/daily'
const OPENWEATHER_PRIVATE_KEY = '8a2e4871b1c6deedc29eacb2cbcfc6e4'
const DEFAULT_LOCALIZATION_LANGUAGE = 'en'
const DEFAULT_CITY = 'Минск'

const localization = {
    ru: {
        language: 'ru',
        days: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
        extDays: {
            prev: 'мин',
            now: 'сейчас',
            next: 'макс'
        },
        months: ['Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня', 'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря']
    },
    en: {
        language: 'en',
        days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        extDays: {
            prev: 'min',
            now: 'now',
            next: 'max'
        },
        months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    }
}

document.addEventListener('DOMContentLoaded', () => {

    let options = {
        date: new Date(),
        lang: DEFAULT_LOCALIZATION_LANGUAGE,
        city: DEFAULT_CITY
    }

    const setLocale = new Promise((resolve, reject) => {

        chrome.storage.local.get(['lang'], (res) => {

            !res['lang'] || res['lang'] === ''
                ? chrome.storage.local.set({lang: DEFAULT_LOCALIZATION_LANGUAGE})
                : options.lang = res['lang']

            !res['city'] || res['city'] === ''
                ? chrome.storage.local.set({city: DEFAULT_CITY})
                : options.city = res['city']

            resolve(options)

        })

    })

    setLocale.then(options => renderForecast(options))

    // constroll events
    document.getElementsByClassName('js-toggle-settings')[0]
        .addEventListener('click', (event) => {
            event.preventDefault()

            event.target.classList.toggle('active')

            document.getElementById('forecast_out').classList.toggle('active')
            document.getElementById('settings').classList.toggle('active')
        })

})

/**
 * Get forecast and return response afeter XHR request
 * @param {object} options
 * @returns {object} response after XHR
 */
function getWeather(options) {
    const xhr = new XMLHttpRequest()
    const req = `${OPENWEATHER_REQ_BASEURL}?q=${options.city}&units=metric&lang=${options.lang}&APPID=${OPENWEATHER_PRIVATE_KEY}`

    xhr.open('GET', req, false)
    xhr.send(null)

    return JSON.parse(xhr.responseText)
}

/**
 * Render 3 days forecast with main information 
 * by day in forcastDate param
 * @param {object} options
 */
function renderForecast(options) {
    const data = getWeather(options)

    const forcastDate = options.date
    const locale = localization[options.lang]

    const weekDay = forcastDate.getDay() - 1
    const month = forcastDate.getMonth()
    const monthDay = forcastDate.getDate()

    const phrase = getFrase(weekDay)

    document.getElementById('forecast_out').innerHTML = `
        <div class="dayforecast">
            <img src="icons/forecast/${data.list[weekDay].weather[0].icon}.svg" class="dayforecast__icon"/>
            <div class="dayforecast__phrase">${phrase}</div>
            <div class="dayforecast__date">${locale.days[weekDay + 1]} - ${monthDay} ${locale.months[month]}</div>
            <div class="dayforecast__temp">
                <div class="dayforecast__temp-item">
                    <small>${locale.extDays.prev}</small>
                    <p>${Math.round(data.list[weekDay].temp.min)}&deg;</p>
                </div>
                <div class="dayforecast__temp-item active">
                    <small>${locale.extDays.now}</small>
                    <p>${Math.round(data.list[weekDay].temp.day)}&deg;</p>
                </div>
                <div class="dayforecast__temp-item">
                    <small>${locale.extDays.next}</small>
                    <p>${Math.round(data.list[weekDay].temp.max)}&deg;</p>
                </div>
            </div>
        </div>
    `
}

/**
 * Get frase according entered options
 * @param {number} day 
 * @returns {string}
 */
function getFrase(day) {
    const out = {
        0: 'Понедельник...',
        1: 'Не знаю что и сказать то. Просто держись',
        2: 'Среда - маленькая пятница',
        3: 'Держись осталось немого',
        4: 'T.G.I.F. как у нас на руси говорят',
        5: 'Мой самй любимый день недели. Ведь завтра еще один выходной',
        6: 'Отдыхай как будто завтра понедельник... в смысле завтар поедельник?'
    }

    return out[day]
}

function setSettings() {
    console.log('42')
}