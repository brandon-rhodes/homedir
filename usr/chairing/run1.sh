#!/bin/bash

rm -f out.json && scrapy runspider -o out.json -t json spider_django_cms.py
