# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/6a792c51-0dcd-41b7-8ace-4687aefbef25

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/6a792c51-0dcd-41b7-8ace-4687aefbef25) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/6a792c51-0dcd-41b7-8ace-4687aefbef25) and click on Share -> Publish.

## Property purchase requests and rental applications

Apply the SQL migration in `supabase/migrations/20261111143000_add_property_transactions.sql` to the connected Supabase project before deploying the updated app. Existing listings are preserved and default to For Sale / Available. Admins can set a listing to For Sale, For Rent, or both, maintain rental terms, and manage its availability from the property editor.

Signed-in users can submit purchase requests or rental applications, then review their status under **My Requests**. Request ownership, duplicate active applications, property availability, and administrator-only status changes are enforced by Supabase policies and the `create_property_request` database function.

The existing `send-ticket-notification` Edge Function also sends request and status emails. It uses the existing `RESEND_API_KEY` and Supabase function secrets. Set `PROPERTY_REQUEST_NOTIFICATION_EMAIL` in the Edge Function environment to receive new-request alerts; this value is optional. If email delivery is unavailable, the request still saves and remains visible in the user and admin dashboards.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
