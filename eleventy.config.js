const { eleventyImageTransformPlugin } = require("@11ty/eleventy-img");
const { HtmlBasePlugin } = require("@11ty/eleventy");
const site = require("./src/_data/site.json");

module.exports = function (eleventyConfig) {
  // Panelden yüklenen fotoğrafları otomatik küçült ve WebP'ye çevir
  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
    formats: ["webp", "jpeg"],
    widths: [480, 960, 1600],
    urlPath: "/assets/img/opt/",
    outputDir: "./_site/assets/img/opt/",
    htmlOptions: { imgAttributes: { loading: "lazy", decoding: "async", sizes: "(max-width: 800px) 100vw, 800px" } },
  });

  // GitHub Pages alt klasörü için bağlantılara önek ekler
  eleventyConfig.addPlugin(HtmlBasePlugin);

  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/admin");
  eleventyConfig.ignores.add("src/admin/**");
  eleventyConfig.addPassthroughCopy({ "src/robots.txt": "robots.txt" });

  const aylar = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];
  eleventyConfig.addFilter("trTarih", (d) => {
    const t = new Date(d);
    return `${t.getDate()} ${aylar[t.getMonth()]} ${t.getFullYear()}`;
  });
  eleventyConfig.addFilter("isoTarih", (d) => new Date(d).toISOString().slice(0, 10));
  eleventyConfig.addFilter("okumaSuresi", (html) => {
    const kelime = String(html || "").replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(kelime / 200));
  });
  eleventyConfig.addFilter("limit", (arr, n) => (arr || []).slice(0, n));
  eleventyConfig.addFilter("haric", (arr, url) => (arr || []).filter((p) => p.url !== url));
  eleventyConfig.addFilter("ayniKategori", (arr, k) => (arr || []).filter((p) => p.data.kategori === k));
  const trHarf = { ç: "c", ğ: "g", ı: "i", i: "i", ö: "o", ş: "s", ü: "u", â: "a", î: "i", û: "u" };
  eleventyConfig.addFilter("trSlug", (s) =>
    String(s || "").toLocaleLowerCase("tr").replace(/[çğıiöşüâîû]/g, (h) => trHarf[h] || h)
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""));
  eleventyConfig.addFilter("json", (v) => JSON.stringify(v));
  eleventyConfig.addFilter("tel", (s) => String(s || "").replace(/[^\d+]/g, ""));
  eleventyConfig.addFilter("urlenc", (s) => encodeURIComponent(s || ""));

  eleventyConfig.addShortcode("year", () => String(new Date().getFullYear()));
  eleventyConfig.addCollection("yazilar", (c) =>
    c.getFilteredByGlob("src/blog/*.md").sort((a, b) => b.date - a.date));
  eleventyConfig.addCollection("tarifler", (c) =>
    c.getFilteredByGlob("src/tarifler/*.md").sort((a, b) => b.date - a.date));

  return {
    pathPrefix: process.env.PATH_PREFIX || "/",
    dir: { input: "src", includes: "_includes", data: "_data", output: "_site" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
};
