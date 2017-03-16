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