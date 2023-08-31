import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import "/imports/api/exportsMethods";
import "/imports/api/exportsPublications";

const SEED_USERNAME = "meteorite";
const SEED_PASSWORD = "password";

const accounts = [
  {
    username: SEED_USERNAME,
    password: SEED_PASSWORD,
  },
];

Meteor.startup(() => {
  if (!Accounts.findUserByUsername(SEED_USERNAME)) {
    accounts.forEach((account) => Accounts.createUser(account));
  }
});
