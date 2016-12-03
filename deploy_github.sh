#!/bin/sh
#
# deploy.sh
# Copyright (C) 2016 subho <sunny@appknox.com>
#
# Distributed under terms of the MIT license.
#

bundle exec jekyll build
git push origin `git subtree split --prefix _site/ $(git rev-parse --abbrev-ref HEAD)`:master --force
