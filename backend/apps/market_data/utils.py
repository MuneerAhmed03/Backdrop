import requests
import csv
from io import StringIO
from datetime import datetime

def prepare_dict(url,key_field,name_field,date_field,date_format):
    response = requests.get(url)
    response.raise_for_status()

    res_data =  response.text
    res_reader = csv.DictReader(StringIO(res_data))
    print(res_reader)
    res_dict={row[key_field]:(row[name_field],normalize_date(row[date_field],date_format)) for row in res_reader}

    return res_dict


def normalize_date(date_str, format):
    try:
        parsed_date = datetime.strptime(date_str, format)
        return parsed_date.strftime("%Y-%m-%d")
    except ValueError:
        return None

