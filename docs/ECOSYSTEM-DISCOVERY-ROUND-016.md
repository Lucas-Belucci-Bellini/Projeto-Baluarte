# Ecosystem Discovery Round 016 — AEGIS Ocean Reorientation

Date: 2026-08-17

## Decision
AEGIS is being reoriented from an autonomous software-engineering solver into **AEGIS — Autonomous Geospatial & Environmental Intelligence System**, focused initially on seafloor mapping and ocean intelligence.

## Source state
The current AEGIS main branch contains a README prompt defining an autonomous software-engineering investigation agent: observe, understand, investigate, prove, correct, test, verify, and document. The repository currently contains only that README on `main`.

## Reuse strategy
The old investigation philosophy is not discarded. It becomes the methodological core for scientific data work:

Observe → Understand → Investigate → Prove → Validate → Document

Applied to:
- bathymetric observations;
- processing pipelines;
- evidence chains;
- anomalies;
- terrain-feature hypotheses;
- uncertainty;
- human validation.

## New AEGIS domain
Primary capabilities planned:
- bathymetry and seafloor data registry;
- geospatial AOIs;
- source/provenance tracking;
- bathymetric grids and terrain derivatives;
- observation coverage analysis;
- uncertainty mapping;
- feature/anomaly detection;
- evidence graph;
- survey-gap prioritization;
- human review;
- future Knowledge Mesh capabilities.

## Scientific basis
Modern seafloor mapping commonly uses multibeam sonar to measure depth and acoustic backscatter. High-resolution mapping can require sensors close to the seafloor, while broad/global products may combine lower-resolution sources. Seabed 2030 reported 28.7% of the world's ocean floor mapped to modern standards in April 2026.

## First milestone
Do not begin with autonomous robotics or a giant AI model. First build:

AOI + dataset registry + observation metadata + provenance + bathymetric visualization + coverage/uncertainty map.

## Knowledge Mesh boundary
AEGIS will own ocean-domain data and scientific processing. Baluarte will own platform-level interoperability and capability contracts. Other projects will consume bounded capabilities rather than direct database access.

## Current PR
AEGIS PR #18 — `docs: define AEGIS Ocean Intelligence rearchitecture`
Branch: `docs/aegis-ocean-rearchitecture`
Status: draft

## Next round
Round 017: review the AEGIS plan against the six-project Knowledge Mesh and identify the first concrete data schema and storage boundary. No cross-project integration should be implemented until the domain schema is reviewed.
