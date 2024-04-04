const fs = require("fs");
const _ = require("lodash");
const stringSimilarity = require("string-similarity");

function similarity(s1, s2) {
  var longer = s1;
  var shorter = s2;
  if (s1.length < s2.length) {
    longer = s2;
    shorter = s1;
  }
  var longerLength = longer.length;
  if (longerLength == 0) {
    return 1.0;
  }
  return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
}

function editDistance(s1, s2) {
  s1 = s1.toLowerCase();
  s2 = s2.toLowerCase();

  var costs = new Array();
  for (var i = 0; i <= s1.length; i++) {
    var lastValue = i;
    for (var j = 0; j <= s2.length; j++) {
      if (i == 0) costs[j] = j;
      else {
        if (j > 0) {
          var newValue = costs[j - 1];
          if (s1.charAt(i - 1) != s2.charAt(j - 1)) newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }
  return costs[s2.length];
}

function isCapitalizedWord(word) {
  try {
    let split = word.split("");
    if (split.length === 0) return false;
    return split[0] === split[0].toUpperCase();
  } catch (err) {
    return false;
  }
}

function isCapitalizedSentence(sentence) {
  return sentence.split(" ").every((y) => isCapitalizedWord(y));
}

let crawls = JSON.parse(fs.readFileSync("out.json"));

console.log(crawls.personalNames[2].name, crawls.personalNames[2].context.length);

// console.log(out.map((x) => x.name));
// // console.log(crawls.personalNames[2]);

// console.log(crawls.personalNames[2].name, crawls.personalNames[2].context.length);

// fs.writeFileSync("names.txt", _.uniq(crawls.otherNames.map((x) => x.name)).join("\n"));
// fs.writeFileSync("out.json", JSON.stringify(crawls));

const { convert } = require("html-to-text");

// fs.writeFileSync(
//   "out.txt",
//   convert(
//     fs.readFileSync(
//       "data/Cache/thegrowthop.com/aHR0cHM6Ly90aGVncm93dGhvcC5jb20vbmV3cy9sb2NhbC1uZXdzL21ham9yLWNhbm5hYmlzLWNvcnBvcmF0aW9ucy1yZXRhaWwtY2hhaW4tY29tZXMtdG8tcmVnaW5hL3djbS84NmI2ZTA0Yi04OTg1LTQ2MWYtOWE2Zi1mNjUyZTk0OTNlNTc.html"
//     ),
//     {
//       wordwrap: null,
//     }
//   )
// );

let tommy = {
  name: "Tommy Chong",
  context: [
    {
      tag: "Medium Heading (H3)",
      sentence: "#Cannabis: Canada keeping black market alive Tommy Chong says",
      hyperlinks: [],
      id: 1,
    },
    {
      tag: "List Item",
      sentence: "#Cannabis: Canada keeping black market alive Tommy Chong says",
      hyperlinks: [
        {
          text: "#Cannabis: Canada keeping black market alive, Tommy Chong says",
          link: "https://montrealgazette.com/life/cannabis-canada-keeping-black-market-alive-tommy-chong-says",
        },
      ],
      id: 4,
    },
    {
      tag: "Medium Heading (H3)",
      sentence: "Tommy Chong on Twitter: Buy a loved one a blue tick this Christmas I'll throw in a bag of weed",
      hyperlinks: [],
      id: 0,
    },
    {
      tag: "Medium Heading (H3)",
      sentence: "Tommy Chong on Twitter: Buy a loved one a blue tick this Christmas I'll throw in a bag of weed",
      hyperlinks: [],
      id: 2,
    },
    {
      tag: "List Item",
      sentence: "Tommy Chong on Twitter: Buy a loved one a blue tick this Christmas I'll throw in a bag of weed",
      hyperlinks: [
        {
          text: "Tommy Chong on Twitter: 'Buy a loved one a blue tick this Christmas I’ll throw in a bag of weed'",
          link: "/cannabis-news/tommy-chong-on-twitter-buy-a-loved-one-a-blue-tick-this-christmas-ill-throw-in-a-bag-of-weed",
        },
        {
          text: "",
          link: "/cannabis-news/tommy-chong-on-twitter-buy-a-loved-one-a-blue-tick-this-christmas-ill-throw-in-a-bag-of-weed",
        },
      ],
      id: 3,
    },
    {
      tag: "List Item",
      sentence: "Tommy Chong on Twitter: Buy a loved one a blue tick this Christmas I'll throw in a bag of weed",
      hyperlinks: [
        {
          text: "Tommy Chong on Twitter: 'Buy a loved one a blue tick this Christmas I’ll throw in a bag of weed'",
          link: "/cannabis-news/tommy-chong-on-twitter-buy-a-loved-one-a-blue-tick-this-christmas-ill-throw-in-a-bag-of-weed",
        },
        {
          text: "",
          link: "/cannabis-news/tommy-chong-on-twitter-buy-a-loved-one-a-blue-tick-this-christmas-ill-throw-in-a-bag-of-weed",
        },
      ],
      id: 5,
    },
  ],
};

let context = tommy.context;

_.orderBy(context, (ctx) => ctx.sentence.length, "asc").forEach((ctx, i) => {
  context.forEach((x, j) => {
    if (
      x.id !== ctx.id &&
      (x.sentence.includes(ctx.sentence) || stringSimilarity.compareTwoStrings(x.sentence, ctx.sentence) >= 0.8)
    ) {
      context.splice(i, 1);
    }
  });
});

console.log(context);
