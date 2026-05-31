import "dotenv/config";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sendMail from "../../utils/sendMail.js";
import ErrorHandler from "../../utils/ErrorHandler.js";
import {
  loginUserSchema,
  registerUserSchema,
  registerWithOrganizationSchema,
} from "./auth.validation.js";
import type {
  LoginUserInput,
  RegisterAsOrganizationInput,
  RegisterUserInput,
} from "./auth.validation.js";
import type { OrganizationInfo, LoginResponse } from "./auth.types.js";
import {
  type IUserInsert,
  users,
  type IUser,
} from "../../db/schema/users.schema.js";
import DB from "../../config/db.js";
import { eq } from "drizzle-orm";
import {
  addUserToOrganizationInTransaction,
  createDefaultDepartmentsInTransaction,
  createOrganizationInTransaction,
  createUserInTransaction,
  findUserByEmail,
  getUserOrganizationsFromDB,
  getUserMembership,
  findUserById,
} from "./auth.repository.js";
import logger from "../../utils/logger.js";
import { generateToken, verifyToken } from "../../utils/jwt.js";
import { redis } from "../../config/redis.js";
import {
  cacheUserOrganizations,
  getUserOrganizationsFromCache,
  invalidateUserOrgCache,
  updateCurrentOrganizationInCache,
} from "../../utils/redis.js";

// Get user organizations with cache
const getUserOrganizations = async (
  userId: number,
  currentOrganizationId?: number,
): Promise<OrganizationInfo[]> => {
  // Try cache first
  const cached = await getUserOrganizationsFromCache(userId);
  if (cached) {
    // Add currentOrganization flag to cached data
    const orgsWithFlag = cached.map((org: OrganizationInfo) => ({
      ...org,
      currentOrganization: currentOrganizationId
        ? org.id === currentOrganizationId
        : false,
    }));

    // Update cache with current flag if currentOrganizationId is provided
    if (currentOrganizationId) {
      await cacheUserOrganizations(userId, orgsWithFlag);
    }

    return orgsWithFlag;
  }

  // Get from DB
  const orgs = await getUserOrganizationsFromDB(userId);

  const orgsWithFlag = orgs.map((org) => ({
    ...org,
    currentOrganization: currentOrganizationId
      ? org.id === currentOrganizationId
      : false,
  }));

  //  cache user orgs
  await cacheUserOrganizations(userId, orgsWithFlag);

  return orgs;
};

export const registerUser = async (data: RegisterUserInput) => {
  const validated = registerUserSchema.parse(data);
  const { name, email, phoneNumber, password, age, avatar } = validated;

  return await DB.transaction(async (tx) => {
    const existingUser = await tx
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()));

    if (existingUser.length > 0) {
      throw new ErrorHandler("Email already exists", 400);
    }

    const existingPhone = await tx
      .select()
      .from(users)
      .where(eq(users.phoneNumber, phoneNumber));

    if (existingPhone.length > 0) {
      throw new ErrorHandler("Phone number already exists", 400);
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const [newUser] = await tx
      .insert(users)
      .values({
        name,
        email: email.toLowerCase(),
        phoneNumber,
        password: hashedPassword,
        age,
        avatar,
        systemRole: "user",
      } as IUserInsert)
      .returning();

    if (!newUser) {
      throw new ErrorHandler("Failed to create user", 500);
    }

    // Generate activation code
    const activationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();
    await redis.set(`email_activation:${email.toLowerCase()}`, activationCode, {
      ex: 300,
    });

    try {
      await sendMail({
        email,
        subject: "Activate your account",
        data: { userName: name, otp: activationCode },
      });
    } catch (err) {
      logger.error("Error sending email:", err);
      throw new ErrorHandler("Error sending activation email", 500);
    }

    return {
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phoneNumber: newUser.phoneNumber,
        age: newUser.age,
        avatar: newUser.avatar as string | undefined,
        systemRole: newUser.systemRole,
        isEmailVerified: newUser.isEmailVerified === 1,
        isPhoneVerified: newUser.isPhoneVerified === 1,
      },
      userType: "student",
    };
  });
};

export const registerAsOrganization = async (
  data: RegisterAsOrganizationInput,
) => {
  const validated = registerWithOrganizationSchema.parse(data);
  const {
    name,
    email,
    phoneNumber,
    password,
    age,
    avatar,
    organizationName,
    organizationType,
  } = validated;

  return await DB.transaction(async (tx) => {
    const existingUser = await tx
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()));

    if (existingUser.length > 0) {
      throw new ErrorHandler("Email already exists", 400);
    }

    const existingPhone = await tx
      .select()
      .from(users)
      .where(eq(users.phoneNumber, phoneNumber));

    if (existingPhone.length > 0) {
      throw new ErrorHandler("Phone number already exists", 400);
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const newUser = await createUserInTransaction(tx, {
      name,
      email: email.toLowerCase(),
      phoneNumber,
      password: hashedPassword,
      age,
      avatar,
      systemRole: "user",
    } as IUserInsert);

    if (!newUser) {
      throw new ErrorHandler("Failed to create user", 500);
    }

    const org = await createOrganizationInTransaction(
      tx,
      organizationName,
      organizationType,
      newUser.id,
    );

    if (!org) {
      throw new ErrorHandler("Failed to create organization", 500);
    }

    // Add user as owner
    // const member = await addUserToOrganizationInTransaction(
    //   tx,
    //   newUser.id,
    //   org.id,
    //   "owner",
    // );

    // if (!member) {
    //   throw new ErrorHandler("Failed to add user to organization", 500);
    // }

    // For school  create default departments
    let departments = [];
    if (organizationType === "school") {
      departments = await createDefaultDepartmentsInTransaction(tx, org.id);
    }

    // Generate activation code
    const activationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();
    await redis.set(`email_activation:${email.toLowerCase()}`, activationCode, {
      ex: 300,
    });

    try {
      await sendMail({
        email,
        subject: "Activate your account",
        data: { userName: name, otp: activationCode },
      });
    } catch (err) {
      logger.error("Failed to send activation email", { email, error: err });
    }

    return {
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phoneNumber: newUser.phoneNumber,
        age: newUser.age,
        avatar: newUser.avatar as string | undefined,
        systemRole: newUser.systemRole,
        isEmailVerified: newUser.isEmailVerified === 1,
        isPhoneVerified: newUser.isPhoneVerified === 1,
      },
      organization: {
        id: org.id,
        name: org.name,
        type: org.type,
        role: "owner",
        departmentsCreated: departments.length > 0,
        departmentsCount: departments.length,
      },
      userType: "organization_owner",
    };
  });
};

export const loginUser = async (
  data: LoginUserInput,
): Promise<LoginResponse> => {
  const validated = loginUserSchema.parse(data);
  const { email: rawEmail, password } = validated;

  const email = rawEmail.trim().toLowerCase();

  const userRecord = await findUserByEmail(email);
  if (!userRecord || userRecord.length === 0) {
    throw new ErrorHandler("Invalid email or password", 401);
  }

  const user: IUser = userRecord[0];

  const isPasswordValid = bcrypt.compareSync(password, user.password);
  if (!isPasswordValid) {
    throw new ErrorHandler("Invalid email or password", 401);
  }

  // if (!user.isEmailVerified && !user.isPhoneVerified) {
  //   throw new ErrorHandler("Please verify your email or phone to login", 403);
  // }

  // Get user's organizations
  const organizations = await getUserOrganizations(user.id);

  const sanitizedUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    phoneNumber: user.phoneNumber,
    age: user.age,
    avatar: user.avatar as string | undefined,
    systemRole: user.systemRole ?? "user",
    isEmailVerified: user.isEmailVerified === 1,
    isPhoneVerified: user.isPhoneVerified === 1,
  };

  logger.info(
    `User logged in: ${user.email} (ID: ${user.id}) with ${organizations.length} organizations`,
  );

  let accessToken: string = "",
    refreshToken: string = "",
    tempToken: string = "";
  // If only one organization, create org-specific tokens
  if (organizations.length === 1) {
    const org = organizations[0];

    org.currentOrganization = true;

    await updateCurrentOrganizationInCache(user.id, org.id);

    accessToken = generateToken(
      {
        id: user.id,
        systemRole: user.systemRole,
        organizationId: org.id,
        organizationRole: org.role,
        isOwner: org.isOwner,
      },
      process.env.ACCESS_TOKEN_EXPIRY!,
      process.env.ACCESS_TOKEN!,
    );

    refreshToken = generateToken(
      {
        userId: user.id,
        organizationId: org.id,
        systemRole: user.systemRole,
      },
      "7d",
      process.env.REFRESH_TOKEN!,
    );

    console.log("refresh token in service: ", refreshToken);

    return {
      accessToken,
      refreshToken,
      user: sanitizedUser,
      organizations,
      requiresOrgSelection: false,
    };
  }

  // If multiple organizations, create temporary token for org selection
  if (organizations.length > 1) {
    tempToken = jwt.sign(
      { id: user.id, type: "org_selection" },
      process.env.ACCESS_TOKEN!,
      { expiresIn: "10m" },
    );

    return {
      accessToken: tempToken,
      tempToken,
      organizations,
      requiresOrgSelection: true,
      user: sanitizedUser,
    };
  }

  if (organizations.length === 0) {
    accessToken = generateToken(
      {
        id: user.id,
        systemRole: user.systemRole,
        name: user.name,
        email: user.email,
        systemStatus: user.systemStatus,
        suspendReason: user.suspendReason,
      },
      process.env.ACCESS_TOKEN_EXPIRY!,
      process.env.ACCESS_TOKEN!,
    );

    refreshToken = generateToken(
      {
        id: user.id,
        systemRole: user.systemRole,
      },
      "7d",
      process.env.REFRESH_TOKEN!,
    );
  }

  return {
    accessToken: accessToken,
    organizations,
    requiresOrgSelection: true,
    user: sanitizedUser,
  };
};

export const selectOrganization = async (
  userId: number,
  organizationId: number,
): Promise<LoginResponse> => {
  const membership = await getUserMembership(userId, organizationId);

  if (!membership) {
    throw new ErrorHandler("You are not a member of this organization", 403);
  }

  const userRecord = await findUserById(userId);
  if (!userRecord || userRecord.length === 0) {
    throw new ErrorHandler("User not found", 404);
  }

  // Todo -> store any custom permission in redis

  const user = userRecord[0];

  const accessToken = generateToken(
    {
      id: user.id,
      systemRole: user.systemRole,
      organizationId: membership.organizationId,
      organizationRole: membership.role,
      isOwner: membership.isOwner,
    },
    process.env.ACCESS_TOKEN_EXPIRY!,
    process.env.ACCESS_TOKEN_SECRET!,
  );
  const refreshToken = generateToken(
    {
      id: user.id,
      organizationId: membership.organizationId,
      systemRole: user.systemRole,
    },
    "7d",
    process.env.ACCESS_TOKEN_SECRET!,
  );

  const organizations = await getUserOrganizations(userId, organizationId);

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      age: user.age,
      avatar: user.avatar as string | undefined,
      systemRole: user.systemRole,
      isEmailVerified: user.isEmailVerified === 1,
      isPhoneVerified: user.isPhoneVerified === 1,
    },
    organizations,
    requiresOrgSelection: false,
  };
};

export const verifyAccount = async (
  email: string,
  code: string,
  type: "email_activation" | "phone_activation" = "email_activation",
): Promise<boolean> => {
  const redisKey = `${type}:${email}`;

  try {
    const storedCode = await redis.get(redisKey);

    if (!storedCode) {
      throw new ErrorHandler("Activation code expired or invalid", 400);
    }

    if (String(storedCode) !== String(code)) {
      throw new ErrorHandler("Invalid activation code", 400);
    }

    const updateData: Partial<IUserInsert> =
      type === "email_activation"
        ? { isEmailVerified: 1 }
        : { isPhoneVerified: 1 };

    const updated = await DB.update(users)
      .set(updateData)
      .where(eq(users.email, email));

    if (updated.rowCount === 0) {
      throw new ErrorHandler("User not found", 404);
    }

    await redis.del(redisKey);

    logger.info(`Account verified successfully: ${email}`);
    return true;
  } catch (error) {
    logger.error("Account verification error", error);
    throw error instanceof ErrorHandler
      ? error
      : new ErrorHandler("Internal server error", 500);
  }
};

export const refreshAccessToken = async (
  refreshToken: string,
): Promise<{
  accessToken: string;
  currentOrganization?: number;
}> => {
  const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN!) as any;

  if (!decoded || !decoded.userId) {
    throw new ErrorHandler("Invalid refresh token", 401);
  }

  const user = await findUserById(decoded.userId);
  if (!user || user.length === 0) {
    throw new ErrorHandler("User not found", 404);
  }

  const organizations = await getUserOrganizations(
    decoded.userId,
    decoded.organizationId,
  );

  const userCurrOrg = organizations.find(
    (o: any) => o.id === decoded.organizationId,
  );

  const accessToken = generateToken(
    {
      id: decoded.userId,
      systemRole: user[0].systemRole,
      organizationId: userCurrOrg?.id,
      organizationRole: userCurrOrg?.role,
      isOwner: userCurrOrg?.isOwner,
    },
    process.env.ACCESS_TOKEN_EXPIRY!,
    process.env.ACCESS_TOKEN!,
  );

  return { accessToken, currentOrganization: userCurrOrg?.id };
};
