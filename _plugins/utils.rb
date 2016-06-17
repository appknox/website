module Jekyll
  module AKUtils

    def ak_icon(text)
      case text
      when /linkedin/
        'linkedin'
      when /facebook/
        'facebook'
      when /twitter/
        'twitter'
      when /@/
        'envelope'
      else
        'globe'
      end
    end

    def ak_link(text)
      if text.include? "@"
        "mailto://#{text}"
      else
          "#{text}"
      end
    end
  end
end

Liquid::Template.register_filter(Jekyll::AKUtils)
