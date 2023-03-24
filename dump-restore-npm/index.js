const { execSync } = require("child_process");
const { MongoClient } = require("mongodb");
const restore = require("mongodb-restore-dump");
const path = require("path");

// 1 dump mongodb service
exports.mongodbDump = async function (uri) {
  try {
    const validatedDumpUri = uriValidation(uri);

    if (validatedDumpUri) {
      const myCollectionName = [];

      const getDatabaseName = uri.split("/");

      //user dump uri string
      const userDumpUri = new MongoClient(uri, { useNewUrlParser: true });
      userDumpUri.connect();

      //find collection name
      const collections = await userDumpUri
        .db(getDatabaseName[3])
        .listCollections()
        .toArray();
      collections.map((item) => myCollectionName.push(item.name));

      myCollectionName.forEach(async (collectionName) => {
        const command = `mongodump --uri ${uri} --collection ${collectionName} --out ./dumpFile/`;
        execSync(command, (err, stdout, stderr) => {
          if (err)
            return {
              message: `Backup Failed..! ${err.message}`,
              status: false,
            };
        });
      });

      return { message: "Backup Completed..!", status: true };
    } else return { message: "Dump Failed check uri...!", status: false };
  } catch (err) {
    console.log(err);
    return { message: err.message, status: false };
  }
};

// 2 restore database collections
exports.mongodbRestore = async function (uri, dbName) {
  try {
    const validatedDumpUri = uriValidation(uri);

    const getDatabaseName = uri.split("/");

    if (validatedDumpUri) {
      await restore.database({
        uri,
        database: getDatabaseName[3],
        from: path.resolve("dumpFile", dbName),
        dropCollections: true,
        metadata: true,
        jsonArray: true,
        verbose: true,
      });

      return { message: "restore completed..!", status: true };
    } else return { message: "Restore Failed check uri...!", status: false };
  } catch (err) {
    console.log(err);
    return { message: err.message, status: false };
  }
};

//uri dump and restore validation using regex
function uriValidation(uri) {
  const localRegEx =
    /mongodb:[^a-z A-Z 0-9][//]localhost:27017[/][a-z A-z 0-9]/;

  const serverRegEx =
    /mongodb[+]srv:[^a-z A-Z 0-9][//]([\w]+:)([a-z A-Z 0-9]+@)([a-z A-Z 0-9]+[\.\-])([a-z A-Z 0-9]+[\.\-])mongodb.net[//]/;

  if (localRegEx.test(uri)) return true;
  else return serverRegEx.test(uri);
}
