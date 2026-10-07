# Stagecraft

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: students preparing class presentations, seminar contributions, and group project pitches.
Secondary: anyone rehearsing a short talk, introduction, or idea without an audience watching.
Keep the invitation welcoming beyond campus. Audience confirmed by the project owner.

## Product Purpose

A browser-first speaking practice studio: prepare a script, record up to five minutes, listen without
video, watch without audio, then combine the observations into one practical next step. An editable focus stays with the
script between takes and across reloads in the current tab.

## Capabilities and Constraints

Existing stack: JavaScript, Vite, Fastify, Gemini, MediaPipe, and Pitchy. Keep the existing stack and
hash navigation. Full video stays in the browser. Cloud review uses audio and up to twenty resized
images with explicit consent. Scores come from a deterministic rubric, never an AI opinion. Missing
evidence produces an unavailable score. Camera observations cannot measure internal confidence.

Recording is supported in desktop Chromium browsers over localhost or HTTPS. Pages must work on
small screens. The current API needs a continuously running Node service; sessions are temporary
and instance-local. Multi-instance persistence, accounts, and retained cloud video are outside the
existing product scope. AI requires a server-side Gemini key and project quota.

## Brand Commitments

Preserve the Stagecraft name. The owner requests a minimal, elegant, modern product with distinctive
typography, clear interactions, responsive layouts, and no decorative glass or unnecessary gradients.
The owner selected a code-first build and delegated routine product and design decisions.

## Evidence on Hand

The implementation and README are evidence for functionality. No customer counts, testimonials,
accuracy benchmarks, or commercial claims have been supplied. Any demonstration is labeled.

## Product Principles

- Help people choose one useful thing to practice next.
- Explain what observations can and cannot establish.
- Preserve local recordings when AI, tracking, or network requests fail.
- Make privacy choices understandable before media leaves the browser.
- Treat users' voices and drafts as personal work, not leaderboard material.
