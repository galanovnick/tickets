#!/bin/bash

declare -A CITIES
CITIES["KH"]="2204001"
CITIES["SU"]="2208092"
CITIES["KV"]="2200001"

BOT=
CHAT_1=490548958
CHAT_2=396425426

echo $BASH_VERSION

monitor() {
    # date, from, to
    check_tickets $1 $2 $3

    sleep 120 # period - 2 minutes
    monitor $1 $2 $3
}

check_tickets() {
    # date, from, to
    DATE=$1
    FROM_ID=${CITIES["$2"]}
    TO_ID=${CITIES["$3"]}

    URL="https://booking.uz.gov.ua/ru/train_search/"

    DATA="from=${FROM_ID}&to=${TO_ID}&date=${DATE}"

    echo GET to ${URL} with data ${DATA}

    HTTP_RESPONSE=$(curl ${URL} -d${DATA})
    RES=${HTTP_RESPONSE} | jq -r ".data.list[].types[0]"

    if [[ "$RES" = "null" ]]; then
        echo $(date +%Y-%m-%d_%H-%M-%S): ${HTTP_RESPONSE} >> tickets_log.log
    else
        LINK="https://booking.uz.gov.ua/ru/?from=${FROM_ID}%26to=${TO_ID}%26date=${DATE}%26time=00:00%26url=train-list"
        notify_telegram ${LINK}

        echo $(date +%Y-%m-%d_%H-%M-%S): AVAILABLE ${LINK} >> tickets_log.log
    fi
}

notify_telegram() {
    # link
    URL="https://api.telegram.org/$BOT/sendMessage?chat_id=$CHAT_1&text=$1";

    curl ${URL} > /dev/null 2>&1
}

# gogo

if [[ -z "$1" ]]; then
    echo $(date +%Y-%m-%d_%H-%M-%S): "First parameter DATE is required" >> tickets_log.log
    exit
fi

if [[ -z "$2" ]]; then
    echo $(date +%Y-%m-%d_%H-%M-%S): "Second parameter FROM is required" >> tickets_log.log
    exit
fi

if [[ -z "$3" ]]; then
    echo $(date +%Y-%m-%d_%H-%M-%S): "Third parameter TO is required" >> tickets_log.log
    exit
fi

monitor $1 $2 $3
