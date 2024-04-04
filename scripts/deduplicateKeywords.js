const _ = require("lodash");
const fs = require("fs");
const rl = require("readline");
const { duplicates } = require("./common");

const filePath = process.argv[2];

const keywords = fs.readFileSync(filePath).toString().split("\n");

const unique = _.uniq(keywords);

if (unique.length !== keywords.length) {
  const readline = rl.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log(`Found ${keywords.length - unique.length} duplicates.`);
  console.log(duplicates(keywords));

  readline.question(
    `Are you sure that you want to deduplicate file: ${filePath.split("/").pop()} (0/n/f)? `,
    (userInput) => {
      if (userInput !== "n" && userInput !== "0" && userInput !== "f") {
        console.log("Deduplicating...");
        fs.writeFileSync(filePath, _.uniq(keywords).join("\n"));
      } else {
        console.log("Deduplication aborted.");
      }

      readline.close();
    }
  );

  readline.on("close", function () {
    process.exit(0);
  });
} else {
  console.log("No duplicates found.");
}
