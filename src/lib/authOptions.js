import https from 'https';
import dns from 'dns';
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

const ipv4Agent = new https.Agent({
  lookup: (hostname, options, callback) => {
    dns.lookup(hostname, { ...options, family: 4 }, callback);
  }
});

import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { sendOTPEmail } from '@/lib/email';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      httpOptions: {
        timeout: 10000,
        agent: ipv4Agent,
      },
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text', placeholder: 'your@email.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter both email and password');
        }

        await connectDB();

        const user = await User.findOne({ email: credentials.email.toLowerCase() }).select('+password');

        if (!user) {
          throw new Error('No user found with this email');
        }

        if (!user.isActive) {
          throw new Error('Your account has been suspended. Please contact support.');
        }

        if (!user.password) {
          throw new Error('Please login using your social account');
        }

        const isPasswordMatch = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordMatch) {
          throw new Error('Incorrect password');
        }

        // Update last login timestamp
        await User.findByIdAndUpdate(user._id, { lastLoginAt: new Date() });

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar || '',
          isEmailVerified: user.isEmailVerified,
          // Require OTP if email not verified (credentials users who skipped OTP somehow)
          needsOtpVerification: !user.isEmailVerified,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      console.log('🔑 [NextAuth] signIn callback — provider:', account?.provider, 'email:', user?.email);

      if (account.provider === 'google') {
        try {
          await connectDB();
          let dbUser = await User.findOne({ email: user.email });

          let isNew = false;
          if (!dbUser) {
            // ── Brand new Google user ──
            isNew = true;
            console.log('🔑 [NextAuth] New Google user — creating account...');

            // Generate OTP for email verification
            const otp = String(Math.floor(100000 + Math.random() * 900000));
            const hashedOtp = await bcrypt.hash(otp, 10);
            const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

            dbUser = await User.create({
              name: user.name,
              email: user.email,
              avatar: user.image || '',
              role: 'student',
              provider: 'google',
              isEmailVerified: false,         // ← Must verify via OTP
              hasSelectedRole: false,
              lastLoginAt: new Date(),
              emailOtp: { code: hashedOtp, expiresAt: otpExpiresAt, attempts: 0 },
            });

            // Send OTP email (non-blocking)
            sendOTPEmail(user.email, user.name, otp).catch(err =>
              console.error('❌ [NextAuth] OTP email failed:', err.message)
            );

            console.log('🔑 [NextAuth] New Google user created. OTP sent to:', user.email);
          } else {
            // ── Returning Google user ──
            if (!dbUser.isActive) {
              console.log('🔑 [NextAuth] User suspended — rejecting sign-in.');
              return false;
            }
            await User.findByIdAndUpdate(dbUser._id, {
              lastLoginAt: new Date(),
              avatar: dbUser.avatar || user.image || '',
            });
            console.log('🔑 [NextAuth] Returning Google user — login OK.');
          }

          user.id = dbUser._id.toString();
          user.role = dbUser.role;
          user.avatar = dbUser.avatar || user.image || '';
          user.needsRoleSelection = isNew || !dbUser.hasSelectedRole;
          // ← Require OTP if NOT yet email-verified
          user.needsOtpVerification = !dbUser.isEmailVerified;

          console.log('🔑 [NextAuth] needsOtpVerification:', user.needsOtpVerification, 'needsRoleSelection:', user.needsRoleSelection);
          return true;
        } catch (error) {
          console.error('❌ [NextAuth] Error in signIn callback:', error);
          return false;
        }
      }

      // Credentials provider — signIn always returns true (authorized by `authorize`)
      return true;
    },

    async jwt({ token, user, trigger, session: sessionUpdate }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.avatar = user.avatar || '';
        token.needsRoleSelection = user.needsRoleSelection || false;
        token.needsOtpVerification = user.needsOtpVerification || false;
      }
      // Handle session.update() calls (e.g., after OTP verified or role selected)
      if (trigger === 'update' && sessionUpdate) {
        if (sessionUpdate.role) token.role = sessionUpdate.role;
        if (sessionUpdate.name) token.name = sessionUpdate.name;
        if (sessionUpdate.needsRoleSelection === false) token.needsRoleSelection = false;
        if (sessionUpdate.needsOtpVerification === false) token.needsOtpVerification = false;
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.avatar = token.avatar || '';
        session.user.needsRoleSelection = token.needsRoleSelection || false;
        session.user.needsOtpVerification = token.needsOtpVerification || false;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  useSecureCookies: process.env.NODE_ENV === 'production',
  secret: process.env.NEXTAUTH_SECRET,
};
