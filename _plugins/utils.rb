module Jekyll
  module AKUtils
    def ak_icon(text)
      case text
      when /linkedin/ then 'linkedin'
      when /facebook/ then 'facebook'
      when /twitter/ then 'twitter'
      when /github.com/ then 'github'
      when /@/ then 'envelope'
      else 'globe'
      end
    end

    def ak_link(text)
      if text.include? '@'
        "mailto:#{text}"
      else
        text.to_s
      end
    end
  end
end

Liquid::Template.register_filter(Jekyll::AKUtils)
