export const REGEX = {
  htmlTag: /<[^>]*>/g,
  name: /([A-Z0-9]+[A-Za-z0-9'’&\-]+)(( [Aa]nd | [Oo]f | [Tt]he | ([A-Z]\.?){1,} | ([0-9]+) | & | - | ?)(?:[A-Z0-9]{1,}[A-Za-z0-9'’&\-]+))*/g,
  email: /[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+/g,
  socialMedia: /(?<url>(http|ftp|https:\/\/)[\w_-]+(?:(?:\.[\w_-]+)+)[\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-])/g,
  nonLetters: /[^A-Za-z]+/g,
  sentence: (word) => `([^.]+|^)${word}([^.]+|.)`,
  scriptTag: /<script[^>]*>(?:[^<]+|<(?!\/script>))+/g,
};
