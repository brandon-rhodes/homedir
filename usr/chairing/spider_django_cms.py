"""Screen scraper for Django CMS pages in the Admin interface.

Based on what it sees in the the edit forms in the Django Admin
interface, this scraper outputs the title, path, and content of each
page of a site, returning the result as JSON.

"""
import scrapy

with open('secrets.txt') as f:
    user, password, cookie = f.read().splitlines()

class BlogSpider(scrapy.Spider):
    name = 'pycon_cms'
    custom_settings = {
        'COOKIES_ENABLED': False,
        'DEFAULT_REQUEST_HEADERS': {'Cookie': cookie},
        }
    http_user = user
    http_pass = password
    start_urls = ['https://us.pycon.org/2016/admin/cms/page/']

    def parse(self, response):
        urls = response.css('.field-title a::attr("href")').extract()
        for url in urls:
            yield scrapy.Request(response.urljoin(url), self.parse_page)
            # break

    def parse_page(self, response):
        yield {
            'page_id': get_page_id(response.url),
            'path': response.css('#id_path::attr("value")').extract_first(),
            'title': response.css('#id_title::attr("value")').extract_first(),
            'body': response.css('#id_body::text').extract_first().splitlines(),
            }
        url = response.css('.historylink::attr("href")').extract_first()
        yield scrapy.Request(response.urljoin(url), self.parse_history)

    def parse_history(self, response):
        history = []
        for row in response.css('tbody tr'):
            date = row.css('th a::text').extract_first()
            data = row.css('td::text').extract()
            by = spacify(data[0])
            comment = spacify(data[1]) if len(data) > 1 else ''
            history.append([date, by, comment])
        if not history:
            return
        yield {
            'page_id': get_page_id(response.url),
            'history': history,
            }

def get_page_id(url):
    return int(url.split('/page/')[1].split('/')[0])

def spacify(s):
    return ' '.join(s.split())
