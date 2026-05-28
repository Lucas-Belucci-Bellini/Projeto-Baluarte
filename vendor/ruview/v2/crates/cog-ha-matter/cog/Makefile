# Build / sign / upload pipeline for cog-ha-matter.
# See ADR-100 §"Build pipeline" + ADR-116 §"Phases" for the contract.
# Mirrors cog-pose-estimation/cog/Makefile so the Seed runtime treats
# both cogs identically — `cognitum cog install ha-matter` works the
# same as `cognitum cog install pose-estimation`.

CRATE       := cog-ha-matter
VERSION     := $(shell cargo pkgid -p $(CRATE) 2>/dev/null | sed -E 's/.*#([0-9.]+).*/\1/')
GCS_BUCKET  := gs://cognitum-apps/cogs

ARCHES      := arm x86_64

# --- Build targets ---

.PHONY: build build-arm build-x86_64

build: build-arm build-x86_64

build-arm:
	mkdir -p dist
	cargo build -p $(CRATE) --release --target aarch64-unknown-linux-gnu
	cp ../../target/aarch64-unknown-linux-gnu/release/$(CRATE) ./dist/$(CRATE)-arm

build-x86_64:
	mkdir -p dist
	cargo build -p $(CRATE) --release --target x86_64-unknown-linux-gnu
	cp ../../target/x86_64-unknown-linux-gnu/release/$(CRATE) ./dist/$(CRATE)-x86_64

# --- Sign ---

.PHONY: sign sign-arm sign-x86_64

sign: sign-arm sign-x86_64

sign-arm: dist/$(CRATE)-arm
	sha256sum dist/$(CRATE)-arm | cut -d' ' -f1 > dist/$(CRATE)-arm.sha256
	# Signature: gcloud secrets versions access latest --secret=COGNITUM_OWNER_SIGNING_KEY \
	#   | openssl pkeyutl -sign -inkey /dev/stdin -rawin -in dist/$(CRATE)-arm.sha256 \
	#   | base64 -w0 > dist/$(CRATE)-arm.sig
	@echo "TODO: wire Ed25519 sign step once COGNITUM_OWNER_SIGNING_KEY is provisioned to CI."

sign-x86_64: dist/$(CRATE)-x86_64
	sha256sum dist/$(CRATE)-x86_64 | cut -d' ' -f1 > dist/$(CRATE)-x86_64.sha256
	@echo "TODO: wire Ed25519 sign step once COGNITUM_OWNER_SIGNING_KEY is provisioned to CI."

# --- Upload to GCS ---

.PHONY: upload upload-arm upload-x86_64

upload: upload-arm upload-x86_64

upload-arm: dist/$(CRATE)-arm
	gsutil cp dist/$(CRATE)-arm $(GCS_BUCKET)/arm/$(CRATE)-arm

upload-x86_64: dist/$(CRATE)-x86_64
	gsutil cp dist/$(CRATE)-x86_64 $(GCS_BUCKET)/x86_64/$(CRATE)-x86_64

# --- Manifest ---

.PHONY: manifest

manifest:
	@cargo run -p $(CRATE) --release -- --print-manifest

# --- Convenience ---

.PHONY: release verify clean

release: build sign upload manifest
	@echo "Release pipeline complete for $(CRATE) v$(VERSION)"

verify:
	@for arch in $(ARCHES); do \
		f=dist/$(CRATE)-$$arch; \
		if [ ! -f $$f ]; then echo "  MISSING $$f"; continue; fi; \
		actual=$$(sha256sum $$f | cut -d' ' -f1); \
		expected=$$(cat $$f.sha256 2>/dev/null); \
		if [ "$$actual" = "$$expected" ]; then echo "  OK     $$f ($$actual)"; \
		else echo "  FAIL   $$f (expected $$expected, got $$actual)"; fi; \
	done

clean:
	rm -rf dist/$(CRATE)-*
