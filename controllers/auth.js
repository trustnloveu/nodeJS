//* External Libraries
const bcrypt = require("bcryptjs");

//* Models
const User = require("../models/user");

exports.getLogin = (req, res, next) => {
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    errorMessage: req.flash("login-error"),
    // isAuthenticated: false,
  });
};

exports.postLogin = (req, res, next) => {
  //! Cookie
  // res.setHeader("Set-Cookie", "login=true"); //! ; Max-age=10 ; Expires=Date ; Domain= ; Secure ...

  //! Session
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email: email })
    .then((user) => {
      // Eamil Correction
      if (!user) {
        req.flash("login-error", "Invalid eamil or passowrd.");
        return res.redirect("/login");
      }

      // Password Correction (by comparing hashed password)
      bcrypt
        .compare(password, user.password)
        .then((isMatch) => {
          if (!isMatch) return res.redirect("/login");

          req.session.isLogin = true;
          req.session.user = user;

          // (Optional) When you'd like to redirect views, and make it clear redirecting page after the session is saved
          return req.session.save((error) => {
            if (error) console.log("Session Save Error ::: " + error);
            return res.redirect("/");
          });
        })
        .catch((error) => {
          console.log(error);
        });
    })
    .catch((error) => {
      console.log(error);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((error) => {
    console.log(error);

    res.redirect("/");
  });
};

exports.getSignUp = (req, res, next) => {
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Sign-Up",
    isAuthenticated: false,
  });
};

exports.postSignUp = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  // email validation
  User.findOne({ email: email })
    .then((user) => {
      if (user) return res.redirect("/signup");

      // Hash Password
      return bcrypt
        .hash(password, 12)
        .then((hashedPassword) => {
          const newUser = new User({
            email: email,
            password: hashedPassword,
            // cart: { items: []} //! Cart will automatically set as it defined in User Schema
          });

          return newUser.save();
        })
        .catch((error) => {
          console.log(error);
        });
    })
    .then((result) => {
      res.redirect("/login");
    })
    .catch((error) => {
      console.log(error);
    });
};
