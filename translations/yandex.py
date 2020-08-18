#!/usr/bin/env python3

import re
import sys
import json
import requests

API_KEY = 'trnsl.1.1.20170201T155757Z.7822d60e00d0c5ed.57a2b002e797a4eaec55ca6f6a4381d373dd633c'
URL = 'https://translate.yandex.net/api/v1.5/tr.json/translate'


def chunks(l, n):
    """
    Yield successive n-sized chunks from l.

    Source - http://stackoverflow.com/a/312464
    """
    for i in range(0, len(l), n):
        yield l[i:i + n]


def encode_placeholders(s):
    """
    Encodes placeholders in string to underscore separated versions.
    E.g. -
    '{username} has ${amount} credit' will be encoded to
    '{u_s_e_r_n_a_m_e} has ${a_m_o_u_n_t} credit'

    Usage - encode the strings so that the translation service ignores
    the placeholder due to presence of underscores.

    :param s: Source string
    :return: Encoded string
    """
    return re.sub(r"(\{.*?\})", lambda x: '_'.join(list(x.group(1))), s)


def decode_placeholders(s):
    """
    Opposite of `encode_placeholders`.

    :param s: Encoded string
    :return: Original string
    """
    return re.sub(r"(\{.*?\})", lambda x: x.group(1).replace('_', ''), s)


def get_translations(locale, file_path):
    content = json.loads(open(file_path).read())
    language_code = locale.split('-')[0]

    items = list(filter(lambda x: not x[1].get(locale), content.get('translations', {}).items()))
    for batch in chunks(items, 15):
        print('running batch...')
        keys = map(lambda x: x[0], batch)
        values = map(lambda x: encode_placeholders(x[1]['en-US']), batch)
        data = dict(key=API_KEY, text=values, lang='en-{}'.format(language_code))
        res = requests.post(URL, data).json()

        for key, translated_text in zip(keys, res.get('text', [])):
            content['translations'][key][locale] = decode_placeholders(translated_text)

    open(file_path, 'w').write(json.dumps(content, ensure_ascii=False, indent=4, sort_keys=True))


if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: python yandex.py <locale> <path to translations.json> ")
    get_translations(sys.argv[1], sys.argv[2])
