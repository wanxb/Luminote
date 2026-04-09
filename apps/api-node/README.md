# Luminote Node API

This app is the self-hosted runtime shell that will mirror the current Worker API.

Current scope:

- boots a Node HTTP server
- exposes `/api/health`
- serves as the landing point for the portable runtime migration

Future stages will add:

- public site routes
- public photo routes
- admin auth routes
- admin upload and configuration routes
- storage and database adapters for self-hosted deployment
