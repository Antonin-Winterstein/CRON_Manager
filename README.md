# CRON Manager

CRON Manager is a powerful Discord bot that enables users to effortlessly schedule and automate message sending at customized intervals. Thanks to its large number of options, users can conveniently set up recurring messages, ensuring timely and consistent communication. Say goodbye to manual reminders and let CRON Manager handle your scheduling needs with ease.
 
Is it developed in JavaScript and uses the [Discord.js API](https://discord.js.org/#/). It is combined with a [MongoDB](https://www.mongodb.com/) database to store CRONs of every server using the bot.

## Inviting the CRON Manager BOT to your Discord server

To use my bot, please click on this invitation link and allow the permissions: To do..

> WARNING : Permissions of Administrator are needed to interact with the BOT, take care of not giving them to any user if you don't want them to interact with the BOT.

## How to use the commands

There are a total of six commands available (following [CRUD](https://fr.wikipedia.org/wiki/CRUD) principle) to configure your CRONs and two utility commands. I will detail them for you.

> NOTE : The syntax I will use for the commands are the following: {} = available subcommand(s) | [] = mandatory option(s) | <> = optional option(s). Please do not use these characters: {}, [] and <> in your commands.

### Creating your CRON

To program your first CRON, you will use the `createcron` command. There are three mandatory options for seven optional options.
`createcron [channel] [time] [message] <days> <months> <daysOfWeek> <weekInterval> <startTime> <startMonthDay> <timeZone>`

#### Options description

- [channel]: The channel (only textual) in which the message you scheduled will be sent. You can only select one channel. Examples: `#meeting`, `#important`
- [time]: The time when the message will be sent (format: `HH:mm`).
**Examples:** `12:30`, `00:00`.
- [message]: The message you want to send. Note that you can't send a message with more than 2 000 characters. You can use tags (with the `@`), mention textual channels (with the `#`), use emojis and custom emojis from your server.
**Example:** `Hello @everyone, let's talk about some crazy stuff in #meeting! 🔥`.
- <days>: The specific days of the month you want your message to be sent (`from 1 to 31`). Separate each day you want by commas or put `ALL` if you want all of them. If not specified, it will be sent every. Note that the `weekInterval` option does not impact this `days` option if you specified it, in any case, the message will be sent at the days registered.
**Examples:** `1, 10, 25`, `ALL`.
- <months>: The specific months you want your message to be sent (`from January to December`). Separate each month you want by commas or put `ALL`. If not specified, it will be sent every month. Note that you can't specify a `startTime` if you are using months. Moreover, if you are using a `weekInterval` of more than 1, you will also need to specify the `startMonthDay` option for each month.
**Examples:** `September, November, December`, `ALL`.
- <daysOfWeek>: The days of the week you want your message to be sent (`from Sunday to Saturday`). Separate each day of the week by commas or put `ALL`. If not specified, it will be sent every day of the week.
 **Examples:** `Monday, Wednesday, Friday`, `ALL`.
- <weekInterval>: The interval of weeks you want your message to be sent. By default, it is set to 1 (sent every week) but you can specify a number to change it. Note that if you are using a `weekInterval` greater than 1 while specifying months, you will need to also use the `startMonthDay` option.
 **Example:** `2`
- <startTime>: The date you want your message to start sending from (format: `YYYY-MM-DD`). By default, it will take the current date of the time zone specified (if you did, if not it will take the Europe/Paris time zone). Note that you can't use this option if you specified months.
 **Example:** `2023-09-20`
- <startMonthDay>: The start days of each month you want your message to start sending from (`from 1 to 5`) where for example 1 means the first day of the week of the month, e.g the first sunday of the month. For each month you put, you shall add the corresponding starting day all separated by commas. Note that it can only be used if `weekInterval` is greater than 1 and if `months` is used.
 **Example:** `1`, `1, 3, 1, 2`
- <timeZone>: The time zone you want the message to be sent from. Please use the TZ identifier, you can see a list of them on this [link](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones). By default it is set to Europe/Paris.

#### Examples
