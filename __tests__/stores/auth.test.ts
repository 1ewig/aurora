import { describe, it, expect, beforeEach, vi } from "vitest";
import { useAuthStore } from "@/stores/useAuthStore";

const { mockSignInEmail, mockSignUpEmail, mockSignOut, mockUpdateUser, mockVerifyEmail, mockSendVerificationEmail, mockRequestPasswordReset, mockResetPassword, mockChangePassword } = vi.hoisted(() => ({
  mockSignInEmail: vi.fn(),
  mockSignUpEmail: vi.fn(),
  mockSignOut: vi.fn(),
  mockUpdateUser: vi.fn(),
  mockVerifyEmail: vi.fn(),
  mockSendVerificationEmail: vi.fn(),
  mockRequestPasswordReset: vi.fn(),
  mockResetPassword: vi.fn(),
  mockChangePassword: vi.fn(),
}));

const { mockFetchUserRole, mockBuildUserState } = vi.hoisted(() => ({
  mockFetchUserRole: vi.fn(),
  mockBuildUserState: vi.fn(),
}));

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    signIn: { email: mockSignInEmail },
    signUp: { email: mockSignUpEmail },
    signOut: mockSignOut,
    updateUser: mockUpdateUser,
    verifyEmail: mockVerifyEmail,
    sendVerificationEmail: mockSendVerificationEmail,
    requestPasswordReset: mockRequestPasswordReset,
    resetPassword: mockResetPassword,
    changePassword: mockChangePassword,
  },
}));

vi.mock("@/utils/auth", () => ({
  fetchUserRole: mockFetchUserRole,
  buildUserState: mockBuildUserState,
}));

beforeEach(() => {
  useAuthStore.setState({ user: null, profile: null, loading: true, error: null });
  vi.clearAllMocks();
});

describe("signIn", () => {
  it("sets user and profile on successful sign-in", async () => {
    mockSignInEmail.mockResolvedValue({ data: { user: { id: "u1", email: "a@b.com" } }, error: null });
    mockFetchUserRole.mockResolvedValue({ isAdmin: false, role: "user" });
    mockBuildUserState.mockReturnValue({
      user: { id: "u1", email: "a@b.com", name: "", emailVerified: false, image: "", isAdmin: false, role: "user" },
      profile: { displayName: "" },
    });

    const result = await useAuthStore.getState().signIn("a@b.com", "pass");

    expect(result.error).toBeNull();
    expect(useAuthStore.getState().user?.id).toBe("u1");
    expect(useAuthStore.getState().loading).toBe(false);
    expect(mockFetchUserRole).toHaveBeenCalled();
  });

  it("maps invalid_password error", async () => {
    mockSignInEmail.mockResolvedValue({ data: null, error: { code: "invalid_password", message: "Invalid password" } });

    const result = await useAuthStore.getState().signIn("a@b.com", "wrong");

    expect(useAuthStore.getState().error).toContain("Incorrect password");
    expect(result.needsVerification).toBe(false);
  });

  it("detects unverified email via 403 status", async () => {
    mockSignInEmail.mockResolvedValue({ data: null, error: { status: 403, message: "Email not verified" } });

    const result = await useAuthStore.getState().signIn("a@b.com", "pass");

    expect(useAuthStore.getState().error).toContain("verify your email");
    expect(result.needsVerification).toBe(true);
  });

  it("maps rate_limit error", async () => {
    mockSignInEmail.mockResolvedValue({ data: null, error: { code: "rate_limit", message: "Too many requests" } });

    await useAuthStore.getState().signIn("a@b.com", "pass");

    expect(useAuthStore.getState().error).toContain("Too many attempts");
  });

  it("maps weak_password error", async () => {
    mockSignInEmail.mockResolvedValue({ data: null, error: { code: "weak_password", message: "Password is too short" } });

    await useAuthStore.getState().signIn("a@b.com", "short");

    expect(useAuthStore.getState().error).toContain("at least 8 characters");
  });
});

describe("signUp", () => {
  it("returns needsVerification when email not verified", async () => {
    mockSignUpEmail.mockResolvedValue({ data: { user: { id: "u2", email: "a@b.com", emailVerified: false } }, error: null });

    const result = await useAuthStore.getState().signUp("a@b.com", "password123", "Test");

    expect(result.needsVerification).toBe(true);
    expect(useAuthStore.getState().user).toBeNull();
  });

  it("sets user when email is verified after sign-up", async () => {
    mockSignUpEmail.mockResolvedValue({ data: { user: { id: "u2", email: "a@b.com", emailVerified: true } }, error: null });
    mockFetchUserRole.mockResolvedValue({ isAdmin: false, role: "user" });
    mockBuildUserState.mockReturnValue({
      user: { id: "u2", email: "a@b.com", name: "Test", emailVerified: true, image: "", isAdmin: false, role: "user" },
      profile: { displayName: "Test" },
    });

    const result = await useAuthStore.getState().signUp("a@b.com", "password123", "Test");

    expect(result.error).toBeNull();
    expect(useAuthStore.getState().user?.id).toBe("u2");
  });

  it("maps existing account error", async () => {
    mockSignUpEmail.mockResolvedValue({ data: null, error: { message: "An account with this email already exists" } });

    await useAuthStore.getState().signUp("existing@b.com", "password123", "Test");

    expect(useAuthStore.getState().error).toContain("already exists");
  });
});

describe("signOut", () => {
  it("clears user and profile", async () => {
    useAuthStore.setState({ user: { id: "u1", email: "a@b.com" } as any, profile: { displayName: "A" } });
    mockSignOut.mockResolvedValue({ data: null, error: null });

    await useAuthStore.getState().signOut();

    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().profile).toBeNull();
    expect(useAuthStore.getState().error).toBeNull();
  });
});

describe("clearError", () => {
  it("resets error to null", () => {
    useAuthStore.setState({ error: "Some error" });
    useAuthStore.getState().clearError();
    expect(useAuthStore.getState().error).toBeNull();
  });
});

describe("updateProfile", () => {
  it("updates displayName on success", async () => {
    mockUpdateUser.mockResolvedValue({ data: null, error: null });
    useAuthStore.setState({ profile: { displayName: "Old" }, loading: false });

    await useAuthStore.getState().updateProfile({ displayName: "New Name" });

    expect(useAuthStore.getState().profile?.displayName).toBe("New Name");
    expect(useAuthStore.getState().loading).toBe(false);
  });
});

describe("verifyEmail", () => {
  it("rejects missing token", async () => {
    const result = await useAuthStore.getState().verifyEmail("a@b.com", "");
    expect(result.error).toBeTruthy();
  });

  it("maps invalid_token error", async () => {
    mockVerifyEmail.mockResolvedValue({ error: { code: "invalid_token", message: "Invalid token" } });
    await useAuthStore.getState().verifyEmail("a@b.com", "bad-token");
    expect(useAuthStore.getState().error).toContain("expired");
  });
});

describe("resetPassword", () => {
  it("returns error on failure", async () => {
    mockResetPassword.mockResolvedValue({ error: { code: "invalid_token", message: "Invalid or expired token" } });
    const result = await useAuthStore.getState().resetPassword("newpass", "bad-token");
    expect(result.error).toBeTruthy();
  });
});

describe("changePassword", () => {
  it("returns error on wrong current password", async () => {
    mockChangePassword.mockResolvedValue({ error: { code: "invalid_password", message: "Invalid password" } });
    await useAuthStore.getState().changePassword("wrong", "newpass");
    expect(useAuthStore.getState().error).toContain("Incorrect password");
  });
});
