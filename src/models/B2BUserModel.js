export class B2BUserModel {
  constructor({ uid, username, mobile, email, password, confirmPassword, pan = "", aadhaar = "", plan_type = "free" }) {
    this.uid = uid;
    this.username = username;
    this.mobile = mobile;
    this.email = email;

    this.password = undefined;
    this.confirmPassword = undefined;

    this.pan = pan;
    this.aadhaar = aadhaar;

    this.role = "B2B";
    this.plan_type = plan_type;
    this.daily_tryon_limit = 10;
    this.daily_tryon_used = 0;
    this.last_tryon_reset_date = null;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}
