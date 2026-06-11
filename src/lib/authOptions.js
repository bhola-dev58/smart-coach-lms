import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
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

        // Find user by email and explicitly select the +password field
        const user = await User.findOne({ email: credentials.email.toLowerCase() }).select('+password');

        if (!user) {
          throw new Error('No user found with this email');
        }

        // Block inactive/suspended accounts
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
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account.provider === 'google') {
        await connectDB();
        let dbUser = await User.findOne({ email: user.email });
        let isNew = false;
        if (!dbUser) {
          isNew = true;
          dbUser = await User.create({
            name: user.name,
            email: user.email,
            avatar: user.image || '',
            role: 'student',
            provider: 'google',
            isEmailVerified: true,
            hasSelectedRole: false, // Must select role on first login
            lastLoginAt: new Date(),
          });
        } else {
          if (!dbUser.isActive) return false;
          await User.findByIdAndUpdate(dbUser._id, {
            lastLoginAt: new Date(),
            avatar: dbUser.avatar || user.image || '',
          });
        }
        user.id = dbUser._id.toString();
        user.role = dbUser.role;
        user.avatar = dbUser.avatar || user.image || '';
        // Show role selection popup if Google user hasn't chosen a role yet
        user.needsRoleSelection = isNew || !dbUser.hasSelectedRole;
        return true;
      }
      return true;
    },
    // 1. JWT callback is called whenever a token is created or updated
    async jwt({ token, user, trigger, session: sessionUpdate }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.avatar = user.avatar || '';
        token.needsRoleSelection = user.needsRoleSelection || false;
      }
      // Handle session update (called after role/profile is set during onboarding)
      if (trigger === 'update' && sessionUpdate) {
        if (sessionUpdate.role) token.role = sessionUpdate.role;
        if (sessionUpdate.name) token.name = sessionUpdate.name;
        if (sessionUpdate.needsRoleSelection === false) token.needsRoleSelection = false;
      }
      return token;
    },
    // 2. Session callback is called whenever the session is checked
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.avatar = token.avatar || '';
        session.user.needsRoleSelection = token.needsRoleSelection || false;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/login', // Custom login page URL
  },
  session: {
    strategy: 'jwt', // Ensure we use JWT for stateless auth
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  useSecureCookies: process.env.NODE_ENV === 'production',
  secret: process.env.NEXTAUTH_SECRET,
};
