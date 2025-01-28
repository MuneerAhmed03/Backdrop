import requests
import csv
from io import StringIO
from datetime import datetime

def prepare_dict(url,key_field,name_field,date_field,date_format):
    response = requests.get(url)
    response.raise_for_status()

    res_data =  response.text
    res_reader = csv.DictReader(StringIO(res_data))
    res_dict={row[key_field]:(row[name_field],normalize_date(row[date_field],date_format)) for row in res_reader}

    return res_dict
  


def prepare_list(url):
    commit_sha_response = requests.get(f"{url}/branches/main")
    commit_sha_response.raise_for_status()
    commit_sha = commit_sha_response.json()['commit']['sha']

    tree_sha_url = f"{url}/git/trees/{commit_sha}"
    tree_sha_response = requests.get(tree_sha_url)
    tree_sha_response.raise_for_status()
    tree = tree_sha_response.json()['tree']
    
    daily_url = ''
    for item in tree:
        if item['path'] == 'daily' and item['type'] == 'tree':
            daily_url = item['url']    
    if not daily_url:
        print("Error: 'daily' folder not found in repository tree")
        return []
    
    daily_data = requests.get(daily_url)
    daily_data.raise_for_status()
    daily_tree = daily_data.json()['tree']
    print(f"Retrieved {len(daily_tree)} items from 'daily' folder")
    return daily_tree


def normalize_date(date_str, format):
    try:
        parsed_date = datetime.strptime(date_str, format)
        return parsed_date.strftime("%Y-%m-%d")
    except ValueError:
        return None

