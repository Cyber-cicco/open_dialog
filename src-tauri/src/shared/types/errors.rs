use std::collections::HashMap;

#[derive(Debug)]
pub struct ValdidationError {
    err_map: HashMap<&'static str, &'static str>,
}

impl ValdidationError {
    pub fn new(err_map: HashMap<&'static str, &'static str>) -> Self {
        ValdidationError { err_map }
    }
}

impl std::fmt::Display for ValdidationError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let mut result = String::from("Data validation failed: \n");
        for (k, v) in self.err_map.iter() {
            let line = format!("{k} : {v}\n");
            result.push_str(&line);
        }
        write!(f, "Data validation failed : {}", result)
    }
}

impl std::error::Error for ValdidationError {}
