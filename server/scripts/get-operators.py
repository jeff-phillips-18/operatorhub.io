#!/usr/bin/env python

import os
import sys
import json
import yaml
import fnmatch
import logging
import argparse
import requests as r

def get_cmd_line_args():
    parser = argparse.ArgumentParser(description='log level')
    parser.add_argument('--log-level', dest='log', type=str, metavar='level', nargs='?',
                        help='log level of the output. Can be CRITICAL, ERROR, WARNING, INFO, DEBUG. Default is CRITICAL', default="CRITICAL")
    return parser.parse_args()

def set_logging_level(args):
    if args.log == "CRITICAL":
        logging.basicConfig(level=logging.CRITICAL)
    elif args.log == "ERROR":
        logging.basicConfig(level=logging.ERROR)
    elif args.log == "WARNING":
        logging.basicConfig(level=logging.WARNING)
    elif args.log == "INFO":
        logging.basicConfig(level=logging.INFO)
    elif args.log == "DEBUG":
        logging.basicConfig(level=logging.DEBUG)
    else:
        raise Exception("Invalid argument ", args.log)
    return

def find(pattern, path):
    if not os.path.isdir(path):
        raise Exception("invalid path ", path)
    result = []
    for root, dirs, files in os.walk(path):
        for name in files:
            if fnmatch.fnmatch(name, pattern):
                result.append(os.path.join(root, name))
    return result

args = get_cmd_line_args()
set_logging_level(args)

operatorFileQuery = "*.clusterserviceversion.yaml"
all_operators = find(operatorFileQuery, 'community-operators/community-operators')
logging.debug(all_operators)
all_csvs = {"operators": []}

for item in all_operators:
    try:
        yamlFile = open(item, 'r')
        yamlNormal = yamlFile.read().replace('\t', '  ')
        yamlContent = yaml.safe_load(yamlNormal)
        displayName = yamlContent["spec"]["displayName"]
        all_csvs["operators"].append({"name": displayName, "yaml": yaml.dump(yamlContent)})
        yamlFile.close()
        logging.debug("Successfully loaded " + displayName)
    except KeyError as e:
        logging.debug("KeyError ", e)

with open('csvs.json', 'w') as outfile:
    json.dump(all_csvs, outfile)
logging.debug("Successfully download CSVs into data/csvs.json")
