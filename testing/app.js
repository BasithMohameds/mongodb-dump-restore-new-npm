const { mongodbDump, mongodbRestore } = require("basith-dump-tool");

async function myfunction() {
  const result = await mongodbDump(
    "mongodb+srv://Basith:basith@cluster0.tklaroe.mongodb.net/Assets"
  );

  console.log({ result });
}
myfunction();

async function myfunction1() {
  const result = await mongodbRestore(
    "mongodb://localhost:27017/mydump",
    "Exam"
  );

  console.log({ result });
}
myfunction1();
