#!/bin/bash

pushd frontend
yarn
yarn build
popd
pushd server
yarn
yarn server
