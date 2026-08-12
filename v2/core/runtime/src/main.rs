use baluarte_runtime::RuntimeInfo;

fn main() {
    let info = RuntimeInfo::new().ready();
    println!("baluarte-runtime protocol={} state={:?}", info.protocol_version, info.state);
}
