#!/bin/sh
#
# deploy.sh
# Copyright (C) 2016 subho <sunny@appknox.com>
#
# Distributed under terms of the MIT license.
#

bundle exec jekyll build
bundle exec rake minify

s3_website push --force
