import { Meteor } from 'meteor/meteor';
import { ExportsCollection } from '/imports/db/ExportsCollection';

Meteor.publish('exports', function publishExports() {
  return ExportsCollection.find({ userId: this.userId });
});