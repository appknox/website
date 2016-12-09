require 'json'

module Jekyll

  class RedirectGenerator < Generator

    def generate(site)
      @site = site

      process_yaml
    end

    def process_yaml
      file_path = @site.source + "/_data/_redirects.yml"
      if File.exists?(file_path)
        YAML.load_file(file_path).each do | new_url, old_url |
          generate_aliases( old_url, new_url )
        end
      end
    end

    def generate_aliases(destination_path, aliases)
      alias_paths ||= Array.new
      alias_paths << aliases
      alias_paths.compact!

      alias_paths.flatten.each do |alias_path|
        alias_path = alias_path.to_s

        alias_dir  = File.extname(alias_path).empty? ? alias_path : File.dirname(alias_path)
        alias_file = File.extname(alias_path).empty? ? "index.html" : File.basename(alias_path)

        fs_path_to_dir   = File.join(@site.dest, alias_dir)
        alias_index_path = File.join(alias_dir, alias_file)

        FileUtils.mkdir_p(fs_path_to_dir)

        File.open(File.join(fs_path_to_dir, alias_file), 'w') do |file|
          file.write(alias_template(destination_path))
        end

        (alias_index_path.split('/').size + 1).times do |sections|
          @site.static_files << RedirectFile.new(@site, @site.dest, alias_index_path.split('/')[1, sections + 1].join('/'), '')
        end
      end
    end

    def alias_template(destination_path)
      <<-EOF
      <!DOCTYPE html>
      <html>
      <head>
      <link rel="canonical" href="#{destination_path}"/>
      <meta http-equiv="content-type" content="text/html; charset=utf-8" />
      <meta http-equiv="refresh" content="0; url=#{destination_path}" />
      </head>
      </html>
      EOF
    end
  end

  class RedirectFile < StaticFile
    require 'set'

    def destination(dest)
      File.join(dest, @dir)
    end

    def modified?
      return false
    end

    def write(dest)
      return true
    end
  end
end
