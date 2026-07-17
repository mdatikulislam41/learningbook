# Supabase Setup Notes — learningBook (React Native Bare / CLI)

Project: React Native Bare (CLI, NOT Expo) + @supabase/supabase-js (already installed)
Current state: client created in src/lib/supabase.js with hardcoded keys.
react-native-config is in package.json but NOT natively linked (does not work without extra setup).

================================================================
STEP 1 — Create Supabase project
================================================================
1. Go to https://supabase.com
2. Sign up / log in
3. Click "New Project"
   - Choose organization
   - Name: learningBook
   - Set a strong DB password (save it somewhere)
   - Pick region closest to users
   - Wait ~2 min for provisioning

================================================================
STEP 2 — Get credentials
================================================================
1. In project dashboard -> left sidebar -> Settings (gear icon) -> API
2. Copy:
   - Project URL            (e.g. https://xxxxxxxx.supabase.co)
   - Project API keys -> anon public  (this is the "publishable" key)
3. anon key is meant to be public (shipped in client). It is safe in JS.
   The service_role key is SECRET — never put it in the app.

================================================================
STEP 3 — Store credentials (RECOMMENDED, no native setup needed)
================================================================
react-native-config requires native linking for iOS/Android; it failed before.
Simplest reliable approach: a plain JS config file.

Create src/lib/config.js:
  export const SUPABASE_URL = "https://xxxxxxxx.supabase.co";
  export const SUPABASE_ANON_KEY = "your-anon-key";

Update src/lib/supabase.js:
  import { createClient } from "@supabase/supabase-js";
  import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config";

  export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

Usage anywhere:  import { supabase } from "../lib/supabase";

(Optional later: properly link react-native-config with iOS Pod + Android build.gradle
 if you want .env based loading. Not required for this app.)

--- Native linking for react-native-config (Bare CLI) — only if you want .env ---
Android (android/app/build.gradle) add at the TOP of the file:
  apply from: project(':react-native-config').projectDir.getPath() + "/react-native-config.gradle"
  (RN CLI autolinks the package; this applies the gradle script.)
iOS:
  cd ios && pod install   (RN CLI autolinks; react-native-config reads Info.plist / .xcconfig)
  Then expose keys in ios/learningBook/Info.plist OR an .xcconfig:
    SUPABASE_URL=https://xxxxxxxx.supabase.co
    SUPABASE_ANON_KEY=your-anon-key
NOTE: For this app the plain JS config file (Step 3) is simpler and recommended.

================================================================
STEP 4 — Create a table (example: chapters)
================================================================
Dashboard -> Table Editor -> New Table
Name: chapters
Columns (discovered from existing project):
  id          bigint  (primary key, auto increment / identity)
  title       text
  pdf_url      text
  created_at  timestamptz  (default: now())
  class       int2 / int4
  type        text          (e.g. "guide")
  content     text
  chapter     int4
  boxbg       text          (hex color, e.g. "#D97706")

RLS (Row Level Security):
  - For public read (no login): enable RLS and add policy
    "Public read" -> FOR SELECT USING (true)
  - Without a SELECT policy, the app query returns empty / 401.

================================================================
STEP 5 — Fetch data in a screen (example: History)
================================================================
const { data, error } = await supabase
  .from("chapters")
  .select("*")
  .order("created_at", { ascending: false });

- Always handle error + loading + empty states.
- Restart the Metro bundler / app after changing config.

================================================================
STEP 6 — Auth (only if you need login)
================================================================
Sign up:   await supabase.auth.signUp({ email, password });
Sign in:   await supabase.auth.signInWithPassword({ email, password });
Sign out:  await supabase.auth.signOut();
Get user:  const { data: { user } } = await supabase.auth.getUser();

Protect data with RLS policies based on auth.uid().

================================================================
STEP 7 — Storage (PDFs already used)
================================================================
Dashboard -> Storage -> New bucket (e.g. "atiklpdf", public)
Public URL format:
  https://<project-ref>.supabase.co/storage/v1/object/public/<bucket>/<path>

================================================================
COMMON ISSUES
================================================================
- "env kaj kortese na": react-native-config not natively linked -> use JS config file (Step 3).
- Query returns [] or 401: RLS policy missing for SELECT.
- Key works for REST curl but app empty: check RLS + table name spelling.
- Restart bundler after editing config files.

================================================================
COMMANDS (React Native Bare CLI)
================================
npm install @supabase/supabase-js   (already done)
npx react-native start              (run Metro bundler)
npx react-native run-android        (build + run on emulator/device)
npx react-native run-ios            (requires macOS + Xcode; builds via Podfile)
cd ios && pod install               (after adding native deps like react-native-config)
