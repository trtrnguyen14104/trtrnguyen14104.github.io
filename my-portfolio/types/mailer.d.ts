// Nodemailer 10 retains the SMTP API described by the latest upstream types (8.x).
// The alias keeps the patched SMTP transport separate from Auth.js' optional 7/8 peer.
declare module "cms-nodemailer" {
  import nodemailer from "nodemailer";
  export default nodemailer;
}
