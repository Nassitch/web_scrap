// const fs = require('fs');
// const axios = require('axios');
// const cheerio = require('cheerio');
//
// const URL = 'https://www.sixt.fr/betafunnel/#/offerlist?zen_pu_location=a768b057-1a83-49e9-85c5-93af78eaf8ab&zen_do_location=a768b057-1a83-49e9-85c5-93af78eaf8ab&zen_pu_title=Bordeaux%20A%C3%A9roport&zen_do_title=Bordeaux%20A%C3%A9roport&zen_pu_time=2025-04-08T12%3A30&zen_do_time=2025-06-21T08%3A30&zen_pu_branch_id=BRANCH%3A4247&zen_do_branch_id=BRANCH%3A4247&zen_offer_matrix_id=ff5c4591-9a8a-4416-9d2d-7f29fb35ff4c&zen_vehicle_type=car&zen_pickup_country_code=FR&zen_resident_country_required=false&zen_filters=%7B%22group_type%22%3A%5B%5D%2C%22transmission_type%22%3A%5B%5D%2C%22passengers_count%22%3A%5B%5D%2C%22minimum_driver_age%22%3A%5B%5D%7D&zen_order_is_ascending=false&zen_order_by=&zen_offer_id=&zen_booking_id=d2db29be-6013-4294-ac43-6b4782f1fa34';
// const SELECTOR = '.entry-title';
// const OUTPUT_FILE = 'data-1.json';
//
// async function scrapeWebsite() {
//     try {
//         const {data: html} = await axios.get(URL);
//
//         const $ = cheerio.load(html);
//         const results = [];
//
//         // $(SELECTOR).each((index, element) => {
//         //     const $element = $(element);
//         //
//         //     // const title = $element.find('a').first().text().trim();
//         //     // const image = $element.closest('article').find('img.attachment-gridlove-a4').attr('src');
//         //
//         //     results.push({
//         //         title: title,
//         //         image: image || 'Aucune image trouvée'
//         //     });
//         // });
//
//         fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
//         console.log(`Données sauvegardées dans ${OUTPUT_FILE} (${results.length} éléments)`);
//
//     } catch (error) {
//         console.error('Erreur lors du scraping:', error.message);
//     }
// }
//
// scrapeWebsite();

const puppeteer = require('puppeteer');
const fs = require('fs');

const URL = 'https://www.sixt.fr/betafunnel/#/offerlist?zen_pu_location=a768b057-1a83-49e9-85c5-93af78eaf8ab&zen_do_location=a768b057-1a83-49e9-85c5-93af78eaf8ab&zen_pu_title=Bordeaux%20A%C3%A9roport&zen_do_title=Bordeaux%20A%C3%A9roport&zen_pu_time=2025-04-08T12%3A30&zen_do_time=2025-06-21T08%3A30&zen_pu_branch_id=BRANCH%3A4247&zen_do_branch_id=BRANCH%3A4247&zen_offer_matrix_id=ff5c4591-9a8a-4416-9d2d-7f29fb35ff4c&zen_vehicle_type=car&zen_pickup_country_code=FR&zen_resident_country_required=false&zen_filters=%7B%22group_type%22%3A%5B%5D%2C%22transmission_type%22%3A%5B%5D%2C%22passengers_count%22%3A%5B%5D%2C%22minimum_driver_age%22%3A%5B%5D%7D&zen_order_is_ascending=false&zen_order_by=&zen_offer_id=&zen_booking_id=d2db29be-6013-4294-ac43-6b4782f1fa34';
const OUTPUT_FILE = 'data-2.json';

const titleClass = ".rof__sc-91a5c3d4-27";
const imageClass = ".rof__sc-91a5c3d4-9";

async function scrapeWebsite() {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        await page.goto(URL, {waitUntil: 'networkidle2'});

        await page.waitForSelector(titleClass, {timeout: 5000});

        const results = await page.evaluate((titleClass, imageClass) => {
            const items = [];

            document.querySelectorAll(titleClass).forEach((el, index) => {
                items[index] = {
                    title: el.innerText.trim(),
                    image: ''
                };
            });

            document.querySelectorAll(imageClass).forEach((el, index) => {
                if (items[index]) {
                    items[index].image = el.src || 'Aucune image trouvée';
                }
            });

            return items.filter(item => item.title || item.image);
        }, titleClass, imageClass);

        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
        console.log(`Données sauvegardées dans ${OUTPUT_FILE} (${results.length} éléments)`);

        await browser.close();
    } catch (error) {
        console.error('Erreur lors du scraping:', error.message);
    }
}

scrapeWebsite();