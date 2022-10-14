const authResultStatus = {
    successful: 1,
    emailAlreadyExists: 2,
    wrongPassword: 3,
    invalidEmail: 4,
    userNotFound: 5,
    userDisabled: 6,
    operationNotAllowed: 7,
    tooManyRequests: 8,
    weakPassword: 9,
    undefined: 10,
    emailNotVerified: 11,
    noInternet: 12,
    requireRecentLogin: 13,
  }

export const authExceptionHandler = {
    handleException(e) {
      let status;
      switch (e.code) {
        case "auth/invalid-email":
          status = authResultStatus.invalidEmail;
          break;
        case "auth/wrong-password":
          status = authResultStatus.wrongPassword;
          break;
        case "auth/user-not-found":
          status = authResultStatus.userNotFound;
          break;
        case "auth/user-disabled":
          status = authResultStatus.userDisabled;
          break;
        case "auth/too-many-requests":
          status = authResultStatus.tooManyRequests;
          break;
        case "auth/operation-not-allowed":
          status = authResultStatus.operationNotAllowed;
          break;
        case "auth/email-already-in-use":
          status = authResultStatus.emailAlreadyExists;
          break;
          case "auth/weak-password":
          status = authResultStatus.weakPassword;
          break;
          case 'auth/email-not-verified':
          status = authResultStatus.emailNotVerified;
          break;
          case 'auth/network-request-failed':
          status = authResultStatus.noInternet;
          break;
          case 'auth/requires-recent-login':
          status = authResultStatus.requireRecentLogin;
          break;
        default:
          status = authResultStatus.undefined;
      }
       authResultStatus.status = status;
      return authResultStatus.status;
    }, 
    generateExceptionMessage(exceptionCode) {
        var errorMessage;
        switch (exceptionCode) {
          case authResultStatus.invalidEmail:
            errorMessage = "Your email address appears to be malformed.";
            break;
          case authResultStatus.wrongPassword:
            errorMessage = "Your password is wrong.";
            break;
          case authResultStatus.userNotFound:
            errorMessage = "User with this email doesn't exist.";
            break;
          case authResultStatus.userDisabled:
            errorMessage = "User with this email has been disabled.";
            break;
          case authResultStatus.tooManyRequests:
            errorMessage = "Too many requests. Try again later.";
            break;
          case authResultStatus.operationNotAllowed:
            errorMessage = "Signing in with Email and Password is not enabled.";
            break;
          case authResultStatus.emailAlreadyExists:
            errorMessage =
                "The email has already been registered. Please login or reset your password.";
            break;
            case authResultStatus.weakPassword:
            errorMessage =
                "The password is weak. please enter a password with at least 6 characters.";
            break;
            case authResultStatus.emailNotVerified:
            errorMessage = 'The email address isn\'t verified yet.';
            break;
            case authResultStatus.noInternet:
            errorMessage = 'Check your internet connection.';
            break;
            case authResultStatus.requireRecentLogin:
            errorMessage = 'Something wrong occured. Leave the app then come back and try again.';
            break;
          default:
            errorMessage = "An undefined Error happened.";
        }
        return errorMessage;
      }
}

