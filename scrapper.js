const puppeteer = require('puppeteer');
const config = require('./configs');
const jsonfile = require('jsonfile');
var fs = require('fs');

function to(promise) {
    return promise.then(data => {
        return [null, data];
    })
        .catch(err => [err]);
}

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

async function run() {
    const browser = await puppeteer.launch({
        headless: config.headless,
        slowMo: 300
    });
    const page = await browser.newPage();
    const keyboard = await page.keyboard;
    await page.goto('https://www.jobstreet.com.my/en/job-search/job-vacancy.php?ojs=2&key=php');
    // await page.screenshot({ path: 'screenshots/github.png' });
    // await page.waitForNavigation();
    await page.waitForSelector("#header-login-link", { timeout: 50000 });
    await page.click("#header-login-link");
    // await page.click("#login-email");
    // const form = await page.$("#login-email");
    // await form.evaluate(form => console.log(form));
    // var x= await page.waitForNavigation();
    // console.log(x);
    await page.waitForNavigation({ timeout: 50000 });
    await page.evaluate(() => {
        $("#login_id").val("mhamri@gmail.com");
        $("#password").val("Max83mMax83m");
        $("#btn_login").click();
    });
    await page.waitForNavigation({ timeout: 50000 });

    const dumpPage = async function (search) {
        let err, presult;
        [err, presult] = await to(page.goto('https://www.jobstreet.com.my/en/job-search/job-vacancy.php?ojs=2&key=' + encodeURIComponent(search)));
        if (err) console.log("couldn't go to page");

        const readSalaries = function () {
            
            var sresult = [];
            var salaries = $("font");
            $.each(salaries, function (index, element) {
                
                const link= $(element).closest("[id^=job_ad_]").find("[id^=position_title_]").attr("href");
                let salary = $(element).text();
                if (salary.startsWith("MYR")) {
                    salary = salary.replace("MYR", "");
                    const salaryBoundries = salary.split("-");
                    let salaryBoundriesCleaned = [];
                    $.each(salaryBoundries, (i, salaryValue) => {

                        Number(salaryBoundriesCleaned.push(salaryValue.replace(",", "").trim()));
                    });

                    if (salaryBoundriesCleaned.length == 2) {
                        sresult.push({ min: salaryBoundriesCleaned[0], max: salaryBoundriesCleaned[1], link: link });
                    }
                }
            })

            return sresult;
        };

        const gotoNextPage = async () => {
            await page.waitForSelector("#page_next");
            await page.evaluate(() => {
                $("#page_next")[0].click();
            });
            await page.waitForNavigation();
        }

        let result = [];

        for (let i = 0; i < 100; i++) {

            [err, presult] = await to(page.evaluate(readSalaries));
            if (err) console.log('couldnt parse salaries');
            if (presult && presult.length > 0) {
                result = result.concat(presult);
            }

            const reached = page.evaluate(() => {
                let text = $("#job_listing_panel > div.panel.mobile-pagination-panel > div > span").text().replace(" jobs", "").split(" of ");
                let first = text[0].split(" - ")[1];
                let second = text[1];
                return first == second;
            });

            [err, presult] = await to(reached);

            if (presult) {
                break;
            }
            if (err) {

                console.log(err);
            }

            [err, presult] = await to(gotoNextPage());
        }
        var reporteCreationDate = (new Date()).toDateString();
        const reportDirectory = `./reports/${reporteCreationDate}`;
        if (!fs.existsSync(reportDirectory)) {
            fs.mkdirSync(reportDirectory);
        }
        jsonfile.writeFileSync(`${reportDirectory}/${search}.json`, result, { spaces: 2 });

        const allReportFile = "./reports/reports.json";
        let availableReports = [];
        if (fs.existsSync(allReportFile)) {
            availableReports = jsonfile.readFileSync(allReportFile);

        }
        availableReports.push(`${reportDirectory}/${search}.json`);
        availableReports = availableReports.filter(onlyUnique);
        jsonfile.writeFileSync(allReportFile, availableReports, { EOL: '\r\n' });
    }

    for (var i = 0; i < config.searchKeywords.length; i++) {
        var searchKeyword = config.searchKeywords[i];
        console.log(`Start to scrap ${searchKeyword}`);
        await dumpPage(searchKeyword);
    }



















    browser.close();
}

run();