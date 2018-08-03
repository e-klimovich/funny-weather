const OPENWEATHER_REQ_BASEURL = 'http://api.openweathermap.org/data/2.5/forecast/daily'
const OPENWEATHER_PRIVATE_KEY = '8a2e4871b1c6deedc29eacb2cbcfc6e4'
const DEFAULT_LOCALIZATION_LANGUAGE = 'ru'
const DEFAULT_CITY = 'Minsk'

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

            resolve(options)

        })

    })

    setLocale.then(options => renderForecast(options))

})

/**
 * Get forecast and return response afeter XHR request
 * @param {object} options
 * @returns {object} response after XHR
 */
function getWeather(options) {
    console.log('4: ', options.lang)
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

    document.getElementById('forecast_out').innerHTML = `
        <div class="dayforecast">
            <img src="icons/forecast/${data.list[weekDay].weather[0].icon}.svg" class="dayforecast__icon"/>
            <div class="dayforecast__location">location block</div>
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