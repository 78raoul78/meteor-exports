import { Meteor } from "meteor/meteor";
import { Random } from "meteor/random";
import * as sinon from "sinon";
import { mockMethodCall } from "meteor/quave:testing";
import { assert, expect } from "chai";
import { ExportsCollection } from "/imports/db/ExportsCollection";
import "/imports/api/exportsMethods";
import {
  exportProgressionMarginInPercentage,
  exportProgressionPeriodInMs,
} from "/imports/api/exportsMethods";

if (Meteor.isServer) {
  describe("Exports", () => {
    describe("methods", () => {
      const userId = Random.id();
      let exportId;
      let clock;

      beforeEach(() => {
        ExportsCollection.remove({});
        exportId = ExportsCollection.insert({
          userId,
          createdAt: new Date(),
          progressionInPercentage: 0,
        });

        clock = sinon.useFakeTimers();
      });
      afterEach(() => {
        clock.restore();
      });

      it("can delete own export", () => {
        mockMethodCall("exports.remove", exportId, { context: { userId } });

        assert.equal(ExportsCollection.find().count(), 0);
      });

      it("can't delete export without an user authenticated", () => {
        const fn = () => mockMethodCall("exports.remove", exportId);
        assert.throw(fn, /Not authorized/);
        assert.equal(ExportsCollection.find().count(), 1);
      });

      it("can't delete export from another owner", () => {
        const fn = () =>
          mockMethodCall("exports.remove", exportId, {
            context: { userId: "somebody-else-id" },
          });
        assert.throw(fn, /Access denied/);
        assert.equal(ExportsCollection.find().count(), 1);
      });

      it("can insert new export", () => {
        mockMethodCall("exports.insert", {
          context: { userId },
        });

        const exports = ExportsCollection.find({}).fetch();
        assert.equal(exports.length, 2);
        assert.isTrue(exports.some((exp) => exp.userId === userId));
      });

      it(`export progression is updated by ${exportProgressionMarginInPercentage}% every ${exportProgressionPeriodInMs} ms until reaching 100% `, () => {
        ExportsCollection.remove({});

        mockMethodCall("exports.insert", {
          context: { userId },
        });

        const nbExpectedUpdateCalls = 100 / exportProgressionMarginInPercentage;

        let initialProgression = ExportsCollection.findOne({
          userId,
        }).progressionInPercentage;
        expect(initialProgression).equals(0);

        for (let call = 1; call <= nbExpectedUpdateCalls; call++) {
          clock.tick(exportProgressionPeriodInMs);

          const currentProgression = ExportsCollection.findOne({
            userId,
          }).progressionInPercentage;

          expect(currentProgression).equals(
            initialProgression + exportProgressionMarginInPercentage
          );
          initialProgression = currentProgression;
        }
      });

      it(`mongo update is called every ${exportProgressionPeriodInMs} ms until reaching 100% `, () => {
        ExportsCollection.remove({});
        const updateStub = sinon.stub(ExportsCollection, "update");

        mockMethodCall("exports.insert", {
          context: { userId },
        });

        const nbExpectedUpdateCalls = 100 / exportProgressionMarginInPercentage;

        for (let call = 1; call <= nbExpectedUpdateCalls; call++) {
          clock.tick(exportProgressionPeriodInMs);

          expect(updateStub.callCount).equals(call);
        }
      });
    });
  });
}
