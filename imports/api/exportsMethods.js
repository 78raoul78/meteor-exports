import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { ExportsCollection } from "../db/ExportsCollection";

export const exportProgressionPeriodInMs = 1000; // corresponds to the delay we wait before increasing the export progression
export const exportProgressionMarginInPercentage = 5; // correponds to the percentage increase value at each progression update

const urls = [
  "https://www.lempire.com/",
  "https://www.lemlist.com/",
  "https://www.lemverse.com/",
  "https://www.lemstash.com/",
];

const pickRandomElement = (elements) => {
  const randomElement = elements[Math.floor(Math.random() * elements.length)];
  return randomElement;
};

const handleExportCompleted = ({ insertedExportId, intervalId }) => {
  const randomUrl = pickRandomElement(urls);
  ExportsCollection.update(
    { _id: insertedExportId },
    { $set: { result: randomUrl } }
  );
  Meteor.clearInterval(intervalId);
};

const getExportProgressionInPercentage = (exportId) => {
  return ExportsCollection.findOne({
    _id: exportId,
  })?.progressionInPercentage;
};

const increaseExportProgression = ({ exportId }) => {
  ExportsCollection.update(
    { _id: exportId },
    {
      $inc: {
        progressionInPercentage: exportProgressionMarginInPercentage,
      },
    }
  );
};

Meteor.methods({
  "exports.insert"() {
    if (!this.userId) {
      throw new Meteor.Error("Not authorized.");
    }

    const insertedExportId = ExportsCollection.insert({
      progressionInPercentage: 0,
      createdAt: new Date(),
      userId: this.userId,
    });

    const intervalId = Meteor.setInterval(() => {
      const currentProgressionInPercentage =
        getExportProgressionInPercentage(insertedExportId);

      if (currentProgressionInPercentage === 100) {
        handleExportCompleted({ insertedExportId, intervalId });
      } else {
        increaseExportProgression({
          exportId: insertedExportId,
        });
      }
    }, exportProgressionPeriodInMs);
  },

  "exports.remove"(exportId) {
    check(exportId, String);

    if (!this.userId) {
      throw new Meteor.Error("Not authorized.");
    }

    const exportToDelete = ExportsCollection.findOne({
      _id: exportId,
      userId: this.userId,
    });

    if (!exportToDelete) {
      throw new Meteor.Error("Access denied.");
    }

    ExportsCollection.remove(exportId);
  },
});
