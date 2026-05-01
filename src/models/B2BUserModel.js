export class B2BUserModel {
  constructor({ uid, username, mobile, email, password, confirmPassword, pan = "", aadhaar = "" }) {
    this.uid = uid;
    this.username = username;
    this.mobile = mobile;
    this.email = email;

    this.password = undefined;
    this.confirmPassword = undefined;

    this.pan = pan;
    this.aadhaar = aadhaar;

    this.role = "B2B";
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}
