export const extractRawUpdatedDateTimeString = (
  updatedDateTimeString: string,
) => {
  // Ex. updatedDateTimeString format: ประจำวันที่ 18/03/2566 เวลา 09:15 น. (ครั้งที่ 1)

  // Split the string into an array of substrings
  const parts = updatedDateTimeString.split(' ');

  // Extract the date, month, and year from the first substring
  const [day, month, year] = parts[0].split('/');

  // Extract the time from the third substring
  const time = parts[2];

  // Combine the date and time into a new string
  const thaiDatetimeString = `${day}-${month}-${year} ${time}`;
  return thaiDatetimeString;
};

export const convertGoldPriceStringToNumber = (goldPriceString: string) => {
  const number = Number(goldPriceString.replace(/,/g, ''));
  return number;
};
