//! `ruview/<node_id>/bfld/availability` topic helpers. ADR-122 §2.2.
//!
//! HA expects each device to publish an availability topic so the UI can grey
//! out entities when the device is offline. Convention:
//!
//! - Publish `"online"` with `retain = true` immediately after broker CONNECT.
//! - Configure the MQTT client's Last Will and Testament (LWT) to publish
//!   `"offline"` (also retained) so the broker auto-marks the device offline
//!   when the TCP session drops without a clean DISCONNECT.
//!
//! HA discovery payloads (iter 26) reference this same topic via the
//! `availability_topic` field so every BFLD entity inherits the marker.

#![cfg(feature = "std")]

use crate::mqtt_topics::{Publish, TopicMessage};

/// Payload string published when the node is healthy.
pub const PAYLOAD_AVAILABLE: &str = "online";

/// Payload string published when the node has disconnected.
pub const PAYLOAD_NOT_AVAILABLE: &str = "offline";

/// Build the canonical `ruview/<node_id>/bfld/availability` topic string.
#[must_use]
pub fn availability_topic(node_id: &str) -> String {
    let mut s = String::with_capacity(7 + node_id.len() + 19);
    s.push_str("ruview/");
    s.push_str(node_id);
    s.push_str("/bfld/availability");
    s
}

/// Build the `(topic, "online")` pair to publish on broker connect.
#[must_use]
pub fn online_message(node_id: &str) -> TopicMessage {
    TopicMessage {
        topic: availability_topic(node_id),
        payload: PAYLOAD_AVAILABLE.to_string(),
    }
}

/// Build the `(topic, "offline")` pair — usually configured as the broker LWT
/// rather than published explicitly, but provided here for explicit-shutdown
/// scenarios (graceful stop, planned maintenance) where the operator wants
/// HA to update immediately rather than waiting for the LWT keep-alive timeout.
#[must_use]
pub fn offline_message(node_id: &str) -> TopicMessage {
    TopicMessage {
        topic: availability_topic(node_id),
        payload: PAYLOAD_NOT_AVAILABLE.to_string(),
    }
}

/// Bootstrap helper: publish the `"online"` availability marker through
/// `publisher`. Pairs with `publish_discovery` (iter 27) and `publish_event`
/// (iter 22) for the full startup sequence:
///
/// ```ignore
/// publish_availability_online(&mut retained_pub, "seed-01")?; // "online", retained
/// publish_discovery(&mut retained_pub, "seed-01", PrivacyClass::Anonymous)?;
/// // ... then BfldPipelineHandle::spawn(pipeline, state_pub) for the per-frame loop
/// ```
pub fn publish_availability_online<P: Publish>(
    publisher: &mut P,
    node_id: &str,
) -> Result<(), P::Error> {
    publisher.publish(&online_message(node_id))
}

/// Bootstrap helper: publish the `"offline"` availability marker through
/// `publisher`. Use during a graceful shutdown so HA reflects the state
/// immediately instead of waiting for the broker LWT timeout.
pub fn publish_availability_offline<P: Publish>(
    publisher: &mut P,
    node_id: &str,
) -> Result<(), P::Error> {
    publisher.publish(&offline_message(node_id))
}
