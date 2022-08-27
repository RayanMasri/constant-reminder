const hourToReadable = (hour) => {
  let [hours, minutes] = hour.split(':').map((e) => parseInt(e));
  let period = hours > 12 ? 'PM' : 'AM';

  return `${hours > 12 ? hours - 12 : hours}:${minutes
    .toString()
    .padStart(2, '0')} ${period}`;
};

const hoursToReadable = (hours) => {
  if (hours.length > 1) {
    let min = getMinimumHour(hours);
    let max = getMaximumHour(hours);

    return `${hourToReadable(min)} -> ${hourToReadable(max)}`;
  } else {
    return hourToReadable(hours[0]);
  }
};

const getMinimumHour = (hours) => {
  return hours.sort((a, b) => getHourTotal(a) - getHourTotal(b))[0];
};

const getMaximumHour = (hours) => {
  return hours.sort((a, b) => getHourTotal(b) - getHourTotal(a))[0];
};

const getParsedTime = (date, military = false, integer = false) => {
  // '8/25/2022, 8:21:52 PM'
  // date.setMilliseconds(date.getMilliseconds() - 20 * 24 * 60 * 60 * 1000 - 8 * 60 * 60 * 1000);
  let iso = date.toLocaleString('en-US', { hour12: !military });
  let [dates, times] = iso.split(', ');
  let [month, day, year] = dates.split('/');
  let [time, period] = times.split(' ');
  let [hours, minutes, seconds] = time.split(':');

  let object = {
    year: year,
    month: month,
    day: day,
    hours: hours,
    minutes: minutes,
    seconds: seconds,
  };

  if (integer) {
    for (let key of Object.keys(object)) {
      object[key] = parseInt(object[key]);
    }
  }

  return {
    ...object,
    period: period,
  };
};

const getFormattedDate = () => {
  let { year, month, day, hours, minutes, seconds, period } = getParsedTime(
    new Date()
  );

  return `${month}/${day}/${year} ${hours}:${minutes}:${seconds} ${period}`;
};

const getHourTotal = (hour) => {
  let [hours, minutes] = hour.split(':').map((e) => parseInt(e));
  return hours * 60 + minutes;
};

const minutesToTime = (minutes, stringify = false) => {
  let hours = Math.floor(minutes / 60);
  minutes = minutes - hours * 60;

  if (stringify) {
    hours = hours.toString();
    minutes = minutes.toString().padStart(2, '0');
  }

  return [hours, minutes];
};

const sortHoursAsc = (hours) => {
  return Array.from(hours).sort((a, b) => getHourTotal(a) - getHourTotal(b));
};

const sortHoursDesc = (hours) => {
  return Array.from(hours).sort((a, b) => getHourTotal(b) - getHourTotal(a));
};

const getLongDay = () => {
  return new Date().toLocaleString('en-us', { weekday: 'long' });
};

export {
  hourToReadable,
  hoursToReadable,
  getMaximumHour,
  getMinimumHour,
  getFormattedDate,
  getParsedTime,
  getHourTotal,
  sortHoursDesc,
  sortHoursAsc,
  minutesToTime,
  getLongDay,
};
