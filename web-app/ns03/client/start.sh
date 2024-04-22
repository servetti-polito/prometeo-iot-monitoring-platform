#!/bin/bash
cd server
npm install
cd ..
npm install
yarn start
# serve -s build