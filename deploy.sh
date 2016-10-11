#!/bin/sh
#
# deploy.sh
# Copyright (C) 2016 subho <sunny@appknox.com>
#
# Distributed under terms of the MIT license.
#

git subtree push --prefix _site/ origin gh-pages
