
# Password Reset Pattern

The Password Reset pattern is for adding password reset features to your Turnkey application. This pattern uses the ASP.NET Identity Package used for adding user login and registration features. This pattern can be adapted to suite your application needs.


### Features
- Resetting user passwords.
- Sending Password reset requests.

### Requirements
- MDriven Server
- Email Server

## Usage
- Merge the pattern into your model from TK Live View.
- Set the PasswordReset package's "Default superclass" if you want that.
- Make sure you have an email server set up and update the email settings of the MDriven Server.
- Create an action that opens the "ResetPasswordPage" ViewModel.
- Open the **SS_ResetPassword** ViewModel and update the **from** Column expression to the email of the sender String.


[Check Here](https://wiki.mdriven.net/Documentation:Password_Reset_Package) for more details on the Password Reset pattern.