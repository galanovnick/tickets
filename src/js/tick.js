(function () {
    // Bot key
    const BOT = "";

    // Chat id
    const CHAT = "";

    const TWO_MINS_PERIOD = 1000 * 60 * 2;

    const CITIES = {
        'KH': '2204001', // Kharkov
        'SU': '2208092', // Yujnoukrainsk
        'KV': '2200001' // Kiev
    };

    const BASE_URL = "https://booking.uz.gov.ua/ru/train_search/";

    /**
     * Example: monitor("2019-05-05", "KH", "KV")
     *
     * @param date Date format - YYYY-MM-DD
     * @param from
     * @param to
     * @param period Milliseconds
     */
    function monitor(date, from, to, period = TWO_MINS_PERIOD) {
        checkTickets(date, from, to);

        setTimeout(() => {
            monitor(date, from, to);
        }, period);
    }

    function checkTickets(date, from, to) {
        const fromId = CITIES[from];
        const toId = CITIES[to];

        if (!fromId || !toId || !date) {
            console.error('Error. Wrong parameters.');
            return;
        }

        const http = new XMLHttpRequest();
        const params = `from=${fromId}&to=${toId}&date=${date}`;
        http.open("POST", BASE_URL, true);

        http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

        http.onreadystatechange = function () {
            if (http.readyState === 4 && http.status === 200) {
                const response = http.responseText;
                const trains = JSON.parse(response);
                if (trains.data.list.length) {
                    const train = trains.data.list[0];
                    if (train.types.length > 0) {
                        const link = createLink(date, fromId, toId);
                        notifyTelegram(link);

                        // notifyBrowser('Pss.. Need some tickets?', () => window.open(link, '_blank'));
                    } else {
                        console.log('nothing...');
                    }
                } else {
                    console.log('nothing...');
                }
            }
        }
        http.send(params);
    }

    function createLink(date, from, to) {
        return `https://booking.uz.gov.ua/ru/?from=${from}%26to=${to}%26date=${date}%26time=00:00%26url=train-list`;
    }

    function notifyTelegram(link) {
        const url1 = `https://api.telegram.org/${BOT}/sendMessage?chat_id=${CHAT}&text=${link}`;
        window.fetch(url1);
    }

    // Init browser notifications
    function initNotifications() {
        Notification.requestPermission();
    }

    // Notify in browser
    function notifyBrowser(message, onClick) {
        if (Notification.permission === 'granted') {
            const notification = new Notification(message);
            notification.onclick = () => {
                onClick();
                notification.close();
            }
        } else {
            initNotifications();
        }
    }
})();
