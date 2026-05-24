// import moment from 'moment';

import _ from "lodash";
import moment, { Moment } from "moment-timezone";

export const DATE_FORMAT_STRING = "YYYY-MM-DD";
export const DATE_TIME_WITHOUT_TIMEZONE_FORMAT = "YYYY-MM-DDTHH:mm:ss";

export function generateDateSeries(from: string, to: string): string[] {
	const fromDateMoment = moment(from);
	const toDateMoment = moment(to);

	const diffInDay = toDateMoment.diff(fromDateMoment, "day");
	const results = [fromDateMoment.format(DATE_FORMAT_STRING)];
	for (let i = 1; i <= diffInDay; i++) {
		fromDateMoment.add(1, "day");
		results.push(fromDateMoment.format(DATE_FORMAT_STRING));
	}
	return results;
}

export function convertToUTCKeepDateTime(dString: string) {
	const mUtc = moment.utc(dString, DATE_TIME_WITHOUT_TIMEZONE_FORMAT);
	return mUtc && mUtc.isValid() ? mUtc : null;
}

export function convertToTimeZoneKeepDateTime(dString: string, toTz: string) {
	const mUtc = moment.tz(dString, DATE_TIME_WITHOUT_TIMEZONE_FORMAT, toTz);

	return mUtc && mUtc.isValid() ? mUtc : null;
}

export function isValidTimeZone(timezone: string) {
	return moment.tz.zone(timezone) !== null;
}
/**
 *
 * @param momentDate
 * @param firstDayOfWeek 0 - 6 base
 */
export function getWeekRange(momentDate: Moment, startWeekday: number) {
	const currentWeekday = momentDate.isoWeekday() - 1;
	let diff = currentWeekday - startWeekday;
	if (diff < 0) {
		diff += 7;
	}
	const firstDayOfWeek = momentDate.clone().subtract(diff, "days");
	const lastDayOfWeek = momentDate.clone().add(6, "days");
	return { first: firstDayOfWeek, last: lastDayOfWeek };
}

export function minuteToHour(minute: number, precision = 2) {
	return _.round(minute / 60, precision);
}
