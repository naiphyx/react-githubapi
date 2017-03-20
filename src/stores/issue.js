import { extendObservable, action, when } from "mobx";
import { fromPromise, REJECTED } from "mobx-utils";

export default class IssueStore {
  constructor({ githubAPI, sessionStore }) {
    extendObservable(this, {
      issueDeferred: null,
      prevRepo: "issuetest",
      postIssue: action("postIssue", (repo, title, text) => {
        return githubAPI.postIssue({
          login: sessionStore.userDeferred.value.login,
          repo,
          title,
          text
        });
      }),
      fetchIssues: action("fetchIssues", (repo) => {
        when(
          // condition
          () =>
            sessionStore.authenticated && (this.issueDeferred === null || this.prevRepo !== repo),
          // ... then
          () => {
            this.issueDeferred = fromPromise(
              githubAPI.getIssues({login: sessionStore.userDeferred.value.login, repo: repo})
            );
            this.prevRepo = repo;
          });
      }),
      editIssue: action("editIssue", (repo, number, title, text) => {
        return githubAPI.editIssue({
          login: sessionStore.userDeferred.value.login,
          repo: repo,
          number: number,
          title: title,
          text: text
        })
      })
    });
  }
}
