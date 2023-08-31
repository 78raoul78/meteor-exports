import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import './Export.html';

Template.export.events({

  'click .delete'() {
    Meteor.call('exports.remove', this._id);
  },
});