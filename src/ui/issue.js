import MobxReactForm from "mobx-react-form";
import React from "react";
import { observer, Provider, inject } from "mobx-react";
import { extendObservable } from "mobx";
import { fromPromise, PENDING, REJECTED, FULFILLED } from "mobx-utils";
import { Spinner, Button, Intent, Toaster, Position } from "@blueprintjs/core";
import validatorjs from "validatorjs";
import FormInput from './formInput';
import SingleIssue from './singleissue';

const plugins = { dvr: validatorjs };

const fields = [
  {
    name: "title",
    label: "Title",
    placeholder: "Issue Title",
    rules: "required|string|between:5,10"
  },
  {
    name: "text",
    label: "Text",
    placeholder: "Issue Description",
    rules: "required|string|between:5,25"
  }
];

class IssueForm extends MobxReactForm {
  constructor(fields, options, issueStore, repo) {
    super(fields, options);
    this.issueStore = issueStore;
    this.repo = repo;

    extendObservable(this, {
      issuePostDeferred: fromPromise(Promise.resolve())
    });
  }

  onSuccess(form) {
    const { title, text } = form.values();
    const resultPromise = this.issueStore.postIssue(this.repo, title, text);
    resultPromise
      .then(() => Toaster.create({ position: Position.TOP }).show({
        message: "issue posted",
        intent: Intent.SUCCESS
      }))
      .catch(() => Toaster.create({ position: Position.TOP }).show({
        message: "failed posting issue",
        action: { text: "retry", onClick: () => form.submit() },
        intent: Intent.DANGER
      }));
    this.issuePostDeferred = fromPromise(resultPromise);
  }
}

class IssueEditForm extends MobxReactForm {
  constructor(fields, options, issueStore, repo, number) {
    super(fields, options);
    this.issueStore = issueStore;
    this.repo = repo;
    this.number = number;

    extendObservable(this, {
      issueEditDeferred: fromPromise(Promise.resolve())
    });
  }

  onSuccess(form) {
    const { title, text } = form.values();
    const resultPromise = this.issueStore.editIssue(this.repo, this.number, title, text);
    resultPromise
      .then(() => {
        Toaster.create({ position: Position.TOP }).show({
        message: "issue edited",
        intent: Intent.SUCCESS
      })
      this.issueStore.fetchIssues(this.repo);
      window.location.reload();
      })
      .catch(() => Toaster.create({ position: Position.TOP }).show({
        message: "failed editing issue",
        action: { text: "retry", onClick: () => form.submit() },
        intent: Intent.DANGER
      }));
    this.issueEditDeferred = fromPromise(resultPromise);
  }
}

const FormComponent = inject("form")(
  observer(function({ form }) {
    return (
      <form onSubmit={form.onSubmit}>

        <FormInput form={form} field="title" />
        <FormInput form={form} field="text" />

        {form.issuePostDeferred.case({
          pending: () => <Button type="submit" loading={true} text="submit" />,
          rejected: () => (
            <Button type="submit" className="pt-icon-repeat" text="submit" />
          ),
          fulfilled: () => (
            <Button type="submit" onClick={form.onSubmit} text="submit" />
          )
        })}
        <Button onClick={form.onClear} text="clear" />
        <Button onClick={form.onReset} text="reset" />

        <p>{form.error}</p>
      </form>
    );
  })
);


export default inject("issueStore", "sessionStore")(
  observer(
    class IssueFormComponent extends React.Component {
      constructor({ issueStore, sessionStore, route }) {
        super();
        issueStore.fetchIssues(route.params.repo);
        this.state = {
          form: new IssueForm({ fields }, { plugins }, issueStore, route.params.repo),
        };
      }
      renderIssueList() {
        const {sessionStore, issueStore, route} = this.props;
        const issueDeferred = issueStore.issueDeferred;
        if (sessionStore.authenticated && issueDeferred !== null) {
          const state = issueDeferred.state;
          switch (state) {
            case PENDING: {
              return <Spinner />;
            }
            case REJECTED: {
              return (
                <div className="pt-non-ideal-state">
                  <div
                    className="pt-non-ideal-state-visual pt-non-ideal-state-icon"
                  >
                    <span className="pt-icon pt-icon-error" />
                  </div> 
                  <h4 className="pt-non-ideal-state-title">Error occured</h4>
                  <div className="pt-non-ideal-state-description">
                    <Button onClick={issueStore.fetchIssues(route.params.repo)} text="retry"/>
                  </div>
                </div>
              );
            }
            case FULFILLED: {
              const issues = issueDeferred.value;
              if (issues.length > 0) {
                return (
                <div>
                <p>Existing Issues</p>
                <div>
                  {
                    issues.map(
                      (issue, index) => 
                        <SingleIssue form={new IssueEditForm({ fields }, { plugins }, issueStore, route.params.repo, issue.number)} updateIssue={issueStore.editIssue} issue={issue} key={index}/>
                      )
                  }
                </div>
                </div>
                )
              } else {
                return (
                <div><p><i>No existing issues for this repository</i></p></div>)
              }
            }
            default: {
              console.error("deferred state not supported", state);
            }
          }
        } else {
          return <h1>NOT AUTHENTICATED </h1>;
        }
      }
      render() {
        const { form } = this.state;
        const {route} = this.props;

        return (
          <Provider form={form}>
            <div>
            <h3>issue for {route.params.repo}</h3>
            <FormComponent />
            {this.renderIssueList()}
            </div>
          </Provider>
        );
      }
    }
  )
);
