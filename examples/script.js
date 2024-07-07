// A sample flyscrape script.

export const config = {
  url: "https://example.com",
};

export default function ({ doc, _ }) {
  const links = doc.find("a");

  return {
    urls: links.map((link) => {
      return {
        name: link.text(),
        url: link.attr("href"),
      };
    }),
  };
}
