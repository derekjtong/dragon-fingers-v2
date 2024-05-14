import requests
from bs4 import BeautifulSoup
from concurrent.futures import ThreadPoolExecutor
import csv
from random import randint


def fetch_page_content(url):
    """Fetches content of a given URL"""
    try:
        response = requests.get(url)
        response.raise_for_status()
        return response.text
    except requests.RequestException as e:
        print(f"Failed to fetch {url}: {str(e)}")
        return None


def parse_main_page(html):
    """extract text IDs from main page"""
    print("Parsing main page")
    soup = BeautifulSoup(html, "html.parser")
    table = soup.find("table")
    text_ids = []
    for row in table.find_all("tr")[1:]:  # skip header
        columns = row.find_all("td")
        if columns:
            text_id = columns[1].text.strip().replace("#", "")
            text_ids.append(text_id)
    print(f"\033[92mExtracted {len(text_ids)} entries \033[0m")
    return text_ids


def fetch_and_parse_text_page(text_id):
    """extracts quote and source from text page"""
    url = f"https://www.typeracerdata.com/text?id={text_id}"
    html = fetch_page_content(url)
    if html:
        soup = BeautifulSoup(html, "html.parser")
        quote = soup.find("h1").find_next("p").text.strip()
        source = soup.find("p").find_next("p").text.strip().replace("—from ", "")
        blue_text = "\033[94m" + quote + "\033[0m"
        green_text = "\033[92m" + source + "\033[0m"
        print(f"{blue_text}\n          {green_text}\n")
        return quote, source


def main():
    main_url = "https://www.typeracerdata.com/texts"
    main_page_html = fetch_page_content(main_url)
    if main_page_html:
        text_ids = parse_main_page(main_page_html)
        with ThreadPoolExecutor(max_workers=10) as executor:
            results = list(executor.map(fetch_and_parse_text_page, text_ids))

        # write to csv
        with open("quotes.csv", "w", newline="", encoding="utf-8") as file:
            writer = csv.writer(file)
            writer.writerow(["body", "source"])
            for result in results:
                if result:
                    writer.writerow(result)


if __name__ == "__main__":
    main()
