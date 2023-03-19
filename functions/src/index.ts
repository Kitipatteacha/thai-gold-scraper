import axios from 'axios';
import * as cheerio from 'cheerio';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { convertStringToNumber, getAnnouncedDateFromRawString } from './utils';

admin.initializeApp();

const scrapeThaiGoldPrice = async () => {
  const response = await axios.get('https://goldtraders.or.th');
  const html = response.data;

  const $ = cheerio.load(html);

  const goldBarSell = convertStringToNumber(
    $('#DetailPlace_uc_goldprices1_lblBLSell').text(),
  );

  const goldBarBuy = convertStringToNumber(
    $('#DetailPlace_uc_goldprices1_lblBLBuy').text(),
  );

  const goldOrnamentSell = convertStringToNumber(
    $('#DetailPlace_uc_goldprices1_lblOMSell').text(),
  );

  const goldOrnamentBuy = convertStringToNumber(
    $('#DetailPlace_uc_goldprices1_lblOMBuy').text(),
  );

  const announcedAt = getAnnouncedDateFromRawString(
    $('#DetailPlace_uc_goldprices1_lblAsTime').text(),
  );

  return {
    goldBarSell,
    goldBarBuy,
    goldOrnamentSell,
    goldOrnamentBuy,
    announcedAt,
  };
};

export const updateGoldPrice = functions
  .region('asia-southeast1')
  .pubsub.schedule('*/10 * * * *')
  .timeZone('Asia/Bangkok')
  .onRun(async () => {
    const currentThaiGoldPrice = await scrapeThaiGoldPrice();
    if (currentThaiGoldPrice) {
      const latestGoldPriceRef = admin.database().ref('thaiGoldPrice/lastest');
      const latestGoldPriceSnapshot = await latestGoldPriceRef.get();
      const latestGoldPrice = latestGoldPriceSnapshot.val();

      if (
        !latestGoldPrice ||
        latestGoldPrice.announcedAt !== currentThaiGoldPrice.announcedAt
      ) {
        const goldPriceHistory = admin.database().ref('thaiGoldPrice/history');
        await latestGoldPriceRef.set(currentThaiGoldPrice);
        await goldPriceHistory.push(currentThaiGoldPrice);
        functions.logger.info(
          'Gold price data has been updated.',
          currentThaiGoldPrice,
        );
      } else {
        functions.logger.info(
          'The latest gold price has not changed.',
          currentThaiGoldPrice,
        );
      }
    }
  });
