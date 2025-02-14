const ParentsFeedback = require("../schema/parentsFeedback");
const createCSVWriter = require("csv-writer").createObjectCsvWriter;
const fs = require("fs");
const csv = require("csv-parser");

const { jsonFormater } = require("../helper/util");

const parentsFeedbackHeader = [
  { id: "_id", title: "Key" },
  { id: "studentName", title: "Student Name" },
  { id: "parentName", title: "Parent Name" },
  { id: "mobile", title: "Mobile" },
  { id: "parentOccupation", title: "Parent Occupation" },
  { id: "ParentsSuggestions", title: "Parents Suggestions" },
  { id: "date", title: "Date" },
  { id: "expectations", title: "Expectations" },
  { id: "fulfill", title: "Fulfill" },
  { id: "reasons", title: "Reasons" },
];

const fileURL = "./download/parentsFeedback.csv";

const csvWriter = createCSVWriter({
  path: fileURL,
  header: parentsFeedbackHeader,
});

module.exports.getData = (req, res) => {
  ParentsFeedback.find({})
    .then((result) => {
      return res.status(201).json(result);
    })
    .catch((err) => {
      return res.status(400).json({ error: err });
    });
};

module.exports.postData = async (req, res) => {
  try {
    const data = req.body;
    await ParentsFeedback.insertMany(data)
      .then((result) => {
        return res.status(201).json({ msg: "success" });
      })
      .catch((err) => {
        return res.status(400).json({ error: err });
      });
  } catch (err) {
    return res.status(400).json({ error: err });
  }
};

module.exports.deleteData = async (req, res) => {
  try {
    const data = req.body;

    await ParentsFeedback.deleteOne(data)
      .then((result) => {
        ParentsFeedback.find({})
          .then((output) => {
            return res.status(201).json(output);
          })
          .catch((err) => {
            return res.status(400).json({ error: err });
          });
      })
      .catch((err) => {
        return res.status(400).json({ error: err });
      });
  } catch (err) {
    return res.status(400).json({ error: err });
  }
};

module.exports.updateOne = async (req, res) => {
  try {
    const data = req.body;

    await ParentsFeedback.updateOne({ _id: data["_id"] }, data)
      .then((result) => {
        ParentsFeedback.find({})
          .then((output) => {
            return res.status(201).json(output);
          })
          .catch((err) => {
            return res.status(400).json({ error: err });
          });
      })
      .catch((err) => {
        return res.status(400).json({ error: err });
      });
  } catch (err) {
    return res.status(400).json({ error: err });
  }
};

module.exports.downloadData = async (req, res) => {
  var dataList = [];

  try {
    fs.unlinkSync(fileURL);
  } catch (err) {
    console.log("File not found!");
  }

  await ParentsFeedback.find({})
    .then((data) => {
      dataList.push(data);
    })
    .catch((err) => {
      console.log(err);
      return res.status(400).json({ error: err });
    });

  dataList.forEach((data) => {
    csvWriter
      .writeRecords(data)
      .then(() => {
        return res.download(fileURL);
      })
      .catch((err) => {
        console.log(err);
        return res.status(400).json({ error: err });
      });
  });
};

module.exports.uploadData = async (req, res) => {
  try {
    fs.createReadStream(fileURL)
      .pipe(csv())
      .on("data", async (row) => {
        newData = jsonFormater(row, "parentsFeedback");
        if (newData["_id"] === "") {
          delete newData["_id"];
          await ParentsFeedback.insertMany(newData)
            .then((result) => {
              console.log("Inserted Data");
            })
            .catch((err) => {
              return res.status(400).json({ error: err });
            });
        } else {
          await ParentsFeedback.updateOne({ _id: newData["_id"] }, newData)
            .then((data) => {
              console.log("Update Successful!");
            })
            .catch((err) => {
              return res.status(400).json({ error: err });
            });
        }
      })
      .on("end", () => {
        return res.status(201).json({ msg: "success" });
      });
  } catch (err) {
    return res.status(400).json({ error: err });
  }
};

module.exports.getParentsFeedback = (req, res) => {
  try {
    const data = req.params.courseCode;

    ParentsFeedback.find({}).then((result) => {
      var expectations = [];
      var fullfill = [];
      var reasons = [];

      result.forEach((element) => {
        expectations.push(element["expectations"]);
        fullfill.push(element["fulfill"]);
        element["reasons"].forEach((elem) => {
          reasons.push(elem);
        });
      });

      return res.status(201).json([expectations, fullfill, reasons]);
    });
  } catch (err) {
    return res.status(400).json({ error: err });
  }
};
