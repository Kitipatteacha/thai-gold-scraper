export const getAnnouncedDateFromRawString = (rawString: string) => {
  // Ex. rawString format: ประจำวันที่ 18/03/2566 เวลา 09:15 น. (ครั้งที่ 1)

  // Split the string into an array of substrings
  const parts = rawString.split(' ');

  // Extract the date, month, and year from the first substring
  const [day, month, year] = parts[0].split('/');

  // Extract the time from the third substring
  const time = parts[2];

  // Combine the date and time into a new string
  const announcedAt = `${day}-${month}-${year} ${time}`;
  return announcedAt;
};

export const convertStringToNumber = (str: string) => {
  const number = Number(str.replace(/,/g, ''));
  return number;
};
