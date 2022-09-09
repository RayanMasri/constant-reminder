const sliceLatest = (history, range) => {
  return history.filter(
    (item) =>
      Date.parse(item.answerDate) >=
      getDayStart(new Date()) - range * 24 * 60 * 60 * 1000
  );
};

const getDayStart = (date, unix = true) => {
  let dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  return unix ? Date.parse(dayStart) : dayStart;
};

const getDayEnd = (date, unix = true) => {
  let dayStart = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23,
    59,
    59,
    999
  );

  return unix ? Date.parse(dayStart) : dayStart;
};

const getDoneDaysFromTo = (from) => {
  var oneDay = 24 * 3600 * 1000;
  for (
    var d = [], ms = from * 1, last = new Date() * 1;
    ms < last;
    ms += oneDay
  ) {
    if (ms == getDayStart(new Date())) continue;
    d.push(new Date(ms));
  }
  return d;
};

export { sliceLatest, getDayStart, getDayEnd, getDoneDaysFromTo };
