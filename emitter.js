'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы several и through
 */
getEmitter.isStar = true;
module.exports = getEmitter;

/**
 * Возвращает новый emitter
 * @returns {Object}
 */
function getEmitter() {
    let subscriptions = [];

    return {

        /**
         * Подписаться на событие
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @returns {Object}
         */
        on: function (event, context, handler) {
            subscriptions.push({ namespace: getNamespace(event), context, handler });

            return this;
        },

        /**
         * Отписаться от события
         * @param {String} event
         * @param {Object} context
         * @returns {Object}
         */
        off: function (event, context) {
            let eventNamespace = getNamespace(event);
            subscriptions = subscriptions.filter(subscribe =>
                !(subscribe.namespace.startsWith(eventNamespace) &&
                subscribe.context === context));

            return this;
        },

        /**
         * Уведомить о событии
         * @param {String} event
         * @returns {Object}
         */
        emit: function (event) {
            let namespace = getNamespace(event);
            let allSubNamespaces = getAllSubNamespaces(namespace);
            subscriptions.filter(subscribe => allSubNamespaces.includes(subscribe.namespace))
                .sort(lengthSort)
                .forEach(subscribe => subscribe.handler.call(subscribe.context));

            return this;
        },

        /**
         * Подписаться на событие с ограничением по количеству полученных уведомлений
         * @star
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @param {Number} times – сколько раз получить уведомление
         * @returns {Object}
         */
        several: function (event, context, handler, times) {
            if (times <= 0) {
                this.on(event, context, handler);

                return this;
            }

            let count = 0;
            this.on(event, context, () => {
                if (count < times) {
                    count++;
                    handler.call(context);
                }
            });

            return this;
        },

        /**
         * Подписаться на событие с ограничением по частоте получения уведомлений
         * @star
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @param {Number} frequency – как часто уведомлять
         * @returns {Object}
         */
        through: function (event, context, handler, frequency) {
            if (frequency <= 0) {
                this.on(event, context, handler);

                return this;
            }

            let count = 0;
            this.on(event, context, () => {
                if (count % frequency === 0) {
                    handler.call(context);
                }
                count++;
            });

            return this;
        }
    };
}

function getNamespace(event) {
    return event + '.';
}

function getAllSubNamespaces(namespace) {
    let allSubNamespaces = [];
    for (var i = 0; i < namespace.length; i++) {
        if (namespace[i] === '.') {
            allSubNamespaces.push(namespace.substring(0, i + 1));
        }
    }

    return allSubNamespaces;
}

function lengthSort(a, b) {
    return b.namespace.length - a.namespace.length;
}
