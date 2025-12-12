import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { authenticator } from "otplib";

export const authOptions: NextAuthOptions = {
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/auth/signin",
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
                totp: { label: "2FA Code", type: "text" }, // Optional for non-admins
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                });

                if (!user) {
                    return null;
                }

                const isPasswordValid = await bcrypt.compare(
                    credentials.password,
                    user.password
                );

                if (!isPasswordValid) {
                    return null;
                }

                // Admin 2FA Check
                if (user.role === "ADMIN") {
                    if (!user.twoFactorSecret) {
                        // If admin has no secret set, allow login but maybe warn? 
                        // Or strictly require it. For now, allow if not set (setup phase).
                    } else {
                        if (!credentials.totp) {
                            throw new Error("2FA Code Required");
                        }
                        const isValidTotp = authenticator.check(
                            credentials.totp,
                            user.twoFactorSecret
                        );
                        if (!isValidTotp) {
                            throw new Error("Invalid 2FA Code");
                        }
                    }
                }

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
            }
            return session;
        },
    },
};
