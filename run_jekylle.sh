#!/usr/bin/bash
bundle exec jekyll clean 
bundle exec jekyll serve --incremental

# Run in production mode
JEKYLL_ENV=production bundle exec jekyll serve
