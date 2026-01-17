use std::{path::PathBuf, rc::Rc};

use anyhow::Result;

use crate::shared::config::ODConfigLocal;

struct GitImpl {
    root_dir: Option<PathBuf>,
}

impl GitImpl {
    pub fn new() -> Self {
        return GitImpl { root_dir: None };
    }

    pub fn set_path(path:PathBuf) {

    }

    pub fn init(path: &str) -> Result<()> {
        unimplemented!("todo")
    }

    pub fn commit() -> Result<()> {
        unimplemented!("todo")
    }
}

pub trait Git {
    fn new() -> Self;
    fn init() -> Result<()>;
}
