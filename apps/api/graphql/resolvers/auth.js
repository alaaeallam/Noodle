// apps/api/graphql/resolvers/auth.js
const bcrypt = require('bcryptjs');
const path = require('path');
const User = require('../../models/user');
const Owner = require('../../models/owner');
const Reset = require('../../models/reset');
const Rider = require('../../models/rider');
const { sign, TOKEN_EXP_SECONDS } = require('../../helpers/jwt');
const { transformUser, transformOwner } = require('./merge');
const { sendEmail } = require('../../helpers/email');
const {
  resetPasswordTemplate,
  resetPasswordText,
  signupTemplate,
} = require('../../helpers/templates');
const { v4 } = require('uuid');

module.exports = {
  Mutation: {
    vendorResetPassword: async (_, args, { req }) => {
      console.log('Change Passsword!');
      if (!req.isAuth) {
        throw new Error('Unauthenticated!');
      }
      try {
        const owner = await Owner.findById(req.userId);
        if (!owner) {
          throw new Error('Something went wrong. Contact Support!');
        }
        const isEqual = await bcrypt.compare(args.oldPassword, owner.password);
        if (!isEqual) {
          throw new Error('Invalid credentials!');
        }

        const hashedPassword = await bcrypt.hash(args.newPassword, 12);
        owner.password = hashedPassword;
        await owner.save();
        return true;
      } catch (error) {
        throw error;
      }
    },

    ownerLogin: async (_, { email, password }) => {
      console.log('ownerLogin');
      const owner = await Owner.findOne({ email });
      if (!owner) {
        throw new Error('User does not exist!');
      }
      const isEqual = await bcrypt.compare(password, owner.password);
      if (!isEqual) {
        throw new Error('Invalid credentials!');
      }

      // Use centralized JWT helper (reads JWT_SECRET/JWT_EXPIRES_IN)
      const token = sign({
        userId: owner.id,
        email: owner.email,
        userType: owner.userType || 'VENDOR',
      });

      const result = await transformOwner(owner);
      return { ...result,name: owner.name || result.name || '', token, tokenExpiration: TOKEN_EXP_SECONDS };
    },
    // Add this inside Mutation in apps/api/graphql/resolvers/auth.js

adminLogin: async (_, { email, password }) => {
  console.log('adminLogin');
  // Try finding an ADMIN in Owner first (most common in this codebase)
  let admin =
    (await Owner.findOne({ email, userType: 'ADMIN' })) ||
    (await User.findOne({ email, userType: 'ADMIN' })); // fallback: some projects store admin in User

  if (!admin) {
    throw new Error('Admin does not exist!');
  }

  // Password check (Owner/User both store hashed passwords in this repo)
  const isEqual = await require('bcryptjs').compare(password, admin.password);
  if (!isEqual) {
    throw new Error('Invalid credentials!');
  }

  // Sign with centralized helper (reads JWT_SECRET / JWT_EXPIRES_IN)
  const token = require('../../helpers/jwt').sign({
    userId: admin.id,
    email: admin.email,
    userType: 'ADMIN',
  });

  // Admin GraphQL type wants: userId, email, name, token
  return { token, userId: admin.id, email: admin.email, name: 'Admin' };

},

    login: async (
      _,
      { appleId, email, password, type, name, notificationToken }
    ) => {
      console.log('login', {
        appleId,
        email,
        password,
        type,
        notificationToken,
      });
      let isNewUser = false;

      let user = appleId
        ? await User.findOne({ appleId })
        : await User.findOne({ email });

      if (!user && appleId) {
        isNewUser = true;
        user = new User({
          appleId,
          email,
          name,
          notificationToken,
          isOrderNotification: !!notificationToken,
          isOfferNotification: !!notificationToken,
          userType: 'apple',
          emailIsVerified: true,
        });
      }

      if (!user && type === 'google') {
        isNewUser = true;
        user = new User({
          email,
          name,
          notificationToken,
          isOrderNotification: !!notificationToken,
          isOfferNotification: !!notificationToken,
          userType: 'google',
          emailIsVerified: true,
        });
      }

      if (!user) {
        user = await User.findOne({ phone: email });
        if (!user) throw new Error('User does not exist!');
      }

      if (type === 'default') {
        const isEqual = await bcrypt.compare(password, user.password);
        if (!isEqual) {
          throw new Error('Invalid credentials!');
        }
      }

      user.notificationToken = notificationToken;
      const result = await user.save();

      const token = sign({
        userId: result.id,
        email: result.email || result.appleId,
        userType: 'USER',
      });

      if (isNewUser) {
        const attachment = path.join(
          __dirname,
          '../../public/assets/tempImages/enatega.png'
        );
        const signupTemp = await signupTemplate({
          email: result.name,
          password: '',
        });
        sendEmail(result.email, 'Account Creation', '', signupTemp, attachment);
      }

      return {
        ...result._doc,
        email: result.email || result.appleId,
        userId: result.id,
        token,
        tokenExpiration: TOKEN_EXP_SECONDS, // <-- was 1, now correct
        isNewUser,
      };
    },

    riderLogin: async (_, args) => {
      console.log('riderLogin', args.username, args.password);
      const rider = await Rider.findOne({ username: args.username });
      if (!rider) throw new Error('Invalid credentials');

      if (rider.password !== args.password) {
        throw new Error('Invalid credentials');
      }

      rider.notificationToken = args.notificationToken;
      await rider.save();

      const token = sign({
        userId: rider.id,
        email: rider.username,
        userType: 'RIDER',
      });

      return { ...rider._doc, email: rider.username, password: '', userId: rider.id, token, tokenExpiration: TOKEN_EXP_SECONDS };
    },

    pushToken: async (_, args, { req }) => {
      if (!req.isAuth) throw new Error('Unauthenticated');
      try {
        console.log(args.token);
        const user = await User.findById(req.userId);
        user.notificationToken = args.token;
        await user.save();

        return transformUser(user);
      } catch (err) {
        throw err;
      }
    },

    forgotPassword: async (_, { email, otp }) => {
      console.log('Forgot password: ', email, ' ', otp);
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error('User does not exist!');
      }

      // generate token
      const token = v4();
      const reset = new Reset({
        user: user.id,
        token,
      });

      await reset.save();
      const resetPasswordTemp = await resetPasswordTemplate(otp);
      const resetPasswordTxt = resetPasswordText(otp);
      const attachment = path.join(
        __dirname,
        '../../public/assets/tempImages/enatega.png'
      );
      sendEmail(
        user.email,
        'Forgot Password',
        resetPasswordTxt,
        resetPasswordTemp,
        attachment
      );

      return { result: true };
    },

    resetPassword: async (_, { password, email }) => {
      console.log(password, email);
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error('Something went wrong. Please try again later!');
      }
      const hashedPassword = await bcrypt.hash(password, 12);
      user.password = hashedPassword;
      await user.save();

      return { result: true };
    },

    changePassword: async (_, { oldPassword, newPassword }, { req }) => {
      console.log('changePassword');
      try {
        if (!req.isAuth) throw new Error('Unauthenticated');
        const user = await User.findById(req.userId);
        if (!user) {
          throw new Error('User not found');
        }
        const isEqual = await bcrypt.compare(oldPassword, user.password);
        if (!isEqual) {
          throw new Error('Invalid credentials!');
        }
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        user.password = hashedPassword;
        await user.save();
        return true;
      } catch (e) {
        return false;
      }
    },

    uploadToken: async (_, args) => {
      console.log(args.pushToken);
      const user = await Owner.findById(args.id);
      if (!user) {
        throw new Error('User not found');
      }
      user.pushToken = args.pushToken;
      const result = await user.save();
      return {
        ...result._doc,
        _id: result.id,
      };
    },
  },
};