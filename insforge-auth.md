Setting up user authentication, session persistence, and user profiles with **InsForge** involves configuring the platform via the CLI, defining database rules, and integrating the `@insforge/sdk` on the client side. 

Below is a step-by-step guide on how to complete this process.

---

### Step 1: Login and Link Your Project via CLI
Instead of installing the CLI globally, it is recommended to run commands using `npx` to prevent version conflicts.

1. **Login to your InsForge account**:
   ```bash
   npx @insforge/cli login
   ```
   This command opens your browser to authorize your terminal via OAuth and securely saves your developer credentials locally in `~/.insforge/credentials.json`.

2. **Link your directory to your InsForge backend project**:
   ```bash
   npx @insforge/cli link
   ```
   *(If you are starting fresh and need to initialize a new project first, use `npx @insforge/cli create`)*.

---

### Step 2: Configure Auth Settings (Config-as-Code)
InsForge uses a declarative infrastructure model managed via an `insforge.toml` file. 

1. **Export your current live project configuration** to create the TOML file in your project root:
   ```bash
   npx @insforge/cli config export
   ```
2. **Configure your Redirect URLs** inside `insforge.toml` so the authentication flows know where to send users after they sign up or sign in:
   ```toml
   [auth]
   redirect_urls = ["http://localhost:3000/profile", "http://localhost:3000/dashboard"]
   ```
3. **Verify and apply the configuration changes**:
   ```bash
   # View the diff to ensure your changes are detected
   npx @insforge/cli config plan
   
   # Push the configuration live
   npx @insforge/cli config apply
   ```

---

### Step 3: Create the Profiles Table and Setup Row-Level Security (RLS)
To store custom information like display names, biographies, and avatar URLs, create a relational `profiles` table in Postgres linked to InsForge’s built-in `auth.users` schema.

1. **Create the table**:
   ```bash
   npx @insforge/cli db query "CREATE TABLE public.profiles (id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE, display_name TEXT, bio TEXT, avatar_url TEXT, updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());"
   ```
2. **Enable Row-Level Security** to keep user data secure:
   ```bash
   npx @insforge/cli db query "ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;"
   ```
3. **Create security policies**:
   These policies permit public read access for anyone viewing user profiles, but restrict editing so that users can only update their own records.
   ```bash
   # Policy 1: Let anyone view any profile
   npx @insforge/cli db query "CREATE POLICY \"Allow public read\" ON public.profiles FOR SELECT USING (true);"
   
   # Policy 2: Allow authenticated users to update only their own profile
   npx @insforge/cli db query "CREATE POLICY \"Allow individual updates\" ON public.profiles FOR UPDATE USING (auth.uid() = id);"
   ```

---

### Step 4: Install the SDK and Configure Session Persistence
The InsForge JavaScript SDK automatically manages your user's auth token and persists session info inside browser storage (e.g., localStorage).

1. **Install the package**:
   ```bash
   npm install @insforge/sdk
   ```
2. **Initialize the client** (e.g., `lib/insforge.js`):
   ```javascript
   import { createClient } from "@insforge/sdk";

   export const insforge = createClient({
     baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL, 
     anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY,
   });
   ```

---

### Step 5: Implement Auth Operations & User Profile UI
Now you can write the logic to register, authenticate, and manage user profile data.

#### Auth Helpers (Login, Signup, Logout)
```javascript
import { insforge } from "./lib/insforge";

// Sign Up
export async function handleSignUp(email, password) {
  const { data, error } = await insforge.auth.signUp({
    email,
    password,
    redirectTo: "http://localhost:3000/profile"
  });
  return { data, error };
}

// Sign In (The SDK automatically saves login info in local storage)
export async function handleSignIn(email, password) {
  const { data, error } = await insforge.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

// Sign Out (clears local token cache)
export async function handleSignOut() {
  await insforge.auth.signOut();
}
```

#### User Profile React Component
Here is an implementation of a profile page that retrieves the authenticated user, grabs their details from the database, and allows updates using SDK methods:

```jsx
import React, { useEffect, useState } from "react";
import { insforge } from "./lib/insforge";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({ displayName: "", bio: "", avatarUrl: "" });
  const [statusMsg, setStatusMsg] = useState("");

  useEffect(() => {
    async function loadProfile() {
      // 1. Retrieve current authenticated user (reads stored token)
      const { data: currentUser } = await insforge.auth.getCurrentUser();
      
      if (currentUser) {
        setUser(currentUser);
        
        // 2. Fetch profile from database using the built-in profile helper
        const { data: userProfile, error } = await insforge.auth.getProfile(currentUser.id);
        if (userProfile) {
          setProfile({
            displayName: userProfile.displayName || "",
            bio: userProfile.bio || "",
            avatarUrl: userProfile.avatarUrl || ""
          });
        }
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setStatusMsg("");

    // 3. Update profile information securely
    const { data, error } = await insforge.auth.setProfile({
      displayName: profile.displayName,
      bio: profile.bio,
      avatarUrl: profile.avatarUrl,
    });

    if (error) {
      setStatusMsg(`Error: ${error.message}`);
    } else {
      setStatusMsg("Profile updated successfully!");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please login to access your profile.</div>;

  return (
    <div style={{ maxWidth: "400px", margin: "40px auto", padding: "20px", border: "1px solid #ccc" }}>
      <h2>Your Profile</h2>
      {statusMsg && <p style={{ color: "blue" }}>{statusMsg}</p>}
      
      <form onSubmit={handleUpdate}>
        <div style={{ marginBottom: "12px" }}>
          <label style={{ display: "block" }}>Display Name</label>
          <input
            type="text"
            style={{ width: "100%", padding: "8px" }}
            value={profile.displayName}
            onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
          />
        </div>
        
        <div style={{ marginBottom: "12px" }}>
          <label style={{ display: "block" }}>Bio</label>
          <textarea
            style={{ width: "100%", padding: "8px" }}
            value={profile.bio}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
          />
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label style={{ display: "block" }}>Avatar URL</label>
          <input
            type="text"
            style={{ width: "100%", padding: "8px" }}
            value={profile.avatarUrl}
            onChange={(e) => setProfile({ ...profile, avatarUrl: e.target.value })}
          />
        </div>

        <button type="submit" style={{ width: "100%", padding: "10px", backgroundColor: "#0070f3", color: "#fff", border: "none" }}>
          Save Profile
        </button>
      </form>
      
      <button 
        onClick={() => insforge.auth.signOut().then(() => window.location.reload())}
        style={{ marginTop: "15px", width: "100%", padding: "10px", backgroundColor: "#eaeaea", border: "none" }}
      >
        Sign Out
      </button>
    </div>
  );
}
```