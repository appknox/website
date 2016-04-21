#!/usr/bin/env ruby
#
# utils.rb
# Copyright (C) 2016 dhilipsiva <dhilipsiva@gmail.com>
#
# Distributed under terms of the MIT license.
#


module Jekyll

	class AKIconTag < Liquid::Tag

		def initialize(tag_name, text, tokens)
			super
			@text = text
		end

		def render(context)
			case @text
			when /linkedin/
				"linkedin"
			when /twitter/
				"twitter"
			when /facebook/
				"facebook"
			when /github/
				"github"
			when /@/
				"envelope"
			else
				"globe"
			end
		end
	end

	class AKLinkTag < Liquid::Tag

		def initialize(tag_name, text, tokens)
			super
			@text = text
		end

		def render(context)
			if @text.include? "@"
				"mailto://#{@text}"
			else
				"#{@text}"
			end
		end
	end

end

Liquid::Template.register_tag('ak_icon', Jekyll::AKIconTag)
Liquid::Template.register_tag('ak_link', Jekyll::AKLinkTag)
