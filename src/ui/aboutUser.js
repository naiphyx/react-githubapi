import React from "react";
import { observer, inject } from "mobx-react";
import { PENDING, REJECTED, FULFILLED } from "mobx-utils";
import { Spinner, Button } from "@blueprintjs/core";

function Authenticated(Component) {
  return inject("sessionStore") 
  (observer(function ({sessionStore}) {
    if (sessionStore.authenticated) {
      return <Component/>
    } else {
      return null;
    }
  }));
}

export default inject("sessionStore")(
  observer(
    class AboutUser extends React.Component {
      constructor({ sessionStore }) {
        super();
      }
      renderUserData() {
        const {sessionStore} = this.props;

        if (sessionStore.authenticated) {
          const user = sessionStore.userDeferred.value;
          const state = sessionStore.userDeferred.state;
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
                    <p>Rejected</p>
                  </div>
                </div>
              );
            }
            case FULFILLED: {
              return (
                <div>
                  <img src={user.avatar_url} alt="user" />
                  <p>{user.login}</p>
                </div>
              )
              break;
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
        return (
          <div>
            <h1>About</h1>
            {this.renderUserData()}
          </div>
        );
      }
    }
  )
);
