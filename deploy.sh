#!/bin/sh
#
# deploy.sh
# Copyright (C) 2016 subho <sunny@appknox.com>
#
# Distributed under terms of the MIT license.
#

bundle exec jekyll build
git add _site/*
git commit -m "auto: deploying to github pages"
git push origin $(git rev-parse --abbrev-ref HEAD)
git subtree push --prefix _site/ origin master
