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
        months: ['Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня', 'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря'],
        phrase: {
            0: 'Понедельник... вот-вот кто их любит то вообще',
            1: 'Не знаю что и сказать то. Просто держись',
            2: 'Среда - маленькая пятница',
            3: 'Держись осталось немого, завтра пятница',
            4: 'T.G.I.F. как у нас на руси говорят',
            5: 'Мой самый любимый день недели. Ведь завтра еще один выходной',
            6: 'Отдыхай как будто завтра понедельник... в смысле завтар поедельник?'
        }
    },
    en: {
        language: 'en',
        days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        extDays: {
            prev: 'min',
            now: 'now',
            next: 'max'
        },
        months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        phrase: {
            0: 'Monday',
            1: 'Tuesday',
            2: 'Wednesday',
            3: 'Thursday',
            4: 'Friday',
            5: 'Saturday',
            6: 'Sunday'
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    let options = {
        date: new Date(),
        lang: DEFAULT_LOCALIZATION_LANGUAGE,
        city: DEFAULT_CITY
    }

    const promise = new Promise((resolve, reject) => {
        chrome.storage.local.get(['lang'], (res) => {
            !res.lang || res.lang === ''
                ? chrome.storage.local.set({lang: DEFAULT_LOCALIZATION_LANGUAGE})
                : options.lang = res.lang
        })

        chrome.storage.local.get(['city'], (res) => {
            !res.city || res.city === ''
                ? chrome.storage.local.set({city: DEFAULT_CITY})
                : options.city = res.city
        })

        resolve(options)
    })

    promise.then(options => renderForecast(options))

    document.getElementById('set-settings')
        .addEventListener('submit', e => {
            e.preventDefault()

            const form = e.target
            const inputs = form.getElementsByTagName('input')
            
            let settings = {}

            for(let i = 0; i < inputs.length; i++) {
                if(inputs[i].type === 'text' || inputs[i].type === 'radio' && inputs[i].checked) {
                    settings[inputs[i].name] = inputs[i].value
                }
            }

            chrome.storage.local.set({lang: settings.language})
            chrome.storage.local.set({city: settings.city})

            options.lang = settings.language
            options.city = settings.city

            // rerender forecast with new settings
            renderForecast(options)
        })

    // switch to extenson settings panel
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
 * Render current day weather forecast
 * @param {object} options
 */
function renderForecast(options) {
    const data = getWeather(options)

    const helpBlock = document.getElementById('settings-message')

    switch(data.cod) {
        case '404':
            helpBlock.innerHTML = `Error: ${data.message}`
            return false

        default:
            helpBlock.innerHTML = `Ok`
    }

    const forcastDate = options.date
    const locale = localization[options.lang]

    const weekDay = forcastDate.getDay() - 1
    const month = forcastDate.getMonth()
    const monthDay = forcastDate.getDate()

    const phrase = locale.phrase[weekDay]

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