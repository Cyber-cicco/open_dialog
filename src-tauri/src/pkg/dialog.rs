#[derive(Debug)]
pub struct DialogProvider {
    name: String,
}

impl DialogProvider {
    pub fn new(name: String) -> Self {
        Self { name }
    }

    pub fn create_dialog(prout: &str) -> String {
        return String::from(format!("le caca : {}", prout));
    }
}
