const puppeteer = require('puppeteer');
const fs = require('fs');

type ConfigType = {
    target: string;
    url: string;
    outputFile: string;
    waitForSelector: string;
    selectors: {
        key: string;
        selector: string;
        type: string;
        attribute?: string;
    }[];
    options: {
        headless: boolean;
        timeout: number;
    }
}

const CONFIG: ConfigType = {
    target: 'sixt.fr',
    url: 'https://www.sixt.fr/betafunnel/#/offerlist?zen_pu_location=ef8614e9-a3df-42e5-843f-7bff11678f13&zen_do_location=ef8614e9-a3df-42e5-843f-7bff11678f13&zen_pu_title=Bordeaux%20A%C3%A9roport&zen_do_title=Bordeaux%20A%C3%A9roport&zen_pu_time=2025-04-12T12%3A30&zen_do_time=2025-05-17T08%3A30&zen_pu_branch_id=BRANCH%3A4247&zen_do_branch_id=BRANCH%3A4247&zen_offer_matrix_id=52de499b-005a-4e54-95d9-418ac23912d2&zen_vehicle_type=car&zen_pickup_country_code=FR&zen_resident_country_required=false&zen_filters=%7B%22group_type%22%3A%5B%5D%2C%22transmission_type%22%3A%5B%5D%2C%22passengers_count%22%3A%5B%5D%2C%22minimum_driver_age%22%3A%5B%5D%7D&zen_order_is_ascending=false&zen_order_by=&zen_offer_id=&zen_booking_id=213253c6-6015-4054-a449-60ad7b8391bf',
    outputFile: 'data-56.json',
    waitForSelector: '.rof__sc-d917d3cc-0',
    selectors: [
        {
            key: 'title',
            selector: '.cxgtfM',
            type: 'text'
        },
        {
            key: 'transmission',
            selector: '.gxWeYh',
            type: 'text'
        },
        {
            key: 'image',
            selector: '.rof__sc-b3b84c47-10',
            type: 'attribute',
            attribute: 'src'
        },
        {
            key: 'isElectric',
            selector: '.gFepFY',
            type: 'text'
        },
        {
            key: 'price',
            selector: '.fwPJUY',
            type: 'text'
        }
    ],
    options: {
        headless: true,
        timeout: 10000
    }
};

async function scrapeWebsite(): Promise<void> {
    let browser : any;
    try {
        browser = await puppeteer.launch({headless: CONFIG.options.headless});
        const page: any = await browser.newPage();

        console.log(`Navigation vers ${CONFIG.target}`);
        await page.goto(CONFIG.url, {
            waitUntil: 'networkidle2',
            timeout: CONFIG.options.timeout
        });

        console.log(`Attente du sélecteur ${CONFIG.waitForSelector}`);
        await page.waitForSelector(CONFIG.waitForSelector, {
            timeout: CONFIG.options.timeout
        });

        console.log('Extraction des données...');
        const results: any = await page.evaluate((config) => {
            const items: unknown[] = [];

            const firstSelectorElements: NodeListOf<any> = document.querySelectorAll(config.selectors[0].selector);
            const itemCount: number = firstSelectorElements.length;

            for (let i: number = 0; i < itemCount; i++) {
                items.push({});
            }

            config.selectors.forEach(({key, selector, type, attribute}): void => {
                const elements: NodeListOf<any> = document.querySelectorAll(selector);

                elements.forEach((element, index: number): void => {
                    if (index < items.length) {
                        if (type === 'text') {
                            items[index][key] = element.textContent.trim();
                        } else if (type === 'attribute' && attribute) {
                            items[index][key] = element.getAttribute(attribute) || '';
                        }
                    }
                });
            });

            return items.filter(item =>
                Object.values(item).some(val => val && val.toString().trim() !== '')
            );
        }, CONFIG);

        fs.writeFileSync(CONFIG.outputFile, JSON.stringify(results, null, 2));
        console.log(`✅ ${results.length} éléments sauvegardés dans ${CONFIG.outputFile}`);

    } catch (error) {
        console.error('❌ Erreur lors du scraping:', error.message);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

scrapeWebsite();