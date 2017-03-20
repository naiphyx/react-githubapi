import React from "react";
import { Spinner, Button, Intent, Toaster, Position } from "@blueprintjs/core";
import FormInput from './formInput';
import { observer, Provider, inject } from "mobx-react";



export default class SingleIssue extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      mode: 'show',
      currentValue: '',
    }
  }

  enterEditMode = () => {
    this.setState({
        mode: 'edit',
        currentValue: this.props.issue.number
    })
  }
  enterShowMode = () => {
    this.setState({mode: 'show'})
  }
  render() {
    const {updateIssue, issue, form} = this.props;
    console.log(this.state.currentValue);
    if(this.state.mode === 'show') {
      return <div>
      <div>{issue.title}</div>
      <button onClick={this.enterEditMode}>Edit</button> 
    </div>
    }
    else {
      return <Provider form={form}>
            <div>
            <h3>issue for {issue.title}</h3>
            <EditFormComponent />
            </div>
          </Provider>
    }
  }
}

const EditFormComponent = inject("form")(
  observer(function({ form }) {
    return (
      <form onSubmit={form.onSubmit}>

        <FormInput form={form} field="title" />
        <FormInput form={form} field="text" />

        {form.issueEditDeferred.case({
          pending: () => <Button type="submit" loading={true} text="edit" />,
          rejected: () => (
            <Button type="submit" className="pt-icon-repeat" text="edit" />
          ),
          fulfilled: () => (
            <Button type="submit" onClick={form.onSubmit} text="edit" />
          )
        })}
        <Button onClick={form.onClear} text="clear" />
        <Button onClick={form.onReset} text="reset" />

        <p>{form.error}</p>
      </form>
    );
  })
);