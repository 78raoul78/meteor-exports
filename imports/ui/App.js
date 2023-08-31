import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { ExportsCollection } from "../db/ExportsCollection";
import { Tracker } from "meteor/tracker";
import { ReactiveDict } from "meteor/reactive-dict";
import "./App.html";
import "./Export";
import "./Login.js";

const HIDE_COMPLETED_STATE_KEY = "hideCompleted";
const IS_LOADING_STATE_KEY = "isLoading";

const getUser = () => Meteor.user();
const isUserLogged = () => !!getUser();

const getExportsFilter = (excludeCompleted) => {
  const user = getUser();

  const userFilter = user ? { userId: user._id } : {};
  const progressionFilter = excludeCompleted
    ? { progressionInPercentage: { $lt: 100 } }
    : {};

  return { ...userFilter, ...progressionFilter };
};

const getIncompleteExportsFilter = () => {
  const user = getUser();

  const userFilter = user ? { userId: user._id } : {};
  const incompleteFilter = { progressionInPercentage: { $lt: 100 } };

  return { ...userFilter, ...incompleteFilter };
};

Template.mainContainer.onCreated(function mainContainerOnCreated() {
  this.state = new ReactiveDict();

  const handler = Meteor.subscribe("exports");
  Tracker.autorun(() => {
    this.state.set(IS_LOADING_STATE_KEY, !handler.ready());
  });
});

Template.mainContainer.events({
  "click #hide-completed-button"(event, instance) {
    const currentHideCompleted = instance.state.get(HIDE_COMPLETED_STATE_KEY);
    instance.state.set(HIDE_COMPLETED_STATE_KEY, !currentHideCompleted);
  },
  "click .user"() {
    Meteor.logout();
  },
});

Template.mainContainer.helpers({
  exports() {
    const instance = Template.instance();
    const hideCompleted = instance.state.get(HIDE_COMPLETED_STATE_KEY);

    const filter = getExportsFilter(hideCompleted);

    if (!isUserLogged()) {
      return [];
    }

    return ExportsCollection.find(filter, {
      sort: { createdAt: -1 },
    }).fetch();
  },
  hideCompleted() {
    return Template.instance().state.get(HIDE_COMPLETED_STATE_KEY);
  },
  incompleteCount() {
    if (!isUserLogged()) {
      return "";
    }

    const filter = getIncompleteExportsFilter();

    const incompleteExportsCount = ExportsCollection.find(filter).count();
    return incompleteExportsCount
      ? `(${incompleteExportsCount} in progress)`
      : "";
  },
  isUserLogged() {
    return isUserLogged();
  },
  getUser() {
    return getUser();
  },
  isLoading() {
    const instance = Template.instance();
    return instance.state.get(IS_LOADING_STATE_KEY);
  },
});

Template.form.events({
  "submit .export-form"(event) {
    event.preventDefault();

    Meteor.call("exports.insert");
  },
});
