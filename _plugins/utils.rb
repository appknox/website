module Jekyll
  class AKIconTag < Liquid::Tag

    def initialize(tag_name, text, tokens)
      super
      @text = text
    end

    def render(context)
      case @text
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

Liquid::Template.register_tag('context_icon', Jekyll::AKIconTag)
Liquid::Template.register_tag('context_link', Jekyll::AKLinkTag)
