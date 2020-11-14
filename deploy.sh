#!/usr/bin/env sh

#abort on errors
set -e

# build
npm run build

# navigate into the build output directory
cd docs/.vuepress/dist

git init
git add -A
git commit -m 'deploy with vuepress'

git push -f https://github.com/jinwoojimmy/toby-study.git master:gh-pages

cd -
