import "iron-session";

declare module "iron-session" {
  interface IronSessionData {
    isAuthenticated?: boolean;
    // add any other custom properties here
  }
}
