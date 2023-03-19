import axios from 'axios';
import * as cheerio from 'cheerio';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import {
  convertGoldPriceStringToNumber,
  extractRawUpdatedTimeString,
} from './utils';

admin.initializeApp();

const scrapeThaiGoldPrice = async () => {
  const response = await axios.get('https://goldtraders.or.th');
  const html = response.data;

  const $ = cheerio.load(html);

  const goldBarSell = convertGoldPriceStringToNumber(
    $('#DetailPlace_uc_goldprices1_lblBLSell').text(),
  );

  const goldBarBuy = convertGoldPriceStringToNumber(
    $('#DetailPlace_uc_goldprices1_lblBLBuy').text(),
  );

  const goldOrnamentSell = convertGoldPriceStringToNumber(
    $('#DetailPlace_uc_goldprices1_lblOMSell').text(),
  );

  const goldOrnamentBuy = convertGoldPriceStringToNumber(
    $('#DetailPlace_uc_goldprices1_lblOMBuy').text(),
  );

  const rawUpdatedDateTimeString = $(
    '#DetailPlace_uc_goldprices1_lblAsTime',
  ).text();

  const thaiDateTimeString = extractRawUpdatedTimeString(
    rawUpdatedDateTimeString,
  );
  return {
    goldBarSell,
    goldBarBuy,
    goldOrnamentSell,
    goldOrnamentBuy,
    thaiDateTimeString,
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
        latestGoldPrice.goldBarSell !== currentThaiGoldPrice.goldBarSell ||
        latestGoldPrice.goldBarBuy !== currentThaiGoldPrice.goldBarBuy ||
        latestGoldPrice.goldOrnamentSell !==
          currentThaiGoldPrice.goldOrnamentSell ||
        latestGoldPrice.goldOrnamentBuy !== currentThaiGoldPrice.goldOrnamentBuy
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
