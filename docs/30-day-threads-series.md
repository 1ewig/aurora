# 30-Day Threads Series

## I built a full production e-commerce store with AI. Here's every place it would have silently destroyed my business — and what you actually need to know to catch it.

---

## Day 1 — The Cart That Lies to You

**Card 1: The Hook**
I built an e-commerce store with AI. The cart worked perfectly on day one. But in production, that cart was the most dangerous code in the app.

**Card 2: The Quick Fix**
AI said: save the cart to localStorage with the price attached to each item. It's fast, persists across refreshes, and shows the user their total instantly. On the surface, this is exactly what every cart does.

**Card 3: The Slow Burn**
A user opens DevTools, changes a $500 jacket to $50, and checks out. Your server receives $50. If you trust the client-side total, you just shipped a $500 jacket at a 90% discount. LocalStorage is a suggestion, not a source of truth.

**Card 4: AI vs. Senior**
AI solves for UX speed — make the cart feel instant. A senior knows the cart is a UI concern, but pricing is a server concern. AI treats all data as equal. A senior knows display data from authority data.

**Card 5: The Correct Fix**
Every checkout must re-fetch prices from the database using product IDs. Never trust the price on the cart item. The client sends what they want. The server decides what it costs. The cart is just a display.

**Card 6: The Takeaway**
AI will happily let the client tell the server what things cost. In production, your database is the only price oracle. What UX shortcuts in your app are silently costing you money?

---

## Day 2 — The Order That Vanished

**Card 1: The Hook**
A customer buys something and payment succeeds. Then they close the browser and the order disappears. Not from your database — it's there. But they can never find it. This isn't a bug. It's a nullable foreign key.

**Card 2: The Quick Fix**
AI said: make user_id nullable so guests can check out without signing up. It removes friction from checkout. Every SaaS tutorial does this.

**Card 3: The Slow Burn**
That guest order sits in your DB with user_id = null. The customer creates an account later. Your orders query filters by user_id. The order is invisible. They email support. Your team manually links accounts.

**Card 4: AI vs. Senior**
AI models the immediate workflow — guest checks out, order saved. A senior models the full lifecycle — returns, account upgrades, abandoned cart recovery. A nullable user_id is a customer experience decision with consequences months later.

**Card 5: The Correct Fix**
Capture a session-level identifier at checkout time so guests can retrieve orders without an account. Prompt account creation after successful payment and backfill the relationship.

**Card 6: The Takeaway**
Nullable foreign keys are deferred complexity your support team pays for later. Before you make a column nullable, ask who cleans this up in six months.

---

## Day 3 — The Function That Runs Three Times

**Card 1: The Hook**
Your pricing logic lives in three places: the checkout form, the checkout endpoint, and the webhook handler. Three implementations, one truth. Until they diverge.

**Card 2: The Quick Fix**
AI said: calculate the total on the client for instant feedback, recalculate on the server for security, and recalculate in the webhook to be safe. Redundancy feels like robustness.

**Card 3: The Slow Burn**
You change the tax rate from 8% to 9.5%. You update pricing.ts but forget the client-side version. Now the receipt shows one number, the payment provider charges another, and the order stores a third.

**Card 4: AI vs. Senior**
AI creates independent copies of logic because each solves a local problem. A senior creates one authoritative function that every layer calls. Single source of truth isn't a buzzword. It's survival.

**Card 5: The Correct Fix**
Extract all pricing into one server-only utility. The checkout endpoint and webhook both call the same function. One file, one truth.

**Card 6: The Takeaway**
AI duplicates logic because it doesn't see the blast radius of a missed update. Every business rule should live in exactly one place. How many copies of your core logic exist?

---

## Day 4 — The Search That Falls Over at 100 Products

**Card 1: The Hook**
Product search worked great with 20 test products. AI wrote a simple ILIKE query. Three months later, the catalog hit 500 items and the database choked on every search.

**Card 2: The Quick Fix**
AI said: use ILIKE for case-insensitive search across name, description, and keywords. It's the simplest way to add search. Every blog post shows this pattern.

**Card 3: The Slow Burn**
ILIKE '%query%' cannot use B-tree indexes. Every search triggers a sequential scan of your entire products table. At 500 products it's slow. At 5,000 it's a problem. At 50,000 your database CPU pins and requests time out.

**Card 4: AI vs. Senior**
AI patterns what it's seen in tutorials with 12 rows. A senior reads the EXPLAIN ANALYZE output and sees the sequential scan before it reaches production. AI writes queries that work. Seniors write queries that scale.

**Card 5: The Correct Fix**
Use PostgreSQL full-text search with a GIN index on a combined search vector. A tsvector indexes content at write time, making queries hundreds of times faster without infrastructure changes.

**Card 6: The Takeaway**
If your search query starts with "WHERE column ILIKE", you have a ticking time bomb. ORMs and AI love this pattern. Production databases do not. When did you last look at your most-hit endpoint's query plan?

---

## Day 5 — The Route Protection That Doesn't Protect

**Card 1: The Hook**
I asked AI to add middleware blocking unauthenticated users from the admin panel. It wrote the code, I deployed it, and every admin route was completely unprotected. The code was correct. The filename was wrong.

**Card 2: The Quick Fix**
AI created proxy.ts with a function named proxy that checks session cookies and redirects. It works perfectly when you test locally.

**Card 3: The Slow Burn**
Next.js only runs middleware from a file named middleware.ts exporting a function named middleware. Your proxy.ts is never read by the framework. Every admin endpoint, every profile page — completely public.

**Card 4: AI vs. Senior**
AI generates code based on common patterns but doesn't verify framework-specific naming conventions. A senior knows that in Next.js, middleware is a specific file at a specific path with a specific export.

**Card 5: The Correct Fix**
Rename proxy.ts to middleware.ts and the export to middleware. Framework conventions aren't suggestions — they're the contract between your code and the runtime.

**Card 6: The Takeaway**
AI doesn't know which filenames are magic to your framework. Before deploying, verify your auth guards are actually called by the runtime. Don't trust the file existing means it's running.

---

## Day 6 — The Order Lookup That Shows Everyone's Orders

**Card 1: The Hook**
I added a feature letting customers look up their order by payment provider ID. Quick, useful, standard. Also completely unprotected. Anyone who guessed another customer's ID could see their order details.

**Card 2: The Quick Fix**
AI said: create an endpoint that accepts an order ID and returns the order number. It's a convenience endpoint for the success page. Just a simple SELECT.

**Card 3: The Slow Burn**
The lsOrderId endpoint returns order data without authentication. A malicious user can iterate order IDs and map your entire sales volume, customer names, and order patterns. No login required.

**Card 4: AI vs. Senior**
AI sees a utility endpoint — looking up data by ID. A senior sees an information disclosure vulnerability. Just because data is in the database doesn't mean every request should read it.

**Card 5: The Correct Fix**
Authenticate the lookup against the session. For guest orders, require the email as a second factor. Never expose an ID lookup without verifying the requester's relationship to the data.

**Card 6: The Takeaway**
Every endpoint that accepts an identifier and returns data is a recon vector. AI won't ask "who wants this data and why?" What innocent lookup endpoints do you have?

---

## Day 7 — The Checkout That Anyone Can Hammer

**Card 1: The Hook**
The checkout endpoint takes payments and reserves inventory. AI added rate limiting to the login form but forgot the checkout entirely. One script could reserve every item in your catalog.

**Card 2: The Quick Fix**
AI rate-limited auth endpoints — sign in, sign up, password reset. Five requests per minute on login. Unlimited on checkout.

**Card 3: The Slow Burn**
A bad actor hits your checkout endpoint with every product ID. Each request creates a 35-minute reservation without completing payment. After a few minutes, your entire inventory shows out of stock to real customers.

**Card 4: AI vs. Senior**
AI rate-limits what it's told to rate-limit. A senior knows any endpoint consuming a shared resource — inventory, compute, API credits — needs protection. Resource exhaustion is as dangerous as auth bypass.

**Card 5: The Correct Fix**
Add per-IP and per-session rate limiting to the checkout endpoint. Track failed attempts in a sliding window. Every public POST endpoint is a potential abuse vector.

**Card 6: The Takeaway**
AI protects what it knows about. You protect what you know about your business. Your checkout is one curl script away from being weaponized against your inventory. What else did AI leave exposed?

---

## Day 8 — The Admin Door Left Ajar

**Card 1: The Hook**
I needed a way to grant admin access before the role system was built. AI said: use an env var with a comma-separated list of admin emails. Temporary bridge. Permanent backdoor.

**Card 2: The Quick Fix**
AI added an ADMIN_EMAILS env var that isAdmin checks as a fallback. If the DB role isn't admin, check the email list. Quick, simple, works for initial setup.

**Card 3: The Slow Burn**
Six months later, the role system is built. But ADMIN_EMAILS is still there. An admin revokes someone's role in the database. The env var silently overrides it. They still have access.

**Card 4: AI vs. Senior**
AI implements both systems and leaves both running. A senior removes the migration bridge when the new system is verified. Temporary code becomes permanent in AI codebases because nothing is refactored unless asked.

**Card 5: The Correct Fix**
Remove the ADMIN_EMAILS fallback entirely. A role system should have one authority — the database. If you need break-glass access, make it auditable and time-limited.

**Card 6: The Takeaway**
AI never deletes code. Every temporary bridge becomes permanent maintenance. What "temporary" solutions in your codebase have quietly become permanent?

---

## Day 9 — The Webhook That Breaks in Production

**Card 1: The Hook**
The webhook handler processes payments, deducts stock, creates orders. It also JSON.parses custom data without validation. One unexpected field and your entire pipeline crashes.

**Card 2: The Quick Fix**
AI said: the payment provider always sends structured data. Just JSON.parse the custom_data fields. The format is guaranteed by your own checkout config.

**Card 3: The Slow Burn**
The provider updates their API and sends data in a slightly different format. Your JSON.parse throws inside a DB transaction. The transaction rolls back. The customer is charged but no order is created.

**Card 4: AI vs. Senior**
AI assumes the external system keeps its promises. A senior assumes every webhook payload is potentially malformed and wraps every parse in defensive validation.

**Card 5: The Correct Fix**
Validate every field with a schema validator. Wrap JSON.parse in try-catch. Store raw webhook payloads in a dead-letter log for replay after fixing parsing issues.

**Card 6: The Takeaway**
AI trusts the upstream. Production assumes the worst. Your webhook handler is the most critical code in your payment flow. Are your payment webhooks wrapped in validation?

---

## Day 10 — The Product List That Queries Everything

**Card 1: The Hook**
The admin panel shows recent orders with product images. AI built it with one query for orders, then a loop querying each product's image. The page loaded fine with five test orders.

**Card 2: The Quick Fix**
AI said: fetch all orders, then for each unique product ID, fetch the product image. It's readable, modular, and separates concerns.

**Card 3: The Slow Burn**
The admin opens the orders page during a sale. There are 200 orders. The endpoint fires one query for orders, then maps each product. Page load goes from 200ms to 3 seconds.

**Card 4: AI vs. Senior**
AI sees logical separation as good architecture. A senior sees database round-trips. The N+1 problem isn't about code quality — it's about physics. Every round trip costs time.

**Card 5: The Correct Fix**
Fetch product images in the same query as orders using a JOIN or a single query with id IN (...). Minimize round trips. One query is faster than 201.

**Card 6: The Takeaway**
AI writes code transaction by transaction. The database sees the cumulative cost. If your page makes more than one DB query per item, you have an N+1 problem. How many invisible queries does your most-hit page execute?

---

## Day 11 — The Success Page That Needs Luck

**Card 1: The Hook**
After a customer pays, they land on a success page. The webhook hasn't processed yet. AI added polling every 1.5 seconds for up to 10 attempts. The success page became a prayer circle.

**Card 2: The Quick Fix**
AI said: poll the database every 1.5 seconds until the order appears. Webhooks usually process in 2-3 seconds, so this should work most of the time.

**Card 3: The Slow Burn**
The provider has a slow day. Webhooks arrive after 20 seconds. The 10 attempts exhaust. The customer sees "Pending Fulfillment" forever. They refresh. SessionStorage is cleared. They have a charge and no order number.

**Card 4: AI vs. Senior**
AI optimizes for the happy path — webhook arrives quickly. A senior designs for failure — what does the customer see when the system is slow? Fixed retry limits are guesswork.

**Card 5: The Correct Fix**
Use server-sent events or show the provider's order ID for immediate confirmation. Display a persistent "processing" state rather than empty data.

**Card 6: The Takeaway**
Synchronous polling for an async event is a design smell. If your success page relies on timing luck, your checkout flow has a single point of failure in user trust.

---

## Day 12 — The Stale Search Results

**Card 1: The Hook**
Product pages were slow, so AI added caching. Then the admin updates a price. Customers searching under $100 still see the old price for 5 minutes. The caching was too good.

**Card 2: The Quick Fix**
AI added server-side caching with 300-second revalidation on the products endpoint. Cache hit means no DB query. Performance improved dramatically.

**Card 3: The Slow Burn**
An admin updates a sale price. The cached data doesn't clear. Customers see the wrong price. Some complete purchases at the wrong price. Others get confused and leave.

**Card 4: AI vs. Senior**
AI adds caching to solve speed. A senior maps the full data flow: what writes invalidate what reads. A cache without invalidation isn't an optimization — it's a consistency bug.

**Card 5: The Correct Fix**
Every mutation endpoint must trigger cache invalidation for related tags. Test the invalidation by mutating data and verifying the cache clears within the expected window.

**Card 6: The Takeaway**
AI adds caching like it's free. Cached stale data is worse than slow fresh data. Before adding cache, answer: what happens when the data changes?

---

## Day 13 — The Connection Pool That Drops Every Second

**Card 1: The Hook**
The database pool had an idle timeout of one second. AI thought it was being efficient. In production, every single request had to establish a new database connection.

**Card 2: The Quick Fix**
AI set idleTimeoutMillis to 1000 to prevent build processes from hanging. On a local machine with zero traffic, it works flawlessly.

**Card 3: The Slow Burn**
In production with serverless functions, every request creates a new connection. The database spends more time on TLS handshakes than executing queries. Connection overhead adds 50-100ms per request. Traffic spikes cause connection storms.

**Card 4: AI vs. Senior**
AI solves the build problem. A senior knows pool config is a production setting. The same config that unblocks local dev kills production performance.

**Card 5: The Correct Fix**
Use separate pool configs for dev and production. In production, remove or increase the idle timeout. In serverless, use external poolers or platform data APIs.

**Card 6: The Takeaway**
AI configures for localhost. Production has different traffic patterns and failure modes. What config values are optimized for your laptop instead of your users?

---

## Day 14 — The Email That Disappeared

**Card 1: The Hook**
After a successful order, the customer should get a confirmation email. The webhook calls sendEmail and catches errors silently. When the email fails, nobody knows.

**Card 2: The Quick Fix**
AI wrapped the email in .catch that logs and continues. Email failures shouldn't block the order. Fire and forget.

**Card 3: The Slow Burn**
Brevo SMTP has a brief outage. Twenty orders process. Zero emails are sent. Customers flood support. The only record is a console.error buried in logs nobody reads until something breaks.

**Card 4: AI vs. Senior**
AI sees email as a non-critical side effect. A senior sees email as a customer trust contract. Silent failures are the most expensive kind because you don't know you're bleeding trust.

**Card 5: The Correct Fix**
Implement a retry queue for transactional emails. Log failures to a table support can monitor. Send alerts when email delivery fails. If you can't guarantee delivery, guarantee visibility.

**Card 6: The Takeaway**
AI silently swallows errors it can't handle. In production, silent failures become surprises. What critical side effects in your app are running fire-and-forget with no one watching?

---

## Day 15 — The Order Number That Could Collide

**Card 1: The Hook**
Every order needs a unique number. AI generated it with crypto.randomUUID outside the transaction. Collision probability is low — until you're processing thousands of orders and generation happens before the insert.

**Card 2: The Quick Fix**
AI generated the order number as AUR- plus a random hex string. Generated in app code before the DB insert. The database has a UNIQUE constraint as a safety net.

**Card 3: The Slow Burn**
Two requests generate the same hex string at the same time. The second insert hits the unique constraint and fails. An order that was already paid gets a 500 error during webhook processing.

**Card 4: AI vs. Senior**
AI generates IDs in app code because that's where code runs. A senior generates IDs in the DB using sequences or gen_random_uuid() within the transaction. If the ID defines the record, the DB should own it.

**Card 5: The Correct Fix**
Generate order numbers using a DB sequence or gen_random_uuid() in the INSERT itself. The identifier should be created atomically with the row.

**Card 6: The Takeaway**
AI generates IDs in app code because it doesn't think about concurrency. If two requests can produce the same value, they eventually will at scale. What identifiers in your app are generated outside a transaction?

---

## Day 16 — The Receipt That Shows on Reload

**Card 1: The Hook**
The success page stores order details in sessionStorage for the receipt. Works perfectly the first time. The customer refreshes. The receipt is gone. They think the order failed and order again.

**Card 2: The Quick Fix**
AI stored checkout data in sessionStorage before redirecting. Read on mount, display the receipt. Clean and simple for the happy path.

**Card 3: The Slow Burn**
The customer refreshes to take a screenshot. SessionStorage clears. Data gone. They check email for confirmation. No email yet. They contact support thinking something went wrong.

**Card 4: AI vs. Senior**
AI uses the simplest client storage because it works in the demo. A senior knows sessionStorage is ephemeral. If the data matters, it shouldn't live only in browser memory.

**Card 5: The Correct Fix**
Render the success page from the server using the order ID from the URL. Fetch details server-side. Display a "processing" state rather than data that vanishes on refresh.

**Card 6: The Takeaway**
If your success page empties on reload, your customers think the action failed. What data in your app is one refresh away from disappearing?

---

## Day 17 — The Reservation Table That Never Shrinks

**Card 1: The Hook**
Every checkout creates a reservation row expiring in 35 minutes. The query ignores expired rows. Nobody deletes them. In six months, your stock check scans millions of dead rows.

**Card 2: The Quick Fix**
AI added WHERE expires_at > NOW() to filter expired reservations. Expired rows are invisible to queries. Problem solved, right?

**Card 3: The Slow Burn**
Every checkout creates reservation rows. Even abandoned ones. After six months with 1,000 visits daily, the table has 180,000+ rows. Your stock check has to scan through them all to find active reservations.

**Card 4: AI vs. Senior**
AI thinks in query logic — filter conditions. A senior thinks in data lifecycle — what removes data that outlived its purpose. A WHERE clause hides expired data but doesn't make the table smaller.

**Card 5: The Correct Fix**
Add a background job that deletes expired reservations. Run as a cron or scheduled function. If you can't schedule, have your stock check bulk-delete expired rows as a side effect.

**Card 6: The Takeaway**
AI writes INSERT but never DELETE. Every table with TTL data needs a cleanup strategy. What tables in your database grow forever because nobody told AI to clean them?

---

## Day 18 — The Stock That Gets Deducted Twice

**Card 1: The Hook**
The webhook checks stock then decrements it — two queries inside a transaction. AI assumed atomicity. The gap between check and decrement creates a race window.

**Card 2: The Quick Fix**
AI wrote: SELECT stock, check if stock >= quantity, then UPDATE SET stock = stock - 1. FOR UPDATE should prevent races.

**Card 3: The Slow Burn**
The check and update are two round trips within the transaction. If the handler throws between them — say, validation fails on another item — the transaction rolls back, but the code already decided "stock is available."

**Card 4: AI vs. Senior**
AI uses FOR UPDATE because it's the obvious lock. A senior uses a single atomic UPDATE with the check in the WHERE clause: UPDATE stock WHERE id = X AND stock >= qty. One query, no race.

**Card 5: The Correct Fix**
Replace check-then-decrement with a single atomic UPDATE that bakes the stock check into the WHERE. Check rowCount. If 0, roll back. One round trip, no race window.

**Card 6: The Takeaway**
AI writes read-then-write because that's human logic. Databases work better with write-and-verify. Every SELECT-decide-UPDATE pattern creates a race condition. How many hide in your code?

---

## Day 19 — The Floating Point Tax Problem

**Card 1: The Hook**
Tax is simple: multiply subtotal by 0.08, round to two decimals. AI used JavaScript Number arithmetic. Those tiny rounding errors compound into a measurable gap between charged and booked.

**Card 2: The Quick Fix**
AI said: Math.round(subtotal * 0.08 * 100) / 100. The standard JS rounding pattern. Every JavaScript tutorial shows this exact line.

**Card 3: The Slow Burn**
$149.97 at 8% tax is $11.9976, rounded to $12.00. $149.98 is $11.9984, rounded to $12.00. Over 10,000 orders, rounding discrepancies add up. Your accounting team finds a $47 gap between processor and database.

**Card 4: AI vs. Senior**
AI uses float because JS numbers are always floats. A senior knows financial calculations use integer arithmetic — work in cents, not dollars. The DB stores NUMERIC exactly. JS converts to float on read.

**Card 5: The Correct Fix**
Store and calculate in integer cents. Multiply by 100 on input, divide by 100 only for display. Never use Number() for financial calculations. Never round at intermediate steps.

**Card 6: The Takeaway**
AI treats money as a number. Senior engineers treat it as a precision problem. Every floating-point currency calculation is a potential accounting discrepancy. Are you calculating in floats or integers?

---

## Day 20 — The Concurrent Checkout Overbooking

**Card 1: The Hook**
Two customers add the last item to their cart and checkout simultaneously. The reservation system should prevent overselling. But the gap between "check stock" and "reserve" is wide enough for both to squeeze through.

**Card 2: The Quick Fix**
AI checks available stock by subtracting reservations from total, then inserts a new reservation. Both requests read the same available stock. Both see 1. Both insert. Oversold.

**Card 3: The Slow Burn**
The endpoint locks the row with FOR UPDATE. But the stock-minus-reservations calculation happens at read time, not write time. Two requests acquire the lock sequentially, but both read the same pre-lock value.

**Card 4: AI vs. Senior**
AI implements locking on the wrong operation. A senior knows the stock check and reservation must be a single atomic action. Either a constraint prevents double-booking or you use conditional INSERT.

**Card 5: The Correct Fix**
Replace check-then-insert with a constraint limiting total reservations per product-size to stock level. Or use a single conditional INSERT with the stock check as a subquery.

**Card 6: The Takeaway**
AI's locking looks correct in isolation. Under concurrency, "check then act" always has a race window. Is your most expensive inventory protected by a single atomic operation?

---

## Day 21 — The Expired Reservation That Still Blocks

**Card 1: The Hook**
Reservations expire in 35 minutes. Checkout links expire in 30. The 5-minute buffer seems like safety — until a customer walks away and blocks real buyers for 35 minutes.

**Card 2: The Quick Fix**
AI set reservation TTL to 35 minutes and checkout TTL to 30. The 5-minute buffer handles webhook delays. Expired reservations are ignored by queries. Clean.

**Card 3: The Slow Burn**
A customer abandons checkout. The link expires in 30 minutes. The reservation stays for 35. Nobody can buy that item for 35 minutes. During a flash sale, 50 abandoned checkouts block all real customers.

**Card 4: AI vs. Senior**
AI aligns TTL with checkout and adds a buffer. A senior aligns TTL with realistic completion time. The reservation should expire when the checkout expires, not later.

**Card 5: The Correct Fix**
Set the reservation TTL to match checkout expiry exactly. Webhooks process in seconds, not minutes. Handle the expiry edge case with a grace period rather than a 5-minute inventory block.

**Card 6: The Takeaway**
AI adds buffer time as safety. In production, buffer time is lost revenue. Every minute a reservation blocks inventory without payment is a minute a real customer can't buy.

---

## Day 22 — The Missing Dead Letter Queue

**Card 1: The Hook**
A webhook arrives, signature checks out, database is momentarily down. Endpoint returns 500. Provider retries. But the first attempt's data is gone forever. No replay. No inspection. No proof.

**Card 2: The Quick Fix**
AI returns 500 on failure. The provider retries. If the DB comes back, the retry succeeds. No special error handling.

**Card 3: The Slow Burn**
Database down for 30 seconds. Five webhooks fail. Provider retries. One fails again because custom data was truncated. Order lost. Charged but not fulfilled. Zero record of it.

**Card 4: AI vs. Senior**
AI assumes retries are sufficient. A senior knows repeated failures need forensic data. A dead letter queue stores every failed payload. You can inspect, replay, and reconcile.

**Card 5: The Correct Fix**
Store raw webhook payloads before processing with status "pending." Update to "processed" or "failed." Build an admin panel for inspection and replay.

**Card 6: The Takeaway**
AI's error handling is binary. Production error handling has a third state: recorded. If you can't replay a failed webhook, your payment pipeline has a single point of failure.

---

## Day 23 — The Guest Order That Can't Be Found

**Card 1: The Hook**
A guest orders, then creates an account. They expect to see their order history. The order has user_id = null. The query filters by user_id. They can't find their most recent purchase.

**Card 2: The Quick Fix**
AI sets user_id to null for guests. Orders are associated by email in a JSON field. When the customer signs up, there's no backfill.

**Card 3: The Slow Burn**
Customers regularly check out as guests then create accounts. Support tickets pour in — "where are my orders?" Your team manually links orders by email. 5 minutes per request. 50 tickets weekly = 4 hours of support time.

**Card 4: AI vs. Senior**
AI models checkout and signup as independent flows. A senior models them as stages in a customer lifecycle. If a user exists, link the order. If not, store enough to link later.

**Card 5: The Correct Fix**
On account creation, scan for orders matching the email and backfill user_id. Better yet, prompt guest customers to set a password after checkout and link immediately.

**Card 6: The Takeaway**
AI treats guest and authenticated users as different species. They're the same person at different stages. What data is siloed by auth state when it should be connected by identity?

---

## Day 24 — The Input That Was Never Validated

**Card 1: The Hook**
The newsletter endpoint validates the email has an @ symbol. A single regex. AI called it done. The email was never checked for deliverability or domain existence. Thousands of fake subscribers.

**Card 2: The Quick Fix**
AI added a basic email check — if the string includes @, it's valid. The industry standard in every framework's docs.

**Card 3: The Slow Burn**
Bots hit your endpoint with thousands of fake emails. Each passes validation. Your subscriber count looks great, but your email provider's deliverability score plummets from hard bounces. Legitimate subscribers stop getting emails.

**Card 4: AI vs. Senior**
AI validates format. A senior validates intent. Format stops typos, not abuse. Every unprotected POST is an invitation for bots to degrade your data and service reputation.

**Card 5: The Correct Fix**
Rate-limit the endpoint. Require email verification via confirmation link. Check DNS MX records before accepting. Make bots work harder than real users.

**Card 6: The Takeaway**
AI validates what data looks like, not what it means. Every public POST endpoint is a data quality attack surface. What endpoints accept data from anyone without verifying the sender is human?

---

## Day 25 — The Auth Check That Does Nothing

**Card 1: The Hook**
The admin panel requires authentication. AI added the check to the layout component. The data is fetched client-side. Anyone who opens the network tab can bypass the guard.

**Card 2: The Quick Fix**
AI checks the user's role in the admin layout and redirects non-admins. It fires on every page visit. Clean UX.

**Card 3: The Slow Burn**
A user inspects network traffic. They see admin API endpoints returning data. The layout redirects them, but data has already been fetched. They can call admin APIs from the console with their own session cookie.

**Card 4: AI vs. Senior**
AI enforces access on the client because that's where the UI lives. A senior knows client checks are UX, not security. Every API endpoint must independently verify authorization.

**Card 5: The Correct Fix**
Every admin endpoint calls a server-side authorization function before returning data. The client redirect is for UX, not security. Double-check, not single-blame.

**Card 6: The Takeaway**
AI treats authorization as a UI concern. Seniors treat it as an API concern. Any security check in the browser is optional. How many protections disappear when someone opens the network tab?

---

## Day 26 — The Image Cleanup That Deletes Too Much

**Card 1: The Hook**
When a product image is replaced, the old one is deleted from storage if no other product references it. AI's reference-counting cleanup has an edge case that deletes still-used assets.

**Card 2: The Quick Fix**
AI counts references to a storage URL across all products. If zero, delete. Reference-counting for media assets. Prevents orphans.

**Card 3: The Slow Burn**
The reference check runs in a transaction, but the storage delete is an HTTP call outside the DB. If the storage delete succeeds but the DB transaction rolls back, the asset is gone but the reference still exists.

**Card 4: AI vs. Senior**
AI uses transactions for the check but the side effect is outside the transaction boundary. A senior knows that operations spanning systems need compensating actions or two-phase commits.

**Card 5: The Correct Fix**
Commit the DB transaction regardless of storage result. Or mark images as pending-deletion in the DB and let a background job handle the actual delete with retry logic.

**Card 6: The Takeaway**
AI treats storage as a side effect that always succeeds. Network calls fail. When cleanup deletes assets it shouldn't, data loss is permanent. What safety nets sit between your cleanup and irreversible deletes?

---

## Day 27 — The Search That Exposes Too Much

**Card 1: The Hook**
Products are public — the endpoint doesn't need auth. But it exposes IDs, slugs, and categories that competitors can aggregate to map your catalog and infer business strategy.

**Card 2: The Quick Fix**
AI made the products endpoint public. The storefront needs everyone to see products. CDN-cached. Performance is excellent.

**Card 3: The Slow Burn**
A competitor hits your products endpoint daily. They detect when you add or remove products, infer inventory strategy, and guess pricing patterns. Your catalog becomes competitive intelligence.

**Card 4: AI vs. Senior**
AI sees public data as non-sensitive. A senior knows data aggregation is competitive risk. Public at scale reveals strategy. Rate limiting protects not just resources but information.

**Card 5: The Correct Fix**
Rate-limit public endpoints. Assess what can be inferred from consistent polling. Consider pagination limits that reduce the value of automated scraping.

**Card 6: The Takeaway**
AI treats "public" as binary. In business, "public at scale" is a risk. What data is technically public but strategically sensitive when aggregated?

---

## Day 28 — The Parallel Queries That Race Each Other

**Card 1: The Hook**
The admin dashboard runs five parallel queries. AI used Promise.all for speed. When the pool has limited connections, parallel queries compete instead of cooperating.

**Card 2: The Quick Fix**
AI ran five queries simultaneously with Promise.all. Five queries at 50ms each should resolve in 50ms, not 250ms. The dashboard loads fast.

**Card 3: The Slow Burn**
The pool has 10 connections. Five go to the dashboard. The products page needs one. Zero available. The request waits. Under load, parallel queries make the pool a bottleneck that hurts every other user.

**Card 4: AI vs. Senior**
AI optimizes for latency — fast dashboard. A senior optimizes for throughput — don't let one request starve others. Parallel queries consume connections linearly while serving one user.

**Card 5: The Correct Fix**
Replace parallel queries with a single aggregate query or consolidate into fewer round trips. If parallel is necessary, ensure the pool can handle peak usage without exhausting connections.

**Card 6: The Takeaway**
AI parallelizes because more threads = faster. In databases, more parallel connections = fewer for everyone else. Does your concurrency strategy help individual pages or hurt the overall system?

---

## Day 29 — The Price That Lives on the Client

**Card 1: The Hook**
The cart stores prices in localStorage. The checkout re-fetches from the DB. But the cart drawer, summary, and preview all show the unverified client-side price for the entire purchase flow.

**Card 2: The Quick Fix**
AI stores prices with cart items for instant display. The server re-fetches at checkout. The client price is just for display. Clean separation.

**Card 3: The Slow Burn**
Everything matches until it doesn't. If the DB price changes between cart view and checkout submission, the customer saw $100 but the server charged $120. No one can explain the discrepancy.

**Card 4: AI vs. Senior**
AI separates display authority from server authority but doesn't surface verification to the user. A senior knows the displayed price should be verified and shown to the customer before payment.

**Card 5: The Correct Fix**
Return verified pricing from the checkout endpoint so the customer sees exact charges before confirming. Never let a customer pay without seeing the server-verified total.

**Card 6: The Takeaway**
AI separates display from authority but forgets to show authority to the user. What prices in your flow are displayed without server verification before payment?

---

## Day 30 — The Webhook That Doesn't Scale

**Card 1: The Hook**
Every webhook opens a transaction, verifies signature, processes the order, deducts stock, and sends email. During a flash sale, webhooks arrive faster than the handler can process. The queue builds. Orders fail.

**Card 2: The Quick Fix**
AI processes webhooks synchronously in a POST handler. One event at a time in one transaction. On a normal day with 50 orders, it's instantaneous.

**Card 3: The Slow Burn**
A flash sale generates 200 orders in 3 minutes. Each webhook takes 500ms-2s. The second waits for the first. Some time out and get retried. Duplicate processing risk rises. Stock deductions back up.

**Card 4: AI vs. Senior**
AI builds a linear handler because webhooks are usually sequential. A senior builds an idempotent handler with async processing. Acknowledge receipt immediately, process from a queue at a controlled rate.

**Card 5: The Correct Fix**
Separate receipt from processing. Validate the signature, store the event in a queue, return 200 immediately. Process events from the queue at a sustainable rate.

**Card 6: The Takeaway**
AI builds every handler to work in isolation. Production requires systems that work under load. Your payment webhook is the most critical async pipeline. Can it handle 10x traffic without falling over?

---

*Written in first person as Asad — a self-taught full-stack developer who built an e-commerce platform with AI assistance and lived to tell the story.*
