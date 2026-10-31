# WordPress.org Plugin Submission & Asset Guide for Crescelo

This package contains all assets, files, and legal documentation required by the official WordPress.org Plugin Review Team to publish **Crescelo – AI Chatbot, Website Scraper & Customer Support Assistant**.

---

## 1. Directory Structure for WordPress.org SVN

When your plugin is approved by the WordPress.org team, they will grant you Subversion (SVN) access at:
`https://plugins.svn.wordpress.org/crescelo/`

Your SVN repository requires the following root layout:

```text
crescelo/
├── assets/                     <-- Copy the files from wordpress-org-assets/assets/ here
│   ├── banner-772x250.png      <-- Standard Header Banner (772x250 px)
│   ├── banner-1544x500.png     <-- Retina Header Banner (1544x500 px)
│   ├── icon-128x128.png        <-- Standard Square Icon (128x128 px)
│   ├── icon-256x256.png        <-- Retina Square Icon (256x256 px)
│   ├── icon.svg                <-- Scalable Vector Icon
│   ├── screenshot-1.png        <-- 1. Onboarding Wizard & Goal Selection
│   ├── screenshot-2.png        <-- 2. Database Scanner & Post Type Discovery
│   ├── screenshot-3.png        <-- 3. Content Curation & Action Features
│   ├── screenshot-4.png        <-- 4. Batch Ingestion & Progress Logs
│   └── screenshot-5.png        <-- 5. Interactive Simulated Chatbot Preview
│
├── trunk/                      <-- All plugin code (crescelo/ folder contents)
│   ├── assets/
│   │   ├── css/wizard.css
│   │   └── js/wizard.js
│   ├── includes/
│   │   ├── class-crescelo-client.php
│   │   ├── class-live-api.php
│   │   ├── class-site-scanner.php
│   │   ├── class-sync-hooks.php
│   │   ├── class-wizard-controller.php
│   │   └── class-woocommerce-admin.php
│   ├── templates/
│   │   ├── admin-settings.php
│   │   └── admin-wizard.php
│   ├── crescelo.php            <-- Main Plugin File (v2.2.1, GPLv2)
│   ├── LICENSE                 <-- Full GNU General Public License v2 text
│   ├── readme.txt              <-- Standard WordPress.org Readme (v2.2.1)
│   └── uninstall.php           <-- Clean uninstall cleanup
│
└── tags/
    └── 2.2.1/                  <-- Copy of trunk/ for release tag 2.2.1
```

---

## 2. Step-by-Step Submission Instructions

### Step A: Submit Plugin for Review (Initial Approval)
1. Go to: [https://wordpress.org/plugins/developers/add/](https://wordpress.org/plugins/developers/add/)
2. Log in with your WordPress.org account.
3. Upload `crescelo.zip`.
4. Wait for the WordPress.org review team email (usually 1–5 business days). Once approved, they will give you SVN repository credentials.

### Step B: Clone SVN Repository
Run the following in your terminal:
```bash
svn checkout https://plugins.svn.wordpress.org/crescelo crescelo-svn
cd crescelo-svn
```

### Step C: Copy Plugin Code into `trunk/`
Copy the contents of the `wordpress/crescelo/` folder directly into `crescelo-svn/trunk/`.

### Step D: Copy Directory Assets into `assets/`
Copy all files from `wordpress-org-assets/assets/` into `crescelo-svn/assets/`.

### Step E: Create Release Tag `2.2.1`
```bash
svn cp trunk tags/2.2.1
```

### Step F: Add and Commit to WordPress.org
```bash
svn add trunk/* assets/* tags/* --force
svn commit -m "Release version 2.2.1 with directory assets and banners"
```

Once committed, your plugin page on WordPress.org (e.g. `https://wordpress.org/plugins/crescelo/`) will automatically display the banners, icons, screenshots, and readme information!

---

## 3. Specifications of Prepared Assets

| Asset Name | Resolution | Format | Purpose |
|---|---|---|---|
| `banner-772x250.png` | 772 × 250 px | PNG | Header banner on desktop / standard screens |
| `banner-1544x500.png` | 1544 × 500 px | PNG | High-DPI / Retina header banner |
| `icon-128x128.png` | 128 × 128 px | PNG | Plugin card icon in WordPress Admin directory |
| `icon-256x256.png` | 256 × 256 px | PNG | High-DPI icon in plugin cards & search |
| `icon.svg` | Vector | SVG | Scalable vector logo icon |
| `screenshot-1.png` | 1280 × 800 px | PNG | Step 1: Onboarding & Goal Selection |
| `screenshot-2.png` | 1280 × 800 px | PNG | Step 2: Database Scanner & Dynamic Metrics |
| `screenshot-3.png` | 1280 × 800 px | PNG | Step 3: Structured Curation & Commerce Actions |
| `screenshot-4.png` | 1280 × 800 px | PNG | Step 4: Batch Vector Ingestion Progress |
| `screenshot-5.png` | 1280 × 800 px | PNG | Step 5: Live Interactive Chatbot Preview |
| `LICENSE` | Text | Plain Text | GPL-2.0 License required by WordPress.org |
| `readme.txt` | Standard WP | Plain Text | Validated against WordPress.org standards |
