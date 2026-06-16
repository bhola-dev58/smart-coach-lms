import dns from 'dns';
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

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
      httpOptions: {
        timeout: 10000, // 10 seconds timeout instead of the default 3.5 seconds
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
      console.log('🔑 [NextAuth] signIn callback triggered for provider:', account?.provider, 'email:', user?.email);
      if (account.provider === 'google') {
        try {
          console.log('🔑 [NextAuth] Connecting to MongoDB...');
          await connectDB();
          console.log('🔑 [NextAuth] Connected to MongoDB. Finding user by email...');
          let dbUser = await User.findOne({ email: user.email });
          console.log('🔑 [NextAuth] FindOne query completed. User found:', !!dbUser);
          
          let isNew = false;
          if (!dbUser) {
            isNew = true;
            console.log('🔑 [NextAuth] Existing user not found. Creating new student user...');
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
            console.log('🔑 [NextAuth] New student user created successfully, ID:', dbUser._id);
          } else {
            if (!dbUser.isActive) {
              console.log('🔑 [NextAuth] User is suspended/inactive. Rejecting sign-in.');
              return false;
            }
            console.log('🔑 [NextAuth] User exists. Updating last login and profile avatar if needed...');
            await User.findByIdAndUpdate(dbUser._id, {
              lastLoginAt: new Date(),
              avatar: dbUser.avatar || user.image || '',
            });
            console.log('🔑 [NextAuth] User update completed successfully.');
          }
          user.id = dbUser._id.toString();
          user.role = dbUser.role;
          user.avatar = dbUser.avatar || user.image || '';
          // Show role selection popup if Google user hasn't chosen a role yet
          user.needsRoleSelection = isNew || !dbUser.hasSelectedRole;
          console.log('🔑 [NextAuth] signIn callback returning true. needsRoleSelection:', user.needsRoleSelection);
          return true;
        } catch (error) {
          console.error('❌ [NextAuth] Error inside signIn callback:', error);
          return false;
        }
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
