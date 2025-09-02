module.exports = function(eleventyConfig) {
  // Копируем только наши собственные файлы
  eleventyConfig.addPassthroughCopy("src/static");
  eleventyConfig.addPassthroughCopy("src/js");
  eleventyConfig.addPassthroughCopy("src/css");

  // Настраиваем глобальные данные
  eleventyConfig.addGlobalData("site", {
    title: "OmniBoard",
    description: "Crypto Trading Dashboard",
    descriptionShort: "Crypto Dashboard"
  });

  return {
    dir: {
      input: "src",
      output: "dist"
    },
    templateFormats: ["html", "md", "njk", "liquid"],
    markdownTemplateEngine: "liquid",
    htmlTemplateEngine: "liquid",
    dataTemplateEngine: "liquid"
  };
};
