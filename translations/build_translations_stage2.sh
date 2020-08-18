#!/usr/bin/env bash
locales="ru-RU ar-SA hi-IN pt-BR es-ES ja-JP zh-CN ro-RO fr-FR de-DE nl-NL tr-TR"
for locale in $locales
do
  echo "Translating $locale..." 
  pew in msgsafe-translations python3 yandex.py $locale translations.json
done
