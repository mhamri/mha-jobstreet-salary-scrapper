you can visit the [latest salary reports in malaysia according to jobstreet search result here](https://mhamri.github.io/mha-jobstreet-salary-scrapper/)

>_while i do my best to have best of my code available online, this code not written with cleanness and best practicecs in mind. it was all about to do it as fast as possible. pardon this ugliness!_ 

# JobStreet Salary Scrapper

this small project is using puppeteer. there was many problems with using it agianst jobstreet website, their website is quite bad in my point of view and made a lot of trouble to use puppeteer agianst it. anyway, they are number one job portal in malaysia and a reliable source to scrap.

to run this scrapper:
* create a copy of **configs.js.sample** and rename it to **configs.js**
* you need to replace your user name and password in the config.js, because jobstreet only shows salaries just after you have login.
* in the **config.json** you can define the keywords that are interesting to you. by default this keywords will be searched 
    
    `['laravel', 'python', 'C#', 'php', 'nodejs', 'asp.net', 'aws', 'azure']`

* run **npm install**
* run **node ./scrapper.js**
    * it's possible that you hit captcha while scrapping(because you are too fast). just pass the captcha and the scrapper will continue to work fine!
* then open **index.html**

## Contribute Please!
if you have any suggestion, commend or contribution please contact me in here or email me `mha-salary-scrapper[atsign!!!]mhamri.33mail.com`
 