# Contact + Forms Design

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create contact page with map and form, plus problem report page with photo upload.

**Architecture:** Two public pages with API routes storing submissions to existing DB tables. Rate limiting and honeypot spam protection. Leaflet map with OpenStreetMap (no API key).

**Tech Stack:** Next.js App Router, Zod validation, Leaflet/react-leaflet, existing R2 image upload.

---

## Pages

### /kontakt
- Municipality contact information (address, phone, email)
- Working hours display (weekdays 7:00-15:00)
- Interactive Leaflet map with OpenStreetMap tiles
- Contact form (name, email, subject optional, message)

### /prijava-problema
- Problem type selector: cesta, rasvjeta, otpad, komunalno, ostalo
- Location text field
- Description textarea
- Photo upload (up to 5 images, reuse R2 infrastructure)
- Optional contact info (name, email, phone)

## API Routes

### POST /api/contact
- Validates: name, email, message (subject optional)
- Rate limit: 5/hour per IP
- Honeypot field check
- Stores to ContactMessage table
- Returns success/error JSON

### POST /api/problem-report
- Validates: problemType, location, description
- Optional: reporterName, reporterEmail, reporterPhone, images
- Rate limit: 3/hour per IP
- Honeypot field check
- Stores to ProblemReport table
- Returns success/error JSON

## Components

### @repo/ui
- `ContactForm` - Client component with react-hook-form
- `ProblemReportForm` - Client component with image upload
- `ContactInfo` - Server component for address/phone/email
- `WorkingHours` - Server component for office hours
- `LeafletMap` - Dynamic client component (no SSR)

### @repo/shared
- `contactFormSchema` - Zod schema for contact form
- `problemReportSchema` - Zod schema for problem report

## Rate Limiting

Simple in-memory rate limiter for MVP.

## Database Tables (existing)

- `ContactMessage` - id, name, email, subject, message, status, ipAddress, createdAt
- `ProblemReport` - id, reporterName, reporterEmail, reporterPhone, problemType, location, description, images, status, ipAddress, createdAt
