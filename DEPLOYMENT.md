# Deployment Guide

This guide explains how to deploy your application to production.

## Build Process

### Prerequisites

**IMPORTANT**: The build process requires `esbuild` to compile the server code. This is already included in `devDependencies` in `package.json`.

**For CI/CD or production builds**: Ensure devDependencies are installed. Most platforms install them by default, but if your build fails with "esbuild: command not found", ensure your deployment platform is configured to install devDependencies:

```bash
npm install
```

(NOT `npm install --production` which skips devDependencies)

### Option 1: Use the Custom Build Script (Recommended)

Run the custom build script that properly organizes the build output:

```bash
chmod +x build.sh
./build.sh
```

This script:
- Builds the client and outputs to `dist/public/`
- Builds the server and outputs to `dist/index.js` using esbuild
- Both are required for the production server to work correctly

### Option 2: Update package.json

If you have access to modify package.json, update the build script to:

```json
"build": "vite build --outDir dist/public --emptyOutDir && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/index.js"
```

## Environment Variables

**IMPORTANT**: Environment variables from `.env` files are NOT loaded in production. You must configure these as Deployment Secrets in your hosting platform.

### Required Environment Variables

Set these in your deployment platform's secrets/environment variables configuration:

1. **NODE_ENV** (Required)
   - Value: `production`
   - Purpose: Enables production mode for the application

2. **PORT** (Optional)
   - Value: `5000`
   - Purpose: Port the server listens on (defaults to 5000 if not set)
   - Note: The application MUST run on port 5000 for Replit deployments

3. **DATABASE_URL** (Required if using database)
   - Value: `postgres://username:password@hostname:5432/database_name`
   - Purpose: PostgreSQL database connection string
   - Example: `postgres://user:pass@ep-xxx.us-east-2.aws.neon.tech/mydb`

4. **SESSION_SECRET** (Required)
   - Value: A long, random string (at least 32 characters)
   - Purpose: Used to sign session cookies
   - Generate with: `openssl rand -base64 32`
   - Example: `your-super-secret-session-key-here`

5. **STACK_PROJECT_ID** (Required if using StackFrame auth)
   - Value: Your StackFrame project ID
   - Purpose: StackFrame authentication integration

6. **STACK_PUBLISHABLE_CLIENT_KEY** (Required if using StackFrame auth)
   - Value: Your StackFrame publishable client key
   - Purpose: StackFrame client-side authentication

7. **STACK_SECRET_SERVER_KEY** (Required if using StackFrame auth)
   - Value: Your StackFrame secret server key
   - Purpose: StackFrame server-side authentication
   - ⚠️ **Never commit this to version control**

## Deployment Configuration

### Run Command

The production run command should be:

```bash
node dist/index.js
```

The server will:
- Run on port 5000 (or the PORT environment variable)
- Serve the built client files from `dist/public/`
- Handle API routes under `/api/`

### Build Command

Update your deployment platform's build command to:

```bash
./build.sh
```

OR if using the updated package.json:

```bash
npm run build
```

## Deployment Checklist

Before deploying, ensure:

- [ ] DevDependencies are installed (including `esbuild` for server compilation)
- [ ] All required environment variables are set as Deployment Secrets
- [ ] Build command is configured to run `./build.sh` or `npm run build`
- [ ] Run command is set to `node dist/index.js`
- [ ] PORT environment variable is set to `5000` (for Replit deployments)
- [ ] NODE_ENV is set to `production`
- [ ] DATABASE_URL is set (if using a database)
- [ ] SESSION_SECRET is set to a secure random value
- [ ] The build script has execute permissions (`chmod +x build.sh`)

## Troubleshooting

### "esbuild: command not found" or Build Fails

**Cause**: The `esbuild` package (required for compiling the server) is not installed.

**Solutions**:
1. Ensure you're running `npm install` (NOT `npm install --production`)
2. Verify `esbuild` is listed in `devDependencies` in `package.json`
3. If your deployment platform has a separate setting for installing devDependencies, enable it
4. Try running `npm install esbuild` manually if needed

### "Application failed to open a port in time"

**Cause**: The server isn't starting properly or listening on the wrong port.

**Solutions**:
1. First, ensure the build completed successfully (check for `dist/index.js` and `dist/public/`)
2. Ensure `PORT` environment variable is set to `5000`
3. Verify `NODE_ENV` is set to `production`
4. Check that `dist/public/` directory exists and contains the built client files
5. Review build logs for any esbuild errors

### "Environment variables are not being loaded"

**Cause**: `.env` files are not loaded in production builds.

**Solution**: Set all environment variables as Deployment Secrets in your hosting platform, not in `.env` files.

### "Could not find the build directory"

**Cause**: The build output is in the wrong location.

**Solution**: Use the custom `build.sh` script which outputs to the correct `dist/public/` directory.

## Directory Structure After Build

```
dist/
├── index.js          # Compiled server code
└── public/           # Built client files
    ├── index.html
    ├── assets/
    │   ├── index-[hash].js
    │   └── index-[hash].css
    └── [other static files]
```

The server (dist/index.js) serves files from dist/public/ in production mode.
