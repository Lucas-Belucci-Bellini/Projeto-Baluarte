# Baluarte — Ecosystem Mesh Gateway Principles

## Purpose

Define the Baluarte as the controlled gateway through which ecosystem projects discover and consume capabilities from other projects.

The goal is not to expose the internal database topology. The goal is to expose stable capabilities through explicit contracts.

## Core model

```text
Project
  |
  | capability request
  v
Baluarte Gateway
  |
  +--> capability registry
  +--> authorization
  +--> tenant boundary
  +--> provider selection
  +--> policy/data classification
  |
  v
Authorized Provider
  |
  v
Result + provenance + confidence
```

## What the gateway does

1. Accept a versioned capability request.
2. Authenticate the requester.
3. Authorize the requester for the tenant, project and capability.
4. Discover eligible providers without exposing their internal database schema.
5. Select an authorized provider according to capability version, policy and confidence requirements.
6. Return the minimum necessary result.
7. Attach provenance/evidence when the capability supports it.
8. Record an auditable interaction reference.

## What the gateway does not do

- It does not provide arbitrary SQL access between projects.
- It does not expose internal tables merely because two projects are integrated.
- It does not require every project to implement every capability.
- It does not force optional product features such as Plans onto projects whose domains do not need them.
- It does not make the Baluarte the owner of every project's domain data.

## Capability discovery

A requester asks for a capability, not for another project's tables.

Example:

```text
TaxForge
  -> request: capability X
  -> Baluarte registry
  -> candidate providers: Veritas, AEGIS, ARK, ...
  -> authorization/policy filtering
  -> provider selected
  -> result returned to TaxForge
```

If the selected provider cannot satisfy the request, the gateway may continue discovery among other authorized providers, subject to retry, cost, trust and policy limits.

## Information boundaries

The ecosystem may have a private engineering topology. Product documentation should describe the public behavior and contracts required by users, while internal architecture documentation may describe implementation details needed by maintainers.

This is an architectural confidentiality boundary, not a substitute for security. Security must come from authentication, authorization, RLS, service boundaries, least privilege, auditability and secret management.

Never place credentials, tokens, private keys or other secrets in this repository.

## Scaling target

The design must avoid point-to-point integration growth such as:

```text
N projects -> N * (N - 1) direct integrations
```

Instead:

```text
N projects -> Baluarte contracts/gateway -> authorized capabilities
```

The long-term target is approximately 100 projects without requiring every project to know or integrate directly with every other project.

## First proof

The first controlled proof should be TaxForge <-> Veritas:

1. Define one concrete capability.
2. Define request and result contracts.
3. Define authorization and tenant rules.
4. Define provenance requirements.
5. Implement the smallest possible gateway path.
6. Verify that no direct cross-project table access is required.
7. Measure whether a second provider can be added without changing TaxForge's domain model.

## Relationship to Supabase

Supabase can provide persistence, RLS, authentication and supporting infrastructure, but the database is not itself the mesh protocol.

The mesh contracts remain the architectural boundary. Internal schemas can evolve behind those contracts.
